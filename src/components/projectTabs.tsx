'use client';

import { cn } from '@/lib/utils';

interface ProjectTabsProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'scope', label: 'Scope' },
    { id: 'payments', label: 'Payments' },
    { id: 'timeline', label: 'Timeline' },
];

export function ProjectTabs({ activeTab, onTabChange }: ProjectTabsProps) {
    return (
        <div className="w-full border-b border-border">
            <div className="flex gap-8 overflow-x-auto no-scrollbar">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={cn(
                            'relative pb-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap',
                            activeTab === tab.id
                                ? 'text-foreground border-foreground'
                                : 'text-muted-foreground border-transparent hover:text-foreground hover:border-border'
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
