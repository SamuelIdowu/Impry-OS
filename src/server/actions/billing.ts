"use server";

import { db } from "@/server/db";
import { workspaces } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { getUser } from "@/lib/auth";
import { verifyWorkspaceAccess } from "@/server/actions/workspaces";
import { getPaymentProvider, getPlanConfig, PlanTier, BillingCycle } from "@/lib/payments";

export async function getWorkspaceBillingInfo(workspaceId: string) {
  const user = await getUser();
  if (!user) {
    throw new Error("Unauthorized: Please sign in.");
  }

  const hasAccess = await verifyWorkspaceAccess(workspaceId);
  if (!hasAccess) {
    throw new Error("Access denied: You do not have access to this workspace.");
  }

  const [workspace] = await db
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
    .limit(1);

  if (!workspace) {
    throw new Error("Workspace not found.");
  }

  const currentTier = (workspace.planTier as PlanTier) || "free";
  const planConfig = getPlanConfig(currentTier);

  return {
    workspaceId: workspace.id,
    planTier: currentTier,
    subscriptionStatus: workspace.subscriptionStatus || "active",
    paymentProvider: workspace.paymentProvider || "none",
    subscriptionId: workspace.subscriptionId,
    customerId: workspace.customerId,
    currentPeriodEnd: workspace.currentPeriodEnd,
    planConfig,
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

  if (!workspace?.customerId) {
    return { portalUrl: null };
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  const provider = getPaymentProvider(workspace.paymentProvider || undefined);
  const portalUrl = await provider.getPortalUrl({
    customerId: workspace.customerId,
    returnUrl: `${baseUrl}/${workspaceId}/settings?tab=billing`,
  });

  return { portalUrl };
}

/**
 * Development & Testing helper: instantly activates a plan tier for the workspace
 */
export async function simulatePlanUpgrade(workspaceId: string, planTier: PlanTier) {
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
