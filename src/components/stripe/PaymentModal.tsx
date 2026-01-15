'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { createPaymentIntent } from '@/app/actions/stripe';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Make sure to call loadStripe outside of a component’s render to avoid
// recreating the Stripe object on every render.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function PaymentForm({ amount, onSuccess }: { amount: number, onSuccess: () => void }) {
    const stripe = useStripe();
    const elements = useElements();
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsLoading(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/dashboard`, // Ideally redirects back to invoice or dashboard
            },
            redirect: 'if_required', // Attempt to stay on page if no redirect needed (e.g. card)
        });

        if (error) {
            setErrorMessage(error.message || 'An unexpected error occurred.');
            setIsLoading(false);
        } else {
            // Success!
            onSuccess();
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <PaymentElement />
            {errorMessage && <div className="text-red-500 text-sm">{errorMessage}</div>}
            <Button disabled={!stripe || isLoading} className="w-full">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : `Pay $${(amount / 100).toFixed(2)}`}
            </Button>
        </form>
    );
}

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    amount: number; // in cents
    invoiceId?: string;
    currency?: string;
}

export function PaymentModal({ isOpen, onClose, amount, invoiceId }: PaymentModalProps) {
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [isLoadingSecret, setIsLoadingSecret] = useState(false);

    // Fetch secret when opening if not already there
    useEffect(() => {
        if (isOpen && !clientSecret) {
            setIsLoadingSecret(true);
            createPaymentIntent(amount, { invoiceId: invoiceId || 'unknown' })
                .then((data) => {
                    setClientSecret(data.clientSecret);
                    setIsLoadingSecret(false);
                })
                .catch((err) => {
                    console.error(err);
                    setIsLoadingSecret(false);
                });
        }
    }, [isOpen, clientSecret, amount, invoiceId]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Pay Invoice</DialogTitle>
                    <DialogDescription>
                        Enter your payment details below to complete the payment.
                    </DialogDescription>
                </DialogHeader>

                {isLoadingSecret ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                ) : clientSecret ? (
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                        <PaymentForm
                            amount={amount}
                            onSuccess={() => {
                                onClose();
                                window.location.reload(); // Simple refresh to update status
                            }}
                        />
                    </Elements>
                ) : (
                    <div className="text-center text-red-500 py-4">
                        Failed to load payment details. Please try again.
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
