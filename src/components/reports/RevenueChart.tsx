"use client"

import React, { useMemo } from "react"
import { MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"

export function RevenueChart({ data }: { data?: { month: string; revenue: number }[] }) {
    const chartData = data || []
    const maxRevenue = useMemo(() => Math.max(...chartData.map(d => d.revenue), 1000), [chartData])

    // Format currency
    const formatCurrency = (value: number) => {
        if (value >= 1000) {
            return `$${(value / 1000).toFixed(1)}k`
        }
        return `$${value}`
    }

    return (
        <div className="lg:col-span-2 flex flex-col rounded-xl bg-white border border-zinc-200 shadow-sm p-6 overflow-hidden h-full min-h-[400px]">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-lg font-bold text-zinc-900">Revenue Report</h3>
                    <p className="text-sm text-zinc-500">Earnings breakdown over the selected period.</p>
                </div>
                <button className="text-zinc-500 hover:text-zinc-900 transition-colors p-1 rounded-md hover:bg-zinc-100">
                    <MoreHorizontal className="h-5 w-5" />
                </button>
            </div>

            <div className="flex-1 w-full flex relative">
                {/* Fixed Y-Axis Labels */}
                <div className="flex flex-col justify-between pb-8 pr-2 h-full absolute left-0 top-0 bottom-0 z-20 bg-white/10 pointer-events-none">
                    {[4, 3, 2, 1, 0].map((i) => {
                        const value = (maxRevenue * i) / 4
                        return (
                            <div key={i} className="flex items-center h-0 relative">
                                <div className="text-[10px] text-zinc-400 w-8 text-right translate-y-[-50%]">
                                    {formatCurrency(value)}
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Scrollable Chart Area */}
                <div className="flex-1 overflow-x-auto overflow-y-hidden pl-10 scrollbar-thin scrollbar-thumb-zinc-200 scrollbar-track-transparent pb-1">
                    <div
                        className="flex flex-col justify-end relative h-full min-w-full"
                        style={{ minWidth: `${Math.max(100, chartData.length * 60)}px` }}
                    >
                        {/* Grid lines */}
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8 w-full">
                            {[4, 3, 2, 1, 0].map((i) => (
                                <div key={i} className="w-full flex items-center h-0 relative">
                                    <div className="w-full border-t border-dashed border-zinc-200" />
                                </div>
                            ))}
                        </div>

                        {/* Bars Container */}
                        <div className="flex items-end justify-between gap-1 sm:gap-2 h-[260px] relative z-10 w-full mb-8">
                            {chartData.map((data, index) => {
                                const heightPercentage = Math.max((data.revenue / maxRevenue) * 100, 4) // Min height for visibility
                                return (
                                    <div key={index} className="flex flex-col items-center gap-2 flex-1 group h-full justify-end min-w-[40px]">
                                        <div
                                            className="relative w-full max-w-[40px] rounded-t-sm transition-all duration-300 flex items-end justify-center group cursor-pointer"
                                            style={{ height: `${heightPercentage}%` }}
                                        >
                                            {/* Tooltip */}
                                            <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 bg-zinc-900 text-white text-xs py-1.5 px-2.5 rounded shadow-xl transition-all duration-200 whitespace-nowrap z-50 pointer-events-none translate-y-2 group-hover:translate-y-0 fixed md:absolute left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0">
                                                <div className="font-semibold">{formatCurrency(data.revenue)}</div>
                                                <div className="text-[10px] text-zinc-400">{data.month}</div>
                                                {/* Arrow */}
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900 md:block hidden"></div>
                                            </div>

                                            {/* Bar Graphic */}
                                            <div className={cn(
                                                "w-full mx-0.5 sm:mx-1 h-full rounded-t-md transition-all duration-300 relative overflow-hidden",
                                                "bg-zinc-900 opacity-90 group-hover:opacity-100 group-hover:scale-y-[1.02] origin-bottom"
                                            )}>
                                                <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            </div>
                                        </div>
                                        <span className="text-[10px] sm:text-xs text-zinc-500 font-medium group-hover:text-zinc-900 transition-colors truncate w-full text-center">{data.month}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
