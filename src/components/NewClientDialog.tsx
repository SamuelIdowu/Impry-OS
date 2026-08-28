"use client"

import React, { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Client } from "@/lib/types"
import { createClientAction } from "@/server/actions/clients"
import { UpgradeModal } from "@/components/billing/UpgradeModal"

interface NewClientDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onClientAdd: (client: Client) => void
}

export function NewClientDialog({ open, onOpenChange, onClientAdd }: NewClientDialogProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [showUpgradeModal, setShowUpgradeModal] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        companyName: "",
        email: "",
        location: "",
        description: ""
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            const res = await createClientAction({
                name: formData.name,
                company: formData.companyName,
                email: formData.email,
                notes: formData.description
            });

            if (res.success && res.data) {
                // Map DB client to UI Client
                const newClient: Client = {
                    id: res.data.id,
                    name: res.data.name,
                    companyName: res.data.company || res.data.name,
                    email: res.data.email || "",
                    status: 'Active',
                    totalRevenue: 0,
                    projectCount: 0,
                    lastActive: 'Just now',
                    location: formData.location, 
                    description: res.data.notes || undefined,
                    joinedDate: res.data.createdAt ? new Date(res.data.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
                    avatar: res.data.name.substring(0, 2).toUpperCase()
                };

                onClientAdd(newClient)
                onOpenChange(false)

                // Reset form
                setFormData({
                    name: "",
                    companyName: "",
                    email: "",
                    location: "",
                    description: ""
                })
            } else if ((res as any).requiresUpgrade) {
                onOpenChange(false)
                setShowUpgradeModal(true)
            } else {
                setError(res.error || "Failed to create client")
            }
        } catch (err) {
            console.error("Error creating client:", err)
            setError("An unexpected error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                title="Client Limit Reached"
                description="Your Free Starter workspace plan is capped at 3 active clients. Upgrade to Pro for unlimited clients."
                limitName="Active Clients"
                currentCount={3}
                maxAllowed={3}
            />

            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Add New Client</DialogTitle>
                        <DialogDescription>
                            Enter the details for your new client. They will be added to your active list.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        {error && (
                            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md">
                                {error}
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Client Name</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g. John Doe"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="company">Company</Label>
                                <Input
                                    id="company"
                                    placeholder="e.g. Acme Inc"
                                    value={formData.companyName}
                                    onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="john@example.com"
                                required
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input
                                id="location"
                                placeholder="e.g. San Francisco, CA"
                                value={formData.location}
                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description / Notes</Label>
                            <Textarea
                                id="description"
                                placeholder="Brief description of the client or relationship..."
                                className="resize-none h-24"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <DialogFooter className="pt-2">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading} className="bg-zinc-900 text-white hover:bg-zinc-800">
                                {isLoading ? "Adding..." : "Add Client"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}
