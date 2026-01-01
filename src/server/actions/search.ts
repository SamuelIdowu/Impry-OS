"use server";

import { createClient } from "@/lib/auth";

export type SearchResult = {
    type: 'client' | 'project' | 'invoice';
    id: string;
    title: string;
    subtitle?: string;
    url: string;
};

export async function searchGlobal(query: string): Promise<SearchResult[]> {
    if (!query || query.length < 2) return [];

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const searchQuery = `%${query}%`;
    const results: SearchResult[] = [];

    // 1. Search Clients
    const { data: clients } = await supabase
        .from('clients')
        .select('id, name, company')
        .eq('user_id', user.id)
        .or(`name.ilike.${searchQuery},company.ilike.${searchQuery}`)
        .limit(5);

    if (clients) {
        results.push(...clients.map(c => ({
            type: 'client' as const,
            id: c.id,
            title: c.name,
            subtitle: c.company || 'Client',
            url: `/clients/${c.id}`
        })));
    }

    // 2. Search Projects
    const { data: projects } = await supabase
        .from('projects')
        .select('id, name, status, client:clients(name)')
        .eq('user_id', user.id)
        .ilike('name', searchQuery)
        .limit(5);

    if (projects) {
        results.push(...projects.map(p => ({
            type: 'project' as const,
            id: p.id,
            title: p.name,
            subtitle: (p.client as any)?.name ? `Project for ${(p.client as any).name}` : 'Project',
            url: `/projects/${p.id}`
        })));
    }

    // 3. Search Invoices (Payments with invoice_number)
    const { data: invoices } = await supabase
        .from('payments')
        .select('id, invoice_number, amount, client:clients(name)')
        .eq('user_id', user.id)
        .not('invoice_number', 'is', null)
        .ilike('invoice_number', searchQuery)
        .limit(5);

    if (invoices) {
        results.push(...invoices.map(i => ({
            type: 'invoice' as const,
            id: i.id,
            title: i.invoice_number!,
            subtitle: `$${i.amount} - ${(i.client as any)?.name || 'Unknown Client'}`,
            url: `/invoices/${i.id}`
        })));
    }

    return results;
}
