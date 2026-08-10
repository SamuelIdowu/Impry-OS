import { getCurrentWorkspaceId } from '@/server/actions/workspaces';
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
    const companyName = profile?.companyName || profile?.name || 'Impry User';
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Invoices <onboarding@resend.dev>';

    // Send Email
    const resend = getResendClient();
    const { data, error } = await resend.emails.send({
        from: fromEmail, // Set via RESEND_FROM_EMAIL env var in production
        to: email || invoice.client?.email || '', // Use provided email or client's email from DB
        subject: `Invoice ${invoice.invoiceNumber || invoice.id} from ${companyName}`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: ${brandColor};">Invoice ${invoice.invoiceNumber || invoice.id}</h1>
                <p>Dear ${invoice.client?.name || 'Client'},</p>
                <p>Please find attached invoice for <strong>$${invoice.amount}</strong>.</p>
                <p>Due Date: ${invoice.dueDate}</p>
                <br/>
                <a href="${baseUrl}/public/invoices/${invoice.shareToken || invoice.id}" style="background-color: ${brandColor}; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Invoice</a>
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
    const companyName = profile?.companyName || profile?.name || 'Impry User';
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Impry <onboarding@resend.dev>';

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
        from: fromEmail,
        to: email,
        subject: subject,
        html: finalHtml
    });

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

export async function sendWorkspaceInvitationEmail({
    email,
    workspaceName,
    inviterName,
    role,
    token,
}: {
    email: string;
    workspaceName: string;
    inviterName: string;
    role: string;
    token: string;
}) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const inviteUrl = `${baseUrl}/invite/${token}`;
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Impry <onboarding@resend.dev>';

    const finalHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 20px; background: #ffffff; color: #18181b; border: 1px solid #e4e4e7; border-radius: 12px;">
            <div style="margin-bottom: 24px;">
                <div style="display: inline-block; width: 40px; height: 40px; background-color: #18181b; border-radius: 8px; text-align: center; line-height: 40px; color: #ffffff; font-weight: bold; font-size: 20px;">I</div>
            </div>
            <h1 style="font-size: 22px; font-weight: 700; margin-bottom: 12px; color: #18181b; letter-spacing: -0.5px;">
                Join ${workspaceName} on Impry
            </h1>
            <p style="font-size: 15px; line-height: 24px; color: #52525b; margin-bottom: 24px;">
                <strong>${inviterName}</strong> has invited you to collaborate in the <strong>${workspaceName}</strong> workspace as <strong>${role === 'admin' ? 'an Admin' : 'a Member'}</strong>.
            </p>
            <div style="margin: 32px 0;">
                <a href="${inviteUrl}" style="background-color: #18181b; color: #ffffff; padding: 12px 28px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 8px; display: inline-block; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                    Accept Invitation &rarr;
                </a>
            </div>
            <p style="font-size: 13px; line-height: 20px; color: #71717a; margin-bottom: 8px;">
                Or copy and paste this link into your browser:
            </p>
            <p style="font-size: 12px; color: #a1a1aa; word-break: break-all;">
                ${inviteUrl}
            </p>
            <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 32px 0 20px;" />
            <p style="font-size: 12px; color: #a1a1aa;">
                This invitation will expire in 7 days. If you were not expecting this invite, you can safely disregard this email.
            </p>
        </div>
    `;

    const resend = getResendClient();
    const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: email,
        subject: `${inviterName} invited you to join ${workspaceName} on Impry`,
        html: finalHtml
    });

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

