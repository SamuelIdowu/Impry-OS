export type Status = 'Active' | 'Inactive' | 'Pending' | 'Paid' | 'Overdue' | 'Draft' | 'Sent' | 'On Track' | 'At Risk' | 'Completed' | 'Archived' | 'In Progress' | 'Needs Review' | 'Lead';

export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
}

export interface Client {
    id: string;
    name: string;
    companyName: string;
    email: string;
    status: Status;
    avatar?: string;
    totalRevenue: number;
    projectCount: number;
    lastActive: string;
    location?: string;
    description?: string;
    joinedDate?: string;
}

export interface Project {
    id: string;
    name: string;
    clientId: string;
    clientName: string;
    status: Status;
    progress: number; // 0-100
    dueDate: string;
    startDate: string;
    totalValue: number;
    paidAmount: number;
    description?: string;
    avatar?: string; // Client initials or project icon
}

export interface InvoiceItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
}

export interface AddressDetails {
    name: string;
    companyName?: string;
    addressLine1: string;
    addressLine2?: string; // e.g. "San Francisco, CA 94103"
    taxId?: string;
}

export interface Invoice {
    id: string;
    invoiceNumber: string;
    clientId: string;
    clientName: string;
    projectId?: string;
    projectName?: string;
    amount: number;
    status: Status;
    issueDate: string;
    dueDate: string;
    items?: InvoiceItem[];
    senderDetails?: AddressDetails;
    recipientDetails?: AddressDetails;
    subtotal?: number;
    tax?: number; // percent or amount, let's say amount for simplicity or we can calculate
    taxRate?: number; // percent
    discount?: number;
    total?: number;
}

export interface Activity {
    id: string;
    type: 'viewed_invoice' | 'completed_phase' | 'updated_scope' | 'payment_received' | 'new_project';
    description: string;
    timestamp: string;
    meta?: Record<string, any>;
}

export interface DashboardStats {
    totalRevenue: number;
    totalRevenueChange: number; // percentage
    projectSuccessRate: number;
    projectSuccessRateChange: number;
    outstandingInvoicesCount: number;
    outstandingInvoicesAmount: number;
    activeProjects: number;
    totalClients: number;
}

export interface Reminder {
    id: string;
    clientName: string;
    projectName: string;
    type: 'payment' | 'deadline' | 'follow_up';
    title: string;
    dueDate: string; // "Today", "Tomorrow", etc.
    overdue: boolean;
    projectId?: string;
    clientId?: string;
    clientEmail?: string;
}

export interface Risk {
    id: string;
    projectName: string;
    clientName: string;
    type: 'payment' | 'ghosting';
    badgeLabel: string;
    metadata: string; // e.g. "12 days overdue • $1,500.00"
    actionLabel: string;
    progress?: number;
}
