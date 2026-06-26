import React from "react";
import { Input } from "@/components/ui/input";

interface FormInputProps {
    label: string;
    name: string;
    type?: string;
    placeholder?: string;
    required?: boolean;
    error?: string;
    icon?: React.ReactNode;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
    autoComplete?: string;
}

export function FormInput({
    label,
    name,
    type = "text",
    placeholder,
    required = false,
    error,
    icon,
    value,
    onChange,
    disabled = false,
    autoComplete,
}: FormInputProps) {
    return (
        <div className="space-y-2">
            <label
                htmlFor={name}
                className="text-sm font-medium text-foreground flex items-center gap-1"
            >
                {label}
                {required && <span className="text-destructive">*</span>}
            </label>
            <div className="relative">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {icon}
                    </div>
                )}
                <Input
                    id={name}
                    name={name}
                    type={type}
                    placeholder={placeholder}
                    required={required}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    autoComplete={autoComplete}
                    className={`h-11 ${icon ? "pl-10" : ""} ${error
                            ? "border-destructive focus-visible:ring-destructive"
                            : ""
                        }`}
                />
            </div>
            {error && (
                <p className="text-sm text-destructive flex items-center gap-1">
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
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
}
