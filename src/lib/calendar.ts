import { getCurrentWorkspaceId } from '@/lib/workspace';
import { db } from '@/server/db';
import { eq, and } from 'drizzle-orm';
import { getUser } from '@/lib/auth';
import { projects, payments, reminders, timelineEvents } from '@/server/db/schema';

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

export async function fetchCalendarEvents(date?: string): Promise<CalendarEvent[]> {
    const user = await getUser()
    if (!user) throw new Error('Unauthorized')

    const workspaceId = await getCurrentWorkspaceId()

    // Run all four queries in parallel
    const [userProjects, userPayments, userReminders, userTimelineEvents] = await Promise.all([
        db.query.projects.findMany({
            where: and(eq(projects.workspaceId, workspaceId), eq(projects.userId, user.id)),
            limit: 200,
            columns: {
                id: true, name: true, startDate: true, deadline: true, status: true, description: true
            }
        }),
        db.query.payments.findMany({
            where: and(eq(payments.workspaceId, workspaceId), eq(payments.userId, user.id)),
            limit: 200,
            columns: {
                id: true, description: true, amount: true, currency: true, dueDate: true, status: true, milestoneName: true
            }
        }),
        db.query.reminders.findMany({
            where: and(eq(reminders.workspaceId, workspaceId), eq(reminders.userId, user.id)),
            limit: 200,
            columns: {
                id: true, title: true, description: true, reminderDate: true, isSent: true, reminderType: true
            }
        }),
        db.query.timelineEvents.findMany({
            where: (events, { and, eq }) => and(
                eq(events.userId, user.id),
                eq(events.eventType, 'note')
            ),
            limit: 200,
            columns: {
                id: true, title: true, description: true, eventDate: true, eventType: true
            }
        }),
    ])

    const events: CalendarEvent[] = []

    // Process Projects
    userProjects.forEach(project => {
        if (project.startDate) {
            events.push({
                id: `${project.id}-start`,
                title: `Start: ${project.name}`,
                date: project.startDate, // assuming YYYY-MM-DD or full date string
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
    userPayments.forEach(payment => {
        if (payment.dueDate) {
            events.push({
                id: payment.id,
                title: `Payment: ${payment.milestoneName || 'Scheduled Payment'}`,
                date: payment.dueDate,
                type: 'payment_due',
                amount: Number(payment.amount), // Convert string to number if needed
                currency: payment.currency,
                status: payment.status,
                description: payment.description
            })
        }
    })

    // Process Reminders
    userReminders.forEach(reminder => {
        if (reminder.reminderDate) {
            events.push({
                id: reminder.id,
                title: reminder.title,
                date: reminder.reminderDate.toISOString(), // ensure ISO string
                type: 'reminder',
                status: reminder.isSent ? 'sent' : 'pending',
                description: reminder.description
            })
        }
    })

    // Process Timeline Notes
    userTimelineEvents.forEach(event => {
        if (event.eventDate) {
            events.push({
                id: event.id,
                title: event.title,
                date: event.eventDate.toISOString(),
                type: 'note',
                description: event.description
            })
        }
    })

    return events
}
