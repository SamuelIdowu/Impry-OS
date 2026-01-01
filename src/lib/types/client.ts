export interface Client {
    id: string;
    user_id: string;
    name: string;
    email: string;
    company?: string | null;
    notes?: string | null;
    last_contact_date?: string | null;
    status: 'active' | 'inactive' | 'archived' | 'lead';
    created_at: string;
    updated_at: string;
}

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
}
