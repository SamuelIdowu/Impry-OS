
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getServiceClient } from '@/lib/db';
import Stripe from 'stripe';

const relevantEvents = new Set([
    'payment_intent.succeeded',
    'checkout.session.completed',
    'customer.subscription.created',
    'customer.subscription.updated',
    'customer.subscription.deleted',
]);

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get('Stripe-Signature') as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (error: any) {
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    if (relevantEvents.has(event.type)) {
        const supabase = getServiceClient();

        try {
            switch (event.type) {
                case 'payment_intent.succeeded': {
                    const paymentIntent = event.data.object as Stripe.PaymentIntent;
                    const { userId } = paymentIntent.metadata;

                    if (userId) {
                        await supabase
                            .from('payments')
                            .update({
                                status: 'paid',
                                paid_date: new Date().toISOString(),
                                stripe_payment_intent_id: paymentIntent.id,
                                stripe_payment_method_id: paymentIntent.payment_method as string,
                            })
                            .eq('stripe_payment_intent_id', paymentIntent.id); // Or match by some other metadata if paymentIntentId wasn't saved yet? 
                        // Wait, typically we create the payment record BEFORE the intent, so we should store payment_intent_id in DB when creating the intent.
                        // But here, update based on intent ID.
                    }
                    break;
                }

                case 'checkout.session.completed': {
                    const session = event.data.object as Stripe.Checkout.Session;

                    if (session.mode === 'subscription') {
                        const subscriptionId = session.subscription as string;
                        const customerId = session.customer as string;
                        const userId = session.metadata?.userId;

                        if (userId) {
                            const subscription = await stripe.subscriptions.retrieve(subscriptionId);

                            await supabase
                                .from('users')
                                .update({
                                    stripe_customer_id: customerId,
                                    subscription_status: subscription.status,
                                    subscription_plan: 'pro', // Assuming this price is Pro
                                    subscription_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
                                })
                                .eq('id', userId);
                        }
                    }
                    break;
                }

                case 'customer.subscription.updated':
                case 'customer.subscription.deleted': {
                    const subscription = event.data.object as Stripe.Subscription;
                    const customerId = subscription.customer as string;

                    // Find user by stripe_customer_id
                    const { data: user } = await supabase
                        .from('users')
                        .select('id')
                        .eq('stripe_customer_id', customerId)
                        .single();

                    if (user) {
                        await supabase
                            .from('users')
                            .update({
                                subscription_status: subscription.status,
                                subscription_plan: subscription.status === 'active' ? 'pro' : 'free', // Simple logic
                                subscription_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
                            })
                            .eq('id', user.id);
                    }
                    break;
                }
            }
        } catch (error) {
            console.error(error);
            return new NextResponse('Webhook handler failed.', { status: 500 });
        }
    }

    return new NextResponse(null, { status: 200 });
}
