'use client'

import { useRouter } from 'next/navigation'
import { CalendarView } from '@/components/calendar/CalendarView'
import type { CalendarEvent } from '@/lib/calendar'

interface CalendarViewWrapperProps {
    initialEvents: CalendarEvent[]
}

export function CalendarViewWrapper({ initialEvents }: CalendarViewWrapperProps) {
    const router = useRouter()

    return (
        <CalendarView
            initialEvents={initialEvents}
            onRefresh={() => router.refresh()}
        />
    )
}
