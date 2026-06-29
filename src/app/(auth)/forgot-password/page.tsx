"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { FormInput } from "@/components/auth/FormInput";
import { requestPasswordReset } from "@/server/actions/auth/actions";

export default function ForgotPasswordPage() {
    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setSuccess(false);

        try {
            const result = await requestPasswordReset(email);

            if (result.success) {
                setSuccess(true);
            } else if (result.error) {
                setError(result.error);
            }
        } catch (err) {
            console.error("Password reset error:", err);
            setError("An unexpected error occurred");
        } finally {
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
                    Reset your password
                </h1>
                <p className="text-muted-foreground text-sm font-normal">
                    Enter your email and we'll send you a reset link.
                </p>
            </div>

            {/* Form Card */}
            <div className="bg-card rounded-2xl p-8 shadow-lg border border-border/60">
                <div className="flex flex-col gap-5">
                    {/* Success Message */}
                    {success && (
                        <div className="bg-green-500/10 text-green-600 dark:text-green-400 text-sm p-4 rounded-lg border border-green-500/20">
                            <div className="flex items-start gap-3">
                                <svg
                                    className="w-5 h-5 mt-0.5 flex-shrink-0"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                <div>
                                    <p className="font-semibold mb-1">
                                        Check your email
                                    </p>
                                    <p className="text-sm">
                                        We've sent a password reset link to{" "}
                                        <strong>{email}</strong>. Click the link
                                        in the email to reset your password.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg border border-destructive/20">
                            <p>{error}</p>
                        </div>
                    )}

                    {!success && (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <FormInput
                                label="Email"
                                name="email"
                                type="email"
                                placeholder="you@example.com"
                                required
                                autoComplete="email"
                                disabled={isLoading}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-12 rounded-xl text-sm font-semibold"
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                        Sending reset link...
                                    </div>
                                ) : (
                                    "Send reset link"
                                )}
                            </Button>
                        </form>
                    )}

                    {success && (
                        <div className="space-y-3">
                            <p className="text-sm text-muted-foreground text-center">
                                Didn't receive the email? Check your spam folder
                                or try again.
                            </p>
                            <Button
                                type="button"
                                onClick={() => {
                                    setSuccess(false);
                                    setEmail("");
                                }}
                                variant="outline"
                                className="w-full h-11 rounded-xl text-sm font-semibold"
                            >
                                Try another email
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Back to Login Link */}
            <div className="text-center">
                <Link
                    href="/login"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                >
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                        />
                    </svg>
                    Back to login
                </Link>
            </div>
        </div>
    );
}
