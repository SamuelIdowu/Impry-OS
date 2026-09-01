import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MockPaymentProvider } from '@/lib/payments/providers/mock';
import { cancelWorkspaceSubscription } from '@/server/actions/billing';
import { getUser } from '@/lib/auth';
import { verifyWorkspaceAccess } from '@/server/actions/workspaces';
import { getPaymentProvider } from '@/lib/payments';
import { db } from '@/server/db';

vi.mock('@/lib/auth', () => ({
  getUser: vi.fn(),
}));

vi.mock('@/server/actions/workspaces', () => ({
  verifyWorkspaceAccess: vi.fn(),
}));

vi.mock('@/lib/payments', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    getPaymentProvider: vi.fn(),
  };
});

vi.mock('@/server/db', () => {
  const query: any = {};
  query.from = vi.fn(() => query);
  query.where = vi.fn(() => query);
  query.limit = vi.fn(() => Promise.resolve([]));
  query.set = vi.fn(() => query);
  query.values = vi.fn(() => query);
  query.then = (resolve: any) => Promise.resolve([]).then(resolve);

  return {
    db: {
      select: vi.fn(() => query),
      insert: vi.fn(() => query),
      update: vi.fn(() => query),
    },
  };
});

describe('Subscription Cancellation Logic', () => {
  describe('MockPaymentProvider.cancelSubscription', () => {
    const mockProvider = new MockPaymentProvider();

    it('cancels scheduled for next billing period by default', async () => {
      const result = await mockProvider.cancelSubscription({
        subscriptionId: 'sub_test_123',
        immediately: false,
      });

      expect(result.success).toBe(true);
      expect(result.effectiveFrom).toBe('next_billing_period');
      expect(result.scheduledChangeAt).toBeInstanceOf(Date);
      expect(result.message).toContain('billing cycle');
    });

    it('cancels immediately when immediately is true', async () => {
      const result = await mockProvider.cancelSubscription({
        subscriptionId: 'sub_test_123',
        immediately: true,
      });

      expect(result.success).toBe(true);
      expect(result.effectiveFrom).toBe('immediately');
      expect(result.scheduledChangeAt).toBeNull();
      expect(result.message).toContain('immediately');
    });
  });

  describe('cancelWorkspaceSubscription Server Action', () => {
    const mockUser = { id: 'user_1', email: 'user@example.com', name: 'Test User' };
    const mockProvider = {
      name: 'mock',
      cancelSubscription: vi.fn().mockResolvedValue({
        success: true,
        effectiveFrom: 'next_billing_period',
        scheduledChangeAt: new Date('2026-10-01'),
        message: 'Subscription canceled at period end.',
      }),
    };

    beforeEach(() => {
      vi.clearAllMocks();
      (getUser as any).mockResolvedValue(mockUser);
      (verifyWorkspaceAccess as any).mockResolvedValue(true);
      (getPaymentProvider as any).mockReturnValue(mockProvider);
    });

    it('throws error if user is not authenticated', async () => {
      (getUser as any).mockResolvedValue(null);

      await expect(cancelWorkspaceSubscription('ws_1')).rejects.toThrow('Unauthorized');
    });

    it('throws error if user lacks access to workspace', async () => {
      (verifyWorkspaceAccess as any).mockResolvedValue(false);

      await expect(cancelWorkspaceSubscription('ws_1')).rejects.toThrow('Access denied');
    });

    it('throws error if workspace is on Free tier', async () => {
      (db.select as any).mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            limit: vi.fn().mockResolvedValueOnce([
              {
                id: 'ws_1',
                planTier: 'free',
                subscriptionStatus: 'active',
                paymentProvider: 'mock',
                subscriptionId: null,
              },
            ]),
          }),
        }),
      });

      await expect(cancelWorkspaceSubscription('ws_1')).rejects.toThrow(
        'Cannot cancel a subscription on the Free tier.'
      );
    });

    it('schedules cancellation at period end for Pro workspace', async () => {
      const periodEndDate = new Date('2026-10-01');
      (db.select as any).mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            limit: vi.fn().mockResolvedValueOnce([
              {
                id: 'ws_1',
                planTier: 'pro',
                subscriptionStatus: 'active',
                paymentProvider: 'mock',
                subscriptionId: 'sub_pro_123',
                customerId: 'cus_123',
                currentPeriodEnd: periodEndDate,
              },
            ]),
          }),
        }),
      });

      const result = await cancelWorkspaceSubscription('ws_1', false);

      expect(result.success).toBe(true);
      expect(result.effectiveFrom).toBe('next_billing_period');
      expect(mockProvider.cancelSubscription).toHaveBeenCalledWith({
        subscriptionId: 'sub_pro_123',
        workspaceId: 'ws_1',
        customerId: 'cus_123',
        immediately: false,
      });

      expect(db.update).toHaveBeenCalled();
    });

    it('immediately downgrades to Free when immediately is true', async () => {
      mockProvider.cancelSubscription.mockResolvedValueOnce({
        success: true,
        effectiveFrom: 'immediately',
        scheduledChangeAt: null,
        message: 'Subscription canceled immediately.',
      });

      (db.select as any).mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            limit: vi.fn().mockResolvedValueOnce([
              {
                id: 'ws_1',
                planTier: 'studio',
                subscriptionStatus: 'active',
                paymentProvider: 'mock',
                subscriptionId: 'sub_studio_123',
                customerId: 'cus_123',
                currentPeriodEnd: new Date('2026-10-01'),
              },
            ]),
          }),
        }),
      });

      const result = await cancelWorkspaceSubscription('ws_1', true);

      expect(result.success).toBe(true);
      expect(result.effectiveFrom).toBe('immediately');
      expect(mockProvider.cancelSubscription).toHaveBeenCalledWith({
        subscriptionId: 'sub_studio_123',
        workspaceId: 'ws_1',
        customerId: 'cus_123',
        immediately: true,
      });

      expect(db.update).toHaveBeenCalled();
    });
  });
});
