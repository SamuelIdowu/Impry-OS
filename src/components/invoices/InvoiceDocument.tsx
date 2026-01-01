import React from "react"
import { Zap } from "lucide-react"
import { Payment } from "@/lib/types/payment"

interface InvoiceDocumentProps {
    invoice: Partial<Payment> | any; // Using partial/any to support preview state where data might be incomplete
    previewMode?: boolean;
}

export function InvoiceDocument({ invoice, previewMode = false }: InvoiceDocumentProps) {
    const {
        invoice_number,
        amount,
        due_date,
        line_items,
        // Joined fields or preview fields
        projects,
        clients,
        // Preview specific fields might come directly if not in 'projects'/'clients' objects yet
        clientName: previewClientName,
        projectName: previewProjectName,
        project_id,
        client_id
    } = invoice

    const projectName = projects?.name || previewProjectName
    const clientName = clients?.name || previewClientName
    const effectiveItems = (line_items as any[]) || []

    // Helper to safely format currency
    const formatMoney = (val: any) => {
        const num = parseFloat(val)
        if (isNaN(num)) return "0.00"
        return num.toLocaleString('en-US', { minimumFractionDigits: 2 })
    }

    // Helper to safe format date
    const formatDate = (dateStr: string | undefined) => {
        if (!dateStr) return "N/A"
        try {
            return new Date(dateStr).toLocaleDateString()
        } catch (e) {
            return dateStr
        }
    }

    const effectiveSubtotal = effectiveItems.reduce((sum: number, item: any) => sum + (parseFloat(item.amount) || 0), 0) || (parseFloat(amount) || 0)
    const effectiveTotal = effectiveSubtotal // Add tax/discount logic here later if needed

    return (
        <div className={`bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden min-h-[800px] flex flex-col h-full ${previewMode ? 'scale-100 origin-top' : ''} print:shadow-none print:border-0`}>
            <div className="p-8 md:p-12 flex-1">
                {/* Document Header */}
                <div className="flex justify-between items-start mb-16">
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 bg-zinc-100 rounded-lg flex items-center justify-center">
                                <Zap className="h-5 w-5 text-zinc-900 fill-zinc-900" />
                            </div>
                            <span className="text-xl font-bold text-zinc-900 tracking-tight">FreelanceOS</span>
                        </div>

                        <div className="text-sm text-zinc-500 leading-relaxed">
                            <p className="font-semibold text-zinc-900">Jane Doe Designs LLC</p>
                            <p>123 Creative Studio Blvd</p>
                            <p>San Francisco, CA 94103</p>
                            <p>VAT ID: US123456789</p>
                        </div>
                    </div>

                    <div className="text-right">
                        <h2 className="text-4xl font-bold text-zinc-900 tracking-tight mb-2 uppercase text-right">Invoice</h2>
                        <p className="text-zinc-500 font-medium"># {invoice_number || 'DRAFT'}</p>
                    </div>
                </div>

                {/* Bill To & Project Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                    <div className="flex flex-row justify-between md:justify-start md:gap-24">
                        <div className="flex flex-col gap-2">
                            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Bill To</h3>
                            <div className="text-sm text-zinc-500 leading-relaxed">
                                <p className="font-bold text-zinc-900 text-base">{clientName || (client_id ? 'Loading Client...' : 'Valued Client')}</p>
                                <p>Attn: Accounts Payable</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Project</h3>
                            <p className="font-bold text-zinc-900 text-sm">{projectName || (project_id ? 'Loading Project...' : 'General Services')}</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 md:items-end text-sm">
                        <div className="flex justify-between md:justify-end gap-12 md:gap-8 w-full">
                            <span className="text-zinc-500 font-medium">Issued Date:</span>
                            <span className="text-zinc-900 font-semibold">{formatDate(invoice.issue_date || new Date().toISOString())}</span>
                        </div>
                        <div className="flex justify-between md:justify-end gap-12 md:gap-8 w-full">
                            <span className="text-zinc-500 font-medium">Due Date:</span>
                            <span className="text-red-500 font-semibold">{formatDate(due_date)}</span>
                        </div>
                    </div>
                </div>

                {/* Line Items */}
                <div className="mb-12">
                    <div className="flex items-center border-b border-zinc-200 pb-3 mb-4">
                        <div className="flex-1 text-xs font-bold text-zinc-400 uppercase tracking-wider">Description</div>
                        <div className="w-24 text-right text-xs font-bold text-zinc-400 uppercase tracking-wider">Qty/Hrs</div>
                        <div className="w-32 text-right text-xs font-bold text-zinc-400 uppercase tracking-wider">Rate</div>
                        <div className="w-32 text-right text-xs font-bold text-zinc-400 uppercase tracking-wider">Amount</div>
                    </div>

                    <div className="flex flex-col gap-4">
                        {effectiveItems.length > 0 ? (
                            effectiveItems.map((item, index) => (
                                <div key={index} className="flex items-start py-2 border-b border-dashed border-zinc-100 last:border-0">
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-zinc-900">{item.description || 'Item Name'}</p>
                                        <p className="text-xs text-zinc-500 mt-0.5">{item.details}</p>
                                    </div>
                                    <div className="w-24 text-right text-sm text-zinc-500">{item.quantity}</div>
                                    <div className="w-32 text-right text-sm text-zinc-500">${formatMoney(item.rate || item.unitPrice)}</div>
                                    <div className="w-32 text-right text-sm font-bold text-zinc-900">${formatMoney(item.amount)}</div>
                                </div>
                            ))
                        ) : (
                            // Fallback item if no detailed items exist
                            <div className="flex items-start py-2">
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-zinc-900">{invoice.description || 'Services Rendered'}</p>
                                    {projectName && <p className="text-xs text-zinc-500 mt-0.5">{projectName}</p>}
                                </div>
                                <div className="w-24 text-right text-sm text-zinc-500">1.0</div>
                                <div className="w-32 text-right text-sm text-zinc-500">${formatMoney(effectiveSubtotal)}</div>
                                <div className="w-32 text-right text-sm font-bold text-zinc-900">${formatMoney(effectiveSubtotal)}</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer / Totals */}
            <div className="bg-zinc-50/50 p-8 md:p-12 border-t border-zinc-100 print:bg-transparent">
                <div className="flex flex-col md:items-end gap-3">
                    <div className="flex justify-between w-full md:w-80 text-sm">
                        <span className="text-zinc-500">Subtotal</span>
                        <span className="font-semibold text-zinc-900">${formatMoney(effectiveSubtotal)}</span>
                    </div>
                    <div className="flex justify-between w-full md:w-80 text-sm">
                        <span className="text-zinc-500">Discount (0%)</span>
                        <span className="font-medium text-zinc-900">-$0.00</span>
                    </div>
                    <div className="flex justify-between w-full md:w-80 text-sm">
                        <span className="text-zinc-500">VAT (0%)</span>
                        <span className="font-medium text-zinc-900">$0.00</span>
                    </div>
                    <div className="h-px bg-zinc-200 w-full md:w-80 my-2" />
                    <div className="flex justify-between w-full md:w-80 items-baseline">
                        <span className="text-base font-bold text-zinc-900">Total Due</span>
                        <span className="text-2xl font-bold text-zinc-900">${formatMoney(effectiveTotal)}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
