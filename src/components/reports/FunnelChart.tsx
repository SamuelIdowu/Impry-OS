import React from "react"
import { Lightbulb } from "lucide-react"

interface FunnelChartProps {
    data?: {
        sent: number
        replied: number
        closed: number
    }
}

export function FunnelChart({ data = { sent: 0, replied: 0, closed: 0 } }: FunnelChartProps) {
    const conversionReplied = data.sent > 0 ? Math.round((data.replied / data.sent) * 100) : 0
    const conversionClosed = data.replied > 0 ? Math.round((data.closed / data.replied) * 100) : 0

    return (
        <div className="lg:col-span-1 flex flex-col rounded-xl bg-white border border-zinc-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-zinc-900 mb-1">Follow-up Effectiveness</h3>
            <p className="text-sm text-zinc-500 mb-6">Client engagement funnel.</p>
            <div className="flex flex-col gap-6 mt-2">
                <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-zinc-900">Proposals Sent</span>
                        <span className="text-sm font-bold text-zinc-900">{data.sent}</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                        <div className="h-full bg-zinc-900 w-[100%] rounded-full"></div>
                    </div>
                </div>
                <div className="relative pl-4 border-l border-dashed border-zinc-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-zinc-500">Replied</span>
                        <span className="text-sm font-bold text-zinc-900">{data.replied}</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-500 rounded-full transition-all duration-500"
                            style={{ width: `${conversionReplied}%` }}
                        ></div>
                    </div>
                    <span className="text-xs text-zinc-500 mt-1 block">{conversionReplied}% conversion</span>
                </div>
                <div className="relative pl-4 border-l border-dashed border-zinc-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-zinc-500">Closed</span>
                        <span className="text-sm font-bold text-zinc-900">{data.closed}</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-green-500 rounded-full transition-all duration-500"
                            style={{ width: `${conversionClosed}%` }}
                        ></div>
                    </div>
                    <span className="text-xs text-zinc-500 mt-1 block">{conversionClosed}% from replied</span>
                </div>
                <div className="mt-auto pt-4 border-t border-zinc-200">
                    <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-lg border border-zinc-200/50">
                        <div className="size-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center shadow-sm text-blue-600">
                            <Lightbulb className="h-4 w-4" />
                        </div>
                        <p className="text-xs text-zinc-500 leading-tight">
                            Tip: Follow-ups sent within 2 days have a <span className="font-semibold text-zinc-900">3x higher</span> response rate.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
