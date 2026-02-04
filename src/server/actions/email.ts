'use server';

import { Resend } from 'resend';
import { createClient } from '@/lib/auth';

const resend = new Resend(process.env.RESEND_API_KEY);
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function sendInvoiceEmailAction(invoiceId: string, email?: string) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        // Fetch invoice details
        const { data: invoice, error: invoiceError } = await supabase
            .from('payments')
            .select(`
                *,
                client:clients(name, email, company)
            `)
            .eq('id', invoiceId)
            .single();

        if (invoiceError || !invoice) {
            return { success: false, error: 'Invoice not found' };
        }

        // Fetch User Branding
        const { data: profile } = await supabase
            .from('users')
            .select('brand_color, logo_url, full_name, company_name')
            .eq('id', user.id)
            .single();

        const brandColor = profile?.brand_color || '#18181b';
        const companyName = profile?.company_name || profile?.full_name || 'FreelanceOS User';

        // Send Email
        const { data, error } = await resend.emails.send({
            from: 'Invoices <onboarding@resend.dev>', // Update this with verified domain in prod
            to: email || invoice.client?.email, // Use provided email or client's email from DB
            subject: `Invoice ${invoice.invoice_number} from ${companyName}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: ${brandColor};">Invoice ${invoice.invoice_number}</h1>
                    <p>Dear ${invoice.client?.name || 'Client'},</p>
                    <p>Please find attached invoice for <strong>$${invoice.amount}</strong>.</p>
                    <p>Due Date: ${invoice.due_date}</p>
                    <br/>
                    <a href="${baseUrl}/public/invoices/${invoiceId}" style="background-color: ${brandColor}; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Invoice</a>
                    <br/><br/>
                    <p>Thank you,<br/>${companyName}</p>
                </div>
            `
        });

        if (error) {
            console.error('Resend Error:', error);
            return { success: false, error: error.message };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error: 'Failed to send email' };
    }
}

export async function sendEmailAction(email: string, subject: string, htmlBody: string) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        // Fetch User Branding
        const { data: profile } = await supabase
            .from('users')
            .select('brand_color, full_name, company_name')
            .eq('id', user.id)
            .single();

        const brandColor = profile?.brand_color || '#18181b';
        const companyName = profile?.company_name || profile?.full_name || 'FreelanceOS User';

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
        const { data, error } = await resend.emails.send({
            from: 'FreelanceOS <onboarding@resend.dev>', // Update this with verified domain in prod
            to: email,
            subject: subject,
            html: finalHtml
        });

        if (error) {
            console.error('Resend Error:', error);
            return { success: false, error: error.message };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error: 'Failed to send email' };
    }
}
