import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/webhooks/billing/route';
import { NextRequest } from 'next/server';

vi.mock('@/lib/payments', () => ({
  getPaymentProvider: vi.fn(),
}));

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

import { getPaymentProvider } from '@/lib/payments';
import { db } from '@/server/db';

describe('Billing Webhooks API (/api/webhooks/billing)', () => {
  const mockProvider = {
    name: 'dodo',
    parseWebhook: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (getPaymentProvider as any).mockReturnValue(mockProvider);
  });

  function createMockRequest(body: any, headers: Record<string, string> = {}) {
    const req = new NextRequest(new URL('http://localhost:3000/api/webhooks/billing'), {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'content-type': 'application/json',
        ...headers,
      },
    });
    return req;
  }

  it('rejects requests with invalid signature and returns 400', async () => {
    mockProvider.parseWebhook.mockRejectedValueOnce(new Error('Invalid signature'));

    const req = createMockRequest({ type: 'payment.succeeded' });
    const res = await POST(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Webhook processing error');
  });

  it('handles duplicate events idempotently without double-processing', async () => {
    mockProvider.parseWebhook.mockResolvedValueOnce({
      provider: 'dodo',
      eventId: 'evt_duplicate_123',
      eventType: 'payment.succeeded',
      rawPayload: {},
    });

    // Mock existing event found in database
    (db.select as any).mockReturnValueOnce({
      from: vi.fn().mockReturnValueOnce({
        where: vi.fn().mockReturnValueOnce({
          limit: vi.fn().mockResolvedValueOnce([{ id: 'existing-record-1' }]),
        }),
      }),
    });

    const req = createMockRequest({ type: 'payment.succeeded' });
    const res = await POST(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.message).toBe('Event already processed');
    // Ensure no new workspace update was performed
    expect(db.update).not.toHaveBeenCalled();
  });

  it('processes subscription.created event and upgrades workspace plan to Pro', async () => {
    const targetWsId = 'ws-test-456';
    mockProvider.parseWebhook.mockResolvedValueOnce({
      provider: 'dodo',
      eventId: 'evt_new_sub_100',
      eventType: 'subscription.created',
      workspaceId: targetWsId,
      planTier: 'pro',
      status: 'active',
      subscriptionId: 'sub_xyz123',
      customerId: 'cus_abc999',
      currentPeriodEnd: new Date('2027-01-01'),
      rawPayload: {},
    });

    // Event not found in DB
    (db.select as any).mockReturnValueOnce({
      from: vi.fn().mockReturnValueOnce({
        where: vi.fn().mockReturnValueOnce({
          limit: vi.fn().mockResolvedValueOnce([]),
        }),
      }),
    });

    const req = createMockRequest({ type: 'subscription.created' });
    const res = await POST(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.received).toBe(true);
    expect(json.eventId).toBe('evt_new_sub_100');

    // Verify DB insert for webhook event record
    expect(db.insert).toHaveBeenCalled();
    // Verify workspace plan update
    expect(db.update).toHaveBeenCalled();
  });

  it('processes subscription.canceled event and downgrades workspace to Free tier', async () => {
    const targetWsId = 'ws-test-456';
    mockProvider.parseWebhook.mockResolvedValueOnce({
      provider: 'dodo',
      eventId: 'evt_cancel_999',
      eventType: 'subscription.canceled',
      workspaceId: targetWsId,
      status: 'canceled',
      rawPayload: {},
    });

    // Event not found in DB
    (db.select as any).mockReturnValueOnce({
      from: vi.fn().mockReturnValueOnce({
        where: vi.fn().mockReturnValueOnce({
          limit: vi.fn().mockResolvedValueOnce([]),
        }),
      }),
    });

    const req = createMockRequest({ type: 'subscription.canceled' });
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(db.update).toHaveBeenCalled();
  });
});
