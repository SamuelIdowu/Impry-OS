'use server';

import {
    getDashboardReminders,
    getAtRiskProjects,
    getDashboardMetrics,
    markReminderDone,
    snoozeReminder,
} from '@/lib/dashboard';
import { revalidatePath } from 'next/cache';

/**
 * Fetch dashboard data for the follow-up inbox
 */
export async function fetchDashboardReminders() {
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
}

/**
 * Fetch at-risk projects for the dashboard
 */
export async function fetchAtRiskProjects() {
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
}

/**
 * Fetch dashboard metrics (revenue, pending invoices, etc.)
 */
export async function fetchDashboardMetrics() {
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
}

/**
 * Mark a reminder as done
 */
export async function markReminderDoneAction(reminderId: string) {
    try {
        await markReminderDone(reminderId);
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Error marking reminder as done:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to mark reminder as done',
        };
    }
}

/**
 * Snooze a reminder
 */
export async function snoozeReminderAction(reminderId: string, days: number = 1) {
    try {
        await snoozeReminder(reminderId, days);
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Error snoozing reminder:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to snooze reminder',
        };
    }
}
