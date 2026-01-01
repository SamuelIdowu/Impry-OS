"use client"

import * as React from "react"
import { User } from "@supabase/supabase-js"
import { Sidebar } from "./sidebar"
import { AppHeader } from "./appHeader"

interface AppShellProps {
    children: React.ReactNode
    user: User
}

export function AppShell({ children, user }: AppShellProps) {
    return (
        <div className="flex h-screen overflow-hidden bg-[#fcfcfc]">
            <Sidebar user={user} />
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <AppHeader user={user} />
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}
