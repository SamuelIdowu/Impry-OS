'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4 text-center">
            <div className="rounded-full bg-red-50 p-4 mb-4 border border-red-100">
                <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">Something went wrong!</h2>
            <p className="text-muted-foreground max-w-[400px] mb-8 leading-relaxed">
                We encountered an unexpected error. Our team has been notified.
                Please try again or contact support if the problem persists.
            </p>
            <Button onClick={() => reset()} variant="default">
                Try again
            </Button>
            {error.digest && (
                <p className="mt-8 text-xs text-muted-foreground font-mono">
                    Error ID: {error.digest}
                </p>
            )}
        </div>
    );
}
