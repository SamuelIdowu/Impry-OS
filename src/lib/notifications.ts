import { getCurrentWorkspaceId } from '@/lib/workspace';
import { db } from '@/server/db';
import { timelineEvents, projects } from '@/server/db/schema';
import { eq, inArray, desc } from 'drizzle-orm';
import { getUser } from '@/lib/auth';
import { getDueReminders } from './reminders';

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

export async function getNotifications(): Promise<NotificationItem[]> {
    const user = await getUser();
    if (!user) throw new Error("Unauthorized");

    let workspaceId = 'default';
    try {
        workspaceId = await getCurrentWorkspaceId();
    } catch (e) {
        // Fallback to default if not in a workspace context
    }

    // Fetch reminders and timeline events in parallel
    const [reminders, events] = await Promise.all([
        getDueReminders(),
        db.query.timelineEvents.findMany({
            where: (timelineEvents, { and, inArray, eq }) => and(
                eq(timelineEvents.userId, user.id),
                inArray(timelineEvents.eventType, ['payment', 'scope', 'status_change'])
            ),
            orderBy: [desc(timelineEvents.eventDate)],
            limit: 10,
            with: {
                project: {
                    columns: { id: true, name: true, userId: true }
                }
            }
        }),
    ]);

    const reminderNotifications: NotificationItem[] = reminders.map(r => {
        const isOverdue = r.reminderDate ? new Date(r.reminderDate) < new Date() : false;
        return {
            id: r.id,
            type: r.reminderType === 'payment' ? 'alert' : isOverdue ? 'warning' : 'info',
            title: r.title,
            message: `${r.project?.name ? r.project.name + ': ' : ''}${r.description || 'No details'}`,
            time: r.reminderDate ? new Date(r.reminderDate).toLocaleDateString() : new Date().toLocaleDateString(),
            read: false,
            link: r.projectId ? `/${workspaceId}/projects/${r.projectId}` : `/${workspaceId}/dashboard`
        };
    });

    const eventNotifications: NotificationItem[] = events
        .filter(e => e.project && e.project.userId === user.id)
        .map(e => ({
            id: e.id,
            type: e.eventType === 'payment' ? 'success' : 'info',
            title: e.title,
            message: `${e.project?.name || 'Unknown'}: ${e.description || ''}`,
            time: e.eventDate ? new Date(e.eventDate).toLocaleDateString() : new Date().toLocaleDateString(),
            read: true,
            link: e.projectId ? `/${workspaceId}/projects/${e.projectId}` : '#'
        }));

    // Combine and sort
    const allNotifications = [...reminderNotifications, ...eventNotifications]
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    return allNotifications;
}
