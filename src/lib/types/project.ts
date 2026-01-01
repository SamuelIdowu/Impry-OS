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

export interface Project {
    id: string;
    user_id: string;
    client_id: string | null;
    name: string;
    description?: string | null;
    status: DatabaseProjectStatus;
    start_date?: string | null;
    deadline?: string | null;
    budget?: number | null;
    currency?: string | null;
    notes?: string | null;
    created_at: string;
    updated_at: string;
}

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
        created_at: string;
    }>;
    payments?: Array<{
        id: string;
        amount: number;
        currency: string;
        status: string;
        due_date?: string | null;
        paid_date?: string | null;
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
    client_id: string;
    description?: string;
    status?: DatabaseProjectStatus;
    start_date?: string;
    deadline?: string;
    budget?: number;
    currency?: string;
    notes?: string;
}

export interface UpdateProjectInput {
    name?: string;
    description?: string;
    status?: DatabaseProjectStatus;
    start_date?: string;
    deadline?: string;
    budget?: number;
    currency?: string;
    notes?: string;
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
    const configs: Record<ProjectStatus, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
        'lead': { label: 'Lead', variant: 'secondary' },
        'active': { label: 'Active', variant: 'default' },
        'waiting': { label: 'Waiting', variant: 'outline' },
        'completed': { label: 'Completed', variant: 'outline' },
    };
    return configs[status];
}
