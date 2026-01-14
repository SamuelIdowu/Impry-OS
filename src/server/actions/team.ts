'use server';

import { createClient } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

interface TeamMember {
    id: string;
    name: string;
    role: string | null;
    avatar_url: string | null;
    email: string | null;
    created_at: string;
}

// Helper to get the current user's internal ID
async function getCurrentUserId() {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return null;
    }

    // Get the internal user ID from the users table
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single();

    if (userError || !userData) {
        return null;
    }

    return userData.id;
}

export async function getTeamMembersAction() {
    try {
        const supabase = await createClient();
        const userId = await getCurrentUserId();

        if (!userId) {
            return { success: false, error: 'Not authenticated', members: [] };
        }

        const { data, error } = await supabase
            .from('team_members')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching team members:', error);
            return { success: false, error: error.message, members: [] };
        }

        return { success: true, members: data as TeamMember[] };
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
        const supabase = await createClient();
        const userId = await getCurrentUserId();

        if (!userId) {
            return { success: false, error: 'Not authenticated' };
        }

        const { data: newMember, error } = await supabase
            .from('team_members')
            .insert({
                user_id: userId,
                name: data.name,
                role: data.role || null,
                email: data.email || null,
                avatar_url: data.avatar_url || null
            })
            .select()
            .single();

        if (error) {
            console.error('Error adding team member:', error);
            return { success: false, error: error.message };
        }

        revalidatePath('/');
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
        const supabase = await createClient();
        const userId = await getCurrentUserId();

        if (!userId) {
            return { success: false, error: 'Not authenticated' };
        }

        const { error } = await supabase
            .from('team_members')
            .update({
                ...data,
                updated_at: new Date().toISOString()
            })
            .eq('id', memberId)
            .eq('user_id', userId);

        if (error) {
            console.error('Error updating team member:', error);
            return { success: false, error: error.message };
        }

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Error in updateTeamMemberAction:', error);
        return { success: false, error: 'Failed to update team member' };
    }
}

export async function deleteTeamMemberAction(memberId: string) {
    try {
        const supabase = await createClient();
        const userId = await getCurrentUserId();

        if (!userId) {
            return { success: false, error: 'Not authenticated' };
        }

        const { error } = await supabase
            .from('team_members')
            .delete()
            .eq('id', memberId)
            .eq('user_id', userId);

        if (error) {
            console.error('Error deleting team member:', error);
            return { success: false, error: error.message };
        }

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Error in deleteTeamMemberAction:', error);
        return { success: false, error: 'Failed to delete team member' };
    }
}
