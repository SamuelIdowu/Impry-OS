"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Mail } from "lucide-react"

interface ClientEmailDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: (email: string, saveToProfile: boolean) => Promise<void>
    clientName: string
}

export function ClientEmailDialog({
    isOpen,
    onClose,
    onConfirm,
    clientName,
}: ClientEmailDialogProps) {
    const [email, setEmail] = useState("")
    const [saveToProfile, setSaveToProfile] = useState(true)
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) return

        setIsLoading(true)
        try {
            await onConfirm(email, saveToProfile)
            onClose()
        } catch (error) {
            console.error("Failed to confirm email:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Client Email</DialogTitle>
                    <DialogDescription>
                        {clientName} does not have an email address stored. Please provide one to send the invoice.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="client@company.com"
                            required
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="save"
                            checked={saveToProfile}
                            onCheckedChange={(checked) => setSaveToProfile(checked as boolean)}
                        />
                        <Label htmlFor="save" className="text-sm font-normal cursor-pointer">
                            Save to client profile for future use
                        </Label>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading || !email}>
                            <Mail className="mr-2 h-4 w-4" />
                            {isLoading ? "Sending..." : "Continue & Send"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
