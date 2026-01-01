'use server';

import { createClient } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function updateProfileAction(data: { name: string; bio: string }) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return { success: false, error: 'Not authenticated' };
        }

        const { error } = await supabase.auth.updateUser({
            data: {
                full_name: data.name,
                bio: data.bio
            }
        });

        if (error) {
            console.error('Error updating profile:', error);
            return { success: false, error: error.message };
        }

        revalidatePath('/settings');
        return { success: true };
    } catch (error) {
        console.error('Error in updateProfileAction:', error);
        return { success: false, error: 'Failed to update profile' };
    }
}

export async function updatePasswordAction(password: string) {
    try {
        const supabase = await createClient();

        const { error } = await supabase.auth.updateUser({
            password: password
        });

        if (error) {
            console.error('Error updating password:', error);
            return { success: false, error: error.message };
        }

        revalidatePath('/settings');
        return { success: true };
    } catch (error) {
        console.error('Error in updatePasswordAction:', error);
        return { success: false, error: 'Failed to update password' };
    }
}
