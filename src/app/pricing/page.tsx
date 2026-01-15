'use client';

import { PricingTable } from '@/components/stripe/pricing-table';

export default function PricingPage() {
    // In a real implementation, you might fetch the current user's plan here
    // For now, we default to 'free', or we could fetch it client-side if we had a hook.
    // However, since this page is public or semi-public, 'free' is a safe default.
    // If we want to show "Current Plan", we'd need to know.

    return (
        <div className="container mx-auto py-12 px-4">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
                <p className="text-lg text-gray-500">Choose the plan that's right for your freelance business.</p>
            </div>

            <div className="max-w-4xl mx-auto">
                <PricingTable currentPlan="free" />
            </div>
        </div>
    );
}
