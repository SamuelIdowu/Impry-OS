import { InferSelectModel } from 'drizzle-orm';
import { clients } from '@/server/db/schema';

export type Client = InferSelectModel<typeof clients>;

export interface CreateClientInput {
    name: string;
    email: string;
    company?: string;
    notes?: string;
    status?: 'active' | 'inactive' | 'archived' | 'lead';
}

export interface UpdateClientInput {
    name?: string;
    email?: string;
    company?: string;
    notes?: string;
    status?: 'active' | 'inactive' | 'archived' | 'lead';
}

export interface ClientWithProjects extends Client {
    projects?: {
        id: string;
        name: string;
        status: string;
    }[];
    active_projects_count: number;
    totalRevenue?: number;
}
