'use client';

import { useState, useTransition } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { createReminderAction } from '@/server/actions/reminders';
import { ReminderType } from '@/lib/types/reminder';
import { Calendar as CalendarIcon, DollarSign, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
// import { toast } from 'sonner';

interface ReminderCreationModalProps {
    projectId?: string;
    clientId?: string;
    paymentId?: string;
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onSuccess?: () => void;
}

export function ReminderCreationModal({
    projectId,
    clientId,
    paymentId,
    trigger,
    open: controlledOpen,
    onOpenChange: setControlledOpen,
    onSuccess,
}: ReminderCreationModalProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    const setOpen = isControlled ? setControlledOpen : setInternalOpen;

    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [type, setType] = useState<ReminderType>('follow_up');
    const [date, setDate] = useState('');
    const [note, setNote] = useState('');

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!date) return;

        setError(null);

        startTransition(async () => {
            const title = type === 'payment' ? 'Payment Reminder' : 'Follow-up';

            const result = await createReminderAction({
                project_id: projectId,
                client_id: clientId,
                payment_id: paymentId,
                title,
                reminder_type: type,
                reminder_date: new Date(date).toISOString(),
                description: note,
            });

            if (result.success) {
                // toast.success('Reminder created');
                if (setOpen) setOpen(false);
                // Reset form
                setNote('');
                setDate('');
                setType('follow_up');
                onSuccess?.();
            } else {
                setError(result.error || 'Failed to create reminder');
            }
        });
    };

    const handleTypeSelect = (selectedType: ReminderType) => {
        setType(selectedType);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

            <DialogContent className="p-0 gap-0 sm:max-w-[440px] rounded-xl overflow-hidden bg-white border-zinc-100 shadow-xl">
                <div className="flex items-center justify-between p-6 pb-2">
                    <div>
                        <DialogTitle className="text-lg font-bold text-zinc-900">Create reminder</DialogTitle>
                        <p className="text-xs text-zinc-500 mt-1">Set a notification for this client.</p>
                    </div>
                    <DialogClose className="rounded-full p-1 hover:bg-zinc-100 transition-colors">
                        <X className="h-4 w-4 text-zinc-400" />
                    </DialogClose>
                </div>

                <div className="px-6 py-4 space-y-6">
                    {error && (
                        <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                            {error}
                        </div>
                    )}

                    {/* Reminder Type */}
                    <div className="space-y-3">
                        <Label className="text-xs font-semibold text-zinc-600">Reminder type</Label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => handleTypeSelect('follow_up')}
                                className={cn(
                                    "flex flex-col items-start p-3 rounded-lg border transition-all text-left",
                                    type === 'follow_up'
                                        ? "border-zinc-800 ring-1 ring-zinc-800 bg-white"
                                        : "border-zinc-200 hover:border-zinc-300 bg-white"
                                )}
                            >
                                <div className={cn(
                                    "mb-2 p-1 rounded-md",
                                    type === 'follow_up' ? "bg-blue-50 text-blue-600" : "bg-zinc-100 text-zinc-500"
                                )}>
                                    <CalendarIcon className="h-4 w-4" />
                                </div>
                                <span className="text-sm font-semibold text-zinc-900">Follow-up</span>
                                <span className="text-[10px] text-zinc-500">General check-in</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleTypeSelect('payment')}
                                className={cn(
                                    "flex flex-col items-start p-3 rounded-lg border transition-all text-left",
                                    type === 'payment'
                                        ? "border-zinc-800 ring-1 ring-zinc-800 bg-white"
                                        : "border-zinc-200 hover:border-zinc-300 bg-white"
                                )}
                            >
                                <div className={cn(
                                    "mb-2 p-1 rounded-md",
                                    type === 'payment' ? "bg-green-50 text-green-600" : "bg-zinc-100 text-zinc-500"
                                )}>
                                    <DollarSign className="h-4 w-4" />
                                </div>
                                <span className="text-sm font-semibold text-zinc-900">Payment</span>
                                <span className="text-[10px] text-zinc-500">Invoice due</span>
                            </button>
                        </div>
                    </div>

                    {/* Due Date */}
                    <div className="space-y-3">
                        <Label htmlFor="date" className="text-xs font-semibold text-zinc-600">Due date</Label>
                        <div className="relative">
                            <Input
                                id="date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="pl-10 bg-zinc-50 border-zinc-200 text-zinc-900 focus-visible:ring-zinc-900"
                                required
                            />
                            <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Optional Note */}
                    <div className="space-y-3">
                        <Label htmlFor="note" className="text-xs font-semibold text-zinc-600">Optional note</Label>
                        <Textarea
                            id="note"
                            placeholder="Add details about this reminder..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="resize-none h-24 bg-zinc-50 border-zinc-200 text-sm focus-visible:ring-zinc-900"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-white flex justify-end gap-3 mt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => { if (setOpen) setOpen(false); }}
                        disabled={isPending}
                        className="border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => handleSubmit()}
                        disabled={isPending || !date}
                        className="bg-zinc-900 text-white hover:bg-zinc-800"
                    >
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save reminder
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
