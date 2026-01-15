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

export default async function DashboardPage() {
    // Fetch all dashboard data in parallel
    const [metricsRes, remindersRes, risksRes] = await Promise.all([
        fetchDashboardMetrics(),
        fetchDashboardReminders(),
        fetchAtRiskProjects()
    ]);

    // Map Metrics (snake_case from DB -> camelCase for UI)
    const rawMetrics = metricsRes.success && metricsRes.data ? metricsRes.data : null;
    const metrics = {
        totalRevenue: rawMetrics?.monthly_revenue || 0,
        totalRevenueChange: rawMetrics?.revenue_change_percent || 0,
        outstandingInvoicesAmount: rawMetrics?.pending_invoices_total || 0,
        outstandingInvoicesCount: rawMetrics?.pending_invoices_count || 0,
        activeProjectsCount: 0 // Not provided by this specific endpoint yet
    };

    // Derived state for metrics
    const revenueGoal = 50000;
    const revenueGoalPercent = (metrics.totalRevenue / revenueGoal) * 100;

    // Map Reminders
    const rawReminders = remindersRes.success && remindersRes.data ? remindersRes.data : [];
    const reminders: Reminder[] = rawReminders.map(r => ({
        id: r.id,
        title: r.title,
        description: r.description || '',
        dueDate: new Date(r.reminder_date).toLocaleDateString() === new Date().toLocaleDateString() ? "Today" : new Date(r.reminder_date).toLocaleDateString(),
        type: r.reminder_type as any, // Cast to 'payment' | 'deadline' | 'follow_up'
        clientName: r.client_name || 'Unknown Client',
        clientEmail: r.client_email || undefined,
        clientId: r.client_id || undefined,
        projectName: r.project_name || 'General',
        overdue: r.overdue
    }));

    // Map Risks
    const rawRisks = risksRes.success && risksRes.data ? risksRes.data : [];
    const risks: Risk[] = rawRisks.map(r => ({
        id: r.id,
        projectName: r.name,
        clientName: r.client_name || 'Unknown',
        type: r.risk_type,
        // Map metadata to string representation for UI
        metadata: r.risk_metadata.days_overdue
            ? `${r.risk_metadata.days_overdue} days overdue • $${r.risk_metadata.amount || 0}`
            : `Last contact ${r.risk_metadata.last_contact_days} days ago`,
        badgeLabel: r.risk_type === 'payment' ? 'Payment Risk' : 'Ghosting Risk',
        actionLabel: r.risk_type === 'payment' ? 'Send Reminder' : 'Follow Up',
        progress: undefined // Optional in Risk type
    }));

    return (
        <div className="flex flex-col items-center py-8 px-4 lg:px-8 w-full max-w-[1600px] mx-auto">
            <div className="w-full flex flex-col gap-10">

                {/* Custom Page Header */}
                <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Good morning, Alex</h1>
                        <p className="text-zinc-500 text-base">
                            You have <span className="font-bold text-zinc-900">{reminders.length} items</span> requiring attention today.
                            {metrics.totalRevenueChange >= 0 ? ' Revenue looks stable.' : ' Revenue is slightly down.'}
                        </p>
                    </div>
                    <div className="w-full lg:w-auto">
                        <QuickActions />
                    </div>
                </div>

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
                        <div className="bg-zinc-950 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden group">
                            <div className="flex flex-col items-center text-center">
                                <div className="bg-white/10 p-3 rounded-full mb-4">
                                    <Lightbulb className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="font-bold text-lg mb-2">Pro Tip</h3>
                                <p className="text-zinc-400 text-sm leading-relaxed">
                                    Sending a polite "Project Update" email often prompts clients to pay overdue invoices faster than a direct payment reminder.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
