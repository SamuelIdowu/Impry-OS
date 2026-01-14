"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
    ChevronLeft,
    Eye,
    EyeOff,
    Save,
    Send,
    Plus,
    Trash2,
    Calendar as CalendarIcon,
    Download,
    Settings,
    Mail
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { InvoiceDocument } from "@/components/invoices/InvoiceDocument"
import { createStandaloneInvoice, updateStandaloneInvoice } from "@/server/actions/payments"
import { getProfileAction, updateBrandingAction } from "@/server/actions/user"
import { sendInvoiceEmailAction } from "@/server/actions/email"
import { updateClientAction } from "@/server/actions/clients"
import { ClientEmailDialog } from "@/components/invoices/ClientEmailDialog"
import { formatCurrency } from "@/lib/types/payment"
import { pdfStyles } from "@/lib/pdf-styles"
import { applyPdfSafeStyles, removePdfSafeStyles } from "@/lib/pdf-color-utils"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

interface InvoiceEditorProps {
    clients: { id: string; name: string; email?: string }[]
    projects: { id: string; name: string; clientId: string }[]
    initialData?: any
}

export function InvoiceEditor({ clients, projects, initialData }: InvoiceEditorProps) {
    const router = useRouter()
    const [showPreview, setShowPreview] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const [isSending, setIsSending] = useState(false)
    const [showEmailDialog, setShowEmailDialog] = useState(false)

    // Form State
    const [clientId, setClientId] = useState(initialData?.client_id || "")
    const [projectId, setProjectId] = useState(initialData?.project_id || "")
    const [invoiceNumber, setInvoiceNumber] = useState(initialData?.invoice_number || "")
    const [issueDate, setIssueDate] = useState(initialData?.issue_date || new Date().toISOString().split('T')[0])
    const [dueDate, setDueDate] = useState(initialData?.due_date || "")
    const [notes, setNotes] = useState(initialData?.notes || "")

    // New Feature State
    const [currency, setCurrency] = useState(initialData?.currency || "USD")
    const [taxRate, setTaxRate] = useState<number>(initialData?.tax_rate || 0)
    const [discountRate, setDiscountRate] = useState<number>(initialData?.discount_rate || 0)

    // Branding State
    const [brandColor, setBrandColor] = useState("#18181b")
    const [logoUrl, setLogoUrl] = useState("")
    const [isBrandingLoading, setIsBrandingLoading] = useState(true)

    const [items, setItems] = useState<any[]>(initialData?.line_items || [
        { description: "Services Rendered", quantity: 1, rate: 0, amount: 0, details: "" }
    ])

    // Initialize Invoice Number on mount if not provided
    useEffect(() => {
        if (!initialData?.invoice_number) {
            const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
            const year = new Date().getFullYear()
            setInvoiceNumber(`INV-${year}-${random}`)
        }

        // Default due date +14 days if not provided
        if (!initialData?.due_date) {
            const date = new Date()
            date.setDate(date.getDate() + 14)
            setDueDate(date.toISOString().split('T')[0])
        }

        // Fetch Branding
        const loadBranding = async () => {
            const res = await getProfileAction()
            if (res.success && res.profile) {
                if (res.profile.brand_color) setBrandColor(res.profile.brand_color)
                if (res.profile.logo_url) setLogoUrl(res.profile.logo_url)
            }
            setIsBrandingLoading(false)
        }
        loadBranding()
    }, [initialData])

    // Filter projects by client
    const clientProjects = projects.filter(p => p.clientId === clientId)

    const handleItemChange = (index: number, field: string, value: any) => {
        const newItems = [...items]
        const item = { ...newItems[index], [field]: value }

        if (field === 'quantity' || field === 'rate') {
            const qty = parseFloat(field === 'quantity' ? value : item.quantity) || 0
            const rate = parseFloat(field === 'rate' ? value : item.rate) || 0
            item.amount = qty * rate
        }

        newItems[index] = item
        setItems(newItems)
    }

    const addItem = () => {
        setItems([...items, { description: "", quantity: 1, rate: 0, amount: 0, details: "" }])
    }

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index))
    }

    const calculateTotal = () => {
        const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0)
        const discountAmount = subtotal * (discountRate / 100)
        const afterDiscount = subtotal - discountAmount
        const taxAmount = afterDiscount * (taxRate / 100)
        return afterDiscount + taxAmount
    }

    const handleSave = async (status: 'pending') => {
        if (!clientId) {
            alert("Please select a client")
            return
        }
        setIsLoading(true)
        try {
            const invoiceData = {
                client_id: clientId,
                project_id: projectId === "none" || !projectId ? undefined : projectId,
                invoice_number: invoiceNumber,
                issue_date: issueDate,
                due_date: dueDate,
                amount: calculateTotal(),
                currency: currency,
                status: status, // This will be 'pending' as 'draft' is not yet supported in DB
                line_items: items,
                notes: notes,
                tax_rate: taxRate,
                discount_rate: discountRate
            }

            if (initialData?.id) {
                await updateStandaloneInvoice(initialData.id, invoiceData)
            } else {
                await createStandaloneInvoice(invoiceData)
            }

            // Also update branding if changed
            await updateBrandingAction({ brand_color: brandColor, logo_url: logoUrl })

            router.push('/invoices')
            router.refresh()
        } catch (error) {
            console.error(error)
            alert("Failed to save invoice")
            setIsLoading(false) // Only stop loading on error, as success navigates away
        }
    }

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
            pdf.save(`${invoiceNumber}.pdf`)
        } catch (err) {
            console.error("PDF generation failed", err)
            alert(`Failed to generate PDF: ${err instanceof Error ? err.message : String(err)}`)
        }
    }

    const handleSendEmail = async () => {
        if (!initialData?.id) {
            alert("Please save the invoice first")
            return
        }

        const clientEmail = clients.find(c => c.id === clientId)?.email
        if (!clientEmail) {
            setShowEmailDialog(true)
            return
        }

        if (!confirm(`Send invoice to ${clientEmail}?`)) return

        setIsSending(true)
        const res = await sendInvoiceEmailAction(initialData.id, clientEmail)
        setIsSending(false)

        if (res.success) {
            alert("Email sent successfully!")
        } else {
            alert("Failed to send email: " + res.error)
        }
    }

    const handleEmailConfirm = async (email: string, saveToProfile: boolean) => {
        if (!initialData?.id) return

        setIsSending(true)

        if (saveToProfile && clientId) {
            await updateClientAction(clientId, { email })
        }

        const res = await sendInvoiceEmailAction(initialData.id, email)
        setIsSending(false)

        if (res.success) {
            alert("Email sent successfully!")
            router.refresh()
        } else {
            alert("Failed to send email: " + res.error)
        }
    }

    // Construct preview object
    const previewInvoice = {
        invoice_number: invoiceNumber,
        issue_date: issueDate,
        due_date: dueDate,
        amount: calculateTotal(),
        status: 'pending',
        line_items: items,
        client_id: clientId,
        project_id: projectId,
        currency,
        tax_rate: taxRate,
        discount_rate: discountRate,
        // Enriched data for preview
        clientName: clients.find(c => c.id === clientId)?.name,
        projectName: projects.find(p => p.id === projectId)?.name,
        projects: projectId ? { name: projects.find(p => p.id === projectId)?.name } : null,
        clients: clientId ? { name: clients.find(c => c.id === clientId)?.name } : null
    }

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)]">
            {/* Top Bar */}
            <div className="flex items-center justify-between px-8 py-4 border-b border-zinc-200 bg-white shadow-sm z-10">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-xl font-bold text-zinc-900">{initialData ? 'Edit Invoice' : 'New Invoice'}</h1>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={handleDownloadPdf} title="Download PDF">
                        <Download className="h-4 w-4 mr-2" />
                        PDF
                    </Button>
                    <Button variant="outline" onClick={() => setShowPreview(!showPreview)} className="hidden lg:flex">
                        {showPreview ? (
                            <>
                                <EyeOff className="h-4 w-4 mr-2" />
                                Hide Preview
                            </>
                        ) : (
                            <>
                                <Eye className="h-4 w-4 mr-2" />
                                Show Preview
                            </>
                        )}
                    </Button>
                    <div className="h-6 w-px bg-zinc-200 mx-2 hidden lg:block" />
                    <Button variant="outline" onClick={() => handleSave('pending')} disabled={isLoading}>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                    </Button>
                    <Button onClick={handleSendEmail} disabled={isLoading || isSending || !initialData?.id} title={!initialData?.id ? "Save first to send" : "Send Email"}>
                        <Mail className="h-4 w-4 mr-2" />
                        {isSending ? "Sending..." : "Send"}
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden bg-zinc-50">
                {/* Editor Pane */}
                <div className={`flex-1 overflow-y-auto p-8 transition-all duration-300 ${showPreview ? 'lg:max-w-[50%]' : 'w-full mx-auto'}`}>
                    <div className="space-y-8 pb-20">
                        {/* Invoice Details Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
                            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                <Settings className="h-5 w-5 text-zinc-400" />
                                Invoice Details
                            </h2>
                            <div className="grid gap-6">
                                <div className="space-y-2">
                                    <Label>Client</Label>
                                    <Select value={clientId} onValueChange={(val) => {
                                        setClientId(val)
                                        setProjectId("")
                                    }}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select client" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {clients.map(c => (
                                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Project</Label>
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
                                        <Label>Currency</Label>
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
                                        <Label>Invoice Number</Label>
                                        <Input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Issue Date</Label>
                                        <Input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Due Date</Label>
                                    <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                                </div>
                            </div>
                        </div>

                        {/* Settings / Branding Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
                            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                <Settings className="h-5 w-5 text-zinc-400" />
                                Branding & Settings
                            </h2>
                            <div className="grid gap-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Brand Color</Label>
                                        <div className="flex gap-2">
                                            <Input type="color" value={brandColor} onChange={(e) => setBrandColor(e.target.value)} className="w-12 p-1 h-10" />
                                            <Input value={brandColor} onChange={(e) => setBrandColor(e.target.value)} placeholder="#000000" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Tax Rate (%)</Label>
                                        <Input type="number" value={taxRate} onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Logo URL</Label>
                                        <Input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://..." />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Discount (%)</Label>
                                        <Input type="number" value={discountRate} onChange={(e) => setDiscountRate(parseFloat(e.target.value) || 0)} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Items Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
                            <h2 className="text-lg font-semibold mb-6">Items Details</h2>
                            <div className="space-y-4">
                                <div className="hidden md:grid grid-cols-12 gap-4 text-xs font-semibold text-zinc-500 uppercase px-2">
                                    <div className="col-span-6">Item</div>
                                    <div className="col-span-2 text-right">Qty</div>
                                    <div className="col-span-2 text-right">Rate</div>
                                    <div className="col-span-2 text-right">Total</div>
                                </div>

                                <div className="space-y-3">
                                    {items.map((item, index) => (
                                        <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start p-2 hover:bg-zinc-50 rounded-lg group transition-colors border border-transparent hover:border-zinc-100">
                                            <div className="col-span-6 space-y-2">
                                                <Input
                                                    placeholder="Item name"
                                                    value={item.description}
                                                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                                />
                                                <Input
                                                    className="text-xs text-zinc-500 h-8"
                                                    placeholder="Description (optional)"
                                                    value={item.details}
                                                    onChange={(e) => handleItemChange(index, 'details', e.target.value)}
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <Input
                                                    type="number"
                                                    className="text-right"
                                                    value={item.quantity}
                                                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <Input
                                                    type="number"
                                                    className="text-right"
                                                    value={item.rate}
                                                    onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                                                />
                                            </div>
                                            <div className="col-span-2 flex items-center gap-2">
                                                <div className="flex-1 text-right font-medium py-2">
                                                    {formatCurrency(item.amount, currency)}
                                                </div>
                                                <button
                                                    onClick={() => removeItem(index)}
                                                    className="text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <Button variant="outline" className="w-full mt-4 border-dashed" onClick={addItem}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Item
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
                                <h2 className="text-sm font-semibold text-zinc-500">Preview</h2>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <CalendarIcon className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="origin-top scale-[0.9]">
                                <div id="invoice-document" style={pdfStyles}>
                                    <InvoiceDocument
                                        invoice={previewInvoice}
                                        previewMode={true}
                                        brandColor={brandColor}
                                        logoUrl={logoUrl}
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
                clientName={clients.find(c => c.id === clientId)?.name || "Client"}
            />
        </div>
    )
}
