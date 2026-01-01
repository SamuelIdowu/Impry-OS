"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdownMenu"
import { Avatar } from "@/components/ui/avatar"
import { createBrowserClient } from "@/lib/supabase-browser"

import { User } from "@supabase/supabase-js"

interface UserMenuProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    user: User
}

export function UserMenu({ open, onOpenChange, user }: UserMenuProps) {
    const router = useRouter()

    const handleLogout = async () => {
        const supabase = createBrowserClient()
        await supabase.auth.signOut()
        router.push("/login")
    }

    return (
        <DropdownMenu open={open} onOpenChange={onOpenChange}>
            <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-zinc-100 transition-colors">
                    <Avatar
                        src={user?.user_metadata?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + (user?.email || "User")}
                        fallback={user?.email?.charAt(0).toUpperCase() || "U"}
                        size="sm"
                        className="border border-zinc-200 shadow-sm"
                    />
                    <span className="text-sm font-medium hidden sm:block truncate max-w-[100px]">
                        {user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User"}
                    </span>
                    <svg
                        className="size-4 text-zinc-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                        />
                    </svg>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center gap-3 p-2">
                    <Avatar
                        src={user?.user_metadata?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + (user?.email || "User")}
                        fallback={user?.email?.charAt(0).toUpperCase() || "U"}
                        size="md"
                    />
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold truncate">
                            {user?.user_metadata?.full_name || "User"}
                        </span>
                        <span className="text-xs text-zinc-500 truncate">{user?.email}</span>
                    </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                    <svg
                        className="mr-2 size-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                        />
                    </svg>
                    Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/account")}>
                    <svg
                        className="mr-2 size-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                    </svg>
                    Account Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <svg
                        className="mr-2 size-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                    </svg>
                    Logout
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
