"use client";

import React from "react";
import Link from "next/link";
import { Lock, Sparkles, Zap, Building2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProFeatureLockProps {
  requiredTier?: "pro" | "studio";
  featureName: string;
  description?: string;
  isLocked: boolean;
  workspaceId?: string;
  children: React.ReactNode;
}

export function ProFeatureLock({
  requiredTier = "pro",
  featureName,
  description = "Upgrade your workspace plan to unlock this premium feature and scale your freelance operations.",
  isLocked,
  workspaceId,
  children,
}: ProFeatureLockProps) {
  if (!isLocked) {
    return <>{children}</>;
  }

  const isStudio = requiredTier === "studio";

  return (
    <div className="relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 group">
      {/* Blurred background preview of the locked feature */}
      <div className="pointer-events-none select-none blur-sm opacity-40 grayscale-[30%] aria-hidden">
        {children}
      </div>

      {/* Overlay backdrop */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/90 to-white dark:from-zinc-950/70 dark:via-zinc-950/90 dark:to-zinc-950 flex flex-col items-center justify-center p-6 text-center z-10">
        <div className="max-w-md mx-auto space-y-4 flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
          {/* Badge & Lock Icon */}
          <div className="relative">
            <div className="h-12 w-12 rounded-2xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 flex items-center justify-center shadow-lg">
              <Lock className="h-5 w-5" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-center gap-2 mb-1.5">
              <Badge
                variant="outline"
                className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 ${
                  isStudio
                    ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800"
                    : "bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-800"
                }`}
              >
                {isStudio ? "Studio Feature" : "Pro Feature"}
              </Badge>
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              {featureName} is Locked
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 max-w-sm leading-relaxed">
              {description}
            </p>
          </div>

          {/* Quick Perks Pill */}
          <div className="bg-zinc-100 dark:bg-zinc-900/80 rounded-xl p-3 text-left w-full text-xs space-y-1.5 border border-zinc-200/80 dark:border-zinc-800">
            <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-medium">
              <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                {isStudio ? "Unlimited clients, projects & 5 team seats" : "Unlimited active clients & projects"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-medium">
              <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Full revenue analytics, custom branding & CSV export</span>
            </div>
          </div>

          {/* Upgrade CTA */}
          <Link
            href={workspaceId ? `/${workspaceId}/settings?tab=billing` : "/settings?tab=billing"}
            className="w-full sm:w-auto"
          >
            <Button className="w-full sm:w-auto bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 text-xs font-semibold px-6 h-10 rounded-xl shadow-md gap-2">
              {isStudio ? (
                <Building2 className="h-4 w-4" />
              ) : (
                <Zap className="h-4 w-4 fill-current" />
              )}
              Upgrade to {isStudio ? "Studio" : "Pro"} Plan
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
