'use server';

import { revalidatePath } from 'next/cache';
import { getTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember } from '@/lib/team';
import { withAuth } from '@/lib/auth-guard';
import { z } from 'zod';

const createTeamMemberSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    role: z.string().optional(),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    avatar_url: z.string().url('Invalid URL').optional().or(z.literal('')),
});

const updateTeamMemberSchema = createTeamMemberSchema.partial();

export async function getTeamMembersAction() {
    return withAuth(async (user, workspaceId) => {
        try {
            const members = await getTeamMembers(workspaceId);
            return { success: true, members };
        } catch (error) {
            console.error('Error in getTeamMembersAction:', error);
            return { success: false, error: 'Failed to fetch team members', members: [] };
        }
    });
}

export async function addTeamMemberAction(data: {
    name: string;
    role?: string;
    email?: string;
    avatar_url?: string;
}) {
    return withAuth(async (user, workspaceId) => {
        try {
            const validatedData = createTeamMemberSchema.parse(data);
            
            const newMember = await createTeamMember({
                name: validatedData.name,
                role: validatedData.role || null,
                email: validatedData.email || null,
                avatarUrl: validatedData.avatar_url || null,
                workspaceId, // pass workspaceId down
            });

            revalidatePath(`/${workspaceId}/settings`);
            return { success: true, member: newMember };
        } catch (error: any) {
            console.error('Error in addTeamMemberAction:', error);
            if (error instanceof z.ZodError) {
                return { success: false, error: error.issues[0].message };
            }
            return { success: false, error: 'Failed to add team member' };
        }
    });
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
    return withAuth(async (user, workspaceId) => {
        try {
            const validatedData = updateTeamMemberSchema.parse(data);
            
            await updateTeamMember(memberId, {
                ...(validatedData.name && { name: validatedData.name }),
                ...(validatedData.role && { role: validatedData.role }),
                ...(validatedData.email && { email: validatedData.email }),
                ...(validatedData.avatar_url && { avatarUrl: validatedData.avatar_url }),
            }, workspaceId);

            revalidatePath(`/${workspaceId}/settings`);
            return { success: true };
        } catch (error: any) {
            console.error('Error in updateTeamMemberAction:', error);
            if (error instanceof z.ZodError) {
                return { success: false, error: error.issues[0].message };
            }
            return { success: false, error: 'Failed to update team member' };
        }
    });
}

export async function deleteTeamMemberAction(memberId: string) {
    return withAuth(async (user, workspaceId) => {
        try {
            await deleteTeamMember(memberId, workspaceId);
            revalidatePath(`/${workspaceId}/settings`);
            return { success: true };
        } catch (error) {
            console.error('Error in deleteTeamMemberAction:', error);
            return { success: false, error: 'Failed to delete team member' };
        }
    });
}

