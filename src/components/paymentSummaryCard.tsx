'use client';

import { DollarSign, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';


interface PaymentData {
    id: string;
    amount: number;
    currency: string;
    status: string;
    due_date?: string | null;
    paid_date?: string | null;
}

interface PaymentSummaryCardProps {
    projectId: string;
    payments: PaymentData[];
    onViewInvoices?: () => void;
}

export function PaymentSummaryCard({ projectId, payments, onViewInvoices }: PaymentSummaryCardProps) {
    const totalExpected = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalPaid = payments
        .filter(p => p.status.toLowerCase() === 'paid')
        .reduce((sum, p) => sum + (p.amount || 0), 0);

    const summary = {
        totalExpected,
        totalPaid,
        remaining: totalExpected - totalPaid,
        currency: payments[0]?.currency || 'USD',
        paymentsCount: payments.length,
    };

    if (!summary || summary.totalExpected === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Payment Progress</CardTitle>
                    <CardDescription>Track project payments and invoices</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-center h-32 rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground">No payments added yet</p>
                    </div>
                    <Button variant="outline" className="w-full">
                        Add Payment
                    </Button>
                </CardContent>
            </Card>
        );
    }

    const percentagePaid = (summary.totalPaid / summary.totalExpected) * 100;

    return (
        <Card className="bg-white rounded-2xl border border-zinc-200 shadow-none h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 p-6">
                <CardTitle className="text-lg font-bold text-zinc-900">Payment Progress</CardTitle>
                <div className="h-5 w-5 text-zinc-400 cursor-pointer">
                    <ExternalLink className="h-5 w-5" />
                </div>
            </CardHeader>
            <CardContent className="p-6 pt-0 flex-1 flex flex-col">
                <div className="bg-zinc-50 rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <span className="text-green-600 font-bold">$</span>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-zinc-900">Contract Value</p>
                            <p className="text-xs text-zinc-500">Updated recently</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-3 mb-6 flex-1">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-zinc-500 font-medium">Collected</span>
                        <span className="text-zinc-900 font-bold">{summary.currency} {summary.totalPaid.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-zinc-500 font-medium">Remaining</span>
                        <span className="text-zinc-900 font-bold">{summary.currency} {summary.remaining.toLocaleString()}</span>
                    </div>
                </div>

                <Button
                    onClick={onViewInvoices}
                    className="w-full border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-900 text-sm font-semibold py-2.5 rounded-lg transition-colors h-auto shadow-none"
                >
                    View Invoices
                </Button>
            </CardContent>
        </Card>
    );
}
