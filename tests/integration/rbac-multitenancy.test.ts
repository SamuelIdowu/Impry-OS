import { describe, it, expect, vi, beforeEach } from 'vitest';
import { verifyWorkspaceAccess, getUserWorkspaces } from '@/server/actions/workspaces';

vi.mock('@/server/db', () => {
  const query: any = {};
  query.from = vi.fn(() => query);
  query.innerJoin = vi.fn(() => query);
  query.leftJoin = vi.fn(() => query);
  query.where = vi.fn(() => query);
  query.limit = vi.fn(() => Promise.resolve([]));
  query.returning = vi.fn(() => Promise.resolve([]));
  query.values = vi.fn(() => query);
  query.then = (resolve: any) => Promise.resolve([]).then(resolve);

  return {
    db: {
      select: vi.fn(() => query),
      insert: vi.fn(() => query),
      update: vi.fn(() => query),
      delete: vi.fn(() => query),
    },
  };
});

vi.mock('@/lib/auth', () => ({
  getUser: vi.fn(),
}));

import { db } from '@/server/db';
import { getUser } from '@/lib/auth';

describe('Multi-Tenancy & RBAC Verification (workspaces.ts)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('verifyWorkspaceAccess', () => {
    const validUUID = '123e4567-e89b-12d3-a456-426614174000';
    const invalidUUID = 'invalid-not-uuid';

    it('returns false immediately when user is not logged in', async () => {
      (getUser as any).mockResolvedValueOnce(null);
      const hasAccess = await verifyWorkspaceAccess(validUUID);
      expect(hasAccess).toBe(false);
    });

    it('returns false when workspaceId is not a valid UUID format (injection prevention)', async () => {
      const mockUser = { id: 'u-1', email: 'user@test.com' };
      (getUser as any).mockResolvedValueOnce(mockUser);

      const hasAccess = await verifyWorkspaceAccess(invalidUUID, mockUser);
      expect(hasAccess).toBe(false);
    });

    it('returns false when user is not a member of the requested workspace (tenant isolation)', async () => {
      const mockUser = { id: 'u-intruder', email: 'intruder@other.com' };
      (getUser as any).mockResolvedValueOnce(mockUser);

      // Mock database returning 0 membership records
      (db.select as any).mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            limit: vi.fn().mockResolvedValueOnce([]),
          }),
        }),
      });

      const hasAccess = await verifyWorkspaceAccess(validUUID, mockUser);
      expect(hasAccess).toBe(false);
    });

    it('returns true when user is confirmed member of the workspace', async () => {
      const mockUser = { id: 'u-legit', email: 'member@company.com' };
      (getUser as any).mockResolvedValueOnce(mockUser);

      // Mock database returning 1 valid membership record
      (db.select as any).mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            limit: vi.fn().mockResolvedValueOnce([{ workspaceId: validUUID, userId: 'u-legit', role: 'owner' }]),
          }),
        }),
      });

      const hasAccess = await verifyWorkspaceAccess(validUUID, mockUser);
      expect(hasAccess).toBe(true);
    });
  });

  describe('getUserWorkspaces', () => {
    it('returns empty array when unauthenticated', async () => {
      (getUser as any).mockResolvedValueOnce(null);
      const result = await getUserWorkspaces();
      expect(result).toEqual([]);
    });

    it('returns only the workspaces where the user is an active member', async () => {
      const mockUser = { id: 'u-1', email: 'user@test.com' };
      (getUser as any).mockResolvedValueOnce(mockUser);

      const mockWorkspaces = [
        { id: 'ws-1', name: 'Design Studio', role: 'owner' },
        { id: 'ws-2', name: 'Client Portal', role: 'member' },
      ];

      (db.select as any).mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          innerJoin: vi.fn().mockReturnValueOnce({
            where: vi.fn().mockResolvedValueOnce(mockWorkspaces),
          }),
        }),
      });

      const result = await getUserWorkspaces();
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Design Studio');
    });
  });
});
