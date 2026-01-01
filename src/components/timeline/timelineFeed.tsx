'use client';

import * as React from 'react';
import { ActivityEntry } from './activityEntry';

interface TimelineFeedProps {
    activities: any[];
}

export function TimelineFeed({ activities }: TimelineFeedProps) {
    if (activities.length === 0) {
        return (
            <div className="py-12 text-center text-zinc-500 bg-white rounded-xl border border-zinc-200 border-dashed">
                No activities found matching your filters.
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {activities.map((activity) => (
                <ActivityEntry key={activity.id} activity={activity} />
            ))}
        </div>
    );
}
