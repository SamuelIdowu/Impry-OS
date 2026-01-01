import { createClient } from './auth';
import type {
    Project,
    ProjectWithClient,
    ProjectWithDetails,
    CreateProjectInput,
    UpdateProjectInput,
    ProjectStatus,
    mapDatabaseToAppStatus,
    mapAppToDatabaseStatus,
} from './types/project';

/**
 * Get all projects for the authenticated user
 */
export async function getProjects(): Promise<ProjectWithClient[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
        .from('projects')
        .select(`
            *,
            client:clients(id, name, email, company)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        throw error;
    }

    return data || [];
}

/**
 * Get projects by client ID
 */
export async function getProjectsByClient(clientId: string): Promise<Project[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('client_id', clientId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        throw error;
    }

    return data || [];
}

/**
 * Get a single project by ID with all related data
 */
export async function getProjectById(id: string): Promise<ProjectWithDetails | null> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
        .from('projects')
        .select(`
            *,
            client:clients(id, name, email, company),
            scopes:scopes(*),
            payments:payments(*),
            reminders:reminders(*)
        `)
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return null;
        }
        throw error;
    }

    return data;
}

/**
 * Create a new project
 */
export async function createProject(input: CreateProjectInput): Promise<Project> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    // Validate that client exists and belongs to user
    const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('id')
        .eq('id', input.client_id)
        .eq('user_id', user.id)
        .single();

    if (clientError || !client) {
        throw new Error('Client not found or does not belong to user');
    }

    const { data, error } = await supabase
        .from('projects')
        .insert({
            ...input,
            user_id: user.id,
            status: input.status || 'planning', // Default to 'planning' (maps to 'lead')
        })
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}

/**
 * Update an existing project
 */
export async function updateProject(id: string, input: UpdateProjectInput): Promise<Project> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
        .from('projects')
        .update({
            ...input,
            updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}

/**
 * Update project status
 */
export async function updateProjectStatus(id: string, status: ProjectStatus): Promise<Project> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    // Import the mapping function
    const { mapAppToDatabaseStatus } = await import('./types/project');
    const dbStatus = mapAppToDatabaseStatus(status);

    const { data: currentProject } = await supabase
        .from('projects')
        .select('name, status')
        .eq('id', id)
        .single();

    // Import dynamically to avoid circular dependencies if any
    const { logTimelineEvent } = await import('./timeline');

    const { data, error } = await supabase
        .from('projects')
        .update({
            status: dbStatus,
            updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

    if (error) {
        throw error;
    }

    // Log the status change
    if (currentProject && currentProject.status !== dbStatus) {
        await logTimelineEvent({
            project_id: id,
            event_type: 'status_change',
            title: 'Project Status Updated',
            description: `Status changed from ${currentProject.status} to ${dbStatus}`,
            metadata: {
                old_status: currentProject.status,
                new_status: dbStatus,
                status_label: status
            }
        });
    }

    return data;
}

/**
 * Delete a project
 */
export async function deleteProject(id: string): Promise<void> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) {
        throw error;
    }
}

/**
 * Get payment summary for a project
 */
export async function getProjectPaymentSummary(projectId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
        .from('payments')
        .select('amount, status, currency')
        .eq('project_id', projectId)
        .eq('user_id', user.id);

    if (error) {
        throw error;
    }

    const payments = data || [];
    const totalExpected = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalPaid = payments
        .filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + (p.amount || 0), 0);

    return {
        totalExpected,
        totalPaid,
        remaining: totalExpected - totalPaid,
        currency: payments[0]?.currency || 'USD',
        paymentsCount: payments.length,
    };
}

/**
 * Get next reminder for a project
 */
export async function getProjectNextReminder(projectId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .eq('is_sent', false)
        .gte('reminder_date', new Date().toISOString())
        .order('reminder_date', { ascending: true })
        .limit(1)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return null;
        }
        throw error;
    }

    return data;
}
