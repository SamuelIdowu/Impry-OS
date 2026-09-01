import DodoPayments from 'dodopayments';
import crypto from 'crypto';
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

export class DodoPaymentsProvider implements PaymentProvider {
  readonly name = 'dodo';
  private client: DodoPayments | null = null;

  constructor() {
    const apiKey = process.env.DODO_PAYMENTS_API_KEY;
    if (apiKey) {
      this.client = new DodoPayments({
        bearerToken: apiKey,
        environment: (process.env.DODO_PAYMENTS_ENVIRONMENT as 'live_mode' | 'test_mode') || 'test_mode',
      });
    }
  }

  private getClient(): DodoPayments {
    if (!this.client) {
      const apiKey = process.env.DODO_PAYMENTS_API_KEY;
      if (!apiKey) {
        throw new Error('DODO_PAYMENTS_API_KEY is not configured in environment variables.');
      }
      this.client = new DodoPayments({
        bearerToken: apiKey,
        environment: (process.env.DODO_PAYMENTS_ENVIRONMENT as 'live_mode' | 'test_mode') || 'test_mode',
      });
    }
    return this.client;
  }

  async createCheckout(params: CreateCheckoutParams): Promise<CheckoutResult> {
    const client = this.getClient();
    const plan = PLANS[params.planTier];
    if (!plan) {
      throw new Error(`Invalid plan tier: ${params.planTier}`);
    }

    const productId =
      params.billingCycle === 'yearly'
        ? plan.productIds?.dodo?.yearly
        : plan.productIds?.dodo?.monthly;

    if (!productId) {
      throw new Error(
        `Dodo Product ID not configured for plan ${params.planTier} (${params.billingCycle})`
      );
    }

    const session = await client.checkoutSessions.create({
      product_cart: [
        {
          product_id: productId,
          quantity: 1,
        },
      ],
      customer: {
        email: params.userEmail,
        name: params.userName || params.userEmail.split('@')[0],
      },
      return_url: params.successUrl,
      cancel_url: params.cancelUrl || params.successUrl,
    });

    if (!session.checkout_url) {
      throw new Error('Dodo Payments did not return a checkout URL.');
    }

    return {
      checkoutUrl: session.checkout_url,
      sessionId: session.session_id,
    };
  }

  async getPortalUrl(params: PortalParams): Promise<string | null> {
    try {
      const client = this.getClient();
      const portal = await client.customers.customerPortal.create(params.customerId, {
        return_url: params.returnUrl,
      });
      // customerPortalSession returns a portal link or session url
      return (portal as any).portal_url || (portal as any).url || (portal as any).link || null;
    } catch (error) {
      console.error('[DodoPayments] Error creating customer portal session:', error);
      return null;
    }
  }

  async cancelSubscription(params: CancelSubscriptionParams): Promise<CancelSubscriptionResult> {
    try {
      const client = this.getClient();
      if ((client as any).subscriptions?.cancel) {
        await (client as any).subscriptions.cancel(params.subscriptionId);
      } else if ((client as any).subscriptions?.update) {
        await (client as any).subscriptions.update(params.subscriptionId, { status: 'cancelled' });
      }
      return {
        success: true,
        effectiveFrom: params.immediately ? 'immediately' : 'next_billing_period',
        message: 'Subscription has been canceled.',
      };
    } catch (error: any) {
      console.error('[DodoPayments] Error canceling subscription:', error);
      throw new Error(error.message || 'Failed to cancel Dodo subscription.');
    }
  }

  async parseWebhook(
    rawBody: string,
    headers: Headers | Record<string, string | string[] | undefined>
  ): Promise<NormalizedWebhookEvent> {
    const webhookKey = process.env.DODO_PAYMENTS_WEBHOOK_KEY;
    const headerMap = headers instanceof Headers ? Object.fromEntries(headers.entries()) : headers;

    if (webhookKey) {
      const isValid = this.verifySignature(rawBody, headerMap, webhookKey);
      if (!isValid) {
        throw new Error('Invalid Dodo Payments webhook signature.');
      }
    }

    const payload = JSON.parse(rawBody);
    const eventType = payload.event_type || payload.type || 'unknown';
    const data = payload.data || payload;

    const eventId = payload.event_id || payload.id || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Normalize event types
    let normalizedType: NormalizedWebhookEvent['eventType'] = 'unknown';
    let status: SubscriptionStatus = 'active';

    if (eventType.includes('subscription.active') || eventType.includes('subscription.created')) {
      normalizedType = 'subscription.created';
      status = 'active';
    } else if (
      eventType.includes('subscription.renewed') ||
      eventType.includes('subscription.updated') ||
      eventType.includes('subscription.plan_changed')
    ) {
      normalizedType = 'subscription.updated';
      status = 'active';
    } else if (
      eventType.includes('subscription.cancelled') ||
      eventType.includes('subscription.expired') ||
      eventType.includes('subscription.failed')
    ) {
      normalizedType = 'subscription.canceled';
      status = 'canceled';
    } else if (eventType.includes('payment.succeeded')) {
      normalizedType = 'payment.succeeded';
    } else if (eventType.includes('payment.failed')) {
      normalizedType = 'payment.failed';
      status = 'past_due';
    }

    // Extract metadata
    const metadata = data.metadata || payload.metadata || {};
    const workspaceId = metadata.workspaceId || data.workspace_id;
    const userId = metadata.userId || data.user_id;
    const customerId = data.customer_id || data.customer?.customer_id || payload.customer_id;
    const subscriptionId = data.subscription_id || data.id || payload.subscription_id;

    // Detect plan tier from product or metadata
    let planTier: PlanTier | undefined = metadata.planTier as PlanTier;
    if (!planTier && data.product_id) {
      if (
        data.product_id === PLANS.studio.productIds?.dodo?.monthly ||
        data.product_id === PLANS.studio.productIds?.dodo?.yearly
      ) {
        planTier = 'studio';
      } else if (
        data.product_id === PLANS.pro.productIds?.dodo?.monthly ||
        data.product_id === PLANS.pro.productIds?.dodo?.yearly
      ) {
        planTier = 'pro';
      }
    }

    const currentPeriodEnd = data.next_billing_date
      ? new Date(data.next_billing_date)
      : data.current_period_end
      ? new Date(data.current_period_end * 1000)
      : undefined;

    return {
      provider: this.name,
      eventId,
      eventType: normalizedType,
      workspaceId,
      userId,
      customerId,
      subscriptionId,
      planTier,
      status,
      currentPeriodEnd,
      rawPayload: payload,
    };
  }

  private verifySignature(
    rawBody: string,
    headers: Record<string, string | string[] | undefined>,
    secret: string
  ): boolean {
    const signature = (headers['webhook-signature'] ||
      headers['x-dodo-signature'] ||
      headers['signature']) as string | undefined;
    const webhookId = (headers['webhook-id'] || headers['x-dodo-webhook-id']) as string | undefined;
    const timestamp = (headers['webhook-timestamp'] || headers['x-dodo-timestamp']) as string | undefined;

    if (!signature) {
      return false;
    }

    try {
      // Standard Webhooks / Svix format
      if (webhookId && timestamp) {
        const toSign = `${webhookId}.${timestamp}.${rawBody}`;
        const cleanSecret = secret.startsWith('whsec_') ? secret.substring(6) : secret;
        const key = secret.startsWith('whsec_')
          ? Buffer.from(cleanSecret, 'base64')
          : Buffer.from(secret, 'utf-8');
        const expectedSig = crypto.createHmac('sha256', key).update(toSign).digest('base64');

        const signatures = signature.split(' ');
        for (const sig of signatures) {
          const parts = sig.split(',');
          const val = parts.length > 1 ? parts[1] : parts[0];
          if (
            val.length === expectedSig.length &&
            crypto.timingSafeEqual(Buffer.from(val), Buffer.from(expectedSig))
          ) {
            return true;
          }
        }
      }

      // Simple HMAC-SHA256 fallback
      const hmacHex = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
      const hmacBase64 = crypto.createHmac('sha256', secret).update(rawBody).digest('base64');

      if (signature === hmacHex || signature === `sha256=${hmacHex}` || signature === hmacBase64) {
        return true;
      }
    } catch (err) {
      console.error('[DodoPayments] Signature verification error:', err);
      return false;
    }

    return false;
  }
}
