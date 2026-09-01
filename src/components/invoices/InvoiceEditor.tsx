"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import {
    ChevronLeft,
    Eye,
    EyeOff,
    Save,
    Calendar as CalendarIcon,
    Download,
    Settings,
    Mail,
    Send,
    CreditCard,
    Building2,
    Link2,
    CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ImageUpload } from "@/components/shared/ImageUpload"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { InvoiceDocument, StructuredPaymentInstructions } from "@/components/invoices/InvoiceDocument"
import { InvoiceLineItems } from "@/components/invoices/InvoiceLineItems"
import { createStandaloneInvoice, updateStandaloneInvoice } from "@/server/actions/invoices"
import { getProfileAction, updateBrandingAction } from "@/server/actions/user"
import { sendInvoiceEmailAction } from "@/server/actions/email"
import { updateClientAction } from "@/server/actions/clients"
import { ClientEmailDialog } from "@/components/invoices/ClientEmailDialog"
import { pdfStyles } from "@/lib/pdf-styles"
import { applyPdfSafeStyles, removePdfSafeStyles } from "@/lib/pdf-color-utils"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

interface InvoiceEditorProps {
    clients: { id: string; name: string; email?: string; company?: string; address?: string }[]
    projects: { id: string; name: string; clientId: string }[]
    initialData?: any
}

export function InvoiceEditor({ clients, projects, initialData }: InvoiceEditorProps) {
    const router = useRouter()
    const params = useParams()
    const workspaceId = params?.workspaceId as string || 'default'
    const [showPreview, setShowPreview] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const [isSending, setIsSending] = useState(false)
    const [showEmailDialog, setShowEmailDialog] = useState(false)

    // Form State
    const [clientId, setClientId] = useState(initialData?.clientId || initialData?.client_id || "")
    const [projectId, setProjectId] = useState(initialData?.projectId || initialData?.project_id || "")
    const [invoiceNumber, setInvoiceNumber] = useState(initialData?.invoiceNumber || initialData?.invoice_number || "")
    const [issueDate, setIssueDate] = useState(initialData?.issueDate || initialData?.issue_date || new Date().toISOString().split('T')[0])
    const [dueDate, setDueDate] = useState(initialData?.dueDate || initialData?.due_date || "")
    const [notes, setNotes] = useState(initialData?.notes || "")

    // Structured Payment Instructions
    const [paymentMethodTab, setPaymentMethodTab] = useState<'bank' | 'link' | 'custom'>('bank')
    const [bankName, setBankName] = useState("")
    const [accountName, setAccountName] = useState("")
    const [accountNumber, setAccountNumber] = useState("")
    const [routingOrSwift, setRoutingOrSwift] = useState("")
    const [paymentUrl, setPaymentUrl] = useState("")
    const [paymentNotes, setPaymentNotes] = useState("")

    // New Feature State
    const [currency, setCurrency] = useState(initialData?.currency || "USD")
    const [taxRate, setTaxRate] = useState<number>(initialData?.taxRate || initialData?.tax_rate || 0)
    const [discountRate, setDiscountRate] = useState<number>(initialData?.discountRate || initialData?.discount_rate || 0)

    // Branding State
    const [brandColor, setBrandColor] = useState("#18181b")
    const [logoUrl, setLogoUrl] = useState("")
    const [senderProfile, setSenderProfile] = useState<{ company?: string; name?: string; email?: string } | null>(null)
    const [, setIsBrandingLoading] = useState(true)

    const [items, setItems] = useState<any[]>(initialData?.lineItems || initialData?.line_items || [
        { description: "", quantity: 1, rate: 0, amount: 0, details: "" }
    ])

    // Initialize Invoice Number on mount if not provided
    useEffect(() => {
        if (!initialData?.invoiceNumber && !initialData?.invoice_number) {
            const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
            const year = new Date().getFullYear()
            setInvoiceNumber(`INV-${year}-${random}`)
        }

        // Default due date +14 days if not provided
        if (!initialData?.dueDate && !initialData?.due_date) {
            const date = new Date()
            date.setDate(date.getDate() + 14)
            setDueDate(date.toISOString().split('T')[0])
        }

        // Initialize payment instructions if present
        if (initialData?.paymentInstructions || initialData?.payment_instructions) {
            const raw = initialData.paymentInstructions || initialData.payment_instructions
            if (typeof raw === 'object') {
                if (raw.bankName) setBankName(raw.bankName)
                if (raw.accountName) setAccountName(raw.accountName)
                if (raw.accountNumber) setAccountNumber(raw.accountNumber)
                if (raw.routingOrSwift) setRoutingOrSwift(raw.routingOrSwift)
                if (raw.paymentUrl) setPaymentUrl(raw.paymentUrl)
                if (raw.notes) setPaymentNotes(raw.notes)
            } else if (typeof raw === 'string') {
                try {
                    const parsed = JSON.parse(raw)
                    if (parsed.bankName) setBankName(parsed.bankName)
                    if (parsed.accountName) setAccountName(parsed.accountName)
                    if (parsed.accountNumber) setAccountNumber(parsed.accountNumber)
                    if (parsed.routingOrSwift) setRoutingOrSwift(parsed.routingOrSwift)
                    if (parsed.paymentUrl) setPaymentUrl(parsed.paymentUrl)
                    if (parsed.notes) setPaymentNotes(parsed.notes)
                } catch {
                    setPaymentNotes(raw)
                }
            }
        }

        // Fetch Branding & Profile
        const loadBranding = async () => {
            const res = await getProfileAction()
            if (res.success && res.profile) {
                if (res.profile.brandColor) setBrandColor(res.profile.brandColor)
                if (res.profile.logoUrl) setLogoUrl(res.profile.logoUrl)
                setSenderProfile({
                    company: res.profile.companyName || res.profile.name || undefined,
                    name: res.profile.name || undefined,
                    email: res.profile.email || undefined
                })
            }
            setIsBrandingLoading(false)
        }
        loadBranding()
    }, [initialData])

    // Filter projects by client
    const clientProjects = projects.filter(p => p.clientId === clientId)
    const selectedClient = clients.find(c => c.id === clientId)

    const calculateTotal = () => {
        const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.amount) || (parseFloat(item.quantity || 1) * parseFloat(item.rate || 0)) || 0), 0)
        const discountAmount = subtotal * (discountRate / 100)
        const afterDiscount = subtotal - discountAmount
        const taxAmount = afterDiscount * (taxRate / 100)
        return afterDiscount + taxAmount
    }

    const compiledPaymentInstructions: StructuredPaymentInstructions = {
        bankName: bankName.trim() || undefined,
        accountName: accountName.trim() || undefined,
        accountNumber: accountNumber.trim() || undefined,
        routingOrSwift: routingOrSwift.trim() || undefined,
        paymentUrl: paymentUrl.trim() || undefined,
        notes: paymentNotes.trim() || undefined
    }

    const isFormValid = Boolean(
        clientId &&
        invoiceNumber.trim() &&
        issueDate &&
        dueDate &&
        items.length > 0 &&
        items.some(it => it.description && it.description.trim().length > 0)
    )

    const saveInvoice = async (status: 'pending' = 'pending') => {
        const invoiceData = {
            clientId: clientId,
            projectId: projectId === "none" || !projectId ? undefined : projectId,
            invoiceNumber: invoiceNumber,
            issueDate: issueDate,
            dueDate: dueDate,
            amount: calculateTotal(),
            currency: currency,
            status: status,
            lineItems: items,
            notes: notes,
            paymentInstructions: JSON.stringify(compiledPaymentInstructions),
            taxRate: taxRate,
            discountRate: discountRate
        }

        let savedId = initialData?.id
        if (savedId) {
            await updateStandaloneInvoice(savedId, invoiceData)
        } else {
            const created = await createStandaloneInvoice(invoiceData)
            savedId = created?.id
        }

        // Also update branding if changed
        await updateBrandingAction({ brand_color: brandColor, logo_url: logoUrl })
        return savedId
    }

    const handleSave = async (status: 'pending') => {
        if (!clientId) {
            alert("Please select a client")
            return
        }
        if (!isFormValid) {
            alert("Please ensure client, invoice number, due date, and at least one item description are filled.")
            return
        }

        setIsLoading(true)
        try {
            await saveInvoice(status)
            router.push(`/${workspaceId}/invoices`)
            router.refresh()
        } catch (error) {
            console.error(error)
            alert("Failed to save invoice")
            setIsLoading(false)
        }
    }

    const handleDownloadPdf = async () => {
        const element = document.getElementById("invoice-document")
        if (!element) return

        try {
            const htmlElement = document.documentElement
            const originalClass = htmlElement.className

            htmlElement.classList.remove('dark')
            await new Promise(resolve => setTimeout(resolve, 50))

            applyPdfSafeStyles(element as HTMLElement)

            const PDF_CAPTURE_WIDTH = 900
            const originalElementWidth = element.style.width
            const originalElementMaxWidth = element.style.maxWidth
            element.style.width = `${PDF_CAPTURE_WIDTH}px`
            element.style.maxWidth = `${PDF_CAPTURE_WIDTH}px`

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                width: PDF_CAPTURE_WIDTH,
                windowWidth: PDF_CAPTURE_WIDTH,
                height: element.scrollHeight,
                windowHeight: element.scrollHeight,
                foreignObjectRendering: false,
            })

            element.style.width = originalElementWidth
            element.style.maxWidth = originalElementMaxWidth

            removePdfSafeStyles(element as HTMLElement)
            htmlElement.className = originalClass

            const imgData = canvas.toDataURL("image/png")
            const pdf = new jsPDF("p", "mm", "a4")
            const pdfWidth = pdf.internal.pageSize.getWidth()
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width

            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)
            pdf.save(`${invoiceNumber}.pdf`)
        } catch (err) {
            console.error("PDF generation failed", err)
            alert(`Failed to generate PDF: ${err instanceof Error ? err.message : String(err)}`)
        }
    }

    const handleSendEmail = async () => {
        if (!clientId) {
            alert("Please select a client")
            return
        }
        if (!isFormValid) {
            alert("Please ensure client, invoice number, due date, and at least one item description are filled.")
            return
        }

        const clientEmail = selectedClient?.email
        if (!clientEmail) {
            setShowEmailDialog(true)
            return
        }

        if (!confirm(`Send invoice to ${clientEmail}?`)) return

        setIsSending(true)
        try {
            const savedInvoiceId = await saveInvoice('pending')
            if (!savedInvoiceId) {
                throw new Error("Could not retrieve invoice ID")
            }
            const res = await sendInvoiceEmailAction(savedInvoiceId, clientEmail)
            setIsSending(false)

            if (res.success) {
                alert("Email sent successfully!")
                router.push(`/${workspaceId}/invoices`)
                router.refresh()
            } else {
                alert("Invoice saved, but failed to send email: " + res.error)
                router.push(`/${workspaceId}/invoices`)
                router.refresh()
            }
        } catch (error) {
            console.error(error)
            alert("Failed to send invoice: " + (error instanceof Error ? error.message : String(error)))
            setIsSending(false)
        }
    }

    const handleEmailConfirm = async (email: string, saveToProfile: boolean) => {
        setIsSending(true)
        try {
            if (saveToProfile && clientId) {
                await updateClientAction(clientId, { email })
            }

            const savedInvoiceId = await saveInvoice('pending')
            if (!savedInvoiceId) {
                throw new Error("Could not retrieve invoice ID")
            }

            const res = await sendInvoiceEmailAction(savedInvoiceId, email)
            setIsSending(false)

            if (res.success) {
                alert("Email sent successfully!")
                router.push(`/${workspaceId}/invoices`)
                router.refresh()
            } else {
                alert("Invoice saved, but failed to send email: " + res.error)
                router.push(`/${workspaceId}/invoices`)
                router.refresh()
            }
        } catch (error) {
            console.error(error)
            alert("Failed to send invoice: " + (error instanceof Error ? error.message : String(error)))
            setIsSending(false)
        }
    }

    // Construct preview object
    const previewInvoice = {
        invoiceNumber,
        invoice_number: invoiceNumber,
        issueDate,
        issue_date: issueDate,
        dueDate,
        due_date: dueDate,
        amount: calculateTotal(),
        status: 'pending',
        lineItems: items,
        line_items: items,
        clientId,
        projectId,
        currency,
        taxRate,
        tax_rate: taxRate,
        discountRate,
        discount_rate: discountRate,
        paymentInstructions: compiledPaymentInstructions,
        payment_instructions: compiledPaymentInstructions,
        clientName: selectedClient?.name,
        clientEmail: selectedClient?.email,
        clientAddress: selectedClient?.address,
        projectName: projects.find(p => p.id === projectId)?.name,
        projects: projectId ? { name: projects.find(p => p.id === projectId)?.name } : null,
        clients: selectedClient ? { name: selectedClient.name, email: selectedClient.email, address: selectedClient.address } : null
    }

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)]">
            {/* Top Bar */}
            <div className="flex items-center justify-between px-6 lg:px-8 py-3.5 border-b border-zinc-200 bg-white shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-9 w-9">
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-lg md:text-xl font-bold text-zinc-900">{initialData ? 'Edit Invoice' : 'New Invoice'}</h1>
                        <p className="text-xs text-zinc-500 font-mono">#{invoiceNumber}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    <Button variant="outline" size="sm" onClick={handleDownloadPdf} title="Download PDF">
                        <Download className="h-4 w-4 mr-1.5" />
                        PDF
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)} className="hidden lg:flex">
                        {showPreview ? (
                            <>
                                <EyeOff className="h-4 w-4 mr-1.5" />
                                Hide Preview
                            </>
                        ) : (
                            <>
                                <Eye className="h-4 w-4 mr-1.5" />
                                Show Preview
                            </>
                        )}
                    </Button>
                    <div className="h-5 w-px bg-zinc-200 mx-1 hidden lg:block" />
                    <Button
                        size="sm"
                        onClick={handleSendEmail}
                        disabled={isLoading || isSending || !isFormValid}
                        className="bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-50"
                    >
                        <Send className="h-4 w-4 mr-1.5" />
                        {isSending ? "Sending..." : "Send"}
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden bg-zinc-50">
                {/* Editor Pane */}
                <div className={`flex-1 overflow-y-auto p-6 md:p-8 transition-[max-width] duration-300 ease-out ${showPreview ? 'lg:max-w-[50%]' : 'w-full mx-auto'}`}>
                    <div className="space-y-6 pb-24">
                        {/* Invoice Details Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
                            <h2 className="text-base font-semibold mb-5 flex items-center gap-2 text-zinc-900">
                                <Settings className="h-4 w-4 text-zinc-500" />
                                Invoice Details
                            </h2>
                            <div className="grid gap-5">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs font-semibold text-zinc-700">Client <span className="text-red-500">*</span></Label>
                                        {selectedClient?.email && (
                                            <span className="text-xs text-zinc-500">{selectedClient.email}</span>
                                        )}
                                    </div>
                                    <Select value={clientId} onValueChange={(val) => {
                                        setClientId(val)
                                        setProjectId("")
                                    }}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select client" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {clients.map(c => (
                                                <SelectItem key={c.id} value={c.id}>{c.name} {c.company ? `(${c.company})` : ''}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold text-zinc-700">Project</Label>
                                        <Select value={projectId} onValueChange={setProjectId} disabled={!clientId}>
                                            <SelectTrigger><SelectValue placeholder="No Project" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">No Project</SelectItem>
                                                {clientProjects.map(p => (
                                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold text-zinc-700">Currency</Label>
                                        <Select value={currency} onValueChange={setCurrency}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="USD">USD ($)</SelectItem>
                                                <SelectItem value="EUR">EUR (€)</SelectItem>
                                                <SelectItem value="GBP">GBP (£)</SelectItem>
                                                <SelectItem value="CAD">CAD ($)</SelectItem>
                                                <SelectItem value="AUD">AUD ($)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold text-zinc-700">Invoice Number <span className="text-red-500">*</span></Label>
                                        <Input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold text-zinc-700">Issue Date <span className="text-red-500">*</span></Label>
                                        <Input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-zinc-700">Due Date <span className="text-red-500">*</span></Label>
                                    <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                                </div>
                            </div>
                        </div>

                        {/* Items Card */}
                        <InvoiceLineItems items={items} currency={currency} onChange={setItems} />

                        {/* Structured Payment Instructions Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-base font-semibold flex items-center gap-2 text-zinc-900">
                                    <CreditCard className="h-4 w-4 text-zinc-500" />
                                    Payment Instructions
                                </h2>
                                <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-lg text-xs">
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethodTab('bank')}
                                        className={`px-2.5 py-1 rounded-md font-medium transition-colors ${paymentMethodTab === 'bank' ? 'bg-white shadow-xs text-zinc-900' : 'text-zinc-500 hover:text-zinc-900'}`}
                                    >
                                        Bank Transfer
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethodTab('link')}
                                        className={`px-2.5 py-1 rounded-md font-medium transition-colors ${paymentMethodTab === 'link' ? 'bg-white shadow-xs text-zinc-900' : 'text-zinc-500 hover:text-zinc-900'}`}
                                    >
                                        Payment Link
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethodTab('custom')}
                                        className={`px-2.5 py-1 rounded-md font-medium transition-colors ${paymentMethodTab === 'custom' ? 'bg-white shadow-xs text-zinc-900' : 'text-zinc-500 hover:text-zinc-900'}`}
                                    >
                                        Custom Note
                                    </button>
                                </div>
                            </div>

                            {paymentMethodTab === 'bank' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs text-zinc-600">Bank Name</Label>
                                        <Input
                                            placeholder="e.g. Chase / Barclays"
                                            value={bankName}
                                            onChange={(e) => setBankName(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs text-zinc-600">Account Name</Label>
                                        <Input
                                            placeholder="e.g. Acme Studio LLC"
                                            value={accountName}
                                            onChange={(e) => setAccountName(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs text-zinc-600">Account Number / IBAN</Label>
                                        <Input
                                            placeholder="e.g. 123456789 or GB29..."
                                            value={accountNumber}
                                            onChange={(e) => setAccountNumber(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs text-zinc-600">Routing / Sort Code / SWIFT</Label>
                                        <Input
                                            placeholder="e.g. 021000021 / CHASUS33"
                                            value={routingOrSwift}
                                            onChange={(e) => setRoutingOrSwift(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            {paymentMethodTab === 'link' && (
                                <div className="space-y-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs text-zinc-600">Payment URL (Stripe, PayPal, Wise)</Label>
                                        <Input
                                            placeholder="https://buy.stripe.com/..."
                                            value={paymentUrl}
                                            onChange={(e) => setPaymentUrl(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            {paymentMethodTab === 'custom' && (
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-zinc-600">Custom Payment Instructions</Label>
                                    <Textarea
                                        value={paymentNotes}
                                        onChange={(e) => setPaymentNotes(e.target.value)}
                                        placeholder="Add any specific instructions or notes..."
                                        rows={4}
                                    />
                                </div>
                            )}

                            {paymentMethodTab !== 'custom' && (
                                <div className="mt-3 pt-3 border-t border-zinc-100">
                                    <Label className="text-xs text-zinc-500 mb-1 block">Additional Payment Memo (Optional)</Label>
                                    <Input
                                        placeholder="e.g. Please quote invoice number in transfer reference"
                                        value={paymentNotes}
                                        onChange={(e) => setPaymentNotes(e.target.value)}
                                        className="text-xs"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Settings & Tax Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
                            <h2 className="text-base font-semibold mb-4 text-zinc-900">Branding, Tax & Discounts</h2>
                            <div className="grid gap-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs text-zinc-600">Brand Color</Label>
                                        <div className="flex gap-2">
                                            <Input type="color" value={brandColor} onChange={(e) => setBrandColor(e.target.value)} className="w-12 p-1 h-10" />
                                            <Input value={brandColor} onChange={(e) => setBrandColor(e.target.value)} placeholder="#000000" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs text-zinc-600">Tax Rate (%)</Label>
                                        <Input type="number" min="0" max="100" step="0.1" value={taxRate || ''} onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)} placeholder="0" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs text-zinc-600">Logo</Label>
                                        <ImageUpload
                                            value={logoUrl}
                                            onChange={setLogoUrl}
                                            variant="logo"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs text-zinc-600">Discount (%)</Label>
                                        <Input type="number" min="0" max="100" step="0.1" value={discountRate || ''} onChange={(e) => setDiscountRate(parseFloat(e.target.value) || 0)} placeholder="0" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Save & Action Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div>
                                <h3 className="text-sm font-semibold text-zinc-900">Ready to finalize?</h3>
                                <p className="text-xs text-zinc-500 mt-0.5">
                                    {isFormValid
                                        ? "All required fields are complete. You can now save your invoice."
                                        : "Please complete required fields (Client, Invoice Number, Due Date, and items) to save."
                                    }
                                </p>
                            </div>
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={() => router.back()}
                                    className="w-full sm:w-auto"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => handleSave('pending')}
                                    disabled={isLoading || !isFormValid}
                                    className="bg-zinc-900 text-white hover:bg-zinc-800 w-full sm:w-auto flex items-center gap-2"
                                >
                                    <Save className="h-4 w-4" />
                                    {isLoading ? "Saving..." : "Save Invoice"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preview Pane */}
                {showPreview && (
                    <div className="hidden lg:block w-1/2 overflow-y-auto p-8 border-l border-zinc-200 bg-zinc-100/50">
                        <div className="mx-auto sticky top-0">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-sm font-semibold text-zinc-500">Live Preview</h2>
                                <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-medium">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Real-time Sync
                                </div>
                            </div>
                            <div className="origin-top scale-[0.9]">
                                <div id="invoice-document" style={pdfStyles}>
                                    <InvoiceDocument
                                        invoice={previewInvoice}
                                        previewMode={true}
                                        brandColor={brandColor}
                                        logoUrl={logoUrl}
                                        senderName={senderProfile?.name}
                                        senderDetails={senderProfile || undefined}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <ClientEmailDialog
                isOpen={showEmailDialog}
                onClose={() => setShowEmailDialog(false)}
                onConfirm={handleEmailConfirm}
                clientName={selectedClient?.name || "Client"}
            />
        </div>
    )
}
