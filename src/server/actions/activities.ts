'use server';

import { logTimelineEvent } from '@/lib/timeline';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const createNoteSchema = z.object({
    projectId: z.string().uuid(),
    content: z.string().min(1, 'Note content is required'),
});

export async function createManualNote(input: z.infer<typeof createNoteSchema>) {
    try {
        const { projectId, content } = createNoteSchema.parse(input);

        await logTimelineEvent({
            project_id: projectId,
            event_type: 'note',
            title: 'Note added', // Standard title for manual notes
            description: content,
        });

        revalidatePath(`/projects/${projectId}`);
        return { success: true };
    } catch (error) {
        console.error('Failed to create manual note:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create note'
        };
    }
}
