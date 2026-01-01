import * as React from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string;
    description: string;
    action?: React.ReactNode;
    secondaryAction?: React.ReactNode;
    image?: string;
    imageAlt?: string;
    icons?: React.ReactNode[]; // For cases with multiple icons/avatars
}

export function EmptyState({
    title,
    description,
    action,
    secondaryAction,
    image,
    imageAlt = "Illustration",
    icons,
    className,
    ...props
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                "flex flex-1 flex-col items-center justify-center min-h-[400px] rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 p-8 text-center animate-in fade-in-50 zoom-in-95 duration-500",
                className
            )}
            {...props}
        >
            <div className="mb-8 relative group cursor-pointer">
                {/* Decorative background blur */}
                <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full transform scale-75 group-hover:scale-90 transition-transform duration-500" />

                {/* Illustration Image or Icons */}
                <div className="relative bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm ring-1 ring-zinc-100 dark:ring-zinc-800">
                    {image ? (
                        <div
                            className="w-32 h-32 md:w-48 md:h-48 bg-contain bg-center bg-no-repeat opacity-90 transition-opacity group-hover:opacity-100"
                            style={{ backgroundImage: `url("${image}")` }}
                            role="img"
                            aria-label={imageAlt}
                        />
                    ) : icons ? (
                        <div className="flex items-center justify-center w-32 h-32 md:w-48 md:h-48">
                            {icons}
                        </div>
                    ) : null}
                </div>
            </div>

            <h2 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">
                {title}
            </h2>

            <p className="text-zinc-500 dark:text-zinc-400 max-w-md text-base leading-relaxed mb-8">
                {description}
            </p>

            {action && (
                <div className="flex flex-col gap-4 items-center">
                    {action}
                </div>
            )}

            {secondaryAction && (
                <div className="mt-8 w-full max-w-md">
                    {secondaryAction}
                </div>
            )}
        </div>
    );
}
