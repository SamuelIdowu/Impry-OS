import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  arePriceBlockersEnabled,
  getWorkspacePlan,
  canCreateClient,
  canCreateProject,
  canCreateInvoice,
  canUseCustomBranding,
  canInviteTeamMember,
  canExportCsv,
  canAccessReports,
} from '@/lib/payments/guards';

// Mock drizzle db queries with fluent chain
vi.mock('@/server/db', () => {
  const query: any = {};
  query.from = vi.fn(() => query);
  query.where = vi.fn(() => query);
  query.limit = vi.fn(() => Promise.resolve([]));
  query.then = (resolve: any) => Promise.resolve([]).then(resolve);

  return {
    db: {
      select: vi.fn(() => query),
    },
  };
});

import { db } from '@/server/db';

describe('Payment & Feature Blockers (guards.ts)', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.ENABLE_PRICE_BLOCKERS;
    delete process.env.FEATURE_BLOCKERS_ENABLED;
    delete process.env.DISABLE_PRICE_BLOCKERS;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('arePriceBlockersEnabled', () => {
    it('returns false by default (beta testing mode)', () => {
      expect(arePriceBlockersEnabled()).toBe(false);
    });

    it('returns true when ENABLE_PRICE_BLOCKERS is "true"', () => {
      process.env.ENABLE_PRICE_BLOCKERS = 'true';
      expect(arePriceBlockersEnabled()).toBe(true);
    });

    it('returns true when FEATURE_BLOCKERS_ENABLED is "true"', () => {
      process.env.FEATURE_BLOCKERS_ENABLED = 'true';
      expect(arePriceBlockersEnabled()).toBe(true);
    });

    it('returns true when DISABLE_PRICE_BLOCKERS is "false"', () => {
      process.env.DISABLE_PRICE_BLOCKERS = 'false';
      expect(arePriceBlockersEnabled()).toBe(true);
    });
  });

  describe('Beta Mode (Blockers Disabled)', () => {
    beforeEach(() => {
      process.env.ENABLE_PRICE_BLOCKERS = 'false';
    });

    it('grants studio tier and unlimited access for getWorkspacePlan', async () => {
      const plan = await getWorkspacePlan('ws-123');
      expect(plan).toBe('studio');
    });

    it('allows client creation with unlimited quota', async () => {
      const result = await canCreateClient('ws-123');
      expect(result.allowed).toBe(true);
      expect(result.maxAllowed).toBe('unlimited');
      expect(result.planTier).toBe('studio');
    });

    it('allows project creation with unlimited quota', async () => {
      const result = await canCreateProject('ws-123');
      expect(result.allowed).toBe(true);
      expect(result.maxAllowed).toBe('unlimited');
    });

    it('allows invoice creation with unlimited quota', async () => {
      const result = await canCreateInvoice('ws-123');
      expect(result.allowed).toBe(true);
      expect(result.maxAllowed).toBe('unlimited');
    });

    it('allows custom branding', async () => {
      const result = await canUseCustomBranding('ws-123');
      expect(result.allowed).toBe(true);
    });

    it('allows team member invitations', async () => {
      const result = await canInviteTeamMember('ws-123');
      expect(result.allowed).toBe(true);
      expect(result.maxAllowed).toBe('unlimited');
    });

    it('allows CSV export', async () => {
      const result = await canExportCsv('ws-123');
      expect(result.allowed).toBe(true);
    });

    it('allows reports access', async () => {
      const result = await canAccessReports('ws-123');
      expect(result.allowed).toBe(true);
    });
  });

  describe('Production Mode (Blockers Enabled)', () => {
    beforeEach(() => {
      process.env.ENABLE_PRICE_BLOCKERS = 'true';
    });

    it('enforces free plan limits when workspace has free tier', async () => {
      // Mock db select for getWorkspacePlan returning 'free'
      (db.select as any).mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            limit: vi.fn().mockResolvedValueOnce([{ planTier: 'free' }]),
          }),
        }),
      });

      const plan = await getWorkspacePlan('ws-free');
      expect(plan).toBe('free');
    });

    it('denies client creation when limit is reached on free tier', async () => {
      // 1. getWorkspacePlan mock
      (db.select as any).mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            limit: vi.fn().mockResolvedValueOnce([{ planTier: 'free' }]),
          }),
        }),
      });

      // 2. count clients query mock (returns 3, matching max of 3)
      (db.select as any).mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockResolvedValueOnce([{ value: 3 }]),
        }),
      });

      const result = await canCreateClient('ws-free');
      expect(result.allowed).toBe(false);
      expect(result.currentCount).toBe(3);
      expect(result.maxAllowed).toBe(3);
    });

    it('allows client creation when below limit on free tier', async () => {
      // 1. getWorkspacePlan mock
      (db.select as any).mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            limit: vi.fn().mockResolvedValueOnce([{ planTier: 'free' }]),
          }),
        }),
      });

      // 2. count clients query mock (returns 2, below max of 3)
      (db.select as any).mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockResolvedValueOnce([{ value: 2 }]),
        }),
      });

      const result = await canCreateClient('ws-free');
      expect(result.allowed).toBe(true);
      expect(result.currentCount).toBe(2);
      expect(result.maxAllowed).toBe(3);
    });

    it('disallows custom branding on free tier', async () => {
      (db.select as any).mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            limit: vi.fn().mockResolvedValueOnce([{ planTier: 'free' }]),
          }),
        }),
      });

      const result = await canUseCustomBranding('ws-free');
      expect(result.allowed).toBe(false);
    });

    it('allows custom branding on pro tier', async () => {
      (db.select as any).mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            limit: vi.fn().mockResolvedValueOnce([{ planTier: 'pro' }]),
          }),
        }),
      });

      const result = await canUseCustomBranding('ws-pro');
      expect(result.allowed).toBe(true);
    });
  });
});
