"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { PaymentStatus } from "@/lib/types/payment"
import { updatePaymentStatus } from "@/server/actions/payments"
import { Loader2, Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface InvoiceStatusControlsProps {
    invoiceId: string
    currentStatus: PaymentStatus
    onStatusChange?: (newStatus: PaymentStatus) => void
}

export function InvoiceStatusControls({ invoiceId, currentStatus, onStatusChange }: InvoiceStatusControlsProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    const statuses: { value: PaymentStatus; label: string; color: string }[] = [
        { value: 'pending', label: 'Mark as Pending', color: 'text-amber-600' },
        { value: 'paid', label: 'Mark as Paid', color: 'text-emerald-600' },
        { value: 'cancelled', label: 'Mark as Cancelled', color: 'text-red-600' },
        // 'partial' and 'overdue' are usually automatic, but we could allow manual override if needed.
        // For simplicity, let's stick to the main actionable ones.
    ]

    // Don't show options for the current status if you want to save space, 
    // but a dropdown usually shows everything.
    // Let's filter out current status from actions to avoid redundancy? 
    // Or just show checkmark.

    const handleStatusChange = async (status: PaymentStatus) => {
        if (status === currentStatus) return

        setIsLoading(true)
        try {
            await updatePaymentStatus(invoiceId, { status })

            if (onStatusChange) {
                onStatusChange(status)
            }

            router.refresh()
            setIsOpen(false)
        } catch (error) {
            console.error("Failed to update status:", error)
            alert("Failed to update status. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors shadow-sm disabled:opacity-50"
            >
                {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <span>Change Status</span>
                )}
                <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-zinc-100 py-1 z-20 animate-in fade-in zoom-in-95 duration-100">
                        {statuses.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => handleStatusChange(option.value)}
                                className="w-full text-left px-4 py-2.5 text-sm hover:bg-zinc-50 transition-colors flex items-center justify-between group"
                            >
                                <span className={cn(
                                    "font-medium",
                                    option.value === currentStatus ? "text-zinc-900" : "text-zinc-600 group-hover:text-zinc-900"
                                )}>
                                    {option.label}
                                </span>
                                {option.value === currentStatus && (
                                    <Check className="h-4 w-4 text-zinc-900" />
                                )}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
