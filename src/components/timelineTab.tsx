'use client';

import { TimelinePage } from '@/components/timeline/timelinePage';

interface TimelineTabProps {
    projectId: string;
    onUpdateScope?: () => void;
}

export function TimelineTab({ projectId, onUpdateScope }: TimelineTabProps) {
    return <TimelinePage projectId={projectId} onUpdateScope={onUpdateScope} />;
}
