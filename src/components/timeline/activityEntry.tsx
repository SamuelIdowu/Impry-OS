'use client';

import * as React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { TimelineEventType } from '@/lib/timeline';
import { Bell, Plus, FileText, CheckCircle2 } from 'lucide-react';

interface ActivityEntryProps {
    activity: {
        id: string;
        event_type: TimelineEventType;
        title: string;
        description?: string;
        event_date: string;
        metadata?: any;
        user?: {
            name: string;
            avatar: string;
        };
    };
}

export function ActivityEntry({ activity }: ActivityEntryProps) {
    const date = new Date(activity.event_date);
    const timeAgo = formatDistanceToNow(date, { addSuffix: true });

    // Render Note (User Comment)
    if (activity.event_type === 'note') {
        return (
            <div className="flex gap-4">
                {/* User Avatar */}
                <div className="flex-shrink-0">
                    <div className="size-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-sm border-2 border-white shadow-sm">
                        {activity.user?.avatar || 'U'}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                            <span className="font-bold text-zinc-900">{activity.user?.name || 'User'}</span>
                            <span className="text-zinc-500">added a note</span>
                        </div>
                        <span className="text-xs text-zinc-400">{timeAgo}</span>
                    </div>
                    <p className="text-zinc-600 leading-relaxed">
                        {activity.description}
                    </p>
                </div>
            </div>
        );
    }

    // Render Payment Reminder (System Event)
    if (activity.event_type === 'payment') {
        return (
            <div className="flex gap-4">
                {/* Icon */}
                <div className="flex-shrink-0 relative">
                    <div className="h-full w-px bg-zinc-200 absolute left-1/2 -translate-x-1/2 -z-10 top-0 hidden" /> {/* Connector line placeholder */}
                    <div className="size-10 rounded-full bg-orange-50 flex items-center justify-center border-2 border-white shadow-sm ring-1 ring-orange-100">
                        <Bell className="size-5 text-orange-500 fill-orange-500/20" />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm flex items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                            <h4 className="font-bold text-zinc-900">{activity.title}</h4>
                            {activity.metadata?.isAutomated && (
                                <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                                    Automated
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-zinc-500">
                            {activity.description}
                        </p>
                    </div>
                    {activity.metadata?.invoiceId && (
                        <Button variant="outline" size="sm" className="h-9 border-zinc-200 text-zinc-700 font-medium hover:bg-zinc-50">
                            View Invoice
                        </Button>
                    )}
                </div>
            </div>
        );
    }

    // Render Scope Update
    if (activity.event_type === 'scope_update') {
        return (
            <div className="flex gap-4">
                {/* User Avatar */}
                <div className="flex-shrink-0">
                    <div className="size-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-sm border-2 border-white shadow-sm">
                        {activity.user?.avatar || 'U'}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-1.5">
                            <span className="font-bold text-zinc-900">{activity.user?.name || 'User'}</span>
                            <span className="text-zinc-500">updated scope</span>
                        </div>
                        <span className="text-xs text-zinc-400">{timeAgo}</span>
                    </div>

                    {/* Scope Card */}
                    <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-100 flex flex-col gap-3">
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5">
                                <div className="size-5 rounded-full bg-green-500 flex items-center justify-center">
                                    <Plus className="size-3.5 text-white stroke-[3]" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <h5 className="font-semibold text-zinc-900 text-sm">
                                    {activity.metadata?.changeTitle}
                                </h5>
                                <p className="text-sm text-zinc-500">
                                    {activity.metadata?.changeDescription}
                                </p>
                            </div>
                        </div>

                        {activity.metadata?.version && (
                            <div className="ml-8">
                                <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-indigo-100 rounded-md font-bold text-[10px]">
                                    SCOPE {activity.metadata.version.toUpperCase()}
                                </Badge>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Default Fallback
    return (
        <div className="flex gap-4">
            <div className="size-10 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
                <div className="size-2 bg-zinc-400 rounded-full" />
            </div>
            <div className="flex-1 bg-white p-4 rounded-xl border border-zinc-200">
                <h4 className="font-semibold text-zinc-900">{activity.title}</h4>
                {activity.description && <p className="text-zinc-500 text-sm mt-1">{activity.description}</p>}
            </div>
        </div>
    );
}
