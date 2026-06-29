import { getCurrentWorkspaceId } from '@/server/actions/workspaces';
import { db } from '@/server/db';
import { teamMembers } from '@/server/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { getUser } from '@/lib/auth';

export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;

export async function getTeamMembers() {
    const user = await getUser();
    if (!user) throw new Error('Unauthorized');

    return await db.query.teamMembers.findMany({
        where: and(eq(teamMembers.workspaceId, await getCurrentWorkspaceId()), eq(teamMembers.userId, user.id)),
        orderBy: [desc(teamMembers.createdAt)]
    });
}

export async function createTeamMember(data: Omit<NewTeamMember, 'id' | 'userId' | 'workspaceId' | 'createdAt' | 'updatedAt'>) {
    const user = await getUser();
    if (!user) throw new Error('Unauthorized');

    const [member] = await db.insert(teamMembers).values({
        ...data,
        userId: user.id,
        workspaceId: await getCurrentWorkspaceId(),

    }).returning();

    return member;
}

export async function updateTeamMember(id: string, data: Partial<Omit<NewTeamMember, 'id' | 'userId' | 'workspaceId' | 'createdAt' | 'updatedAt'>>) {
    const user = await getUser();
    if (!user) throw new Error('Unauthorized');

    const [member] = await db.update(teamMembers)
        .set({
            ...data,
            updatedAt: new Date()
        })
        .where(and(eq(teamMembers.id, id), eq(teamMembers.workspaceId, await getCurrentWorkspaceId()), eq(teamMembers.userId, user.id)))
        .returning();

    return member;
}

export async function deleteTeamMember(id: string) {
    const user = await getUser();
    if (!user) throw new Error('Unauthorized');

    await db.delete(teamMembers).where(and(eq(teamMembers.id, id), eq(teamMembers.workspaceId, await getCurrentWorkspaceId()), eq(teamMembers.userId, user.id)));
}
