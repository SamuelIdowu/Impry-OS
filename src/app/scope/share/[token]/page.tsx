import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { CheckCircle2, XCircle, HelpCircle, Lock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { fetchScopeByShareToken } from '@/server/actions/scopes';

interface PublicScopePageProps {
    params: Promise<{
        token: string;
    }>;
}

export async function generateMetadata({ params }: PublicScopePageProps): Promise<Metadata> {
    const { token } = await params;
    const result = await fetchScopeByShareToken(token);

    if (!result.success || !result.data) {
        return {
            title: 'Scope Not Found',
        };
    }

    return {
        title: `${result.data.project?.name || 'Project'} - Scope Snapshot`,
        description: 'View the project scope, deliverables, and assumptions.',
    };
}

export default async function PublicScopePage({ params }: PublicScopePageProps) {
    const { token } = await params;
    const result = await fetchScopeByShareToken(token);

    if (!result.success || !result.data) {
        notFound();
    }

    const scope = result.data;
    const projectName = scope.project?.name || 'Project';

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 flex items-center justify-between bg-background/80 backdrop-blur-md border-b px-6 md:px-10 py-4">
                <div className="flex items-center gap-3">
                    <div className="size-9 bg-foreground text-background flex items-center justify-center rounded-lg shadow-sm">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-5 h-5"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
                            />
                        </svg>
                    </div>
                    <h2 className="text-lg font-bold tracking-tight">FreelanceOS</h2>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Lock className="h-4 w-4" />
                    <span className="hidden sm:inline">Read-only view</span>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex flex-1 w-full justify-center">
                <div className="flex flex-col w-full max-w-[1280px] px-4 md:px-10 py-10 gap-8">
                    {/* Project Info Header */}
                    <div className="flex flex-col gap-3 pb-6 border-b">
                        <div className="flex items-center gap-3">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-gray-100 text-foreground border">
                                v{scope.version_number}
                            </span>
                            <span className="text-muted-foreground text-xs">
                                • Created {new Date(scope.created_at).toLocaleDateString()}
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                            {projectName} - Scope
                        </h1>
                        <p className="text-muted-foreground text-lg leading-relaxed">
                            This document outlines the project scope, boundaries, and assumptions.
                        </p>
                    </div>

                    {/* Scope Sections */}
                    <div className="grid grid-cols-1 gap-6">
                        {/* Deliverables Section */}
                        <Card className="p-1">
                            <div className="rounded-xl p-6 md:p-8 flex flex-col gap-5">
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center justify-center size-9 rounded-full bg-green-50 text-green-600 border border-green-100">
                                        <CheckCircle2 className="h-5 w-5" />
                                    </span>
                                    <h2 className="text-lg font-bold">In Scope (Deliverables)</h2>
                                </div>
                                <div className="text-base leading-relaxed whitespace-pre-wrap font-mono bg-muted/30 border border-border rounded-xl p-5">
                                    {scope.deliverables || 'No deliverables specified'}
                                </div>
                            </div>
                        </Card>

                        {/* Out of Scope Section */}
                        <Card className="p-1 border-l-4 border-l-red-500">
                            <div className="rounded-xl p-6 md:p-8 flex flex-col gap-5">
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center justify-center size-9 rounded-full bg-red-50 text-red-500 border border-red-100">
                                        <XCircle className="h-5 w-5" />
                                    </span>
                                    <h2 className="text-lg font-bold">Out of Scope</h2>
                                </div>
                                <div className="text-base leading-relaxed whitespace-pre-wrap font-mono bg-muted/30 border border-border rounded-xl p-5">
                                    {scope.out_of_scope || 'No out-of-scope items specified'}
                                </div>
                            </div>
                        </Card>

                        {/* Assumptions Section */}
                        <Card className="p-1">
                            <div className="rounded-xl p-6 md:p-8 flex flex-col gap-5">
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center justify-center size-9 rounded-full bg-amber-50 text-amber-600 border border-amber-100">
                                        <HelpCircle className="h-5 w-5" />
                                    </span>
                                    <h2 className="text-lg font-bold">Assumptions & Dependencies</h2>
                                </div>
                                <div className="text-base leading-relaxed whitespace-pre-wrap font-mono bg-muted/30 border border-border rounded-xl p-5">
                                    {scope.assumptions || 'No assumptions specified'}
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Footer */}
                    <div className="text-center text-sm text-muted-foreground pt-8 border-t">
                        <p>Powered by <span className="font-semibold">FreelanceOS</span></p>
                        <p className="text-xs mt-1">
                            This is a read-only view. Changes can only be made by the project owner.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
