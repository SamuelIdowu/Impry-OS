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
    Calendar as CalendarIcon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { InvoiceDocument } from "@/components/invoices/InvoiceDocument"
import { createStandaloneInvoice, updateStandaloneInvoice } from "@/server/actions/payments"
import { formatCurrency } from "@/lib/types/payment"

interface InvoiceEditorProps {
    clients: { id: string; name: string }[]
    projects: { id: string; name: string; clientId: string }[]
    initialData?: any
}

export function InvoiceEditor({ clients, projects, initialData }: InvoiceEditorProps) {
    const router = useRouter()
    const [showPreview, setShowPreview] = useState(true)
    const [isLoading, setIsLoading] = useState(false)

    // Form State
    const [clientId, setClientId] = useState(initialData?.client_id || "")
    const [projectId, setProjectId] = useState(initialData?.project_id || "")
    const [invoiceNumber, setInvoiceNumber] = useState(initialData?.invoice_number || "")
    const [issueDate, setIssueDate] = useState(initialData?.issue_date || new Date().toISOString().split('T')[0])
    const [dueDate, setDueDate] = useState(initialData?.due_date || "")
    const [notes, setNotes] = useState(initialData?.notes || "")

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
        return items.reduce((sum, item) => sum + (item.amount || 0), 0)
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
                currency: 'USD',
                status: status, // This will be 'pending' as 'draft' is not yet supported in DB
                line_items: items,
                notes: notes
            }

            if (initialData?.id) {
                await updateStandaloneInvoice(initialData.id, invoiceData)
            } else {
                await createStandaloneInvoice(invoiceData)
            }
            router.push('/invoices')
            router.refresh()
        } catch (error) {
            console.error(error)
            alert("Failed to save invoice")
            setIsLoading(false) // Only stop loading on error, as success navigates away
        }
        // We do not set loading false on success to prevent flashes before navigation
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
                    <Button
                        variant="outline"
                        onClick={() => setShowPreview(!showPreview)}
                        className="hidden lg:flex"
                    >
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
                        Save as Draft
                    </Button>
                    <Button onClick={() => handleSave('pending')} disabled={isLoading}>
                        <Send className="h-4 w-4 mr-2" />
                        Send Invoice
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
                            <h2 className="text-lg font-semibold mb-6">Invoice Details</h2>
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

                                <div className="space-y-2">
                                    <Label>Address</Label>
                                    <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-md text-sm text-zinc-500 h-[80px]">
                                        {clientId ? "123 Client St, City, Country (Placeholder)" : "Select a client to see address"}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Invoice Number</Label>
                                        <Input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Currency</Label>
                                        <Select value="USD">
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="USD">US Dollar ($)</SelectItem>
                                                <SelectItem value="EUR">Euro (€)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Issued Date</Label>
                                        <Input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Due Date</Label>
                                        <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
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
                                                    {formatCurrency(item.amount, 'USD')}
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
                                    {/* Additional preview controls can go here */}
                                </div>
                            </div>
                            <div className="origin-top scale-[0.9]">
                                <InvoiceDocument invoice={previewInvoice} previewMode={true} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
