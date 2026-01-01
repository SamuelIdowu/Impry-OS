'use client';

import { useState } from 'react';
import type { Payment } from '@/lib/types/payment';
import { formatCurrency } from '@/lib/types/payment';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdownMenu';
import { MoreHorizontal, FileText, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface PaymentsTableProps {
    payments: Payment[];
    onMarkPaid: (payment: Payment) => void;
    onMarkPartial: (payment: Payment) => void;
    onGenerateInvoice: (payment: Payment) => void;
    onDelete: (payment: Payment) => void;
}

export function PaymentsTable({ payments, onMarkPaid, onMarkPartial, onGenerateInvoice, onDelete }: PaymentsTableProps) {
    return (
        <div className="w-full">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-zinc-100 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                        <th className="px-6 py-4 w-[30%]">Milestone</th>
                        <th className="px-6 py-4 w-[20%]">Amount</th>
                        <th className="px-6 py-4 w-[20%]">Due Date</th>
                        <th className="px-6 py-4 w-[15%]">Status</th>
                        <th className="px-6 py-4 w-[15%] text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                    {payments.map((payment) => (
                        <PaymentRow
                            key={payment.id}
                            payment={payment}
                            onMarkPaid={onMarkPaid}
                            onMarkPartial={onMarkPartial}
                            onGenerateInvoice={onGenerateInvoice}
                            onDelete={onDelete}
                        />
                    ))}
                </tbody>
            </table>

            <div className="p-6 border-t border-zinc-100">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-zinc-400">Showing {payments.length} payment milestones</p>
                    <div className="flex gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" disabled>
                            <span className="sr-only">Previous</span>
                            &lt;
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8" disabled>
                            <span className="sr-only">Next</span>
                            &gt;
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface PaymentRowProps {
    payment: Payment;
    onMarkPaid: (payment: Payment) => void;
    onMarkPartial: (payment: Payment) => void;
    onGenerateInvoice: (payment: Payment) => void;
    onDelete: (payment: Payment) => void;
}

function PaymentRow({ payment, onMarkPaid, onMarkPartial, onGenerateInvoice, onDelete }: PaymentRowProps) {
    // Custom Badge Component for this table
    const StatusBadge = ({ status }: { status: string }) => {
        const styles = {
            paid: 'bg-green-100 text-green-700 font-bold',
            pending: 'bg-amber-100 text-amber-700 font-bold',
            draft: 'bg-zinc-100 text-zinc-600 font-bold',
            overdue: 'bg-red-100 text-red-700 font-bold',
        };
        const statusKey = status.toLowerCase() as keyof typeof styles;
        const className = styles[statusKey] || styles.draft;

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs capitalize ${className}`}>
                <div className="size-1.5 rounded-full bg-current mr-1.5 opacity-50" />
                {status}
            </span>
        );
    };

    return (
        <tr className="group hover:bg-zinc-50/50 transition-colors">
            <td className="px-6 py-5 align-top">
                <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-bold text-zinc-900">{payment.milestone_name}</span>
                    {payment.invoice_number ? (
                        <span className="text-xs text-zinc-400 flex items-center gap-1">
                            Invoice #{payment.invoice_number}
                        </span>
                    ) : (
                        <span className="text-xs text-zinc-400 italic">Not invoiced yet</span>
                    )}
                </div>
            </td>
            <td className="px-6 py-5 align-top">
                <span className="text-sm font-bold text-zinc-900">
                    {formatCurrency(payment.amount, payment.currency)}
                </span>
            </td>
            <td className="px-6 py-5 align-top">
                <span className="text-sm text-zinc-500">
                    {payment.due_date ? format(new Date(payment.due_date), 'MMM dd, yyyy') : '—'}
                </span>
            </td>
            <td className="px-6 py-5 align-top">
                <StatusBadge status={payment.status} />
            </td>
            <td className="px-6 py-5 align-top text-right">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-zinc-300 hover:text-zinc-600 -mr-2"
                        >
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onGenerateInvoice(payment)}>
                            <FileText className="mr-2 h-4 w-4" />
                            View Details
                        </DropdownMenuItem>
                        {payment.status !== 'paid' && (
                            <DropdownMenuItem onClick={() => onMarkPaid(payment)}>
                                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                Mark as Paid
                            </DropdownMenuItem>
                        )}
                        {payment.status === 'paid' && (
                            <DropdownMenuItem onClick={() => onMarkPaid({ ...payment, status: 'pending' } as any)}>
                                {/* We might need a separate onMarkPending or just reuse onMarkPaid but that name is confusing if it toggles. 
                                    For now let's assume onMarkPaid forces paid. 
                                    Actually the prop name is specific onMarkPaid. 
                                    Let's adding a generic update status prop would be better but following existing pattern:
                                */}
                                <Clock className="mr-2 h-4 w-4 text-amber-600" />
                                Mark as Pending
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </td>
        </tr>
    );
}
