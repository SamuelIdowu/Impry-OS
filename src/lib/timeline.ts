import { createClient } from './auth';

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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    const { error } = await supabase
        .from('timeline_events')
        .insert({
            ...input,
            user_id: user.id,
            event_date: input.event_date || new Date().toISOString(),
        });

    if (error) {
        console.error('Failed to log timeline event:', error);
        // We generally don't want to throw here to avoid blocking the main action
        // if logging fails, but in a production app we might handle this differently
    }
}

/**
 * Get timeline activities for a project
 */
export async function getProjectActivities(projectId: string, filters?: { type?: TimelineEventType[] }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    let query = supabase
        .from('timeline_events')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .order('event_date', { ascending: false });

    if (filters?.type && filters.type.length > 0) {
        query = query.in('event_type', filters.type);
    }

    const { data, error } = await query;

    if (error) {
        throw error;
    }

    return data || [];
}
