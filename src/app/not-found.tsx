import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
                <FileQuestion className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-2">Page Not Found</h2>
            <p className="text-muted-foreground max-w-[400px] mb-8 leading-relaxed">
                The page you are looking for doesn't exist or has been moved.
                Please check the URL or return to the dashboard.
            </p>
            <div className="flex gap-4">
                <Button variant="outline" asChild>
                    <Link href="/">Go Back</Link>
                </Button>
                <Button asChild>
                    <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
            </div>
        </div>
    );
}
