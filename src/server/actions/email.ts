'use server';

import { sendInvoiceEmail, sendEmail } from '@/lib/email';

export async function sendInvoiceEmailAction(invoiceId: string, email?: string) {
    try {
        const data = await sendInvoiceEmail(invoiceId, email);
        return { success: true, data };
    } catch (error) {
        console.error('Error sending invoice email:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Failed to send email' };
    }
}

export async function sendEmailAction(email: string, subject: string, htmlBody: string) {
    try {
        const data = await sendEmail(email, subject, htmlBody);
        return { success: true, data };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Failed to send email' };
    }
}

