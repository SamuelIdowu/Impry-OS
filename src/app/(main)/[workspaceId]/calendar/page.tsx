import { Suspense } from 'react'
import { CalendarView } from '@/components/calendar/CalendarView'
import { fetchCalendarEventsAction } from '@/server/actions/calendar'

export default async function CalendarPage() {
    const { events } = await fetchCalendarEventsAction()

    return (
        <div className="h-full flex flex-col space-y-6 p-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Calendar</h1>
                    <p className="text-sm text-zinc-500 mt-1">
                        Manage your schedule, deadlines, and payments
                    </p>
                </div>
            </div>

            <div className="flex-1 min-h-0 bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
                <Suspense fallback={<div className="p-8 text-center text-zinc-500">Loading calendar...</div>}>
                    <CalendarView initialEvents={events || []} />
                </Suspense>
            </div>
        </div>
    )
}
