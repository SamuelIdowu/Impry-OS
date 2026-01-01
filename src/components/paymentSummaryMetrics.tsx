'use client';

import { formatCurrency, calculatePercentagePaid } from '@/lib/types/payment';
import type { PaymentSummary } from '@/lib/types/payment';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, TrendingUp, AlertCircle } from 'lucide-react';

interface PaymentSummaryMetricsProps {
    summary: PaymentSummary;
}

export function PaymentSummaryMetrics({ summary }: PaymentSummaryMetricsProps) {
    const percentagePaid = calculatePercentagePaid(summary.totalExpected, summary.totalPaid);
    const isOnTrack = percentagePaid >= 33 && summary.overdueCount === 0;

    return (
        <>
            {/* Total Project Value */}
            <Card>
                <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                        <span className="text-sm font-medium text-muted-foreground">
                            Total Project Value
                        </span>
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                            <DollarSign className="h-5 w-5 text-muted-foreground" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-3xl font-bold tracking-tight">
                            {formatCurrency(summary.totalExpected, summary.currency)}
                        </p>
                        <p className="text-xs font-medium text-muted-foreground">
                            Contract Value
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Amount Paid */}
            <Card className="relative overflow-hidden">
                <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                        <span className="text-sm font-medium text-muted-foreground">
                            Amount Paid
                        </span>
                        <div className="h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center">
                            <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <p className="text-3xl font-bold tracking-tight">
                                {formatCurrency(summary.totalPaid, summary.currency)}
                            </p>
                            {percentagePaid > 0 && (
                                <span className="bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-bold px-2 py-0.5 rounded-full">
                                    {percentagePaid}%
                                </span>
                            )}
                        </div>
                        {isOnTrack ? (
                            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                On track
                            </p>
                        ) : summary.overdueCount > 0 ? (
                            <p className="text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {summary.overdueCount} overdue
                            </p>
                        ) : (
                            <p className="text-xs font-medium text-muted-foreground">
                                {summary.paidCount} of {summary.paymentsCount} paid
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Outstanding Balance */}
            <Card>
                <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                        <span className="text-sm font-medium text-muted-foreground">
                            Outstanding Balance
                        </span>
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                            <AlertCircle className="h-5 w-5 text-muted-foreground" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-3xl font-bold tracking-tight">
                            {formatCurrency(summary.remaining, summary.currency)}
                        </p>
                        <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                            {summary.pendingCount + summary.partialCount} milestone{summary.pendingCount + summary.partialCount !== 1 ? 's' : ''} remaining
                        </p>
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
