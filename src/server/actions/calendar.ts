'use server'

import { createClient } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export type CalendarEventType = 'project_deadline' | 'project_start' | 'payment_due' | 'reminder' | 'note'

export interface CalendarEvent {
    id: string
    title: string
    date: string // ISO string
    type: CalendarEventType
    description?: string | null
    status?: string | null
    amount?: number | null
    currency?: string | null
    metadata?: any
}

interface FetchCalendarOptions {
    month: number // 0-11
    year: number
}

export async function fetchCalendarEventsAction(date?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    try {
        // 1. Fetch Projects (Deadlines and Start Dates)
        const { data: projects, error: projectsError } = await supabase
            .from('projects')
            .select('id, name, start_date, deadline, status, description')
            .eq('user_id', user.id)

        if (projectsError) throw projectsError

        // 2. Fetch Payments (Due Dates)
        const { data: payments, error: paymentsError } = await supabase
            .from('payments')
            .select('id, description, amount, currency, due_date, status, milestone_name')
            .eq('user_id', user.id)

        if (paymentsError) throw paymentsError

        // 3. Fetch Reminders
        const { data: reminders, error: remindersError } = await supabase
            .from('reminders')
            .select('id, title, description, reminder_date, is_sent, reminder_type')
            .eq('user_id', user.id)

        if (remindersError) throw remindersError

        // 4. Fetch Timeline Events
        const { data: timelineEvents, error: timelineError } = await supabase
            .from('timeline_events')
            .select('id, title, description, event_date, event_type')
            .eq('user_id', user.id)
            .eq('event_type', 'note')

        if (timelineError) throw timelineError

        const events: CalendarEvent[] = []

        // Process Projects
        projects?.forEach(project => {
            if (project.start_date) {
                events.push({
                    id: `${project.id}-start`,
                    title: `Start: ${project.name}`,
                    date: project.start_date, // assuming YYYY-MM-DD
                    type: 'project_start',
                    status: project.status,
                    description: project.description
                })
            }
            if (project.deadline) {
                events.push({
                    id: `${project.id}-deadline`,
                    title: `Deadline: ${project.name}`,
                    date: project.deadline,
                    type: 'project_deadline',
                    status: project.status,
                    description: project.description
                })
            }
        })

        // Process Payments
        payments?.forEach(payment => {
            if (payment.due_date) {
                events.push({
                    id: payment.id,
                    title: `Payment: ${payment.milestone_name || 'Scheduled Payment'}`,
                    date: payment.due_date,
                    type: 'payment_due',
                    amount: payment.amount,
                    currency: payment.currency,
                    status: payment.status,
                    description: payment.description
                })
            }
        })

        // Process Reminders
        reminders?.forEach(reminder => {
            if (reminder.reminder_date) {
                events.push({
                    id: reminder.id,
                    title: reminder.title,
                    date: reminder.reminder_date,
                    type: 'reminder',
                    status: reminder.is_sent ? 'sent' : 'pending',
                    description: reminder.description
                })
            }
        })

        // Process Timeline Notes
        timelineEvents?.forEach(event => {
            if (event.event_date) {
                events.push({
                    id: event.id,
                    title: event.title,
                    date: event.event_date,
                    type: 'note',
                    description: event.description
                })
            }
        })

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
