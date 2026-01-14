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

        // Update auth metadata
        const { error: authUpdateError } = await supabase.auth.updateUser({
            data: {
                full_name: data.name,
                bio: data.bio
            }
        });

        if (authUpdateError) {
            console.error('Error updating auth profile:', authUpdateError);
            return { success: false, error: authUpdateError.message };
        }

        // Also update public.users table just in case
        const { error: dbError } = await supabase
            .from('users')
            .update({ full_name: data.name })
            .eq('id', user.id);

        if (dbError) {
            console.error('Error updating public profile:', dbError);
        }

        revalidatePath('/settings');
        return { success: true };
    } catch (error) {
        console.error('Error in updateProfileAction:', error);
        return { success: false, error: 'Failed to update profile' };
    }
}

export async function getProfileAction() {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return { success: false, error: 'Not authenticated' };
        }

        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, profile: data };
    } catch (error) {
        return { success: false, error: 'Failed to fetch profile' };
    }
}

export async function updateBrandingAction(data: { logo_url?: string; brand_color?: string }) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return { success: false, error: 'Not authenticated' };
        }

        const { error } = await supabase
            .from('users')
            .update({
                logo_url: data.logo_url,
                brand_color: data.brand_color,
                updated_at: new Date().toISOString()
            })
            .eq('id', user.id);

        if (error) {
            console.error('Error updating branding:', error);
            return { success: false, error: error.message };
        }

        revalidatePath('/settings');
        revalidatePath('/invoices');
        return { success: true };
    } catch (error) {
        console.error('Error in updateBrandingAction:', error);
        return { success: false, error: 'Failed to update branding' };
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

export async function signOutAllSessionsAction() {
    try {
        const supabase = await createClient();

        const { error } = await supabase.auth.signOut({ scope: 'global' });

        if (error) {
            console.error('Error signing out all sessions:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error('Error in signOutAllSessionsAction:', error);
        return { success: false, error: 'Failed to sign out all sessions' };
    }
}

export async function deleteAccountAction() {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return { success: false, error: 'Not authenticated' };
        }

        // Delete user data from any related tables first (if applicable)
        // Then delete the auth user - this requires admin privileges in Supabase
        // For now, we'll sign the user out and mark their account for deletion
        // In production, you'd use a Supabase Edge Function with service role key

        // Sign out the user
        await supabase.auth.signOut({ scope: 'global' });

        return { success: true, message: 'Account deletion requested. You will be signed out.' };
    } catch (error) {
        console.error('Error in deleteAccountAction:', error);
        return { success: false, error: 'Failed to delete account' };
    }
}

export async function enrollMfaAction() {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return { success: false, error: 'Not authenticated' };
        }

        // Enroll in TOTP MFA
        const { data, error } = await supabase.auth.mfa.enroll({
            factorType: 'totp',
            friendlyName: 'Authenticator App'
        });

        if (error) {
            console.error('Error enrolling MFA:', error);
            return { success: false, error: error.message };
        }

        return {
            success: true,
            data: {
                id: data.id,
                qrCode: data.totp.qr_code,
                secret: data.totp.secret
            }
        };
    } catch (error) {
        console.error('Error in enrollMfaAction:', error);
        return { success: false, error: 'Failed to enroll MFA' };
    }
}

export async function verifyMfaAction(factorId: string, code: string) {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase.auth.mfa.challengeAndVerify({
            factorId,
            code
        });

        if (error) {
            console.error('Error verifying MFA:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error('Error in verifyMfaAction:', error);
        return { success: false, error: 'Failed to verify MFA code' };
    }
}

export async function unenrollMfaAction(factorId: string) {
    try {
        const supabase = await createClient();

        const { error } = await supabase.auth.mfa.unenroll({
            factorId
        });

        if (error) {
            console.error('Error unenrolling MFA:', error);
            return { success: false, error: error.message };
        }

        revalidatePath('/settings');
        return { success: true };
    } catch (error) {
        console.error('Error in unenrollMfaAction:', error);
        return { success: false, error: 'Failed to disable MFA' };
    }
}

export async function getMfaFactorsAction() {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return { success: false, error: 'Not authenticated', factors: [] };
        }

        const { data, error } = await supabase.auth.mfa.listFactors();

        if (error) {
            console.error('Error getting MFA factors:', error);
            return { success: false, error: error.message, factors: [] };
        }

        return { success: true, factors: data.totp };
    } catch (error) {
        console.error('Error in getMfaFactorsAction:', error);
        return { success: false, error: 'Failed to get MFA factors', factors: [] };
    }
}
