'use server';
import { getCurrentWorkspaceId } from '@/server/actions/workspaces';

import { getUser, auth } from '@/lib/auth';
import { db } from '@/server/db';
import { users } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

export async function updateProfileAction(data: { name: string; bio: string }) {
    try {
        const user = await getUser();

        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        // Update DB
        await db.update(users)
            .set({ name: data.name, updatedAt: new Date() })
            .where(eq(users.id, user.id));

        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error) {
        console.error('Error in updateProfileAction:', error);
        return { success: false, error: 'Failed to update profile' };
    }
}

export async function getProfileAction() {
    try {
        const user = await getUser();

        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        const [profile] = await db.select().from(users).where(eq(users.id, user.id));

        if (!profile) {
            return { success: false, error: 'Profile not found' };
        }

        return { success: true, profile };
    } catch (error) {
        return { success: false, error: 'Failed to fetch profile' };
    }
}

export async function updateBrandingAction(data: { logo_url?: string; brand_color?: string }) {
    try {
        const user = await getUser();

        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        await db.update(users)
            .set({
                logoUrl: data.logo_url,
                brandColor: data.brand_color,
                updatedAt: new Date()
            })
            .where(eq(users.id, user.id));

        revalidatePath('/', 'layout');
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error) {
        console.error('Error in updateBrandingAction:', error);
        return { success: false, error: 'Failed to update branding' };
    }
}

export async function updatePasswordAction(password: string) {
    try {
        return { success: false, error: 'Use Better Auth client to update password' };
    } catch (error) {
        console.error('Error in updatePasswordAction:', error);
        return { success: false, error: 'Failed to update password' };
    }
}

export async function signOutAllSessionsAction() {
    try {
        const user = await getUser();
        if (!user) return { success: false, error: 'Not authenticated' };
        
        await auth.api.revokeOtherSessions({
            headers: await headers()
        });

        return { success: true };
    } catch (error) {
        console.error('Error in signOutAllSessionsAction:', error);
        return { success: false, error: 'Failed to sign out all sessions' };
    }
}

export async function deleteAccountAction() {
    try {
        const user = await getUser();

        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        await db.delete(users).where(eq(users.id, user.id));
        return { success: true, message: 'Account deletion requested. You will be signed out.' };
    } catch (error) {
        console.error('Error in deleteAccountAction:', error);
        return { success: false, error: 'Failed to delete account' };
    }
}

export async function enrollMfaAction(): Promise<{ success: boolean, data?: any, error?: string }> {
    return { success: false, error: 'MFA not supported in this version yet' };
}

export async function verifyMfaAction(factorId: string, code: string) {
    return { success: false, error: 'MFA not supported in this version yet' };
}

export async function unenrollMfaAction(factorId: string) {
    return { success: false, error: 'MFA not supported in this version yet' };
}

export async function getMfaFactorsAction() {
    return { success: true, factors: [] };
}

