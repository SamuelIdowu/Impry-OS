'use client';

import * as React from 'react';
import { TimelineFilters } from './timelineFilters';
import { TimelineFeed } from './timelineFeed';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { fetchProjectTimeline, addTimelineEventAction } from '@/server/actions/timeline';
import type { TimelineEventType } from '@/lib/timeline';
import { Paperclip, Calendar as CalendarIcon, Hash, X, Check } from 'lucide-react';
import { EmptyState } from './emptyState';

interface TimelinePageProps {
    projectId: string;
    onUpdateScope?: () => void;
}

const EVENT_TYPE_OPTIONS: { type: TimelineEventType; label: string; icon: string }[] = [
    { type: 'note', label: 'Note', icon: '📝' },
    { type: 'meeting', label: 'Meeting', icon: '🤝' },
    { type: 'call', label: 'Client Call', icon: '📞' },
    { type: 'scope_update', label: 'Scope Update', icon: '📋' },
    { type: 'milestone', label: 'Milestone', icon: '🎯' },
    { type: 'payment', label: 'Payment Log', icon: '💳' },
];

export function TimelinePage({ projectId, onUpdateScope }: TimelinePageProps) {
    const [filterType, setFilterType] = React.useState<TimelineEventType | 'all'>('all');
    const [activities, setActivities] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [note, setNote] = React.useState('');
    const [isPosting, setIsPosting] = React.useState(false);

    // Interactive state for Paperclip, Calendar, and Hash tools
    const [attachments, setAttachments] = React.useState<File[]>([]);
    const [customDate, setCustomDate] = React.useState<string>('');
    const [showDatePicker, setShowDatePicker] = React.useState(false);
    const [selectedTag, setSelectedTag] = React.useState<TimelineEventType>('note');
    const [showTagMenu, setShowTagMenu] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const dateInputRef = React.useRef<HTMLInputElement>(null);

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

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            setAttachments((prev) => [...prev, ...newFiles]);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleRemoveAttachment = (index: number) => {
        setAttachments((prev) => prev.filter((_, i) => i !== index));
    };

    const handlePostNote = async () => {
        if (!note.trim() && attachments.length === 0) return;

        try {
            setIsPosting(true);
            const tagConfig = EVENT_TYPE_OPTIONS.find(t => t.type === selectedTag);
            const eventTitle = tagConfig ? tagConfig.label : 'Note';

            // Build metadata if attachments or custom date are present
            const metadata: Record<string, any> = {};
            if (attachments.length > 0) {
                metadata.attachments = attachments.map(f => ({
                    name: f.name,
                    size: f.size,
                    type: f.type,
                }));
            }

            const res = await addTimelineEventAction({
                project_id: projectId,
                event_type: selectedTag,
                title: eventTitle,
                description: note.trim() || `Added ${attachments.length} attachment(s)`,
                event_date: customDate ? new Date(customDate).toISOString() : new Date().toISOString(),
                metadata: Object.keys(metadata).length > 0 ? metadata : undefined
            });

            if (res.success) {
                setNote('');
                setAttachments([]);
                setCustomDate('');
                setShowDatePicker(false);
                setSelectedTag('note');
                setShowTagMenu(false);
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
            <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-4 relative">
                {/* Hidden File Input */}
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    multiple
                    onChange={handleFileSelect}
                />

                {/* Hidden Date Input for Native Picker */}
                <input
                    type="date"
                    ref={dateInputRef}
                    className="hidden"
                    value={customDate}
                    onChange={(e) => {
                        setCustomDate(e.target.value);
                        setShowDatePicker(false);
                    }}
                />

                <Textarea
                    placeholder="Add a note, update, or reminder... (Press Ctrl+Enter to post)"
                    className="min-h-[100px] border-none shadow-none resize-none focus-visible:ring-0 p-0 text-base placeholder:text-zinc-400"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    onKeyDown={(e) => {
                        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                            e.preventDefault();
                            handlePostNote();
                        }
                    }}
                />

                {/* Badges / Active selections */}
                {(attachments.length > 0 || customDate || selectedTag !== 'note') && (
                    <div className="flex flex-wrap items-center gap-2 pt-2 pb-1">
                        {/* Selected Tag Badge */}
                        {selectedTag !== 'note' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900 text-white text-xs font-medium shadow-sm">
                                <span>{EVENT_TYPE_OPTIONS.find(t => t.type === selectedTag)?.icon}</span>
                                <span>#{EVENT_TYPE_OPTIONS.find(t => t.type === selectedTag)?.label}</span>
                                <button
                                    type="button"
                                    onClick={() => setSelectedTag('note')}
                                    className="hover:text-zinc-300 ml-0.5"
                                    title="Reset to regular note"
                                >
                                    <X className="size-3" />
                                </button>
                            </span>
                        )}

                        {/* Custom Date Badge */}
                        {customDate && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-800 text-xs font-medium border border-zinc-200">
                                <CalendarIcon className="size-3 text-zinc-500" />
                                <span>{new Date(customDate + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                <button
                                    type="button"
                                    onClick={() => setCustomDate('')}
                                    className="text-zinc-400 hover:text-zinc-700 ml-0.5"
                                    title="Clear date"
                                >
                                    <X className="size-3" />
                                </button>
                            </span>
                        )}

                        {/* Attachment Badges */}
                        {attachments.map((file, idx) => (
                            <span
                                key={idx}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-800 text-xs font-medium border border-zinc-200"
                            >
                                <Paperclip className="size-3 text-zinc-500" />
                                <span className="truncate max-w-[140px]">{file.name}</span>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveAttachment(idx)}
                                    className="text-zinc-400 hover:text-zinc-700 ml-0.5"
                                    title="Remove attachment"
                                >
                                    <X className="size-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                )}

                {/* Inline Date Picker Popover */}
                {showDatePicker && (
                    <div className="flex items-center gap-2 p-2 mt-2 bg-zinc-50 rounded-xl border border-zinc-200 w-fit">
                        <label className="text-xs font-medium text-zinc-600">Event Date:</label>
                        <input
                            type="date"
                            value={customDate}
                            onChange={(e) => {
                                setCustomDate(e.target.value);
                                if (e.target.value) setShowDatePicker(false);
                            }}
                            className="text-xs bg-white border border-zinc-200 rounded px-2 py-1 text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                        />
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => setShowDatePicker(false)}
                        >
                            Close
                        </Button>
                    </div>
                )}

                {/* Inline Tag Menu Popover */}
                {showTagMenu && (
                    <div className="flex flex-wrap gap-1.5 p-2 mt-2 bg-zinc-50 rounded-xl border border-zinc-200 w-fit max-w-md">
                        {EVENT_TYPE_OPTIONS.map((opt) => (
                            <button
                                key={opt.type}
                                type="button"
                                onClick={() => {
                                    setSelectedTag(opt.type);
                                    setShowTagMenu(false);
                                }}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                                    selectedTag === opt.type
                                        ? 'bg-zinc-900 text-white'
                                        : 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                                }`}
                            >
                                <span>{opt.icon}</span>
                                <span>{opt.label}</span>
                                {selectedTag === opt.type && <Check className="size-3 ml-0.5" />}
                            </button>
                        ))}
                    </div>
                )}

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-100">
                    <div className="flex items-center gap-1.5">
                        {/* Paperclip Button */}
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            title="Attach files"
                            className={`rounded-full transition-colors ${
                                attachments.length > 0
                                    ? 'bg-zinc-100 text-zinc-900'
                                    : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50'
                            }`}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Paperclip className="size-5" />
                        </Button>

                        {/* Calendar Button */}
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            title="Set custom date"
                            className={`rounded-full transition-colors ${
                                customDate || showDatePicker
                                    ? 'bg-zinc-100 text-zinc-900'
                                    : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50'
                            }`}
                            onClick={() => {
                                if (typeof (dateInputRef.current as any)?.showPicker === 'function') {
                                    (dateInputRef.current as any).showPicker();
                                } else {
                                    setShowDatePicker((prev) => !prev);
                                }
                                setShowTagMenu(false);
                            }}
                        >
                            <CalendarIcon className="size-5" />
                        </Button>

                        {/* Hash Button */}
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            title="Select category / tag"
                            className={`rounded-full transition-colors ${
                                selectedTag !== 'note' || showTagMenu
                                    ? 'bg-zinc-100 text-zinc-900'
                                    : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50'
                            }`}
                            onClick={() => {
                                setShowTagMenu((prev) => !prev);
                                setShowDatePicker(false);
                            }}
                        >
                            <Hash className="size-5" />
                        </Button>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-xs font-medium text-zinc-400">Visible to Team</span>
                        <Button
                            className="bg-zinc-900 text-white hover:bg-zinc-800 rounded-full px-6"
                            onClick={handlePostNote}
                            disabled={isPosting || (!note.trim() && attachments.length === 0)}
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
                        <EmptyState projectId={projectId} onSuccess={loadActivities} onUpdateScope={onUpdateScope} />
                    ) : (
                        <TimelineFeed activities={activities} />
                    )}
                </div>
            </div>
        </div>
    );
}
