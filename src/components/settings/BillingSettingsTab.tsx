"use client";

import React, { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
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
    Eye,
    Filter,
    Search,
    Plus,
    CheckCircle2,
    XCircle,
    Clock,
    FileText,
    ArrowUpRight
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

    // Search and filter state for Billing History
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "processing" | "failed">("all");

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
            <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-12 flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 text-zinc-500 animate-spin mb-3" />
                <p className="text-zinc-500 dark:text-zinc-400 text-sm">Loading billing & subscription details...</p>
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

    // Simulated usage statistics for display
    const usageData = {
        teamMembers: { used: currentTier === "free" ? 1 : currentTier === "pro" ? 3 : 8, limit: currentTier === "free" ? 1 : currentTier === "pro" ? 5 : 20 },
        activeProjects: { used: currentTier === "free" ? 3 : currentTier === "pro" ? 14 : 42, limit: currentTier === "free" ? 5 : currentTier === "pro" ? 25 : 100 },
        monthlyInvoices: { used: currentTier === "free" ? 4 : currentTier === "pro" ? 18 : 65, limit: currentTier === "free" ? 10 : currentTier === "pro" ? 50 : 250 },
    };

    // Simulated billing history records
    const mockBillingHistory = [
        { id: "inv-001", date: "Feb 01, 2026", description: `${PLANS[currentTier]?.name || "Pro Plan"} - Monthly`, amount: currentTier === "studio" ? "$49.00" : currentTier === "pro" ? "$19.00" : "$0.00", status: "paid" },
        { id: "inv-002", date: "Jan 01, 2026", description: `${PLANS[currentTier]?.name || "Pro Plan"} - Monthly`, amount: currentTier === "studio" ? "$49.00" : currentTier === "pro" ? "$19.00" : "$0.00", status: "paid" },
        { id: "inv-003", date: "Dec 01, 2025", description: "Starter Plan - Monthly", amount: "$0.00", status: "paid" },
    ];

    const filteredHistory = mockBillingHistory.filter(item => {
        const matchesSearch = item.description.toLowerCase().includes(searchQuery.toLowerCase()) || item.date.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || item.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-10 pb-16 max-w-6xl">
            {/* Header Description */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
                        <CreditCard className="h-6 w-6 text-zinc-700 dark:text-zinc-300" />
                        Billing & Subscription
                    </h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                        Manage your subscription, view payment history, and update your billing details — all in one place.
                    </p>
                </div>

                {billingInfo?.customerId && (
                    <Button
                        onClick={handleManagePortal}
                        disabled={isPending}
                        variant="outline"
                        className="gap-2 text-xs font-semibold shrink-0"
                    >
                        <CreditCard className="h-4 w-4" />
                        Manage Payment Portal
                        <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
                    </Button>
                )}
            </div>

            {/* Notification Banners */}
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
            {/* SECTION 1: SUBSCRIPTION OVERVIEW & USAGE SUMMARY */}
            {/* ------------------------------------------------------------- */}
            <div className="space-y-4">
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    Subscription Overview
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Current Plan Card */}
                    <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm flex flex-col justify-between space-y-6">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                                    Current Plan
                                </p>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-full capitalize">
                                        {PLANS[currentTier]?.name || "Free Starter"}
                                    </span>
                                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-full capitalize">
                                        {subscriptionStatus}
                                    </span>
                                </div>
                                <div className="mt-3">
                                    <span className="text-3xl font-black text-zinc-900 dark:text-zinc-100">
                                        {currentTier === "free" ? "$0" : currentTier === "pro" ? "$19" : "$49"}
                                    </span>
                                    <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium"> / Month</span>
                                </div>
                            </div>

                            {currentTier !== "studio" && (
                                <button
                                    onClick={() => handleUpgrade("pro")}
                                    disabled={isPending}
                                    className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 shrink-0"
                                >
                                    <Zap className="h-3.5 w-3.5 text-amber-400" />
                                    Upgrade Plan 🚀
                                </button>
                            )}
                        </div>

                        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                            <span>Next Billing Date:</span>
                            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                                {renewalDate ? renewalDate : "No recurring charge"}
                            </span>
                        </div>
                    </div>

                    {/* Usage Summary Card */}
                    <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm flex flex-col justify-between space-y-5">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                                Usage Summary
                            </p>
                            <span className="text-xs text-zinc-400">Current Billing Cycle</span>
                        </div>

                        <div className="space-y-4">
                            {/* Usage Meter 1: Active Team Members */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">Team Seats</span>
                                    <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                                        {usageData.teamMembers.used} / {usageData.teamMembers.limit}
                                    </span>
                                </div>
                                <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-zinc-900 dark:bg-zinc-100 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min(100, (usageData.teamMembers.used / usageData.teamMembers.limit) * 100)}%` }}
                                    />
                                </div>
                            </div>

                            {/* Usage Meter 2: Monthly Invoices */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">Monthly Invoices</span>
                                    <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                                        {usageData.monthlyInvoices.used} / {usageData.monthlyInvoices.limit}
                                    </span>
                                </div>
                                <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-amber-500 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min(100, (usageData.monthlyInvoices.used / usageData.monthlyInvoices.limit) * 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        <p className="text-[11px] text-zinc-400 pt-1">
                            Limits reset automatically on your next renewal date.
                        </p>
                    </div>
                </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* SECTION 2: SUBSCRIPTION PLAN TIER SELECTION */}
            {/* ------------------------------------------------------------- */}
            <div className="space-y-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                            Available Plans & Pricing
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                            Choose the best tier to scale your studio, manage clients, and issue invoices.
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
                    {/* Starter / Free Card */}
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
                                    Starter Plan
                                </span>
                                <span className="px-2 py-0.5 text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-full">
                                    FREE
                                </span>
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
                            <button
                                disabled={currentTier === "free"}
                                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold border border-zinc-200 dark:border-zinc-800 text-zinc-500 bg-zinc-50 dark:bg-zinc-900/50 cursor-default"
                            >
                                {currentTier === "free" ? "Current Active Plan" : "Starter Plan"}
                            </button>
                        </div>
                    </div>

                    {/* Pro / Growth Card (Featured Dark Sleek Style) */}
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
                                <span className="px-2 py-0.5 text-[10px] font-extrabold bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full">
                                    PRO
                                </span>
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
                            <button
                                onClick={() => handleUpgrade("pro")}
                                disabled={isPending || currentTier === "pro"}
                                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                                    currentTier === "pro"
                                        ? "bg-zinc-800 text-zinc-400 cursor-default"
                                        : "bg-white text-zinc-950 hover:bg-zinc-100 shadow-md font-extrabold"
                                } disabled:opacity-50`}
                            >
                                {isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Zap className="h-4 w-4 text-amber-500 fill-amber-500" />
                                )}
                                {currentTier === "pro" ? "Current Active Plan" : "Upgrade Plan"}
                            </button>
                        </div>
                    </div>

                    {/* Studio / Enterprise Card */}
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
                                <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-full">
                                    ADVANCED
                                </span>
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
                            <button
                                onClick={() => handleUpgrade("studio")}
                                disabled={isPending || currentTier === "studio"}
                                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                                    currentTier === "studio"
                                        ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-500 cursor-default"
                                        : "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 shadow-md"
                                } disabled:opacity-50`}
                            >
                                {isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Building2 className="h-4 w-4 text-zinc-400" />
                                )}
                                {currentTier === "studio" ? "Current Active Plan" : "Upgrade to Studio"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* SECTION 3: BILLING HISTORY TABLE */}
            {/* ------------------------------------------------------------- */}
            <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                            Billing History
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            Download past receipts and view subscription invoices.
                        </p>
                    </div>

                    {/* Table Filters & Search */}
                    <div className="flex items-center gap-2.5 flex-wrap">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                            <input
                                type="text"
                                placeholder="Search history..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 pr-3 h-8 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-400"
                            />
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="h-8 text-xs px-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-700 dark:text-zinc-300 focus:outline-none"
                        >
                            <option value="all">All Statuses</option>
                            <option value="paid">Paid</option>
                            <option value="processing">Processing</option>
                            <option value="failed">Failed</option>
                        </select>
                    </div>
                </div>

                {/* History Table */}
                <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/50 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                                    <th className="py-3 px-4">Date</th>
                                    <th className="py-3 px-4">Description</th>
                                    <th className="py-3 px-4">Amount</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80 text-xs">
                                {filteredHistory.map((item) => (
                                    <tr key={item.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-900/30 transition-colors">
                                        <td className="py-3.5 px-4 font-medium text-zinc-900 dark:text-zinc-100">
                                            {item.date}
                                        </td>
                                        <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-300">
                                            {item.description}
                                        </td>
                                        <td className="py-3.5 px-4 font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                                            {item.amount}
                                        </td>
                                        <td className="py-3.5 px-4">
                                            {item.status === "paid" && (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                                    <span className="size-1.5 rounded-full bg-emerald-500" />
                                                    Paid
                                                </span>
                                            )}
                                            {item.status === "processing" && (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                                    <span className="size-1.5 rounded-full bg-amber-500" />
                                                    Processing
                                                </span>
                                            )}
                                            {item.status === "failed" && (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
                                                    <span className="size-1.5 rounded-full bg-red-500" />
                                                    Failed
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-4 text-right">
                                            {billingInfo?.customerId ? (
                                                <button
                                                    onClick={handleManagePortal}
                                                    className="inline-flex items-center gap-1 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white font-medium hover:underline"
                                                >
                                                    <Download className="h-3.5 w-3.5 text-zinc-400" />
                                                    Download Invoice
                                                </button>
                                            ) : (
                                                <span className="text-zinc-400 text-[11px]">Free Receipt</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* SECTION 4: PAYMENT METHOD CARD UI */}
            {/* ------------------------------------------------------------- */}
            <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    Payment Method
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Realistic Credit Card Visual UI (Matching Reference Screenshot 1) */}
                    <div className="relative h-48 rounded-2xl p-6 bg-gradient-to-tr from-zinc-900 via-zinc-800 to-zinc-700 text-white shadow-xl flex flex-col justify-between overflow-hidden group">
                        {/* Decorative background glow & pattern */}
                        <div className="absolute -right-10 -bottom-10 size-48 bg-amber-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />
                        <div className="absolute top-0 right-0 p-6 opacity-20 font-mono text-xs tracking-widest uppercase">
                            IMPRY OS
                        </div>

                        {/* Top Bar with Brand / Card Type */}
                        <div className="flex justify-between items-center relative z-10">
                            <span className="font-extrabold tracking-wider text-xl italic font-serif">
                                VISA
                            </span>
                            <span className="px-2 py-0.5 bg-white/10 text-white/80 rounded-full text-[10px] font-mono">
                                PRIMARY
                            </span>
                        </div>

                        {/* Card Number */}
                        <div className="relative z-10">
                            <p className="font-mono text-lg tracking-widest font-semibold text-zinc-100">
                                1520 •••• •••• 6888
                            </p>
                        </div>

                        {/* Card Details Bottom Row */}
                        <div className="flex justify-between items-end relative z-10 text-xs">
                            <div>
                                <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Card Holder</p>
                                <p className="font-semibold text-white tracking-wide">Studio Account Owner</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Valid Thru</p>
                                <p className="font-mono font-semibold text-white">08/28</p>
                            </div>
                        </div>
                    </div>

                    {/* Add New Card / Manage Portal Box */}
                    <button
                        onClick={handleManagePortal}
                        disabled={isPending}
                        className="h-48 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/30 flex flex-col items-center justify-center gap-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors p-6 text-center"
                    >
                        <div className="size-10 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shadow-sm">
                            <Plus className="h-5 w-5 text-zinc-600 dark:text-zinc-300" />
                        </div>
                        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                            {billingInfo?.customerId ? "Update Payment Method" : "Add New Payment Method"}
                        </span>
                        <span className="text-[11px] text-zinc-400 max-w-xs">
                            Securely powered by Merchant of Record (Dodo / Polar) with PCI-DSS compliance.
                        </span>
                    </button>
                </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* SECTION 5: DEVELOPER & TEST SANDBOX BAR */}
            {/* ------------------------------------------------------------- */}
            <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-zinc-600 dark:text-zinc-400">
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
            </div>
        </div>
    );
}
