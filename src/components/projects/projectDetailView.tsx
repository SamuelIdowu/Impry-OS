"use client"

import React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
    ChevronRight,
    Filter,
    Plus,
    ArrowRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import { NextReminderCard } from "@/components/nextReminderCard"
import { PaymentSummaryCard } from "@/components/paymentSummaryCard"
import { ScopeSummaryCard } from "@/components/scopeSummaryCard"
import { ScopeTab } from "@/components/scopeTab"
import { TimelineTab } from "@/components/timelineTab"
import { PaymentsTab } from "@/components/paymentsTab"
import { ProjectHeader } from "@/components/projectHeader"

// Types
import { ProjectWithDetails } from "@/lib/types/project"

interface ProjectDetailViewProps {
    project: ProjectWithDetails;
}

// Custom Donut Chart Component
const DonutChart = ({ percentage }: { percentage: number }) => {
    const radius = 35
    const circumference = 2 * Math.PI * radius
    const dashoffset = circumference - (percentage / 100) * circumference

    return (
        <div className="relative flex items-center justify-center">
            <svg className="transform -rotate-90 w-24 h-24">
                <circle
                    className="text-zinc-100"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="48"
                    cy="48"
                />
                <circle
                    className="text-zinc-900 transition-all duration-1000 ease-out"
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashoffset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="48"
                    cy="48"
                />
            </svg>
            <span className="absolute text-lg font-bold text-zinc-900">{percentage}%</span>
        </div>
    )
}

export function ProjectDetailView({ project }: ProjectDetailViewProps) {
    const router = useRouter()
    const [activeTab, setActiveTab] = React.useState('overview')

    // Calculated fields
    const totalValue = project.budget || 0;
    // Calculate paid amount from payments
    const paidAmount = project.payments?.reduce((sum, p) => p.status === 'paid' ? sum + p.amount : sum, 0) || 0;
    const pendingAmount = totalValue - paidAmount;
    const progress = project.progress || 0;

    // Helper for dates
    const startDate = project.start_date ? new Date(project.start_date) : new Date();
    const dueDate = project.deadline ? new Date(project.deadline) : new Date();
    const totalDuration = dueDate.getTime() - startDate.getTime();
    const elapsed = Date.now() - startDate.getTime();
    const timelineProgress = totalDuration > 0 ? Math.min(100, Math.max(0, (elapsed / totalDuration) * 100)) : 0;
    const daysRemaining = Math.max(0, Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

    // Mapped Client for ScopeTab
    const clientForScope = project.client ? {
        id: project.client.id,
        name: project.client.name,
        companyName: project.client.company || '',
        email: project.client.email,
        // Mock missing fields
        projectCount: 0,
        totalRevenue: 0,
        status: 'Active' as const,
        lastActive: '',
        joinedDate: '',
        avatar: project.client.name.substring(0, 2).toUpperCase()
    } : undefined;

    // Mapped Project for ScopeTab (needs UI Project type)
    const projectForScope = {
        id: project.id,
        name: project.name,
        clientId: project.client_id || '',
        clientName: project.client?.name || '',
        status: project.status as any,
        progress: progress,
        dueDate: dueDate.toLocaleDateString(),
        startDate: startDate.toLocaleDateString(),
        totalValue: totalValue,
        paidAmount: paidAmount,
        description: project.description || undefined
    };

    return (
        <div className="flex flex-col w-full mx-auto py-8 px-6 lg:px-8 gap-8">
            {/* Top Navigation / Breadcrumbs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                    <Link href="/projects" className="hover:text-zinc-900 transition-colors">Projects</Link>
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-zinc-900 font-medium">{project.name}</span>
                </div>
            </div>

            <ProjectHeader
                project={project}
                onStatusChange={() => router.refresh()}
                onProjectUpdate={() => router.refresh()}
                onTabChange={setActiveTab}
            />

            <div className="flex flex-col gap-1">

                {/* Tabs */}
                <div className="flex items-center gap-8 mt-6 border-b border-zinc-200">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={cn(
                            "pb-3 text-sm font-medium transition-all border-b-2",
                            activeTab === 'overview'
                                ? "text-zinc-900 border-zinc-900 font-semibold"
                                : "text-zinc-500 border-transparent hover:text-zinc-900 hover:border-zinc-300"
                        )}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('timeline')}
                        className={cn(
                            "pb-3 text-sm font-medium transition-all border-b-2",
                            activeTab === 'timeline'
                                ? "text-zinc-900 border-zinc-900 font-semibold"
                                : "text-zinc-500 border-transparent hover:text-zinc-900 hover:border-zinc-300"
                        )}
                    >
                        Timeline
                    </button>
                    <button
                        onClick={() => setActiveTab('scope')}
                        className={cn(
                            "pb-3 text-sm font-medium transition-all border-b-2",
                            activeTab === 'scope'
                                ? "text-zinc-900 border-zinc-900 font-semibold"
                                : "text-zinc-500 border-transparent hover:text-zinc-900 hover:border-zinc-300"
                        )}
                    >
                        Scope
                    </button>
                    <button
                        onClick={() => setActiveTab('payments')}
                        className={cn(
                            "pb-3 text-sm font-medium transition-all border-b-2",
                            activeTab === 'payments'
                                ? "text-zinc-900 border-zinc-900 font-semibold"
                                : "text-zinc-500 border-transparent hover:text-zinc-900 hover:border-zinc-300"
                        )}
                    >
                        Payments
                    </button>

                </div>
            </div>

            {activeTab === 'overview' && (
                <div className="flex flex-col gap-8 animate-in fade-in duration-500">
                    {/* Financial Summary Card */}
                    <div className="bg-[#FAF9F6] rounded-2xl p-8 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
                        <div className="flex flex-col gap-8 w-full lg:w-auto">
                            <div>
                                <h3 className="text-zinc-500 font-medium mb-1">Financial Summary</h3>
                                <div className="flex items-baseline gap-8">
                                    <div>
                                        <p className="text-4xl font-bold text-zinc-900 tracking-tight">${paidAmount.toLocaleString()}</p>
                                        <p className="text-sm text-zinc-500 mt-1">Total Billed</p>
                                    </div>
                                    <div>
                                        <p className="text-4xl font-bold text-zinc-900 tracking-tight">${pendingAmount.toLocaleString()}</p>
                                        <p className="text-sm text-zinc-500 mt-1">Pending Amount</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="h-16 w-px bg-zinc-200 hidden lg:block"></div>

                        <div className="flex items-center gap-6">
                            <DonutChart percentage={progress} />
                            <div>
                                <p className="text-xl font-bold text-zinc-900">Active</p>
                                <p className="text-sm text-zinc-500">Project Status</p>
                            </div>
                        </div>

                        <div className="h-16 w-px bg-zinc-200 hidden lg:block"></div>

                        <div className="w-full lg:w-64">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-zinc-900">Timeline</span>
                                <span className="text-xs text-zinc-500">
                                    Week {Math.ceil(timelineProgress / (100 / (totalDuration / (1000 * 60 * 60 * 24 * 7))))} / {Math.ceil(totalDuration / (1000 * 60 * 60 * 24 * 7))}
                                </span>
                            </div>
                            <div className="w-full bg-zinc-200 rounded-full h-1.5 mb-4">
                                <div className="bg-zinc-900 h-1.5 rounded-full" style={{ width: `${timelineProgress}%` }}></div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-lg font-bold text-zinc-900">
                                        {daysRemaining} Days
                                    </p>
                                    <p className="text-xs text-zinc-500">Remaining</p>
                                </div>
                                <ArrowRight className="h-5 w-5 text-zinc-400" />
                            </div>
                        </div>
                    </div>

                    {/* Bottom Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <PaymentSummaryCard
                            projectId={project.id}
                            payments={project.payments || []}
                            onViewInvoices={() => setActiveTab('payments')}
                        />
                        <NextReminderCard projectId={project.id} reminders={project.reminders || []} clientEmail={project.client?.email} />
                        <ScopeSummaryCard
                            projectId={project.id}
                            scopes={project.scopes || []}
                            onDefineScope={() => setActiveTab('scope')}
                        />
                    </div>
                </div>
            )}

            {activeTab === 'timeline' && (
                <TimelineTab projectId={project.id} />
            )}

            {activeTab === 'scope' && (
                <ScopeTab project={projectForScope} client={clientForScope} />
            )}

            {activeTab === 'payments' && (
                <PaymentsTab
                    projectId={project.id}
                    payments={project.payments}
                    totalValue={totalValue}
                    paidAmount={paidAmount}
                />
            )}
        </div>
    )
}
