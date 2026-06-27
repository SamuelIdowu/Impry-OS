import { db } from '@/server/db';
import { clients, projects, users, payments } from '@/server/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { getUser } from './auth';
import type { Client, CreateClientInput, UpdateClientInput, ClientWithProjects } from './types/client';

export async function getClients(): Promise<ClientWithProjects[]> {
    const user = await getUser();
    if (!user) throw new Error('User not authenticated');

    const result = await db.query.clients.findMany({
        where: eq(clients.userId, user.id),
        orderBy: [desc(clients.createdAt)],
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
    })) as unknown as ClientWithProjects[];
}

export async function getClientById(id: string): Promise<ClientWithProjects | null> {
    const user = await getUser();
    if (!user) throw new Error('User not authenticated');

    const client = await db.query.clients.findFirst({
        where: and(eq(clients.id, id), eq(clients.userId, user.id)),
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
    } as unknown as ClientWithProjects;
}

export async function createClient(input: CreateClientInput): Promise<Client> {
    const user = await getUser();
    if (!user) throw new Error('User not authenticated');

    const existingClients = await db.select({ id: clients.id }).from(clients).where(eq(clients.userId, user.id));
    
    // Free plan check (assuming all users are free unless we add subscription_plan column)
    if (existingClients.length >= 3) {
        throw new Error('Free plan limit reached. Upgrade to Pro to add more clients.');
    }

    const [newClient] = await db.insert(clients).values({
        ...input,
        userId: user.id,
        lastContactDate: new Date(),
    }).returning();

    return newClient as unknown as Client;
}

export async function updateClient(id: string, input: UpdateClientInput): Promise<Client> {
    const user = await getUser();
    if (!user) throw new Error('User not authenticated');

    const [updatedClient] = await db.update(clients).set({
        ...input,
        updatedAt: new Date(),
    })
    .where(and(eq(clients.id, id), eq(clients.userId, user.id)))
    .returning();

    return updatedClient as unknown as Client;
}

export async function deleteClient(id: string): Promise<void> {
    const user = await getUser();
    if (!user) throw new Error('User not authenticated');

    await db.delete(clients).where(and(eq(clients.id, id), eq(clients.userId, user.id)));
}

export async function updateLastContactDate(id: string): Promise<void> {
    const user = await getUser();
    if (!user) throw new Error('User not authenticated');

    await db.update(clients)
        .set({ lastContactDate: new Date() })
        .where(and(eq(clients.id, id), eq(clients.userId, user.id)));
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
        .where(and(eq(clients.id, id), eq(clients.userId, user.id)));
}
