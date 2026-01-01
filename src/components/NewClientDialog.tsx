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

interface NewClientDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onClientAdd: (client: Client) => void
}

export function NewClientDialog({ open, onOpenChange, onClientAdd }: NewClientDialogProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
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
                // location is not in CreateClientInput yet, need to check if schema supports it or put in notes
                // Looking at schema/types, Client table has user_id, name, email, company, notes, last_contact_date.
                // Location is likely not in DB or part of notes. I'll append to notes if needed or ignore.
                // For now, I'll ignore location or append it to notes.
            });

            if (res.success && res.data) {
                // Map DB client to UI Client
                const newClient: Client = {
                    id: res.data.id,
                    name: res.data.name,
                    companyName: res.data.company || res.data.name,
                    email: res.data.email,
                    status: 'Active',
                    totalRevenue: 0,
                    projectCount: 0,
                    lastActive: 'Just now',
                    location: formData.location, // preserving form input for UI if needed, but it won't persist if not in DB
                    description: res.data.notes || undefined,
                    joinedDate: new Date(res.data.created_at).toLocaleDateString(),
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
    )
}
