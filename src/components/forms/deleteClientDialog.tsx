'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { deleteClient } from '@/lib/clients';

interface DeleteClientDialogProps {
    clientId: string;
    clientName: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function DeleteClientDialog({
    clientId,
    clientName,
    open,
    onOpenChange,
    onSuccess,
}: DeleteClientDialogProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleDelete = async () => {
        setLoading(true);
        setError('');
        try {
            await deleteClient(clientId);
            onOpenChange(false);
            onSuccess();
        } catch (err) {
            console.error('Failed to delete client:', err);
            setError('Failed to delete client. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Delete Client</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete <strong>{clientName}</strong>?
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <p className="text-sm text-muted-foreground">
                        This action cannot be undone. All associated projects and data will also be removed.
                    </p>
                    {error && (
                        <p className="text-sm text-destructive mt-3">{error}</p>
                    )}
                </div>
                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={loading}
                    >
                        {loading ? 'Deleting...' : 'Delete Client'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
