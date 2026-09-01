import * as crypto from 'crypto';
import {
  PaymentProvider,
  CreateCheckoutParams,
  CheckoutResult,
  PortalParams,
  CancelSubscriptionParams,
  CancelSubscriptionResult,
  NormalizedWebhookEvent,
  PlanTier,
  SubscriptionStatus,
} from '../types';
import { PLANS } from '../config';

export class PaddlePaymentsProvider implements PaymentProvider {
  readonly name = 'paddle';

  private getApiKey(): string {
    const apiKey = process.env.PADDLE_API_KEY;
    if (!apiKey) {
      throw new Error('PADDLE_API_KEY is not configured in environment variables.');
    }
    return apiKey;
  }

  private getBaseUrl(): string {
    return process.env.PADDLE_ENVIRONMENT === 'sandbox' || process.env.PADDLE_SERVER === 'sandbox'
      ? 'https://sandbox-api.paddle.com'
      : 'https://api.paddle.com';
  }

  async createCheckout(params: CreateCheckoutParams): Promise<CheckoutResult> {
    const apiKey = this.getApiKey();
    const plan = PLANS[params.planTier];
    if (!plan) {
      throw new Error(`Invalid plan tier: ${params.planTier}`);
    }

    const priceId =
      params.billingCycle === 'yearly'
        ? process.env[`PADDLE_${params.planTier.toUpperCase()}_YEARLY_PRICE_ID`] || plan.productIds?.paddle?.yearly
        : process.env[`PADDLE_${params.planTier.toUpperCase()}_MONTHLY_PRICE_ID`] || plan.productIds?.paddle?.monthly;

    if (!priceId) {
      throw new Error(`Paddle Price ID not configured for plan ${params.planTier} (${params.billingCycle})`);
    }

    const baseUrl = this.getBaseUrl();
    const body = {
      items: [
        {
          price_id: priceId,
          quantity: 1,
        },
      ],
      customer_email: params.userEmail,
      custom_data: {
        workspaceId: params.workspaceId,
        userId: params.userId,
        planTier: params.planTier,
        billingCycle: params.billingCycle,
      },
      checkout: {
        success_url: params.successUrl,
      },
      collection_mode: 'automatic',
    };

    const response = await fetch(`${baseUrl}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Paddle transaction creation failed: ${errText}`);
    }

    const resJson = await response.json();
    const txnData = resJson.data || resJson;

    let checkoutUrl = txnData.checkout?.url;
    if (!checkoutUrl) {
      throw new Error(`Paddle transaction created (${txnData.id}) but no hosted checkout URL returned.`);
    }

    // Prevent ERR_SSL_PROTOCOL_ERROR on local development
    if (checkoutUrl.startsWith('https://localhost:') || checkoutUrl.startsWith('https://127.0.0.1:')) {
      checkoutUrl = checkoutUrl.replace('https://', 'http://');
    }

    return {
      checkoutUrl,
      sessionId: txnData.id,
    };
  }

  async getPortalUrl(params: PortalParams): Promise<string | null> {
    if (!params.customerId) return null;

    try {
      const { getPaddleInstance } = await import('@/lib/paddle/get-paddle-instance');
      const paddle = getPaddleInstance();
      const portalSession = await paddle.customerPortalSessions.create(params.customerId, []);
      return portalSession.urls?.general?.overview || null;
    } catch (err) {
      console.error('Paddle getPortalUrl error:', err);
      return null;
    }
  }

  async cancelSubscription(params: CancelSubscriptionParams): Promise<CancelSubscriptionResult> {
    if (!params.subscriptionId) {
      throw new Error('Subscription ID is required to cancel a Paddle subscription.');
    }

    const effectiveFrom = params.immediately ? 'immediately' : 'next_billing_period';

    try {
      const { getPaddleInstance } = await import('@/lib/paddle/get-paddle-instance');
      const paddle = getPaddleInstance();
      const updatedSub = await paddle.subscriptions.cancel(params.subscriptionId, {
        effectiveFrom,
      });

      const scheduledChangeAt = updatedSub.scheduledChange?.effectiveAt
        ? new Date(updatedSub.scheduledChange.effectiveAt)
        : updatedSub.currentBillingPeriod?.endsAt
        ? new Date(updatedSub.currentBillingPeriod.endsAt)
        : null;

      return {
        success: true,
        effectiveFrom,
        scheduledChangeAt,
        message: params.immediately
          ? 'Subscription has been canceled immediately.'
          : `Subscription will remain active until the end of your billing cycle${scheduledChangeAt ? ` (${scheduledChangeAt.toLocaleDateString()})` : ''}.`,
      };
    } catch (err: any) {
      console.error('Paddle cancelSubscription error:', err);
      throw new Error(err.message || 'Failed to cancel Paddle subscription.');
    }
  }

  async parseWebhook(
    rawBody: string,
    headers: Headers | Record<string, string | string[] | undefined>
  ): Promise<NormalizedWebhookEvent> {
    const secretKey = process.env.PADDLE_WEBHOOK_SECRET;
    const headerMap: Record<string, string | string[] | undefined> =
      typeof (headers as any)?.entries === 'function'
        ? Object.fromEntries((headers as any).entries())
        : (headers as Record<string, string | string[] | undefined>);

    const signatureHeader = (headerMap['paddle-signature'] || headerMap['Paddle-Signature']) as string | undefined;

    if (secretKey && signatureHeader) {
      const parts = signatureHeader.split(';');
      let ts = '';
      let h1 = '';

      for (const part of parts) {
        const [k, v] = part.split('=');
        if (k === 'ts') ts = v;
        if (k === 'h1') h1 = v;
      }

      if (ts && h1) {
        const signedPayload = `${ts}:${rawBody}`;
        const computedHash = crypto.createHmac('sha256', secretKey).update(signedPayload).digest('hex');

        if (computedHash !== h1) {
          throw new Error('Invalid Paddle webhook signature.');
        }
      }
    }

    const payload = JSON.parse(rawBody);
    const eventType = payload.event_type || payload.type || 'unknown';
    const data = payload.data || {};

    let normalizedType: NormalizedWebhookEvent['eventType'] = 'unknown';
    let status: SubscriptionStatus = 'active';

    if (eventType === 'subscription.created' || eventType === 'subscription.activated') {
      normalizedType = 'subscription.created';
      status = 'active';
    } else if (eventType === 'subscription.updated') {
      normalizedType = 'subscription.updated';
      status = data.status === 'active' ? 'active' : data.status === 'past_due' ? 'past_due' : 'active';
    } else if (eventType === 'subscription.canceled' || eventType === 'subscription.past_due') {
      normalizedType = 'subscription.canceled';
      status = eventType === 'subscription.past_due' ? 'past_due' : 'canceled';
    } else if (eventType === 'transaction.completed') {
      normalizedType = 'payment.succeeded';
    }

    const customData = data.custom_data || {};
    const workspaceId = customData.workspaceId;
    const userId = customData.userId;
    const customerId = data.customer_id || data.customer?.id;
    const subscriptionId = data.id || data.subscription_id;

    return {
      provider: this.name,
      eventId: payload.event_id || payload.id || `pad_${Date.now()}`,
      eventType: normalizedType,
      workspaceId,
      userId,
      customerId,
      subscriptionId,
      planTier: (customData.planTier as PlanTier) || 'pro',
      status,
      currentPeriodEnd: data.current_billing_period?.ends_at ? new Date(data.current_billing_period.ends_at) : undefined,
      rawPayload: payload,
    };
  }
}
