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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { updateClientAction } from '@/server/actions/clients';
import type { Client, UpdateClientInput } from '@/lib/types/client';

interface EditClientDialogProps {
    client: Client;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    onSubmit?: (id: string, data: UpdateClientInput) => Promise<void>;
}

export function EditClientDialog({ client, open, onOpenChange, onSuccess, onSubmit }: EditClientDialogProps) {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState<UpdateClientInput>({
        name: client.name,
        email: client.email,
        company: client.company || '',
        notes: client.notes || '',
    });

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name?.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.email?.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            if (onSubmit) {
                await onSubmit(client.id, formData);
            } else {
                const res = await updateClientAction(client.id, formData);
                if (!res.success) {
                    throw new Error(res.error || 'Failed to update client');
                }
            }
            setErrors({});
            onOpenChange(false);
            onSuccess();
        } catch (error) {
            console.error('Failed to update client:', error);
            setErrors({ submit: 'Failed to update client. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Edit Client</DialogTitle>
                        <DialogDescription>
                            Update client information and contact details.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">
                                Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="John Doe"
                                className={errors.name ? 'border-destructive' : ''}
                            />
                            {errors.name && (
                                <p className="text-sm text-destructive">{errors.name}</p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-email">
                                Email <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="edit-email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="john@example.com"
                                className={errors.email ? 'border-destructive' : ''}
                            />
                            {errors.email && (
                                <p className="text-sm text-destructive">{errors.email}</p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-company">Company</Label>
                            <Input
                                id="edit-company"
                                value={formData.company}
                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                placeholder="Acme Inc."
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-notes">Notes</Label>
                            <Textarea
                                id="edit-notes"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Add notes about this client..."
                                rows={3}
                            />
                        </div>
                        {errors.submit && (
                            <p className="text-sm text-destructive">{errors.submit}</p>
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
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
