'use server';
import { getCurrentWorkspaceId } from '@/lib/workspace';

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
import { withAuth } from '@/lib/auth-guard';
import { canCreateClient } from '@/lib/payments/guards';
import { z } from 'zod';
import { sql, count as sqlCount } from 'drizzle-orm';

const createClientSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    company: z.string().optional(),
    notes: z.string().optional(),
    status: z.enum(['active', 'inactive', 'archived', 'lead']).optional(),
});

const updateClientSchema = createClientSchema.partial();

/**
 * Fetch client statistics (revenue, outstanding, etc)
 */
export async function fetchClientStats() {
    return withAuth(async (user, workspaceId) => {
        try {
            // Run all three aggregate queries in parallel using SQL aggregations scoped to workspace
            const [clientCountResult, activeProjectCountResult, revenueResult] = await Promise.all([
                db.select({ count: sqlCount() }).from(clients)
                    .where(eq(clients.workspaceId, workspaceId)),
                db.select({ count: sqlCount() }).from(projects)
                    .where(and(
                        eq(projects.workspaceId, workspaceId),
                        inArray(projects.status, ['in_progress', 'planning', 'review'])
                    )),
                db.select({
                    totalRevenue: sql<string>`COALESCE(SUM(CASE WHEN ${payments.status} = 'paid' THEN ${payments.amount}::numeric ELSE 0 END), 0)`,
                    pendingRevenue: sql<string>`COALESCE(SUM(CASE WHEN ${payments.status} != 'paid' THEN ${payments.amount}::numeric ELSE 0 END), 0)`,
                }).from(payments)
                    .where(eq(payments.workspaceId, workspaceId)),
            ]);

            return {
                success: true,
                data: {
                    totalClients: clientCountResult[0]?.count || 0,
                    activeProjects: activeProjectCountResult[0]?.count || 0,
                    totalRevenue: Number(revenueResult[0]?.totalRevenue || 0),
                    pendingRevenue: Number(revenueResult[0]?.pendingRevenue || 0),
                }
            };
        } catch (error) {
            console.error('Error fetching client stats:', error);
            return { success: false, error: (error as Error).message };
        }
    });
}

/**
 * Fetch payments for a specific client
 */
export async function fetchClientPayments(clientId: string) {
    return withAuth(async (user, workspaceId) => {
        try {
            // Join payments through projects
            const clientProjects = await db.select({ id: projects.id }).from(projects).where(eq(projects.clientId, clientId));
            const projectIds = clientProjects.map(p => p.id);

            if (projectIds.length === 0) {
                return { success: true, data: [] };
            }

            const data = await db.query.payments.findMany({
                where: inArray(payments.projectId, projectIds),
                limit: 100,
            });

            return { success: true, data };
        } catch (error) {
            console.error('Error fetching client payments:', error);
            return { success: false, error: (error as Error).message };
        }
    });
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
    return withAuth(async (user, workspaceId) => {
        try {
            const limitCheck = await canCreateClient(workspaceId);
            if (!limitCheck.allowed) {
                return {
                    success: false,
                    error: `Workspace plan limit reached (${limitCheck.currentCount}/${limitCheck.maxAllowed} clients). Upgrade to Pro for unlimited clients.`,
                    requiresUpgrade: true,
                    planTier: limitCheck.planTier,
                };
            }

            const validatedData = createClientSchema.parse(data);
            const newClient = await createClient(validatedData);
            revalidatePath(`/${workspaceId}/clients`);
            return { success: true, data: newClient };
        } catch (error: any) {
            console.error('Error creating client:', error);
            if (error instanceof z.ZodError) {
                return { success: false, error: error.issues[0].message };
            }
            // Better error message for unique constraint violations
            if (error.code === '23505') {
                return { success: false, error: 'A client with this email already exists' };
            }
            return { success: false, error: error.message };
        }
    });
}

/**
 * Update a client
 */
export async function updateClientAction(id: string, data: UpdateClientInput) {
    return withAuth(async (user, workspaceId) => {
        try {
            const validatedData = updateClientSchema.parse(data);
            const updatedClient = await updateClient(id, validatedData);
            revalidatePath(`/${workspaceId}/clients`);
            revalidatePath(`/${workspaceId}/clients/${id}`);
            return { success: true, data: updatedClient };
        } catch (error: any) {
            console.error('Error updating client:', error);
            if (error instanceof z.ZodError) {
                return { success: false, error: error.issues[0].message };
            }
            return { success: false, error: error.message };
        }
    });
}

/**
 * Delete a client
 */
export async function deleteClientAction(id: string) {
    return withAuth(async (user, workspaceId) => {
        try {
            await deleteClient(id);
            revalidatePath(`/${workspaceId}/clients`);
            return { success: true };
        } catch (error) {
            console.error('Error deleting client:', error);
            return { success: false, error: (error as Error).message };
        }
    });
}

/**
 * Update client notes
 */
export async function updateClientNotesAction(id: string, notes: string) {
    return withAuth(async (user, workspaceId) => {
        try {
            await updateClientNotes(id, notes);
            revalidatePath(`/${workspaceId}/clients/${id}`);
            return { success: true };
        } catch (error) {
            console.error('Error updating client notes:', error);
            return { success: false, error: (error as Error).message };
        }
    });
}

/**
 * Import multiple clients
 */
export async function importClientsAction(clientsList: CreateClientInput[]) {
    return withAuth(async (user, workspaceId) => {
        try {
            const limitCheck = await canCreateClient(workspaceId);
            if (!limitCheck.allowed) {
                return {
                    success: false,
                    error: `Workspace plan limit reached (${limitCheck.currentCount}/${limitCheck.maxAllowed} clients). Upgrade to Pro to import clients.`,
                    requiresUpgrade: true,
                    planTier: limitCheck.planTier,
                };
            }
            if (typeof limitCheck.maxAllowed === 'number' && limitCheck.currentCount + clientsList.length > limitCheck.maxAllowed) {
                return {
                    success: false,
                    error: `Importing ${clientsList.length} clients exceeds your plan capacity (${limitCheck.currentCount}/${limitCheck.maxAllowed}). Upgrade to Pro.`,
                    requiresUpgrade: true,
                    planTier: limitCheck.planTier,
                };
            }

            // Prepare data with user_id and timestamps
            const clientsToInsert = clientsList.map(client => ({
                ...client,
                userId: user.id,
                workspaceId,

                lastContactDate: new Date(),
            }));

            const data = await db.insert(clients).values(clientsToInsert).returning();

            revalidatePath(`/${workspaceId}/clients`);
            return { success: true, count: data?.length || 0 };
        } catch (error: any) {
            console.error('Error importing clients:', error);
            // Check for potential duplicates if using unique constraint but ignoring conflicts
            if (error.code === '23505') {
                return { success: false, error: 'Some emails already exist. Please ensure emails are unique.' };
            }
            return { success: false, error: error.message };
        }
    });
}

/**
 * Update client status
 */
export async function updateClientStatusAction(id: string, status: 'active' | 'inactive' | 'archived' | 'lead') {
    return withAuth(async (user, workspaceId) => {
        try {
            await updateClient(id, { status });
            revalidatePath(`/${workspaceId}/clients`);
            revalidatePath(`/${workspaceId}/clients/${id}`);
            return { success: true };
        } catch (error) {
            console.error('Error updating client status:', error);
            return { success: false, error: (error as Error).message };
        }
    });
}
