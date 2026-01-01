'use client';

import * as React from 'react';
import { TimelineFilters } from './timelineFilters';
import { TimelineFeed } from './timelineFeed';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { fetchProjectTimeline, addTimelineEventAction } from '@/server/actions/timeline';
import type { TimelineEventType } from '@/lib/timeline';
import { Paperclip, Calendar, Hash } from 'lucide-react';
import { EmptyState } from './emptyState';

interface TimelinePageProps {
    projectId: string;
}

export function TimelinePage({ projectId }: TimelinePageProps) {
    const [filterType, setFilterType] = React.useState<TimelineEventType | 'all'>('all');
    const [activities, setActivities] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [note, setNote] = React.useState('');
    const [isPosting, setIsPosting] = React.useState(false);

    const loadActivities = React.useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetchProjectTimeline(projectId,
                filterType !== 'all' ? { type: [filterType] } : undefined
            );
            if (res.success && res.data) {
                setActivities(res.data);
            }
        } catch (error) {
            console.error('Failed to load timeline:', error);
        } finally {
            setLoading(false);
        }
    }, [projectId, filterType]);

    React.useEffect(() => {
        loadActivities();
    }, [loadActivities]);

    const handlePostNote = async () => {
        if (!note.trim()) return;

        try {
            setIsPosting(true);
            const res = await addTimelineEventAction({
                project_id: projectId,
                event_type: 'note',
                title: 'Note', // Default title for quick notes
                description: note,
                event_date: new Date().toISOString()
            });

            if (res.success) {
                setNote('');
                loadActivities(); // Refresh list
            }
        } catch (error) {
            console.error('Failed to post note:', error);
        } finally {
            setIsPosting(false);
        }
    };

    return (
        <div className="flex flex-col gap-8 animate-in fade-in duration-500">
            {/* Input Area */}
            <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-4">
                <Textarea
                    placeholder="Add a note, update, or reminder..."
                    className="min-h-[100px] border-none shadow-none resize-none focus-visible:ring-0 p-0 text-base placeholder:text-zinc-400"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                />
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-100">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50">
                            <Paperclip className="size-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50">
                            <Calendar className="size-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50">
                            <Hash className="size-5" />
                        </Button>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-medium text-zinc-400">Visible to Team</span>
                        <Button
                            className="bg-zinc-900 text-white hover:bg-zinc-800 rounded-full px-6"
                            onClick={handlePostNote}
                            disabled={isPosting || !note.trim()}
                        >
                            {isPosting ? 'Posting...' : 'Post Activity'}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <TimelineFilters
                currentFilter={filterType}
                onFilterChange={setFilterType}
            />

            {/* Feed */}
            {/* Timeline Line container */}
            <div className="relative pl-8">
                {/* The main vertical line */}
                <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-zinc-200" />

                {/* Day Marker (Mocked for "Today") */}
                <div className="absolute left-0 top-0 flex flex-col items-center gap-2">
                    <span className="text-xs font-bold text-zinc-500">Today</span>
                    <div className="size-10 rounded-full bg-white border-2 border-zinc-100 flex items-center justify-center relative z-10 shadow-sm">
                        <svg className="size-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                </div>


                <div className="pt-12">
                    {loading ? (
                        <div className="py-8 text-center text-zinc-500">Loading timeline...</div>
                    ) : activities.length === 0 && filterType === 'all' ? (
                        <EmptyState />
                    ) : (
                        <TimelineFeed activities={activities} />
                    )}
                </div>
            </div>
        </div>
    );
}
