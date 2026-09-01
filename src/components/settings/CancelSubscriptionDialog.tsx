"use client";

import React, { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, AlertTriangle, Calendar, CheckCircle2, Loader2, ShieldAlert } from "lucide-react";
import { cancelWorkspaceSubscription } from "@/server/actions/billing";
import { PlanTier } from "@/lib/payments";

interface CancelSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  planTier: PlanTier;
  currentPeriodEnd?: Date | string | null;
  onCancelled: () => void;
}

export function CancelSubscriptionDialog({
  open,
  onOpenChange,
  workspaceId,
  planTier,
  currentPeriodEnd,
  onCancelled,
}: CancelSubscriptionDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [immediately, setImmediately] = useState<boolean>(false);

  const formattedPeriodEnd = currentPeriodEnd
    ? new Date(currentPeriodEnd).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const planName =
    planTier === "studio"
      ? "Studio & Agency"
      : planTier === "pro"
      ? "Freelancer Pro"
      : "Paid Plan";

  const handleCancel = () => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await cancelWorkspaceSubscription(workspaceId, immediately);
        if (result.success) {
          onCancelled();
          onOpenChange(false);
        } else {
          setError(result.message || "Failed to cancel subscription.");
        }
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred while canceling.");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-xl">
        <DialogHeader className="gap-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Cancel {planName}?
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                We're sorry to see you go. Here is what will happen to your workspace.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-2.5 text-red-700 dark:text-red-400 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4 py-2 text-xs">
          {/* Access duration banner */}
          <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
            <div className="flex items-start gap-2.5">
              <Calendar className="h-4 w-4 text-zinc-600 dark:text-zinc-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {immediately
                    ? "Immediate Cancellation"
                    : formattedPeriodEnd
                    ? `Access continues until ${formattedPeriodEnd}`
                    : "Access continues until end of billing cycle"}
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {immediately
                    ? "Your account will revert to the Free Starter plan right away."
                    : "You have already paid for this billing cycle. You'll retain full access to all features until your period concludes with no further renewals."}
                </p>
              </div>
            </div>
          </div>

          {/* Feature implications list */}
          <div className="space-y-2">
            <p className="font-semibold text-zinc-700 dark:text-zinc-300">
              When your plan ends:
            </p>
            <ul className="space-y-1.5 text-zinc-600 dark:text-zinc-400">
              <li className="flex items-start gap-2">
                <ShieldAlert className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span>Workspace limits will adjust to Free Starter limits (3 projects, 5 clients).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>All your existing project, client, and invoice records will remain safe.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>You can re-upgrade anytime to unlock full limits and studio tools.</span>
              </li>
            </ul>
          </div>

          {/* Cancellation timing choice */}
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer select-none text-zinc-600 dark:text-zinc-400">
              <input
                type="checkbox"
                checked={immediately}
                onChange={(e) => setImmediately(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-zinc-300 dark:border-zinc-700 text-red-600 focus:ring-red-500"
              />
              <span>Cancel immediately instead of at the end of the billing period</span>
            </label>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="text-xs font-semibold h-9 rounded-xl border-zinc-200 dark:border-zinc-800"
          >
            Keep Subscription
          </Button>
          <Button
            type="button"
            onClick={handleCancel}
            disabled={isPending}
            className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold h-9 rounded-xl gap-1.5 shadow-sm"
          >
            {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Confirm Cancellation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
