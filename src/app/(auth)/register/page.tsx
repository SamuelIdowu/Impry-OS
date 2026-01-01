"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { signUp, signInWithGoogle } from "@/server/actions/auth/actions";
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react";

export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        setError("");

        const result = await signUp(formData);

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

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col items-center text-center gap-3 mb-2">
                <div className="mb-2 flex items-center justify-center w-12 h-12 rounded-xl bg-white border border-border shadow-sm">
                    <svg className="w-full h-full p-2" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                        <path clipRule="evenodd" d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z" fill="currentColor" fillRule="evenodd" />
                    </svg>
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
                <form action={handleSubmit} className="space-y-5">
                    {/* Error Message */}
                    {error && (
                        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg border border-destructive/20">
                            {error}
                        </div>
                    )}

                    {/* Name Field */}
                    <div>
                        <label
                            className="block text-sm font-medium leading-6 text-foreground mb-1.5"
                            htmlFor="name"
                        >
                            Full Name
                        </label>
                        <div className="relative">
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                placeholder="Jane Doe"
                                required
                                className="w-full h-11 pl-10 text-sm rounded-lg"
                                disabled={isLoading}
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                                <User className="w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    {/* Email Field */}
                    <div>
                        <label
                            className="block text-sm font-medium leading-6 text-foreground mb-1.5"
                            htmlFor="email"
                        >
                            Email address
                        </label>
                        <div className="relative">
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="jane@example.com"
                                required
                                className="w-full h-11 pl-10 text-sm rounded-lg"
                                disabled={isLoading}
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                                <Mail className="w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    {/* Password Field */}
                    <div>
                        <label
                            className="block text-sm font-medium leading-6 text-foreground mb-1.5"
                            htmlFor="password"
                        >
                            Password
                        </label>
                        <div className="relative">
                            <Input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                required
                                className="w-full h-11 pl-10 pr-12 text-sm rounded-lg"
                                disabled={isLoading}
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                                <Lock className="w-5 h-5" />
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {showPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Terms Checkbox */}
                    <div className="flex items-start pt-1">
                        <div className="flex h-5 items-center">
                            <Checkbox
                                id="agreeToTerms"
                                name="agreeToTerms"
                                required
                                className="h-4 w-4"
                                disabled={isLoading}
                            />
                        </div>
                        <div className="ml-3 text-sm leading-5">
                            <label className="font-normal text-muted-foreground" htmlFor="agreeToTerms">
                                I agree to the{" "}
                                <a className="font-medium text-foreground hover:underline transition-all" href="#">
                                    Terms of Service
                                </a>{" "}
                                and{" "}
                                <a className="font-medium text-foreground hover:underline transition-all" href="#">
                                    Privacy Policy
                                </a>
                                .
                            </label>
                        </div>
                    </div>

                    {/* Create Account Button */}
                    <div className="pt-2">
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold shadow transition-all"
                        >
                            {isLoading ? "Creating account..." : "Create account"}
                        </Button>
                    </div>
                </form>

                {/* Divider */}
                <div className="mt-8 mb-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            <span className="bg-card px-4">Or continue with</span>
                        </div>
                    </div>
                </div>

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
