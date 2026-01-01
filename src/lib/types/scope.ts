// Scope version types for Sprint 5: Scope Management

export interface ScopeVersion {
    id: string;
    project_id: string;
    user_id: string;
    version_number: number;
    deliverables: string | null;
    out_of_scope: string | null;
    assumptions: string | null;
    share_token: string;
    created_by: string;
    created_at: string;
    updated_at: string;
}

export interface ScopeVersionWithProject extends ScopeVersion {
    project?: {
        id: string;
        name: string;
        status: string;
    } | null;
}

export interface CreateScopeVersionInput {
    project_id: string;
    deliverables?: string;
    out_of_scope?: string;
    assumptions?: string;
}

export interface UpdateScopeVersionInput {
    deliverables?: string;
    out_of_scope?: string;
    assumptions?: string;
}

// Helper type for scope sections
export type ScopeSection = 'deliverables' | 'out_of_scope' | 'assumptions';

export interface ScopeSectionConfig {
    id: ScopeSection;
    label: string;
    icon: string;
    description: string;
    placeholder: string;
    color: {
        bg: string;
        text: string;
        border: string;
        icon: string;
    };
}
