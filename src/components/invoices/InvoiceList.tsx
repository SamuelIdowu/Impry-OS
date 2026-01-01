'use client';

import React, { useState } from "react"
import {
    Plus,
    Clock,
    CheckCircle2,
    FileText,
    Search,
    Filter,
    Download,
    MoreHorizontal,
    ChevronLeft,
    ChevronRight,
    ArrowUpRight
} from "lucide-react"
import Link from "next/link"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatsCard } from "@/components/shared/StatsCard"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { cn } from "@/lib/utils"
// import { Invoice } from "@/lib/types" // We will use Payment type now or Invoice type mapped
import { useRouter } from "next/navigation"
import { Payment, PaymentStatus, PaymentWithClient } from "@/lib/types/payment" // Use updated types
import { createStandaloneInvoice, deletePayment, updatePaymentStatus } from "@/server/actions/payments"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator
} from "@/components/ui/dropdownMenu"

interface InvoiceListProps {
    invoices: PaymentWithClient[]; // Pass real data
    clients: { id: string; name: string }[];
    projects: { id: string; name: string; clientId: string }[]; // Need project list for dialog
}

export function InvoiceList({ invoices: initialInvoices, clients, projects }: InvoiceListProps) {
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState("")
    const [activeTab, setActiveTab] = useState("All Invoices")
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [invoices, setInvoices] = useState<PaymentWithClient[]>(initialInvoices)

    // Calculate status counts
    const statusCounts = {
        all: invoices.length,
        pending: invoices.filter(i => i.status === 'pending').length,
        paid: invoices.filter(i => i.status === 'paid').length,
        // draft: invoices.filter(i => i.status === 'draft').length, // 'draft' not in PaymentStatus currently, maybe we map 'pending' w/ no sent date?
        // For now let's map 'pending' to 'Pending'. We don't have explicit 'draft' status in db schema yet, assuming 'pending'
        overdue: invoices.filter(i => i.status === 'overdue').length
    }

    const filteredInvoices = invoices.filter(inv => {
        const clientName = inv.client?.name || ''
        const invoiceNum = inv.invoice_number || ''

        const matchesSearch =
            invoiceNum.toLowerCase().includes(searchTerm.toLowerCase()) ||
            clientName.toLowerCase().includes(searchTerm.toLowerCase())

        if (activeTab === "All Invoices") return matchesSearch
        if (activeTab === "Pending") return matchesSearch && inv.status === 'pending'
        if (activeTab === "Paid") return matchesSearch && inv.status === 'paid'
        if (activeTab === "Overdue") return matchesSearch && inv.status === 'overdue'
        return matchesSearch
    })

    const handleStatusChange = async (id: string, status: PaymentStatus) => {
        try {
            await updatePaymentStatus(id, { status: status })

            // Update local state
            setInvoices(invoices.map(inv =>
                inv.id === id ? { ...inv, status: status } : inv
            ))
            router.refresh()
        } catch (e) {
            console.error(e)
            alert("Failed to update status")
        }
    }

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation() // Prevent row click
        if (confirm("Are you sure you want to delete this invoice?")) {
            try {
                await deletePayment(id)
                // Update local state
                setInvoices(invoices.filter(inv => inv.id !== id))
                router.refresh()
            } catch (err) {
                console.error(err)
                alert("Failed to delete invoice")
            }
        }
    }

    const tabs = [
        { name: "All Invoices", count: undefined },
        { name: "Pending", count: statusCounts.pending },
        { name: "Overdue", count: statusCounts.overdue },
        { name: "Paid", count: statusCounts.paid },
        // { name: "Drafts", count: statusCounts.draft }
    ]

    return (
        <div className="flex flex-col items-center py-8 px-4 lg:px-8 w-full">
            <div className="w-full flex flex-col gap-10">

                <PageHeader
                    title="Invoices"
                    description="Track payments and manage revenue streams."
                >
                    <Link
                        href="/invoices/new"
                        className="flex items-center justify-center rounded-lg h-10 px-6 bg-zinc-900 text-white text-sm font-semibold shadow-sm hover:shadow-md hover:bg-zinc-800 transition-all group"
                    >
                        <Plus className="mr-2 h-5 w-5" />
                        <span>Create New Invoice</span>
                    </Link>


                </PageHeader>

                {/* Status Stats - Using some hardcoded logic for now or calculate from props */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        {
                            title: "Outstanding",
                            value: `$${invoices.filter(i => i.status !== 'paid').reduce((acc, curr) => acc + (curr.amount - curr.amount_paid), 0).toLocaleString()}`,
                            icon: Clock,
                            trend: `${statusCounts.overdue} overdue`,
                            trendLabel: "invoices",
                            trendDirection: "down" as const,
                            iconColor: "bg-yellow-50 text-yellow-600"
                        },
                        {
                            title: "Total Paid",
                            value: `$${invoices.filter(i => i.status === 'paid' || i.status === 'partial').reduce((acc, curr) => acc + curr.amount_paid, 0).toLocaleString()}`,
                            icon: CheckCircle2,
                            trend: "+15%", // Placeholder logic can be improved later
                            trendLabel: "vs last month",
                            trendDirection: "up" as const,
                            iconColor: "bg-green-50 text-green-600"
                        },
                        {
                            title: "Pending Amount",
                            value: `$${invoices.filter(i => i.status === 'pending').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}`,
                            icon: FileText,
                            trend: `${statusCounts.pending} pending`,
                            trendLabel: "pending",
                            trendDirection: "neutral" as const,
                            iconColor: "bg-zinc-100 text-zinc-600"
                        }
                    ].map((stat, i) => (
                        <StatsCard key={i} {...stat} />
                    ))}
                </div>

                {/* Filters and Tabs */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full lg:w-96">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-zinc-500">
                                <Search className="h-4 w-4" />
                            </div>
                            <input
                                className="w-full h-10 rounded-lg bg-white border border-zinc-200 text-zinc-900 text-sm placeholder-zinc-500 pl-10 pr-4 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/10 focus:outline-none transition-all shadow-sm"
                                placeholder="Search invoices..."
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Middle Tabs */}
                        <div className="flex items-center gap-6">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.name}
                                    onClick={() => setActiveTab(tab.name)}
                                    className={cn(
                                        "text-sm font-medium transition-colors relative pb-2",
                                        activeTab === tab.name
                                            ? "text-zinc-900"
                                            : "text-zinc-500 hover:text-zinc-700"
                                    )}
                                >
                                    {tab.name}
                                    {tab.count !== undefined && (
                                        <span className={cn(
                                            "ml-2 text-xs py-0.5 px-2 rounded-full",
                                            activeTab === tab.name ? "bg-zinc-100 text-zinc-900" : "bg-zinc-50 text-zinc-500"
                                        )}>
                                            {tab.count}
                                        </span>
                                    )}
                                    {activeTab === tab.name && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900 rounded-full" />
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-2">
                            <button className="h-10 px-4 rounded-lg border border-zinc-200 bg-white text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-colors flex items-center gap-2 text-sm font-medium shadow-sm">
                                <Filter className="h-4 w-4" />
                                <span className="hidden sm:inline">Filter</span>
                            </button>
                            <button className="h-10 px-4 rounded-lg border border-zinc-200 bg-white text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-colors flex items-center gap-2 text-sm font-medium shadow-sm">
                                <Download className="h-4 w-4" />
                                <span className="hidden sm:inline">Export</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Invoices Table */}
                <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-zinc-50/50 border-b border-zinc-200">
                                <th className="py-3 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Invoice ID</th>
                                <th className="py-3 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Client</th>
                                <th className="py-3 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Project</th>
                                <th className="py-3 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Amount</th>
                                <th className="py-3 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Due Date</th>
                                <th className="py-3 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                                <th className="py-3 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200">
                            {filteredInvoices.map((inv) => (
                                <tr
                                    key={inv.id}
                                    onClick={() => router.push(`/invoices/${inv.invoice_number}`)}
                                    className="hover:bg-zinc-50/50 transition-colors group cursor-pointer"
                                >
                                    <td className="py-4 px-6 font-medium text-sm text-zinc-900">
                                        {inv.invoice_number}
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-2">
                                            {/* We could add an avatar here if available */}
                                            <span className="text-sm font-semibold text-zinc-900">{inv.client?.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-sm text-zinc-500">{(inv as any).project?.name || '-'}</td>
                                    <td className="py-4 px-6 font-bold text-sm text-zinc-900">${inv.amount.toLocaleString()}</td>
                                    <td className="py-4 px-6 text-sm text-zinc-500">{inv.due_date ? new Date(inv.due_date).toLocaleDateString() : '-'}</td>
                                    <td className="py-4 px-6">
                                        <StatusBadge status={inv.status} />
                                    </td>
                                    <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button
                                                    className="text-zinc-400 hover:text-zinc-600 p-1 rounded hover:bg-zinc-100 transition-colors focus:outline-none"
                                                >
                                                    <MoreHorizontal className="h-5 w-5" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => router.push(`/invoices/${inv.invoice_number}`)}>
                                                    View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                {inv.status !== 'paid' && (
                                                    <DropdownMenuItem onClick={() => handleStatusChange(inv.id, 'paid')}>
                                                        Mark as Paid
                                                    </DropdownMenuItem>
                                                )}
                                                {inv.status !== 'pending' && (
                                                    <DropdownMenuItem onClick={() => handleStatusChange(inv.id, 'pending')}>
                                                        Mark as Pending
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={(e) => handleDelete(inv.id, e)}
                                                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                                >
                                                    Delete Invoice
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))}
                            {filteredInvoices.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-zinc-500 text-sm">
                                        No invoices found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-200 bg-white">
                        <p className="text-sm text-zinc-500">
                            Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredInvoices.length}</span> of <span className="font-medium">{invoices.length}</span> invoices
                        </p>
                        <div className="flex items-center gap-2">
                            <button className="px-3 py-1 rounded-md border border-zinc-200 text-sm font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1">
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </button>
                            <button className="px-3 py-1 rounded-md border border-zinc-200 text-sm font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors flex items-center gap-1">
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
