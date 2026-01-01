'use client';

import { ScopeSummaryCard } from '@/components/scopeSummaryCard';
import { PaymentSummaryCard } from '@/components/paymentSummaryCard';
import { NextReminderCard } from '@/components/nextReminderCard';
import type { ProjectWithDetails } from '@/lib/types/project';

interface OverviewTabProps {
    project: ProjectWithDetails;
    onUpdate: () => void;
}

export function OverviewTab({ project, onUpdate }: OverviewTabProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <PaymentSummaryCard projectId={project.id} payments={project.payments || []} />
            <NextReminderCard projectId={project.id} reminders={project.reminders || []} />
            <ScopeSummaryCard projectId={project.id} scopes={project.scopes || []} />
        </div>
    );
}
