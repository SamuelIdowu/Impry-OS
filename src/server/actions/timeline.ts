'use server';

import { getProjectActivities, logTimelineEvent, CreateTimelineEventInput, TimelineEventType } from '@/lib/timeline';
import { revalidatePath } from 'next/cache';

/**
 * Fetch timeline events for a project
 */
export async function fetchProjectTimeline(projectId: string, filters?: { type?: TimelineEventType[] }) {
    try {
        const events = await getProjectActivities(projectId, filters);
        return { success: true, data: events };
    } catch (error) {
        console.error('Error fetching timeline events:', error);
        return { success: false, error: (error as Error).message };
    }
}

/**
 * Add a new timeline event (e.g. note)
 */
export async function addTimelineEventAction(input: CreateTimelineEventInput) {
    try {
        await logTimelineEvent(input);
        if (input.project_id) {
            revalidatePath(`/projects/${input.project_id}`);
        }
        return { success: true };
    } catch (error) {
        console.error('Error adding timeline event:', error);
        return { success: false, error: (error as Error).message };
    }
}
