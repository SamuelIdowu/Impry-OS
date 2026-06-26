import { db } from '@/server/db';
import { eq, and, desc } from 'drizzle-orm';
import { scopeVersions, projects, timelineEvents } from '@/server/db/schema';
import { getUser } from './auth';
import type {
    ScopeVersion,
    ScopeVersionWithProject,
    CreateScopeVersionInput,
} from './types/scope';

/**
 * Get all scope versions for a project (most recent first)
 */
export async function getScopeVersions(projectId: string): Promise<ScopeVersion[]> {
    const user = await getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    const data = await db.query.scopeVersions.findMany({
        where: and(
            eq(scopeVersions.projectId, projectId),
            eq(scopeVersions.userId, user.id)
        ),
        orderBy: [desc(scopeVersions.versionNumber)]
    });

    return data as unknown as ScopeVersion[];
}

/**
 * Get the latest scope version for a project
 */
export async function getLatestScopeVersion(projectId: string): Promise<ScopeVersion | null> {
    const user = await getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    const data = await db.query.scopeVersions.findFirst({
        where: and(
            eq(scopeVersions.projectId, projectId),
            eq(scopeVersions.userId, user.id)
        ),
        orderBy: [desc(scopeVersions.versionNumber)]
    });

    if (!data) return null;

    return data as unknown as ScopeVersion;
}

/**
 * Get a specific scope version by ID
 */
export async function getScopeVersionById(versionId: string): Promise<ScopeVersion | null> {
    const user = await getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    const data = await db.query.scopeVersions.findFirst({
        where: and(
            eq(scopeVersions.id, versionId),
            eq(scopeVersions.userId, user.id)
        )
    });

    if (!data) return null;

    return data as unknown as ScopeVersion;
}

/**
 * Create a new scope version
 * Automatically increments version number
 */
export async function createScopeVersion(input: CreateScopeVersionInput): Promise<ScopeVersion> {
    const user = await getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    // Verify project belongs to user
    const project = await db.query.projects.findFirst({
        where: and(
            eq(projects.id, input.projectId),
            eq(projects.userId, user.id)
        ),
        columns: { id: true }
    });

    if (!project) {
        throw new Error('Project not found or does not belong to user');
    }

    // Get next version number
    const latestVersion = await db.query.scopeVersions.findFirst({
        where: eq(scopeVersions.projectId, input.projectId),
        orderBy: [desc(scopeVersions.versionNumber)],
        columns: { versionNumber: true }
    });

    const nextVersion = (latestVersion?.versionNumber || 0) + 1;

    // Create the new scope version
    const [data] = await db.insert(scopeVersions)
        .values({
            projectId: input.projectId,
            userId: user.id,
            versionNumber: nextVersion,
            deliverables: input.deliverables || null,
            outOfScope: input.outOfScope || null,
            assumptions: input.assumptions || null,
            createdBy: user.id,
        })
        .returning();

    return data as unknown as ScopeVersion;
}

/**
 * Get scope version by share token (public access, no auth required)
 */
export async function getScopeByShareToken(token: string): Promise<ScopeVersionWithProject | null> {
    const data = await db.query.scopeVersions.findFirst({
        where: eq(scopeVersions.shareToken, token),
        with: {
            project: {
                columns: { id: true, name: true, status: true }
            }
        }
    });

    if (!data) return null;

    return data as unknown as ScopeVersionWithProject;
}

/**
 * Get the share URL for a scope version
 */
export function getScopeShareUrl(shareToken: string, baseUrl?: string): string {
    const base = baseUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return `${base}/scope/share/${shareToken}`;
}

/**
 * Log scope created
 */
export async function logScopeCreated(
    projectId: string,
    versionNumber: number,
    shareToken: string
): Promise<void> {
    const user = await getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    await db.insert(timelineEvents).values({
        userId: user.id,
        projectId: projectId,
        eventType: 'scope_update',
        title: `Scope v${versionNumber} created`,
        description: `Project scope version ${versionNumber} was created and saved`,
        metadata: {
            version: versionNumber,
            shareToken: shareToken,
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
    const user = await getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    await db.insert(timelineEvents).values({
        userId: user.id,
        projectId: projectId,
        eventType: 'scope_update',
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
