import { db } from "@/server/db";
import { workspaces, clients, projects, teamMembers, workspaceMembers, payments } from "@/server/db/schema";
import { eq, count, and, gte } from "drizzle-orm";
import { getPlanConfig } from "./config";
import { PlanTier } from "./types";

/**
 * Toggle to enable or disable price/feature blockers across the entire application.
 *
 * Supported environment variables:
 * - ENABLE_PRICE_BLOCKERS: "true" | "false"
 * - FEATURE_BLOCKERS_ENABLED: "true" | "false"
 * - DISABLE_PRICE_BLOCKERS: "true" | "false"
 *
 * Default: false (Blockers disabled for beta testers to use all features without restriction).
 */
export function arePriceBlockersEnabled(): boolean {
  if (process.env.ENABLE_PRICE_BLOCKERS === "true") return true;
  if (process.env.FEATURE_BLOCKERS_ENABLED === "true") return true;
  if (process.env.DISABLE_PRICE_BLOCKERS === "false") return true;

  // Defaults to false (Beta testing mode: unrestricted access)
  return false;
}

export async function getWorkspacePlan(workspaceId: string): Promise<PlanTier> {
  // If price blockers are disabled for beta testing, grant studio tier capabilities
  if (!arePriceBlockersEnabled()) {
    return "studio";
  }

  const [ws] = await db
    .select({ planTier: workspaces.planTier })
    .from(workspaces)
    .where(eq(workspaces.id, workspaceId))
    .limit(1);

  return (ws?.planTier as PlanTier) || "free";
}

export async function canCreateClient(workspaceId: string) {
  const planTier = await getWorkspacePlan(workspaceId);

  // If price blockers are disabled for beta testing, allow unlimited creation
  if (!arePriceBlockersEnabled()) {
    return { allowed: true, currentCount: 0, maxAllowed: "unlimited" as const, planTier };
  }

  const plan = getPlanConfig(planTier);

  if (plan.limits.clients === "unlimited") {
    return { allowed: true, currentCount: 0, maxAllowed: "unlimited" as const, planTier };
  }

  const [{ value }] = await db
    .select({ value: count() })
    .from(clients)
    .where(eq(clients.workspaceId, workspaceId));

  const currentCount = Number(value);
  const allowed = currentCount < plan.limits.clients;

  return {
    allowed,
    currentCount,
    maxAllowed: plan.limits.clients,
    planTier,
  };
}

export async function canCreateProject(workspaceId: string) {
  const planTier = await getWorkspacePlan(workspaceId);

  // If price blockers are disabled for beta testing, allow unlimited creation
  if (!arePriceBlockersEnabled()) {
    return { allowed: true, currentCount: 0, maxAllowed: "unlimited" as const, planTier };
  }

  const plan = getPlanConfig(planTier);

  if (plan.limits.projects === "unlimited") {
    return { allowed: true, currentCount: 0, maxAllowed: "unlimited" as const, planTier };
  }

  const [{ value }] = await db
    .select({ value: count() })
    .from(projects)
    .where(eq(projects.workspaceId, workspaceId));

  const currentCount = Number(value);
  const allowed = currentCount < plan.limits.projects;

  return {
    allowed,
    currentCount,
    maxAllowed: plan.limits.projects,
    planTier,
  };
}

export async function canCreateInvoice(workspaceId: string) {
  const planTier = await getWorkspacePlan(workspaceId);

  // If price blockers are disabled for beta testing, allow unlimited creation
  if (!arePriceBlockersEnabled()) {
    return { allowed: true, currentCount: 0, maxAllowed: "unlimited" as const, planTier };
  }

  const plan = getPlanConfig(planTier);

  if (plan.limits.invoicesPerMonth === "unlimited") {
    return { allowed: true, currentCount: 0, maxAllowed: "unlimited" as const, planTier };
  }

  // Calculate start of current month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [{ value }] = await db
    .select({ value: count() })
    .from(payments)
    .where(
      and(
        eq(payments.workspaceId, workspaceId),
        gte(payments.createdAt, startOfMonth)
      )
    );

  const currentCount = Number(value);
  const allowed = currentCount < plan.limits.invoicesPerMonth;

  return {
    allowed,
    currentCount,
    maxAllowed: plan.limits.invoicesPerMonth,
    planTier,
  };
}

export async function canUseCustomBranding(workspaceId: string) {
  const planTier = await getWorkspacePlan(workspaceId);

  if (!arePriceBlockersEnabled()) {
    return {
      allowed: true,
      planTier,
    };
  }

  const plan = getPlanConfig(planTier);

  return {
    allowed: plan.limits.customBranding,
    planTier,
  };
}

export async function canInviteTeamMember(workspaceId: string) {
  const planTier = await getWorkspacePlan(workspaceId);

  if (!arePriceBlockersEnabled()) {
    return {
      allowed: true,
      currentCount: 0,
      maxAllowed: "unlimited" as const,
      planTier,
    };
  }

  const plan = getPlanConfig(planTier);

  const [{ value: rosterCount }] = await db
    .select({ value: count() })
    .from(teamMembers)
    .where(eq(teamMembers.workspaceId, workspaceId));

  const [{ value: wsCount }] = await db
    .select({ value: count() })
    .from(workspaceMembers)
    .where(eq(workspaceMembers.workspaceId, workspaceId));

  const currentCount = Number(rosterCount) + Number(wsCount);
  const allowed = currentCount < plan.limits.teamMembers;

  return {
    allowed,
    currentCount,
    maxAllowed: plan.limits.teamMembers,
    planTier,
  };
}

export async function canExportCsv(workspaceId: string) {
  const planTier = await getWorkspacePlan(workspaceId);

  if (!arePriceBlockersEnabled()) {
    return {
      allowed: true,
      planTier,
    };
  }

  const plan = getPlanConfig(planTier);

  return {
    allowed: plan.limits.csvExport,
    planTier,
  };
}

export async function canAccessReports(workspaceId: string) {
  const planTier = await getWorkspacePlan(workspaceId);

  if (!arePriceBlockersEnabled()) {
    return {
      allowed: true,
      planTier,
    };
  }

  return {
    allowed: planTier === "pro" || planTier === "studio",
    planTier,
  };
}
