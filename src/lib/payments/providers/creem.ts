import crypto from 'crypto';
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

export class CreemPaymentsProvider implements PaymentProvider {
  readonly name = 'creem';

  private getApiKey(): string {
    const apiKey = process.env.CREEM_API_KEY;
    if (!apiKey) {
      throw new Error('CREEM_API_KEY is not configured in environment variables.');
    }
    return apiKey;
  }

  private getBaseUrl(): string {
    const apiKey = process.env.CREEM_API_KEY || '';
    return apiKey.startsWith('creem_test_') || process.env.CREEM_ENVIRONMENT === 'test'
      ? 'https://test-api.creem.io/v1'
      : 'https://api.creem.io/v1';
  }

  async createCheckout(params: CreateCheckoutParams): Promise<CheckoutResult> {
    const apiKey = this.getApiKey();
    const plan = PLANS[params.planTier];
    if (!plan) {
      throw new Error(`Invalid plan tier: ${params.planTier}`);
    }

    const productId =
      params.billingCycle === 'yearly'
        ? process.env[`CREEM_${params.planTier.toUpperCase()}_YEARLY_PRODUCT_ID`] || plan.productIds?.creem?.yearly
        : process.env[`CREEM_${params.planTier.toUpperCase()}_MONTHLY_PRODUCT_ID`] || plan.productIds?.creem?.monthly;

    if (!productId) {
      throw new Error(`Creem Product ID not configured for plan ${params.planTier}`);
    }

    const baseUrl = this.getBaseUrl();
    const response = await fetch(`${baseUrl}/checkouts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        product_id: productId,
        customer_email: params.userEmail,
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
      throw new Error(`Creem checkout creation failed: ${errText}`);
    }

    const data = await response.json();
    return {
      checkoutUrl: data.checkout_url || data.url,
      sessionId: data.id,
    };
  }

  async getPortalUrl(params: PortalParams): Promise<string | null> {
    const apiKey = process.env.CREEM_API_KEY;
    if (!apiKey) return null;

    try {
      const baseUrl = this.getBaseUrl();
      const response = await fetch(`${baseUrl}/customer-portal/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
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
    headers: Headers | Record<string, string | string[] | undefined>
  ): Promise<NormalizedWebhookEvent> {
    const secretKey = process.env.CREEM_WEBHOOK_SECRET;
    const headerMap = headers instanceof Headers ? Object.fromEntries(headers.entries()) : headers;
    const signature = (headerMap['creem-signature'] || headerMap['x-creem-signature']) as string | undefined;

    if (secretKey && signature) {
      const hash = crypto.createHmac('sha256', secretKey).update(rawBody).digest('hex');
      if (hash !== signature) {
        throw new Error('Invalid Creem webhook signature.');
      }
    }

    const payload = JSON.parse(rawBody);
    const eventType = payload.event || payload.type || 'unknown';
    const data = payload.data || payload;

    let normalizedType: NormalizedWebhookEvent['eventType'] = 'unknown';
    let status: SubscriptionStatus = 'active';

    if (eventType === 'subscription.created' || eventType === 'checkout.completed') {
      normalizedType = 'subscription.created';
      status = 'active';
    } else if (eventType === 'subscription.updated') {
      normalizedType = 'subscription.updated';
      status = data.status === 'active' ? 'active' : 'past_due';
    } else if (eventType === 'subscription.canceled') {
      normalizedType = 'subscription.canceled';
      status = 'canceled';
    } else if (eventType === 'payment.succeeded') {
      normalizedType = 'payment.succeeded';
    }

    const metadata = data.metadata || {};
    const workspaceId = metadata.workspaceId;
    const userId = metadata.userId;
    const customerId = data.customer_id || data.customer?.id;
    const subscriptionId = data.subscription_id || data.id;

    return {
      provider: this.name,
      eventId: payload.id || `creem_${Date.now()}`,
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
