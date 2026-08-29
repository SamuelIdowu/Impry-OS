'use server';
import { getCurrentWorkspaceId } from '@/lib/workspace';

import { getUser, auth } from '@/lib/auth';
import { canUseCustomBranding } from '@/lib/payments/guards';
import { db } from '@/server/db';
import { users, sessions } from '@/server/db/schema';
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

        revalidatePath('/settings');
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

        // Fetch user's active workspace plan tier
        const { teamMembers, workspaces } = await import('@/server/db/schema');
        const [ws] = await db
            .select({ planTier: workspaces.planTier })
            .from(teamMembers)
            .innerJoin(workspaces, eq(teamMembers.workspaceId, workspaces.id))
            .where(eq(teamMembers.userId, user.id))
            .limit(1);

        const enhancedProfile = {
            ...profile,
            subscription_plan: ws?.planTier || 'free',
        };

        return { success: true, profile: enhancedProfile };
    } catch (error) {
        return { success: false, error: 'Failed to fetch profile' };
    }
}

export async function updateBrandingAction(data: { logo_url?: string; brand_color?: string }, workspaceId?: string) {
    try {
        const user = await getUser();

        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        if (workspaceId) {
            const limitCheck = await canUseCustomBranding(workspaceId);
            if (!limitCheck.allowed) {
                return {
                    success: false,
                    error: 'Custom branding is a Pro & Studio plan feature. Upgrade to Pro to customize logo & accent colors.',
                    requiresUpgrade: true,
                    planTier: limitCheck.planTier,
                };
            }
        }

        await db.update(users)
            .set({
                logoUrl: data.logo_url,
                brandColor: data.brand_color,
                updatedAt: new Date()
            })
            .where(eq(users.id, user.id));

        revalidatePath('/settings');
        return { success: true };
    } catch (error) {
        console.error('Error in updateBrandingAction:', error);
        return { success: false, error: 'Failed to update branding' };
    }
}

export async function signOutAllSessionsAction() {
    try {
        const user = await getUser();
        if (!user) return { success: false, error: 'Not authenticated' };
        
        await auth.api.revokeSessions({
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

        // Delete user's active sessions in DB first
        try {
            await db.delete(sessions).where(eq(sessions.userId, user.id));
        } catch (e) {
            console.error('Error deleting sessions:', e);
        }

        // Delete user record from database
        await db.delete(users).where(eq(users.id, user.id));

        return { success: true, message: 'Account deleted successfully' };
    } catch (error) {
        console.error('Error in deleteAccountAction:', error);
        return { success: false, error: 'Failed to delete account' };
    }
}

// Stubs for features not yet implemented
export async function updatePasswordAction(_password: string): Promise<{ success: boolean; error?: string; data?: any }> {
    return { success: false, error: 'Use Better Auth client to update password' };
}

export async function enrollMfaAction(): Promise<{ success: boolean; error?: string; data?: any }> {
    return { success: false, error: 'MFA not supported in this version yet' };
}

export async function verifyMfaAction(_factorId: string, _code: string): Promise<{ success: boolean; error?: string; data?: any }> {
    return { success: false, error: 'MFA not supported in this version yet' };
}

export async function unenrollMfaAction(_factorId: string): Promise<{ success: boolean; error?: string; data?: any }> {
    return { success: false, error: 'MFA not supported in this version yet' };
}

export async function getMfaFactorsAction() {
    return { success: true, factors: [] };
}
