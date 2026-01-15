import React from "react"
import { notFound } from "next/navigation"
import { getPublicInvoice } from "@/server/actions/payments"
import { PublicInvoiceViewer } from "@/components/invoices/PublicInvoiceViewer"
import type { Metadata } from "next"

// Use standard PageProps type for Next.js App Router
type PageProps = {
    params: Promise<{ invoiceId: string }>
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
    const params = await props.params;
    try {
        const invoice = await getPublicInvoice(params.invoiceId)
        return {
            title: `Invoice ${invoice.invoice_number}`,
            description: `View invoice ${invoice.invoice_number}`,
        }
    } catch (e) {
        return {
            title: 'Invoice Not Found',
        }
    }
}

export default async function PublicInvoicePage(props: PageProps) {
    const params = await props.params;
    const { invoiceId } = params;

    let invoice = null
    try {
        invoice = await getPublicInvoice(invoiceId)
    } catch (error) {
        console.error("Error fetching public invoice:", error)
        notFound()
    }

    // Cast properties added by getPublicInvoice
    const brandColor = (invoice as any).brandColor
    const logoUrl = (invoice as any).logoUrl
    const companyName = (invoice as any).companyName

    return (
        <PublicInvoiceViewer
            invoice={invoice}
            brandColor={brandColor}
            logoUrl={logoUrl}
            companyName={companyName}
        />
    )
}
