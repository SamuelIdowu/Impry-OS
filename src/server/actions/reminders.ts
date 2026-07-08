'use server';

import {
    createReminder,
    updateReminder,
    deleteReminder,
    getDueReminders,
    getReminders,
} from '@/lib/reminders';
import { logTimelineEvent } from '@/lib/timeline';
import type { CreateReminderInput, UpdateReminderInput } from '@/lib/types/reminder';
import { revalidatePath } from 'next/cache';
import { withAuth } from '@/lib/auth-guard';
import { z } from 'zod';

const createReminderSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    reminderDate: z.string().min(1, 'Reminder date is required'),
    reminderType: z.string().optional(),
    clientId: z.string().optional(),
    projectId: z.string().optional(),
    paymentId: z.string().optional(),
});

/**
 * Fetch due reminders for dashboard
 */
export async function fetchDueReminders() {
    return withAuth(async (user, workspaceId) => {
        try {
            const reminders = await getDueReminders();
            return { success: true, data: reminders };
        } catch (error) {
            console.error('Error fetching due reminders:', error);
            return { success: false, error: 'Failed to fetch reminders' };
        }
    });
}

/**
 * Create a new reminder
 */
export async function createReminderAction(input: CreateReminderInput) {
    return withAuth(async (user, workspaceId) => {
        try {
            const validatedInput = createReminderSchema.parse(input) as CreateReminderInput;
            const reminder = await createReminder(validatedInput);

            // Log to timeline if linked to a project
            if (validatedInput.projectId) {
                await logTimelineEvent({
                    project_id: validatedInput.projectId,
                    event_type: 'reminder',
                    title: `Reminder created: ${validatedInput.title}`,
                    description: validatedInput.description,
                    event_date: new Date().toISOString(),
                    metadata: {
                        reminder_id: reminder.id,
                        dueDate: validatedInput.reminderDate
                    }
                });
                revalidatePath(`/${workspaceId}/projects/${validatedInput.projectId}`);
            }

            revalidatePath(`/${workspaceId}/dashboard`);

            return { success: true, data: reminder };
        } catch (error: any) {
            console.error('Error creating reminder:', error);
            if (error instanceof z.ZodError) {
                return { success: false, error: error.issues[0].message };
            }
            return { success: false, error: 'Failed to create reminder' };
        }
    });
}

/**
 * Mark reminder as complete
 */
export async function completeReminderAction(id: string, projectId?: string) {
    return withAuth(async (user, workspaceId) => {
        try {
            const reminder = await updateReminder(id, {
                // status: 'completed', // Removed as per schema
                completed_at: new Date().toISOString(),
                is_sent: true // Mark as sent/done effectively
            } as any); // cast to any to avoid type error if Input doesn't have is_sent yet

            if (projectId) {
                await logTimelineEvent({
                    project_id: projectId,
                    event_type: 'reminder',
                    title: `Reminder completed: ${reminder.title}`,
                    event_date: new Date().toISOString(),
                    metadata: { reminder_id: id }
                });
                revalidatePath(`/${workspaceId}/projects/${projectId}`);
            }

            revalidatePath(`/${workspaceId}/dashboard`);

            return { success: true, data: reminder };
        } catch (error) {
            console.error('Error completing reminder:', error);
            return { success: false, error: 'Failed to complete reminder' };
        }
    });
}

/**
 * Snooze a reminder (reschedule)
 */
export async function snoozeReminderAction(
    id: string,
    newDate: string,
    projectId?: string
) {
    return withAuth(async (user, workspaceId) => {
        try {
            // Reschedule: update reminderDate, set status to pending (active)
            const reminder = await updateReminder(id, {
                reminderDate: newDate,
                // status: 'pending', // Removed
                is_sent: false, // Ensure it's active
                snoozedUntil: null // Reset snoozedUntil if we are treating this as "moved"
            } as any);

            if (projectId) {
                await logTimelineEvent({
                    project_id: projectId,
                    event_type: 'reminder',
                    title: `Reminder rescheduled: ${reminder.title}`,
                    description: `Rescheduled to ${new Date(newDate).toLocaleDateString()}`,
                    event_date: new Date().toISOString(),
                    metadata: {
                        reminder_id: id,
                        new_date: newDate
                    }
                });
                revalidatePath(`/${workspaceId}/projects/${projectId}`);
            }

            revalidatePath(`/${workspaceId}/dashboard`);

            return { success: true, data: reminder };
        } catch (error) {
            console.error('Error snoozing reminder:', error);
            return { success: false, error: 'Failed to snooze reminder' };
        }
    });
}

/**
 * Delete a reminder
 */
export async function deleteReminderAction(id: string, projectId?: string) {
    return withAuth(async (user, workspaceId) => {
        try {
            await deleteReminder(id);

            if (projectId) {
                revalidatePath(`/${workspaceId}/projects/${projectId}`);
            }
            revalidatePath(`/${workspaceId}/dashboard`);

            return { success: true };
        } catch (error) {
            console.error('Error deleting reminder:', error);
            return { success: false, error: 'Failed to delete reminder' };
        }
    });
}

