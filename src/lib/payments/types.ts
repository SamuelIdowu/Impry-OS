export type PlanTier = 'free' | 'pro' | 'studio';

export type BillingCycle = 'monthly' | 'yearly';

export type SubscriptionStatus =
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'trialing'
  | 'incomplete'
  | 'none';

export interface PlanFeature {
  name: string;
  included: boolean;
  limit?: string;
}

export interface PlanConfig {
  id: PlanTier;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number; // usually discounted, e.g. 2 months free
  features: string[];
  limits: {
    clients: number | 'unlimited';
    projects: number | 'unlimited';
    invoicesPerMonth: number | 'unlimited';
    customBranding: boolean;
    teamMembers: number;
    csvExport: boolean;
    prioritySupport: boolean;
  };
  productIds?: {
    dodo?: {
      monthly?: string;
      yearly?: string;
    };
    polar?: {
      monthly?: string;
      yearly?: string;
    };
    stripe?: {
      monthly?: string;
      yearly?: string;
    };
  };
}

export interface CreateCheckoutParams {
  workspaceId: string;
  userId: string;
  userEmail: string;
  userName?: string;
  planTier: 'pro' | 'studio';
  billingCycle: BillingCycle;
  successUrl: string;
  cancelUrl?: string;
}

export interface CheckoutResult {
  checkoutUrl: string;
  sessionId?: string;
}

export interface PortalParams {
  customerId: string;
  returnUrl: string;
}

export type WebhookEventType =
  | 'subscription.created'
  | 'subscription.updated'
  | 'subscription.canceled'
  | 'payment.succeeded'
  | 'payment.failed'
  | 'unknown';

export interface NormalizedWebhookEvent {
  provider: string;
  eventId: string;
  eventType: WebhookEventType;
  workspaceId?: string;
  userId?: string;
  customerId?: string;
  subscriptionId?: string;
  planTier?: PlanTier;
  status?: SubscriptionStatus;
  currentPeriodEnd?: Date;
  rawPayload: Record<string, unknown>;
}

export interface PaymentProvider {
  readonly name: string;
  createCheckout(params: CreateCheckoutParams): Promise<CheckoutResult>;
  getPortalUrl(params: PortalParams): Promise<string | null>;
  parseWebhook(rawBody: string, headers: Headers | Record<string, string | string[] | undefined>): Promise<NormalizedWebhookEvent>;
}
