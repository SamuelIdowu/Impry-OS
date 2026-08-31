'use server';
import { getCurrentWorkspaceId } from '@/lib/workspace';

import { db } from '@/server/db';
import { payments, timelineEvents } from '@/server/db/schema';
import { eq, and, isNotNull, desc, or } from 'drizzle-orm';
import { getUser } from '@/lib/auth';
import { withAuth } from '@/lib/auth-guard';
import { canCreateInvoice } from '@/lib/payments/guards';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

import type {
    Payment,
    CreateStandaloneInvoiceInput,
} from '@/lib/types/payment';

const createStandaloneInvoiceSchema = z.object({
    clientId: z.string().min(1, 'Client is required'),
    projectId: z.string().optional(),
    amount: z.union([z.string(), z.number()]),
    currency: z.string().optional(),
    status: z.enum(['pending', 'paid', 'partial', 'overdue', 'cancelled']).optional(),
    invoiceNumber: z.string().min(1, 'Invoice number is required'),
    dueDate: z.string(),
    notes: z.string().optional(),
    paymentInstructions: z.string().optional(),
    taxRate: z.union([z.string(), z.number()]).optional(),
    discountRate: z.union([z.string(), z.number()]).optional(),
    lineItems: z.any().optional(),
});

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

    await db.insert(timelineEvents).values({
        userId: user.id,
        workspaceId: await getCurrentWorkspaceId(),
        projectId,
        eventType,
        title,
        metadata,
    });
}

/**
 * Get all invoices (payments with invoiceNumber)
 */
export async function getInvoices(): Promise<Payment[]> {
    const user = await getUser();
    if (!user) throw new Error('User not authenticated');

    const workspaceId = await getCurrentWorkspaceId();

    const result = await db.query.payments.findMany({
        where: and(isNotNull(payments.invoiceNumber), eq(payments.userId, user.id), eq(payments.workspaceId, workspaceId)),
        orderBy: [desc(payments.createdAt)],
        limit: 100,
        with: {
            client: { columns: { id: true, name: true, email: true, company: true } },
            project: { columns: { id: true, name: true } },
        },
    });

    return result as Payment[];
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
            project: { columns: { id: true, name: true } },
            client: { columns: { id: true, name: true, email: true, company: true, address: true, phone: true } },
        },
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
                    client: { columns: { id: true, name: true, email: true, company: true, address: true, phone: true } },
                },
            },
        },
    });

    if (!result) throw new Error('Invoice not found');

    return result as Payment;
}

/**
 * Create a new standalone invoice (creates a payment record)
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

            const validatedInput = createStandaloneInvoiceSchema.parse(input) as CreateStandaloneInvoiceInput & { paymentInstructions?: string };
            const [newInvoice] = await db.insert(payments).values({
                userId: user.id,
                workspaceId,
                clientId: validatedInput.clientId,
                projectId: validatedInput.projectId || null,
                amount: validatedInput.amount.toString(),
                amountPaid: "0",
                currency: validatedInput.currency || 'USD',
                status: 'pending',
                invoiceNumber: validatedInput.invoiceNumber,
                dueDate: validatedInput.dueDate,
                lineItems: validatedInput.lineItems,
                notes: validatedInput.paymentInstructions || validatedInput.notes,
                taxRate: validatedInput.taxRate?.toString() || "0",
                discountRate: validatedInput.discountRate?.toString() || "0",
            }).returning();

            if (validatedInput.projectId) {
                await logPaymentTimeline(validatedInput.projectId, 'payment', `Invoice created: ${validatedInput.invoiceNumber}`, {
                    payment_id: newInvoice.id,
                    amount: validatedInput.amount,
                });
            }

            revalidatePath(`/${workspaceId}/invoices`);
            revalidatePath(`/${workspaceId}/payments`);
            revalidatePath(`/${workspaceId}/dashboard`);
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
    const workspaceId = await getCurrentWorkspaceId();

    const [updatedInvoice] = await db.update(payments).set({
        clientId: input.clientId,
        projectId: input.projectId || null,
        amount: input.amount.toString(),
        currency: input.currency || 'USD',
        invoiceNumber: input.invoiceNumber,
        dueDate: input.dueDate,
        lineItems: input.lineItems,
        notes: (input as any).paymentInstructions || input.notes,
        taxRate: input.taxRate?.toString() || "0",
        discountRate: input.discountRate?.toString() || "0",
        updatedAt: new Date(),
    })
        .where(and(eq(payments.id, id), eq(payments.workspaceId, workspaceId), eq(payments.userId, user.id)))
        .returning();

    if (!updatedInvoice) throw new Error('Invoice not found');

    if (updatedInvoice.projectId) {
        await logPaymentTimeline(updatedInvoice.projectId, 'payment', `Invoice updated: ${input.invoiceNumber}`, {
            payment_id: id,
            amount: input.amount,
        });
    }

    revalidatePath(`/${workspaceId}/invoices`);
    revalidatePath(`/${workspaceId}/invoices/${id}`);
    revalidatePath(`/${workspaceId}/payments`);
    revalidatePath(`/${workspaceId}/dashboard`);

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
    } else {
        conditions.push(eq(payments.invoiceNumber, identifier));
    }

    const result = await db.query.payments.findFirst({
        where: or(...conditions),
        with: {
            project: { columns: { id: true, name: true } },
            client: { columns: { id: true, name: true, email: true, company: true, address: true, phone: true } },
            user: { columns: { brandColor: true, logoUrl: true, name: true, companyName: true } },
        },
    });

    if (!result) throw new Error('Invoice not found');
    if (!result.invoiceNumber) throw new Error('This payment does not have an invoice generated.');

    const enrichedData = {
        ...result,
        brandColor: result.user?.brandColor,
        logoUrl: result.user?.logoUrl,
        companyName: result.user?.companyName || result.user?.name,
    };

    return enrichedData as Payment;
}
