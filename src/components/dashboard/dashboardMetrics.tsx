"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { DollarSign, ArrowUpRight, ArrowDownRight, FileText } from "lucide-react"
import Link from "next/link"

// Define props locally or accept generic object map
// But best to stick to specific props for this specific UI component
export interface DashboardMetricsProps {
    monthlyRevenue: number
    revenueChangePercent: number
    revenueGoal: number
    revenueGoalPercent: number
    pendingInvoicesTotal: number
    pendingInvoicesCount: number
}

export function DashboardMetrics({
    monthlyRevenue,
    revenueChangePercent,
    revenueGoal,
    revenueGoalPercent,
    pendingInvoicesTotal,
    pendingInvoicesCount
}: DashboardMetricsProps) {
    const isPositiveChange = revenueChangePercent >= 0

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Monthly Revenue Card */}
            <Card className="bg-white border-zinc-200 relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                    <DollarSign className="w-24 h-24 text-black" />
                </div>
                <CardContent className="p-6 relative z-10">
                    <h4 className="text-zinc-500 text-sm font-medium mb-2 flex items-center gap-2">
                        <span className="size-2 rounded-full bg-green-500"></span>
                        Monthly Revenue
                    </h4>
                    <div className="flex items-baseline gap-3">
                        <span className="text-4xl font-bold text-zinc-900 tracking-tight">
                            ${monthlyRevenue.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                        </span>
                        {revenueChangePercent !== 0 && (
                            <Badge variant="secondary" className={cn(
                                "text-xs font-bold px-2 py-1 rounded-full flex items-center border-none",
                                isPositiveChange ? "text-green-700 bg-green-100" : "text-red-700 bg-red-100"
                            )}>
                                {isPositiveChange ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                                {isPositiveChange ? '+' : ''}{revenueChangePercent.toFixed(1)}%
                            </Badge>
                        )}
                    </div>
                    {/* Progress Bar Manual Implementation to match design style exactly */}
                    <div className="w-full bg-zinc-100 h-2 rounded-full mt-6 overflow-hidden">
                        <div className="bg-black h-full rounded-full" style={{ width: `${Math.min(revenueGoalPercent, 100)}%` }}></div>
                    </div>
                    <p className="text-xs text-zinc-500 mt-2">
                        {revenueGoalPercent.toFixed(0)}% of ${(revenueGoal / 1000).toFixed(0)}k goal
                    </p>
                </CardContent>
            </Card>

            {/* Pending Invoices Card */}
            <Card className="bg-white border-zinc-200 relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                    <FileText className="w-24 h-24 text-blue-600" />
                </div>
                <CardContent className="p-6 relative z-10">
                    <h4 className="text-zinc-500 text-sm font-medium mb-2 flex items-center gap-2">
                        <span className="size-2 rounded-full bg-blue-500"></span>
                        Pending Invoices
                    </h4>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-zinc-900 tracking-tight">
                            ${pendingInvoicesTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>
                    <p className="text-sm text-zinc-500 mt-1">
                        Outstanding across {pendingInvoicesCount} {pendingInvoicesCount === 1 ? 'client' : 'clients'}
                    </p>
                    <div className="flex mt-5 gap-2">
                        <Link href="/invoices" className="text-xs font-medium bg-white border border-zinc-200 hover:bg-zinc-50 px-4 py-2 rounded-lg text-zinc-900 transition-colors shadow-sm">
                            View Details
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
