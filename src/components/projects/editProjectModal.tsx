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
import { updateProjectAction } from '@/server/actions/projects';
import { ProjectWithDetails, DatabaseProjectStatus } from '@/lib/types/project';
import { Loader2, X } from 'lucide-react';

interface EditProjectModalProps {
    project: ProjectWithDetails;
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onSuccess?: () => void;
}

const statusOptions: { value: DatabaseProjectStatus; label: string }[] = [
    { value: 'planning', label: 'Planning' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'review', label: 'Review' },
    { value: 'completed', label: 'Completed' },
    { value: 'on_hold', label: 'On Hold' },
    { value: 'cancelled', label: 'Cancelled' },
];

export function EditProjectModal({
    project,
    trigger,
    open: controlledOpen,
    onOpenChange: setControlledOpen,
    onSuccess,
}: EditProjectModalProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    const setOpen = isControlled ? setControlledOpen : setInternalOpen;

    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [name, setName] = useState(project.name);
    const [description, setDescription] = useState(project.description || '');
    const [status, setStatus] = useState<DatabaseProjectStatus>(project.status);
    const [progress, setProgress] = useState(project.progress || 0);
    const [startDate, setStartDate] = useState(project.start_date?.split('T')[0] || '');
    const [deadline, setDeadline] = useState(project.deadline?.split('T')[0] || '');
    const [budget, setBudget] = useState(project.budget?.toString() || '');
    const [currency, setCurrency] = useState(project.currency || 'USD');

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!name) return;

        setError(null);

        startTransition(async () => {
            const result = await updateProjectAction(project.id, {
                name,
                description: description || undefined,
                status,
                progress,
                start_date: startDate ? new Date(startDate).toISOString() : undefined,
                deadline: deadline ? new Date(deadline).toISOString() : undefined,
                budget: budget ? parseFloat(budget) : undefined,
                currency,
            });

            if (result.success) {
                if (setOpen) setOpen(false);
                onSuccess?.();
            } else {
                setError(result.error || 'Failed to update project');
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

            <DialogContent className="p-0 gap-0 sm:max-w-[500px] rounded-xl overflow-hidden bg-white border-zinc-100 shadow-xl max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-6 pb-2 shrink-0">
                    <div>
                        <DialogTitle className="text-lg font-bold text-zinc-900">Edit Project</DialogTitle>
                        <p className="text-xs text-zinc-500 mt-1">Update project details.</p>
                    </div>
                    <DialogClose className="rounded-full p-1 hover:bg-zinc-100 transition-colors">
                        <X className="h-4 w-4 text-zinc-400" />
                    </DialogClose>
                </div>

                <div className="px-6 py-4 space-y-4 overflow-y-auto">
                    {error && (
                        <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-xs font-semibold text-zinc-600">Project Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="status" className="text-xs font-semibold text-zinc-600">Status</Label>
                            <select
                                id="status"
                                value={status}
                                onChange={(e) => setStatus(e.target.value as DatabaseProjectStatus)}
                                className="flex h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950"
                            >
                                {statusOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="currency" className="text-xs font-semibold text-zinc-600">Currency</Label>
                            <Input
                                id="currency"
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                placeholder="USD"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="progress" className="text-xs font-semibold text-zinc-600">Progress: {progress}%</Label>
                        <input
                            id="progress"
                            type="range"
                            min="0"
                            max="100"
                            value={progress}
                            onChange={(e) => setProgress(Number(e.target.value))}
                            className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-900"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="budget" className="text-xs font-semibold text-zinc-600">Budget</Label>
                        <Input
                            id="budget"
                            type="number"
                            value={budget}
                            onChange={(e) => setBudget(e.target.value)}
                            placeholder="0.00"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="start_date" className="text-xs font-semibold text-zinc-600">Start Date</Label>
                            <Input
                                id="start_date"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="deadline" className="text-xs font-semibold text-zinc-600">Deadline</Label>
                            <Input
                                id="deadline"
                                type="date"
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-xs font-semibold text-zinc-600">Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="h-24 resize-none"
                        />
                    </div>
                </div>

                <div className="p-4 bg-white flex justify-end gap-3 mt-auto shrink-0 border-t border-zinc-100">
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
                        disabled={isPending || !name}
                        className="bg-zinc-900 text-white hover:bg-zinc-800"
                    >
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
