'use server';

import { revalidatePath } from 'next/cache';
import {
    getTeamMembers,
    createTeamMember,
    updateTeamMember,
    deleteTeamMember,
    getWorkspaceMembers,
    updateWorkspaceMemberRole,
    removeWorkspaceMember
} from '@/lib/team';
import { withAuth } from '@/lib/auth-guard';
import { canInviteTeamMember } from '@/lib/payments/guards';
import { db } from '@/server/db';
import { workspaceMembers } from '@/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const createTeamMemberSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    role: z.string().optional().nullable(),
    email: z.string().email('Invalid email').optional().or(z.literal('')).nullable(),
    avatar_url: z.string().url('Invalid URL').optional().or(z.literal('')).nullable(),
});

const updateTeamMemberSchema = createTeamMemberSchema.partial();

export async function getTeamMembersAction(providedWorkspaceId?: string) {
    return withAuth(async (user, workspaceId) => {
        try {
            const members = await getTeamMembers(workspaceId);
            return { success: true, members };
        } catch (error) {
            console.error('Error in getTeamMembersAction:', error);
            return { success: false, error: 'Failed to fetch team members', members: [] };
        }
    }, providedWorkspaceId);
}

export async function addTeamMemberAction(data: {
    name: string;
    role?: string | null;
    email?: string | null;
    avatar_url?: string | null;
    workspaceId?: string;
}) {
    return withAuth(async (user, workspaceId) => {
        try {
            const limitCheck = await canInviteTeamMember(workspaceId);
            if (!limitCheck.allowed) {
                return {
                    success: false,
                    error: `Your current workspace plan allows up to ${limitCheck.maxAllowed} team seat(s). Upgrade to Studio Plan for up to 5 team members.`,
                    requiresUpgrade: true,
                    planTier: limitCheck.planTier,
                };
            }

            const validatedData = createTeamMemberSchema.parse(data);
            
            const newMember = await createTeamMember({
                name: validatedData.name,
                role: validatedData.role || null,
                email: validatedData.email || null,
                avatarUrl: validatedData.avatar_url || null,
                workspaceId,
            });

            revalidatePath(`/${workspaceId}/settings`);
            return { success: true, member: newMember };
        } catch (error: any) {
            console.error('Error in addTeamMemberAction:', error);
            if (error instanceof z.ZodError) {
                return { success: false, error: error.issues[0].message };
            }
            return { success: false, error: error.message || 'Failed to add team member' };
        }
    }, data.workspaceId);
}

export async function updateTeamMemberAction(
    memberId: string,
    data: {
        name?: string;
        role?: string | null;
        email?: string | null;
        avatar_url?: string | null;
        workspaceId?: string;
    }
) {
    return withAuth(async (user, workspaceId) => {
        try {
            const validatedData = updateTeamMemberSchema.parse(data);
            
            const updated = await updateTeamMember(memberId, {
                ...(validatedData.name !== undefined && { name: validatedData.name }),
                ...(validatedData.role !== undefined && { role: validatedData.role || null }),
                ...(validatedData.email !== undefined && { email: validatedData.email || null }),
                ...(validatedData.avatar_url !== undefined && { avatarUrl: validatedData.avatar_url || null }),
            }, workspaceId);

            revalidatePath(`/${workspaceId}/settings`);
            return { success: true, member: updated };
        } catch (error: any) {
            console.error('Error in updateTeamMemberAction:', error);
            if (error instanceof z.ZodError) {
                return { success: false, error: error.issues[0].message };
            }
            return { success: false, error: error.message || 'Failed to update team member' };
        }
    }, data.workspaceId);
}

export async function deleteTeamMemberAction(memberId: string, providedWorkspaceId?: string) {
    return withAuth(async (user, workspaceId) => {
        try {
            await deleteTeamMember(memberId, workspaceId);
            revalidatePath(`/${workspaceId}/settings`);
            return { success: true };
        } catch (error) {
            console.error('Error in deleteTeamMemberAction:', error);
            return { success: false, error: 'Failed to delete team member' };
        }
    }, providedWorkspaceId);
}

// -------------------------------------------------------------
// Multi-User Workspace Members Server Actions
// -------------------------------------------------------------

/**
 * Get full list of authenticated workspace members with user details
 */
export async function getWorkspaceMembersAction(providedWorkspaceId?: string) {
    return withAuth(async (user, workspaceId) => {
        try {
            const members = await getWorkspaceMembers(workspaceId);
            return {
                success: true,
                members,
                currentUserId: user.id
            };
        } catch (error: any) {
            console.error('Error in getWorkspaceMembersAction:', error);
            return { success: false, error: error.message || 'Failed to fetch workspace members', members: [] };
        }
    }, providedWorkspaceId);
}

/**
 * Update member role (Owner / Admin only)
 */
export async function updateWorkspaceMemberRoleAction(
    membershipId: string,
    newRole: 'admin' | 'member',
    providedWorkspaceId?: string
) {
    return withAuth(async (user, workspaceId) => {
        try {
            // Verify caller has permissions
            const callerMembership = await db.query.workspaceMembers.findFirst({
                where: and(
                    eq(workspaceMembers.workspaceId, workspaceId),
                    eq(workspaceMembers.userId, user.id)
                )
            });

            if (!callerMembership || (callerMembership.role !== 'owner' && callerMembership.role !== 'admin')) {
                return { success: false, error: 'Unauthorized to change member roles' };
            }

            // Target member check
            const targetMembership = await db.query.workspaceMembers.findFirst({
                where: and(
                    eq(workspaceMembers.id, membershipId),
                    eq(workspaceMembers.workspaceId, workspaceId)
                )
            });

            if (!targetMembership) {
                return { success: false, error: 'Member not found in this workspace' };
            }

            if (targetMembership.role === 'owner') {
                return { success: false, error: 'Workspace owner role cannot be changed' };
            }

            await updateWorkspaceMemberRole(membershipId, workspaceId, newRole);

            revalidatePath(`/${workspaceId}/settings`);
            return { success: true };
        } catch (error: any) {
            console.error('Error in updateWorkspaceMemberRoleAction:', error);
            return { success: false, error: error.message || 'Failed to update member role' };
        }
    }, providedWorkspaceId);
}

/**
 * Remove a member from the workspace (Owner / Admin only)
 */
export async function removeWorkspaceMemberAction(
    membershipId: string,
    providedWorkspaceId?: string
) {
    return withAuth(async (user, workspaceId) => {
        try {
            const callerMembership = await db.query.workspaceMembers.findFirst({
                where: and(
                    eq(workspaceMembers.workspaceId, workspaceId),
                    eq(workspaceMembers.userId, user.id)
                )
            });

            if (!callerMembership || (callerMembership.role !== 'owner' && callerMembership.role !== 'admin')) {
                return { success: false, error: 'Unauthorized to remove members' };
            }

            const targetMembership = await db.query.workspaceMembers.findFirst({
                where: and(
                    eq(workspaceMembers.id, membershipId),
                    eq(workspaceMembers.workspaceId, workspaceId)
                )
            });

            if (!targetMembership) {
                return { success: false, error: 'Member not found in this workspace' };
            }

            if (targetMembership.role === 'owner') {
                return { success: false, error: 'Cannot remove the workspace owner' };
            }

            // If admin, cannot remove other admins (only owner can)
            if (callerMembership.role === 'admin' && targetMembership.role === 'admin' && callerMembership.userId !== targetMembership.userId) {
                return { success: false, error: 'Only workspace owners can remove admins' };
            }

            await removeWorkspaceMember(membershipId, workspaceId);

            revalidatePath(`/${workspaceId}/settings`);
            return { success: true };
        } catch (error: any) {
            console.error('Error in removeWorkspaceMemberAction:', error);
            return { success: false, error: error.message || 'Failed to remove member' };
        }
    }, providedWorkspaceId);
}
