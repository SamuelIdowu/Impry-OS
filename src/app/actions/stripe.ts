'use server';

import { stripe } from '@/lib/stripe';
import { getServiceClient } from '@/lib/db';
import { getUser } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

const PRICE_ID_MONTHLY = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY!;
const PRICE_ID_YEARLY = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY!;

export async function createPaymentIntent(amount: number, metadata: any) {
    try {
        const user = await getUser();
        if (!user) throw new Error('Unauthorized');

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Stripe expects cents
            currency: 'usd',
            automatic_payment_methods: { enabled: true },
            metadata: {
                userId: user.id,
                ...metadata,
            },
        });

        return { clientSecret: paymentIntent.client_secret };
    } catch (error) {
        console.error('Error creating payment intent:', error);
        throw new Error('Failed to create payment intent');
    }
}

export async function createCheckoutSession(interval: 'monthly' | 'yearly') {
    const user = await getUser();
    if (!user) {
        throw new Error('User not found'); // Handle unauthenticated state on client if needed
    }

    const priceId = interval === 'yearly' ? PRICE_ID_YEARLY : PRICE_ID_MONTHLY;
    const headersList = await headers();
    const origin = headersList.get('origin') || process.env.NEXT_PUBLIC_SITE_URL!;

    // 1. Get or Create Stripe Customer
    const supabase = getServiceClient();
    const { data: userData } = await supabase
        .from('users')
        .select('stripe_customer_id, email')
        .eq('id', user.id)
        .single();

    let customerId = userData?.stripe_customer_id;

    if (!customerId) {
        const customer = await stripe.customers.create({
            email: userData?.email || user.email,
            metadata: {
                userId: user.id,
            },
        });
        customerId = customer.id;

        await supabase
            .from('users')
            .update({ stripe_customer_id: customerId })
            .eq('id', user.id);
    }

    // 2. Create Checkout Session
    const session = await stripe.checkout.sessions.create({
        customer: customerId,
        line_items: [
            {
                price: priceId,
                quantity: 1,
            },
        ],
        mode: 'subscription',
        success_url: `${origin}/settings?success=true`,
        cancel_url: `${origin}/settings?canceled=true`,
        allow_promotion_codes: true,
        metadata: {
            userId: user.id,
        },
    });

    if (!session.url) {
        throw new Error('Failed to create checkout session');
    }

    redirect(session.url);
}

export async function createCustomerPortalSession() {
    const user = await getUser();
    if (!user) throw new Error('Unauthorized');

    const supabase = getServiceClient();
    const { data: userData } = await supabase
        .from('users')
        .select('stripe_customer_id')
        .eq('id', user.id)
        .single();

    if (!userData?.stripe_customer_id) {
        throw new Error('No Stripe customer found');
    }

    const headersList = await headers();
    const origin = headersList.get('origin') || process.env.NEXT_PUBLIC_SITE_URL!;

    const session = await stripe.billingPortal.sessions.create({
        customer: userData.stripe_customer_id,
        return_url: `${origin}/settings`,
    });

    redirect(session.url);
}
