"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GeneralSettingsTab } from "@/components/settings/GeneralSettingsTab";
import { SecuritySettingsTab } from "@/components/settings/SecuritySettingsTab";
import { TeamSettingsTab } from "@/components/settings/TeamSettingsTab";
import { BillingSettingsTab } from "@/components/settings/BillingSettingsTab";

type SettingsTab = "general" | "security" | "billing" | "team";

interface SettingsFormProps {
  user: any;
  profile?: any;
  workspaceId?: string;
  workspacePlan?: string;
  workspaceStatus?: string;
}

export function SettingsForm({
  user,
  profile,
  workspaceId,
  workspacePlan = "free",
  workspaceStatus = "active",
}: SettingsFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlTab = searchParams?.get("tab") as SettingsTab | null;
  const [activeTab, setActiveTab] = React.useState<SettingsTab>(
    urlTab && ["general", "security", "billing", "team"].includes(urlTab)
      ? urlTab
      : "general",
  );

  React.useEffect(() => {
    if (urlTab && ["general", "security", "billing", "team"].includes(urlTab)) {
      setActiveTab(urlTab);
    }
  }, [urlTab]);

  const handleTabChange = (tab: SettingsTab) => {
    setActiveTab(tab);
    const targetUrl = workspaceId
      ? `/${workspaceId}/settings?tab=${tab}`
      : `/settings?tab=${tab}`;
    router.push(targetUrl);
  };

  const tabButtonClass = (isActive: boolean) =>
    `px-4 py-2.5 text-sm sm:text-base rounded-xl transition-all duration-150 shrink-0 font-medium ${
      isActive
        ? "bg-white text-zinc-900 shadow-sm border border-zinc-200/80"
        : "bg-transparent text-zinc-600 hover:text-zinc-900"
    }`;

  return (
    <div className="flex flex-col space-y-6 p-4 md:p-8 max-w-8xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Settings
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Manage your account preferences, team members, security, and billing subscriptions.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 w-fit max-w-full overflow-x-auto rounded-2xl border border-zinc-200 bg-zinc-100/80 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
        <button onClick={() => handleTabChange("general")} className={tabButtonClass(activeTab === "general")}>
          Account
        </button>
        <button onClick={() => handleTabChange("team")} className={tabButtonClass(activeTab === "team")}>
          Team Management
        </button>
        <button onClick={() => handleTabChange("billing")} className={tabButtonClass(activeTab === "billing")}>
          Billing & Subscription
        </button>
        <button onClick={() => handleTabChange("security")} className={tabButtonClass(activeTab === "security")}>
          Security
        </button>
      </div>

      <main className="flex-1 pt-2 w-full">
        {activeTab === "general" && (
          <GeneralSettingsTab
            user={user}
            profile={profile}
            workspacePlan={workspacePlan}
            workspaceStatus={workspaceStatus}
          />
        )}
        {activeTab === "security" && <SecuritySettingsTab user={user} />}
        {activeTab === "billing" && workspaceId && <BillingSettingsTab workspaceId={workspaceId} />}
        {activeTab === "team" && workspaceId && (
          <TeamSettingsTab workspaceId={workspaceId} currentUser={user} />
        )}
      </main>
    </div>
  );
}
