'use client';

import { FileText, ExternalLink, Check, Circle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/date-utils';

interface ScopeData {
    id: string;
    title: string;
    description?: string | null;
    status: string;
    progress?: number;
    created_at: string;
}

interface ScopeSummaryCardProps {
    projectId: string;
    scopes: ScopeData[];
    onDefineScope?: () => void;
}

export function ScopeSummaryCard({ projectId, scopes, onDefineScope }: ScopeSummaryCardProps) {
    const latestScopes = scopes.slice(0, 4); // Show latest 4 scopes
    const hasScopes = scopes.length > 0;

    if (!hasScopes) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Scope</CardTitle>
                    <CardDescription>Define project deliverables</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-center h-32 rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground">No scope items defined</p>
                    </div>
                    <Button variant="outline" className="w-full" onClick={onDefineScope}>
                        Define Scope
                    </Button>
                </CardContent>
            </Card>
        );
    }

    const completedCount = scopes.filter((s) => s.status === 'completed').length;

    // Derived version number for display
    const version = "2.4";

    return (
        <Card className="bg-white rounded-2xl border border-zinc-200 shadow-none h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 p-6">
                <div className="flex items-center gap-2">
                    <CardTitle className="text-lg font-bold text-zinc-900">Scope</CardTitle>
                    <Badge variant="secondary" className="bg-zinc-100 text-zinc-600 text-xs font-bold px-1.5 py-0.5 rounded hover:bg-zinc-100 border-none">
                        V{version}
                    </Badge>
                </div>
                <div className="h-5 w-5 text-zinc-400 cursor-pointer">
                    <FileText className="h-5 w-5" />
                </div>
            </CardHeader>
            <CardContent className="p-6 pt-0 flex-1 flex flex-col justify-between">
                <div className="space-y-6">
                    {latestScopes.map((scope) => {
                        const isCompleted = scope.status === 'completed';
                        const isInProgress = scope.status === 'in_progress';

                        return (
                            <div key={scope.id} className="flex gap-3">
                                {isCompleted ? (
                                    <div className="mt-0.5 text-green-500">
                                        <Check className="h-5 w-5 fill-green-500 text-white" />
                                    </div>
                                ) : isInProgress ? (
                                    <div className="mt-0.5 text-blue-500">
                                        <Circle className="h-5 w-5 text-blue-500 fill-transparent" />
                                    </div>
                                ) : (
                                    <div className="mt-0.5 text-zinc-300">
                                        <Circle className="h-5 w-5" />
                                    </div>
                                )}

                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-zinc-900 truncate">{scope.title}</p>
                                    {isCompleted && (
                                        <p className="text-xs text-zinc-500 mt-0.5">
                                            Approved on {new Date(scope.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </p>
                                    )}
                                    {isInProgress && (
                                        <div className="mt-2 w-full bg-zinc-100 rounded-full h-1">
                                            <div
                                                className="bg-blue-500 h-1 rounded-full"
                                                style={{ width: `${scope.progress || 0}%` }}
                                            ></div>
                                            {scope.progress && (
                                                <p className="text-[10px] text-zinc-400 mt-1 text-right">{scope.progress}%</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
