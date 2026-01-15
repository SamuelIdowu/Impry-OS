'use client'

import * as React from 'react'
import {
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    addMonths,
    subMonths,
    isSameDay,
    parseISO
} from 'date-fns'
import { CalendarHeader } from './CalendarHeader'
import { CalendarDay } from './CalendarDay'
import { EventDialog } from './EventDialog'
import type { CalendarEvent } from '@/server/actions/calendar'

interface CalendarViewProps {
    initialEvents: CalendarEvent[]
}

export function CalendarView({ initialEvents }: CalendarViewProps) {
    const [currentDate, setCurrentDate] = React.useState(new Date())
    const [selectedEvent, setSelectedEvent] = React.useState<CalendarEvent | null>(null)
    const [isDialogOpen, setIsDialogOpen] = React.useState(false)

    // Navigation handlers
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))
    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
    const goToToday = () => setCurrentDate(new Date())

    // Generate grid days
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate
    })

    // Group events by day
    const getEventsForDay = (day: Date) => {
        return initialEvents.filter(event =>
            isSameDay(parseISO(event.date), day)
        )
    }

    const handleEventClick = (event: CalendarEvent) => {
        setSelectedEvent(event)
        setIsDialogOpen(true)
    }

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    return (
        <div className="flex flex-col h-full bg-white">
            <CalendarHeader
                currentDate={currentDate}
                onPrevMonth={prevMonth}
                onNextMonth={nextMonth}
                onToday={goToToday}
            />

            <div className="grid grid-cols-7 border-b border-zinc-100 bg-zinc-50">
                {weekDays.map(day => (
                    <div key={day} className="py-2 text-center text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>

            <div className="flex-1 grid grid-cols-7 grid-rows-5 md:grid-rows-auto min-h-0 overflow-y-auto">
                {calendarDays.map((day, dayIdx) => (
                    <CalendarDay
                        key={day.toISOString()}
                        date={day}
                        currentMonth={currentDate}
                        events={getEventsForDay(day)}
                        onEventClick={handleEventClick}
                    />
                ))}
            </div>

            <EventDialog
                event={selectedEvent}
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
            />
        </div>
    )
}
