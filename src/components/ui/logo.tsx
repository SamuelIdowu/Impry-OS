import React from "react";

interface LogoProps {
    className?: string;
    showText?: boolean;
    iconClassName?: string;
    textClassName?: string;
}

export function Logo({
    className = "",
    showText = true,
    iconClassName = "w-6 h-6",
    textClassName = "text-xl font-bold"
}: LogoProps) {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {/* Icon: Three circles in triangular formation */}
            <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className={iconClassName}
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Top circle */}
                <circle cx="12" cy="6" r="2.5" />
                {/* Bottom left circle */}
                <circle cx="7" cy="15" r="2.5" />
                {/* Bottom right circle */}
                <circle cx="17" cy="15" r="2.5" />
            </svg>
            {showText && (
                <span className={textClassName}>Impry OS</span>
            )}
        </div>
    );
}
