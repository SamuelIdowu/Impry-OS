'use client'
 
import { useRouter } from 'next/navigation'
import { CalendarView } from '@/components/calendar/CalendarView'
import type { CalendarEvent } from '@/lib/calendar'

interface CalendarViewWrapperProps {
    initialEvents: CalendarEvent[]
    clients?: { id: string; name: string }[]
    projects?: { id: string; name: string; clientId: string }[]
}

export function CalendarViewWrapper({ initialEvents, clients = [], projects = [] }: CalendarViewWrapperProps) {
    const router = useRouter()

    return (
        <CalendarView
            initialEvents={initialEvents}
            clients={clients}
            projects={projects}
            onRefresh={() => router.refresh()}
        />
    )
}
