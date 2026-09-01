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

export class PaystackPaymentProvider implements PaymentProvider {
  readonly name = 'paystack';

  private getSecretKey(): string {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      throw new Error('PAYSTACK_SECRET_KEY is not configured in environment variables.');
    }
    return secretKey;
  }

  async createCheckout(params: CreateCheckoutParams): Promise<CheckoutResult> {
    const secretKey = this.getSecretKey();
    const plan = PLANS[params.planTier];
    if (!plan) {
      throw new Error(`Invalid plan tier: ${params.planTier}`);
    }

    const priceUSD = params.billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;
    // Default to USD so Paystack checkout page displays in Dollars ($)
    let currency = (process.env.PAYSTACK_CURRENCY || 'USD').toUpperCase();
    const exchangeRate = Number(process.env.PAYSTACK_USD_TO_NGN_RATE) || 1500;

    let amountInSubunits: number;
    if (currency === 'USD') {
      amountInSubunits = Math.round(priceUSD * 100);
    } else {
      const priceNGN = priceUSD * exchangeRate;
      amountInSubunits = Math.round(priceNGN * 100);
    }

    const planCode =
      params.billingCycle === 'yearly'
        ? process.env[`PAYSTACK_${params.planTier.toUpperCase()}_YEARLY_PLAN_CODE`]
        : process.env[`PAYSTACK_${params.planTier.toUpperCase()}_MONTHLY_PLAN_CODE`];

    const body: Record<string, any> = {
      email: params.userEmail,
      amount: amountInSubunits,
      currency,
      callback_url: params.successUrl,
      metadata: {
        workspaceId: params.workspaceId,
        userId: params.userId,
        planTier: params.planTier,
        billingCycle: params.billingCycle,
        custom_fields: [
          {
            display_name: 'Workspace ID',
            variable_name: 'workspace_id',
            value: params.workspaceId,
          },
        ],
      },
    };

    if (planCode) {
      body.plan = planCode;
    }

    let response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    let resData = await response.json().catch(() => ({ message: 'Network response failed' }));

    // Fallback: If USD is not yet enabled on the Paystack merchant account, retry with NGN
    if (!response.ok && resData.message?.toLowerCase().includes('currency not supported') && currency === 'USD') {
      console.warn('[Paystack] USD currency not enabled on merchant account, falling back to NGN');
      currency = 'NGN';
      body.currency = 'NGN';
      body.amount = Math.round(priceUSD * exchangeRate * 100);

      response = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      resData = await response.json().catch(() => ({ message: 'Network response failed' }));
    }

    if (!response.ok || !resData.status || !resData.data?.authorization_url) {
      throw new Error(`Paystack initialization failed: ${resData.message || response.statusText}`);
    }

    return {
      checkoutUrl: resData.data.authorization_url,
      sessionId: resData.data.reference,
    };
  }

  async getPortalUrl(params: PortalParams): Promise<string | null> {
    return `${params.returnUrl}${params.returnUrl.includes('?') ? '&' : '?'}billing=manage`;
  }

  async cancelSubscription(params: CancelSubscriptionParams): Promise<CancelSubscriptionResult> {
    const secretKey = this.getSecretKey();

    try {
      const response = await fetch('https://api.paystack.co/subscription/disable', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: params.subscriptionId,
          token: params.subscriptionId,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({ message: 'Failed to disable subscription' }));
        console.warn('[Paystack] Cancel subscription notice:', errJson);
      }

      return {
        success: true,
        effectiveFrom: params.immediately ? 'immediately' : 'next_billing_period',
        message: 'Paystack subscription cancellation requested.',
      };
    } catch (error: any) {
      console.error('[Paystack] Error canceling subscription:', error);
      throw new Error(error.message || 'Failed to cancel Paystack subscription.');
    }
  }

  async parseWebhook(
    rawBody: string,
    headers: Headers | Record<string, string | string[] | undefined>
  ): Promise<NormalizedWebhookEvent> {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    const headerMap = headers instanceof Headers ? Object.fromEntries(headers.entries()) : headers;
    const signature = (headerMap['x-paystack-signature'] || headerMap['signature']) as string | undefined;

    if (secretKey && signature) {
      const hash = crypto.createHmac('sha512', secretKey).update(rawBody).digest('hex');
      if (hash !== signature) {
        throw new Error('Invalid Paystack webhook signature.');
      }
    }

    const payload = JSON.parse(rawBody);
    const eventName = payload.event || 'unknown';
    const data = payload.data || {};
    const metadata = data.metadata || {};

    let normalizedType: NormalizedWebhookEvent['eventType'] = 'unknown';
    let status: SubscriptionStatus = 'active';

    if (eventName === 'charge.success' || eventName === 'subscription.create') {
      normalizedType = 'subscription.created';
      status = 'active';
    } else if (eventName === 'subscription.enable') {
      normalizedType = 'subscription.updated';
      status = 'active';
    } else if (eventName === 'subscription.disable' || eventName === 'invoice.payment_failed') {
      normalizedType = 'subscription.canceled';
      status = eventName === 'invoice.payment_failed' ? 'past_due' : 'canceled';
    }

    const workspaceId = metadata.workspaceId || metadata.workspace_id;
    const userId = metadata.userId || metadata.user_id;
    const customerId = data.customer?.customer_code || data.customer?.email;
    const subscriptionId = data.subscription_code || data.reference;

    return {
      provider: this.name,
      eventId: payload.id || data.id || `ps_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      eventType: normalizedType,
      workspaceId,
      userId,
      customerId,
      subscriptionId,
      planTier: (metadata.planTier as PlanTier) || 'pro',
      status,
      currentPeriodEnd: data.next_payment_date ? new Date(data.next_payment_date) : undefined,
      rawPayload: payload,
    };
  }
}
