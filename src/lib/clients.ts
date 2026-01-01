import { createClient as createSupabaseClient } from './auth';
import type { Client, CreateClientInput, UpdateClientInput, ClientWithProjects } from './types/client';

/**
 * Get all clients for the authenticated user
 */
export async function getClients(): Promise<ClientWithProjects[]> {
    const supabase = await createSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
        .from('clients')
        .select(`
      *,
      projects:projects(id, name, status)
    `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        throw error;
    }

    // Calculate active projects count for each client
    const clientsWithCounts = (data || []).map(client => ({
        ...client,
        active_projects_count: client.projects?.filter(
            (p: { status: string }) =>
                p.status === 'in_progress' ||
                p.status === 'review' ||
                p.status === 'planning'
        ).length || 0,
    }));

    return clientsWithCounts;
}

/**
 * Get a single client by ID with related data
 */
export async function getClientById(id: string): Promise<ClientWithProjects | null> {
    const supabase = await createSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
        .from('clients')
        .select(`
      *,
      projects:projects(id, name, status)
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

    return {
        ...data,
        active_projects_count: data.projects?.filter(
            (p: { status: string }) => p.status === 'active' || p.status === 'lead'
        ).length || 0,
    };
}

/**
 * Create a new client
 */
export async function createClient(input: CreateClientInput): Promise<Client> {
    const supabase = await createSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
        .from('clients')
        .insert({
            ...input,
            user_id: user.id,
            last_contact_date: new Date().toISOString(),
        })
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}

/**
 * Update an existing client
 */
export async function updateClient(id: string, input: UpdateClientInput): Promise<Client> {
    const supabase = await createSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
        .from('clients')
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
 * Delete a client
 */
export async function deleteClient(id: string): Promise<void> {
    const supabase = await createSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) {
        throw error;
    }
}

/**
 * Update last contact date for a client
 */
export async function updateLastContactDate(id: string): Promise<void> {
    const supabase = await createSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    const { error } = await supabase
        .from('clients')
        .update({ last_contact_date: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) {
        throw error;
    }
}

/**
 * Update client notes
 */
export async function updateClientNotes(id: string, notes: string): Promise<void> {
    const supabase = await createSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    const { error } = await supabase
        .from('clients')
        .update({
            notes,
            last_contact_date: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) {
        throw error;
    }
}
