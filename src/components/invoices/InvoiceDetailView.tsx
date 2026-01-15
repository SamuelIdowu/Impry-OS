"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
    ChevronRight,
    Edit,
    Download,
    Send,
    MoreVertical
} from "lucide-react"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { InvoiceStatusControls } from "./InvoiceStatusControls"
import { pdfStyles } from "@/lib/pdf-styles"
import { applyPdfSafeStyles, removePdfSafeStyles } from "@/lib/pdf-color-utils"
import { InvoiceDocument } from "./InvoiceDocument"
import { ClientEmailDialog } from "./ClientEmailDialog"
import { sendInvoiceEmailAction } from "@/server/actions/email"
import { updateClientAction } from "@/server/actions/clients"
import { Payment } from "@/lib/types/payment"

interface InvoiceDetailViewProps {
    invoice: Payment & {
        clients?: { name: string; email?: string } | null
        projects?: { name: string } | null
        [key: string]: any
    }
    brandColor?: string
    logoUrl?: string
}

export function InvoiceDetailView({ invoice, brandColor, logoUrl }: InvoiceDetailViewProps) {
    const router = useRouter()
    const [isSending, setIsSending] = useState(false)
    const [showEmailDialog, setShowEmailDialog] = useState(false)

    const {
        invoice_number,
        status,
        projects,
        clients
    } = invoice

    const projectName = projects?.name
    const clientName = clients?.name

    const handleDownloadPdf = async () => {
        const element = document.getElementById("invoice-document")
        if (!element) return

        try {
            // Force light mode and ensure no modern color functions are used
            const htmlElement = document.documentElement
            const originalClass = htmlElement.className
            const wasLight = !htmlElement.classList.contains('dark')

            // Temporarily remove dark mode to ensure consistent color rendering
            htmlElement.classList.remove('dark')

            // Wait for styles to be applied
            await new Promise(resolve => setTimeout(resolve, 50))

            // Apply PDF-safe inline styles to all elements
            applyPdfSafeStyles(element as HTMLElement)

            // Lazy load libraries
            const html2canvas = (await import("html2canvas")).default
            const jsPDF = (await import("jspdf")).default

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                windowWidth: element.scrollWidth,
                windowHeight: element.scrollHeight,
                // Disable SVG rendering which might contain unsupported colors
                foreignObjectRendering: false,
            })

            // Remove the inline styles and restore original class
            removePdfSafeStyles(element as HTMLElement)
            htmlElement.className = originalClass

            const imgData = canvas.toDataURL("image/png")
            const pdf = new jsPDF("p", "mm", "a4")
            const pdfWidth = pdf.internal.pageSize.getWidth()
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width

            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)
            pdf.save(`${invoice.invoice_number || 'invoice'}.pdf`)
        } catch (err) {
            console.error("PDF generation failed", err)
            alert(`Failed to generate PDF: ${err instanceof Error ? err.message : String(err)}`)
        }
    }

    const handleSendEmail = async () => {
        const clientEmail = clients?.email

        if (!clientEmail) {
            setShowEmailDialog(true)
            return
        }

        if (!confirm(`Send invoice to ${clientEmail}?`)) return

        setIsSending(true)
        const res = await sendInvoiceEmailAction(invoice.id, clientEmail)
        setIsSending(false)

        if (res.success) {
            alert("Email sent successfully!")
        } else {
            alert("Failed to send email: " + res.error)
        }
    }

    const handleEmailConfirm = async (email: string, saveToProfile: boolean) => {
        setIsSending(true)

        if (saveToProfile) {
            const clientId = invoice.client_id
            if (clientId) {
                await updateClientAction(clientId, { email })
            }
        }

        const res = await sendInvoiceEmailAction(invoice.id, email)
        setIsSending(false)

        if (res.success) {
            alert("Email sent successfully!")
            router.refresh()
        } else {
            alert("Failed to send email: " + res.error)
        }
    }

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
                        onClick={handleDownloadPdf}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors shadow-sm"
                    >
                        <Download className="h-4 w-4" />
                        PDF
                    </button>
                    <button
                        onClick={handleSendEmail}
                        disabled={isSending}
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors shadow-sm disabled:opacity-50"
                    >
                        <Send className="h-4 w-4" />
                        {isSending ? "Sending..." : "Send to Client"}
                    </button>
                    <button className="p-2 bg-white border border-zinc-200 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-colors shadow-sm">
                        <MoreVertical className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Invoice Document Wrapper for PDF download */}
            <div>
                <div id="invoice-document" style={pdfStyles}>
                    <InvoiceDocument
                        invoice={invoice}
                        brandColor={brandColor}
                        logoUrl={logoUrl}
                    />
                </div>
            </div>

            <ClientEmailDialog
                isOpen={showEmailDialog}
                onClose={() => setShowEmailDialog(false)}
                onConfirm={handleEmailConfirm}
                clientName={clientName || "Client"}
            />
        </div>
    )
}
