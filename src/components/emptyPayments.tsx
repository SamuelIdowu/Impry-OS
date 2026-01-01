import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Plus } from 'lucide-react';
import Link from 'next/link';

interface EmptyPaymentsProps {
    onAddPayment?: () => void;
}

export function EmptyPayments({ onAddPayment }: EmptyPaymentsProps) {
    return (
        <EmptyState
            title="No payments added"
            description="Track money for this project. Keep a clear record of incoming revenue, sent invoices, and outstanding balances to ensure you get paid on time."
            image="https://lh3.googleusercontent.com/aida-public/AB6AXuAc5WnWPy_JuxpjtqhGhhTIuS-qYPnbp2-DXWBDjgBeciGQfIE2xaA172pXaXiv4Y7rF-vuA4_l3iWFI_AdLhhIAbO_maB76JrO5VLTGnDOXUdqN4-jrgeZ7BOy1LWeZW_a5AXN5E7SpjR8832cGqcLG6Tb4kE5RkcobunhqmECcQ3uHQYbZFFerflcnCoWjUhawgWTQxLRcVI_v0uChFP-sUGU4FtryrodAoa0Kr_ZQ1tB0XSAiZFoo9yzI7jvQy-4RnxTXmYksrc"
            action={
                <Button onClick={onAddPayment} size="lg" className="w-full sm:w-auto min-w-[160px] font-bold gap-2">
                    <Plus className="h-5 w-5" />
                    Add Payment
                </Button>
            }
            secondaryAction={
                <Link
                    href="#"
                    className="text-muted-foreground hover:text-primary text-sm font-medium underline underline-offset-4 decoration-border hover:decoration-primary transition-colors block text-center"
                >
                    Learn how payments work
                </Link>
            }
        />
    );
}
