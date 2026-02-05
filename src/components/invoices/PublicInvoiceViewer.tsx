"use client"

import React from "react"
import { Download, Zap, CheckCircle } from "lucide-react"
import { pdfStyles } from "@/lib/pdf-styles"
import { applyPdfSafeStyles, removePdfSafeStyles } from "@/lib/pdf-color-utils"
import { InvoiceDocument } from "./InvoiceDocument"
import { Payment } from "@/lib/types/payment"

interface PublicInvoiceViewerProps {
    invoice: Payment & {
        [key: string]: any
    }
    brandColor?: string
    logoUrl?: string
    companyName?: string
}

export function PublicInvoiceViewer({ invoice, brandColor = "#18181b", logoUrl, companyName }: PublicInvoiceViewerProps) {

    // PDF Generation Logic (Reused)
    const handleDownloadPdf = async () => {
        const element = document.getElementById("invoice-document")
        if (!element) return

        try {
            // Force light mode and ensure no modern color functions are used
            const htmlElement = document.documentElement
            const originalClass = htmlElement.className

            // Temporarily remove dark mode
            htmlElement.classList.remove('dark')

            // Wait for styles to be applied
            await new Promise(resolve => setTimeout(resolve, 50))

            // Apply PDF-safe inline styles
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
                foreignObjectRendering: false,
            })

            // Remove settings
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

    const isPaid = invoice.status === 'paid';

    return (
        <div className="flex flex-col min-h-screen bg-zinc-50">
            {/* Minimal Header */}
            <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-zinc-200 px-4 py-4 mb-8">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                        {logoUrl ? (
                            <img src={logoUrl} alt="Logo" className="h-8 w-8 object-contain rounded" />
                        ) : (
                            <div className="h-8 w-8 rounded bg-zinc-900 flex items-center justify-center text-white">
                                <Zap className="h-4 w-4 fill-current" />
                            </div>
                        )}
                        <span>{companyName || 'FreelanceOS'}</span>
                    </div>

                    <div className="flex items-center gap-3">
                        {isPaid && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-800 rounded-lg text-sm font-medium">
                                <CheckCircle className="h-4 w-4" />
                                Paid
                            </div>
                        )}

                        <button
                            onClick={handleDownloadPdf}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 text-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-50 transition-colors shadow-sm"
                        >
                            <Download className="h-4 w-4" />
                            <span className="hidden sm:inline">PDF</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Document Content */}
            <div className="flex-1 px-4 lg:px-8 pb-16">
                <div className="max-w-4xl mx-auto shadow-xl rounded-xl overflow-hidden">
                    <div id="invoice-document" style={pdfStyles}>
                        <InvoiceDocument
                            invoice={invoice}
                            brandColor={brandColor}
                            logoUrl={logoUrl}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="max-w-4xl mx-auto mt-12 text-center text-sm text-zinc-400">
                    <p>Powered by FreelanceOS</p>
                </div>
            </div>

        </div>
    )
}
