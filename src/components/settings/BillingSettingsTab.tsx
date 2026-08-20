"use client";

import React, { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Check,
    CreditCard,
    ExternalLink,
    Loader2,
    ShieldCheck,
    Sparkles,
    Zap,
    Building2,
    AlertCircle,
    Download,
    Search,
    Users,
    FolderKanban,
    Briefcase,
    Receipt
} from "lucide-react";
import {
    getWorkspaceBillingInfo,
    createSubscriptionCheckout,
    getBillingPortalUrl,
    simulatePlanUpgrade,
} from "@/server/actions/billing";
import { PLANS, PlanTier, BillingCycle } from "@/lib/payments";

interface BillingSettingsTabProps {
    workspaceId: string;
}

export function BillingSettingsTab({ workspaceId }: BillingSettingsTabProps) {
    const [billingInfo, setBillingInfo] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
    const [isPending, startTransition] = useTransition();
    const [actionError, setActionError] = useState<string | null>(null);
    const [actionSuccess, setActionSuccess] = useState<string | null>(null);

    const fetchBilling = async () => {
        try {
            setIsLoading(true);
            const info = await getWorkspaceBillingInfo(workspaceId);
            setBillingInfo(info);
        } catch (err: any) {
            setActionError(err.message || "Failed to load billing information.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBilling();
    }, [workspaceId]);

    const handleUpgrade = (tier: "pro" | "studio") => {
        setActionError(null);
        setActionSuccess(null);
        startTransition(async () => {
            try {
                const result = await createSubscriptionCheckout(workspaceId, tier, billingCycle);
                if (result.checkoutUrl) {
                    window.location.href = result.checkoutUrl;
                }
            } catch (err: any) {
                setActionError(err.message || "Could not initiate checkout session.");
            }
        });
    };

    const handleManagePortal = () => {
        setActionError(null);
        startTransition(async () => {
            try {
                const { portalUrl } = await getBillingPortalUrl(workspaceId);
                if (portalUrl) {
                    window.location.href = portalUrl;
                } else {
                    setActionError("Customer portal session could not be created.");
                }
            } catch (err: any) {
                setActionError(err.message || "Failed to open customer portal.");
            }
        });
    };

    const handleSimulateDevUpgrade = (tier: PlanTier) => {
        setActionError(null);
        startTransition(async () => {
            try {
                await simulatePlanUpgrade(workspaceId, tier);
                setActionSuccess(`Simulated plan switched to ${tier.toUpperCase()}`);
                await fetchBilling();
            } catch (err: any) {
                setActionError(err.message || "Simulation failed.");
            }
        });
    };

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-12 flex flex-col items-center justify-center min-h-[350px]">
                <Loader2 className="h-7 w-7 text-zinc-500 animate-spin mb-3" />
                <p className="text-zinc-500 dark:text-zinc-400 text-xs">Loading workspace billing details...</p>
            </div>
        );
    }

    const currentTier: PlanTier = billingInfo?.planTier || "free";
    const subscriptionStatus = billingInfo?.subscriptionStatus || "active";
    const renewalDate = billingInfo?.currentPeriodEnd
        ? new Date(billingInfo.currentPeriodEnd).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        })
        : null;

    // Real usage data fetched dynamically from DB
    const realUsage = billingInfo?.usage || { teamMembers: 0, projects: 0, clients: 0 };

    // Real Plan Limits based on active tier
    const planLimits = {
        free: { teamMembers: 1, projects: 3, clients: 5 },
        pro: { teamMembers: 5, projects: 25, clients: 50 },
        studio: { teamMembers: 20, projects: 100, clients: 200 }
    }[currentTier];

    return (
        <div className="space-y-8 pb-16 max-w-5xl">
            {/* Header & Main Portal Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
                        <CreditCard className="h-6 w-6 text-zinc-700 dark:text-zinc-300" />
                        Billing & Subscription
                    </h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                        View current workspace plan, real-time usage metrics, and subscription billing details.
                    </p>
                </div>

                {billingInfo?.customerId && (
                    <Button
                        onClick={handleManagePortal}
                        disabled={isPending}
                        variant="outline"
                        className="gap-2 text-xs font-medium shrink-0 border-zinc-200 dark:border-zinc-800"
                    >
                        <CreditCard className="h-4 w-4 text-zinc-500" />
                        Manage Subscription & Receipts
                        <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
                    </Button>
                )}
            </div>

            {/* Notifications */}
            {actionError && (
                <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-700 dark:text-red-400 text-sm">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <p>{actionError}</p>
                </div>
            )}

            {actionSuccess && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-3 text-emerald-700 dark:text-emerald-300 text-sm">
                    <Check className="h-5 w-5 shrink-0" />
                    <p>{actionSuccess}</p>
                </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* SECTION 1: SUBSCRIPTION OVERVIEW & REAL USAGE METRICS */}
            {/* ------------------------------------------------------------- */}
            <div className="space-y-4">
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    Subscription Overview
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Active Plan Overview Card */}
                    <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm flex flex-col justify-between space-y-6">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                                    Current Workspace Tier
                                </p>
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge
                                        variant="default"
                                        className="bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold text-xs capitalize py-1"
                                    >
                                        {PLANS[currentTier]?.name || "Free Starter"}
                                    </Badge>
                                    <Badge
                                        variant="outline"
                                        className="text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 font-medium text-xs capitalize py-1"
                                    >
                                        {subscriptionStatus}
                                    </Badge>
                                </div>
                                <div className="mt-3">
                                    <span className="text-3xl font-black text-zinc-900 dark:text-zinc-100">
                                        {currentTier === "free" ? "$0" : currentTier === "pro" ? "$19" : "$49"}
                                    </span>
                                    <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium"> / Month</span>
                                </div>
                            </div>

                            {currentTier !== "studio" && (
                                <Button
                                    onClick={() => handleUpgrade("pro")}
                                    disabled={isPending}
                                    className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-semibold rounded-xl shadow-sm gap-1.5 shrink-0"
                                >
                                    <Zap className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                                    Upgrade Plan
                                </Button>
                            )}
                        </div>

                        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                            <span>Next Billing Date:</span>
                            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                                {renewalDate ? renewalDate : "No recurring charge"}
                            </span>
                        </div>
                    </div>

                    {/* Real Usage Summary Card */}
                    <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm flex flex-col justify-between space-y-5">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                                Live Workspace Usage
                            </p>
                            <span className="text-xs text-zinc-400 font-medium">Real-Time Data</span>
                        </div>

                        <div className="space-y-4">
                            {/* Real Usage Meter 1: Team Members */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                                        <Users className="h-3.5 w-3.5 text-zinc-500" /> Team Roster Members
                                    </span>
                                    <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                                        {realUsage.teamMembers} / {planLimits.teamMembers}
                                    </span>
                                </div>
                                <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-zinc-900 dark:bg-zinc-100 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min(100, (realUsage.teamMembers / planLimits.teamMembers) * 100)}%` }}
                                    />
                                </div>
                            </div>

                            {/* Real Usage Meter 2: Active Projects */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                                        <FolderKanban className="h-3.5 w-3.5 text-zinc-500" /> Workspace Projects
                                    </span>
                                    <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                                        {realUsage.projects} / {planLimits.projects}
                                    </span>
                                </div>
                                <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-amber-500 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min(100, (realUsage.projects / planLimits.projects) * 100)}%` }}
                                    />
                                </div>
                            </div>

                            {/* Real Usage Meter 3: Active Clients */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                                        <Briefcase className="h-3.5 w-3.5 text-zinc-500" /> Active Clients
                                    </span>
                                    <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                                        {realUsage.clients} / {planLimits.clients}
                                    </span>
                                </div>
                                <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min(100, (realUsage.clients / planLimits.clients) * 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        <p className="text-[11px] text-zinc-400 pt-1">
                            Calculated directly from your active workspace database records.
                        </p>
                    </div>
                </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* SECTION 2: AVAILABLE PLANS & PRICING TIER CARDS */}
            {/* ------------------------------------------------------------- */}
            <div className="space-y-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                            Available Subscription Plans
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                            Upgrade anytime to unlock higher project limits, team seats, and automated client billing.
                        </p>
                    </div>

                    {/* Monthly / Annual Toggle Switch */}
                    <div className="inline-flex items-center p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 self-start sm:self-auto">
                        <button
                            type="button"
                            onClick={() => setBillingCycle("monthly")}
                            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                                billingCycle === "monthly"
                                    ? "bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 shadow-sm"
                                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                            }`}
                        >
                            Monthly
                        </button>
                        <button
                            type="button"
                            onClick={() => setBillingCycle("yearly")}
                            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                                billingCycle === "yearly"
                                    ? "bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 shadow-sm"
                                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                            }`}
                        >
                            <span>Yearly</span>
                            <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 rounded-full">
                                Save 17%
                            </span>
                        </button>
                    </div>
                </div>

                {/* 3 Tier Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                    {/* Free Starter Tier */}
                    <div
                        className={`bg-white dark:bg-zinc-950 rounded-2xl border p-6 flex flex-col justify-between transition-all ${
                            currentTier === "free"
                                ? "border-zinc-900 dark:border-zinc-100 ring-2 ring-zinc-900/10 dark:ring-zinc-100/10 shadow-md"
                                : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm"
                        }`}
                    >
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                                    Starter
                                </span>
                                <Badge variant="outline" className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800">
                                    FREE
                                </Badge>
                            </div>

                            <div>
                                <h4 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{PLANS.free.name}</h4>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{PLANS.free.description}</p>
                            </div>

                            <div className="pt-2">
                                <span className="text-3xl font-black text-zinc-900 dark:text-zinc-100">$0</span>
                                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium"> / forever</span>
                            </div>

                            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2.5">
                                <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Included Features:</p>
                                {PLANS.free.features.map((feat, idx) => (
                                    <div key={idx} className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-300">
                                        <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                        <span>{feat}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-6 mt-6 border-t border-zinc-100 dark:border-zinc-800">
                            <Button
                                disabled
                                variant="outline"
                                className="w-full text-xs font-bold border-zinc-200 dark:border-zinc-800 text-zinc-500"
                            >
                                {currentTier === "free" ? "Active Plan" : "Free Starter"}
                            </Button>
                        </div>
                    </div>

                    {/* Pro Tier (Featured) */}
                    <div
                        className={`bg-zinc-950 text-white rounded-2xl border p-6 flex flex-col justify-between relative shadow-xl ${
                            currentTier === "pro"
                                ? "border-amber-400 ring-2 ring-amber-400/40"
                                : "border-zinc-800 hover:border-zinc-700"
                        }`}
                    >
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-zinc-950 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                            <Sparkles className="h-3 w-3 fill-zinc-950 text-zinc-950" /> Most Popular
                        </div>

                        <div className="space-y-4 pt-1">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                                    Growth Plan
                                </span>
                                <Badge className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-extrabold">
                                    PRO
                                </Badge>
                            </div>

                            <div>
                                <h4 className="text-xl font-bold text-white">{PLANS.pro.name}</h4>
                                <p className="text-xs text-zinc-400 mt-1">{PLANS.pro.description}</p>
                            </div>

                            <div className="pt-2">
                                <span className="text-3xl font-black text-white">
                                    ${billingCycle === "yearly" ? "190" : "19"}
                                </span>
                                <span className="text-xs text-zinc-400 font-medium">
                                    {" "}
                                    / {billingCycle === "yearly" ? "year ($15.8/mo)" : "month"}
                                </span>
                            </div>

                            <div className="pt-4 border-t border-zinc-800 space-y-2.5">
                                <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide">
                                    Everything in Starter, plus:
                                </p>
                                {PLANS.pro.features.map((feat, idx) => (
                                    <div key={idx} className="flex items-start gap-2 text-xs text-zinc-200">
                                        <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                                        <span>{feat}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-6 mt-6 border-t border-zinc-800">
                            <Button
                                onClick={() => handleUpgrade("pro")}
                                disabled={isPending || currentTier === "pro"}
                                className={`w-full text-xs font-extrabold gap-1.5 ${
                                    currentTier === "pro"
                                        ? "bg-zinc-800 text-zinc-400 cursor-default"
                                        : "bg-white text-zinc-950 hover:bg-zinc-100"
                                }`}
                            >
                                {isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Zap className="h-4 w-4 text-amber-500 fill-amber-500" />
                                )}
                                {currentTier === "pro" ? "Current Active Plan" : "Upgrade to Pro"}
                            </Button>
                        </div>
                    </div>

                    {/* Studio Tier */}
                    <div
                        className={`bg-white dark:bg-zinc-950 rounded-2xl border p-6 flex flex-col justify-between transition-all ${
                            currentTier === "studio"
                                ? "border-zinc-900 dark:border-zinc-100 ring-2 ring-zinc-900/10 shadow-md"
                                : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm"
                        }`}
                    >
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                                    Enterprise Plan
                                </span>
                                <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-none text-[10px] font-bold">
                                    ADVANCED
                                </Badge>
                            </div>

                            <div>
                                <h4 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{PLANS.studio.name}</h4>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{PLANS.studio.description}</p>
                            </div>

                            <div className="pt-2">
                                <span className="text-3xl font-black text-zinc-900 dark:text-zinc-100">
                                    ${billingCycle === "yearly" ? "490" : "49"}
                                </span>
                                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                                    {" "}
                                    / {billingCycle === "yearly" ? "year ($40.8/mo)" : "month"}
                                </span>
                            </div>

                            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2.5">
                                <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                                    Everything in Pro, plus:
                                </p>
                                {PLANS.studio.features.map((feat, idx) => (
                                    <div key={idx} className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-300">
                                        <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                        <span>{feat}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-6 mt-6 border-t border-zinc-100 dark:border-zinc-800">
                            <Button
                                onClick={() => handleUpgrade("studio")}
                                disabled={isPending || currentTier === "studio"}
                                className={`w-full text-xs font-bold gap-1.5 ${
                                    currentTier === "studio"
                                        ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-500 cursor-default"
                                        : "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
                                }`}
                            >
                                {isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Building2 className="h-4 w-4 text-zinc-400" />
                                )}
                                {currentTier === "studio" ? "Current Active Plan" : "Upgrade to Studio"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* SECTION 3: SUBSCRIPTION BILLING HISTORY */}
            {/* ------------------------------------------------------------- */}
            <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                            <Receipt className="h-4 w-4 text-zinc-500" />
                            Billing Receipts
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            Subscription invoices and payment records for this workspace.
                        </p>
                    </div>

                    {billingInfo?.customerId && (
                        <Button
                            onClick={handleManagePortal}
                            variant="ghost"
                            size="sm"
                            className="text-xs h-8 gap-1.5 text-zinc-600 dark:text-zinc-400"
                        >
                            <Download className="h-3.5 w-3.5" />
                            Download Official Receipts
                        </Button>
                    )}
                </div>

                <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 text-center shadow-sm">
                    <Receipt className="h-8 w-8 text-zinc-400 mx-auto mb-2 opacity-60" />
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                        {billingInfo?.customerId ? "Subscription Invoices Ready" : "No Paid Billing Receipts Yet"}
                    </p>
                    <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
                        {billingInfo?.customerId
                            ? "Click above to view your official merchant portal receipts and download PDF invoices."
                            : "When you upgrade to a paid Pro or Studio plan, your subscription billing receipts will be recorded here."}
                    </p>
                </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* SECTION 4: DEV SANDBOX SIMULATION BAR */}
            {/* ------------------------------------------------------------- */}
            {/* <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-zinc-600 dark:text-zinc-400">
                <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono font-bold text-[10px] rounded">
                        DEV SANDBOX
                    </span>
                    <span>Test plan upgrades and feature gates locally:</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleSimulateDevUpgrade("free")}
                        disabled={isPending}
                        className="px-2.5 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded text-zinc-800 dark:text-zinc-200 font-medium text-[11px]"
                    >
                        Simulate Free
                    </button>
                    <button
                        onClick={() => handleSimulateDevUpgrade("pro")}
                        disabled={isPending}
                        className="px-2.5 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded text-zinc-800 dark:text-zinc-200 font-medium text-[11px]"
                    >
                        Simulate Pro
                    </button>
                    <button
                        onClick={() => handleSimulateDevUpgrade("studio")}
                        disabled={isPending}
                        className="px-2.5 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded text-zinc-800 dark:text-zinc-200 font-medium text-[11px]"
                    >
                        Simulate Studio
                    </button>
                </div>
            </div> */}
        </div>
    );
}
