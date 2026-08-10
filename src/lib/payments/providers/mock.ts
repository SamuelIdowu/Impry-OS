import {
  PaymentProvider,
  CreateCheckoutParams,
  CheckoutResult,
  PortalParams,
  NormalizedWebhookEvent,
} from '../types';

export class MockPaymentProvider implements PaymentProvider {
  readonly name = 'mock';

  async createCheckout(params: CreateCheckoutParams): Promise<CheckoutResult> {
    const mockSessionId = `mock_sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const checkoutUrl = `${params.successUrl}${
      params.successUrl.includes('?') ? '&' : '?'
    }mock_billing=success&tier=${params.planTier}&cycle=${params.billingCycle}&session_id=${mockSessionId}&workspaceId=${params.workspaceId}`;

    return {
      checkoutUrl,
      sessionId: mockSessionId,
    };
  }

  async getPortalUrl(params: PortalParams): Promise<string | null> {
    return `${params.returnUrl}${
      params.returnUrl.includes('?') ? '&' : '?'
    }mock_portal=active&customer_id=${params.customerId}`;
  }

  async parseWebhook(
    rawBody: string,
    _headers: Headers | Record<string, string | string[] | undefined>
  ): Promise<NormalizedWebhookEvent> {
    const payload = JSON.parse(rawBody || '{}');
    const eventId = payload.eventId || `mock_evt_${Date.now()}`;

    return {
      provider: this.name,
      eventId,
      eventType: payload.eventType || 'subscription.created',
      workspaceId: payload.workspaceId,
      userId: payload.userId,
      customerId: payload.customerId || 'mock_cus_123',
      subscriptionId: payload.subscriptionId || 'mock_sub_123',
      planTier: payload.planTier || 'pro',
      status: payload.status || 'active',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      rawPayload: payload,
    };
  }
}
