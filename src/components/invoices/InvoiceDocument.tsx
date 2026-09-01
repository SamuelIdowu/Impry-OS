import React from "react"
import { Zap, CreditCard, ExternalLink } from "lucide-react"
import { Payment } from "@/lib/types/payment"

export interface StructuredPaymentInstructions {
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
    routingOrSwift?: string;
    paymentUrl?: string;
    notes?: string;
}

interface InvoiceDocumentProps {
    invoice: Partial<Payment> | any;
    previewMode?: boolean;
    brandColor?: string;
    logoUrl?: string;
    senderName?: string;
    senderDetails?: {
        company?: string;
        address?: string;
        email?: string;
        taxId?: string;
    };
}

export function InvoiceDocument({
    invoice,
    previewMode = false,
    brandColor = "#18181b",
    logoUrl,
    senderName,
    senderDetails
}: InvoiceDocumentProps) {
    const invoiceNumber = invoice.invoice_number || invoice.invoiceNumber || 'DRAFT'
    const amount = invoice.amount || 0
    const dueDate = invoice.due_date || invoice.dueDate
    const issueDate = invoice.issue_date || invoice.issueDate || new Date().toISOString()
    const lineItems = invoice.line_items || invoice.lineItems || []
    const currency = invoice.currency || 'USD'
    const taxRate = parseFloat(invoice.tax_rate ?? invoice.taxRate ?? 0) || 0
    const discountRate = parseFloat(invoice.discount_rate ?? invoice.discountRate ?? 0) || 0
    const paymentInstructions: string | StructuredPaymentInstructions = invoice.payment_instructions || invoice.paymentInstructions || ''

    const projectName = invoice.projects?.name || invoice.projectName || invoice.project?.name
    const clientName = invoice.clients?.name || invoice.clientName || invoice.client?.name
    const clientEmail = invoice.clients?.email || invoice.clientEmail || invoice.client?.email
    const clientAddress = invoice.clients?.address || invoice.clientAddress || invoice.client?.address

    const effectiveItems = Array.isArray(lineItems) ? lineItems : []

    // Helper to safely format currency
    const formatMoney = (val: any) => {
        const num = parseFloat(val)
        if (isNaN(num)) return "0.00"
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(num)
    }

    // Currency Symbol Map
    const currencySymbols: Record<string, string> = {
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'CAD': 'CA$',
        'AUD': 'A$',
    }
    const symbol = currencySymbols[currency] || '$'

    // Helper to safe format date
    const formatDate = (dateStr: string | undefined) => {
        if (!dateStr) return "N/A"
        try {
            return new Date(dateStr).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            })
        } catch (e) {
            return dateStr
        }
    }

    const effectiveSubtotal = effectiveItems.length > 0
        ? effectiveItems.reduce((sum: number, item: any) => sum + (parseFloat(item.amount) || (parseFloat(item.quantity || 1) * parseFloat(item.rate || 0)) || 0), 0)
        : (parseFloat(amount) || 0)

    // Calculations: Tax is applied on total after discount only
    const discountAmount = effectiveSubtotal * (discountRate / 100)
    const afterDiscount = effectiveSubtotal - discountAmount
    const taxAmount = afterDiscount * (taxRate / 100)
    const effectiveTotal = afterDiscount + taxAmount

    // Parse structured payment instructions if available
    let parsedInstructions: StructuredPaymentInstructions | null = null
    let rawInstructionsText: string = ''

    if (typeof paymentInstructions === 'object' && paymentInstructions !== null) {
        parsedInstructions = paymentInstructions as StructuredPaymentInstructions
    } else if (typeof paymentInstructions === 'string' && paymentInstructions.trim()) {
        try {
            if (paymentInstructions.startsWith('{')) {
                parsedInstructions = JSON.parse(paymentInstructions)
            } else {
                rawInstructionsText = paymentInstructions
            }
        } catch (e) {
            rawInstructionsText = paymentInstructions
        }
    }

    const businessName = senderDetails?.company || senderName || invoice.companyName || invoice.user?.companyName || invoice.user?.name || "Business Name"

    return (
        <div
            className={`bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden min-h-[850px] flex flex-col justify-between ${previewMode ? 'scale-100 origin-top' : ''} print:shadow-none print:border-0`}
        >
            <div className="p-8 md:p-12 flex-1">
                {/* Document Header */}
                <div className="flex justify-between items-start mb-14">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            {logoUrl ? (
                                <img src={logoUrl} alt="Logo" className="h-10 w-auto max-w-[160px] object-contain" />
                            ) : (
                                <div
                                    className="h-9 w-9 rounded-lg flex items-center justify-center text-white font-bold"
                                    style={{ backgroundColor: brandColor }}
                                >
                                    <Zap className="h-5 w-5 fill-current" />
                                </div>
                            )}
                            <span
                                className="text-xl font-bold tracking-tight"
                                style={{ color: brandColor }}
                            >
                                {businessName}
                            </span>
                        </div>

                        <div className="text-sm text-zinc-500 leading-relaxed">
                            {senderDetails?.address && <p>{senderDetails.address}</p>}
                            {senderDetails?.email && <p>{senderDetails.email}</p>}
                            {senderDetails?.taxId && <p>Tax / VAT ID: {senderDetails.taxId}</p>}
                        </div>
                    </div>

                    <div className="text-right">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-zinc-900 tracking-tight mb-1 uppercase">Invoice</h2>
                        <p className="text-zinc-500 font-semibold font-mono text-sm">#{invoiceNumber}</p>
                    </div>
                </div>

                {/* Bill To & Project Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 bg-zinc-50/70 p-6 rounded-xl border border-zinc-100">
                    <div className="flex flex-col gap-2">
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Bill To</h3>
                        <div className="text-sm text-zinc-600 leading-relaxed">
                            <p className="font-bold text-zinc-900 text-base">{clientName || 'Valued Client'}</p>
                            {clientEmail && <p>{clientEmail}</p>}
                            {clientAddress && <p>{clientAddress}</p>}
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 md:items-end text-sm">
                        {projectName && (
                            <div className="flex justify-between md:justify-end gap-6 w-full">
                                <span className="text-zinc-500 font-medium">Project:</span>
                                <span className="text-zinc-900 font-semibold">{projectName}</span>
                            </div>
                        )}
                        <div className="flex justify-between md:justify-end gap-6 w-full">
                            <span className="text-zinc-500 font-medium">Issue Date:</span>
                            <span className="text-zinc-900 font-semibold">{formatDate(issueDate)}</span>
                        </div>
                        <div className="flex justify-between md:justify-end gap-6 w-full">
                            <span className="text-zinc-500 font-medium">Due Date:</span>
                            <span className="text-red-600 font-bold">{formatDate(dueDate)}</span>
                        </div>
                    </div>
                </div>

                {/* Line Items */}
                <div className="mb-12">
                    <div className="flex items-center border-b border-zinc-200 pb-3 mb-4">
                        <div className="flex-1 text-xs font-bold text-zinc-400 uppercase tracking-wider">Description</div>
                        <div className="w-24 text-right text-xs font-bold text-zinc-400 uppercase tracking-wider">Qty</div>
                        <div className="w-32 text-right text-xs font-bold text-zinc-400 uppercase tracking-wider">Rate</div>
                        <div className="w-32 text-right text-xs font-bold text-zinc-400 uppercase tracking-wider">Amount</div>
                    </div>

                    <div className="flex flex-col gap-3">
                        {effectiveItems.length > 0 ? (
                            effectiveItems.map((item, index) => (
                                <div key={index} className="flex items-start py-2.5 border-b border-dashed border-zinc-100 last:border-0">
                                    <div className="flex-1 pr-4">
                                        <p className="text-sm font-semibold text-zinc-900">{item.description || `Item ${index + 1}`}</p>
                                        {item.details && <p className="text-xs text-zinc-500 mt-0.5">{item.details}</p>}
                                    </div>
                                    <div className="w-24 text-right text-sm text-zinc-600">{item.quantity ?? 1}</div>
                                    <div className="w-32 text-right text-sm text-zinc-600">{symbol}{formatMoney(item.rate || item.unitPrice || 0)}</div>
                                    <div className="w-32 text-right text-sm font-bold text-zinc-900">
                                        {symbol}{formatMoney(item.amount || (parseFloat(item.quantity || 1) * parseFloat(item.rate || 0)))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex items-start py-3">
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-zinc-900">{invoice.description || 'Services Rendered'}</p>
                                </div>
                                <div className="w-24 text-right text-sm text-zinc-600">1.0</div>
                                <div className="w-32 text-right text-sm text-zinc-600">{symbol}{formatMoney(effectiveSubtotal)}</div>
                                <div className="w-32 text-right text-sm font-bold text-zinc-900">{symbol}{formatMoney(effectiveSubtotal)}</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Structured Payment Instructions */}
                {(parsedInstructions || rawInstructionsText) && (
                    <div className="mt-8 pt-6 border-t border-zinc-200">
                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            Payment Instructions
                        </h4>

                        {parsedInstructions ? (
                            <div className="bg-zinc-50 rounded-lg p-4 border border-zinc-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                {parsedInstructions.bankName && (
                                    <div>
                                        <span className="text-zinc-400 block uppercase font-medium">Bank Name</span>
                                        <span className="text-zinc-900 font-semibold">{parsedInstructions.bankName}</span>
                                    </div>
                                )}
                                {parsedInstructions.accountName && (
                                    <div>
                                        <span className="text-zinc-400 block uppercase font-medium">Account Name</span>
                                        <span className="text-zinc-900 font-semibold">{parsedInstructions.accountName}</span>
                                    </div>
                                )}
                                {parsedInstructions.accountNumber && (
                                    <div>
                                        <span className="text-zinc-400 block uppercase font-medium">Account / IBAN</span>
                                        <span className="text-zinc-900 font-mono font-semibold">{parsedInstructions.accountNumber}</span>
                                    </div>
                                )}
                                {parsedInstructions.routingOrSwift && (
                                    <div>
                                        <span className="text-zinc-400 block uppercase font-medium">Routing / Sort Code / SWIFT</span>
                                        <span className="text-zinc-900 font-mono font-semibold">{parsedInstructions.routingOrSwift}</span>
                                    </div>
                                )}
                                {parsedInstructions.paymentUrl && (
                                    <div className="col-span-full pt-1">
                                        <span className="text-zinc-400 block uppercase font-medium">Pay Online</span>
                                        <a
                                            href={parsedInstructions.paymentUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline font-medium inline-flex items-center gap-1"
                                        >
                                            {parsedInstructions.paymentUrl}
                                            <ExternalLink className="h-3 w-3" />
                                        </a>
                                    </div>
                                )}
                                {parsedInstructions.notes && (
                                    <div className="col-span-full pt-1 text-zinc-600 whitespace-pre-line border-t border-zinc-200/60 mt-1">
                                        {parsedInstructions.notes}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-zinc-50 rounded-lg p-4 border border-zinc-100 text-xs text-zinc-600 whitespace-pre-line">
                                {rawInstructionsText}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer / Totals */}
            <div>
                <div className="bg-zinc-50/70 p-8 md:p-12 border-t border-zinc-100 print:bg-transparent">
                    <div className="flex flex-col md:items-end gap-2.5">
                        <div className="flex justify-between w-full md:w-80 text-sm">
                            <span className="text-zinc-500">Subtotal</span>
                            <span className="font-semibold text-zinc-900">{symbol}{formatMoney(effectiveSubtotal)}</span>
                        </div>
                        {discountRate > 0 && (
                            <div className="flex justify-between w-full md:w-80 text-sm">
                                <span className="text-zinc-500">Discount ({discountRate}%)</span>
                                <span className="font-medium text-emerald-600">-{symbol}{formatMoney(discountAmount)}</span>
                            </div>
                        )}
                        {taxRate > 0 && (
                            <div className="flex justify-between w-full md:w-80 text-sm">
                                <span className="text-zinc-500">Tax ({taxRate}%)</span>
                                <span className="font-medium text-zinc-900">+{symbol}{formatMoney(taxAmount)}</span>
                            </div>
                        )}
                        <div className="h-px bg-zinc-200 w-full md:w-80 my-1" />
                        <div className="flex justify-between w-full md:w-80 items-baseline">
                            <span className="text-base font-bold text-zinc-900">Total Due</span>
                            <span
                                className="text-2xl font-extrabold"
                                style={{ color: brandColor }}
                            >
                                {symbol}{formatMoney(effectiveTotal)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Subtle Watermark Badge at Footer */}
                <div className="py-3 border-t border-zinc-100 bg-zinc-50/30 flex items-center justify-center gap-1.5 text-[11px] text-zinc-400">
                    <Zap className="h-3 w-3 text-zinc-400 fill-zinc-300" />
                    <span>Powered by <strong className="font-semibold text-zinc-500">Impry OS</strong></span>
                </div>
            </div>
        </div>
    )
}
