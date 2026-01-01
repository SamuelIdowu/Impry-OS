import React from "react"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    trendLabel?: string;
    trendDirection?: 'up' | 'down' | 'neutral'; // Defaults to up=good/green
    iconColor?: string; // e.g., "text-green-600 bg-green-50"
    className?: string;
}

export function StatsCard({
    title,
    value,
    icon: Icon,
    trend,
    trendLabel,
    trendDirection = 'neutral',
    iconColor = "text-zinc-900 bg-zinc-50",
    className
}: StatsCardProps) {

    // Determine trend color
    let trendColorClass = "bg-zinc-100 text-zinc-700";
    if (trendDirection === 'up') trendColorClass = "bg-green-100 text-green-700";
    if (trendDirection === 'down') trendColorClass = "bg-red-100 text-red-700";
    // Sometimes 'up' is bad (e.g. costs), but default is up=good. User can override generic usage with neutral if needed.

    return (
        <div className={cn("flex flex-col justify-between rounded-xl p-6 bg-white border border-zinc-200 shadow-sm hover:shadow-md transition-shadow", className)}>
            <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                    <p className="text-zinc-500 text-sm font-medium">{title}</p>
                    <p className="text-zinc-900 text-4xl font-bold tracking-tight">{value}</p>
                </div>
                <div className={cn("p-2 rounded-lg", iconColor)}>
                    <Icon className="h-6 w-6" />
                </div>
            </div>
            {(trend || trendLabel) && (
                <div className="mt-6 flex items-center gap-2">
                    {trend && (
                        <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", trendColorClass)}>
                            {trend}
                        </span>
                    )}
                    {trendLabel && <span className="text-zinc-500 text-xs">{trendLabel}</span>}
                </div>
            )}
        </div>
    )
}
