"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signIn, signInWithGoogle, resendConfirmationEmail } from "@/server/actions/auth/actions";
import { Mail, Lock, Eye, EyeOff, Terminal } from "lucide-react";

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [resendStatus, setResendStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [successMessage, setSuccessMessage] = useState<string>("");

    useEffect(() => {
        // Check for success message in URL
        const params = new URLSearchParams(window.location.search);
        if (params.get("message") === "check_email") {
            setSuccessMessage("Account created successfully! Please check your email to confirm your account.");
        }
    }, []);

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        setError("");

        const result = await signIn(formData);

        if (!result.success && result.error) {
            setError(result.error);
            setIsLoading(false);
        }
    }

    async function handleGoogleSignIn() {
        setIsLoading(true);
        setError("");

        const result = await signInWithGoogle();

        if (!result.success && result.error) {
            setError(result.error);
            setIsLoading(false);
        }
    }

    async function handleResendEmail() {
        const email = (document.getElementById("email") as HTMLInputElement)?.value;
        if (!email) return;

        setResendStatus("loading");
        const result = await resendConfirmationEmail(email);

        if (result.success) {
            setResendStatus("success");
        } else {
            setResendStatus("error");
            setError(result.error || "Failed to resend confirmation email");
        }
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col items-center text-center gap-3 mb-2">
                <div className="mb-2 flex items-center justify-center w-12 h-12 rounded-xl bg-white border border-border shadow-sm text-primary">
                    <Terminal className="w-6 h-6" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Welcome back
                </h1>
                <p className="text-muted-foreground text-sm font-normal">
                    Enter your details to access your workspace.
                </p>
            </div>

            {/* Form Card */}
            <div className="bg-card rounded-2xl p-8 shadow-lg border border-border/60">
                <form action={handleSubmit} className="flex flex-col gap-5">
                    {/* Success Message */}
                    {successMessage && (
                        <div className="bg-green-500/10 text-green-600 text-sm p-3 rounded-lg border border-green-500/20 font-medium">
                            {successMessage}
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg border border-destructive/20">
                            <p>{error}</p>
                            {error.includes("Email not confirmed") && (
                                <div className="mt-2">
                                    {resendStatus === "success" ? (
                                        <p className="text-green-600 font-medium">
                                            Confirmation email sent! Please check your inbox.
                                        </p>
                                    ) : (
                                        <Button
                                            type="button"
                                            variant="link"
                                            onClick={handleResendEmail}
                                            disabled={resendStatus === "loading"}
                                            className="p-0 h-auto font-semibold text-destructive underline hover:text-destructive/80"
                                        >
                                            {resendStatus === "loading" ? "Sending..." : "Resend confirmation email"}
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Email Field */}
                    <div className="flex flex-col gap-1.5">
                        <label
                            className="text-foreground text-sm font-semibold ml-1"
                            htmlFor="email"
                        >
                            Email
                        </label>
                        <div className="relative">
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="name@company.com"
                                required
                                className="w-full h-12 pl-11 text-sm font-medium rounded-xl bg-background border-input focus:border-foreground focus:ring-2 focus:ring-foreground/10"
                                disabled={isLoading}
                            />
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                                <Mail className="w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    {/* Password Field */}
                    <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center ml-1">
                            <label
                                className="text-foreground text-sm font-semibold"
                                htmlFor="password"
                            >
                                Password
                            </label>
                            <Link
                                href="/forgot-password"
                                className="text-muted-foreground text-xs font-medium hover:text-primary transition-colors"
                            >
                                Forgot password?
                            </Link>
                        </div>
                        <div className="relative">
                            <Input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                required
                                className="w-full h-12 pl-11 pr-11 text-sm font-medium rounded-xl bg-background border-input focus:border-foreground focus:ring-2 focus:ring-foreground/10"
                                disabled={isLoading}
                            />
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                                <Lock className="w-5 h-5" />
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {showPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Login Button */}
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="mt-2 w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold tracking-wide shadow-md hover:shadow-lg transition-all active:scale-[0.99]"
                    >
                        {isLoading ? "Logging in..." : "Log In"}
                    </Button>

                    {/* Divider */}
                    <div className="flex items-center gap-3 py-1">
                        <div className="h-px flex-1 bg-border" />
                        <span className="text-muted-foreground text-xs font-medium">OR</span>
                        <div className="h-px flex-1 bg-border" />
                    </div>

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
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        <span>Continue with Google</span>
                    </Button>
                </form>
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
