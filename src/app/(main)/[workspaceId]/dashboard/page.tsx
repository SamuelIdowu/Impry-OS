import React from "react"
import { Lightbulb } from "lucide-react"
import { DashboardMetrics } from "@/components/dashboard/dashboardMetrics"
import { FollowUpInbox } from "@/components/dashboard/followUpInbox"
import { AtRiskProjects } from "@/components/dashboard/atRiskProjects"
import { QuickActions } from "@/components/dashboard/quickActions"
import {
    fetchDashboardMetrics,
    fetchDashboardReminders,
    fetchAtRiskProjects
} from "@/server/actions/dashboard"
import { Reminder, Risk } from "@/lib/types"
import { getUser } from "@/lib/auth"

import { DashboardHeader } from "@/components/dashboard/dashboardHeader"

export default async function DashboardPage({ params }: { params: Promise<{ workspaceId: string }> }) {
    const resolvedParams = await params;
    const workspaceId = resolvedParams.workspaceId;
    const user = await getUser();
    // Fetch all dashboard data in parallel
    const [metricsRes, remindersRes, risksRes] = await Promise.all([
        fetchDashboardMetrics(workspaceId),
        fetchDashboardReminders(workspaceId),
        fetchAtRiskProjects(workspaceId)
    ]);

    // Map Metrics (snake_case from DB -> camelCase for UI)
    const rawMetrics = metricsRes.success && metricsRes.data ? metricsRes.data : null;
    const metrics = {
        totalRevenue: rawMetrics?.monthlyRevenue || 0,
        totalRevenueChange: rawMetrics?.revenueChangePercent || 0,
        outstandingInvoicesAmount: rawMetrics?.pendingInvoicesTotal || 0,
        outstandingInvoicesCount: rawMetrics?.pendingInvoicesCount || 0,
        activeProjectsCount: 0 // Not provided by this specific endpoint yet
    };

    // Derived state for metrics
    const revenueGoal = rawMetrics?.revenueGoal || 50000;
    const revenueGoalPercent = rawMetrics?.revenueGoalPercent || (metrics.totalRevenue / revenueGoal) * 100;

    // Map Reminders
    const rawReminders = remindersRes.success && remindersRes.data ? remindersRes.data : [];
    const reminders: Reminder[] = rawReminders.map(r => ({
        id: r.id,
        title: r.title,
        description: r.description || '',
        dueDate: new Date(r.reminderDate).toLocaleDateString() === new Date().toLocaleDateString() ? "Today" : new Date(r.reminderDate).toLocaleDateString(),
        type: r.reminderType as any, // Cast to 'payment' | 'deadline' | 'follow_up'
        clientName: r.clientName || 'Unknown Client',
        clientEmail: r.clientEmail || undefined,
        clientId: r.clientId || undefined,
        projectName: r.projectName || 'General',
        overdue: r.overdue
    }));

    // Map Risks
    const rawRisks = risksRes.success && risksRes.data ? risksRes.data : [];
    const risks: Risk[] = rawRisks.map(r => ({
        id: r.id,
        projectName: r.name,
        clientName: r.clientName || 'Unknown',
        type: r.riskType,
        // Map metadata to string representation for UI
        metadata: r.riskMetadata.daysOverdue
            ? `${r.riskMetadata.daysOverdue} days overdue • $${r.riskMetadata.amount || 0}`
            : `Last contact ${r.riskMetadata.lastContactDays} days ago`,
        badgeLabel: r.riskType === 'payment' ? 'Payment Risk' : 'Ghosting Risk',
        actionLabel: r.riskType === 'payment' ? 'Send Reminder' : 'Follow Up',
        progress: undefined // Optional in Risk type
    }));

    return (
        <div className="flex flex-col items-center pt-2 pb-8 px-4 lg:px-8 w-full max-w-[1600px] mx-auto">
            <div className="w-full flex flex-col gap-6">

                {/* Custom Page Header */}
                <DashboardHeader
                    userName={user?.name}
                    reminderCount={reminders.length}
                    revenueChangePercent={metrics.totalRevenueChange}
                    monthlyRevenue={metrics.totalRevenue}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Column */}
                    <div className="lg:col-span-2 flex flex-col gap-8">
                        <FollowUpInbox reminders={reminders} />

                        <DashboardMetrics
                            monthlyRevenue={metrics.totalRevenue}
                            revenueChangePercent={metrics.totalRevenueChange}
                            revenueGoal={revenueGoal}
                            revenueGoalPercent={revenueGoalPercent}
                            pendingInvoicesTotal={metrics.outstandingInvoicesAmount}
                            pendingInvoicesCount={metrics.outstandingInvoicesCount}
                        />
                    </div>

                    {/* Side Column */}
                    <div className="lg:col-span-1 flex flex-col gap-8">
                        <AtRiskProjects projects={risks} />

                        {/* Pro Tip Widget */}
                        <div className="bg-zinc-950 rounded-2xl p-6 text-white shadow-md relative overflow-hidden group border border-zinc-800">
                            <div className="flex items-start gap-4">
                                <div className="bg-white/10 p-2.5 rounded-xl shrink-0 text-amber-300">
                                    <Lightbulb className="h-5 w-5" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-bold text-sm text-white">Pro Tip</h3>
                                    <p className="text-zinc-400 text-xs leading-relaxed">
                                        Sending a polite "Project Update" email often prompts clients to pay overdue invoices faster than a direct payment reminder.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
