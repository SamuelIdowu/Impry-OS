'use client';

import { TimelinePage } from '@/components/timeline/timelinePage';

interface TimelineTabProps {
    projectId: string;
}

export function TimelineTab({ projectId }: TimelineTabProps) {
    return <TimelinePage projectId={projectId} />;
}
