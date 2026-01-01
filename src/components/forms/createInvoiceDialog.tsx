'use client';

import { useState, useEffect } from 'react';
import type { Payment, InvoiceLineItem } from '@/lib/types/payment';
import { formatCurrency } from '@/lib/types/payment';
import { generateInvoice } from '@/server/actions/payments';
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
import { Textarea } from '@/components/ui/textarea';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Plus, Trash2 } from 'lucide-react';

interface CreateInvoiceDialogProps {
    payment: Payment | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function CreateInvoiceDialog({ payment, open, onOpenChange, onSuccess }: CreateInvoiceDialogProps) {
    const [loading, setLoading] = useState(false);
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState('');
    const [items, setItems] = useState<InvoiceLineItem[]>([]);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (payment && open) {
            // Auto-generate invoice number (simple format: INV-YYYYMMDD-RANDOM)
            const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
            setInvoiceNumber(`INV-${dateStr}-${random}`);

            // Set dates
            if (payment.due_date) {
                setDueDate(payment.due_date);
            } else {
                // Default to +14 days
                const date = new Date();
                date.setDate(date.getDate() + 14);
                setDueDate(date.toISOString().split('T')[0]);
            }

            // Initialize line items from payment if none exist
            if (payment.line_items && payment.line_items.length > 0) {
                setItems(payment.line_items);
            } else {
                setItems([
                    {
                        description: payment.milestone_name || 'Payment Milestone',
                        quantity: 1,
                        rate: payment.amount,
                        amount: payment.amount,
                    },
                ]);
            }

            if (payment.notes) setNotes(payment.notes);
        }
    }, [payment, open]);

    const handleAddItem = () => {
        setItems([
            ...items,
            {
                description: '',
                quantity: 1,
                rate: 0,
                amount: 0,
            },
        ]);
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleItemChange = (index: number, field: keyof InvoiceLineItem, value: any) => {
        const newItems = [...items];
        const item = { ...newItems[index], [field]: value };

        // Recalculate amount if qty or rate changes
        if (field === 'quantity' || field === 'rate') {
            item.amount = (field === 'quantity' ? value : item.quantity) * (field === 'rate' ? value : item.rate);
        }

        newItems[index] = item;
        setItems(newItems);
    };

    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!payment) return;

        setLoading(true);

        try {
            await generateInvoice({
                payment_id: payment.id,
                invoice_number: invoiceNumber,
                issue_date: issueDate,
                due_date: dueDate,
                line_items: items,
                notes: notes,
            });

            onOpenChange(false);
            onSuccess();
        } catch (error) {
            console.error('Failed to generate invoice:', error);
            alert('Failed to generate invoice. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!payment) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Generate Invoice</DialogTitle>
                        <DialogDescription>
                            Create an invoice for payment milestone: {payment.milestone_name}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="invoice_number">Invoice Number</Label>
                                <Input
                                    id="invoice_number"
                                    value={invoiceNumber}
                                    onChange={(e) => setInvoiceNumber(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="issue_date">Issue Date</Label>
                                    <Input
                                        id="issue_date"
                                        type="date"
                                        value={issueDate}
                                        onChange={(e) => setIssueDate(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="due_date">Due Date</Label>
                                    <Input
                                        id="due_date"
                                        type="date"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-medium">Line Items</h3>
                            <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Item
                            </Button>
                        </div>

                        <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[40%]">Description</TableHead>
                                        <TableHead className="w-[15%]">Qty</TableHead>
                                        <TableHead className="w-[20%]">Rate</TableHead>
                                        <TableHead className="w-[20%]">Amount</TableHead>
                                        <TableHead className="w-[5%]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <Input
                                                    value={item.description}
                                                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                                    placeholder="Item description"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={item.rate}
                                                    onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-mono text-right">
                                                    {formatCurrency(item.amount, payment.currency)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleRemoveItem(index)}
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="flex justify-end">
                            <div className="w-[300px] space-y-2">
                                <div className="flex justify-between py-2 border-t border-b">
                                    <span className="font-bold">Total</span>
                                    <span className="font-bold text-lg">
                                        {formatCurrency(subtotal, payment.currency)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="notes">Notes / Payment Terms</Label>
                            <Textarea
                                id="notes"
                                placeholder="Thank you for your business..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={3}
                            />
                        </div>
                    </div>

                    <DialogFooter className="mt-8">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Generating...' : 'Generate Invoice'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
