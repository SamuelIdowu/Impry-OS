import { getCurrentWorkspaceId } from '@/lib/workspace';
import { db } from '@/server/db';
import { clients, projects, users, payments } from '@/server/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { getUser } from './auth';
import type { Client, CreateClientInput, UpdateClientInput, ClientWithProjects } from './types/client';

export async function getClients(): Promise<ClientWithProjects[]> {
    const user = await getUser();
    if (!user) throw new Error('User not authenticated');

    const result = await db.query.clients.findMany({
        where: and(eq(clients.workspaceId, await getCurrentWorkspaceId()), eq(clients.userId, user.id)),
        orderBy: [desc(clients.createdAt)],
        limit: 100,
        with: {
            projects: {
                columns: { id: true, name: true, status: true }
            },
            payments: {
                columns: { amount: true, status: true }
            }
        }
    });

    return result.map((client: any) => ({
        ...client,
        active_projects_count: client.projects?.filter(
            (p: any) => p.status === 'in_progress' || p.status === 'review' || p.status === 'planning'
        ).length || 0,
        totalRevenue: client.payments?.filter((p: any) => p.status === 'paid').reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0,
    })) as ClientWithProjects[];
}

export async function getClientById(id: string): Promise<ClientWithProjects | null> {
    const user = await getUser();
    if (!user) throw new Error('User not authenticated');

    const client = await db.query.clients.findFirst({
        where: and(eq(clients.id, id), eq(clients.workspaceId, await getCurrentWorkspaceId()), eq(clients.userId, user.id)),
        with: {
            projects: {
                columns: { id: true, name: true, status: true }
            },
            payments: {
                columns: { amount: true, status: true }
            }
        }
    });

    if (!client) return null;

    return {
        ...client,
        active_projects_count: client.projects?.filter(
            (p: any) => p.status === 'in_progress' || p.status === 'review' || p.status === 'planning'
        ).length || 0,
        totalRevenue: client.payments?.filter((p: any) => p.status === 'paid').reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0,
    } as ClientWithProjects;
}

export async function createClient(input: CreateClientInput): Promise<Client> {
    const user = await getUser();
    if (!user) throw new Error('User not authenticated');

    const [newClient] = await db.insert(clients).values({
        ...input,
        userId: user.id,
        workspaceId: await getCurrentWorkspaceId(),

        lastContactDate: new Date(),
    }).returning();

    return newClient as Client;
}

export async function updateClient(id: string, input: UpdateClientInput): Promise<Client> {
    const user = await getUser();
    if (!user) throw new Error('User not authenticated');

    const [updatedClient] = await db.update(clients).set({
        ...input,
        updatedAt: new Date(),
    })
    .where(and(eq(clients.id, id), eq(clients.workspaceId, await getCurrentWorkspaceId()), eq(clients.userId, user.id)))
    .returning();

    return updatedClient as Client;
}

export async function deleteClient(id: string): Promise<void> {
    const user = await getUser();
    if (!user) throw new Error('User not authenticated');

    await db.delete(clients).where(and(eq(clients.id, id), eq(clients.workspaceId, await getCurrentWorkspaceId()), eq(clients.userId, user.id)));
}

export async function updateLastContactDate(id: string): Promise<void> {
    const user = await getUser();
    if (!user) throw new Error('User not authenticated');

    await db.update(clients)
        .set({ lastContactDate: new Date() })
        .where(and(eq(clients.id, id), eq(clients.workspaceId, await getCurrentWorkspaceId()), eq(clients.userId, user.id)));
}

export async function updateClientNotes(id: string, notes: string): Promise<void> {
    const user = await getUser();
    if (!user) throw new Error('User not authenticated');

    await db.update(clients)
        .set({ 
            notes,
            lastContactDate: new Date(),
            updatedAt: new Date(),
        })
        .where(and(eq(clients.id, id), eq(clients.workspaceId, await getCurrentWorkspaceId()), eq(clients.userId, user.id)));
}
