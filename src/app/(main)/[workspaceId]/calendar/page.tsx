import { Suspense } from 'react'
import { CalendarViewWrapper } from '@/components/calendar/CalendarViewWrapper'
import { fetchCalendarEventsAction } from '@/server/actions/calendar'
import { fetchClients } from '@/server/actions/clients'
import { fetchProjects } from '@/server/actions/projects'

export default async function CalendarPage() {
    const [eventsResult, clientsResult, projectsResult] = await Promise.all([
        fetchCalendarEventsAction(),
        fetchClients(),
        fetchProjects()
    ])

    const events = eventsResult?.events || []
    const clients = (clientsResult?.success && clientsResult.data) ? clientsResult.data.map(c => ({ id: c.id, name: c.name })) : []
    const projects = (projectsResult?.success && projectsResult.data) ? projectsResult.data.map(p => ({ id: p.id, name: p.name, clientId: p.clientId || '' })) : []

    return (
        <div className="h-full flex flex-col space-y-4 md:space-y-6 p-4 md:p-10">
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
                    <CalendarViewWrapper
                        initialEvents={events}
                        clients={clients}
                        projects={projects}
                    />
                </Suspense>
            </div>
        </div>
    )
}
