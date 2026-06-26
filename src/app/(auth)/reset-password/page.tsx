"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { FormInput } from "@/components/auth/FormInput";
import { PasswordStrengthIndicator } from "@/components/auth/PasswordStrengthIndicator";
import { confirmPasswordReset } from "@/server/actions/auth/actions";

export default function ResetPasswordPage() {
    const router = useRouter();
    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setPasswordError("");

        // Validate passwords match
        if (password !== confirmPassword) {
            setPasswordError("Passwords do not match");
            setIsLoading(false);
            return;
        }

        // Validate password strength
        if (password.length < 8) {
            setPasswordError("Password must be at least 8 characters");
            setIsLoading(false);
            return;
        }

        try {
            const result = await confirmPasswordReset(password);

            if (result.success) {
                setSuccess(true);
                // Redirect to login after 2 seconds
                setTimeout(() => {
                    router.push("/login?message=password_reset");
                }, 2000);
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
                    Set new password
                </h1>
                <p className="text-muted-foreground text-sm font-normal">
                    Choose a strong password for your account.
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
                                        Password reset successful!
                                    </p>
                                    <p className="text-sm">
                                        Redirecting you to login...
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
                            <div className="space-y-2">
                                <FormInput
                                    label="New Password"
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    autoComplete="new-password"
                                    disabled={isLoading}
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
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
                                <PasswordStrengthIndicator password={password} />
                            </div>

                            <FormInput
                                label="Confirm New Password"
                                name="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                required
                                autoComplete="new-password"
                                disabled={isLoading}
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                }
                                error={passwordError}
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
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
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
                                        Resetting password...
                                    </div>
                                ) : (
                                    "Reset password"
                                )}
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
