'use client';

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PricingPage() {
    return (
        <div className="container mx-auto py-24 px-4 text-center">
            <h1 className="text-4xl font-bold mb-6">Subscriptions Paused</h1>
            <p className="text-lg text-gray-500 mb-8 max-w-lg mx-auto">
                We are currently upgrading our payment system. Please check back later or contact support if you have any questions.
            </p>
            <Button asChild>
                <Link href="/dashboard">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Link>
            </Button>
        </div>
    );
}
