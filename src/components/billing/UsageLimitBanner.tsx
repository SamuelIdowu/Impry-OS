"use client";

import React from "react";
import Link from "next/link";
import { AlertCircle, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UsageLimitBannerProps {
  resourceName: string; // e.g. "Clients" or "Projects"
  currentCount: number;
  maxAllowed: number | "unlimited";
  workspaceId?: string;
}

export function UsageLimitBanner({
  resourceName,
  currentCount,
  maxAllowed,
  workspaceId,
}: UsageLimitBannerProps) {
  if (maxAllowed === "unlimited") {
    return null;
  }

  const isAtLimit = currentCount >= maxAllowed;
  const isNearLimit = currentCount >= maxAllowed - 1;

  if (!isNearLimit) {
    return null;
  }

  return (
    <div
      className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs mb-6 transition-all ${
        isAtLimit
          ? "bg-zinc-100 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
          : "bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <AlertCircle
          className={`h-4 w-4 shrink-0 ${
            isAtLimit ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-500"
          }`}
        />
        <div>
          <span className="font-bold">
            {isAtLimit
              ? `${resourceName} limit reached (${currentCount}/${maxAllowed})`
              : `Nearing ${resourceName.toLowerCase()} limit (${currentCount}/${maxAllowed} used)`}
          </span>
          <span className="ml-1 opacity-80">
            {isAtLimit
              ? `Free starter plan supports up to ${maxAllowed} active ${resourceName.toLowerCase()}. Upgrade to Pro for unlimited.`
              : `Upgrade to Pro to remove ${resourceName.toLowerCase()} caps.`}
          </span>
        </div>
      </div>

      <Link
        href={workspaceId ? `/${workspaceId}/settings?tab=billing` : "/settings?tab=billing"}
        className="shrink-0"
      >
        <Button
          size="sm"
          className="h-8 text-xs font-semibold px-3 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 gap-1 rounded-lg shadow-sm"
        >
          <Zap className="h-3 w-3 fill-current text-white dark:text-zinc-900" />
          Upgrade to Pro
          <ArrowRight className="h-3 w-3" />
        </Button>
      </Link>
    </div>
  );
}
