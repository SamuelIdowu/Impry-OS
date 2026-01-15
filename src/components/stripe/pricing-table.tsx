
'use client';

import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { createCheckoutSession, createCustomerPortalSession } from '@/app/actions/stripe';
import { useTransition } from 'react';

export function PricingTable({
    currentPlan,
    isTrialing = false,
}: {
    currentPlan: 'free' | 'pro';
    isTrialing?: boolean;
}) {
    const [isPending, startTransition] = useTransition();

    const handleUpgrade = (interval: 'monthly' | 'yearly') => {
        startTransition(async () => {
            await createCheckoutSession(interval);
        });
    };

    const handleManage = () => {
        startTransition(async () => {
            await createCustomerPortalSession();
        });
    };

    return (
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Free Plan */}
            <Card className="flex flex-col border-border bg-surface shadow-card">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-primary">Free</CardTitle>
                    <CardDescription className="text-text-secondary">Perfect for getting started</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                    <div className="text-4xl font-bold text-primary mb-6">$0<span className="text-lg font-normal text-text-tertiary">/mo</span></div>
                    <ul className="space-y-3">
                        <li className="flex items-center gap-2">
                            <Check className="h-5 w-5 text-green-600" />
                            <span className="text-text-primary">Up to 3 Clients</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <Check className="h-5 w-5 text-green-600" />
                            <span className="text-text-primary">Unlimited Invoices</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <Check className="h-5 w-5 text-green-600" />
                            <span className="text-text-primary">Basic Dashboard</span>
                        </li>
                    </ul>
                </CardContent>
                <CardFooter>
                    <Button variant="outline" className="w-full" disabled={currentPlan === 'free'}>
                        {currentPlan === 'free' ? 'Current Plan' : 'Downgrade to Free'}
                    </Button>
                </CardFooter>
            </Card>

            {/* Pro Plan */}
            <Card className={`flex flex-col border-primary bg-surface shadow-lg relative overflow-hidden ${currentPlan === 'pro' ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
                {currentPlan === 'pro' && (
                    <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                        CURRENT
                    </div>
                )}
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-primary">Pro</CardTitle>
                    <CardDescription className="text-text-secondary">For serious freelancers</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                    <div className="text-4xl font-bold text-primary mb-6">$19<span className="text-lg font-normal text-text-tertiary">/mo</span></div>
                    <ul className="space-y-3">
                        <li className="flex items-center gap-2">
                            <Check className="h-5 w-5 text-green-600" />
                            <span className="text-text-primary">Unlimited Clients</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <Check className="h-5 w-5 text-green-600" />
                            <span className="text-text-primary">Advanced Analytics</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <Check className="h-5 w-5 text-green-600" />
                            <span className="text-text-primary">Late Payment Reminders</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <Check className="h-5 w-5 text-green-600" />
                            <span className="text-text-primary">Custom Branding</span>
                        </li>
                    </ul>
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                    {currentPlan === 'pro' ? (
                        <Button className="w-full" onClick={handleManage} disabled={isPending}>
                            {isPending ? 'Loading...' : 'Manage Subscription'}
                        </Button>
                    ) : (
                        <>
                            <Button className="w-full" onClick={() => handleUpgrade('monthly')} disabled={isPending}>
                                {isPending ? 'Processing...' : 'Upgrade Monthly'}
                            </Button>
                            <Button variant="outline" className="w-full" onClick={() => handleUpgrade('yearly')} disabled={isPending}>
                                {isPending ? 'Processing...' : 'Upgrade Yearly ($190/yr)'}
                            </Button>
                        </>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
