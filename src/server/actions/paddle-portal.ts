'use server';

import { getSession } from '@/lib/auth';
import { getPaddleInstance } from '@/lib/paddle/get-paddle-instance';
import { db } from '@/server/db';
import { customers, subscriptions, workspaces } from '@/server/db/schema';
import { eq } from 'drizzle-orm';

export interface CreatePaddlePortalSessionResult {
  url?: string;
  error?: string;
}

/**
 * Server action to securely mint a Paddle Customer Portal session URL.
 *
 * Security Model:
 * 1. Authenticates the request via session cookie (never trusts client inputs).
 * 2. Resolves Paddle customer ID from internal mirrored tables using the authenticated user's email.
 * 3. Mints a time-limited one-time session URL via Paddle Node SDK.
 */
export async function createPaddlePortalSession(
  workspaceId?: string
): Promise<CreatePaddlePortalSessionResult> {
  // 1. Authenticate user
  const session = await getSession();
  if (!session?.user || !session.user.email) {
    return { error: 'You must be signed in to manage your billing.' };
  }

  const userEmail = session.user.email.toLowerCase().trim();

  // 2. Resolve Paddle Customer ID server-side
  let customerId: string | null = null;

  // Check mirrored customers table first
  const customerRows = await db
    .select({ customerId: customers.customerId })
    .from(customers)
    .where(eq(customers.email, userEmail))
    .limit(1);

  if (customerRows.length > 0 && customerRows[0].customerId) {
    customerId = customerRows[0].customerId;
  } else if (workspaceId) {
    // Check workspace customerId
    const workspaceRows = await db
      .select({ customerId: workspaces.customerId })
      .from(workspaces)
      .where(eq(workspaces.id, workspaceId))
      .limit(1);

    if (workspaceRows.length > 0 && workspaceRows[0].customerId) {
      customerId = workspaceRows[0].customerId;
    }
  }

  if (!customerId) {
    return {
      error:
        'No active billing account found. Please subscribe to a plan first to access the customer portal.',
    };
  }

  // 3. Look up active subscription IDs for this customer
  const subRows = await db
    .select({ subscriptionId: subscriptions.subscriptionId })
    .from(subscriptions)
    .where(eq(subscriptions.customerId, customerId));

  const subscriptionIds = subRows.map((r) => r.subscriptionId);

  // 4. Mint Customer Portal Session via Paddle SDK
  try {
    const paddle = getPaddleInstance();
    const portalSession = await paddle.customerPortalSessions.create(
      customerId,
      subscriptionIds
    );

    const portalUrl = portalSession.urls?.general?.overview;
    if (!portalUrl) {
      return { error: 'Paddle customer portal URL was not returned.' };
    }

    return { url: portalUrl };
  } catch (err: any) {
    console.error('Failed to create Paddle customer portal session:', err);
    return {
      error:
        err?.message ||
        'Could not generate customer portal session. Please contact support.',
    };
  }
}
