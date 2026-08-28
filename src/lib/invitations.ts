import { db } from '@/server/db';
import { workspaceInvitations, workspaceMembers, workspaces, users } from '@/server/db/schema';
import { eq, and, desc, gt } from 'drizzle-orm';
import { getUser } from '@/lib/auth';

export type WorkspaceInvitation = typeof workspaceInvitations.$inferSelect;
export type NewWorkspaceInvitation = typeof workspaceInvitations.$inferInsert;

/**
 * Get all pending invitations for a specific workspace
 */
export async function getWorkspaceInvitations(workspaceId: string) {
    const user = await getUser();
    if (!user) throw new Error('Unauthorized');

    return await db.query.workspaceInvitations.findMany({
        where: and(
            eq(workspaceInvitations.workspaceId, workspaceId),
            eq(workspaceInvitations.status, 'pending'),
            gt(workspaceInvitations.expiresAt, new Date())
        ),
        limit: 50,
        with: {
            inviter: {
                columns: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                }
            }
        },
        orderBy: [desc(workspaceInvitations.createdAt)]
    });
}

/**
 * Get invitation details by token (public/auth view)
 */
export async function getInvitationByToken(token: string) {
    const invitation = await db.query.workspaceInvitations.findFirst({
        where: eq(workspaceInvitations.token, token),
        with: {
            workspace: {
                columns: {
                    id: true,
                    name: true,
                }
            },
            inviter: {
                columns: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                }
            }
        }
    });

    if (!invitation) return null;

    // Check if expired
    const isExpired = new Date() > new Date(invitation.expiresAt);
    return {
        ...invitation,
        isExpired
    };
}

/**
 * Create a new workspace invitation (valid for 7 days)
 */
export async function createWorkspaceInvitation({
    workspaceId,
    email,
    role = 'member',
}: {
    workspaceId: string;
    email: string;
    role?: 'admin' | 'member';
}) {
    const user = await getUser();
    if (!user) throw new Error('Unauthorized');

    // 7-day expiration
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const [invitation] = await db.insert(workspaceInvitations).values({
        workspaceId,
        email: email.toLowerCase().trim(),
        role,
        invitedBy: user.id,
        status: 'pending',
        expiresAt,
    }).returning();

    return invitation;
}

/**
 * Accept an invitation and add user to workspace_members
 */
export async function acceptInvitation(token: string, userId: string) {
    const invitation = await db.query.workspaceInvitations.findFirst({
        where: and(
            eq(workspaceInvitations.token, token),
            eq(workspaceInvitations.status, 'pending')
        )
    });

    if (!invitation) {
        throw new Error('Invitation not found or has already been used');
    }

    if (new Date() > new Date(invitation.expiresAt)) {
        throw new Error('Invitation has expired. Please ask for a new invite.');
    }

    // Check if already a member
    const existingMembership = await db.query.workspaceMembers.findFirst({
        where: and(
            eq(workspaceMembers.workspaceId, invitation.workspaceId),
            eq(workspaceMembers.userId, userId)
        )
    });

    if (!existingMembership) {
        // Add to workspace members
        await db.insert(workspaceMembers).values({
            workspaceId: invitation.workspaceId,
            userId: userId,
            role: invitation.role || 'member',
        });
    }

    // Mark invitation as accepted
    await db.update(workspaceInvitations)
        .set({ status: 'accepted' })
        .where(eq(workspaceInvitations.id, invitation.id));

    return { workspaceId: invitation.workspaceId };
}

/**
 * Revoke or delete an invitation
 */
export async function revokeInvitation(invitationId: string, workspaceId: string) {
    const user = await getUser();
    if (!user) throw new Error('Unauthorized');

    await db.update(workspaceInvitations)
        .set({ status: 'revoked' })
        .where(and(
            eq(workspaceInvitations.id, invitationId),
            eq(workspaceInvitations.workspaceId, workspaceId)
        ));
}

/**
 * Resend / Refresh invitation token expiry
 */
export async function refreshInvitationExpiry(invitationId: string, workspaceId: string) {
    const user = await getUser();
    if (!user) throw new Error('Unauthorized');

    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 7);

    const [updated] = await db.update(workspaceInvitations)
        .set({
            expiresAt: newExpiresAt,
            status: 'pending'
        })
        .where(and(
            eq(workspaceInvitations.id, invitationId),
            eq(workspaceInvitations.workspaceId, workspaceId)
        ))
        .returning();

    return updated;
}
