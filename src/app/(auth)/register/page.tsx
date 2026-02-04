"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/ui/logo";
import { signInWithGoogle } from "@/server/actions/auth/actions";


export default function RegisterPage() {
    const [error, setError] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);

    async function handleGoogleSignIn() {
        setIsLoading(true);
        setError("");

        const result = await signInWithGoogle();

        if (!result.success && result.error) {
            setError(result.error);
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
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    Create your account
                </h1>
                <p className="text-muted-foreground text-sm">
                    Start managing your freelance business with confidence.
                </p>
            </div>

            {/* Form Card */}
            <div className="bg-card rounded-2xl px-6 py-8 shadow-lg border border-border/60 sm:px-10">
                <div className="space-y-5">
                    {/* Error Message */}
                    {error && (
                        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg border border-destructive/20">
                            {error}
                        </div>
                    )}

                    {/* Google OAuth Button */}
                    <div>
                        <Button
                            type="button"
                            onClick={handleGoogleSignIn}
                            disabled={isLoading}
                            variant="outline"
                            className="w-full h-11 rounded-lg gap-3 text-sm font-medium"
                        >
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                                <path d="M12.0003 20.45c4.6653 0 8.5779-3.9126 8.5779-8.5779 0-.4224-.0414-.8364-.108-1.2417H12.0003v3.3138h5.2725c-.2346 1.4913-1.503 2.7219-3.1365 3.0906l-.1359.009-.2046.1362-2.583 1.9965-.0882.0285c1.4724 1.3533 3.6558 2.1525 6.138 2.1525z" fill="#4285F4" />
                                <path d="M5.0046 14.5122c-.4962-1.4673-.4962-3.0456 0-4.5129l-.0045-.1569-2.7306-2.115-.0903.0423C.9606 9.8514.9606 14.6568 2.1792 16.635l2.8254-2.1228z" fill="#34A853" />
                                <path d="M12.0003 4.905c2.3787 0 4.5072.8466 6.1836 2.2464l2.4549-2.4549C18.6675 2.7663 15.4839 1.5498 12.0003 1.5498c-3.7662 0-7.1478 2.1492-8.832 5.3784l2.859 2.148c1.0716-3.2355 4.1085-5.5608 7.6437-5.5608z" fill="#EA4335" />
                                <path d="M12.0003 22.4502c-3.4116 0-6.3681-2.1702-7.5333-5.2443l-2.8254 2.1228C4.3059 23.0163 7.9269 25.5498 12.0003 25.5498c3.2109 0 6.138-1.1895 8.3583-3.1761l-2.709-2.1132c-1.5312 1.341-3.5226 2.1897-5.6493 2.1897z" fill="#34A853" />
                            </svg>
                            <span>Google</span>
                        </Button>
                    </div>
                </div>

                {/* Login Link */}
                <p className="mt-8 text-center text-sm text-muted-foreground">
                    Already have an account?
                    <Link
                        href="/login"
                        className="font-semibold text-foreground hover:underline transition-all ml-1"
                    >
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
}
