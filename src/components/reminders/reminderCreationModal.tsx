'use client';

import { useState, useEffect, useTransition } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createReminderAction } from '@/server/actions/reminders';
import { fetchClients } from '@/server/actions/clients';
import { fetchProjects } from '@/server/actions/projects';
import { ReminderType } from '@/lib/types/reminder';
import { Calendar as CalendarIcon, DollarSign, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReminderCreationModalProps {
    projectId?: string;
    clientId?: string;
    paymentId?: string;
    clients?: { id: string; name: string }[];
    projects?: { id: string; name: string; clientId: string }[];
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onSuccess?: () => void;
    defaultDate?: string;
}

export function ReminderCreationModal({
    projectId: propProjectId,
    clientId: propClientId,
    paymentId,
    clients: propClients = [],
    projects: propProjects = [],
    trigger,
    open: controlledOpen,
    onOpenChange: setControlledOpen,
    onSuccess,
    defaultDate,
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
    const [selectedClientId, setSelectedClientId] = useState(propClientId || '');
    const [selectedProjectId, setSelectedProjectId] = useState(propProjectId || '');

    const [availableClients, setAvailableClients] = useState(propClients);
    const [availableProjects, setAvailableProjects] = useState(propProjects);

    // Sync props
    useEffect(() => {
        if (propClientId) setSelectedClientId(propClientId);
        if (propProjectId) setSelectedProjectId(propProjectId);
    }, [propClientId, propProjectId]);

    useEffect(() => {
        if (propClients.length > 0) setAvailableClients(propClients);
        if (propProjects.length > 0) setAvailableProjects(propProjects);
    }, [propClients, propProjects]);

    // Fetch clients & projects if not provided and dialog is opened
    useEffect(() => {
        if (open && availableClients.length === 0) {
            fetchClients().then(res => {
                if (res.success && res.data) {
                    setAvailableClients(res.data.map(c => ({ id: c.id, name: c.name })));
                }
            });
            fetchProjects().then(res => {
                if (res.success && res.data) {
                    setAvailableProjects(res.data.map(p => ({ id: p.id, name: p.name, clientId: p.clientId || '' })));
                }
            });
        }
    }, [open, availableClients.length]);

    // Pre-fill date when defaultDate prop changes
    useEffect(() => {
        if (defaultDate && open) {
            setDate(defaultDate);
        }
    }, [defaultDate, open]);

    const filteredProjects = availableProjects.filter(p => !selectedClientId || p.clientId === selectedClientId);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!date) return;

        setError(null);

        startTransition(async () => {
            const title = type === 'payment' ? 'Payment Reminder' : 'Follow-up';

            const result = await createReminderAction({
                projectId: selectedProjectId || propProjectId || undefined,
                clientId: selectedClientId || propClientId || undefined,
                paymentId: paymentId || undefined,
                title,
                reminderType: type,
                reminderDate: new Date(date).toISOString(),
                description: note,
            });

            if (result.success) {
                if (setOpen) setOpen(false);
                setNote('');
                setDate('');
                setType('follow_up');
                if (!propClientId) setSelectedClientId('');
                if (!propProjectId) setSelectedProjectId('');
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

            <DialogContent className="p-0 gap-0 sm:max-w-[460px] rounded-xl overflow-hidden bg-white border-zinc-100 shadow-xl">
                <div className="p-6 pb-3 border-b border-zinc-100">
                    <DialogTitle className="text-lg font-bold text-zinc-900">Create reminder</DialogTitle>
                    <p className="text-xs text-zinc-500 mt-1">Set a notification or follow-up deadline.</p>
                </div>

                <div className="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
                    {error && (
                        <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                            {error}
                        </div>
                    )}

                    {/* Client & Project Selectors if not preset */}
                    {!propClientId && availableClients.length > 0 && (
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-zinc-700">Client</Label>
                            <Select
                                value={selectedClientId}
                                onValueChange={(val) => {
                                    setSelectedClientId(val);
                                    setSelectedProjectId('');
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select client " />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No Client</SelectItem>
                                    {availableClients.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {!propProjectId && filteredProjects.length > 0 && (
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-zinc-700">Project </Label>
                            <Select
                                value={selectedProjectId}
                                onValueChange={setSelectedProjectId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select project" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No Project</SelectItem>
                                    {filteredProjects.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Reminder Type */}
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold text-zinc-700">Reminder type</Label>
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
                    <div className="space-y-2">
                        <Label htmlFor="date" className="text-xs font-semibold text-zinc-700">Due date</Label>
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
                    <div className="space-y-2">
                        <Label htmlFor="note" className="text-xs font-semibold text-zinc-700">Optional note</Label>
                        <Textarea
                            id="note"
                            placeholder="Add details about this reminder..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="resize-none h-20 bg-zinc-50 border-zinc-200 text-sm focus-visible:ring-zinc-900"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex justify-end gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => { if (setOpen) setOpen(false); }}
                        disabled={isPending}
                        className="border-zinc-200 text-zinc-700 hover:bg-zinc-100"
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
