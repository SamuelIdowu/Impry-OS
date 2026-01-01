'use server';

import {
    getClients,
    getClientById,
    createClient,
    updateClient,
    deleteClient,
    updateClientNotes,
    updateLastContactDate
} from '@/lib/clients';
import { createClient as createSupabaseClient } from '@/lib/auth';
import { CreateClientInput, UpdateClientInput } from '@/lib/types/client';
import { revalidatePath } from 'next/cache';

/**
 * Fetch client statistics (revenue, outstanding, etc)
 */
export async function fetchClientStats() {
    const supabase = await createSupabaseClient();

    // Total Clients
    const { count: totalClients } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true });

    // Active Projects
    const { count: activeProjects } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .in('status', ['in_progress', 'planning', 'review']);

    // Revenue
    const { data: payments } = await supabase
        .from('payments')
        .select('amount, status');

    const totalRevenue = payments?.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0) || 0;
    const pendingRevenue = payments?.filter(p => p.status !== 'paid').reduce((sum, p) => sum + p.amount, 0) || 0;

    return {
        success: true,
        data: {
            totalClients: totalClients || 0,
            activeProjects: activeProjects || 0,
            totalRevenue,
            pendingRevenue
        }
    };
}

/**
 * Fetch payments for a specific client
 */
export async function fetchClientPayments(clientId: string) {
    const supabase = await createSupabaseClient();

    // Join payments through projects
    const { data, error } = await supabase
        .from('payments')
        .select('*, projects!inner(client_id)')
        .eq('projects.client_id', clientId);

    if (error) {
        console.error('Error fetching client payments:', error);
        return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
}
/**
 * Fetch all clients
 */
export async function fetchClients() {
    try {
        const clients = await getClients();
        return { success: true, data: clients };
    } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { logError } = require('@/lib/server-logger');
        logError('Error fetching clients', error);
        console.error('Error fetching clients:', error);
        return { success: false, error: (error as Error).message };
    }
}

/**
 * Fetch a single client
 */
export async function fetchClient(id: string) {
    try {
        const client = await getClientById(id);
        if (!client) {
            return { success: false, error: 'Client not found' };
        }
        return { success: true, data: client };
    } catch (error) {
        console.error('Error fetching client:', error);
        return { success: false, error: (error as Error).message };
    }
}

/**
 * Create a new client
 */
export async function createClientAction(data: CreateClientInput) {
    try {
        const newClient = await createClient(data);
        revalidatePath('/clients');
        return { success: true, data: newClient };
    } catch (error) {
        console.error('Error creating client:', error);
        // Better error message for unique constraint violations
        if ((error as any).code === '23505') {
            return { success: false, error: 'A client with this email already exists' };
        }
        return { success: false, error: (error as Error).message };
    }
}

/**
 * Update a client
 */
export async function updateClientAction(id: string, data: UpdateClientInput) {
    try {
        const updatedClient = await updateClient(id, data);
        revalidatePath('/clients');
        revalidatePath(`/clients/${id}`);
        return { success: true, data: updatedClient };
    } catch (error) {
        console.error('Error updating client:', error);
        return { success: false, error: (error as Error).message };
    }
}

/**
 * Delete a client
 */
export async function deleteClientAction(id: string) {
    try {
        await deleteClient(id);
        revalidatePath('/clients');
        return { success: true };
    } catch (error) {
        console.error('Error deleting client:', error);
        return { success: false, error: (error as Error).message };
    }
}

/**
 * Update client notes
 */
export async function updateClientNotesAction(id: string, notes: string) {
    try {
        await updateClientNotes(id, notes);
        revalidatePath(`/clients/${id}`);
        return { success: true };
    } catch (error) {
        console.error('Error updating client notes:', error);
        return { success: false, error: (error as Error).message };
    }
}

/**
 * Import multiple clients
 */
export async function importClientsAction(clients: CreateClientInput[]) {
    try {
        const supabase = await createSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error('User not authenticated');
        }

        // Prepare data with user_id and timestamps
        const clientsToInsert = clients.map(client => ({
            ...client,
            user_id: user.id,
            last_contact_date: new Date().toISOString(),
        }));

        const { data, error } = await supabase
            .from('clients')
            .insert(clientsToInsert)
            .select();

        if (error) {
            console.error('Error importing clients:', error);
            // Check for potential duplicates if using unique constraint but ignoring conflicts
            if (error.code === '23505') {
                return { success: false, error: 'Some emails already exist. Please ensure emails are unique.' };
            }
            throw error;
        }

        revalidatePath('/clients');
        return { success: true, count: data?.length || 0 };
    } catch (error) {
        console.error('Error importing clients:', error);
        return { success: false, error: (error as Error).message };
    }
}

/**
 * Update client status
 */
export async function updateClientStatusAction(id: string, status: 'active' | 'inactive' | 'archived' | 'lead') {
    try {
        await updateClient(id, { status });
        revalidatePath('/clients');
        revalidatePath(`/clients/${id}`);
        return { success: true };
    } catch (error) {
        console.error('Error updating client status:', error);
        return { success: false, error: (error as Error).message };
    }
}
