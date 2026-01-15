"use client"

import React from "react"
import Link from "next/link"
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
import { convertToCSV, downloadCSV } from "@/lib/csv-export"
import { addDays, isAfter, parse, format, subDays, isSameYear, parseISO, startOfYear } from "date-fns"
import { Project } from "@/lib/types/project"
import { Payment } from "@/lib/types/payment"

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
    projects: any[]; // Using any for now to facilitate mapping flexibility, ideally strict types 
    invoices: Payment[];
    userCreatedAt: string;
}

export function ReportsView({ projects, invoices, userCreatedAt }: ReportsViewProps) {
    const [searchQuery, setSearchQuery] = React.useState("")
    const [statusFilter, setStatusFilter] = React.useState<string>("All")
    const [dateRange, setDateRange] = React.useState<DateRange>("30days")

    // Helper to get start date based on range
    const getStartDate = (range: DateRange) => {
        const today = new Date()
        switch (range) {
            case "7days": return subDays(today, 7)
            case "30days": return subDays(today, 30)
            case "90days": return subDays(today, 90)
            case "year": return startOfYear(today)
            case "creation": return new Date(userCreatedAt)
            case "all": return new Date(0) // Beginning of time
            default: return subDays(today, 30)
        }
    }

    // Filter projects based on date range (using startDate)
    const filteredProjects = React.useMemo(() => {
        const startDateLimit = getStartDate(dateRange)

        return projects.filter(project => {
            const matchesSearch = (project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (project.client?.name || '').toLowerCase().includes(searchQuery.toLowerCase()))

            const matchesStatus = statusFilter === "All" || project.status === statusFilter.toLowerCase()

            // Date filtering - assuming created_at is the start date
            const projectDate = new Date(project.created_at)
            const matchesDate = isAfter(projectDate, startDateLimit)

            return matchesSearch && matchesStatus && matchesDate
        })
    }, [searchQuery, statusFilter, dateRange, projects, userCreatedAt])

    // Calculate Stats based on Date Range
    const stats = React.useMemo(() => {
        const startDateLimit = getStartDate(dateRange)

        // Filter invoices for revenue calculation
        const filteredInvoices = invoices.filter(inv => {
            if (!inv.created_at) return false // Should not happen
            const invDate = new Date(inv.created_at)
            return isAfter(invDate, startDateLimit)
        })

        const totalRevenue = filteredInvoices.reduce((sum, inv) => {
            const paidVal = (inv.status === 'paid')
                ? (inv.amount_paid === 0 ? inv.amount : inv.amount_paid)
                : 0;
            return sum + paidVal;
        }, 0)
        const outstandingAmount = filteredInvoices.reduce((sum, inv) => sum + (inv.status !== 'paid' ? (inv.amount - inv.amount_paid) : 0), 0)
        // Count unique clients with outstanding
        const outstandingClients = new Set(filteredInvoices.filter(inv => inv.status !== 'paid').map(inv => inv.client_id)).size

        // Calculate Project Success Rate
        const relevantProjects = projects.filter(project => {
            const projectDate = new Date(project.created_at)
            return isAfter(projectDate, startDateLimit)
        })
        const completedProjects = relevantProjects.filter(p => p.status === 'completed').length
        const totalProjects = relevantProjects.length
        const successRateVal = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0


        return {
            totalRevenue,
            outstandingAmount,
            outstandingClients,
            successRate: successRateVal,
            filteredInvoices, // Return these for export
            relevantProjects  // Return these for export
        }
    }, [dateRange, invoices, projects, userCreatedAt])

    // Prepare Chart Data
    // Prepare Chart Data
    const revenueChartData = React.useMemo(() => {
        const startDateLimit = getStartDate(dateRange)

        if (dateRange === "7days" || dateRange === "30days") {
            const days = dateRange === "7days" ? 7 : 30
            const data = []
            for (let i = days - 1; i >= 0; i--) {
                const date = subDays(new Date(), i)
                const dayStr = format(date, "MMM dd") // e.g. Oct 25

                // Sum invoices for this day
                const dayRevenue = invoices
                    .filter(inv => inv.status === 'paid')
                    .filter(inv => {
                        if (!inv.created_at) return false;
                        const invDate = new Date(inv.created_at)
                        return format(invDate, "MMM dd") === dayStr && isSameYear(invDate, date)
                    })
                    .reduce((sum, inv) => {
                        const paidVal = (inv.status === 'paid')
                            ? (inv.amount_paid === 0 ? inv.amount : inv.amount_paid)
                            : 0;
                        return sum + paidVal;
                    }, 0)

                data.push({ month: dayStr, revenue: dayRevenue })
            }
            return data
        } else if (dateRange === "creation" || dateRange === "all") {
            // Monthly breakdown from creation date or very beginning
            const start = dateRange === "creation" ? new Date(userCreatedAt) : new Date(invoices.length > 0 ? Math.min(...invoices.map(i => new Date(i.created_at!).getTime())) : Date.now())
            const end = new Date()
            const data = []

            let current = new Date(start)
            // Normalize to start of month
            current.setDate(1)

            while (current <= end || format(current, "MMM yyyy") === format(end, "MMM yyyy")) {
                const monthStr = format(current, "MMM yyyy")
                const monthRevenue = invoices
                    .filter(inv => inv.status === 'paid')
                    .filter(inv => {
                        if (!inv.created_at) return false;
                        const invDate = new Date(inv.created_at)
                        return format(invDate, "MMM yyyy") === monthStr
                    })
                    .reduce((sum, inv) => {
                        const paidVal = (inv.status === 'paid')
                            ? (inv.amount_paid === 0 ? inv.amount : inv.amount_paid)
                            : 0;
                        return sum + paidVal;
                    }, 0)

                data.push({ month: format(current, "MMM ''yy"), revenue: monthRevenue }) // MMM 'yy for compact display

                // Next month
                current.setMonth(current.getMonth() + 1)
            }
            return data
        } else {
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
            const currentYear = new Date().getFullYear()

            return months.map(month => {
                const monthRevenue = invoices
                    .filter(inv => inv.status === 'paid')
                    .filter(inv => {
                        if (!inv.created_at) return false;
                        const invDate = new Date(inv.created_at)
                        return format(invDate, "MMM") === month && invDate.getFullYear() === currentYear
                    })
                    .reduce((sum, inv) => {
                        const paidVal = (inv.status === 'paid')
                            ? (inv.amount_paid === 0 ? inv.amount : inv.amount_paid)
                            : 0;
                        return sum + paidVal;
                    }, 0)
                return { month, revenue: monthRevenue }
            })
        }
    }, [dateRange, invoices, userCreatedAt])

    // Status filtering
    const uniqueStatuses = ["All", "active", "completed", "pending"] // Simplified for now, could be dynamic

    return (
        <div className="flex flex-col items-center py-8 px-4 lg:px-8 w-full">
            <div className="w-full   flex flex-col gap-10">

                {/* Header */}
                <PageHeader
                    title="Reports & Insights"
                    description="Key metrics on revenue, project health, and client retention."
                >
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center justify-center rounded-lg h-10 px-4 bg-white border border-zinc-200 text-zinc-900 text-sm font-medium shadow-sm hover:bg-zinc-50 transition-all min-w-[140px]">
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
                    <button className="flex items-center justify-center rounded-lg h-10 px-5 bg-zinc-900 text-white text-sm font-medium shadow-sm hover:shadow-md hover:bg-zinc-800 transition-all group">
                        <Download className="mr-2 h-[18px] w-[18px]" />
                        <span>Export Report</span>
                    </button>
                </PageHeader>

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
                    <RevenueChart data={revenueChartData} />
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
                                    className="h-9 w-48 pl-9 pr-3 rounded-lg border border-zinc-200 bg-white text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/10 focus:outline-none transition-all placeholder:text-zinc-500"
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
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
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
                                                {project.due_date ? new Date(project.due_date).toLocaleDateString() : '-'}
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
                                                <Link href={`/projects/${project.id}`} className="inline-flex text-zinc-500 hover:text-zinc-900 p-1 rounded hover:bg-zinc-100 transition-colors">
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
                    <div className="p-4 border-t border-zinc-200 flex justify-center">
                        <Link href="/projects" className="text-sm text-zinc-500 hover:text-zinc-900 font-medium transition-colors flex items-center gap-1">
                            View All Projects
                            <ChevronRight className="h-[16px] w-[16px]" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
