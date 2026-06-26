"use server";

import { redirect } from "next/navigation";
import { loginSchema, registerSchema, updatePasswordSchema, updateProfileSchema } from "@/lib/validators/auth";

type ActionResult<T = void> = {
    success: boolean;
    error?: string;
    data?: T;
};

/**
 * Sign in with email and password
 */
export async function signIn(formData: FormData): Promise<ActionResult> {
    return { success: false, error: "Please use the better-auth client." };
}

/**
 * Sign up with email and password
 */
export async function signUp(formData: FormData): Promise<ActionResult> {
    return { success: false, error: "Please use the better-auth client." };
}

/**
 * Sign out
 */
export async function signOut(): Promise<ActionResult> {
    return { success: false, error: "Please use the better-auth client." };
}

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle(): Promise<ActionResult<{ url: string }>> {
    return { success: false, error: "Please use the better-auth client." };
}

/**
 * Update user profile
 */
export async function updateProfile(formData: FormData): Promise<ActionResult> {
    return { success: false, error: "Please use the better-auth client." };
}

/**
 * Update user password
 */
export async function updatePassword(formData: FormData): Promise<ActionResult> {
    return { success: false, error: "Please use the better-auth client." };
}

/**
 * Resend confirmation email
 */
export async function resendConfirmationEmail(email: string): Promise<ActionResult> {
    return { success: false, error: "Please use the better-auth client." };
}

/**
 * Request password reset email
 */
export async function requestPasswordReset(email: string): Promise<ActionResult> {
    return { success: false, error: "Please use the better-auth client." };
}

/**
 * Confirm password reset with new password
 */
export async function confirmPasswordReset(newPassword: string): Promise<ActionResult> {
    return { success: false, error: "Please use the better-auth client." };
}

