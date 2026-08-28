"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Loader2, Building2, Sparkles } from "lucide-react";
import { PLANS, PlanTier, BillingCycle } from "@/lib/payments";

interface PlanCardProps {
  tier: PlanTier;
  billingCycle: BillingCycle;
  currentTier: PlanTier;
  isPending: boolean;
  onUpgrade: (tier: "pro" | "studio") => void;
}

export function PlanCard({ tier, billingCycle, currentTier, isPending, onUpgrade }: PlanCardProps) {
  const isActive = currentTier === tier;

  if (tier === "pro") {
    const price = billingCycle === "yearly" ? "$190" : "$19";
    const period = billingCycle === "yearly" ? "year ($15.8/mo)" : "month";

    return (
      <div
        className={`bg-zinc-950 text-white rounded-2xl border p-6 flex flex-col justify-between relative shadow-xl ${
          isActive ? "border-amber-400 ring-2 ring-amber-400/40" : "border-zinc-800 hover:border-zinc-700"
        }`}
      >
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-zinc-950 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full shadow-md flex items-center gap-1">
          <Sparkles className="h-3 w-3 fill-zinc-950 text-zinc-950" /> Most Popular
        </div>

        <div className="space-y-4 pt-1">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Growth Plan</span>
            <Badge className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-extrabold">PRO</Badge>
          </div>
          <div>
            <h4 className="text-xl font-bold text-white">{PLANS.pro.name}</h4>
            <p className="text-xs text-zinc-400 mt-1">{PLANS.pro.description}</p>
          </div>
          <div className="pt-2">
            <span className="text-3xl font-black text-white">{price}</span>
            <span className="text-xs text-zinc-400 font-medium"> / {period}</span>
          </div>
          <div className="pt-4 border-t border-zinc-800 space-y-2.5">
            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide">Everything in Starter, plus:</p>
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
            onClick={() => onUpgrade("pro")}
            disabled={isPending || isActive}
            className={`w-full text-xs font-extrabold gap-1.5 ${
              isActive ? "bg-zinc-800 text-zinc-400 cursor-default" : "bg-white text-zinc-950 hover:bg-zinc-100"
            }`}
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4 text-amber-500 fill-amber-500" />}
            {isActive ? "Current Active Plan" : "Upgrade to Pro"}
          </Button>
        </div>
      </div>
    );
  }

  if (tier === "studio") {
    const price = billingCycle === "yearly" ? "$490" : "$49";
    const period = billingCycle === "yearly" ? "year ($40.8/mo)" : "month";

    return (
      <div
        className={`bg-white dark:bg-zinc-950 rounded-2xl border p-6 flex flex-col justify-between transition-all ${
          isActive
            ? "border-zinc-900 dark:border-zinc-100 ring-2 ring-zinc-900/10 shadow-md"
            : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm"
        }`}
      >
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Enterprise Plan</span>
            <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-none text-[10px] font-bold">
              ADVANCED
            </Badge>
          </div>
          <div>
            <h4 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{PLANS.studio.name}</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{PLANS.studio.description}</p>
          </div>
          <div className="pt-2">
            <span className="text-3xl font-black text-zinc-900 dark:text-zinc-100">{price}</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium"> / {period}</span>
          </div>
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2.5">
            <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Everything in Pro, plus:</p>
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
            onClick={() => onUpgrade("studio")}
            disabled={isPending || isActive}
            className={`w-full text-xs font-bold gap-1.5 ${
              isActive ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-500 cursor-default" : "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
            }`}
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Building2 className="h-4 w-4 text-zinc-400" />}
            {isActive ? "Current Active Plan" : "Upgrade to Studio"}
          </Button>
        </div>
      </div>
    );
  }

  // Free tier
  return (
    <div
      className={`bg-white dark:bg-zinc-950 rounded-2xl border p-6 flex flex-col justify-between transition-all ${
        isActive
          ? "border-zinc-900 dark:border-zinc-100 ring-2 ring-zinc-900/10 dark:ring-zinc-100/10 shadow-md"
          : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm"
      }`}
    >
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Starter</span>
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
        <Button disabled variant="outline" className="w-full text-xs font-bold border-zinc-200 dark:border-zinc-800 text-zinc-500">
          {isActive ? "Active Plan" : "Free Starter"}
        </Button>
      </div>
    </div>
  );
}
