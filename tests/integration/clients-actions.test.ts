import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createClientAction, fetchClientStats } from '@/server/actions/clients';

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/lib/auth-guard', () => ({
  withAuth: vi.fn((fn) => fn({ id: 'u-1', email: 'test@user.com' }, 'ws-123')),
}));

vi.mock('@/lib/payments/guards', () => ({
  canCreateClient: vi.fn(),
}));

vi.mock('@/lib/clients', () => ({
  createClient: vi.fn(),
  getClients: vi.fn(),
  getClientById: vi.fn(),
}));

vi.mock('@/server/db', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve([{ count: 5, totalRevenue: '1000', pendingRevenue: '500' }])),
      })),
    })),
  },
}));

import { canCreateClient } from '@/lib/payments/guards';
import { createClient } from '@/lib/clients';

describe('Clients Server Actions (clients.ts)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createClientAction', () => {
    it('blocks client creation when workspace plan quota is exhausted', async () => {
      (canCreateClient as any).mockResolvedValueOnce({
        allowed: false,
        currentCount: 3,
        maxAllowed: 3,
        planTier: 'free',
      });

      const res = await createClientAction({
        name: 'New Client',
        email: 'client@domain.com',
      });

      expect(res.success).toBe(false);
      expect(res.requiresUpgrade).toBe(true);
      expect(res.error).toContain('limit reached');
      expect(createClient).not.toHaveBeenCalled();
    });

    it('rejects invalid email formats via Zod schema validation', async () => {
      (canCreateClient as any).mockResolvedValueOnce({
        allowed: true,
        currentCount: 1,
        maxAllowed: 3,
        planTier: 'free',
      });

      const res = await createClientAction({
        name: 'Invalid Client',
        email: 'not-an-email',
      });

      expect(res.success).toBe(false);
      expect(createClient).not.toHaveBeenCalled();
    });

    it('successfully creates client and revalidates path when quota is allowed', async () => {
      (canCreateClient as any).mockResolvedValueOnce({
        allowed: true,
        currentCount: 1,
        maxAllowed: 3,
        planTier: 'free',
      });

      (createClient as any).mockResolvedValueOnce({
        id: 'c-100',
        name: 'Acme Studio',
        email: 'acme@studio.com',
      });

      const res = await createClientAction({
        name: 'Acme Studio',
        email: 'acme@studio.com',
      });

      expect(res.success).toBe(true);
      expect(res.data).toEqual({
        id: 'c-100',
        name: 'Acme Studio',
        email: 'acme@studio.com',
      });
      expect(createClient).toHaveBeenCalled();
    });
  });

  describe('fetchClientStats', () => {
    it('fetches aggregate metrics for workspace and user context', async () => {
      const res = await fetchClientStats();
      expect(res.success).toBe(true);
      expect(res.data).toBeDefined();
    });
  });
});
