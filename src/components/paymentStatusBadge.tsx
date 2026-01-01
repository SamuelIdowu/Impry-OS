'use client';

import type { PaymentStatus } from '@/lib/types/payment';
import { getPaymentStatusColor } from '@/lib/types/payment';
import { cn } from '@/lib/utils';

interface PaymentStatusBadgeProps {
    status: PaymentStatus;
    className?: string;
}

export function PaymentStatusBadge({ status, className }: PaymentStatusBadgeProps) {
    const colors = getPaymentStatusColor(status);

    const labels: Record<PaymentStatus, string> = {
        paid: 'Paid',
        pending: 'Pending',
        partial: 'Partially Paid',
        overdue: 'Overdue',
        cancelled: 'Cancelled',
    };

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border',
                colors.bg,
                colors.text,
                colors.border,
                className
            )}
        >
            {labels[status]}
        </span>
    );
}
