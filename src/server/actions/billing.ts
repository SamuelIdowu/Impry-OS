"use server";

import { db } from "@/server/db";
import { workspaces, teamMembers, projects, clients } from "@/server/db/schema";
import { eq, count } from "drizzle-orm";
import { getUser } from "@/lib/auth";
import { verifyWorkspaceAccess } from "@/server/actions/workspaces";
import { getPaymentProvider, getPlanConfig, PlanTier, BillingCycle, CancelSubscriptionResult } from "@/lib/payments";

export async function getWorkspaceBillingInfo(workspaceId: string) {
  const user = await getUser();
  if (!user) {
    throw new Error("Unauthorized: Please sign in.");
  }

  const hasAccess = await verifyWorkspaceAccess(workspaceId, user);
  if (!hasAccess) {
    throw new Error("Access denied: You do not have access to this workspace.");
  }

  // Run workspace + all usage counts in parallel
  const [workspace, teamMembersCount, projectsCount, clientsCount] = await Promise.all([
    db
      .select({
        id: workspaces.id,
        name: workspaces.name,
        planTier: workspaces.planTier,
        subscriptionStatus: workspaces.subscriptionStatus,
        paymentProvider: workspaces.paymentProvider,
        subscriptionId: workspaces.subscriptionId,
        customerId: workspaces.customerId,
        currentPeriodEnd: workspaces.currentPeriodEnd,
      })
      .from(workspaces)
      .where(eq(workspaces.id, workspaceId))
      .limit(1),
    db.select({ count: count() }).from(teamMembers).where(eq(teamMembers.workspaceId, workspaceId)),
    db.select({ count: count() }).from(projects).where(eq(projects.workspaceId, workspaceId)),
    db.select({ count: count() }).from(clients).where(eq(clients.workspaceId, workspaceId)),
  ]);

  const ws = workspace[0];
  if (!ws) {
    throw new Error("Workspace not found.");
  }

  let currentTier = (ws.planTier as PlanTier) || "free";
  let subscriptionStatus = ws.subscriptionStatus || "active";
  let subscriptionId = ws.subscriptionId;
  let customerId = ws.customerId;
  let currentPeriodEnd = ws.currentPeriodEnd;
  let scheduledChangeAction: string | null = null;
  let scheduledChangeAt: Date | null = null;

  // Check mirrored subscriptions table for scheduled cancellation
  if (subscriptionId) {
    try {
      const { subscriptions } = await import("@/server/db/schema");
      const [subRow] = await db
        .select({
          scheduledChangeAction: subscriptions.scheduledChangeAction,
          scheduledChangeAt: subscriptions.scheduledChangeAt,
        })
        .from(subscriptions)
        .where(eq(subscriptions.subscriptionId, subscriptionId))
        .limit(1);

      if (subRow) {
        scheduledChangeAction = subRow.scheduledChangeAction || null;
        scheduledChangeAt = subRow.scheduledChangeAt || null;
      }
    } catch {}
  }

  // Real-time Paddle synchronization for instant checkout & upgrade reflection
  if (user.email) {
    try {
      const { getPaddleInstance } = await import("@/lib/paddle/get-paddle-instance");
      const { resolvePlanTier } = await import("@/lib/paddle/access");
      const paddle = getPaddleInstance();

      const customerCollection = await paddle.customers.list({ search: user.email.toLowerCase().trim() });
      const paddleCustomer = (await customerCollection.next())?.[0];

      if (paddleCustomer?.id) {
        customerId = paddleCustomer.id;
        const subCollection = await paddle.subscriptions.list({
          customerId: [paddleCustomer.id],
          status: ['active', 'trialing', 'past_due'],
        });
        const activeSub = (await subCollection.next())?.[0];

        if (activeSub) {
          const firstPriceId = activeSub.items?.[0]?.price?.id || '';
          const firstProductId = activeSub.items?.[0]?.price?.productId || '';
          const detectedTier = resolvePlanTier(firstPriceId, firstProductId);
          const detectedStatus = activeSub.status;
          const detectedPeriodEnd = activeSub.currentBillingPeriod?.endsAt ? new Date(activeSub.currentBillingPeriod.endsAt) : currentPeriodEnd;

          if (activeSub.scheduledChange) {
            scheduledChangeAction = activeSub.scheduledChange.action || null;
            scheduledChangeAt = activeSub.scheduledChange.effectiveAt ? new Date(activeSub.scheduledChange.effectiveAt) : null;
          }

          if (currentTier !== detectedTier || subscriptionStatus !== detectedStatus || subscriptionId !== activeSub.id) {
            currentTier = detectedTier;
            subscriptionStatus = detectedStatus;
            subscriptionId = activeSub.id;
            currentPeriodEnd = detectedPeriodEnd;

            await db.update(workspaces)
              .set({
                planTier: detectedTier,
                subscriptionStatus: detectedStatus,
                paymentProvider: 'paddle',
                subscriptionId: activeSub.id,
                customerId: paddleCustomer.id,
                currentPeriodEnd: detectedPeriodEnd,
                updatedAt: new Date(),
              })
              .where(eq(workspaces.id, workspaceId));
          }
        }
      }
    } catch (syncErr) {
      console.warn("Paddle real-time sync failed silently:", syncErr);
    }
  }

  const isPendingCancellation = Boolean(
    scheduledChangeAction === 'cancel' ||
    (subscriptionStatus === 'canceled' && currentTier !== 'free' && currentPeriodEnd && new Date(currentPeriodEnd) > new Date())
  );

  const planConfig = getPlanConfig(currentTier);

  return {
    workspaceId: ws.id,
    planTier: currentTier,
    subscriptionStatus,
    paymentProvider: ws.paymentProvider || "paddle",
    subscriptionId,
    customerId,
    currentPeriodEnd,
    isPendingCancellation,
    scheduledChangeAction,
    scheduledChangeAt,
    planConfig,
    usage: {
      teamMembers: teamMembersCount[0]?.count || 0,
      projects: projectsCount[0]?.count || 0,
      clients: clientsCount[0]?.count || 0,
    }
  };
}

export async function createSubscriptionCheckout(
  workspaceId: string,
  planTier: "pro" | "studio",
  billingCycle: BillingCycle = "monthly"
) {
  const user = await getUser();
  if (!user) {
    throw new Error("Unauthorized: Please sign in.");
  }

  const hasAccess = await verifyWorkspaceAccess(workspaceId);
  if (!hasAccess) {
    throw new Error("Access denied: You do not have access to this workspace.");
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  const successUrl = `${baseUrl}/${workspaceId}/settings?tab=billing&billing=success`;
  const cancelUrl = `${baseUrl}/${workspaceId}/settings?tab=billing&billing=canceled`;

  const provider = getPaymentProvider();

  const checkout = await provider.createCheckout({
    workspaceId,
    userId: user.id,
    userEmail: user.email,
    userName: user.name || undefined,
    planTier,
    billingCycle,
    successUrl,
    cancelUrl,
  });

  return {
    success: true,
    checkoutUrl: checkout.checkoutUrl,
    provider: provider.name,
  };
}

export async function getBillingPortalUrl(workspaceId: string) {
  const user = await getUser();
  if (!user) {
    throw new Error("Unauthorized: Please sign in.");
  }

  const hasAccess = await verifyWorkspaceAccess(workspaceId);
  if (!hasAccess) {
    throw new Error("Access denied.");
  }

  const [workspace] = await db
    .select({
      customerId: workspaces.customerId,
      paymentProvider: workspaces.paymentProvider,
    })
    .from(workspaces)
    .where(eq(workspaces.id, workspaceId))
    .limit(1);

  let customerId = workspace?.customerId;

  if (!customerId && user.email) {
    const { customers } = await import("@/server/db/schema");
    const [customerRow] = await db
      .select({ customerId: customers.customerId })
      .from(customers)
      .where(eq(customers.email, user.email.toLowerCase().trim()))
      .limit(1);

    if (customerRow?.customerId) {
      customerId = customerRow.customerId;
    }
  }

  if (!customerId) {
    return { portalUrl: null };
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  const provider = getPaymentProvider(workspace?.paymentProvider || undefined);
  const portalUrl = await provider.getPortalUrl({
    customerId,
    returnUrl: `${baseUrl}/${workspaceId}/settings?tab=billing`,
  });

  return { portalUrl };
}

/**
 * Cancels active paid subscription for a workspace
 * @param workspaceId ID of workspace
 * @param immediately If true, cancels immediately and drops to free tier. If false, schedules cancellation for end of current billing period.
 */
export async function cancelWorkspaceSubscription(
  workspaceId: string,
  immediately: boolean = false
): Promise<CancelSubscriptionResult> {
  const user = await getUser();
  if (!user) {
    throw new Error("Unauthorized: Please sign in.");
  }

  const hasAccess = await verifyWorkspaceAccess(workspaceId);
  if (!hasAccess) {
    throw new Error("Access denied: You do not have permission to modify billing for this workspace.");
  }

  const [workspace] = await db
    .select({
      id: workspaces.id,
      planTier: workspaces.planTier,
      subscriptionStatus: workspaces.subscriptionStatus,
      paymentProvider: workspaces.paymentProvider,
      subscriptionId: workspaces.subscriptionId,
      customerId: workspaces.customerId,
      currentPeriodEnd: workspaces.currentPeriodEnd,
    })
    .from(workspaces)
    .where(eq(workspaces.id, workspaceId))
    .limit(1);

  if (!workspace) {
    throw new Error("Workspace not found.");
  }

  if (workspace.planTier === "free" || !workspace.planTier) {
    throw new Error("Cannot cancel a subscription on the Free tier.");
  }

  const providerName = workspace.paymentProvider || undefined;
  const provider = getPaymentProvider(providerName);

  let cancelResult: CancelSubscriptionResult = {
    success: true,
    effectiveFrom: immediately ? 'immediately' : 'next_billing_period',
    scheduledChangeAt: workspace.currentPeriodEnd,
    message: immediately
      ? 'Subscription has been canceled immediately.'
      : 'Subscription will remain active until the end of your billing cycle.',
  };

  if (workspace.subscriptionId && typeof provider.cancelSubscription === 'function') {
    try {
      cancelResult = await provider.cancelSubscription({
        subscriptionId: workspace.subscriptionId,
        workspaceId,
        customerId: workspace.customerId || undefined,
        immediately,
      });
    } catch (providerErr: any) {
      console.warn("Payment provider cancel subscription error:", providerErr);
      // Fallback: continue to update local DB state so user isn't stuck
    }
  }

  const effectiveAt = cancelResult.scheduledChangeAt || (immediately ? new Date() : workspace.currentPeriodEnd);

  if (immediately) {
    await db
      .update(workspaces)
      .set({
        planTier: 'free',
        subscriptionStatus: 'canceled',
        currentPeriodEnd: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(workspaces.id, workspaceId));
  } else {
    await db
      .update(workspaces)
      .set({
        subscriptionStatus: 'canceled',
        updatedAt: new Date(),
      })
      .where(eq(workspaces.id, workspaceId));
  }

  // Update mirrored subscriptions table if entry exists
  if (workspace.subscriptionId) {
    try {
      const { subscriptions } = await import("@/server/db/schema");
      await db
        .update(subscriptions)
        .set({
          status: immediately ? 'canceled' : 'active',
          scheduledChangeAction: immediately ? null : 'cancel',
          scheduledChangeAt: immediately ? null : effectiveAt,
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.subscriptionId, workspace.subscriptionId));
    } catch {}
  }

  return {
    success: true,
    effectiveFrom: cancelResult.effectiveFrom,
    scheduledChangeAt: effectiveAt,
    message: cancelResult.message || (immediately ? 'Subscription canceled immediately.' : 'Subscription scheduled for cancellation at billing period end.'),
  };
}

/**
 * Development & Testing helper: instantly activates a plan tier for the workspace
 */
export async function simulatePlanUpgrade(workspaceId: string, planTier: PlanTier) {
  if (process.env.NODE_ENV !== "development") {
    throw new Error("This action is only available in development mode.");
  }

  const user = await getUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const hasAccess = await verifyWorkspaceAccess(workspaceId);
  if (!hasAccess) {
    throw new Error("Access denied");
  }

  await db
    .update(workspaces)
    .set({
      planTier,
      subscriptionStatus: "active",
      paymentProvider: "mock",
      subscriptionId: `mock_sub_${Date.now()}`,
      customerId: `mock_cus_${user.id}`,
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    })
    .where(eq(workspaces.id, workspaceId));

  return { success: true, planTier };
}

export interface BillingInvoice {
  id: string;
  invoiceNumber: string | null;
  description: string;
  amount: string;
  currency: string;
  status: string;
  date: string;
  invoiceId: string | null;
}

export async function getWorkspaceInvoices(workspaceId: string): Promise<BillingInvoice[]> {
  const user = await getUser();
  if (!user) return [];

  const hasAccess = await verifyWorkspaceAccess(workspaceId);
  if (!hasAccess) return [];

  const [workspace] = await db
    .select({ customerId: workspaces.customerId })
    .from(workspaces)
    .where(eq(workspaces.id, workspaceId))
    .limit(1);

  let customerId = workspace?.customerId;
  if (!customerId && user.email) {
    const { customers } = await import("@/server/db/schema");
    const [cust] = await db
      .select({ customerId: customers.customerId })
      .from(customers)
      .where(eq(customers.email, user.email.toLowerCase().trim()))
      .limit(1);
    if (cust?.customerId) customerId = cust.customerId;
  }

  if (!customerId) return [];

  try {
    const apiKey = process.env.PADDLE_API_KEY || process.env.PADDLE_SANDBOX_API_KEY;
    const baseUrl =
      process.env.PADDLE_ENVIRONMENT === "sandbox" || process.env.PADDLE_SERVER === "sandbox"
        ? "https://sandbox-api.paddle.com"
        : "https://api.paddle.com";

    const res = await fetch(`${baseUrl}/transactions?customer_id=${customerId}&status=completed,billed,paid`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!res.ok) return [];
    const json = await res.json();
    const transactions = json.data || [];

    return transactions.map((t: any) => {
      const rawTotal = parseInt(t.details?.totals?.grand_total || t.details?.totals?.total || "0", 10);
      const formattedAmount = (rawTotal / 100).toLocaleString("en-US", {
        style: "currency",
        currency: t.currency_code || "USD",
      });

      const dateStr = t.billed_at || t.created_at;
      const formattedDate = dateStr
        ? new Date(dateStr).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "Recent";

      const description =
        t.items?.[0]?.price?.description || t.items?.[0]?.product?.name || "Subscription Payment";

      return {
        id: t.id,
        invoiceNumber: t.invoice_number || t.id,
        description,
        amount: formattedAmount,
        currency: t.currency_code || "USD",
        status: t.status,
        date: formattedDate,
        invoiceId: t.invoice_id || null,
      };
    });
  } catch (err) {
    console.error("Error fetching workspace invoices:", err);
    return [];
  }
}

export async function getInvoicePdfDownloadUrl(transactionId: string): Promise<string | null> {
  const user = await getUser();
  if (!user) return null;

  try {
    const apiKey = process.env.PADDLE_API_KEY || process.env.PADDLE_SANDBOX_API_KEY;
    const baseUrl =
      process.env.PADDLE_ENVIRONMENT === "sandbox" || process.env.PADDLE_SERVER === "sandbox"
        ? "https://sandbox-api.paddle.com"
        : "https://api.paddle.com";

    const res = await fetch(`${baseUrl}/transactions/${transactionId}/invoice`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!res.ok) return null;
    const json = await res.json();
    return json.data?.url || null;
  } catch (err) {
    console.error("Error fetching invoice PDF URL:", err);
    return null;
  }
}
