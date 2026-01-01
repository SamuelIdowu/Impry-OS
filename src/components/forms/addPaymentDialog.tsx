'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createPayment } from '@/server/actions/payments';

interface AddPaymentDialogProps {
    projectId: string;
    onPaymentAdded: () => void;
    trigger?: React.ReactNode;
}

export function AddPaymentDialog({ projectId, onPaymentAdded, trigger }: AddPaymentDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        milestone_name: '',
        amount: '',
        due_date: '',
        description: '',
        currency: 'USD',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await createPayment({
                project_id: projectId,
                milestone_name: formData.milestone_name,
                amount: parseFloat(formData.amount),
                due_date: formData.due_date || undefined,
                description: formData.description || undefined,
                currency: formData.currency,
            });

            // Reset form
            setFormData({
                milestone_name: '',
                amount: '',
                due_date: '',
                description: '',
                currency: 'USD',
            });
            setOpen(false);
            onPaymentAdded();
        } catch (error) {
            console.error('Failed to create payment:', error);
            alert('Failed to create payment. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Payment
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Add Payment Milestone</DialogTitle>
                        <DialogDescription>
                            Create a new payment milestone for tracking project revenue.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="milestone_name">
                                Milestone Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="milestone_name"
                                placeholder="e.g., Initial Deposit, Design Phase"
                                value={formData.milestone_name}
                                onChange={(e) =>
                                    setFormData({ ...formData, milestone_name: e.target.value })
                                }
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="amount">
                                    Amount <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="5000.00"
                                    value={formData.amount}
                                    onChange={(e) =>
                                        setFormData({ ...formData, amount: e.target.value })
                                    }
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="currency">Currency</Label>
                                <Input
                                    id="currency"
                                    placeholder="USD"
                                    value={formData.currency}
                                    onChange={(e) =>
                                        setFormData({ ...formData, currency: e.target.value })
                                    }
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="due_date">Due Date</Label>
                            <Input
                                id="due_date"
                                type="date"
                                value={formData.due_date}
                                onChange={(e) =>
                                    setFormData({ ...formData, due_date: e.target.value })
                                }
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Optional notes about this payment milestone"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Payment'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
