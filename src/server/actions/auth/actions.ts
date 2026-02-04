"use server";

import { createClient } from "@/lib/auth";
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
    try {
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        // Validate input
        const validated = loginSchema.safeParse({ email, password });
        if (!validated.success) {
            return {
                success: false,
                error: validated.error.issues[0]?.message || "Invalid input",
            };
        }

        console.log('Creating Supabase client...');
        const supabase = await createClient();

        console.log('Attempting sign in with password...');
        const { error } = await supabase.auth.signInWithPassword({
            email: validated.data.email,
            password: validated.data.password,
        });

        if (error) {
            console.error('Supabase auth error:', error);
            return {
                success: false,
                error: error.message,
            };
        }

        console.log('Sign in successful, redirecting...');
        // Redirect to dashboard on success
        redirect("/dashboard");
    } catch (error) {
        console.error('Sign in exception:', error);
        if ((error as any)?.digest?.startsWith("NEXT_REDIRECT")) {
            throw error;
        }
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
}

/**
 * Sign up with email and password
 */
export async function signUp(formData: FormData): Promise<ActionResult> {
    try {
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const agreeToTerms = formData.get("agreeToTerms") === "on";

        // Validate input
        const validated = registerSchema.safeParse({ name, email, password, agreeToTerms });
        if (!validated.success) {
            return {
                success: false,
                error: validated.error.issues[0]?.message || "Invalid input",
            };
        }

        const supabase = await createClient();
        const { error } = await supabase.auth.signUp({
            email: validated.data.email,
            password: validated.data.password,
            options: {
                data: {
                    name: validated.data.name,
                },
            },
        });

        if (error) {
            return {
                success: false,
                error: error.message,
            };
        }

        // If no session is established, it means email confirmation is required
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            redirect("/login?message=check_email");
        }

        // Redirect to dashboard on success
        redirect("/dashboard");
    } catch (error) {
        if ((error as any)?.digest?.startsWith("NEXT_REDIRECT")) {
            throw error;
        }
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
}

/**
 * Sign out
 */
export async function signOut(): Promise<ActionResult> {
    try {
        const supabase = await createClient();
        const { error } = await supabase.auth.signOut();

        if (error) {
            return {
                success: false,
                error: error.message,
            };
        }

        redirect("/login");
    } catch (error) {
        if ((error as any)?.digest?.startsWith("NEXT_REDIRECT")) {
            throw error;
        }
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
}

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle(): Promise<ActionResult<{ url: string }>> {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
            },
        });

        if (error) {
            return {
                success: false,
                error: error.message,
            };
        }

        if (data.url) {
            redirect(data.url);
        }

        return {
            success: false,
            error: "Failed to generate OAuth URL",
        };
    } catch (error) {
        if ((error as any)?.digest?.startsWith("NEXT_REDIRECT")) {
            throw error;
        }
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
}

/**
 * Update user profile
 */
export async function updateProfile(formData: FormData): Promise<ActionResult> {
    try {
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;

        // Validate input
        const validated = updateProfileSchema.safeParse({ name, email });
        if (!validated.success) {
            return {
                success: false,
                error: validated.error.issues[0]?.message || "Invalid input",
            };
        }

        const supabase = await createClient();
        const { error } = await supabase.auth.updateUser({
            email: validated.data.email,
            data: {
                name: validated.data.name,
            },
        });

        if (error) {
            return {
                success: false,
                error: error.message,
            };
        }

        return {
            success: true,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
}

/**
 * Update user password
 */
export async function updatePassword(formData: FormData): Promise<ActionResult> {
    try {
        const currentPassword = formData.get("currentPassword") as string;
        const newPassword = formData.get("newPassword") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        // Validate input
        const validated = updatePasswordSchema.safeParse({
            currentPassword,
            newPassword,
            confirmPassword,
        });

        if (!validated.success) {
            return {
                success: false,
                error: validated.error.issues[0]?.message || "Invalid input",
            };
        }

        const supabase = await createClient();

        // Verify current password by attempting to sign in
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.email) {
            return {
                success: false,
                error: "User not found",
            };
        }

        // Update password
        const { error } = await supabase.auth.updateUser({
            password: validated.data.newPassword,
        });

        if (error) {
            return {
                success: false,
                error: error.message,
            };
        }

        return {
            success: true,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
}
/**
 * Resend confirmation email
 */
export async function resendConfirmationEmail(email: string): Promise<ActionResult> {
    try {
        const supabase = await createClient();
        const { error } = await supabase.auth.resend({
            type: 'signup',
            email,
        });

        if (error) {
            return {
                success: false,
                error: error.message,
            };
        }

        return {
            success: true,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
}
