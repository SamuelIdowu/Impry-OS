'use server';
import { getCurrentWorkspaceId } from '@/server/actions/workspaces';

import {
    getClients,
    getClientById,
    createClient,
    updateClient,
    deleteClient,
    updateClientNotes,
    updateLastContactDate
} from '@/lib/clients';
import { CreateClientInput, UpdateClientInput } from '@/lib/types/client';
import { revalidatePath } from 'next/cache';
import { db } from '@/server/db';
import { clients, projects, payments } from '@/server/db/schema';
import { eq, inArray, and } from 'drizzle-orm';
import { getUser } from '@/lib/auth';

/**
 * Fetch client statistics (revenue, outstanding, etc)
 */
export async function fetchClientStats() {
    try {
        const user = await getUser();
        if (!user) throw new Error('User not authenticated');

        // Total Clients
        const userClients = await db.query.clients.findMany({
            where: and(eq(clients.workspaceId, await getCurrentWorkspaceId()), eq(clients.userId, user.id)),
        });
        const totalClients = userClients.length;

        // Active Projects
        const userProjects = await db.query.projects.findMany({
            where: and(eq(projects.workspaceId, await getCurrentWorkspaceId()), eq(projects.userId, user.id)),
        });
        const activeProjects = userProjects.filter(p => p.status === 'in_progress' || p.status === 'planning' || p.status === 'review').length;

        // Revenue
        const userPayments = await db.query.payments.findMany({
            where: and(eq(payments.workspaceId, await getCurrentWorkspaceId()), eq(payments.userId, user.id)),
        });

        // Convert string to number for arithmetic
        const totalRevenue = userPayments.filter(p => p.status === 'paid').reduce((sum, p) => sum + Number(p.amount), 0);
        const pendingRevenue = userPayments.filter(p => p.status !== 'paid').reduce((sum, p) => sum + Number(p.amount), 0);

        return {
            success: true,
            data: {
                totalClients,
                activeProjects,
                totalRevenue,
                pendingRevenue
            }
        };
    } catch (error) {
        console.error('Error fetching client stats:', error);
        return { success: false, error: (error as Error).message };
    }
}

/**
 * Fetch payments for a specific client
 */
export async function fetchClientPayments(clientId: string) {
    try {
        const user = await getUser();
        if (!user) throw new Error('User not authenticated');

        // Join payments through projects
        const clientProjects = await db.select({ id: projects.id }).from(projects).where(eq(projects.clientId, clientId));
        const projectIds = clientProjects.map(p => p.id);

        if (projectIds.length === 0) {
            return { success: true, data: [] };
        }

        const data = await db.query.payments.findMany({
            where: inArray(payments.projectId, projectIds),
        });

        return { success: true, data };
    } catch (error) {
        console.error('Error fetching client payments:', error);
        return { success: false, error: (error as Error).message };
    }
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
        revalidatePath('/', 'layout');
        return { success: true, data: newClient };
    } catch (error: any) {
        console.error('Error creating client:', error);
        // Better error message for unique constraint violations
        if (error.code === '23505') {
            return { success: false, error: 'A client with this email already exists' };
        }
        return { success: false, error: error.message };
    }
}

/**
 * Update a client
 */
export async function updateClientAction(id: string, data: UpdateClientInput) {
    try {
        const updatedClient = await updateClient(id, data);
        revalidatePath('/', 'layout');
        revalidatePath('/', 'layout');
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
        revalidatePath('/', 'layout');
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
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error) {
        console.error('Error updating client notes:', error);
        return { success: false, error: (error as Error).message };
    }
}

/**
 * Import multiple clients
 */
export async function importClientsAction(clientsList: CreateClientInput[]) {
    try {
        const user = await getUser();
        if (!user) throw new Error('User not authenticated');

        // Prepare data with user_id and timestamps
        const workspaceId = await getCurrentWorkspaceId();
        const clientsToInsert = clientsList.map(client => ({
            ...client,
            userId: user.id,
            workspaceId,

            lastContactDate: new Date(),
        }));

        const data = await db.insert(clients).values(clientsToInsert).returning();

        revalidatePath('/', 'layout');
        return { success: true, count: data?.length || 0 };
    } catch (error: any) {
        console.error('Error importing clients:', error);
        // Check for potential duplicates if using unique constraint but ignoring conflicts
        if (error.code === '23505') {
            return { success: false, error: 'Some emails already exist. Please ensure emails are unique.' };
        }
        return { success: false, error: error.message };
    }
}

/**
 * Update client status
 */
export async function updateClientStatusAction(id: string, status: 'active' | 'inactive' | 'archived' | 'lead') {
    try {
        await updateClient(id, { status });
        revalidatePath('/', 'layout');
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error) {
        console.error('Error updating client status:', error);
        return { success: false, error: (error as Error).message };
    }
}

