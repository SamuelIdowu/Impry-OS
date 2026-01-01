"use client"

import React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
    ChevronRight,
    Edit,
    Download,
    Send,
    MoreVertical,
    Zap
} from "lucide-react"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Payment } from "@/lib/types/payment"
import { InvoiceStatusControls } from "./InvoiceStatusControls"

interface InvoiceDetailViewProps {
    invoice: Payment & {
        projects?: { name: string } | null;
        clients?: { name: string } | null;
    }
}

// ... imports
import { useReactToPrint } from "react-to-print"
import { useRef } from "react"
import { InvoiceDocument } from "./InvoiceDocument"

// ... existing code

export function InvoiceDetailView({ invoice }: InvoiceDetailViewProps) {
    const router = useRouter()
    const contentRef = useRef<HTMLDivElement>(null)

    const handlePrint = useReactToPrint({
        contentRef,
        documentTitle: `Invoice ${invoice.invoice_number}`,
    })

    const {
        invoice_number,
        amount,
        status,
        due_date,
        line_items,
        // Joined fields
        projects,
        clients
    } = invoice

    const projectName = projects?.name
    const clientName = clients?.name
    const effectiveItems = (line_items as any[]) || []

    // Fallback logic could be refined based on actual data structure
    const effectiveSubtotal = amount
    const effectiveTotal = amount

    return (
        <div className="flex flex-col gap-8 mx-auto w-full py-8 px-4 lg:px-8">
            {/* Breadcrumb */}
            <nav className="flex items-center text-sm text-zinc-500">
                <Link href="/dashboard" className="hover:text-zinc-900 transition-colors">Dashboard</Link>
                <ChevronRight className="h-4 w-4 mx-2" />
                <Link href="/invoices" className="hover:text-zinc-900 transition-colors">Invoices</Link>
                <ChevronRight className="h-4 w-4 mx-2" />
                <span className="font-medium text-zinc-900">{invoice_number}</span>
            </nav>

            {/* Header Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold text-zinc-900">Invoice #{invoice_number}</h1>
                        <StatusBadge status={status} />
                    </div>
                    <p className="text-zinc-500 text-base">
                        Project: <span className="text-zinc-900 font-medium">{projectName || 'General'}</span> for <span className="text-zinc-900 font-medium">{clientName || 'Unknown Client'}</span>
                    </p>
                </div>

                <div className="flex items-center gap-2 self-start md:self-auto">
                    <InvoiceStatusControls
                        invoiceId={invoice.id}
                        currentStatus={status}
                    />
                    <Link
                        href={`/invoices/${invoice.id}/edit`}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors shadow-sm"
                    >
                        <Edit className="h-4 w-4" />
                        Edit
                    </Link>
                    <button
                        onClick={() => handlePrint()}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors shadow-sm"
                    >
                        <Download className="h-4 w-4" />
                        PDF
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors shadow-sm">
                        <Send className="h-4 w-4" />
                        Send to Client
                    </button>
                    <button className="p-2 bg-white border border-zinc-200 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-colors shadow-sm">
                        <MoreVertical className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div ref={contentRef}>
                <InvoiceDocument invoice={invoice} />
            </div>
        </div>
    )
}
