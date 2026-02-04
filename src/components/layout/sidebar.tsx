"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { UserMenu } from "./userMenu"
import { Logo } from "@/components/ui/logo"
import {
    LayoutGrid,
    CheckSquare,
    Activity,
    Folder,
    Users,
    Settings,
    Plus,
    X,
    Loader2,
    Trash2,
    ChevronDown,
    Bell,
    Calendar,
    Zap
} from "lucide-react"

import { User } from "@supabase/supabase-js"
import { getTeamMembersAction, addTeamMemberAction, deleteTeamMemberAction } from "@/server/actions/team"
import { getProfileAction } from "@/server/actions/user"

interface TeamMember {
    id: string;
    name: string;
    role: string | null;
    avatar_url: string | null;
    email: string | null;
}

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    user?: User
}

export function Sidebar({ className, user }: SidebarProps) {
    const pathname = usePathname()

    // Team members state
    const [members, setMembers] = React.useState<TeamMember[]>([])
    const [isLoadingMembers, setIsLoadingMembers] = React.useState(true)
    const [showAddMember, setShowAddMember] = React.useState(false)
    const [isAddingMember, setIsAddingMember] = React.useState(false)
    const [newMember, setNewMember] = React.useState({ name: '', role: '' })
    const [dashboardExpanded, setDashboardExpanded] = React.useState(true)
    const [subscriptionPlan, setSubscriptionPlan] = React.useState<string>('free') // Default to free until fetched

    // Fetch team members and profile on mount
    React.useEffect(() => {
        const fetchData = async () => {
            const [membersRes, profileRes] = await Promise.all([
                getTeamMembersAction(),
                getProfileAction()
            ]);

            if (membersRes.success) {
                setMembers(membersRes.members)
            }
            if (profileRes.success && profileRes.profile) {
                setSubscriptionPlan(profileRes.profile.subscription_plan)
            }
            setIsLoadingMembers(false)
        }
        fetchData()
    }, [])

    const handleAddMember = async () => {
        if (!newMember.name.trim()) return

        setIsAddingMember(true)
        const res = await addTeamMemberAction({
            name: newMember.name,
            role: newMember.role || undefined
        })

        if (res.success && res.member) {
            setMembers([...members, res.member])
            setNewMember({ name: '', role: '' })
            setShowAddMember(false)
        }
        setIsAddingMember(false)
    }

    const handleDeleteMember = async (memberId: string) => {
        const res = await deleteTeamMemberAction(memberId)
        if (res.success) {
            setMembers(members.filter(m => m.id !== memberId))
        }
    }

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }

    const dashboardSubItems = [
        { title: "Overview", href: "/dashboard", exact: true },
        { title: "Follow-Ups", href: "/dashboard/follow-ups", icon: Bell }
    ]

    const navItems = [
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
            title: "Calendar",
            href: "/calendar",
            icon: Calendar
        },
        {
            title: "Invoices",
            href: "/invoices",
            icon: CheckSquare
        },
        {
            title: "Reports",
            href: "/reports",
            icon: Activity
        },
        {
            title: "Settings",
            href: "/settings",
            icon: Settings
        },
    ]

    return (
        <aside className={cn("w-64 border-r border-zinc-200 bg-white hidden md:flex md:flex-col h-full", className)}>
            <div className="space-y-4 py-4 flex-1 overflow-y-auto">
                <div className="px-6 py-2">
                    <Logo textClassName="text-xl font-bold" />
                </div>
                <div className="px-3 py-2">
                    <div className="space-y-1">
                        {/* Dashboard with dropdown */}
                        <div>
                            <button
                                onClick={() => setDashboardExpanded(!dashboardExpanded)}
                                className={cn(
                                    "w-full group flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-zinc-100 hover:text-zinc-900 transition-colors",
                                    pathname.startsWith("/dashboard")
                                        ? "bg-zinc-100 text-zinc-900"
                                        : "text-zinc-500"
                                )}
                            >
                                <div className="flex items-center">
                                    <LayoutGrid className={cn("mr-2 h-4 w-4",
                                        pathname.startsWith("/dashboard")
                                            ? "text-zinc-900"
                                            : "text-zinc-400 group-hover:text-zinc-900"
                                    )} />
                                    <span>Dashboard</span>
                                </div>
                                <ChevronDown className={cn(
                                    "h-4 w-4 text-zinc-400 transition-transform",
                                    dashboardExpanded ? "rotate-180" : ""
                                )} />
                            </button>
                            {dashboardExpanded && (
                                <div className="ml-6 mt-1 space-y-1">
                                    {dashboardSubItems.map((subItem) => (
                                        <Link
                                            key={subItem.href}
                                            href={subItem.href}
                                            className={cn(
                                                "group flex items-center rounded-md px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 hover:text-zinc-900 transition-colors",
                                                (subItem.exact ? pathname === subItem.href : pathname === subItem.href)
                                                    ? "text-zinc-900 bg-zinc-50"
                                                    : "text-zinc-500"
                                            )}
                                        >
                                            {subItem.icon && (
                                                <subItem.icon className={cn("mr-2 h-3.5 w-3.5",
                                                    pathname === subItem.href
                                                        ? "text-zinc-900"
                                                        : "text-zinc-400 group-hover:text-zinc-900"
                                                )} />
                                            )}
                                            <span>{subItem.title}</span>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Other nav items */}
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-zinc-100 hover:text-zinc-900 transition-colors",
                                    pathname.startsWith(item.href)
                                        ? "bg-zinc-100 text-zinc-900"
                                        : "text-zinc-500"
                                )}
                            >
                                <item.icon className={cn("mr-2 h-4 w-4",
                                    pathname.startsWith(item.href)
                                        ? "text-zinc-900"
                                        : "text-zinc-400 group-hover:text-zinc-900"
                                )} />
                                <span>{item.title}</span>
                            </Link>
                        ))}
                    </div>
                </div>
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between mb-2 px-2">
                        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                            Team Members
                        </h3>
                        <button
                            onClick={() => setShowAddMember(!showAddMember)}
                            className="p-1 rounded hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors"
                            title="Add team member"
                        >
                            {showAddMember ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                        </button>
                    </div>

                    {/* Add Member Form */}
                    {showAddMember && (
                        <div className="mb-4 p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                            <input
                                type="text"
                                placeholder="Name"
                                value={newMember.name}
                                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                                className="w-full text-sm px-2.5 py-1.5 rounded border border-zinc-200 bg-white mb-2 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                            />
                            <input
                                type="text"
                                placeholder="Role (optional)"
                                value={newMember.role}
                                onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                                className="w-full text-sm px-2.5 py-1.5 rounded border border-zinc-200 bg-white mb-2 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                            />
                            <button
                                onClick={handleAddMember}
                                disabled={isAddingMember || !newMember.name.trim()}
                                className="w-full text-sm font-medium py-1.5 rounded bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                            >
                                {isAddingMember && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                Add Member
                            </button>
                        </div>
                    )}

                    {/* Members List */}
                    <div className="space-y-2 mt-4">
                        {isLoadingMembers ? (
                            <div className="flex items-center justify-center py-4">
                                <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                            </div>
                        ) : members.length === 0 ? (
                            <p className="text-xs text-zinc-400 text-center py-4 px-2">
                                No team members yet. Add your first member!
                            </p>
                        ) : (
                            members.map((member) => (
                                <div key={member.id} className="flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-zinc-50 group">
                                    <div className={cn(
                                        "size-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0",
                                        member.avatar_url ? "bg-transparent" : "bg-zinc-100 text-zinc-500"
                                    )}>
                                        {member.avatar_url ? (
                                            <img src={member.avatar_url} alt={member.name} className="size-8 rounded-full object-cover" />
                                        ) : (
                                            getInitials(member.name)
                                        )}
                                    </div>
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <span className="text-sm font-medium text-zinc-700 truncate">{member.name}</span>
                                        {member.role && (
                                            <span className="text-xs text-zinc-400 truncate">{member.role}</span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleDeleteMember(member.id)}
                                        className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-50 text-zinc-400 hover:text-red-500 transition-all"
                                        title="Remove member"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-auto px-3 w-full">
                {subscriptionPlan === 'free' && (
                    <div className="mb-4 mx-2 p-4 bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl text-white shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Zap className="w-12 h-12" />
                        </div>
                        <h4 className="font-bold text-sm mb-1 relative z-10">Upgrade to Pro</h4>
                        <p className="text-xs text-zinc-300 mb-3 relative z-10 leading-relaxed">
                            Get unlimited clients, advanced analytics, and custom branding.
                        </p>
                        <Link
                            href="/pricing"
                            className="block w-full text-center py-2 bg-white text-zinc-900 rounded-lg text-xs font-bold hover:bg-zinc-100 transition-colors relative z-10"
                        >
                            View Plans
                        </Link>
                    </div>
                )}
                <div className="border-t border-zinc-100 pt-4">
                    {user && <UserMenu user={user} subscriptionPlan={subscriptionPlan} />}
                </div>
            </div>
        </aside>
    )
}
