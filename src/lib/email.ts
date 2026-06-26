import { db } from '@/server/db';
import { payments, users, clients } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { getUser } from '@/lib/auth';
import { Resend } from 'resend';

// Lazy initialization to avoid build-time errors
function getResendClient() {
    return new Resend(process.env.RESEND_API_KEY);
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function sendInvoiceEmail(invoiceId: string, email?: string) {
    const user = await getUser();
    if (!user) throw new Error('Not authenticated');

    // Fetch invoice details
    const invoice = await db.query.payments.findFirst({
        where: eq(payments.id, invoiceId),
        with: {
            client: {
                columns: {
                    name: true,
                    email: true,
                    company: true
                }
            }
        }
    });

    if (!invoice) {
        throw new Error('Invoice not found');
    }

    // Fetch User Branding
    const profile = await db.query.users.findFirst({
        where: eq(users.id, user.id),
        columns: {
            brandColor: true,
            logoUrl: true,
            name: true,
            companyName: true
        }
    });

    const brandColor = profile?.brandColor || '#18181b';
    const companyName = profile?.companyName || profile?.name || 'FreelanceOS User';

    // Send Email
    const resend = getResendClient();
    const { data, error } = await resend.emails.send({
        from: 'Invoices <onboarding@resend.dev>', // Update this with verified domain in prod
        to: email || invoice.client?.email || '', // Use provided email or client's email from DB
        subject: `Invoice ${invoice.invoiceNumber || invoice.id} from ${companyName}`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: ${brandColor};">Invoice ${invoice.invoiceNumber || invoice.id}</h1>
                <p>Dear ${invoice.client?.name || 'Client'},</p>
                <p>Please find attached invoice for <strong>$${invoice.amount}</strong>.</p>
                <p>Due Date: ${invoice.dueDate}</p>
                <br/>
                <a href="${baseUrl}/public/invoices/${invoiceId}" style="background-color: ${brandColor}; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Invoice</a>
                <br/><br/>
                <p>Thank you,<br/>${companyName}</p>
            </div>
        `
    });

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

export async function sendEmail(email: string, subject: string, htmlBody: string) {
    const user = await getUser();
    if (!user) throw new Error('Not authenticated');

    // Fetch User Branding
    const profile = await db.query.users.findFirst({
        where: eq(users.id, user.id),
        columns: {
            brandColor: true,
            name: true,
            companyName: true
        }
    });

    const brandColor = profile?.brandColor || '#18181b';
    const companyName = profile?.companyName || profile?.name || 'FreelanceOS User';

    // Wrap basic text body in template if needed, or pass full HTML
    const finalHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: ${brandColor};">${subject}</h2>
            <div style="white-space: pre-wrap;">${htmlBody.replace(/\n/g, '<br>')}</div>
            <br/>
            <p>Best regards,<br/>${companyName}</p>
        </div>
    `;

    // Send Email
    const resend = getResendClient();
    const { data, error } = await resend.emails.send({
        from: 'FreelanceOS <onboarding@resend.dev>', // Update this with verified domain in prod
        to: email,
        subject: subject,
        html: finalHtml
    });

    if (error) {
        throw new Error(error.message);
    }

    return data;
}
