'use server';

import {
    getDashboardReminders,
    getAtRiskProjects,
    getDashboardMetrics,
    markReminderDone,
    snoozeReminder,
} from '@/lib/dashboard';
import { deleteReminder } from '@/lib/reminders';
import { revalidatePath } from 'next/cache';
import { withAuth } from '@/lib/auth-guard';

/**
 * Fetch dashboard data for the follow-up inbox
 */
export async function fetchDashboardReminders() {
    return withAuth(async (user, workspaceId) => {
        try {
            const reminders = await getDashboardReminders();
            return { success: true, data: reminders };
        } catch (error) {
            console.error('Error fetching dashboard reminders:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch reminders',
            };
        }
    });
}

/**
 * Fetch at-risk projects for the dashboard
 */
export async function fetchAtRiskProjects() {
    return withAuth(async (user, workspaceId) => {
        try {
            const projects = await getAtRiskProjects();
            return { success: true, data: projects };
        } catch (error) {
            console.error('Error fetching at-risk projects:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch at-risk projects',
            };
        }
    });
}

/**
 * Fetch dashboard metrics (revenue, pending invoices, etc.)
 */
export async function fetchDashboardMetrics() {
    return withAuth(async (user, workspaceId) => {
        try {
            const metrics = await getDashboardMetrics();
            return { success: true, data: metrics };
        } catch (error) {
            console.error('Error fetching dashboard metrics:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch metrics',
            };
        }
    });
}

/**
 * Mark a reminder as done
 */
export async function markReminderDoneAction(reminderId: string) {
    return withAuth(async (user, workspaceId) => {
        try {
            await markReminderDone(reminderId);
            revalidatePath(`/${workspaceId}/dashboard`);
            return { success: true };
        } catch (error) {
            console.error('Error marking reminder as done:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to mark reminder as done',
            };
        }
    });
}

/**
 * Snooze a reminder
 */
export async function snoozeReminderAction(reminderId: string, days: number = 1) {
    return withAuth(async (user, workspaceId) => {
        try {
            await snoozeReminder(reminderId, days);
            revalidatePath(`/${workspaceId}/dashboard`);
            return { success: true };
        } catch (error) {
            console.error('Error snoozing reminder:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to snooze reminder',
            };
        }
    });
}

/**
 * Delete a reminder
 */
export async function deleteReminderAction(reminderId: string) {
    return withAuth(async (user, workspaceId) => {
        try {
            await deleteReminder(reminderId);
            revalidatePath(`/${workspaceId}/dashboard`);
            return { success: true };
        } catch (error) {
            console.error('Error deleting reminder:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to delete reminder',
            };
        }
    });
}

