'use client'

import * as React from 'react'
import { format, isSameMonth, isToday } from 'date-fns'
import { cn } from '@/lib/utils'
import type { CalendarEvent } from '@/server/actions/calendar'

interface CalendarDayProps {
    date: Date
    currentMonth: Date
    events: CalendarEvent[]
    onClick?: () => void
    onEventClick?: (event: CalendarEvent) => void
}

export function CalendarDay({ date, currentMonth, events, onClick, onEventClick }: CalendarDayProps) {
    const isCurrentMonth = isSameMonth(date, currentMonth)
    const isDayToday = isToday(date)

    // Sort events by priority? maybe deadlines first?
    const sortedEvents = [...events].sort((a, b) => {
        // Simple sort by type priority
        const priority = {
            project_deadline: 1,
            payment_due: 2,
            reminder: 3,
            project_start: 4,
            note: 5
        }
        return (priority[a.type] || 99) - (priority[b.type] || 99)
    })

    // Max 3 events visible
    const visibleEvents = sortedEvents.slice(0, 3)
    const hiddenCount = sortedEvents.length - 3

    const getEventStyles = (type: CalendarEvent['type']) => {
        switch (type) {
            case 'project_deadline':
                return 'bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100'
            case 'project_start':
                return 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100'
            case 'payment_due':
                return 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100'
            case 'reminder':
                return 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100'
            default:
                return 'bg-zinc-50 text-zinc-600 border-zinc-100 hover:bg-zinc-100'
        }
    }

    return (
        <div
            className={cn(
                "min-h-[120px] p-2 border-b border-r border-zinc-100 bg-white transition-colors group relative",
                !isCurrentMonth && "bg-zinc-50/50",

            )}
            onClick={onClick}
        >
            <div className="flex items-center justify-between mb-2">
                <span className={cn(
                    "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full",
                    isDayToday
                        ? "bg-zinc-900 text-white"
                        : !isCurrentMonth
                            ? "text-zinc-400"
                            : "text-zinc-900 group-hover:bg-zinc-100"
                )}>
                    {format(date, 'd')}
                </span>
            </div>

            <div className="flex flex-col gap-1">
                {visibleEvents.map(event => (
                    <button
                        key={event.id}
                        className={cn(
                            "text-xs text-left px-1.5 py-0.5 rounded border truncate w-full transition-colors",
                            getEventStyles(event.type)
                        )}
                        title={event.title}
                        onClick={(e) => {
                            e.stopPropagation()
                            onEventClick?.(event)
                        }}
                    >
                        {event.title}
                    </button>
                ))}

                {hiddenCount > 0 && (
                    <span className="text-[10px] font-medium text-zinc-400 pl-1">
                        +{hiddenCount} more
                    </span>
                )}
            </div>
        </div>
    )
}
