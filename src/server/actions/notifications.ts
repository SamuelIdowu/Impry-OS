"use server";

import { createClient } from "@/lib/auth";
import { getDueReminders } from "@/lib/reminders";

export type NotificationType = "warning" | "alert" | "success" | "info";

export interface NotificationItem {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    time: string;
    read: boolean;
    link?: string;
}

export async function fetchNotifications(): Promise<{ success: boolean; data?: NotificationItem[]; error?: string }> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return { success: false, error: "Unauthorized" };

        // 1. Fetch Overdue/Due Reminders
        const reminders = await getDueReminders();

        const reminderNotifications: NotificationItem[] = reminders.map(r => {
            const isOverdue = new Date(r.reminder_date) < new Date();
            return {
                id: r.id,
                type: r.reminder_type === 'payment' ? 'alert' : isOverdue ? 'warning' : 'info',
                title: r.title,
                message: `${r.projects?.name ? r.projects.name + ': ' : ''}${r.description || 'No details'}`,
                time: new Date(r.reminder_date).toLocaleDateString(),
                read: false, // Reminders are implicitly unread until completed
                link: r.project_id ? `/projects/${r.project_id}` : '/dashboard'
            };
        });

        // 2. Fetch Recent Important Timeline Events (Global)
        // We'll query timeline_events directly here for the user's projects
        // We want: Payment received, Scope changes, Status changes
        const { data: events } = await supabase
            .from('timeline_events')
            .select(`
                id,
                title,
                description,
                event_type,
                event_date,
                project:projects(id, name, user_id)
            `)
            .eq('project.user_id', user.id) // Implicitly handled by RLS on projects usually, but join filtering is safer
            .in('event_type', ['payment', 'scope', 'status_change'])
            .order('event_date', { ascending: false })
            .limit(10);

        const eventNotifications: NotificationItem[] = (events || [])
            .filter((e: any) => e.project) // Ensure project exists (RLS might filter nulls)
            .map((e: any) => ({
                id: e.id,
                type: e.event_type === 'payment' ? 'success' : 'info',
                title: e.title,
                message: `${e.project.name}: ${e.description || ''}`,
                time: new Date(e.event_date).toLocaleDateString(),
                read: true, // Events are history, mostly for info
                link: `/projects/${e.project.id}`
            }));

        // Combine and sort
        const allNotifications = [...reminderNotifications, ...eventNotifications]
            .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

        return { success: true, data: allNotifications };

    } catch (error) {
        console.error("Error fetching notifications:", error);
        return { success: false, error: "Failed to fetch notifications" };
    }
}
