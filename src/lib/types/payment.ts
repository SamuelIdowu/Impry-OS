// Payment type definitions for Impry OS
// Maps database payment statuses to application layer

export type PaymentStatus = 'pending' | 'paid' | 'partial' | 'overdue' | 'cancelled';

export interface Payment {
    id: string;
    userId: string;
    projectId: string | null;
    clientId: string | null;
    milestoneName?: string | null;
    description?: string | null;
    amount: string | number;
    amountPaid: string | number;
    currency: string;
    status: PaymentStatus;
    dueDate?: string | null;
    paidDate?: string | null;
    paymentMethod?: string | null;
    invoiceNumber?: string | null;
    lineItems?: InvoiceLineItem[] | null;
    notes?: string | null;
    taxRate?: string | number | null;
    discountRate?: string | number | null;
    createdAt: Date | string;
    updatedAt: Date | string;
}

export interface InvoiceLineItem {
    description: string;
    quantity: number;
    rate: number;
    amount: number;
}

export interface PaymentWithClient extends Payment {
    client?: {
        id: string;
        name: string;
        email?: string | null;
        company?: string | null;
    } | null;
}

export interface CreatePaymentInput {
    projectId: string;
    milestoneName: string;
    description?: string;
    amount: string | number;
    currency?: string;
    dueDate?: string;
    notes?: string;
    taxRate?: string | number;
    discountRate?: string | number;
}

export interface UpdatePaymentInput {
    milestoneName?: string;
    description?: string;
    amount?: string | number;
    dueDate?: string;
    notes?: string;
    taxRate?: string | number;
    discountRate?: string | number;
}

export interface UpdatePaymentStatusInput {
    status: PaymentStatus;
    amountPaid?: string | number;
    paidDate?: string;
    paymentMethod?: string;
}

export interface CreateInvoiceInput {
    paymentId: string;
    invoiceNumber: string;
    issueDate: string;
    dueDate: string;
    lineItems: InvoiceLineItem[];
    notes?: string;
    taxRate?: string | number;
    discountRate?: string | number;
}

export interface CreateStandaloneInvoiceInput {
    clientId: string;
    projectId?: string;
    amount: string | number;
    currency?: string;
    status?: PaymentStatus;
    invoiceNumber: string;
    dueDate: string;
    lineItems?: InvoiceLineItem[];
    notes?: string;
    taxRate?: string | number;
    discountRate?: string | number;
}

export interface PaymentSummary {
    totalExpected: number;
    totalPaid: number;
    remaining: number;
    currency: string;
    paymentsCount: number;
    pendingCount: number;
    paidCount: number;
    partialCount: number;
    overdueCount: number;
}

/**
 * Calculate payment status based on amount and amount_paid
 */
export function calculatePaymentStatus(amount: number, amountPaid: number, dueDate?: string | null): PaymentStatus {
    if (amountPaid >= amount) {
        return 'paid';
    }

    if (amountPaid > 0 && amountPaid < amount) {
        return 'partial';
    }

    // Check if overdue
    if (dueDate) {
        const due = new Date(dueDate);
        const now = new Date();
        if (now > due && amountPaid === 0) {
            return 'overdue';
        }
    }

    return 'pending';
}

/**
 * Get status badge configuration for UI display
 */
export function getPaymentStatusConfig(status: PaymentStatus) {
    const configs: Record<PaymentStatus, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
        'paid': { label: 'Paid', variant: 'default' },
        'pending': { label: 'Pending', variant: 'secondary' },
        'partial': { label: 'Partially Paid', variant: 'outline' },
        'overdue': { label: 'Overdue', variant: 'destructive' },
        'cancelled': { label: 'Cancelled', variant: 'outline' },
    };
    return configs[status];
}

/**
 * Get status badge color classes for custom badge styling
 */
export function getPaymentStatusColor(status: PaymentStatus): {
    bg: string;
    text: string;
    border: string;
} {
    const colors: Record<PaymentStatus, { bg: string; text: string; border: string }> = {
        'paid': {
            bg: 'bg-emerald-50 dark:bg-emerald-950',
            text: 'text-emerald-700 dark:text-emerald-300',
            border: 'border-emerald-100 dark:border-emerald-900',
        },
        'pending': {
            bg: 'bg-amber-50 dark:bg-amber-950',
            text: 'text-amber-700 dark:text-amber-300',
            border: 'border-amber-100 dark:border-amber-900',
        },
        'partial': {
            bg: 'bg-blue-50 dark:bg-blue-950',
            text: 'text-blue-700 dark:text-blue-300',
            border: 'border-blue-100 dark:border-blue-900',
        },
        'overdue': {
            bg: 'bg-red-50 dark:bg-red-950',
            text: 'text-red-700 dark:text-red-300',
            border: 'border-red-100 dark:border-red-900',
        },
        'cancelled': {
            bg: 'bg-gray-50 dark:bg-gray-950',
            text: 'text-gray-600 dark:text-gray-400',
            border: 'border-gray-100 dark:border-gray-900',
        },
    };
    return colors[status];
}

/**
 * Format currency amount for display
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
    }).format(amount);
}

/**
 * Calculate percentage paid
 */
export function calculatePercentagePaid(totalExpected: number, totalPaid: number): number {
    if (totalExpected === 0) return 0;
    return Math.round((totalPaid / totalExpected) * 100);
}
