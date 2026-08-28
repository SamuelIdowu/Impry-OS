/* eslint-disable react-hooks/purity */
"use client"

import React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
    Calendar,
    Download,
    DollarSign,
    CheckCircle2,
    Clock,
    Search,
    Filter,
    ArrowRight,
    ChevronRight,
    X,
    LayoutGrid,
    List
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
    DropdownMenuCheckboxItem,
} from "@/components/ui/dropdownMenu"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatsCard } from "@/components/shared/StatsCard"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { RevenueChart } from "@/components/reports/RevenueChart"
import { FunnelChart } from "@/components/reports/FunnelChart"
import { UpgradeModal } from "@/components/billing/UpgradeModal"
import { convertToCSV, downloadCSV } from "@/lib/csv-export"
import { format, isAfter } from "date-fns"
import { Payment } from "@/lib/types/payment"
import { useReportsData, getStartDate } from "@/hooks/useReportsData"

type DateRange = "7days" | "30days" | "90days" | "year" | "all" | "creation"

const DATE_RANGES: { label: string; value: DateRange }[] = [
    { label: "Last 7 Days", value: "7days" },
    { label: "Last 30 Days", value: "30days" },
    { label: "Last 90 Days", value: "90days" },
    { label: "This Year", value: "year" },
    { label: "Since Creation", value: "creation" },
    { label: "All Time", value: "all" },
]

interface ReportsViewProps {
    projects: any[];
    invoices: Payment[];
    userCreatedAt: string;
    planTier?: string;
}

export function ReportsView({ projects, invoices, userCreatedAt, planTier = "free" }: ReportsViewProps) {
    const [searchQuery, setSearchQuery] = React.useState("")
    const [statusFilter, setStatusFilter] = React.useState<string>("All")
    const [projectReportView, setProjectReportView] = React.useState<"list" | "grid">("list")
    const [dateRange, setDateRange] = React.useState<DateRange>("30days")
    const [showUpgradeModal, setShowUpgradeModal] = React.useState(false)

    const params = useParams()
    const workspaceId = params.workspaceId as string || 'default'

    const { filteredProjects: dateFilteredProjects, stats, revenueChartData } = useReportsData(projects, invoices, userCreatedAt, dateRange)

    const filteredProjects = React.useMemo(() => {
        return dateFilteredProjects.filter(project => {
            const matchesSearch = (project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (project.client?.name || '').toLowerCase().includes(searchQuery.toLowerCase()))
            const matchesStatus = statusFilter === "All" || project.status === statusFilter.toLowerCase()
            return matchesSearch && matchesStatus
        })
    }, [searchQuery, statusFilter, dateFilteredProjects])

    const handleExportReport = () => {
        if (planTier === "free") {
            setShowUpgradeModal(true)
            return
        }

        const exportData = filteredProjects.map(p => ({
            "Project Name": p.name,
            "Client": p.client?.name || "Unknown",
            "Status": p.status,
            "Progress (%)": p.progress || 0,
            "Due Date": p.dueDate ? format(new Date(p.dueDate), "yyyy-MM-dd") : "-",
            "Created Date": p.createdAt ? format(new Date(p.createdAt), "yyyy-MM-dd") : "-"
        }))

        const csv = convertToCSV(exportData)
        downloadCSV(csv, `impry_project_report_${format(new Date(), "yyyyMMdd")}.csv`)
    }

    // Status filtering
    const uniqueStatuses = ["All", "active", "completed", "pending"] // Simplified for now, could be dynamic

    return (
        <div className="flex flex-col items-center py-8 px-4 lg:px-8 w-full">
            <div className="w-full   flex flex-col gap-10">

                {/* Header */}
                <PageHeader
                    title="Reports & Insights"
                    description="Key metrics on revenue, project health, and outstanding invoices."
                >
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center justify-center rounded-lg h-10 px-4 bg-white border border-zinc-200 text-zinc-900 text-sm font-medium shadow-sm hover:bg-zinc-50 transition-colors shadow duration-150 min-w-[140px]">
                                <Calendar className="mr-2 h-[18px] w-[18px]" />
                                <span>{DATE_RANGES.find(r => r.value === dateRange)?.label}</span>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            {DATE_RANGES.map((range) => (
                                <DropdownMenuItem
                                    key={range.value}
                                    onClick={() => setDateRange(range.value)}
                                    className="cursor-pointer"
                                >
                                    {range.label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <button
                        onClick={handleExportReport}
                        className="flex items-center justify-center rounded-lg h-10 px-5 bg-zinc-900 text-white text-sm font-medium shadow-sm hover:shadow-md hover:bg-zinc-800 transition-colors shadow duration-150 group"
                    >
                        <Download className="mr-2 h-[18px] w-[18px]" />
                        <span>Export Report</span>
                    </button>
                </PageHeader>

                <UpgradeModal
                    isOpen={showUpgradeModal}
                    onClose={() => setShowUpgradeModal(false)}
                    title="CSV Data Export is a Pro Feature"
                    description="Exporting financial reports and project status data to CSV/Excel is available on Freelancer Pro and Studio plans."
                    workspaceId={workspaceId}
                />

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        {
                            title: "Total Revenue",
                            value: `$${stats.totalRevenue.toLocaleString()}`,
                            icon: DollarSign,
                            // trend: "+12%", // Dynamic calculation possible later
                            // trendLabel: "from last period",
                            // trendDirection: "up" as const,
                            iconColor: "bg-green-50 text-green-600"
                        },
                        {
                            title: "Project Success Rate",
                            value: `${stats.successRate}%`,
                            icon: CheckCircle2,
                            // trend: "+2%",
                            // trendLabel: "completion efficiency",
                            // trendDirection: "up" as const,
                            iconColor: "bg-blue-50 text-blue-600"
                        },
                        {
                            title: "Outstanding Invoices",
                            value: `$${stats.outstandingAmount.toLocaleString()}`,
                            icon: Clock,
                            trend: `${stats.outstandingClients} Clients`,
                            trendLabel: "payment pending",
                            trendDirection: "down" as const,
                            iconColor: "bg-orange-50 text-orange-600"
                        }
                    ].map((stat, i) => (
                        <StatsCard key={i} {...stat} />
                    ))}
                </div>

                {/* Middle Section (Charts) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <RevenueChart
                        data={revenueChartData}
                        range={dateRange === "7days" ? "7d" : dateRange === "30days" ? "30d" : dateRange === "90days" ? "90d" : "12m"}
                        onRangeChange={(r) => setDateRange(r === "7d" ? "7days" : r === "30d" ? "30days" : r === "90d" ? "90days" : "year")}
                    />
                    <FunnelChart />
                </div>

                {/* Project Status Report */}
                <div className="flex flex-col rounded-xl bg-white border border-zinc-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-zinc-200 flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-zinc-900">Project Status Report</h3>
                            <p className="text-sm text-zinc-500">Active projects overview and upcoming deadlines.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                                    <Search className="h-[18px] w-[18px]" />
                                </span>
                                <input
                                    className="h-9 w-48 pl-9 pr-3 rounded-lg border border-zinc-200 bg-white text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/10 focus:outline-none transition-colors duration-150 placeholder:text-zinc-500"
                                    placeholder="Search projects..."
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className={cn(
                                        "h-9 px-3 rounded-lg border transition-colors flex items-center gap-2",
                                        statusFilter !== "All"
                                            ? "bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800"
                                            : "bg-white text-zinc-500 border-zinc-200 hover:text-zinc-900 hover:bg-zinc-50"
                                    )}>
                                        <Filter className="h-4 w-4" />
                                        {statusFilter !== "All" && <span className="text-xs font-medium">{statusFilter}</span>}
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 bg-white" sideOffset={8}>
                                    <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {uniqueStatuses.map((status) => (
                                        <DropdownMenuCheckboxItem
                                            key={status}
                                            checked={statusFilter === status}
                                            onCheckedChange={() => setStatusFilter(status)}
                                        >
                                            {status}
                                        </DropdownMenuCheckboxItem>
                                    ))}
                                    {statusFilter !== "All" && (
                                        <>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className="justify-center text-zinc-500 hover:text-zinc-900 cursor-pointer"
                                                onSelect={() => setStatusFilter("All")}
                                            >
                                                Clear Filter
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-lg border border-zinc-200">
                                <button
                                    onClick={() => setProjectReportView("list")}
                                    className={cn(
                                        "p-1.5 rounded-md transition-colors duration-150",
                                        projectReportView === "list"
                                            ? "bg-white border border-zinc-200 text-zinc-900 shadow-sm"
                                            : "text-zinc-500 hover:bg-zinc-100"
                                    )}
                                    title="List View"
                                >
                                    <List className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setProjectReportView("grid")}
                                    className={cn(
                                        "p-1.5 rounded-md transition-colors duration-150",
                                        projectReportView === "grid"
                                            ? "bg-white border border-zinc-200 text-zinc-900 shadow-sm"
                                            : "text-zinc-500 hover:bg-zinc-100"
                                    )}
                                    title="Grid View"
                                >
                                    <LayoutGrid className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                    {projectReportView === "grid" ? (
                        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredProjects.length > 0 ? (
                                filteredProjects.map((project) => (
                                    <Link
                                        key={project.id}
                                        href={`/${workspaceId}/projects/${project.id}`}
                                        className="p-5 bg-white border border-zinc-200 rounded-xl hover:border-zinc-300 transition-colors shadow duration-200 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md group"
                                    >
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="size-7 rounded-full bg-zinc-100 text-zinc-600 flex items-center justify-center text-xs font-bold">
                                                        {(project.client?.name || 'C').substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <span className="text-xs text-zinc-500 font-medium">{project.client?.name || 'Unknown'}</span>
                                                </div>
                                                <StatusBadge status={project.status} />
                                            </div>
                                            <h4 className="font-bold text-zinc-900 text-base mb-1">{project.name}</h4>
                                            <p className="text-xs text-zinc-500 line-clamp-2">{project.description || 'No description provided.'}</p>
                                        </div>
                                        <div>
                                            <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
                                                <span>Progress</span>
                                                <span className="font-semibold text-zinc-900">{project.progress || 0}%</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden mb-3">
                                                <div
                                                    className={cn("h-full rounded-full", (project.progress || 0) > 70 ? "bg-green-500" : "bg-blue-500")}
                                                    style={{ width: `${project.progress || 0}%` }}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between pt-2 border-t border-zinc-100 text-xs text-zinc-400">
                                                <span>Deadline: {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : '-'}</span>
                                                <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="col-span-full py-12 text-center text-zinc-500 text-sm">
                                    No projects found matching your criteria.
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto hide-scrollbar">
                            <table className="w-full text-left border-collapse min-w-[700px]">
                            <thead>
                                <tr className="bg-zinc-50/50 border-b border-zinc-200">
                                    <th className="py-3 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Project Name</th>
                                    <th className="py-3 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Client</th>
                                    <th className="py-3 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Deadline</th>
                                    <th className="py-3 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Progress</th>
                                    <th className="py-3 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                                    <th className="py-3 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200">
                                {filteredProjects.length > 0 ? (
                                    filteredProjects.map(project => (
                                        <tr key={project.id} className="hover:bg-zinc-50/50 transition-colors group">
                                            <td className="py-4 px-6">
                                                <div className="font-medium text-sm text-zinc-900">{project.name}</div>
                                                <div className="text-xs text-zinc-500 mt-0.5">{(project.description || '').substring(0, 15)}...</div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2">
                                                    <div className="size-6 rounded-full bg-zinc-100 text-zinc-600 flex items-center justify-center text-[10px] font-bold">
                                                        {(project.client?.name || 'C').substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <span className="text-sm text-zinc-900">{project.client?.name || 'Unknown'}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-sm text-zinc-500">
                                                {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-24 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                                                        <div className={cn("h-full rounded-full", project.progress > 70 ? "bg-green-500" : "bg-blue-500")} style={{ width: `${project.progress || 0}%` }}></div>
                                                    </div>
                                                    <span className="text-xs text-zinc-500">{project.progress || 0}%</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <StatusBadge status={project.status} />
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <Link href={`/${workspaceId}/projects/${project.id}`} className="inline-flex text-zinc-500 hover:text-zinc-900 p-1 rounded hover:bg-zinc-100 transition-colors">
                                                    <ArrowRight className="h-[18px] w-[18px]" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-zinc-500 text-sm">
                                            No projects found matching your criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    )}
                    <div className="p-4 border-t border-zinc-200 flex justify-center">
                        <Link href={`/${workspaceId}/projects`} className="text-sm text-zinc-500 hover:text-zinc-900 font-medium transition-colors flex items-center gap-1">
                            View All Projects
                            <ChevronRight className="h-[16px] w-[16px]" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
