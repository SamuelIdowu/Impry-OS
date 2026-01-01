"use client"

import React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
    ChevronRight,
    Plus,
    Wallet,
    CheckCircle2,
    TrendingUp,
    Clock,
    FileText,
    MoreHorizontal
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
// import { Project } from "@/lib/types/project" // Using passed project data which might carry joined fields
import { Payment } from "@/lib/types/payment"
import { EmptyPayments } from "@/components/emptyPayments"

import { AddPaymentDialog } from "@/components/forms/addPaymentDialog"

// Define specific props we expect
interface ProjectPaymentsViewProps {
    project: any; // Using any for flexibility with joined relations, ideally ProjectWithDetails
    payments: Payment[];
}

export function ProjectPaymentsView({ project, payments }: ProjectPaymentsViewProps) {
    const router = useRouter()

    // Calculate financials
    // Use data from props, fallback to 0
    const totalValue = project.total_value || 0
    // Calculate paid amount from payments if project.paid_amount is not reliable or we want real-time from the list
    const paidAmount = payments.reduce((sum, p) => sum + (p.status === 'paid' ? p.amount_paid : 0), 0)
    const outstandingAmount = totalValue - paidAmount
    const collectionProgress = totalValue > 0 ? Math.round((paidAmount / totalValue) * 100) : 0

    // Count remaining milestones (invoices not paid)
    const remainingMilestones = payments.filter(i => i.status !== 'paid').length

    // Empty State Check
    if (payments.length === 0) {
        return (
            <div className="flex flex-col items-center py-8 px-4 lg:px-8 w-full">
                <div className="w-full max-w-[1200px] flex flex-col gap-8">
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
                        <Link href="/dashboard" className="hover:text-zinc-900 transition-colors hover:underline underline-offset-2">Dashboard</Link>
                        <ChevronRight className="h-3.5 w-3.5 opacity-50" />
                        <Link href="/projects" className="hover:text-zinc-900 transition-colors hover:underline underline-offset-2">Projects</Link>
                        <ChevronRight className="h-3.5 w-3.5 opacity-50" />
                        <Link href={`/projects/${project.id}`} className="hover:text-zinc-900 transition-colors hover:underline underline-offset-2">{project.name}</Link>
                        <ChevronRight className="h-3.5 w-3.5 opacity-50" />
                        <span className="text-zinc-900">Payments</span>
                    </div>

                    {/* Header (Simplified) */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Payment Milestones</h1>
                            <p className="text-zinc-500 text-base">Manage revenue, track invoices, and protect your cashflow.</p>
                        </div>
                    </div>

                    {/* Empty State */}
                    <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
                        <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                            <Wallet className="h-8 w-8 text-zinc-400" />
                        </div>
                        <h3 className="text-lg font-medium text-zinc-900 mb-1">No payments yet</h3>
                        <p className="text-zinc-500 text-sm max-w-sm mb-6">Create payment milestones to track revenue and invoices for this project.</p>
                        <AddPaymentDialog
                            projectId={project.id}
                            onPaymentAdded={() => router.refresh()}
                            trigger={
                                <Button className="gap-2 bg-zinc-900 text-white hover:bg-zinc-800">
                                    <Plus className="h-4 w-4" />
                                    Add First Payment
                                </Button>
                            }
                        />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center py-8 px-4 lg:px-8 w-full">
            <div className="w-full max-w-[1200px] flex flex-col gap-8">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
                    <Link href="/dashboard" className="hover:text-zinc-900 transition-colors hover:underline underline-offset-2">Dashboard</Link>
                    <ChevronRight className="h-3.5 w-3.5 opacity-50" />
                    <Link href="/projects" className="hover:text-zinc-900 transition-colors hover:underline underline-offset-2">Projects</Link>
                    <ChevronRight className="h-3.5 w-3.5 opacity-50" />
                    <Link href={`/projects/${project.id}`} className="hover:text-zinc-900 transition-colors hover:underline underline-offset-2">{project.name}</Link>
                    <ChevronRight className="h-3.5 w-3.5 opacity-50" />
                    <span className="text-zinc-900">Payments</span>
                </div>

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Payment Milestones</h1>
                        <p className="text-zinc-500 text-base">Manage revenue, track invoices, and protect your cashflow.</p>
                    </div>
                    <AddPaymentDialog
                        projectId={project.id}
                        onPaymentAdded={() => router.refresh()}
                        trigger={
                            <button className="group flex items-center justify-center gap-2 bg-zinc-900 hover:bg-black text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-black/5 hover:shadow-black/10 active:scale-95 text-sm">
                                <Plus className="font-medium h-5 w-5" />
                                <span>Add Payment</span>
                            </button>
                        }
                    />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Total Project Value */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200 flex flex-col gap-4">
                        <div className="flex justify-between items-start">
                            <span className="text-zinc-500 text-sm font-medium">Total Project Value</span>
                            <span className="p-2 bg-zinc-50 rounded-lg text-zinc-500">
                                <Wallet className="h-[20px] w-[20px]" />
                            </span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-3xl font-bold text-zinc-900 tracking-tight">${totalValue.toLocaleString()}</span>
                            <div className="flex items-center gap-1 text-xs font-medium text-zinc-500">
                                <span>Contract Value</span>
                            </div>
                        </div>
                    </div>

                    {/* Amount Paid */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200 flex flex-col gap-4 relative overflow-hidden">
                        <div className="flex justify-between items-start">
                            <span className="text-zinc-500 text-sm font-medium">Amount Paid</span>
                            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                <CheckCircle2 className="h-[20px] w-[20px]" />
                            </span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-3">
                                <span className="text-3xl font-bold text-zinc-900 tracking-tight">${paidAmount.toLocaleString()}</span>
                                <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">
                                    {collectionProgress}%
                                </span>
                            </div>
                            <div className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                                <TrendingUp className="h-3.5 w-3.5" />
                                <span>Collection rate</span>
                            </div>
                        </div>
                    </div>

                    {/* Outstanding Balance */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200 flex flex-col gap-4">
                        <div className="flex justify-between items-start">
                            <span className="text-zinc-500 text-sm font-medium">Outstanding Balance</span>
                            <span className="p-2 bg-zinc-50 rounded-lg text-zinc-500">
                                <Clock className="h-[20px] w-[20px]" />
                            </span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-3xl font-bold text-zinc-900 tracking-tight">${outstandingAmount.toLocaleString()}</span>
                            <div className="flex items-center gap-1 text-xs font-medium text-amber-600">
                                <span>{remainingMilestones} Milestones remaining</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Collection Progress */}
                <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm flex flex-col gap-4">
                    <div className="flex justify-between items-end">
                        <h3 className="text-zinc-900 text-base font-bold">Collection Progress</h3>
                        <span className="text-zinc-900 font-mono font-bold">{collectionProgress}%</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-200/50 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-zinc-900 rounded-full relative transition-all duration-1000 ease-out"
                            style={{ width: `${collectionProgress}%` }}
                        ></div>
                    </div>
                </div>

                {/* Milestones Table */}
                <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-zinc-200 text-zinc-500 text-xs uppercase tracking-wider bg-zinc-50/50">
                                    <th className="px-6 py-4 font-semibold">Milestone Name</th>
                                    <th className="px-6 py-4 font-semibold">Amount</th>
                                    <th className="px-6 py-4 font-semibold">Due Date</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-zinc-200">
                                {payments.length > 0 ? (
                                    payments.map((invoice) => (
                                        <tr
                                            key={invoice.id}
                                            onClick={() => router.push(`/invoices/${invoice.invoice_number || invoice.id}`)}
                                            className="group hover:bg-zinc-50/50 transition-colors cursor-pointer"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-8 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-zinc-500">
                                                        <FileText className="h-3.5 w-3.5" />
                                                    </div>
                                                    <span className="font-semibold text-zinc-900">
                                                        {invoice.description || invoice.invoice_number || 'Payment'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-zinc-900 font-medium">${invoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                            <td className="px-6 py-4 text-zinc-500">{invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}</td>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border",
                                                    invoice.status === 'paid' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                                        invoice.status === 'overdue' ? "bg-rose-50 text-rose-700 border-rose-100" :
                                                            invoice.status === 'pending' ? "bg-amber-50 text-amber-700 border-amber-100" :
                                                                "bg-zinc-100 text-zinc-600 border-zinc-200"
                                                )}>
                                                    {invoice.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {invoice.status !== 'paid' && (
                                                        <button
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 rounded-lg bg-white border border-zinc-200 shadow-sm hover:border-emerald-200 hover:text-emerald-700 text-xs font-semibold text-zinc-900"
                                                        >
                                                            Mark Paid
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="p-2 text-zinc-500 hover:text-zinc-900 rounded-lg hover:bg-zinc-100 transition-colors"
                                                    >
                                                        <MoreHorizontal className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                                            No payment milestones found for this project.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
