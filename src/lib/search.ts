import { getCurrentWorkspaceId } from '@/lib/workspace';
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

export async function searchGlobalData(query: string, workspaceId?: string): Promise<SearchResult[]> {
    if (!query || query.length < 2) return [];

    const user = await getUser();
    if (!user) return [];

    let targetWorkspaceId = workspaceId;
    if (!targetWorkspaceId) {
        try {
            targetWorkspaceId = await getCurrentWorkspaceId();
        } catch {
            // Fallback: look up user's primary workspace
            const { teamMembers } = await import('@/server/db/schema');
            const [membership] = await db
                .select({ workspaceId: teamMembers.workspaceId })
                .from(teamMembers)
                .where(eq(teamMembers.userId, user.id))
                .limit(1);
            targetWorkspaceId = membership?.workspaceId || 'default';
        }
    }

    const searchQuery = `%${query}%`;

    // Run all three searches in parallel
    const [foundClients, foundProjects, foundInvoices] = await Promise.all([
        db.query.clients.findMany({
            where: (clients, { and, or, eq, ilike }) => and(
                targetWorkspaceId && targetWorkspaceId !== 'default'
                    ? eq(clients.workspaceId, targetWorkspaceId)
                    : eq(clients.userId, user.id),
                or(
                    ilike(clients.name, searchQuery),
                    ilike(clients.company, searchQuery)
                )
            ),
            columns: { id: true, name: true, company: true },
            limit: 5
        }),
        db.query.projects.findMany({
            where: (projects, { and, eq, ilike }) => and(
                targetWorkspaceId && targetWorkspaceId !== 'default'
                    ? eq(projects.workspaceId, targetWorkspaceId)
                    : eq(projects.userId, user.id),
                ilike(projects.name, searchQuery)
            ),
            columns: { id: true, name: true, status: true },
            with: { client: { columns: { name: true } } },
            limit: 5
        }),
        db.query.payments.findMany({
            where: (payments, { and, eq, ilike, isNotNull }) => and(
                eq(payments.userId, user.id),
                isNotNull(payments.invoiceNumber),
                ilike(payments.invoiceNumber, searchQuery)
            ),
            columns: { id: true, invoiceNumber: true, amount: true },
            with: { client: { columns: { name: true } } },
            limit: 5
        }),
    ]);

    const results: SearchResult[] = [];
    const wsPrefix = targetWorkspaceId ? `/${targetWorkspaceId}` : '';

    results.push(...foundClients.map(c => ({
        type: 'client' as const,
        id: c.id,
        title: c.name,
        subtitle: c.company || 'Client',
        url: `${wsPrefix}/clients/${c.id}`
    })));

    results.push(...foundProjects.map(p => ({
        type: 'project' as const,
        id: p.id,
        title: p.name,
        subtitle: p.client?.name ? `Project for ${p.client.name}` : 'Project',
        url: `${wsPrefix}/projects/${p.id}`
    })));

    results.push(...foundInvoices.map(i => ({
        type: 'invoice' as const,
        id: i.id,
        title: i.invoiceNumber!,
        subtitle: `$${i.amount} - ${i.client?.name || 'Unknown Client'}`,
        url: `${wsPrefix}/invoices/${i.id}`
    })));

    return results;
}
