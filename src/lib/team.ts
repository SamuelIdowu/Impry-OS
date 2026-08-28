import { db } from '@/server/db';
import { teamMembers, workspaceMembers, users } from '@/server/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { getUser } from '@/lib/auth';

export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;

export async function getTeamMembers(workspaceId: string) {
    const user = await getUser();
    if (!user) throw new Error('Unauthorized');

    return await db.query.teamMembers.findMany({
        where: eq(teamMembers.workspaceId, workspaceId),
        orderBy: [desc(teamMembers.createdAt)],
        limit: 50,
    });
}

export async function createTeamMember(data: Omit<NewTeamMember, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) {
    const user = await getUser();
    if (!user) throw new Error('Unauthorized');

    const [member] = await db.insert(teamMembers).values({
        ...data,
        userId: user.id,
    }).returning();

    return member;
}

export async function updateTeamMember(id: string, data: Partial<Omit<NewTeamMember, 'id' | 'userId' | 'workspaceId' | 'createdAt' | 'updatedAt'>>, workspaceId: string) {
    const user = await getUser();
    if (!user) throw new Error('Unauthorized');

    const [member] = await db.update(teamMembers)
        .set({
            ...data,
            updatedAt: new Date()
        })
        .where(and(eq(teamMembers.id, id), eq(teamMembers.workspaceId, workspaceId)))
        .returning();

    return member;
}

export async function deleteTeamMember(id: string, workspaceId: string) {
    const user = await getUser();
    if (!user) throw new Error('Unauthorized');

    await db.delete(teamMembers).where(and(eq(teamMembers.id, id), eq(teamMembers.workspaceId, workspaceId)));
}

/**
 * Multi-User Workspace Members Queries
 */
export async function getWorkspaceMembers(workspaceId: string) {
    const user = await getUser();
    if (!user) throw new Error('Unauthorized');

    return await db.query.workspaceMembers.findMany({
        where: eq(workspaceMembers.workspaceId, workspaceId),
        limit: 50,
        with: {
            user: {
                columns: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                }
            }
        },
        orderBy: [desc(workspaceMembers.createdAt)]
    });
}

export async function updateWorkspaceMemberRole(membershipId: string, workspaceId: string, newRole: string) {
    const user = await getUser();
    if (!user) throw new Error('Unauthorized');

    const [updated] = await db.update(workspaceMembers)
        .set({
            role: newRole,
            updatedAt: new Date()
        })
        .where(and(
            eq(workspaceMembers.id, membershipId),
            eq(workspaceMembers.workspaceId, workspaceId)
        ))
        .returning();

    return updated;
}

export async function removeWorkspaceMember(membershipId: string, workspaceId: string) {
    const user = await getUser();
    if (!user) throw new Error('Unauthorized');

    await db.delete(workspaceMembers)
        .where(and(
            eq(workspaceMembers.id, membershipId),
            eq(workspaceMembers.workspaceId, workspaceId)
        ));
}
