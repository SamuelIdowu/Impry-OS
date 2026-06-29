// Scope version types for Sprint 5: Scope Management

export interface ScopeVersion {
    id: string;
    projectId: string;
    userId: string;
    versionNumber: number;
    deliverables: string | null;
    outOfScope: string | null;
    assumptions: string | null;
    shareToken: string | null;
    createdBy: string;
    createdAt: string | Date;
    updatedAt: string | Date;
}

export interface ScopeVersionWithProject extends ScopeVersion {
    project?: {
        id: string;
        name: string;
        status: string;
    } | null;
}

export interface CreateScopeVersionInput {
    projectId: string;
    deliverables?: string;
    outOfScope?: string;
    assumptions?: string;
}

export interface UpdateScopeVersionInput {
    deliverables?: string;
    outOfScope?: string;
    assumptions?: string;
}

// Helper type for scope sections
export type ScopeSection = 'deliverables' | 'outOfScope' | 'assumptions';

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
