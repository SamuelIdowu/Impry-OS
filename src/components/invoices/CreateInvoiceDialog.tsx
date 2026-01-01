"use client"

import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface CreateInvoiceDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onCreate: (invoice: any) => void
    clients: { id: string; name: string }[]
    projects: { id: string; name: string; clientId: string }[]
}

export function CreateInvoiceDialog({ open, onOpenChange, onCreate, clients, projects }: CreateInvoiceDialogProps) {
    const [clientId, setClientId] = useState("")
    const [projectId, setProjectId] = useState("")
    const [amount, setAmount] = useState("")
    const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0])
    const [dueDate, setDueDate] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    // Filter projects based on selected client
    const clientProjects = projects.filter(p => p.clientId === clientId)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        const invoiceData = {
            client_id: clientId,
            project_id: projectId === "none" ? undefined : projectId,
            amount: parseFloat(amount),
            currency: 'USD',
            status: 'pending',
            invoice_number: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
            due_date: dueDate,
            line_items: [],
            notes: ''
        }

        await onCreate(invoiceData) // onCreate now handles the async server call wrapper in parent

        setIsLoading(false)
        onOpenChange(false)
        // Reset form
        setClientId("")
        setProjectId("")
        setAmount("")
        setDueDate("")
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Invoice</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="client" className="text-right">
                            Client
                        </Label>
                        <div className="col-span-3">
                            <Select value={clientId} onValueChange={(val) => {
                                setClientId(val)
                                setProjectId("") // Reset project when client changes
                            }}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select client" />
                                </SelectTrigger>
                                <SelectContent>
                                    {clients.map(client => (
                                        <SelectItem key={client.id} value={client.id}>
                                            {client.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="project" className="text-right">
                            Project
                        </Label>
                        <div className="col-span-3">
                            <Select value={projectId} onValueChange={setProjectId} disabled={!clientId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select project (optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">_No Project_</SelectItem>
                                    {clientProjects.map(project => (
                                        <SelectItem key={project.id} value={project.id}>
                                            {project.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="amount" className="text-right">
                            Amount
                        </Label>
                        <div className="col-span-3">
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-zinc-500">$</span>
                                <Input
                                    id="amount"
                                    type="number"
                                    className="pl-7"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="issueDate" className="text-right">
                            Issued
                        </Label>
                        <Input
                            id="issueDate"
                            type="date"
                            className="col-span-3"
                            value={issueDate}
                            onChange={(e) => setIssueDate(e.target.value)}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="dueDate" className="text-right">
                            Due
                        </Label>
                        <Input
                            id="dueDate"
                            type="date"
                            className="col-span-3"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            required
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading || !clientId || !amount || !dueDate}>
                            {isLoading ? "Creating..." : "Create Invoice"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
