"use client"

import * as React from "react"
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import {
    Bell,
    AlertTriangle,
    AlertCircle,
    CheckCircle2,
    Info,
    ChevronRight,
    Check
} from "lucide-react"

interface NotificationModalProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

interface Notification {
    id: string
    type: "warning" | "alert" | "success" | "info"
    title: string
    message: string
    time: string
    read: boolean
}

// Reuse the same mock data or fetch logic
const notificationIcons = {
    warning: <AlertTriangle className="size-5" />,
    alert: <AlertCircle className="size-5" />,
    success: <CheckCircle2 className="size-5" />,
    info: <Info className="size-5" />,
}

const notificationColors = {
    warning: "bg-red-50 text-red-600",
    alert: "bg-amber-50 text-amber-600",
    success: "bg-green-50 text-green-600",
    info: "bg-blue-50 text-blue-600",
}

export function NotificationModal({
    open,
    onOpenChange,
}: NotificationModalProps) {
    const [loading, setLoading] = React.useState(true)
    const [notifications, setNotifications] = React.useState<Notification[]>([])
    const [filter, setFilter] = React.useState<"all" | "unread" | "urgent">("all")

    React.useEffect(() => {
        async function loadNotifications() {
            setLoading(true)
            try {
                // Dynamic import or direct call if server action
                const { fetchNotifications } = await import("@/server/actions/notifications")
                const result = await fetchNotifications()

                if (result.success && result.data) {
                    setNotifications(result.data.map(n => ({
                        ...n,
                        type: n.type as "warning" | "alert" | "success" | "info" // Ensure type safety if mismatch
                    })))
                }
            } catch (err) {
                console.error("Failed to load notifications", err)
            } finally {
                setLoading(false)
            }
        }

        if (open) {
            loadNotifications()
        }
    }, [open])

    const unreadCount = notifications.length

    const filteredNotifications =
        filter === "unread"
            ? notifications
            : filter === "urgent"
                ? notifications.filter((n) => n.type === "warning" || n.type === "alert")
                : notifications

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <button className="relative p-2 rounded-full hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 transition-colors outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2">
                    <Bell className="size-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 size-2 bg-red-500 ring-2 ring-white rounded-full"></span>
                    )}
                </button>
            </DialogTrigger>
            <DialogContent showCloseButton={false} className="p-0 gap-0 sm:max-w-[420px] rounded-2xl overflow-hidden bg-white">
                {/* Header */}
                <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-white pt-6">
                    <DialogTitle className="text-lg font-bold text-zinc-900">Notifications</DialogTitle>
                    <button className="text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
                        Mark all as read
                    </button>
                </div>

                {/* Filter Chips */}
                <div className="px-5 py-4 flex gap-2 bg-zinc-50/50 overflow-x-auto border-b border-zinc-100">
                    <button
                        onClick={() => setFilter("all")}
                        className={cn(
                            "px-3 py-1.5 text-xs font-semibold rounded-full transition-all whitespace-nowrap",
                            filter === "all"
                                ? "bg-zinc-900 text-white shadow-md ring-1 ring-zinc-900"
                                : "bg-white text-zinc-600 border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                        )}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter("unread")}
                        className={cn(
                            "px-3 py-1.5 text-xs font-medium rounded-full transition-all whitespace-nowrap",
                            filter === "unread"
                                ? "bg-zinc-900 text-white shadow-md ring-1 ring-zinc-900"
                                : "bg-white text-zinc-600 border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                        )}
                    >
                        Unread <span className="ml-1 text-[10px] opacity-80 px-1 py-0.5 bg-zinc-800 rounded-full">{unreadCount}</span>
                    </button>
                    <button
                        onClick={() => setFilter("urgent")}
                        className={cn(
                            "px-3 py-1.5 text-xs font-medium rounded-full transition-all whitespace-nowrap",
                            filter === "urgent"
                                ? "bg-zinc-900 text-white shadow-md ring-1 ring-zinc-900"
                                : "bg-white text-zinc-600 border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                        )}
                    >
                        Urgent
                    </button>
                </div>

                {/* Notifications List */}
                <div className="max-h-[500px] overflow-y-auto bg-white p-2">
                    {filteredNotifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="size-12 bg-zinc-50 rounded-full flex items-center justify-center mb-3">
                                <Bell className="size-6 text-zinc-300" />
                            </div>
                            <p className="text-sm font-medium text-zinc-900">No notifications</p>
                            <p className="text-xs text-zinc-500 mt-1">You're all caught up!</p>
                        </div>
                    ) : (
                        filteredNotifications.map((notification, index) => (
                            <div
                                key={notification.id}
                                className={cn(
                                    "group relative flex gap-4 p-4 hover:bg-zinc-50 transition-colors cursor-pointer rounded-xl border border-transparent mx-2",
                                    "hover:border-zinc-200 hover:shadow-sm"
                                )}
                            >
                                {/* Unread Indicator */}
                                {!notification.read && (
                                    <div className="absolute right-4 top-4 size-2 rounded-full bg-zinc-900 shadow-sm ring-2 ring-white"></div>
                                )}

                                {/* Icon */}
                                <div className="shrink-0 pt-0.5">
                                    <div
                                        className={cn(
                                            "size-10 rounded-full flex items-center justify-center",
                                            notificationColors[notification.type]
                                        )}
                                    >
                                        {notificationIcons[notification.type]}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex flex-col gap-1.5 pr-4">
                                    <div className="flex flex-col">
                                        <p className="text-sm font-bold text-zinc-900 leading-tight">
                                            {notification.title}
                                        </p>
                                        <p className="text-xs text-zinc-500 leading-relaxed mt-1">
                                            {notification.message}
                                        </p>
                                    </div>
                                    <span className="text-[11px] font-medium text-zinc-400">
                                        {notification.time}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 bg-zinc-50 border-t border-zinc-100 text-center">
                    <button className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 transition-colors flex items-center justify-center gap-1.5 w-full py-2 rounded-lg hover:bg-zinc-200/50">
                        View all notifications
                        <ChevronRight className="size-3" />
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
