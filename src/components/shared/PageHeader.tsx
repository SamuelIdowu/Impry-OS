import React from "react"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
    title: string;
    description?: string;
    children?: React.ReactNode;
    className?: string;
}

export function PageHeader({ title, description, children, className }: PageHeaderProps) {
    return (
        <div className={cn("flex flex-col gap-8 mb-8", className)}>
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">{title}</h1>
                    {description && <p className="text-zinc-500 text-base">{description}</p>}
                </div>
                {children && <div className="flex gap-3">{children}</div>}
            </div>
        </div>
    )
}
