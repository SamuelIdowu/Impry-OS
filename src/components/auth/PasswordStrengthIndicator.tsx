import React from "react";

interface PasswordStrengthIndicatorProps {
    password: string;
}

type StrengthLevel = "weak" | "medium" | "strong";

interface StrengthConfig {
    level: StrengthLevel;
    label: string;
    color: string;
    bgColor: string;
    width: string;
}

function calculatePasswordStrength(password: string): StrengthConfig {
    if (!password) {
        return {
            level: "weak",
            label: "Weak",
            color: "text-red-500",
            bgColor: "bg-red-500",
            width: "w-0",
        };
    }

    let strength = 0;

    // Length check
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;

    // Character variety checks
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2) {
        return {
            level: "weak",
            label: "Weak",
            color: "text-red-500",
            bgColor: "bg-red-500",
            width: "w-1/3",
        };
    } else if (strength <= 4) {
        return {
            level: "medium",
            label: "Medium",
            color: "text-yellow-500",
            bgColor: "bg-yellow-500",
            width: "w-2/3",
        };
    } else {
        return {
            level: "strong",
            label: "Strong",
            color: "text-green-500",
            bgColor: "bg-green-500",
            width: "w-full",
        };
    }
}

function getPasswordRequirements(password: string) {
    return [
        {
            label: "At least 8 characters",
            met: password.length >= 8,
        },
        {
            label: "Contains uppercase letter",
            met: /[A-Z]/.test(password),
        },
        {
            label: "Contains lowercase letter",
            met: /[a-z]/.test(password),
        },
        {
            label: "Contains number",
            met: /[0-9]/.test(password),
        },
        {
            label: "Contains special character",
            met: /[^a-zA-Z0-9]/.test(password),
        },
    ];
}

export function PasswordStrengthIndicator({
    password,
}: PasswordStrengthIndicatorProps) {
    const strength = calculatePasswordStrength(password);
    const requirements = getPasswordRequirements(password);

    if (!password) return null;

    return (
        <div className="space-y-3">
            {/* Strength Bar */}
            <div className="space-y-1">
                <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                        Password strength
                    </span>
                    <span className={`text-xs font-medium ${strength.color}`}>
                        {strength.label}
                    </span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                        className={`h-full ${strength.bgColor} transition-all duration-300 ${strength.width}`}
                    />
                </div>
            </div>

            {/* Requirements Checklist */}
            <div className="space-y-1.5">
                {requirements.map((req, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <div
                            className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${req.met
                                    ? "bg-green-500 text-white"
                                    : "bg-muted text-muted-foreground"
                                }`}
                        >
                            {req.met && (
                                <svg
                                    className="w-3 h-3"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={3}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            )}
                        </div>
                        <span
                            className={`text-xs ${req.met
                                    ? "text-foreground"
                                    : "text-muted-foreground"
                                }`}
                        >
                            {req.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
