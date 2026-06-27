'use server'

import { fetchCalendarEvents, type CalendarEvent } from '@/lib/calendar'

export async function fetchCalendarEventsAction(date?: string): Promise<{ success: boolean; events?: CalendarEvent[]; error?: string }> {
    try {
        const events = await fetchCalendarEvents(date)
        return { success: true, events }
    } catch (error) {
        console.error('Fetch calendar error details:', {
            message: (error as Error).message,
            fullError: JSON.stringify(error, null, 2),
            // @ts-ignore
            hint: error?.hint,
            // @ts-ignore
            details: error?.details
        })
        return { success: false, error: 'Failed to fetch calendar data' }
    }
}

