import {
  PaymentProvider,
  CreateCheckoutParams,
  CheckoutResult,
  PortalParams,
  NormalizedWebhookEvent,
  PlanTier,
  SubscriptionStatus,
} from '../types';
import { PLANS } from '../config';

export class PolarPaymentsProvider implements PaymentProvider {
  readonly name = 'polar';

  private getBaseUrl(): string {
    return process.env.POLAR_SERVER === 'sandbox'
      ? 'https://sandbox-api.polar.sh/v1'
      : 'https://api.polar.sh/v1';
  }

  async createCheckout(params: CreateCheckoutParams): Promise<CheckoutResult> {
    const accessToken = process.env.POLAR_ACCESS_TOKEN;
    if (!accessToken) {
      throw new Error('POLAR_ACCESS_TOKEN is not configured.');
    }

    const plan = PLANS[params.planTier];
    const productId =
      params.billingCycle === 'yearly'
        ? process.env[`POLAR_${params.planTier.toUpperCase()}_YEARLY_PRODUCT_ID`] || plan.productIds?.polar?.yearly
        : process.env[`POLAR_${params.planTier.toUpperCase()}_MONTHLY_PRODUCT_ID`] || plan.productIds?.polar?.monthly;

    if (!productId) {
      throw new Error(`Polar Product ID not configured for plan ${params.planTier}`);
    }

    const baseUrl = this.getBaseUrl();
    const response = await fetch(`${baseUrl}/checkouts/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        product_id: productId,
        customer_email: params.userEmail,
        customer_name: params.userName,
        success_url: params.successUrl,
        metadata: {
          workspaceId: params.workspaceId,
          userId: params.userId,
          planTier: params.planTier,
          billingCycle: params.billingCycle,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Polar checkout creation failed: ${errText}`);
    }

    const data = await response.json();
    return {
      checkoutUrl: data.url,
      sessionId: data.id,
    };
  }

  async getPortalUrl(params: PortalParams): Promise<string | null> {
    const accessToken = process.env.POLAR_ACCESS_TOKEN;
    if (!accessToken) return null;

    try {
      const baseUrl = this.getBaseUrl();
      const response = await fetch(`${baseUrl}/customer-portal/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          customer_id: params.customerId,
          return_url: params.returnUrl,
        }),
      });

      if (!response.ok) return null;
      const data = await response.json();
      return data.url || null;
    } catch {
      return null;
    }
  }

  async parseWebhook(
    rawBody: string,
    _headers: Headers | Record<string, string | string[] | undefined>
  ): Promise<NormalizedWebhookEvent> {
    const payload = JSON.parse(rawBody);
    const eventType = payload.type || 'unknown';
    const data = payload.data || payload;

    let normalizedType: NormalizedWebhookEvent['eventType'] = 'unknown';
    let status: SubscriptionStatus = 'active';

    if (eventType === 'subscription.created') {
      normalizedType = 'subscription.created';
      status = 'active';
    } else if (eventType === 'subscription.updated') {
      normalizedType = 'subscription.updated';
      status = data.status === 'active' ? 'active' : 'past_due';
    } else if (eventType === 'subscription.canceled') {
      normalizedType = 'subscription.canceled';
      status = 'canceled';
    } else if (eventType === 'order.created') {
      normalizedType = 'payment.succeeded';
    }

    const metadata = data.metadata || data.custom_field_data || {};
    const workspaceId = metadata.workspaceId;
    const userId = metadata.userId;
    const customerId = data.customer_id || data.customer?.id;
    const subscriptionId = data.id;

    return {
      provider: this.name,
      eventId: payload.id || `polar_${Date.now()}`,
      eventType: normalizedType,
      workspaceId,
      userId,
      customerId,
      subscriptionId,
      planTier: metadata.planTier as PlanTier,
      status,
      currentPeriodEnd: data.current_period_end ? new Date(data.current_period_end) : undefined,
      rawPayload: payload,
    };
  }
}
