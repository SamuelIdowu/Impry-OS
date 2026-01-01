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

/**
 * Fetch due reminders for dashboard
 */
export async function fetchDueReminders() {
    try {
        const reminders = await getDueReminders();
        return { success: true, data: reminders };
    } catch (error) {
        console.error('Error fetching due reminders:', error);
        return { success: false, error: 'Failed to fetch reminders' };
    }
}

/**
 * Create a new reminder
 */
export async function createReminderAction(input: CreateReminderInput) {
    try {
        const reminder = await createReminder(input);

        // Log to timeline if linked to a project
        if (input.project_id) {
            await logTimelineEvent({
                project_id: input.project_id,
                event_type: 'reminder',
                title: `Reminder created: ${input.title}`,
                description: input.description,
                event_date: new Date().toISOString(),
                metadata: {
                    reminder_id: reminder.id,
                    due_date: input.reminder_date
                }
            });
            revalidatePath(`/projects/${input.project_id}`);
        }

        revalidatePath('/dashboard');

        return { success: true, data: reminder };
    } catch (error) {
        console.error('Error creating reminder:', error);
        return { success: false, error: 'Failed to create reminder' };
    }
}

/**
 * Mark reminder as complete
 */
export async function completeReminderAction(id: string, projectId?: string) {
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
            revalidatePath(`/projects/${projectId}`);
        }

        revalidatePath('/dashboard');

        return { success: true, data: reminder };
    } catch (error) {
        console.error('Error completing reminder:', error);
        return { success: false, error: 'Failed to complete reminder' };
    }
}

/**
 * Snooze a reminder (reschedule)
 */
export async function snoozeReminderAction(
    id: string,
    newDate: string,
    projectId?: string
) {
    try {
        // Reschedule: update reminder_date, set status to pending (active)
        const reminder = await updateReminder(id, {
            reminder_date: newDate,
            // status: 'pending', // Removed
            is_sent: false, // Ensure it's active
            snoozed_until: null // Reset snoozed_until if we are treating this as "moved"
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
            revalidatePath(`/projects/${projectId}`);
        }

        revalidatePath('/dashboard');

        return { success: true, data: reminder };
    } catch (error) {
        console.error('Error snoozing reminder:', error);
        return { success: false, error: 'Failed to snooze reminder' };
    }
}

/**
 * Delete a reminder
 */
export async function deleteReminderAction(id: string, projectId?: string) {
    try {
        await deleteReminder(id);

        if (projectId) {
            revalidatePath(`/projects/${projectId}`);
        }
        revalidatePath('/dashboard');

        return { success: true };
    } catch (error) {
        console.error('Error deleting reminder:', error);
        return { success: false, error: 'Failed to delete reminder' };
    }
}
