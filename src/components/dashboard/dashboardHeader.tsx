"use client"

import React, { useEffect, useState } from "react"
import { QuickActions } from "./quickActions"

interface DashboardHeaderProps {
    userName?: string | null
    reminderCount: number
    revenueChangePercent: number
}

export function DashboardHeader({ userName, reminderCount, revenueChangePercent }: DashboardHeaderProps) {
    const [greeting, setGreeting] = useState("Good day")

    useEffect(() => {
        const hour = new Date().getHours()
        if (hour >= 4 && hour < 12) {
            setGreeting("Good morning")
        } else if (hour >= 12 && hour < 17) {
            setGreeting("Good afternoon")
        } else {
            setGreeting("Good evening")
        }
    }, [])

    const firstName = userName ? userName.trim().split(' ')[0] : 'User'

    return (
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">
                    {greeting}, {firstName}
                </h1>
                <p className="text-zinc-500 text-base">
                    You have <span className="font-bold text-zinc-900">{reminderCount} items</span> requiring attention today.
                    {revenueChangePercent >= 0 ? ' Revenue looks stable.' : ' Revenue is slightly down.'}
                </p>
            </div>
            <div className="w-full lg:w-auto">
                <QuickActions />
            </div>
        </div>
    )
}
