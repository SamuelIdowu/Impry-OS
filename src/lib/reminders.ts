import { db } from '@/server/db';
import { reminders } from '@/server/db/schema';
import { eq, and, asc } from 'drizzle-orm';
import { getUser } from './auth';
import type {
    Reminder,
    CreateReminderInput,
    UpdateReminderInput,
    ReminderStatus,
} from './types/reminder';

/**
 * Get all reminders for a user, optionally filtered by project or status
 */
export async function getReminders(filters?: {
    projectId?: string;
    status?: ReminderStatus;
    type?: string;
    limit?: number;
}): Promise<Reminder[]> {
    const user = await getUser();
    if (!user) throw new Error('User not authenticated');

    let conditions: any[] = [eq(reminders.userId, user.id)];

    if (filters?.projectId) conditions.push(eq(reminders.projectId, filters.projectId));
    if (filters?.status) {
        if (filters.status === 'completed') {
            conditions.push(eq(reminders.isSent, true));
        } else if (filters.status === 'pending') {
            conditions.push(eq(reminders.isSent, false));
        }
    }
    if (filters?.type) conditions.push(eq(reminders.reminderType, filters.type));

    const result = await db.query.reminders.findMany({
        where: and(...conditions),
        orderBy: [asc(reminders.reminderDate)],
        limit: filters?.limit,
        with: {
            project: { columns: { name: true } },
            client: { columns: { name: true, email: true } }
        }
    });

    return result as unknown as Reminder[];
}

/**
 * Get pending and due reminders (including snoozed ones that are due)
 */
export async function getDueReminders(): Promise<Reminder[]> {
    const user = await getUser();
    if (!user) throw new Error('User not authenticated');

    const result = await db.query.reminders.findMany({
        where: and(eq(reminders.userId, user.id), eq(reminders.isSent, false)),
        orderBy: [asc(reminders.reminderDate)],
        with: {
            project: { columns: { name: true } },
            client: { columns: { name: true, email: true } }
        }
    });

    return result as unknown as Reminder[];
}

/**
 * Create a new reminder
 */
export async function createReminder(input: CreateReminderInput): Promise<Reminder> {
    const user = await getUser();
    if (!user) throw new Error('User not authenticated');

    const [newReminder] = await db.insert(reminders).values({
        userId: user.id,
        projectId: input.projectId,
        clientId: input.clientId,
        paymentId: input.paymentId,
        title: input.title,
        description: input.description,
        reminderDate: new Date(input.reminderDate),
        reminderType: input.reminderType || 'custom',
        isSent: false,
    }).returning();

    return newReminder as unknown as Reminder;
}

/**
 * Update a reminder
 */
export async function updateReminder(id: string, input: UpdateReminderInput): Promise<Reminder> {
    const user = await getUser();
    if (!user) throw new Error('User not authenticated');

    const { status, ...updateData } = input as any;

    const setFields: any = { updatedAt: new Date() };
    if (updateData.title !== undefined) setFields.title = updateData.title;
    if (updateData.description !== undefined) setFields.description = updateData.description;
    if (updateData.reminderDate !== undefined) setFields.reminderDate = new Date(updateData.reminderDate);
    if (updateData.reminderType !== undefined) setFields.reminderType = updateData.reminderType;
    if (updateData.isSent !== undefined) setFields.isSent = updateData.isSent;
    if (updateData.completedAt !== undefined) setFields.completedAt = updateData.completedAt ? new Date(updateData.completedAt) : null;
    if (updateData.snoozedUntil !== undefined) setFields.snoozedUntil = updateData.snoozedUntil ? new Date(updateData.snoozedUntil) : null;

    const [updatedReminder] = await db.update(reminders).set(setFields)
    .where(and(eq(reminders.id, id), eq(reminders.userId, user.id)))
    .returning();

    return updatedReminder as unknown as Reminder;
}

/**
 * Delete a reminder
 */
export async function deleteReminder(id: string): Promise<void> {
    const user = await getUser();
    if (!user) throw new Error('User not authenticated');

    await db.delete(reminders).where(and(eq(reminders.id, id), eq(reminders.userId, user.id)));
}
