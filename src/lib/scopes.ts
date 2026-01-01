import { createClient } from './auth';
import type {
    ScopeVersion,
    ScopeVersionWithProject,
    CreateScopeVersionInput,
} from './types/scope';

/**
 * Get all scope versions for a project (most recent first)
 */
export async function getScopeVersions(projectId: string): Promise<ScopeVersion[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
        .from('scope_versions')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .order('version_number', { ascending: false });

    if (error) {
        throw error;
    }

    return data || [];
}

/**
 * Get the latest scope version for a project
 */
export async function getLatestScopeVersion(projectId: string): Promise<ScopeVersion | null> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
        .from('scope_versions')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .order('version_number', { ascending: false })
        .limit(1)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return null; // No versions yet
        }
        throw error;
    }

    return data;
}

/**
 * Get a specific scope version by ID
 */
export async function getScopeVersionById(versionId: string): Promise<ScopeVersion | null> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
        .from('scope_versions')
        .select('*')
        .eq('id', versionId)
        .eq('user_id', user.id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return null;
        }
        throw error;
    }

    return data;
}

/**
 * Create a new scope version
 * Automatically increments version number
 */
export async function createScopeVersion(input: CreateScopeVersionInput): Promise<ScopeVersion> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    // Verify project belongs to user
    const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('id')
        .eq('id', input.project_id)
        .eq('user_id', user.id)
        .single();

    if (projectError || !project) {
        throw new Error('Project not found or does not belong to user');
    }

    // Get next version number using the database function
    const { data: versionData, error: versionError } = await supabase
        .rpc('get_next_scope_version_number', { p_project_id: input.project_id });

    if (versionError) {
        throw versionError;
    }

    const nextVersion = versionData as number;

    // Create the new scope version
    const { data, error } = await supabase
        .from('scope_versions')
        .insert({
            project_id: input.project_id,
            user_id: user.id,
            version_number: nextVersion,
            deliverables: input.deliverables || null,
            out_of_scope: input.out_of_scope || null,
            assumptions: input.assumptions || null,
            created_by: user.id,
        })
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}

/**
 * Get scope version by share token (public access, no auth required)
 */
export async function getScopeByShareToken(token: string): Promise<ScopeVersionWithProject | null> {
    const supabase = await createClient();
    // Create a new supabase client without auth for public access
    const { data, error } = await supabase
        .from('scope_versions')
        .select(`
            *,
            project:projects(id, name, status)
        `)
        .eq('share_token', token)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return null;
        }
        throw error;
    }

    return data as ScopeVersionWithProject;
}

/**
 * Get the share URL for a scope version
 */
export function getScopeShareUrl(shareToken: string, baseUrl?: string): string {
    const base = baseUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return `${base}/scope/share/${shareToken}`;
}

/**
 * Log scope creation to timeline
 */
export async function logScopeCreated(
    projectId: string,
    versionNumber: number,
    shareToken: string
): Promise<void> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    await supabase
        .from('timeline_events')
        .insert({
            user_id: user.id,
            project_id: projectId,
            event_type: 'scope_update',
            title: `Scope v${versionNumber} created`,
            description: `Project scope version ${versionNumber} was created and saved`,
            metadata: {
                version: versionNumber,
                share_token: shareToken,
                link: `/scope/share/${shareToken}`
            }
        });
}

/**
 * Log scope update to timeline
 */
export async function logScopeUpdated(
    projectId: string,
    oldVersion: number,
    newVersion: number,
    shareToken: string
): Promise<void> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    await supabase
        .from('timeline_events')
        .insert({
            user_id: user.id,
            project_id: projectId,
            event_type: 'scope_update',
            title: `Scope updated v${oldVersion} → v${newVersion}`,
            description: `Project scope was updated from version ${oldVersion} to version ${newVersion}`,
            metadata: {
                old_version: oldVersion,
                new_version: newVersion,
                share_token: shareToken,
                link: `/scope/share/${shareToken}`
            }
        });
}
