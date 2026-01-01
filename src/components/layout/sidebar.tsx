"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { createBrowserClient } from "@/lib/supabase-browser"
import {
    LayoutGrid,
    CheckSquare,
    Activity,
    Folder,
    Users,
    Settings,
    LogOut,
    ChevronRight,
    Loader2
} from "lucide-react"

import { User } from "@supabase/supabase-js"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    user?: User
}

export function Sidebar({ className, user }: SidebarProps) {
    const pathname = usePathname()
    const router = useRouter()
    const [isLoggingOut, setIsLoggingOut] = React.useState(false)

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true)
            const supabase = createBrowserClient()
            await supabase.auth.signOut()
            router.push("/login")
        } catch (error) {
            console.error("Logout failed:", error)
        } finally {
            setIsLoggingOut(false)
        }
    }

    const navItems = [
        {
            title: "Dashboard",
            href: "/dashboard",
            icon: LayoutGrid,
            exact: true
        },
        {
            title: "Clients",
            href: "/clients",
            icon: Users
        },
        {
            title: "Projects",
            href: "/projects",
            icon: Folder
        },
        {
            title: "Invoices",
            href: "/invoices",
            icon: CheckSquare // Using CheckSquare as 'receipt_long' equivalent from lucide
        },
        {
            title: "Reports",
            href: "/reports",
            icon: Activity // Using Activity for Reports
        },
        {
            title: "Settings",
            href: "/settings",
            icon: Settings
        },
    ]

    const members = [
        {
            name: "Sandra Perry",
            role: "Product Manager",
            avatar: "https://i.pravatar.cc/150?u=sandra",
            initials: "SP"
        },
        {
            name: "Jamal L.",
            role: "Growth Marketer",
            avatar: "",
            initials: "JL"
        }
    ]

    return (
        <aside className={cn("pb-12 w-64 border-r border-zinc-200 bg-white hidden md:block", className)}>
            <div className="space-y-4 py-4">
                <div className="px-6 py-2">
                    <div className="flex items-center gap-2 font-bold text-xl">
                        <div className="size-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                            F
                        </div>
                        <span>Freelancer OS</span>
                    </div>
                </div>
                <div className="px-3 py-2">
                    <div className="space-y-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-zinc-100 hover:text-zinc-900 transition-colors",
                                    (item.exact ? pathname === item.href : pathname.startsWith(item.href))
                                        ? "bg-zinc-100 text-zinc-900"
                                        : "text-zinc-500"
                                )}
                            >
                                <item.icon className={cn("mr-2 h-4 w-4",
                                    (item.exact ? pathname === item.href : pathname.startsWith(item.href))
                                        ? "text-zinc-900"
                                        : "text-zinc-400 group-hover:text-zinc-900"
                                )} />
                                <span>{item.title}</span>

                            </Link>
                        ))}
                    </div>
                </div>
                <div className="px-6 py-4">
                    <h3 className="mb-2 px-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        Members
                    </h3>
                    <div className="space-y-3 mt-4">
                        {members.map((member, i) => (
                            <div key={i} className="flex items-center gap-3 px-2">
                                <div className={cn("size-8 rounded-full flex items-center justify-center text-xs font-medium", member.avatar ? "bg-transparent" : "bg-zinc-100 text-zinc-500")}>
                                    {member.avatar ? (
                                        <img src={member.avatar} alt={member.name} className="size-8 rounded-full object-cover" />
                                    ) : (
                                        member.initials
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-zinc-700">{member.name}</span>
                                    <span className="text-xs text-zinc-400">{member.role}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-auto px-6 absolute bottom-6 w-full">
                <div className="border-t border-zinc-100 pt-4 flex items-center gap-3">
                    <div className="size-9 rounded-full bg-orange-200 flex items-center justify-center overflow-hidden">
                        {user?.user_metadata?.avatar_url ? (
                            <img src={user.user_metadata.avatar_url} alt={user.user_metadata.full_name || "User"} className="size-9 object-cover" />
                        ) : (
                            <span className="text-sm font-medium text-orange-800">
                                {user?.email?.charAt(0).toUpperCase() || "U"}
                            </span>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-zinc-900 truncate max-w-[120px]">
                            {user?.user_metadata?.full_name || user?.email || "User"}
                        </span>
                    </div>
                    <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="ml-auto text-zinc-400 hover:text-zinc-900 cursor-pointer disabled:opacity-50"
                    >
                        {isLoggingOut ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <LogOut className="h-4 w-4" />
                        )}
                    </button>
                </div>
            </div>
        </aside>
    )
}
