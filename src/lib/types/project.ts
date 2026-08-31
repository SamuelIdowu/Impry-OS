// Project status mapping from database to application layer
// Database uses: planning, in_progress, review, completed, on_hold, cancelled
// Application uses: lead, active, waiting, completed (per PRD)

export type ProjectStatus = 'lead' | 'active' | 'waiting' | 'completed';

export type DatabaseProjectStatus =
    | 'planning'
    | 'in_progress'
    | 'review'
    | 'completed'
    | 'on_hold'
    | 'cancelled';

import { InferSelectModel } from 'drizzle-orm';
import { projects } from '@/server/db/schema';

export type Project = InferSelectModel<typeof projects>;

export interface ProjectWithClient extends Project {
    client?: {
        id: string;
        name: string;
        email: string;
        company?: string | null;
    } | null;
}

export interface ProjectWithDetails extends ProjectWithClient {
    scopes?: Array<{
        id: string;
        title: string;
        status: string;
        description?: string | null;
        createdAt: string | Date;
    }>;
    payments?: Array<{
        id: string;
        amount: string | number;
        currency: string;
        status: string;
        description?: string | null;
        dueDate?: string | null;
        paidDate?: string | null;
        amountPaid?: string | number;
        userId?: string;
        updatedAt?: string | Date;
    }>;
    reminders?: Array<{
        id: string;
        title: string;
        description?: string | null;
        reminder_date: string;
        reminder_type: string;
        is_sent: boolean;
    }>;
}

export interface CreateProjectInput {
    name: string;
    clientId: string;
    description?: string | null;
    status?: DatabaseProjectStatus;
    startDate?: string | null;
    deadline?: string | null;
    budget?: number;
    currency?: string;
    notes?: string | null;
}

export interface UpdateProjectInput {
    name?: string;
    description?: string | null;
    status?: DatabaseProjectStatus;
    startDate?: string | null;
    deadline?: string | null;
    budget?: number;
    currency?: string;
    notes?: string | null;
    progress?: number;
    total_value?: number;
}

// Helper functions to map between database and application statuses
export function mapDatabaseToAppStatus(dbStatus: DatabaseProjectStatus): ProjectStatus {
    const statusMap: Record<DatabaseProjectStatus, ProjectStatus> = {
        'planning': 'lead',
        'in_progress': 'active',
        'review': 'active',
        'on_hold': 'waiting',
        'completed': 'completed',
        'cancelled': 'completed',
    };
    return statusMap[dbStatus];
}

export function mapAppToDatabaseStatus(appStatus: ProjectStatus): DatabaseProjectStatus {
    const statusMap: Record<ProjectStatus, DatabaseProjectStatus> = {
        'lead': 'planning',
        'active': 'in_progress',
        'waiting': 'on_hold',
        'completed': 'completed',
    };
    return statusMap[appStatus];
}

// Get status label and styling
export function getStatusConfig(status: ProjectStatus) {
    const configs: Record<ProjectStatus, { label: string; color: string; iconColor: string }> = {
        'lead': {
            label: 'Lead',
            color: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200',
            iconColor: 'text-blue-500 fill-blue-500'
        },
        'active': {
            label: 'Active',
            color: 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200',
            iconColor: 'text-green-500 fill-green-500'
        },
        'waiting': {
            label: 'Waiting',
            color: 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200',
            iconColor: 'text-amber-500 fill-amber-500'
        },
        'completed': {
            label: 'Completed',
            color: 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200',
            iconColor: 'text-slate-500 fill-slate-500'
        },
    };
    return configs[status];
}
