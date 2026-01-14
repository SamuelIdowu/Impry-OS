import React from "react"
import Link from "next/link"
import { ArrowLeft, Bell } from "lucide-react"
import { FollowUpInbox } from "@/components/dashboard/followUpInbox"
import { fetchDashboardReminders } from "@/server/actions/dashboard"
import { Reminder } from "@/lib/types"

export default async function FollowUpsPage() {
    const remindersRes = await fetchDashboardReminders()

    // Map Reminders
    const rawReminders = remindersRes.success && remindersRes.data ? remindersRes.data : []
    const reminders: Reminder[] = rawReminders.map(r => ({
        id: r.id,
        title: r.title,
        description: r.description || '',
        dueDate: new Date(r.reminder_date).toLocaleDateString() === new Date().toLocaleDateString() ? "Today" : new Date(r.reminder_date).toLocaleDateString(),
        type: r.reminder_type as any,
        clientName: r.client_name || 'Unknown Client',
        projectName: r.project_name || 'General',
        overdue: r.overdue,
        projectId: r.project_id || undefined
    }))

    return (
        <div className="flex flex-col items-center py-8 px-4 lg:px-8 w-full max-w-[1600px] mx-auto">
            <div className="w-full flex flex-col gap-8">
                {/* Breadcrumb / Header */}
                <div className="flex flex-col gap-4">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors w-fit"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="bg-zinc-100 p-2 rounded-lg text-zinc-900">
                            <Bell className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Follow-Up Inbox</h1>
                            <p className="text-zinc-500 text-sm">
                                {reminders.length} {reminders.length === 1 ? 'reminder' : 'reminders'} requiring attention
                            </p>
                        </div>
                    </div>
                </div>

                {/* Full Follow-Up Inbox */}
                <FollowUpInbox reminders={reminders} showViewAll={false} />
            </div>
        </div>
    )
}
