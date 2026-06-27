'use server';

import {
    getScopeVersions,
    getLatestScopeVersion,
    createScopeVersion,
    getScopeByShareToken,
    getScopeShareUrl,
    logScopeCreated,
    logScopeUpdated,
} from '@/lib/scopes';
import type { CreateScopeVersionInput } from '@/lib/types/scope';
import { revalidatePath } from 'next/cache';

/**
 * Fetch all scope versions for a project
 */
export async function fetchScopeVersions(projectId: string) {
    try {
        const versions = await getScopeVersions(projectId);
        return { success: true, data: versions };
    } catch (error) {
        console.error('Error fetching scope versions:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch scope versions',
        };
    }
}

/**
 * Fetch the latest scope version for a project
 */
export async function fetchLatestScopeVersion(projectId: string) {
    try {
        const version = await getLatestScopeVersion(projectId);
        return { success: true, data: version };
    } catch (error) {
        console.error('Error fetching latest scope version:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch latest scope version',
        };
    }
}

/**
 * Create a new scope version (save & freeze)
 */
export async function createScopeVersionAction(input: CreateScopeVersionInput) {
    try {
        // Get the current latest version to determine if this is first version or an update
        const currentVersion = await getLatestScopeVersion(input.projectId);

        // Create the new version
        const newVersion = await createScopeVersion(input);

        // Log to timeline
        if (currentVersion) {
            await logScopeUpdated(
                input.projectId,
                currentVersion.versionNumber,
                newVersion.versionNumber,
                newVersion.shareToken || ''
            );
        } else {
            await logScopeCreated(
                input.projectId,
                newVersion.versionNumber,
                newVersion.shareToken || ''
            );
        }

        // Revalidate the project page
        revalidatePath('/', 'layout');

        return {
            success: true,
            data: {
                version: newVersion,
                shareUrl: getScopeShareUrl(newVersion.shareToken || ''),
            },
        };
    } catch (error) {
        console.error('Error creating scope version:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create scope version',
        };
    }
}

/**
 * Fetch scope version by share token (public, no auth)
 */
export async function fetchScopeByShareToken(token: string) {
    try {
        const scope = await getScopeByShareToken(token);
        return { success: true, data: scope };
    } catch (error) {
        console.error('Error fetching scope by share token:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch scope',
        };
    }
}

