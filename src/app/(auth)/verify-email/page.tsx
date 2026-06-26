"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { resendConfirmationEmail } from "@/server/actions/auth/actions";

export default function VerifyEmailPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<"loading" | "success" | "error">(
        "loading"
    );
    const [error, setError] = useState<string>("");
    const [isResending, setIsResending] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);

    const email = searchParams.get("email") || "";

    useEffect(() => {
        // Check if there's a token in the URL
        const token = searchParams.get("token");
        const type = searchParams.get("type");

        if (token && type === "signup") {
            // Token verification is handled by Better Auth automatically
            // We just need to show success and redirect
            setStatus("success");
            setTimeout(() => {
                router.push("/dashboard");
            }, 3000);
        } else if (email) {
            // User was redirected here after registration
            setStatus("loading");
        } else {
            setStatus("error");
            setError("Invalid verification link");
        }
    }, [searchParams, router, email]);

    async function handleResendEmail() {
        if (!email) {
            setError("Email address not found");
            return;
        }

        setIsResending(true);
        setError("");
        setResendSuccess(false);

        try {
            const result = await resendConfirmationEmail(email);

            if (result.success) {
                setResendSuccess(true);
            } else if (result.error) {
                setError(result.error);
            }
        } catch (err) {
            console.error("Resend email error:", err);
            setError("Failed to resend email");
        } finally {
            setIsResending(false);
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
                    {status === "success"
                        ? "Email verified!"
                        : "Verify your email"}
                </h1>
            </div>

            {/* Content Card */}
            <div className="bg-card rounded-2xl p-8 shadow-lg border border-border/60">
                <div className="flex flex-col gap-5">
                    {/* Loading State */}
                    {status === "loading" && (
                        <div className="text-center space-y-4">
                            <div className="flex justify-center">
                                <div className="w-16 h-16 border-4 border-muted border-t-primary rounded-full animate-spin" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-foreground font-medium">
                                    Check your email
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    We've sent a verification link to{" "}
                                    <strong className="text-foreground">
                                        {email}
                                    </strong>
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Click the link in the email to verify your
                                    account.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Success State */}
                    {status === "success" && (
                        <div className="text-center space-y-4">
                            <div className="flex justify-center">
                                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                                    <svg
                                        className="w-8 h-8 text-green-500"
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
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-foreground font-semibold text-lg">
                                    Your email has been verified!
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Redirecting you to your dashboard...
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {status === "error" && (
                        <div className="text-center space-y-4">
                            <div className="flex justify-center">
                                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                                    <svg
                                        className="w-8 h-8 text-destructive"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-foreground font-semibold text-lg">
                                    Verification failed
                                </p>
                                <p className="text-sm text-destructive">
                                    {error ||
                                        "The verification link is invalid or has expired."}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Resend Email Section */}
                    {status === "loading" && (
                        <div className="space-y-3 pt-4 border-t border-border">
                            {resendSuccess && (
                                <div className="bg-green-500/10 text-green-600 dark:text-green-400 text-sm p-3 rounded-lg border border-green-500/20">
                                    Email sent! Check your inbox.
                                </div>
                            )}
                            {error && (
                                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg border border-destructive/20">
                                    {error}
                                </div>
                            )}
                            <p className="text-sm text-muted-foreground text-center">
                                Didn't receive the email?
                            </p>
                            <Button
                                type="button"
                                onClick={handleResendEmail}
                                disabled={isResending}
                                variant="outline"
                                className="w-full h-11 rounded-xl text-sm font-semibold"
                            >
                                {isResending ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
                                        Sending...
                                    </div>
                                ) : (
                                    "Resend verification email"
                                )}
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
