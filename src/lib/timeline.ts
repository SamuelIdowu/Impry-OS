import { getCurrentWorkspaceId } from '@/server/actions/workspaces';
import { db } from '@/server/db';
import { timelineEvents, projects } from '@/server/db/schema';
import { eq, inArray, and, desc } from 'drizzle-orm';
import { getUser } from './auth';

export type TimelineEventType =
    | 'note'
    | 'email'
    | 'call'
    | 'meeting'
    | 'milestone'
    | 'status_change'
    | 'payment'
    | 'scope_update'
    | 'reminder'
    | 'other';

export interface CreateTimelineEventInput {
    project_id?: string;
    client_id?: string;
    event_type: TimelineEventType;
    title: string;
    description?: string;
    metadata?: Record<string, any>;
    event_date?: string;
}

/**
 * Log a new timeline event
 */
export async function logTimelineEvent(input: CreateTimelineEventInput) {
    const user = await getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    try {
        let workspaceId: string | undefined;
        try {
            workspaceId = await getCurrentWorkspaceId();
        } catch {
            if (input.project_id) {
                const proj = await db.query.projects.findFirst({
                    where: eq(projects.id, input.project_id),
                    columns: { workspaceId: true }
                });
                workspaceId = proj?.workspaceId;
            }
        }

        if (!workspaceId) {
            console.error('Cannot log timeline event: missing workspaceId');
            return;
        }

        await db.insert(timelineEvents).values({
            projectId: input.project_id,
            clientId: input.client_id,
            eventType: input.event_type,
            title: input.title,
            description: input.description,
            metadata: input.metadata,
            userId: user.id,
            workspaceId: workspaceId,
            eventDate: input.event_date ? new Date(input.event_date) : new Date(),
        });
    } catch (error) {
        console.error('Failed to log timeline event:', error);
    }
}

/**
 * Get timeline activities for a project
 */
export async function getProjectActivities(projectId: string, filters?: { type?: TimelineEventType[] }) {
    const user = await getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    let conditions = [
        eq(timelineEvents.projectId, projectId),
        eq(timelineEvents.userId, user.id)
    ];

    if (filters?.type && filters.type.length > 0) {
        conditions.push(inArray(timelineEvents.eventType, filters.type));
    }

    const data = await db.query.timelineEvents.findMany({
        where: and(...conditions),
        with: {
            user: {
                columns: {
                    name: true,
                    image: true,
                }
            }
        },
        orderBy: [desc(timelineEvents.eventDate)]
    });

    return (data || []).map(event => ({
        ...event,
        event_type: event.eventType as TimelineEventType,
        event_date: event.eventDate ? new Date(event.eventDate).toISOString() : new Date().toISOString(),
        user: event.user ? {
            name: event.user.name || 'User',
            avatar: event.user.image || event.user.name?.charAt(0).toUpperCase() || 'U'
        } : undefined
    }));
}
