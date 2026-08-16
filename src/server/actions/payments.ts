'use server';
import { getCurrentWorkspaceId } from '@/server/actions/workspaces';

import { db } from '@/server/db';
import { payments, projects, clients, users } from '@/server/db/schema';
import { eq, and, ne, lt, isNotNull, desc, asc, or } from 'drizzle-orm';
import { getUser } from '@/lib/auth';
import { withAuth } from '@/lib/auth-guard';
import { canCreateInvoice } from '@/lib/payments/guards';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const createPaymentSchema = z.object({
    projectId: z.string().min(1, 'Project is required'),
    milestoneName: z.string().min(1, 'Milestone name is required'),
    description: z.string().optional(),
    amount: z.union([z.string(), z.number()]),
    currency: z.string().optional(),
    dueDate: z.string().optional(),
    notes: z.string().optional(),
    taxRate: z.union([z.string(), z.number()]).optional(),
    discountRate: z.union([z.string(), z.number()]).optional(),
});

const updatePaymentSchema = createPaymentSchema.partial().omit({ projectId: true });

const createStandaloneInvoiceSchema = z.object({
    clientId: z.string().min(1, 'Client is required'),
    projectId: z.string().optional(),
    amount: z.union([z.string(), z.number()]),
    currency: z.string().optional(),
    status: z.enum(['pending', 'paid', 'partial', 'overdue', 'cancelled']).optional(),
    invoiceNumber: z.string().min(1, 'Invoice number is required'),
    dueDate: z.string(),
    notes: z.string().optional(),
    taxRate: z.union([z.string(), z.number()]).optional(),
    discountRate: z.union([z.string(), z.number()]).optional(),
    lineItems: z.any().optional(), // Can add a more specific schema here if needed
});

const updateStandaloneInvoiceSchema = createStandaloneInvoiceSchema.partial();

import type {
    Payment,
    CreatePaymentInput,
    UpdatePaymentInput,
    UpdatePaymentStatusInput,
    PaymentSummary,
    CreateStandaloneInvoiceInput,
} from '@/lib/types/payment';

/**
 * Helper function to log payment events to timeline
 */
async function logPaymentTimeline(
    projectId: string,
    eventType: string,
    title: string,
    metadata: Record<string, any>
): Promise<void> {
    const user = await getUser();
    if (!user) return;

    const { timelineEvents } = await import('@/server/db/schema');
    await db.insert(timelineEvents).values({
        userId: user.id,
        workspaceId: await getCurrentWorkspaceId(),

        projectId: projectId,
        eventType: eventType,
        title: title,
        metadata: metadata,
    });
}

/**
 * Get all payments for a project
 */
export async function getProjectPayments(projectId: string): Promise<Payment[]> {
    const user = await getUser();
    if (!user) throw new Error('User not authenticated');

    const result = await db.query.payments.findMany({
        where: and(eq(payments.projectId, projectId), eq(payments.workspaceId, await getCurrentWorkspaceId()), eq(payments.userId, user.id)),
        orderBy: (payments, { asc }) => [asc(payments.dueDate)]
    });

    return result as Payment[];
}

/**
 * Get payment summary for a project
 */
export async function getProjectPaymentSummary(projectId: string): Promise<PaymentSummary> {
    const user = await getUser();
    if (!user) throw new Error('User not authenticated');

    const projectPayments = await db.query.payments.findMany({
        where: and(
            eq(payments.projectId, projectId),
            eq(payments.userId, user.id),
            ne(payments.status, 'cancelled')
        ),
        columns: { amount: true, amountPaid: true, status: true, currency: true }
    });

    const totalExpected = projectPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const totalPaid = projectPayments.reduce((sum, p) => sum + (Number(p.amountPaid) || 0), 0);

    const pendingCount = projectPayments.filter(p => p.status === 'pending').length;
    const paidCount = projectPayments.filter(p => p.status === 'paid').length;
    const partialCount = projectPayments.filter(p => p.status === 'partial').length;
    const overdueCount = projectPayments.filter(p => p.status === 'overdue').length;

    return {
        totalExpected,
        totalPaid,
        remaining: totalExpected - totalPaid,
        currency: projectPayments[0]?.currency || 'USD',
        paymentsCount: projectPayments.length,
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
    const user = await getUser();
    if (!user) throw new Error('User not authenticated');

    const result = await db.query.payments.findFirst({
        where: and(eq(payments.id, id), eq(payments.workspaceId, await getCurrentWorkspaceId()), eq(payments.userId, user.id)),
        with: {
            project: {
                columns: { id: true, name: true }
            },
            client: {
                columns: { id: true, name: true, email: true, company: true, address: true, phone: true }
            }
        }
    });

    if (!result) throw new Error('Invoice not found');
    if (!result.invoiceNumber) throw new Error('This payment does not have an invoice generated.');

    return result as Payment;
}

/**
 * Get a single invoice (payment) by Invoice Number
 */
export async function getInvoiceByNumber(invoiceNumber: string): Promise<Payment> {
    const user = await getUser();
    if (!user) throw new Error('User not authenticated');

    const result = await db.query.payments.findFirst({
        where: and(eq(payments.invoiceNumber, invoiceNumber), eq(payments.userId, user.id)),
        with: {
            project: {
                columns: { id: true, name: true, clientId: true },
                with: {
                    client: {
                        columns: { id: true, name: true, email: true, company: true, address: true, phone: true }
                    }
                }
            }
        }
    });

    if (!result) throw new Error('Invoice not found');

    return result as Payment;
}

/**
 * Create a new payment milestone
 */
export async function createPayment(input: CreatePaymentInput): Promise<Payment> {
    return withAuth(async (user, workspaceId) => {
        try {
            const validatedInput = createPaymentSchema.parse(input) as CreatePaymentInput;
            const project = await db.query.projects.findFirst({
                where: and(eq(projects.id, validatedInput.projectId), eq(projects.userId, user.id)),
                columns: { id: true, clientId: true }
            });

            if (!project) {
                throw new Error('Project not found or does not belong to user');
            }

            const { description, ...restInput } = validatedInput;

            const [newPayment] = await db.insert(payments).values({
                ...restInput,
                projectId: validatedInput.projectId,
                milestoneName: validatedInput.milestoneName,
                notes: description || restInput.notes,
                userId: user.id,
                workspaceId,

                clientId: project.clientId,
                amountPaid: '0',
                amount: validatedInput.amount.toString(),
                status: 'pending',
                currency: validatedInput.currency || 'USD',
                dueDate: validatedInput.dueDate,
                taxRate: validatedInput.taxRate?.toString(),
                discountRate: validatedInput.discountRate?.toString()
            }).returning();

            await logPaymentTimeline(validatedInput.projectId, 'payment', `Payment milestone added: ${validatedInput.milestoneName}`, {
                payment_id: newPayment.id,
                amount: validatedInput.amount,
                currency: validatedInput.currency || 'USD',
            });

            revalidatePath(`/${workspaceId}/projects/${validatedInput.projectId}`);
            revalidatePath(`/${workspaceId}/payments`);
            return newPayment as Payment;
        } catch (error: any) {
            console.error('Error creating payment:', error);
            if (error instanceof z.ZodError) {
                throw new Error(error.issues[0].message);
            }
            throw error;
        }
    }) as Promise<Payment>;
}

/**
 * Update payment details
 */
export async function updatePayment(id: string, input: UpdatePaymentInput): Promise<Payment> {
    const user = await getUser();
    if (!user) throw new Error('User not authenticated');

    const { description, ...restInput } = input;

    const [updatedPayment] = await db.update(payments).set({
        ...restInput,
        milestoneName: input.milestoneName || undefined,
        notes: description || restInput.notes,
        amount: input.amount ? input.amount.toString() : undefined,
        dueDate: input.dueDate,
        taxRate: input.taxRate?.toString(),
        discountRate: input.discountRate?.toString(),
        updatedAt: new Date(),
    })
        .where(and(eq(payments.id, id), eq(payments.workspaceId, await getCurrentWorkspaceId()), eq(payments.userId, user.id)))
        .returning();

    if (!updatedPayment) throw new Error('Payment not found');

    if (updatedPayment.projectId) {
        await logPaymentTimeline(updatedPayment.projectId, 'payment', `Payment milestone updated: ${updatedPayment.milestoneName}`, {
            payment_id: updatedPayment.id,
        });
    }

    return updatedPayment as Payment;
}

/**
 * Update payment status (mark as paid, partial, etc.)
 */
export async function updatePaymentStatus(
    id: string,
    statusInput: UpdatePaymentStatusInput
): Promise<Payment> {
    const user = await getUser();
    if (!user) throw new Error('User not authenticated');

    const currentPayment = await db.query.payments.findFirst({
        where: and(eq(payments.id, id), eq(payments.workspaceId, await getCurrentWorkspaceId()), eq(payments.userId, user.id))
    });

    if (!currentPayment) {
        throw new Error('Payment not found');
    }

    const updateData: any = {
        status: statusInput.status,
        updatedAt: new Date(),
    };

    if (statusInput.amountPaid !== undefined) {
        updateData.amountPaid = statusInput.amountPaid.toString();
    } else if (statusInput.status === 'paid' && currentPayment.amount) {
        updateData.amountPaid = currentPayment.amount.toString();
    }

    if (statusInput.paidDate) {
        updateData.paidDate = statusInput.paidDate; // string date
    } else if (statusInput.status === 'paid' && !currentPayment.paidDate) {
        updateData.paidDate = new Date().toISOString().split('T')[0];
    }

    if (statusInput.paymentMethod) {
        updateData.paymentMethod = statusInput.paymentMethod;
    }

    const [updatedPayment] = await db.update(payments).set(updateData)
        .where(and(eq(payments.id, id), eq(payments.workspaceId, await getCurrentWorkspaceId()), eq(payments.userId, user.id)))
        .returning();

    if (updatedPayment.projectId) {
        let message = '';
        if (statusInput.status === 'paid') {
            message = `Payment marked as paid: ${updatedPayment.milestoneName} ($${updatedPayment.amount})`;
        } else if (statusInput.status === 'partial') {
            message = `Partial payment received: ${updatedPayment.milestoneName} ($${statusInput.amountPaid} of $${updatedPayment.amount})`;
        }

        if (message) {
            await logPaymentTimeline(updatedPayment.projectId, 'payment', message, {
                payment_id: updatedPayment.id,
                status: statusInput.status,
                amountPaid: statusInput.amountPaid,
            });
        }
    }

    return updatedPayment as Payment;
}

/**
 * Delete a payment
 */
export async function deletePayment(id: string): Promise<void> {
    const user = await getUser();
    if (!user) throw new Error('User not authenticated');

    const payment = await db.query.payments.findFirst({
        where: and(eq(payments.id, id), eq(payments.workspaceId, await getCurrentWorkspaceId()), eq(payments.userId, user.id)),
        columns: { projectId: true, milestoneName: true }
    });

    await db.delete(payments).where(and(eq(payments.id, id), eq(payments.workspaceId, await getCurrentWorkspaceId()), eq(payments.userId, user.id)));

    if (payment?.projectId) {
        await logPaymentTimeline(
            payment.projectId,
            'payment',
            `Payment milestone deleted: ${payment.milestoneName}`,
            { payment_id: id }
        );
    }
}

/**
 * Check for overdue payments and update their status
 */
export async function checkOverduePayments(projectId: string): Promise<void> {
    const user = await getUser();
    if (!user) throw new Error('User not authenticated');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overduePayments = await db.query.payments.findMany({
        where: and(
            eq(payments.projectId, projectId),
            eq(payments.userId, user.id),
            eq(payments.status, 'pending'),
            lt(payments.dueDate, today.toISOString().split('T')[0])
        ),
        columns: { id: true }
    });

    if (overduePayments.length > 0) {
        const ids = overduePayments.map(p => p.id);
        await Promise.all(ids.map(id =>
            db.update(payments).set({ status: 'overdue' }).where(eq(payments.id, id))
        ));
    }
}

/**
 * Generate an invoice for a payment
 */
export async function generateInvoice(input: import('@/lib/types/payment').CreateInvoiceInput): Promise<Payment> {
    const user = await getUser();
    if (!user) throw new Error('User not authenticated');

    const payment = await db.query.payments.findFirst({
        where: and(eq(payments.id, input.paymentId), eq(payments.userId, user.id)),
        columns: { id: true, projectId: true, amount: true }
    });

    if (!payment) {
        throw new Error('Payment not found');
    }

    const [updatedPayment] = await db.update(payments).set({
        invoiceNumber: input.invoiceNumber,
        lineItems: input.lineItems,
        notes: input.notes,
        dueDate: input.dueDate,
        updatedAt: new Date(),
    })
        .where(and(eq(payments.id, input.paymentId), eq(payments.userId, user.id)))
        .returning();

    if (payment.projectId) {
        await logPaymentTimeline(
            payment.projectId,
            'payment',
            `Invoice generated: ${input.invoiceNumber}`,
            {
                payment_id: payment.id,
                invoiceNumber: input.invoiceNumber,
                amount: payment.amount,
                type: 'invoice_generated'
            }
        );
    }

    return updatedPayment as Payment;
}

/**
 * Get all invoices (payments with invoiceNumber)
 */
export async function getInvoices(): Promise<Payment[]> {
    const user = await getUser();
    if (!user) throw new Error('User not authenticated');

    const result = await db.query.payments.findMany({
        where: and(isNotNull(payments.invoiceNumber), eq(payments.userId, user.id)),
        orderBy: [desc(payments.createdAt)],
        with: {
            client: {
                columns: { id: true, name: true, email: true, company: true }
            },
            project: {
                columns: { id: true, name: true }
            }
        }
    });

    return result as Payment[];
}

/**
 * Create a new standalone invoice (creates a payment record)
 * Used when creating an invoice directly (not from an existing payment milestone)
 */
export async function createStandaloneInvoice(input: CreateStandaloneInvoiceInput): Promise<Payment> {
    return withAuth(async (user, workspaceId) => {
        try {
            const limitCheck = await canCreateInvoice(workspaceId);
            if (!limitCheck.allowed) {
                throw new Error(
                    `Monthly invoice limit reached (${limitCheck.currentCount}/${limitCheck.maxAllowed} invoices). Upgrade to Pro for unlimited invoices.`
                );
            }

            const validatedInput = createStandaloneInvoiceSchema.parse(input) as CreateStandaloneInvoiceInput;
            const [newInvoice] = await db.insert(payments).values({
                userId: user.id,
                workspaceId,

                clientId: validatedInput.clientId,
                projectId: validatedInput.projectId || null, // handle "none" or empty string
                amount: validatedInput.amount.toString(),
                amountPaid: "0",
                currency: validatedInput.currency || 'USD',
                status: 'pending', // Default to pending for new invoices
                invoiceNumber: validatedInput.invoiceNumber,
                dueDate: validatedInput.dueDate,
                lineItems: validatedInput.lineItems,
                notes: validatedInput.notes,
                taxRate: validatedInput.taxRate?.toString() || "0",
                discountRate: validatedInput.discountRate?.toString() || "0"
            }).returning();

            // Log to timeline if project exists
            if (validatedInput.projectId) {
                await logPaymentTimeline(validatedInput.projectId, 'payment', `Invoice created: ${validatedInput.invoiceNumber}`, {
                    payment_id: newInvoice.id,
                    amount: validatedInput.amount,
                });
            }

            revalidatePath(`/${workspaceId}/payments`);
            return newInvoice as Payment;
        } catch (error: any) {
            console.error('Error creating standalone invoice:', error);
            if (error instanceof z.ZodError) {
                throw new Error(error.issues[0].message);
            }
            throw error;
        }
    }) as Promise<Payment>;
}

/**
 * Update a standalone invoice (updates a payment record)
 */
export async function updateStandaloneInvoice(id: string, input: CreateStandaloneInvoiceInput): Promise<Payment> {
    const user = await getUser();
    if (!user) throw new Error('User not authenticated');

    const [updatedInvoice] = await db.update(payments).set({
        clientId: input.clientId,
        projectId: input.projectId || null, // handle "none" or empty string
        amount: input.amount.toString(),
        currency: input.currency || 'USD',
        invoiceNumber: input.invoiceNumber,
        dueDate: input.dueDate,
        lineItems: input.lineItems,
        notes: input.notes,
        taxRate: input.taxRate?.toString() || "0",
        discountRate: input.discountRate?.toString() || "0",
        updatedAt: new Date(),
    })
        .where(and(eq(payments.id, id), eq(payments.workspaceId, await getCurrentWorkspaceId()), eq(payments.userId, user.id)))
        .returning();

    if (!updatedInvoice) throw new Error('Invoice not found');

    if (updatedInvoice.projectId) {
        await logPaymentTimeline(updatedInvoice.projectId, 'payment', `Invoice updated: ${input.invoiceNumber}`, {
            payment_id: id,
            amount: input.amount,
        });
    }

    return updatedInvoice as Payment;
}

/**
 * Get a single public invoice by share token, ID, or invoice number (bypasses RLS)
 */
export async function getPublicInvoice(identifier: string): Promise<Payment> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);

    const conditions = [];
    if (isUuid) {
        conditions.push(eq(payments.shareToken, identifier));
        conditions.push(eq(payments.id, identifier));
    } else {
        conditions.push(eq(payments.invoiceNumber, identifier));
    }

    const result = await db.query.payments.findFirst({
        where: or(...conditions),
        with: {
            project: {
                columns: { id: true, name: true }
            },
            client: {
                columns: { id: true, name: true, email: true, company: true, address: true, phone: true }
            },
            user: {
                columns: { brandColor: true, logoUrl: true, name: true, companyName: true }
            }
        }
    });

    if (!result) {
        throw new Error('Invoice not found');
    }

    if (!result.invoiceNumber) {
        throw new Error('This payment does not have an invoice generated.');
    }

    const enrichedData = {
        ...result,
        brandColor: result.user?.brandColor,
        logoUrl: result.user?.logoUrl,
        companyName: result.user?.companyName || result.user?.name
    };

    return enrichedData as Payment;
}

