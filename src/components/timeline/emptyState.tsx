'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { EmptyState as UIEmptyState } from '@/components/ui/empty-state';
import { Clock, Plus, FileText } from 'lucide-react';

export function EmptyState() {
    return (
        <UIEmptyState
            title="No activity yet"
            description="Notes, scope updates, and payments will appear here as your project progresses. Start by documenting your first milestone."
            icons={[
                <div key="icon" className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 relative">
                    <Clock className="h-12 w-12 text-primary" />
                    <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white dark:bg-zinc-800 shadow-sm border border-zinc-100 dark:border-zinc-700">
                        <Plus className="h-3 w-3 text-green-600" />
                    </div>
                </div>
            ]}
            action={
                <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                    <Button className="gap-2 font-bold w-full sm:w-auto">
                        <FileText className="h-5 w-5" />
                        Add Note
                    </Button>
                    <Button variant="outline" className="gap-2 font-bold w-full sm:w-auto">
                        <FileText className="h-5 w-5" />
                        Update Scope
                    </Button>
                </div>
            }
            secondaryAction={
                <div className="mt-8 rounded-lg bg-muted/50 p-4 text-xs text-muted-foreground text-center sm:text-left">
                    <p className="font-medium text-foreground">Quick Start:</p>
                    <p className="mt-1">Try logging a meeting summary or sending a deposit request to kick things off.</p>
                </div>
            }
        />
    );
}
