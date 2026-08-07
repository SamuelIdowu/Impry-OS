'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { addTimelineEventAction } from '@/server/actions/timeline';

interface AddNoteModalProps {
    projectId: string;
    trigger?: React.ReactNode;
    onSuccess?: () => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function AddNoteModal({
    projectId,
    trigger,
    onSuccess,
    open: controlledOpen,
    onOpenChange: setControlledOpen,
}: AddNoteModalProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const isControlled = controlledOpen !== undefined;
    const show = isControlled ? controlledOpen : internalOpen;

    const handleOpenChange = (newOpen: boolean) => {
        if (!isControlled) {
            setInternalOpen(newOpen);
        }
        setControlledOpen?.(newOpen);
    };

    const handleClose = () => {
        handleOpenChange(false);
    };

    const [note, setNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!note.trim()) return;

        try {
            setIsSubmitting(true);
            const res = await addTimelineEventAction({
                project_id: projectId,
                event_type: 'note',
                title: 'Note',
                description: note,
                event_date: new Date().toISOString()
            });

            if (res.success) {
                // toast.success('Note added successfully');
                setNote('');
                handleClose();
                if (onSuccess) {
                    onSuccess();
                }
            } else {
                console.error(res.error || 'Failed to add note');
                // toast.error(res.error || 'Failed to add note');
            }
        } catch (error) {
            console.error('Failed to add note:', error);
            // toast.error('An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={show} onOpenChange={handleOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Note</DialogTitle>
                    <DialogDescription>
                        Add a quick note or update to the project timeline.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Textarea
                        id="note"
                        placeholder="Type your note here..."
                        className="col-span-3 min-h-[120px] resize-none"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting || !note.trim()}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Adding...
                            </>
                        ) : (
                            'Add Note'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
