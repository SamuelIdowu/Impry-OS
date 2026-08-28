'use client'

import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import type { CalendarEvent } from '@/lib/calendar'
import { Badge } from '@/components/ui/badge'

interface EventDialogProps {
    event: CalendarEvent | null
    isOpen: boolean
    onClose: () => void
}

export function EventDialog({ event, isOpen, onClose }: EventDialogProps) {
    if (!event) return null

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'paid':
            case 'completed':
                return 'bg-emerald-50 text-emerald-700'
            case 'pending':
            case 'in_progress':
                return 'bg-amber-50 text-amber-700'
            case 'overdue':
            case 'cancelled':
                return 'bg-red-50 text-red-700'
            default:
                return 'bg-zinc-100 text-zinc-700'
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs uppercase tracking-wider font-semibold text-zinc-500">
                            {event.type.replace('_', ' ')}
                        </span>
                        {event.status && (
                            <Badge variant="secondary" className={getStatusColor(event.status)}>
                                {event.status}
                            </Badge>
                        )}
                    </div>
                    <DialogTitle>{event.title}</DialogTitle>
                    <DialogDescription>
                        {format(new Date(event.date), 'PPPP')}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {event.description && (
                        <div className="text-sm text-zinc-600">
                            {event.description}
                        </div>
                    )}

                    {event.amount && (
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <span>Amount:</span>
                            <span className="text-zinc-900">
                                {new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: event.currency || 'USD'
                                }).format(event.amount)}
                            </span>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button onClick={onClose}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
