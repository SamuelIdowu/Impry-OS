'use server';

import { createClient } from '@/lib/auth';
import type {
    Payment,
    CreatePaymentInput,
    UpdatePaymentInput,
    UpdatePaymentStatusInput,
    PaymentSummary,
    CreateStandaloneInvoiceInput,
    calculatePaymentStatus,
} from '@/lib/types/payment';

/**
 * Get all payments for a project
 */
export async function getProjectPayments(projectId: string): Promise<Payment[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .order('due_date', { ascending: true, nullsFirst: false });

    if (error) {
        throw error;
    }

    return data || [];
}

/**
 * Get payment summary for a project
 */
export async function getProjectPaymentSummary(projectId: string): Promise<PaymentSummary> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
        .from('payments')
        .select('amount, amount_paid, status, currency')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .neq('status', 'cancelled');

    if (error) {
        throw error;
    }

    const payments = data || [];
    const totalExpected = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalPaid = payments.reduce((sum, p) => sum + (p.amount_paid || 0), 0);

    const pendingCount = payments.filter(p => p.status === 'pending').length;
    const paidCount = payments.filter(p => p.status === 'paid').length;
    const partialCount = payments.filter(p => p.status === 'partial').length;
    const overdueCount = payments.filter(p => p.status === 'overdue').length;

    return {
        totalExpected,
        totalPaid,
        remaining: totalExpected - totalPaid,
        currency: payments[0]?.currency || 'USD',
        paymentsCount: payments.length,
        pendingCount,
        paidCount,
        partialCount,
        overdueCount,
    };
}

/**
 * Get a single invoice (payment) by ID
 */
export async function getInvoice(id: string): Promise<Payment> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
        .from('payments')
        .select(`
            *,
            projects:project_id (
                id,
                name
            ),
            clients:client_id (
                id,
                name,
                email,
                company,
                address,
                phone
            )
        `)
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

    if (error) {
        throw error;
    }

    if (!data.invoice_number) {
        throw new Error('This payment does not have an invoice generated.');
    }

    // Transform to match PaymentWithClient structure if needed, or return as is with joined data
    // For now we return it as Payment but the joined data is available in 'projects' and 'clients'
    // We might need to extend the type or use a different return type.
    // Let's modify the return type or cast it.

    // Actually, let's just use PaymentWithClient and specific casting
    return data as unknown as Payment;
}

/**
 * Get a single invoice (payment) by Invoice Number
 */
export async function getInvoiceByNumber(invoiceNumber: string): Promise<Payment> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
        .from('payments')
        .select(`
            *,
            projects:project_id (
                id,
                name,
                client_id,
                clients:client_id (
                    id,
                    name,
                    email,
                    company,
                    address,
                    phone
                )
            )
        `)
        .eq('invoice_number', invoiceNumber)
        .eq('user_id', user.id)
        .single();

    if (error) {
        throw error;
    }

    return data as unknown as Payment;
}

/**
 * Create a new payment milestone
 */
export async function createPayment(input: CreatePaymentInput): Promise<Payment> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    // Validate that project exists and belongs to user
    const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('id, client_id')
        .eq('id', input.project_id)
        .eq('user_id', user.id)
        .single();

    if (projectError || !project) {
        throw new Error('Project not found or does not belong to user');
    }

    // Destructure to exclude 'description' which doesn't exist in the database
    // Use 'notes' field instead for any description content
    const { description, ...restInput } = input;

    const { data, error } = await supabase
        .from('payments')
        .insert({
            ...restInput,
            notes: description || restInput.notes,
            user_id: user.id,
            client_id: project.client_id,
            amount_paid: 0,
            status: 'pending',
            currency: input.currency || 'USD',
        })
        .select()
        .single();

    if (error) {
        throw error;
    }

    // Log to timeline
    await logPaymentTimeline(input.project_id, 'payment', `Payment milestone added: ${input.milestone_name}`, {
        payment_id: data.id,
        amount: input.amount,
        currency: input.currency || 'USD',
    });

    return data;
}

/**
 * Update payment details
 */
export async function updatePayment(id: string, input: UpdatePaymentInput): Promise<Payment> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    // Destructure to exclude 'description' which doesn't exist in the database
    const { description, ...restInput } = input;

    const { data, error } = await supabase
        .from('payments')
        .update({
            ...restInput,
            notes: description || restInput.notes,
            updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

    if (error) {
        throw error;
    }

    // Log to timeline
    if (data.project_id) {
        await logPaymentTimeline(data.project_id, 'payment', `Payment milestone updated: ${data.milestone_name}`, {
            payment_id: data.id,
        });
    }

    return data;
}

/**
 * Update payment status (mark as paid, partial, etc.)
 */
export async function updatePaymentStatus(
    id: string,
    statusInput: UpdatePaymentStatusInput
): Promise<Payment> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    // Get current payment
    const { data: currentPayment, error: fetchError } = await supabase
        .from('payments')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

    if (fetchError || !currentPayment) {
        throw new Error('Payment not found');
    }

    const updateData: any = {
        status: statusInput.status,
        updated_at: new Date().toISOString(),
    };

    if (statusInput.amount_paid !== undefined) {
        updateData.amount_paid = statusInput.amount_paid;
    }

    if (statusInput.paid_date) {
        updateData.paid_date = statusInput.paid_date;
    } else if (statusInput.status === 'paid' && !currentPayment.paid_date) {
        // Default to today if marking as paid and no date exists
        updateData.paid_date = new Date().toISOString(); // or .split('T')[0] if date-only type
    }

    if (statusInput.payment_method) {
        updateData.payment_method = statusInput.payment_method;
    }

    const { data, error } = await supabase
        .from('payments')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

    if (error) {
        throw error;
    }

    // Log to timeline
    if (data.project_id) {
        let message = '';
        if (statusInput.status === 'paid') {
            message = `Payment marked as paid: ${data.milestone_name} ($${data.amount})`;
        } else if (statusInput.status === 'partial') {
            message = `Partial payment received: ${data.milestone_name} ($${statusInput.amount_paid} of $${data.amount})`;
        }

        if (message) {
            await logPaymentTimeline(data.project_id, 'payment', message, {
                payment_id: data.id,
                status: statusInput.status,
                amount_paid: statusInput.amount_paid,
            });
        }
    }

    return data;
}

/**
 * Delete a payment
 */
export async function deletePayment(id: string): Promise<void> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    // Get payment before deleting for timeline
    const { data: payment } = await supabase
        .from('payments')
        .select('project_id, milestone_name')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

    const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) {
        throw error;
    }

    // Log to timeline
    if (payment?.project_id) {
        await logPaymentTimeline(
            payment.project_id,
            'payment',
            `Payment milestone deleted: ${payment.milestone_name}`,
            { payment_id: id }
        );
    }
}

/**
 * Helper function to log payment events to timeline
 */
async function logPaymentTimeline(
    projectId: string,
    eventType: string,
    title: string,
    metadata: Record<string, any>
): Promise<void> {
    const supabase = await createClient(); // Added supabase instantiation
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    await supabase.from('timeline_events').insert({
        user_id: user.id,
        project_id: projectId,
        event_type: eventType,
        title: title,
        metadata: metadata,
    });
}

/**
 * Check for overdue payments and update their status
 */
export async function checkOverduePayments(projectId: string): Promise<void> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    const today = new Date().toISOString().split('T')[0];

    // Find payments that are overdue
    const { data: overduePayments } = await supabase
        .from('payments')
        .select('id')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .lt('due_date', today);

    if (overduePayments && overduePayments.length > 0) {
        // Update to overdue status
        const ids = overduePayments.map(p => p.id);
        await supabase
            .from('payments')
            .update({ status: 'overdue' })
            .in('id', ids);
    }
}

/**
 * Generate an invoice for a payment
 */
export async function generateInvoice(input: import('@/lib/types/payment').CreateInvoiceInput): Promise<Payment> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    // Get payment to check ownership and project
    const { data: payment, error: fetchError } = await supabase
        .from('payments')
        .select('id, project_id, amount')
        .eq('id', input.payment_id)
        .eq('user_id', user.id)
        .single();

    if (fetchError || !payment) {
        throw new Error('Payment not found');
    }

    const { data, error } = await supabase
        .from('payments')
        .update({
            invoice_number: input.invoice_number,
            line_items: input.line_items as any,
            notes: input.notes,
            due_date: input.due_date,
            updated_at: new Date().toISOString(),
        })
        .eq('id', input.payment_id)
        .eq('user_id', user.id)
        .select()
        .single();

    if (error) {
        throw error;
    }

    // Log to timeline
    if (payment.project_id) {
        await logPaymentTimeline(
            payment.project_id,
            'payment',
            `Invoice generated: ${input.invoice_number}`,
            {
                payment_id: payment.id,
                invoice_number: input.invoice_number,
                amount: payment.amount,
                type: 'invoice_generated'
            }
        );
    }

    return data;
}

/**
 * Get all invoices (payments with invoice_number)
 */
export async function getInvoices(): Promise<Payment[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
        .from('payments')
        .select(`
            *,
            client:clients(id, name, email, company),
            project:projects(id, name)
        `)
        .not('invoice_number', 'is', null)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        throw error;
    }

    return data || [];
}

/**
 * Create a new standalone invoice (creates a payment record)
 * Used when creating an invoice directly (not from an existing payment milestone)
 */
export async function createStandaloneInvoice(input: CreateStandaloneInvoiceInput): Promise<Payment> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
        .from('payments')
        .insert({
            user_id: user.id,
            client_id: input.client_id,
            project_id: input.project_id || null, // handle "none" or empty string
            amount: input.amount,
            amount_paid: 0,
            currency: input.currency || 'USD',
            status: 'pending', // Default to pending for new invoices
            invoice_number: input.invoice_number,
            due_date: input.due_date,
            line_items: input.line_items,
            notes: input.notes,
            tax_rate: input.tax_rate || 0,
            discount_rate: input.discount_rate || 0
        })
        .select()
        .single();

    if (error) {
        throw error;
    }

    // Log to timeline if project exists
    if (input.project_id) {
        await logPaymentTimeline(input.project_id, 'payment', `Invoice created: ${input.invoice_number}`, {
            payment_id: data.id,
            amount: input.amount,
        });
    }

    return data;
}

/**
 * Update a standalone invoice (updates a payment record)
 */
export async function updateStandaloneInvoice(id: string, input: CreateStandaloneInvoiceInput): Promise<Payment> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
        .from('payments')
        .update({
            client_id: input.client_id,
            project_id: input.project_id || null, // handle "none" or empty string
            amount: input.amount,
            currency: input.currency || 'USD',
            invoice_number: input.invoice_number,
            due_date: input.due_date,
            line_items: input.line_items as any,
            notes: input.notes,
            tax_rate: input.tax_rate || 0,
            discount_rate: input.discount_rate || 0,
            updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

    if (error) {
        throw error;
    }

    // Log to timeline if project exists
    if (data.project_id) {
        await logPaymentTimeline(data.project_id, 'payment', `Invoice updated: ${input.invoice_number}`, {
            payment_id: id,
            amount: input.amount,
        });
    }

    return data;
}
