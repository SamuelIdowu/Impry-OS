"use client";

import React, { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  CreditCard,
  ExternalLink,
  Loader2,
  AlertCircle,
  Download,
  Users,
  FolderKanban,
  Briefcase,
  Receipt,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  getWorkspaceBillingInfo,
  createSubscriptionCheckout,
  getBillingPortalUrl,
  getWorkspaceInvoices,
  getInvoicePdfDownloadUrl,
  type BillingInvoice,
} from "@/server/actions/billing";
import { PlanTier, BillingCycle } from "@/lib/payments";
import { PlanCard } from "@/components/settings/PlanCard";

interface BillingSettingsTabProps {
  workspaceId: string;
}

export function BillingSettingsTab({ workspaceId }: BillingSettingsTabProps) {
  const [billingInfo, setBillingInfo] = useState<any>(null);
  const [invoices, setInvoices] = useState<BillingInvoice[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchBilling = async () => {
    try {
      setIsLoading(true);
      const [info, invoiceList] = await Promise.all([
        getWorkspaceBillingInfo(workspaceId),
        getWorkspaceInvoices(workspaceId),
      ]);
      setBillingInfo(info);
      setInvoices(invoiceList);
    } catch (err: any) {
      setActionError(err.message || "Failed to load billing information.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPdf = async (transactionId: string) => {
    try {
      setDownloadingInvoiceId(transactionId);
      const url = await getInvoicePdfDownloadUrl(transactionId);
      if (url) {
        window.open(url, "_blank");
      } else {
        setActionError("PDF invoice could not be generated yet.");
      }
    } catch {
      setActionError("Failed to download PDF invoice.");
    } finally {
      setDownloadingInvoiceId(null);
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
    ? new Date(billingInfo.currentPeriodEnd).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;

  const realUsage = billingInfo?.usage || { teamMembers: 0, projects: 0, clients: 0 };
  const planLimits = {
    free: { teamMembers: 1, projects: 3, clients: 5 },
    pro: { teamMembers: 5, projects: 25, clients: 50 },
    studio: { teamMembers: 20, projects: 100, clients: 200 },
  }[currentTier];

  return (
    <div className="space-y-8 pb-16 max-w-5xl">
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
          <Button onClick={handleManagePortal} disabled={isPending} variant="outline" className="gap-2 text-xs font-medium shrink-0 border-zinc-200 dark:border-zinc-800">
            <CreditCard className="h-4 w-4 text-zinc-500" />
            Manage Subscription & Receipts
            <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
          </Button>
        )}
      </div>

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

      {/* Subscription Overview */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Subscription Overview</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm flex flex-col justify-between space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Current Workspace Tier</p>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="default" className="bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold text-xs capitalize py-1">
                    {billingInfo?.planConfig?.name || (currentTier === "free" ? "Free Starter" : currentTier === "pro" ? "Freelancer Pro" : "Studio & Agency")}
                  </Badge>
                  <Badge variant="outline" className="text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 font-medium text-xs capitalize py-1">
                    {subscriptionStatus}
                  </Badge>
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-black text-zinc-900 dark:text-zinc-100">
                    {currentTier === "free" ? "$0" : currentTier === "pro" ? "$19" : "$49"}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                    {currentTier === "free" ? " / Free forever" : " / month"}
                  </span>
                </div>
              </div>
              {currentTier !== "studio" && (
                <Button
                  onClick={() => handleUpgrade(currentTier === "pro" ? "studio" : "pro")}
                  disabled={isPending}
                  className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-semibold rounded-xl shadow-sm gap-1.5 shrink-0"
                >
                  {currentTier === "pro" ? "Upgrade to Studio" : "Upgrade Plan"}
                </Button>
              )}
            </div>
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <span>Next Billing Date:</span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">{renewalDate ?? "No recurring charge"}</span>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm flex flex-col justify-between space-y-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Live Workspace Usage</p>
              <span className="text-xs text-zinc-400 font-medium">Real-Time Data</span>
            </div>
            <div className="space-y-4">
              {[
                { label: "Team Roster Members", icon: Users, used: realUsage.teamMembers, limit: planLimits.teamMembers, color: "bg-zinc-900 dark:bg-zinc-100" },
                { label: "Workspace Projects", icon: FolderKanban, used: realUsage.projects, limit: planLimits.projects, color: "bg-amber-500" },
                { label: "Active Clients", icon: Briefcase, used: realUsage.clients, limit: planLimits.clients, color: "bg-blue-500" },
              ].map(({ label, icon: Icon, used, limit, color }) => (
                <div key={label} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                      <Icon className="h-3.5 w-3.5 text-zinc-500" /> {label}
                    </span>
                    <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{used} / {limit}</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${Math.min(100, (used / limit) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-zinc-400 pt-1">Calculated directly from your active workspace database records.</p>
          </div>
        </div>
      </div>

      {/* Available Plans */}
      <div className="space-y-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Available Subscription Plans</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Upgrade anytime to unlock higher project limits, team seats, and automated client billing.
            </p>
          </div>
          <div className="inline-flex items-center p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                billingCycle === "monthly" ? "bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 shadow-sm" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("yearly")}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                billingCycle === "yearly" ? "bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 shadow-sm" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              <span>Yearly</span>
              <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 rounded-full">Save 17%</span>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <PlanCard tier="free" billingCycle={billingCycle} currentTier={currentTier} isPending={isPending} onUpgrade={handleUpgrade} />
          <PlanCard tier="pro" billingCycle={billingCycle} currentTier={currentTier} isPending={isPending} onUpgrade={handleUpgrade} />
          <PlanCard tier="studio" billingCycle={billingCycle} currentTier={currentTier} isPending={isPending} onUpgrade={handleUpgrade} />
        </div>
      </div>

      {/* Billing Receipts */}
      <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Receipt className="h-4 w-4 text-zinc-500" />
              Billing Receipts & Invoices
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Official tax invoices and payment records for this workspace.</p>
          </div>
          {billingInfo?.customerId && (
            <Button onClick={handleManagePortal} variant="outline" size="sm" className="text-xs h-8 gap-1.5 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800">
              <ExternalLink className="h-3.5 w-3.5" />
              Customer Portal
            </Button>
          )}
        </div>

        {invoices.length > 0 ? (
          <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-zinc-900/50 text-zinc-400 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Plan / Description</th>
                    <th className="py-3 px-4">Billing Date</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">PDF Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-medium">
                  {invoices
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((inv) => (
                      <tr key={inv.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-zinc-800 dark:text-zinc-200">
                          {inv.invoiceNumber}
                        </td>
                        <td className="py-3.5 px-4 text-zinc-700 dark:text-zinc-300 font-medium">
                          {inv.description}
                        </td>
                        <td className="py-3.5 px-4 text-zinc-500 dark:text-zinc-400">
                          {inv.date}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-zinc-900 dark:text-zinc-100">
                          {inv.amount}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 text-[10px] uppercase font-bold py-0.5 px-2">
                            {inv.status}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Button
                            onClick={() => handleDownloadPdf(inv.id)}
                            disabled={downloadingInvoiceId === inv.id}
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs gap-1.5 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                          >
                            {downloadingInvoiceId === inv.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Download className="h-3.5 w-3.5" />
                            )}
                            <span>Download PDF</span>
                          </Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {invoices.length > itemsPerPage && (
              <div className="px-4 py-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/30">
                <span>
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, invoices.length)} of {invoices.length} receipts
                </span>
                <div className="flex items-center gap-1.5">
                  <Button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs gap-1 border-zinc-200 dark:border-zinc-800"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    <span>Previous</span>
                  </Button>
                  <span className="px-2 font-medium text-zinc-700 dark:text-zinc-300">
                    Page {currentPage} of {Math.ceil(invoices.length / itemsPerPage)}
                  </span>
                  <Button
                    onClick={() => setCurrentPage((p) => Math.min(Math.ceil(invoices.length / itemsPerPage), p + 1))}
                    disabled={currentPage >= Math.ceil(invoices.length / itemsPerPage)}
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs gap-1 border-zinc-200 dark:border-zinc-800"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 text-center shadow-sm">
            <Receipt className="h-8 w-8 text-zinc-400 mx-auto mb-2 opacity-60" />
            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              No Paid Billing Receipts Yet
            </p>
            <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
              When you upgrade to a paid Pro or Studio plan, your subscription billing receipts and downloadable tax invoices will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
