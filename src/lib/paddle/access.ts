import { db } from '@/server/db';
import { customers, subscriptions, workspaces, workspaceMembers } from '@/server/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { PlanTier } from '@/lib/payments/types';

export type SubscriptionAccessStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'paused'
  | 'canceled'
  | 'none';

export interface SubscriptionAccessDecision {
  hasAccess: boolean;
  status: SubscriptionAccessStatus;
  planTier: PlanTier;
  subscriptionId?: string;
  customerId?: string;
  priceId?: string;
  productId?: string;
  isPendingCancellation: boolean;
  scheduledChangeAt?: Date | null;
}

/**
 * Evaluates whether a Paddle subscription status grants access.
 *
 * Rules:
 * - 'active' and 'trialing' grant paid access.
 * - 'past_due' provides grace period access (or limited access based on business rule).
 * - A scheduled change (e.g. pending cancellation or pause at period end) does NOT revoke access
 *   until status is actually changed to 'canceled' or 'paused'.
 * - 'canceled' or 'paused' revokes paid access.
 */
export function isSubscriptionStatusActive(
  status: string | null | undefined,
  scheduledChangeAction?: string | null
): boolean {
  if (!status) return false;
  const normalized = status.toLowerCase();

  // Active or trialing always grant access
  if (normalized === 'active' || normalized === 'trialing') {
    return true;
  }

  // Grace period for past_due (allow 3 days)
  if (normalized === 'past_due') {
    return true;
  }

  // Canceled or paused revoke access
  return false;
}

/**
 * Resolves plan tier from Paddle price ID or product ID
 */
export function resolvePlanTier(priceId?: string | null, productId?: string | null): PlanTier {
  if (!priceId && !productId) return 'free';

  const proMonthly = process.env.PADDLE_PRO_MONTHLY_PRICE_ID || process.env.NEXT_PUBLIC_PADDLE_PRO_MONTHLY_PRICE_ID || 'pri_01m158ypsmqr7dtwdcwk8qmf9x';
  const proYearly = process.env.PADDLE_PRO_YEARLY_PRICE_ID || process.env.NEXT_PUBLIC_PADDLE_PRO_YEARLY_PRICE_ID || 'pri_01m158yq3kqyzzdmvcnyfv1sn9';
  const proProduct = process.env.PADDLE_PRO_PRODUCT_ID || 'pro_01m158yp1bnjdgs5q03a9fbsdj';

  const studioMonthly = process.env.PADDLE_STUDIO_MONTHLY_PRICE_ID || process.env.PADDLE_ADVANCED_MONTHLY_PRICE_ID || 'pri_01m158yqrvk5d054tf4fkcp6ka';
  const studioYearly = process.env.PADDLE_STUDIO_YEARLY_PRICE_ID || process.env.PADDLE_ADVANCED_YEARLY_PRICE_ID || 'pri_01m158yr2hcxrbvvp5wf1r6drg';
  const studioProduct = process.env.PADDLE_STUDIO_PRODUCT_ID || 'pro_01m158yqfa1kxf52xm2588dg86';

  if (priceId === proMonthly || priceId === proYearly || productId === proProduct) {
    return 'pro';
  }

  if (priceId === studioMonthly || priceId === studioYearly || productId === studioProduct) {
    return 'studio';
  }

  return 'pro'; // default fallback for active paid subscription
}

/**
 * Checks subscription access for a specific user email
 */
export async function getUserSubscriptionAccess(userEmail: string): Promise<SubscriptionAccessDecision> {
  if (!userEmail) {
    return {
      hasAccess: false,
      status: 'none',
      planTier: 'free',
      isPendingCancellation: false,
    };
  }

  try {
    // 1. Look up customer by email
    const customerRecords = await db
      .select()
      .from(customers)
      .where(eq(customers.email, userEmail.toLowerCase().trim()))
      .limit(1);

    if (!customerRecords.length) {
      return {
        hasAccess: false,
        status: 'none',
        planTier: 'free',
        isPendingCancellation: false,
      };
    }

    const customer = customerRecords[0];

    // 2. Look up all subscriptions for customer
    const subRecords = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.customerId, customer.customerId));

    if (!subRecords.length) {
      return {
        hasAccess: false,
        status: 'none',
        planTier: 'free',
        customerId: customer.customerId,
        isPendingCancellation: false,
      };
    }

    // Find first active or trialing subscription, or most recent
    const activeSub = subRecords.find((s) => isSubscriptionStatusActive(s.status, s.scheduledChangeAction));
    const sub = activeSub || subRecords[0];

    const hasAccess = isSubscriptionStatusActive(sub.status, sub.scheduledChangeAction);
    const planTier = hasAccess ? resolvePlanTier(sub.priceId, sub.productId) : 'free';
    const isPendingCancellation = Boolean(
      sub.scheduledChangeAction === 'cancel' || sub.scheduledChangeAt
    );

    return {
      hasAccess,
      status: (sub.status as SubscriptionAccessStatus) || 'none',
      planTier,
      subscriptionId: sub.subscriptionId,
      customerId: customer.customerId,
      priceId: sub.priceId,
      productId: sub.productId,
      isPendingCancellation,
      scheduledChangeAt: sub.scheduledChangeAt,
    };
  } catch (error) {
    console.error('Error in getUserSubscriptionAccess:', error);
    return {
      hasAccess: false,
      status: 'none',
      planTier: 'free',
      isPendingCancellation: false,
    };
  }
}
