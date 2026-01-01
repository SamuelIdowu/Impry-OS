'use client';

import { useState } from 'react';
import type { Payment } from '@/lib/types/payment';
import { formatCurrency } from '@/lib/types/payment';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updatePaymentStatus } from '@/server/actions/payments';

interface MarkPaidDialogProps {
    payment: Payment | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function MarkPaidDialog({ payment, open, onOpenChange, onSuccess }: MarkPaidDialogProps) {
    const [loading, setLoading] = useState(false);
    const [paymentType, setPaymentType] = useState<'full' | 'partial'>('full');
    const [partialAmount, setPartialAmount] = useState('');
    const [paidDate, setPaidDate] = useState(new Date().toISOString().split('T')[0]);

    if (!payment) return null;

    const remainingAmount = payment.amount - payment.amount_paid;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const amountPaid = paymentType === 'full'
                ? payment.amount
                : payment.amount_paid + parseFloat(partialAmount);

            const status = amountPaid >= payment.amount ? 'paid' : 'partial';

            await updatePaymentStatus(payment.id, {
                status,
                amount_paid: amountPaid,
                paid_date: paidDate,
            });

            onOpenChange(false);
            onSuccess();
            // Reset form
            setPaymentType('full');
            setPartialAmount('');
            setPaidDate(new Date().toISOString().split('T')[0]);
        } catch (error) {
            console.error('Failed to update payment:', error);
            alert('Failed to update payment status. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Mark Payment</DialogTitle>
                        <DialogDescription>
                            Update payment status for: {payment.milestone_name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Total Amount:</span>
                                <span className="font-semibold">
                                    {formatCurrency(payment.amount, payment.currency)}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Already Paid:</span>
                                <span className="font-semibold">
                                    {formatCurrency(payment.amount_paid, payment.currency)}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm border-t border-border pt-2">
                                <span className="text-muted-foreground">Remaining:</span>
                                <span className="font-bold">
                                    {formatCurrency(remainingAmount, payment.currency)}
                                </span>
                            </div>
                        </div>

                        <div className="grid gap-3">
                            <Label>Payment Type</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    type="button"
                                    variant={paymentType === 'full' ? 'default' : 'outline'}
                                    onClick={() => setPaymentType('full')}
                                    className="w-full"
                                >
                                    Full Payment
                                </Button>
                                <Button
                                    type="button"
                                    variant={paymentType === 'partial' ? 'default' : 'outline'}
                                    onClick={() => setPaymentType('partial')}
                                    className="w-full"
                                >
                                    Partial Payment
                                </Button>
                            </div>
                        </div>

                        {paymentType === 'partial' && (
                            <div className="grid gap-2">
                                <Label htmlFor="partial_amount">
                                    Payment Amount <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="partial_amount"
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    max={remainingAmount}
                                    placeholder={`Max: ${remainingAmount.toFixed(2)}`}
                                    value={partialAmount}
                                    onChange={(e) => setPartialAmount(e.target.value)}
                                    required={paymentType === 'partial'}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Enter the amount received for this payment
                                </p>
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label htmlFor="paid_date">Payment Date</Label>
                            <Input
                                id="paid_date"
                                type="date"
                                value={paidDate}
                                onChange={(e) => setPaidDate(e.target.value)}
                                max={new Date().toISOString().split('T')[0]}
                            />
                        </div>
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
                            {loading ? 'Updating...' : 'Update Payment'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
