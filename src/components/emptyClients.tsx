import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Lightbulb, ArrowRight, Plus } from 'lucide-react';

interface EmptyClientsProps {
    onAddClient?: () => void;
    onImport?: () => void;
}

export function EmptyClients({ onAddClient, onImport }: EmptyClientsProps) {
    return (
        <EmptyState
            title="No clients added yet"
            description="Start by adding your first client to track projects, scope, and payments. It only takes a few seconds to get set up."
            image="https://lh3.googleusercontent.com/aida-public/AB6AXuBe3lKTzWDerzTmrSvMH_CsCvEt5w1h4qtD8B3JXTIsoNkIJoA3CIA76hk9pWsoXQ6MdtnIV1essaeLh9HY-f3bkxISePfolGoDGop0z5EGcTF4v8iIIgF6IlhffAiJBFQuG-YhcLheriV07DKZL33Kdn3gyTP8UFT-U8C6E33tyrHv07-bu_0IxSaoh_Q132Qx0mhBT7QcQHVprZ14Pj05gVQLwkOeRag6G5_L8gBBoBUzv18TwSaeFuD-MsBPNHrnauwhZiWezPk"
            action={
                <Button onClick={onAddClient} size="lg" className="w-full sm:w-auto font-bold gap-2">
                    <Plus className="h-5 w-5" />
                    Add New Client
                </Button>
            }
            secondaryAction={
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm text-left">
                    <div className="flex items-start gap-4">
                        <div className="rounded-full bg-primary/10 p-2 text-primary hidden md:block">
                            <Lightbulb className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 mb-1">Quick Tip</h3>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">Have a lot of clients? You can bulk import your existing contacts via CSV.</p>
                        </div>
                    </div>
                    <button
                        onClick={onImport}
                        className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-zinc-50 hover:text-primary transition-colors whitespace-nowrap pl-12 md:pl-0"
                    >
                        Import from CSV
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </div>
            }
        />
    );
}
