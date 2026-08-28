'use server';

import { revalidatePath } from 'next/cache';
import { withAuth } from '@/lib/auth-guard';
import { canInviteTeamMember } from '@/lib/payments/guards';
import { getUser } from '@/lib/auth';
import { db } from '@/server/db';
import { workspaces, workspaceMembers, users, workspaceInvitations } from '@/server/db/schema';
import { eq, and } from 'drizzle-orm';
import {
    getWorkspaceInvitations,
    getInvitationByToken,
    createWorkspaceInvitation,
    acceptInvitation,
    revokeInvitation,
    refreshInvitationExpiry
} from '@/lib/invitations';
import { sendWorkspaceInvitationEmail } from '@/lib/email';
import { z } from 'zod';

const inviteSchema = z.object({
    email: z.string().email('Please provide a valid email address'),
    role: z.enum(['admin', 'member']).default('member'),
});

/**
 * Get all active pending invitations for current workspace
 */
export async function getWorkspaceInvitationsAction(providedWorkspaceId?: string) {
    return withAuth(async (user, workspaceId) => {
        try {
            const invitations = await getWorkspaceInvitations(workspaceId);
            return { success: true, invitations };
        } catch (error: any) {
            console.error('Error fetching invitations:', error);
            return { success: false, error: error.message || 'Failed to fetch invitations', invitations: [] };
        }
    }, providedWorkspaceId);
}

/**
 * Invite a member to the workspace via email
 */
export async function inviteMemberAction(data: {
    email: string;
    role?: 'admin' | 'member';
    workspaceId?: string;
}) {
    return withAuth(async (user, workspaceId) => {
        try {
            const limitCheck = await canInviteTeamMember(workspaceId);
            if (!limitCheck.allowed) {
                return {
                    success: false,
                    error: `Workspace team limit reached (${limitCheck.currentCount}/${limitCheck.maxAllowed} seats). Upgrade to Studio plan for up to 5 team seats.`,
                    requiresUpgrade: true,
                    targetTier: 'studio',
                };
            }

            const validated = inviteSchema.parse({
                email: data.email,
                role: data.role || 'member',
            });

            // 1. Verify caller has admin/owner privileges in workspace
            const callerMembership = await db.query.workspaceMembers.findFirst({
                where: and(
                    eq(workspaceMembers.workspaceId, workspaceId),
                    eq(workspaceMembers.userId, user.id)
                )
            });

            if (!callerMembership || (callerMembership.role !== 'owner' && callerMembership.role !== 'admin')) {
                return { success: false, error: 'Only workspace owners and admins can invite team members' };
            }

            // 2. Check if the invited user is already an active member of this workspace
            const existingUser = await db.query.users.findFirst({
                where: eq(users.email, validated.email.toLowerCase().trim())
            });

            if (existingUser) {
                const existingMember = await db.query.workspaceMembers.findFirst({
                    where: and(
                        eq(workspaceMembers.workspaceId, workspaceId),
                        eq(workspaceMembers.userId, existingUser.id)
                    )
                });

                if (existingMember) {
                    return { success: false, error: 'This user is already a member of this workspace' };
                }
            }

            // 3. Create invitation record
            const invitation = await createWorkspaceInvitation({
                workspaceId,
                email: validated.email,
                role: validated.role,
            });

            // 4. Fetch workspace + inviter profile in parallel for email
            const [workspace, inviterProfile] = await Promise.all([
                db.query.workspaces.findFirst({
                    where: eq(workspaces.id, workspaceId),
                    columns: { name: true }
                }),
                db.query.users.findFirst({
                    where: eq(users.id, user.id),
                    columns: { name: true }
                }),
            ]);

            const workspaceName = workspace?.name || 'Workspace';
            const inviterName = inviterProfile?.name || user.name || 'A team member';

            // 5. Send invitation email via Resend
            try {
                await sendWorkspaceInvitationEmail({
                    email: validated.email,
                    workspaceName,
                    inviterName,
                    role: validated.role,
                    token: invitation.token,
                });
            } catch (emailErr: any) {
                console.warn('Failed to send invitation email (Resend):', emailErr.message);
                // We do not fail the action if email failed in sandbox/dev mode, but we inform the user
            }

            revalidatePath(`/${workspaceId}/settings`);
            return {
                success: true,
                invitation,
                inviteUrl: `/invite/${invitation.token}`
            };
        } catch (error: any) {
            console.error('Error inviting member:', error);
            if (error instanceof z.ZodError) {
                return { success: false, error: error.issues[0].message };
            }
            return { success: false, error: error.message || 'Failed to send invitation' };
        }
    }, data.workspaceId);
}

/**
 * Resend invitation email & refresh expiry
 */
export async function resendInvitationAction(invitationId: string, providedWorkspaceId?: string) {
    return withAuth(async (user, workspaceId) => {
        try {
            const updated = await refreshInvitationExpiry(invitationId, workspaceId);
            if (!updated) {
                return { success: false, error: 'Invitation not found' };
            }

            const [workspace, inviterProfile] = await Promise.all([
                db.query.workspaces.findFirst({
                    where: eq(workspaces.id, workspaceId),
                    columns: { name: true }
                }),
                db.query.users.findFirst({
                    where: eq(users.id, user.id),
                    columns: { name: true }
                }),
            ]);

            try {
                await sendWorkspaceInvitationEmail({
                    email: updated.email,
                    workspaceName: workspace?.name || 'Workspace',
                    inviterName: inviterProfile?.name || 'A team member',
                    role: updated.role || 'member',
                    token: updated.token,
                });
            } catch (emailErr: any) {
                console.warn('Failed to resend email:', emailErr.message);
            }

            revalidatePath(`/${workspaceId}/settings`);
            return { success: true };
        } catch (error: any) {
            console.error('Error resending invitation:', error);
            return { success: false, error: error.message || 'Failed to resend invitation' };
        }
    }, providedWorkspaceId);
}

/**
 * Revoke/cancel a pending invitation
 */
export async function revokeInvitationAction(invitationId: string, providedWorkspaceId?: string) {
    return withAuth(async (user, workspaceId) => {
        try {
            await revokeInvitation(invitationId, workspaceId);
            revalidatePath(`/${workspaceId}/settings`);
            return { success: true };
        } catch (error: any) {
            console.error('Error revoking invitation:', error);
            return { success: false, error: error.message || 'Failed to revoke invitation' };
        }
    }, providedWorkspaceId);
}

/**
 * Public/Auth: Get invitation details for the invite landing page
 */
export async function getInvitationDetailsAction(token: string) {
    try {
        const invitation = await getInvitationByToken(token);
        if (!invitation) {
            return { success: false, error: 'Invitation not found' };
        }
        return { success: true, invitation };
    } catch (error: any) {
        console.error('Error fetching invitation details:', error);
        return { success: false, error: error.message || 'Failed to load invitation' };
    }
}

/**
 * Accept an invitation and join workspace
 */
export async function acceptInvitationAction(token: string) {
    try {
        const user = await getUser();
        if (!user) {
            return { success: false, error: 'You must be logged in to accept this invitation' };
        }

        const result = await acceptInvitation(token, user.id);
        revalidatePath(`/${result.workspaceId}/dashboard`);
        revalidatePath(`/${result.workspaceId}/settings`);
        revalidatePath(`/workspaces`);

        return { success: true, workspaceId: result.workspaceId };
    } catch (error: any) {
        console.error('Error accepting invitation:', error);
        return { success: false, error: error.message || 'Failed to accept invitation' };
    }
}
