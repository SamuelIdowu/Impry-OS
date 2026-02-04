'use client';

import { useState } from 'react';
import type { Payment } from '@/lib/types/payment';
import { PaymentsTable } from './paymentsTable';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { formatCurrency } from '@/lib/types/payment';

import { useRouter } from 'next/navigation';
import { AddPaymentDialog } from '@/components/forms/addPaymentDialog';
import { updatePaymentStatus } from '@/server/actions/payments';
import { sendInvoiceEmailAction } from '@/server/actions/email';
// import { toast } from 'sonner';

interface PaymentsTabProps {
    projectId: string;
    payments?: any[]; // TODO: Use proper Payment type from DB
    totalValue: number;
    paidAmount: number;
}

export function PaymentsTab({ projectId, payments = [], totalValue, paidAmount }: PaymentsTabProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Calculate Summary Metrics
    const totalContractValue = totalValue;
    const collectedAmount = paidAmount;
    const outstandingAmount = totalContractValue - collectedAmount;
    const progressPercentage = totalContractValue > 0 ? Math.round((collectedAmount / totalContractValue) * 100) : 0;

    // Map DB payments to UI Payment format if needed
    // Assuming the passed payments are already close enough or we map them here
    // for now let's map what we have from ProjectWithDetails
    const mappedPayments: Payment[] = payments.map(p => ({
        id: p.id,
        project_id: projectId,
        milestone_name: p.description || 'Payment',
        amount: p.amount,
        currency: p.currency,
        status: p.status as any,
        due_date: p.due_date || '',
        amount_paid: p.status === 'paid' ? p.amount : 0,
        invoice_id: p.id, // Using payment ID as invoice ID for now
        invoice_number: p.id.substring(0, 8).toUpperCase(),
        description: p.description || 'Payment',
        user_id: '',
        client_id: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }));

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Contract Value */}
                <Card className="p-6 rounded-2xl shadow-sm border-zinc-200">
                    <p className="text-sm font-medium text-zinc-500 mb-2">Total Contract Value</p>
                    <p className="text-3xl font-bold text-zinc-900 tracking-tight">
                        {formatCurrency(totalContractValue)}
                    </p>
                </Card>

                {/* Collected Amount */}
                <Card className="p-6 rounded-2xl shadow-sm border-zinc-200 relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-sm font-medium text-zinc-500 mb-2">Collected Amount</p>
                        <div className="flex items-center gap-3">
                            <p className="text-3xl font-bold text-zinc-900 tracking-tight">
                                {formatCurrency(collectedAmount)}
                            </p>
                            <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-md">
                                {progressPercentage}%
                            </span>
                        </div>
                    </div>
                    {/* Progress Bar at bottom */}
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-zinc-100">
                        <div
                            className="h-full bg-emerald-500 transition-all duration-1000"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                </Card>

                {/* Outstanding Amount */}
                <Card className="p-6 rounded-2xl shadow-sm border-zinc-200">
                    <p className="text-sm font-medium text-zinc-500 mb-2">Outstanding Amount</p>
                    <p className="text-3xl font-bold text-zinc-900 tracking-tight">
                        {formatCurrency(outstandingAmount)}
                    </p>
                </Card>
            </div>

            {/* Payment Milestones Section */}
            <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
                <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100">
                    <div>
                        <h3 className="text-lg font-bold text-zinc-900">Payment Milestones</h3>
                        <p className="text-sm text-zinc-500 mt-1">Manage milestones, invoices, and payment status.</p>
                    </div>
                    <AddPaymentDialog
                        projectId={projectId}
                        onPaymentAdded={() => router.refresh()}
                        trigger={
                            <Button className="bg-zinc-900 hover:bg-zinc-800 text-white gap-2 rounded-lg">
                                <Plus className="size-4" />
                                Add payment
                            </Button>
                        }
                    />
                </div>

                <div className="p-0">
                    <PaymentsTable
                        payments={mappedPayments}
                        onMarkPaid={async (payment) => {
                            try {
                                setLoading(true);
                                // The payment object passed here contains the TARGET status
                                // based on the UI logic in PaymentsTable.

                                await updatePaymentStatus(payment.id, {
                                    status: payment.status as any // 'paid' or 'pending'
                                });
                                // toast.success(`Payment marked as ${payment.status}`);
                                router.refresh();
                            } catch (e) {
                                console.error(e);
                                // toast.error('Failed to update status');
                            } finally {
                                setLoading(false);
                            }
                        }}
                        onMarkPartial={() => { }} // TODO: Implement partial flow if needed
                        onGenerateInvoice={() => { }} // TODO: Implement invoice generation
                        onDelete={() => { }} // TODO: Implement delete
                        onSendReminder={async (payment) => {
                            try {
                                setLoading(true);
                                const res = await sendInvoiceEmailAction(payment.id);
                                if (res.success) {
                                    alert(`Reminder sent for ${payment.milestone_name}`);
                                    router.refresh();
                                } else {
                                    alert(`Failed to send reminder: ${res.error}`);
                                }
                            } catch (e) {
                                console.error(e);
                                alert('An error occurred while sending reminder');
                            } finally {
                                setLoading(false);
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
