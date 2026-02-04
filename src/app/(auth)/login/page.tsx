"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/ui/logo";
import { signInWithGoogle } from "@/server/actions/auth/actions";


export default function LoginPage() {
    const [error, setError] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);

    async function handleGoogleSignIn() {
        setIsLoading(true);
        setError("");

        try {
            const result = await signInWithGoogle();

            if (!result.success && result.error) {
                console.error('Google OAuth error:', result.error);
                setError(result.error);
                setIsLoading(false);
            }
        } catch (err) {
            console.error('Google OAuth exception:', err);
            setError(err instanceof Error ? err.message : 'An unexpected error occurred');
            setIsLoading(false);
        }
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col items-center text-center gap-3 mb-2">
                <div className="mb-2">
                    <Logo iconClassName="w-10 h-10" showText={false} />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Welcome back
                </h1>
                <p className="text-muted-foreground text-sm font-normal">
                    Sign in to access your workspace.
                </p>
            </div>

            {/* Form Card */}
            <div className="bg-card rounded-2xl p-8 shadow-lg border border-border/60">
                <div className="flex flex-col gap-5">
                    {/* Error Message */}
                    {error && (
                        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg border border-destructive/20">
                            <p>{error}</p>
                        </div>
                    )}

                    {/* Google OAuth Button */}
                    <Button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                        variant="outline"
                        className="w-full h-12 rounded-xl border-border bg-white hover:bg-gray-50 text-foreground text-sm font-semibold gap-3"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.04-3.71 1.04-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        <span>Continue with Google</span>
                    </Button>
                </div>
            </div>

            {/* Sign Up Link */}
            <div className="text-center">
                <p className="text-muted-foreground text-sm">
                    Don't have an account?{" "}
                    <Link
                        href="/register"
                        className="text-primary font-semibold hover:underline transition-colors ml-1"
                    >
                        Create account
                    </Link>
                </p>
            </div>
        </div>
    );
}
