"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
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
import { Payment, PaymentStatus } from "@/lib/types/payment"

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
    const params = useParams()
    const workspaceId = params.workspaceId as string || 'default'
    const [isSending, setIsSending] = useState(false)
    const [showEmailDialog, setShowEmailDialog] = useState(false)

    const {
        invoice_number,
        projects,
        clients
    } = invoice

    const status = (invoice.status as PaymentStatus) || 'pending'

    const projectName = projects?.name
    const clientName = clients?.name

    const handleDownloadPdf = async () => {
        const element = document.getElementById("invoice-document")
        if (!element) return

        try {
            const htmlElement = document.documentElement
            const originalClass = htmlElement.className

            // Force light mode so colors render correctly
            htmlElement.classList.remove('dark')

            // Give the DOM time to settle after mode switch
            await new Promise(resolve => setTimeout(resolve, 100))

            // Apply PDF-safe inline styles to all elements
            applyPdfSafeStyles(element as HTMLElement)

            // Lazy load libraries
            const html2canvas = (await import("html2canvas")).default
            const jsPDF = (await import("jspdf")).default

            // Use a fixed desktop width (900px) so the invoice layout renders
            // correctly regardless of the current viewport size (mobile/tablet/desktop).
            const PDF_CAPTURE_WIDTH = 900
            
            // Force the element itself to be 900px wide temporarily so that 
            // tailwind classes layout correctly for a desktop view
            const originalElementWidth = element.style.width
            const originalElementMaxWidth = element.style.maxWidth
            element.style.width = `${PDF_CAPTURE_WIDTH}px`
            element.style.maxWidth = `${PDF_CAPTURE_WIDTH}px`

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                // Force fixed capture width — critical for mobile where the
                // viewport is narrow and responsive classes collapse the layout
                width: PDF_CAPTURE_WIDTH,
                windowWidth: PDF_CAPTURE_WIDTH,
                // Capture the full scrollable height of the element
                height: element.scrollHeight,
                windowHeight: element.scrollHeight,
                foreignObjectRendering: false,
            })

            // Restore element width
            element.style.width = originalElementWidth
            element.style.maxWidth = originalElementMaxWidth

            // Remove inline styles and restore original class
            removePdfSafeStyles(element as HTMLElement)
            htmlElement.className = originalClass

            const imgData = canvas.toDataURL("image/png")
            const pdf = new jsPDF("p", "mm", "a4")
            const pdfPageWidth = pdf.internal.pageSize.getWidth()
            const pdfPageHeight = pdf.internal.pageSize.getHeight()

            // Calculate image height in PDF units
            const imgHeightInPdf = (canvas.height * pdfPageWidth) / canvas.width

            // Handle multi-page invoices
            if (imgHeightInPdf <= pdfPageHeight) {
                // Fits on one page
                pdf.addImage(imgData, "PNG", 0, 0, pdfPageWidth, imgHeightInPdf)
            } else {
                // Split across pages
                let yOffset = 0
                while (yOffset < imgHeightInPdf) {
                    if (yOffset > 0) pdf.addPage()
                    pdf.addImage(imgData, "PNG", 0, -yOffset, pdfPageWidth, imgHeightInPdf)
                    yOffset += pdfPageHeight
                }
            }

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
                <Link href={`/${workspaceId}/dashboard`} className="hover:text-zinc-900 transition-colors">Dashboard</Link>
                <ChevronRight className="h-4 w-4 mx-2" />
                <Link href={`/${workspaceId}/invoices`} className="hover:text-zinc-900 transition-colors">Invoices</Link>
                <ChevronRight className="h-4 w-4 mx-2" />
                <span className="font-medium text-zinc-900">{invoice_number}</span>
            </nav>

            {/* Header Actions */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-2xl md:text-3xl font-bold text-zinc-900">Invoice #{invoice_number}</h1>
                        <StatusBadge status={status} />
                    </div>
                    <p className="text-zinc-500 text-sm md:text-base">
                        Project: <span className="text-zinc-900 font-medium">{projectName || 'General'}</span> for <span className="text-zinc-900 font-medium">{clientName || 'Unknown Client'}</span>
                    </p>
                </div>

                {/* Action buttons — wrap on mobile, single row on desktop */}
                <div className="flex flex-wrap items-center gap-2">
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
                    <button className="p-2 bg-white border border-zinc-200 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-colors shadow-sm" aria-label="More options">
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
