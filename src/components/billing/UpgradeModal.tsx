"use client";

import React from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Check, AlertCircle, Sparkles, Building2 } from "lucide-react";
import { PlanTier } from "@/lib/payments";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  limitName?: string;
  currentCount?: number;
  maxAllowed?: number | "unlimited";
  targetTier?: PlanTier;
  workspaceId?: string;
}

export function UpgradeModal({
  isOpen,
  onClose,
  title = "Upgrade Required",
  description = "You have reached the maximum limit allowed on your current workspace plan.",
  limitName = "Resource",
  currentCount,
  maxAllowed,
  targetTier = "pro",
  workspaceId,
}: UpgradeModalProps) {
  const isStudio = targetTier === "studio";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl p-6 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 flex items-center justify-center shrink-0 shadow-sm">
              <Zap className="h-5 w-5 fill-current" />
            </div>
            <div>
              <Badge
                variant="outline"
                className="text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-800"
              >
                Plan Limit Reached
              </Badge>
              <DialogTitle className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                {title}
              </DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>

        {/* Current Usage Meter Pill */}
        {currentCount !== undefined && maxAllowed !== undefined && (
          <div className="p-3 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-1.5 text-xs">
            <div className="flex justify-between items-center font-medium text-zinc-700 dark:text-zinc-300">
              <span>{limitName} Usage:</span>
              <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                {currentCount} / {maxAllowed}
              </span>
            </div>
            <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-zinc-900 dark:bg-zinc-100 rounded-full w-full" />
            </div>
          </div>
        )}

        {/* Feature Benefits List */}
        <div className="py-2 space-y-2 text-xs">
          <p className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-zinc-900 dark:text-zinc-100" />
            Unlock with {isStudio ? "Studio" : "Pro"} Plan:
          </p>
          <ul className="space-y-1.5 text-zinc-600 dark:text-zinc-400">
            <li className="flex items-center gap-2">
              <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Unlimited Clients, Projects & Invoices</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Custom Hex Colors & Logo Branding</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Advanced Financial Analytics & PDF/CSV Export</span>
            </li>
          </ul>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="text-xs font-semibold h-10 rounded-xl border-zinc-200 dark:border-zinc-800"
          >
            Maybe Later
          </Button>

          <Link
            href={workspaceId ? `/${workspaceId}/settings?tab=billing` : "/settings?tab=billing"}
            className="w-full sm:w-auto"
            onClick={onClose}
          >
            <Button className="w-full sm:w-auto bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 text-xs font-semibold px-5 h-10 rounded-xl gap-1.5 shadow-md">
              <Zap className="h-3.5 w-3.5 text-white dark:text-zinc-900 fill-current" />
              Upgrade Workspace Plan
            </Button>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
