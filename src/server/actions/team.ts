'use server';

import { revalidatePath } from 'next/cache';
import { getTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember } from '@/lib/team';

export async function getTeamMembersAction() {
    try {
        const members = await getTeamMembers();
        return { success: true, members };
    } catch (error) {
        console.error('Error in getTeamMembersAction:', error);
        return { success: false, error: 'Failed to fetch team members', members: [] };
    }
}

export async function addTeamMemberAction(data: {
    name: string;
    role?: string;
    email?: string;
    avatar_url?: string;
}) {
    try {
        // Map camelCase to snake_case equivalent or just pass directly if the schema allows
        // The schema uses camelCase for keys and snake_case for db columns
        const newMember = await createTeamMember({
            name: data.name,
            role: data.role || null,
            email: data.email || null,
            avatarUrl: data.avatar_url || null
        });

        revalidatePath('/', 'layout');
        return { success: true, member: newMember };
    } catch (error) {
        console.error('Error in addTeamMemberAction:', error);
        return { success: false, error: 'Failed to add team member' };
    }
}

export async function updateTeamMemberAction(
    memberId: string,
    data: {
        name?: string;
        role?: string;
        email?: string;
        avatar_url?: string;
    }
) {
    try {
        await updateTeamMember(memberId, {
            ...(data.name && { name: data.name }),
            ...(data.role && { role: data.role }),
            ...(data.email && { email: data.email }),
            ...(data.avatar_url && { avatarUrl: data.avatar_url })
        });

        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error) {
        console.error('Error in updateTeamMemberAction:', error);
        return { success: false, error: 'Failed to update team member' };
    }
}

export async function deleteTeamMemberAction(memberId: string) {
    try {
        await deleteTeamMember(memberId);
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error) {
        console.error('Error in deleteTeamMemberAction:', error);
        return { success: false, error: 'Failed to delete team member' };
    }
}

