import React from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { getInvoice, getInvoiceByNumber } from "@/server/actions/payments"
import { InvoiceDetailView } from "@/components/invoices/InvoiceDetailView"

// Use standard PageProps type for Next.js App Router
type PageProps = {
    params: Promise<{ invoiceId: string }>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function InvoiceDetailsPage(props: PageProps) {
    const params = await props.params;
    const { invoiceId } = params;

    // Fetch invoice
    let invoice = null
    try {
        // First try to fetch by invoice number (most likely)
        try {
            invoice = await getInvoiceByNumber(invoiceId)
        } catch (e) {
            // If that fails, checks if it is a UUID and try fetching by ID
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(invoiceId);
            if (isUuid) {
                invoice = await getInvoice(invoiceId)
            }
        }
    } catch (error) {
        console.error("Error fetching invoice:", error)
    }

    if (!invoice) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <h2 className="text-xl font-semibold">Invoice not found</h2>
                <Link href="/invoices" className="text-zinc-600 hover:text-zinc-900 underline">
                    Return to Invoices
                </Link>
            </div>
        )
    }

    return <InvoiceDetailView invoice={invoice} />
}
