"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { FormInput } from "@/components/auth/FormInput";
import { AuthDivider } from "@/components/auth/AuthDivider";
import { authClient } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
    const searchParams = useSearchParams();
    const [error, setError] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const errorParam = searchParams.get("error");
        if (errorParam === "account_not_linked") {
            setError("An account with this email already exists. Please sign in with your email and password first, or try again now that account linking is enabled.");
        } else if (errorParam === "unauthorized") {
            setError("Please sign in to access your workspace.");
        } else if (errorParam) {
            setError(errorParam);
        }
    }, [searchParams]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);

        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        try {
            await authClient.signIn.email({
                email,
                password,
            }, {
                onSuccess: () => {
                    router.push("/workspaces");
                },
                onError: (ctx) => {
                    setError(ctx.error.message || "Invalid credentials");
                    setIsLoading(false);
                }
            });
        } catch (err) {
            console.error("Login error:", err);
            setError(err instanceof Error && err.message ? err.message : "Unable to connect to the authentication service. Please check your internet connection.");
            setIsLoading(false);
        }
    }

    async function handleGoogleSignIn() {
        setIsGoogleLoading(true);
        setError("");

        try {
            await authClient.signIn.social({
                provider: "google",
                callbackURL: "/workspaces",
            }, {
                onError: (ctx) => {
                    setError(ctx.error.message || "Google sign-in failed");
                    setIsGoogleLoading(false);
                }
            });
        } catch (err) {
            console.error("Google OAuth exception:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "An unexpected error occurred"
            );
            setIsGoogleLoading(false);
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

                    {/* Email/Password Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <FormInput
                            label="Email"
                            name="email"
                            type="email"
                            placeholder="you@example.com"
                            required
                            autoComplete="email"
                            disabled={isLoading}
                            icon={
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                                    />
                                </svg>
                            }
                        />

                        <FormInput
                            label="Password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            required
                            autoComplete="current-password"
                            disabled={isLoading}
                            icon={
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                    />
                                </svg>
                            }
                        />

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="remember"
                                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                                />
                                <span className="text-sm text-muted-foreground">
                                    Remember me
                                </span>
                            </label>
                            <Link
                                href="/forgot-password"
                                className="text-sm text-primary font-semibold hover:underline transition-colors"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 rounded-xl text-sm font-semibold"
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                    Signing in...
                                </div>
                            ) : (
                                "Sign in"
                            )}
                        </Button>
                    </form>

                    {/* Divider */}
                    <AuthDivider />

                    {/* Google OAuth Button */}
                    <Button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={isGoogleLoading || isLoading}
                        variant="outline"
                        className="w-full h-12 rounded-xl border-border bg-white hover:bg-gray-50 text-foreground text-sm font-semibold gap-3"
                    >
                        <svg
                            className="w-5 h-5"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.04-3.71 1.04-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
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

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Loading...</div>}>
            <LoginForm />
        </Suspense>
    );
}
