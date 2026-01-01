'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { TimelineEventType } from '@/lib/timeline';

interface TimelineFiltersProps {
    currentFilter: TimelineEventType | 'all';
    onFilterChange: (type: TimelineEventType | 'all') => void;
}

export function TimelineFilters({
    currentFilter,
    onFilterChange,
}: TimelineFiltersProps) {
    const filters: { label: string; value: TimelineEventType | 'all' }[] = [
        { label: 'All Activity', value: 'all' },
        { label: 'Notes', value: 'note' },
        { label: 'Scope Updates', value: 'scope_update' },
        { label: 'Payments', value: 'payment' },
        { label: 'Reminders', value: 'reminder' },
    ];

    return (
        <div className="flex flex-wrap items-center gap-2">
            {filters.map((filter) => (
                <button
                    key={filter.value}
                    onClick={() => onFilterChange(filter.value)}
                    className={cn(
                        "px-4 py-1.5 rounded-full text-sm font-medium transition-all border",
                        currentFilter === filter.value
                            ? "bg-zinc-900 text-white border-zinc-900 shadow-sm"
                            : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300 hover:text-zinc-900"
                    )}
                >
                    {filter.label}
                </button>
            ))}
        </div>
    );
}
