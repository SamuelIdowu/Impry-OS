import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { FolderPlus, CheckCircle } from 'lucide-react';

interface EmptyClientProjectsProps {
    onAddProject?: () => void;
    clientName?: string;
}

export function EmptyClientProjects({ onAddProject, clientName = "this client" }: EmptyClientProjectsProps) {
    return (
        <EmptyState
            title="No projects for this client yet"
            description={`Start tracking work, scope, and payments for ${clientName} by creating your first project.`}
            icons={[
                <div key="icon" className="size-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                    <FolderPlus className="h-10 w-10 text-primary" />
                </div>
            ]}
            action={
                <Button onClick={onAddProject} size="lg" className="gap-2 font-bold shadow-lg shadow-primary/20">
                    <FolderPlus className="h-5 w-5" />
                    Create New Project
                </Button>
            }
            secondaryAction={
                <div className="mt-8 flex gap-6 text-sm text-muted-foreground justify-center">
                    <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        <span>Track Time</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        <span>Manage Scope</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        <span>Secure Payments</span>
                    </div>
                </div>
            }
        />
    );
}
