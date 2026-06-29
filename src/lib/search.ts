import { getCurrentWorkspaceId } from '@/server/actions/workspaces';
import { db } from '@/server/db';
import { clients, projects, payments } from '@/server/db/schema';
import { eq, or, ilike, isNotNull } from 'drizzle-orm';
import { getUser } from '@/lib/auth';

export type SearchResult = {
    type: 'client' | 'project' | 'invoice';
    id: string;
    title: string;
    subtitle?: string;
    url: string;
};

export async function searchGlobalData(query: string): Promise<SearchResult[]> {
    if (!query || query.length < 2) return [];

    const user = await getUser();
    if (!user) return [];

    const searchQuery = `%${query}%`;
    const results: SearchResult[] = [];

    // 1. Search Clients
    const foundClients = await db.query.clients.findMany({
        where: (clients, { and, or, eq, ilike }) => and(
            eq(clients.userId, user.id),
            or(
                ilike(clients.name, searchQuery),
                ilike(clients.company, searchQuery)
            )
        ),
        columns: {
            id: true,
            name: true,
            company: true
        },
        limit: 5
    });

    results.push(...foundClients.map(c => ({
        type: 'client' as const,
        id: c.id,
        title: c.name,
        subtitle: c.company || 'Client',
        url: `/clients/${c.id}`
    })));

    // 2. Search Projects
    const foundProjects = await db.query.projects.findMany({
        where: (projects, { and, eq, ilike }) => and(
            eq(projects.userId, user.id),
            ilike(projects.name, searchQuery)
        ),
        columns: {
            id: true,
            name: true,
            status: true
        },
        with: {
            client: {
                columns: {
                    name: true
                }
            }
        },
        limit: 5
    });

    results.push(...foundProjects.map(p => ({
        type: 'project' as const,
        id: p.id,
        title: p.name,
        subtitle: p.client?.name ? `Project for ${p.client.name}` : 'Project',
        url: `/projects/${p.id}`
    })));

    // 3. Search Invoices (Payments with invoiceNumber)
    const foundInvoices = await db.query.payments.findMany({
        where: (payments, { and, eq, ilike, isNotNull }) => and(
            eq(payments.userId, user.id),
            isNotNull(payments.invoiceNumber),
            ilike(payments.invoiceNumber, searchQuery)
        ),
        columns: {
            id: true,
            invoiceNumber: true,
            amount: true
        },
        with: {
            client: {
                columns: {
                    name: true
                }
            }
        },
        limit: 5
    });

    results.push(...foundInvoices.map(i => ({
        type: 'invoice' as const,
        id: i.id,
        title: i.invoiceNumber!,
        subtitle: `$${i.amount} - ${i.client?.name || 'Unknown Client'}`,
        url: `/invoices/${i.id}`
    })));

    return results;
}
