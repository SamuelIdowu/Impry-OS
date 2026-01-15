'use server';

import { stripe } from '@/lib/stripe';
import { createClient } from "@/lib/auth";
import { redirect } from 'next/navigation';

// --- Client Invoicing (One-time Payment) ---

/**
 * Creates a PaymentIntent for an invoice.
 * @param amount Amount in cents (e.g. 1000 = $10.00)
 * @param currency Currency code (e.g. 'usd')
 * @param metadata Metadata to attach (invoiceId, projectId)
 */
export async function createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    metadata: Record<string, string>
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
            metadata: {
                ...metadata,
                userId: user.id, // Track who created it
            },
            automatic_payment_methods: {
                enabled: true,
            },
        });

        // We create the payment record in specific server action calling this, or client side after intent creation?
        // Plan says: "Payment Intent -> Webhook -> DB Update".
        // But we usually want to store the intent ID in the payments table immediately if possible 
        // to avoid "orphaned" intents if the user closes the window.
        // For now, return the client_secret and intent id.

        return {
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        };
    } catch (error) {
        console.error('Error creating payment intent:', error);
        throw new Error('Failed to create payment intent');
    }
}

// --- SaaS Subscription ---

/**
 * Creates a Checkout Session for upgrading to Pro.
 * @param priceId The Stripe Price ID (monthly or yearly)
 */
export async function createCheckoutSession(priceId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // specific query to get user profile for stripe_customer_id if needed
    // But usually we can just create a new customer or let Stripe handle it with email 
    // IF we are not using existing customer IDs. 
    // Best practice: Check if we have a stripe_customer_id in DB.

    const { data: userProfile } = await supabase
        .from('users')
        .select('stripe_customer_id, email')
        .eq('id', user.id)
        .single();

    let customerId = userProfile?.stripe_customer_id;

    // If no customer ID, create one? Or let Checkout crate one?
    // Letting Checkout create one is easier, but then we need to catch it in webhook and save it.
    // If we pass 'customer_email', Stripe uses it to look up or create.

    const sessionParams: any = {
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
            {
                price: priceId,
                quantity: 1,
            },
        ],
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout_success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
        metadata: {
            userId: user.id,
        },
        allow_promotion_codes: true,
    };

    if (customerId) {
        sessionParams.customer = customerId;
    } else {
        sessionParams.customer_email = userProfile?.email || user.email;
        sessionParams.customer_creation = 'always';
    }

    try {
        const session = await stripe.checkout.sessions.create(sessionParams);
        if (!session.url) throw new Error('No session URL');
        return { url: session.url };
    } catch (error) {
        console.error('Error creating checkout session:', error);
        throw new Error('Failed to create checkout session: ' + (error as Error).message);
    }
}

/**
 * Creates a Customer Portal session for managing subscription.
 */
export async function createCustomerPortalSession() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: userProfile } = await supabase
        .from('users')
        .select('stripe_customer_id')
        .eq('id', user.id)
        .single();

    if (!userProfile?.stripe_customer_id) {
        throw new Error('No Stripe customer found');
    }

    try {
        const session = await stripe.billingPortal.sessions.create({
            customer: userProfile.stripe_customer_id,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
        });

        return { url: session.url };
    } catch (error) {
        console.error('Error creating portal session:', error);
        throw new Error('Failed to create portal session');
    }
}
