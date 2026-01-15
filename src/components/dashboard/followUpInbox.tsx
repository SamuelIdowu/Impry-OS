"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
    Bell,
    Receipt,
    Calendar,
    HardHat,
    Check,
    Clock,
    ExternalLink,
    ChevronRight,
    CheckCircle2,
    Mail,
    Trash2
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { markReminderDoneAction, snoozeReminderAction, deleteReminderAction } from "@/server/actions/dashboard"
import { Reminder } from "@/lib/types"

interface FollowUpInboxProps {
    reminders: Reminder[]
    showViewAll?: boolean
}

export function FollowUpInbox({ reminders, showViewAll = true }: FollowUpInboxProps) {
    const router = useRouter()
    const [actionLoading, setActionLoading] = React.useState<string | null>(null)

    const hasReminders = reminders.length > 0
    const dueCount = reminders.filter(r => r.dueDate === "Today").length

    const handleMarkDone = async (reminderId: string) => {
        setActionLoading(reminderId)
        try {
            await markReminderDoneAction(reminderId);
        } catch (error) {
            console.error("Failed to mark reminder as done", error)
        } finally {
            setActionLoading(null)
        }
    }

    const handleSnooze = async (reminderId: string) => {
        setActionLoading(reminderId)
        try {
            await snoozeReminderAction(reminderId);
        } catch (error) {
            console.error("Failed to snooze reminder", error)
        } finally {
            setActionLoading(null)
        }
    }

    const handleDelete = async (reminderId: string) => {
        if (!confirm('Are you sure you want to delete this reminder?')) return

        setActionLoading(reminderId)
        try {
            await deleteReminderAction(reminderId);
        } catch (error) {
            console.error("Failed to delete reminder", error)
        } finally {
            setActionLoading(null)
        }
    }

    const handleOpenProject = (projectId: string | undefined) => {
        if (projectId) {
            router.push(`/projects/${projectId}`)
        }
    }

    // Helper to get icon
    const getIcon = (type: string) => {
        switch (type) {
            case 'payment': return <Receipt className="h-4 w-4" />;
            case 'deadline': return <Calendar className="h-4 w-4" />;
            case 'follow_up': return <HardHat className="h-4 w-4" />;
            default: return <Bell className="h-4 w-4" />;
        }
    }

    // Helper to get colors
    const getColorClass = (type: string, overdue: boolean) => {
        if (type === 'payment') return overdue ? "bg-red-50 text-red-600 border-red-100" : "bg-orange-50 text-orange-600 border-orange-100";
        if (type === 'deadline') return "bg-orange-50 text-orange-600 border-orange-100";
        return "bg-blue-50 text-blue-600 border-blue-100";
    }

    if (!hasReminders) {
        return (
            <Card className="bg-white border-zinc-200 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200 bg-white">
                    <div className="flex items-center gap-3">
                        <div className="bg-zinc-100 p-1.5 rounded-md text-zinc-900 flex items-center justify-center">
                            <Bell className="h-5 w-5" />
                        </div>
                        <h3 className="font-bold text-lg text-zinc-900">Follow-Up Inbox</h3>
                    </div>
                </div>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="size-16 rounded-full bg-zinc-50 flex items-center justify-center mb-4 text-zinc-400">
                        <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <h4 className="text-zinc-900 font-medium">All caught up!</h4>
                    <p className="text-zinc-500 text-sm mt-1">Great job clearing your inbox.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="bg-white border-zinc-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200 bg-white">
                <div className="flex items-center gap-3">
                    <div className="bg-zinc-100 p-1.5 rounded-md text-zinc-900 flex items-center justify-center">
                        <Bell className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-lg text-zinc-900">Follow-Up Inbox</h3>
                    <Badge variant="default" className="bg-zinc-900 text-white text-[10px] font-bold px-2 py-1 rounded-full hover:bg-zinc-900/90">
                        {dueCount} Due
                    </Badge>
                </div>
                {showViewAll && (
                    <Link
                        href="/dashboard/follow-ups"
                        className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 flex items-center gap-1 transition-colors px-3 py-1.5 rounded-lg hover:bg-zinc-100"
                    >
                        View All
                        <ChevronRight className="h-4 w-4" />
                    </Link>
                )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto bg-white">
                <Table>
                    <TableHeader className="bg-zinc-50/50">
                        <TableRow className="hover:bg-transparent border-b border-zinc-200">
                            <TableHead className="px-6 py-4 text-xs uppercase text-zinc-500 font-semibold tracking-wider h-auto">Client</TableHead>
                            <TableHead className="px-6 py-4 text-xs uppercase text-zinc-500 font-semibold tracking-wider h-auto">Reminder</TableHead>
                            <TableHead className="px-6 py-4 text-xs uppercase text-zinc-500 font-semibold tracking-wider h-auto">Due</TableHead>
                            <TableHead className="px-6 py-4 text-xs uppercase text-zinc-500 font-semibold tracking-wider h-auto text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-zinc-100">
                        {reminders.map((reminder) => (
                            <TableRow key={reminder.id} className="group hover:bg-zinc-50/80 transition-colors border-zinc-100">
                                <TableCell className="px-6 py-5 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm shadow-sm">
                                            {reminder.clientName.split(' ').map((n: string) => n[0]).join('')}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-zinc-900">{reminder.clientName}</span>
                                            <span className="text-xs text-zinc-500">{reminder.projectName}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-5">
                                    <div
                                        className={cn(
                                            "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border",
                                            getColorClass(reminder.type, reminder.overdue)
                                        )}
                                    >
                                        {getIcon(reminder.type)}
                                        {reminder.title}
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-5 text-zinc-500 font-medium">
                                    <span
                                        className={cn(
                                            "px-2 py-1 rounded",
                                            reminder.overdue && "text-red-600 bg-red-50"
                                        )}
                                    >
                                        {reminder.dueDate}
                                    </span>
                                </TableCell>
                                <TableCell className="px-6 py-5 text-right">
                                    <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                        <button
                                            className="size-8 rounded-lg bg-white border border-zinc-200 hover:border-green-500 hover:text-green-600 text-zinc-500 shadow-sm flex items-center justify-center transition-all disabled:opacity-50"
                                            title="Mark Done"
                                            onClick={() => handleMarkDone(reminder.id)}
                                            disabled={actionLoading === reminder.id}
                                        >
                                            <Check className="h-4 w-4" />
                                        </button>
                                        <button
                                            className="size-8 rounded-lg bg-white border border-zinc-200 hover:border-zinc-400 hover:text-zinc-900 text-zinc-500 shadow-sm flex items-center justify-center transition-all disabled:opacity-50"
                                            title="Snooze"
                                            onClick={() => handleSnooze(reminder.id)}
                                            disabled={actionLoading === reminder.id}
                                        >
                                            <Clock className="h-4 w-4" />
                                        </button>
                                        <button
                                            className="size-8 rounded-lg bg-white border border-zinc-200 hover:border-zinc-400 hover:text-zinc-900 text-zinc-500 shadow-sm flex items-center justify-center transition-all disabled:opacity-50"
                                            title="Open Project"
                                            onClick={() => handleOpenProject(reminder.projectId)}
                                            disabled={!reminder.projectId || actionLoading === reminder.id}
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                        </button>

                                        {reminder.clientEmail && (
                                            <a
                                                href={`mailto:${reminder.clientEmail}`}
                                                className={cn(
                                                    "size-8 rounded-lg bg-white border border-zinc-200 hover:border-blue-400 hover:text-blue-600 text-zinc-500 shadow-sm flex items-center justify-center transition-all",
                                                    actionLoading === reminder.id && "opacity-50 pointer-events-none"
                                                )}
                                                title={`Email ${reminder.clientName}`}
                                            >
                                                <Mail className="h-4 w-4" />
                                            </a>
                                        )}

                                        <button
                                            className="size-8 rounded-lg bg-white border border-zinc-200 hover:border-red-400 hover:text-red-600 text-zinc-500 shadow-sm flex items-center justify-center transition-all disabled:opacity-50"
                                            title="Delete"
                                            onClick={() => handleDelete(reminder.id)}
                                            disabled={actionLoading === reminder.id}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </Card>
    )
}
