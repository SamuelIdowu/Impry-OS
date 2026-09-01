"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useParams } from "next/navigation"
import { useQuery, useQueryClient } from "@tanstack/react-query"
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

// @ts-ignore
import type { User } from "better-auth"
import { getTeamMembersAction, addTeamMemberAction, deleteTeamMemberAction } from "@/server/actions/team"
import { getProfileAction } from "@/server/actions/user"
import { AddTeamMemberModal } from "@/components/settings/AddTeamMemberModal"
import { UpgradeModal } from "@/components/billing/UpgradeModal"

interface TeamMember {
    id: string;
    name: string;
    role: string | null;
    avatarUrl: string | null;
    email: string | null;
}

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    user?: User
    onNavigate?: () => void
}

export function Sidebar({ className, user, onNavigate }: SidebarProps) {
    const pathname = usePathname()
    const params = useParams()
    const workspaceId = params.workspaceId as string || 'default'

    const queryClient = useQueryClient()

    // Fetch team members and profile using React Query
    const { data: membersData, isLoading: isLoadingMembers } = useQuery({
        queryKey: ['teamMembers', workspaceId],
        queryFn: async () => {
            const res = await getTeamMembersAction(workspaceId)
            return res.success ? (res.members as TeamMember[]) : []
        }
    })
    const members = membersData || []

    const { data: profileData } = useQuery({
        queryKey: ['userProfile'],
        queryFn: async () => {
            const res = await getProfileAction()
            return res.success ? res.profile : null
        }
    })
    const subscriptionPlan = (profileData as any)?.subscription_plan || 'free'

    const [showAddModal, setShowAddModal] = React.useState(false)
    const [showUpgradeModal, setShowUpgradeModal] = React.useState(false)
    const [dashboardExpanded, setDashboardExpanded] = React.useState(true)

    const handleDeleteMember = async (memberId: string) => {
        const res = await deleteTeamMemberAction(memberId)
        if (res.success) {
            queryClient.setQueryData(['teamMembers'], (old: TeamMember[] | undefined) => (old || []).filter(m => m.id !== memberId))
        }
    }

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }

    const dashboardSubItems = [
        { title: "Overview", href: `/${workspaceId}/dashboard`, exact: true },
        { title: "Follow-Ups", href: `/${workspaceId}/dashboard/follow-ups`, icon: Bell }
    ]

    const navItems = [
        {
            title: "Clients",
            href: `/${workspaceId}/clients`,
            icon: Users
        },
        {
            title: "Projects",
            href: `/${workspaceId}/projects`,
            icon: Folder
        },
        {
            title: "Calendar",
            href: `/${workspaceId}/calendar`,
            icon: Calendar
        },
        {
            title: "Invoices",
            href: `/${workspaceId}/invoices`,
            icon: CheckSquare
        },
        {
            title: "Reports",
            href: `/${workspaceId}/reports`,
            icon: Activity
        },
        {
            title: "Settings",
            href: `/${workspaceId}/settings`,
            icon: Settings
        },
    ]

    return (
        <aside className={cn("w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hidden md:flex md:flex-col h-full", className)}>
            <div className="space-y-2 py-3 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="px-6 py-1">
                    <Logo textClassName="text-lg font-bold" />
                </div>
                <div className="px-3 py-1">
                    <div className="space-y-0.5">
                        {/* Dashboard with dropdown */}
                        <div>
                            <button
                                onClick={() => setDashboardExpanded(!dashboardExpanded)}
                                className={cn(
                                    "w-full group flex items-center justify-between rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-150 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                    pathname.includes("/dashboard")
                                        ? "bg-zinc-100 text-zinc-900 font-semibold dark:bg-zinc-800 dark:text-zinc-100"
                                        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-100"
                                )}
                            >
                                <div className="flex items-center">
                                    <LayoutGrid className={cn("mr-2.5 h-4 w-4 shrink-0 transition-colors",
                                        pathname.includes("/dashboard")
                                            ? "text-zinc-900 dark:text-zinc-100"
                                            : "text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100"
                                    )} />
                                    <span>Dashboard</span>
                                </div>
                                <ChevronDown className={cn(
                                    "h-3.5 w-3.5 text-zinc-400 transition-transform duration-200",
                                    dashboardExpanded ? "rotate-180" : ""
                                )} />
                            </button>
                            {dashboardExpanded && (
                                <div className="ml-4 pl-2 mt-1 space-y-0.5 border-l border-zinc-100 dark:border-zinc-800">
                                    {dashboardSubItems.map((subItem) => {
                                        const isActive = subItem.exact 
                                            ? pathname === subItem.href 
                                            : pathname === subItem.href;

                                        return (
                                            <Link
                                                key={subItem.href}
                                                href={subItem.href}
                                                onClick={onNavigate}
                                                className={cn(
                                                    "group flex items-center rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all duration-150 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                                    isActive
                                                        ? "bg-zinc-900 text-white shadow-xs hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                                                        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-100"
                                                )}
                                            >
                                                {subItem.icon && (
                                                    <subItem.icon className={cn("mr-2.5 h-3.5 w-3.5 shrink-0 transition-colors",
                                                        isActive
                                                            ? "text-white dark:text-zinc-900"
                                                            : "text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100"
                                                    )} />
                                                )}
                                                <span>{subItem.title}</span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Other nav items */}
                        {navItems.map((item) => {
                            const isActive = pathname.startsWith(item.href);

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={onNavigate}
                                    className={cn(
                                        "group flex items-center rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-150 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                        isActive
                                            ? "bg-zinc-900 text-white shadow-xs hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                                            : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-100"
                                    )}
                                >
                                    <item.icon className={cn("mr-2.5 h-4 w-4 shrink-0 transition-colors",
                                        isActive
                                            ? "text-white dark:text-zinc-900"
                                            : "text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100"
                                    )} />
                                    <span>{item.title}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                <div className="px-4 py-2">
                    <div className="flex items-center justify-between mb-1.5 px-2">
                        <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                            Team Members
                        </span>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors active:scale-[0.98]"
                            title="Add team member"
                        >
                            <Plus className="h-3 w-3" />
                        </button>
                    </div>

                    {/* Members List */}
                    <div className="space-y-0.5">
                        {isLoadingMembers ? (
                            <div className="flex items-center justify-center py-2">
                                <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-400" />
                            </div>
                        ) : members.length === 0 ? (
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors my-0.5 active:scale-[0.98]"
                            >
                                <Plus className="h-3 w-3" />
                                <span>Add team member</span>
                            </button>
                        ) : (
                            members.map((member) => (
                                <div key={member.id} className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900/50 group transition-colors">
                                    <div className={cn(
                                        "size-5 rounded-full flex items-center justify-center text-[9px] font-medium shrink-0",
                                        member.avatarUrl ? "bg-transparent" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                                    )}>
                                        {member.avatarUrl ? (
                                            <img src={member.avatarUrl} alt={member.name} className="size-5 rounded-full object-cover" />
                                        ) : (
                                            getInitials(member.name)
                                        )}
                                    </div>
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-200 truncate leading-tight">{member.name}</span>
                                        {member.role && (
                                            <span className="text-[9px] text-zinc-400 truncate leading-tight">{member.role}</span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleDeleteMember(member.id)}
                                        className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-950/40 text-zinc-400 hover:text-red-500 transition-all active:scale-[0.98]"
                                        title="Remove member"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Upgrade Sidebar Banner Card */}
            {subscriptionPlan === 'free' && (
                <div className="px-3 pb-2">
                    <div className="p-3 rounded-xl bg-linear-to-b from-zinc-900 to-zinc-950 text-white border border-zinc-800 shadow-md flex flex-col gap-2.5">
                        <div className="flex items-center gap-2">
                            <div className="size-6 rounded-md bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0">
                                <Zap className="size-3.5 fill-current" />
                            </div>
                            <span className="text-xs font-bold tracking-tight">Upgrade to Pro</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-snug">
                            Unlock unlimited clients, invoices, & custom branding.
                        </p>
                        <button
                            onClick={() => setShowUpgradeModal(true)}
                            className="w-full py-1.5 px-3 rounded-lg bg-white hover:bg-zinc-100 text-zinc-950 text-xs font-semibold text-center transition-all duration-150 active:scale-[0.98] shadow-xs"
                        >
                            View Plans
                        </button>
                    </div>
                </div>
            )}

            {/* Add Team Member Modal */}
            <AddTeamMemberModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                workspaceId={workspaceId}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['teamMembers', workspaceId] });
                }}
            />

            {/* Upgrade Modal */}
            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                title="Upgrade Workspace"
                description="Scale your freelance business with unlimited projects, custom domains, and automated reminders."
                workspaceId={workspaceId}
            />

            <div className="mt-auto px-3 pb-3 w-full">
                <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3">
                    {user && <UserMenu user={user} subscriptionPlan={subscriptionPlan} />}
                </div>
            </div>
        </aside>
    )
}
