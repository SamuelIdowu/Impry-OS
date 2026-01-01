'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import {
    Save,
    Share2,
    CheckCircle2,
    XCircle,
    HelpCircle,
    Copy,
    Check,
    Mail,
    Calendar,
    DollarSign
} from 'lucide-react';
import { fetchLatestScopeVersion, createScopeVersionAction, fetchScopeVersions } from '@/server/actions/scopes';
import type { ScopeVersion } from '@/lib/types/scope';
import type { Project, Client } from '@/lib/types';
import { getScopeShareUrl } from '@/lib/scopes';
import { ScopeShareDialog } from '@/components/scopeShareDialog';
import { StatusBadge } from '@/components/shared/StatusBadge';

interface ScopeTabProps {
    project: Project;
    client?: Client;
}

export function ScopeTab({ project, client }: ScopeTabProps) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [currentVersion, setCurrentVersion] = useState<ScopeVersion | null>(null);
    const [versions, setVersions] = useState<ScopeVersion[]>([]);

    // Draft state (local edits before freezing)
    const [deliverables, setDeliverables] = useState('');
    const [outOfScope, setOutOfScope] = useState('');
    const [assumptions, setAssumptions] = useState('');

    // Share dialog state
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const [shareUrl, setShareUrl] = useState('');

    // Load latest version
    useEffect(() => {
        loadLatestVersion();
    }, [project.id]);

    const loadLatestVersion = async () => {
        try {
            setLoading(true);
            const [latestResult, versionsResult] = await Promise.all([
                fetchLatestScopeVersion(project.id),
                fetchScopeVersions(project.id)
            ]);

            if (latestResult.success && latestResult.data) {
                setCurrentVersion(latestResult.data);
                setDeliverables(latestResult.data.deliverables || '');
                setOutOfScope(latestResult.data.out_of_scope || '');
                setAssumptions(latestResult.data.assumptions || '');
            }

            if (versionsResult.success && versionsResult.data) {
                setVersions(versionsResult.data);
            }
        } catch (error) {
            console.error('Failed to load scope version:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveVersion = async () => {
        try {
            setSaving(true);
            const result = await createScopeVersionAction({
                project_id: project.id,
                deliverables: deliverables || undefined,
                out_of_scope: outOfScope || undefined,
                assumptions: assumptions || undefined,
            });

            if (result.success && result.data) {
                setCurrentVersion(result.data.version);
                setShareUrl(result.data.shareUrl);
                setShareDialogOpen(true);
            } else {
                alert(result.error || 'Failed to save scope version');
            }
        } catch (error) {
            console.error('Failed to save scope version:', error);
            alert('Failed to save scope version');
        } finally {
            setSaving(false);
        }
    };

    const hasChanges = currentVersion
        ? (deliverables !== (currentVersion.deliverables || '') ||
            outOfScope !== (currentVersion.out_of_scope || '') ||
            assumptions !== (currentVersion.assumptions || ''))
        : (deliverables || outOfScope || assumptions);

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-12 bg-muted rounded-lg w-1/3" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="h-64 bg-muted rounded-lg" />
                        <div className="h-64 bg-muted rounded-lg" />
                    </div>
                    <div className="h-96 bg-muted rounded-lg" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header with Version Info and Actions */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-zinc-100">
                <div className="flex flex-col gap-3 max-w-2xl">
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
                        Project Scope
                    </h1>
                    <p className="text-zinc-500 text-base leading-relaxed">
                        Define the strict boundaries of this project. Clarity here prevents "scope creep" later.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSaveVersion} // Using save logic for draft button for now
                        disabled={saving || !hasChanges}
                        className="h-9 border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"
                    >
                        <Save className="h-4 w-4 mr-2" />
                        Save Draft
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleSaveVersion}
                        disabled={saving || !hasChanges}
                        className="h-9 bg-zinc-900 text-white hover:bg-zinc-800"
                    >
                        <Share2 className="h-4 w-4 mr-2" />
                        {saving ? 'Saving...' : 'Freeze & Share'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content (Left Column) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Deliverables Section */}
                    <Card className="border-zinc-200 shadow-sm overflow-hidden">
                        <div className="p-6 md:p-8 flex flex-col gap-5">
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-3 text-lg font-bold text-zinc-900">
                                    <span className="flex items-center justify-center size-8 rounded-full bg-green-50 text-green-600 border border-green-100">
                                        <CheckCircle2 className="h-5 w-5" />
                                    </span>
                                    In Scope (Deliverables)
                                </label>
                                <span className="text-[10px] font-medium text-zinc-500 bg-zinc-100 px-2 py-1 rounded-md tracking-wide uppercase">
                                    Markdown supported
                                </span>
                            </div>
                            <p className="text-zinc-500 text-sm">
                                What specifically are you building? Be as descriptive as possible.
                            </p>
                            <Textarea
                                value={deliverables}
                                onChange={(e) => setDeliverables(e.target.value)}
                                placeholder="- Homepage with Hero section&#10;- About page with team bios&#10;- Contact form integration (SendGrid)&#10;- Mobile responsive layout"
                                className="min-h-[250px] text-base leading-relaxed resize-y font-mono bg-zinc-50/50 border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900/10"
                            />
                        </div>
                    </Card>

                    {/* Out of Scope Section */}
                    <Card className="border-l-4 border-l-red-500 border-zinc-200 shadow-sm overflow-hidden">
                        <div className="p-6 md:p-8 flex flex-col gap-5">
                            <label className="flex items-center gap-3 text-lg font-bold text-zinc-900">
                                <span className="flex items-center justify-center size-8 rounded-full bg-red-50 text-red-500 border border-red-100">
                                    <XCircle className="h-5 w-5" />
                                </span>
                                Out of Scope
                            </label>
                            <p className="text-zinc-500 text-sm">
                                Explicitly list what you are NOT doing to manage expectations.
                            </p>
                            <Textarea
                                value={outOfScope}
                                onChange={(e) => setOutOfScope(e.target.value)}
                                placeholder="- Logo design or branding work&#10;- Content writing or copywriting&#10;- Hosting setup beyond initial deployment"
                                className="min-h-[180px] text-base leading-relaxed resize-y font-mono bg-zinc-50/50 border-zinc-200 focus:border-red-500 focus:ring-red-500/10"
                            />
                        </div>
                    </Card>

                    {/* Assumptions Section */}
                    <Card className="border-zinc-200 shadow-sm overflow-hidden">
                        <div className="p-6 md:p-8 flex flex-col gap-5">
                            <label className="flex items-center gap-3 text-lg font-bold text-zinc-900">
                                <span className="flex items-center justify-center size-8 rounded-full bg-amber-50 text-amber-600 border border-amber-100">
                                    <HelpCircle className="h-5 w-5" />
                                </span>
                                Assumptions & Dependencies
                            </label>
                            <p className="text-zinc-500 text-sm">
                                Conditions required for the project's success.
                            </p>
                            <Textarea
                                value={assumptions}
                                onChange={(e) => setAssumptions(e.target.value)}
                                placeholder="- Client provides all high-res assets by [Date]&#10;- Client has active hosting credentials&#10;- Feedback turnaround time is < 48 hours"
                                className="min-h-[180px] text-base leading-relaxed resize-y font-mono bg-zinc-50/50 border-zinc-200 focus:border-amber-500 focus:ring-amber-500/10"
                            />
                        </div>
                    </Card>
                </div>

                {/* Sidebar (Right Column) */}
                <div className="space-y-6">
                    {/* Project Details Card */}
                    <Card className="p-6 border-zinc-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 text-zinc-900 font-semibold">
                            <div className="p-1.5 bg-zinc-100 rounded-md">
                                <span className="text-zinc-600 text-sm font-bold">i</span>
                            </div>
                            Project Details
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 last:border-0 last:pb-0">
                                <span className="text-sm text-zinc-500">Total Budget</span>
                                <span className="text-sm font-bold text-zinc-900">${(project.totalValue || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 last:border-0 last:pb-0">
                                <span className="text-sm text-zinc-500">Deadline</span>
                                <span className="text-sm font-bold text-zinc-900">{project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'N/A'}</span>
                            </div>
                            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 last:border-0 last:pb-0">
                                <span className="text-sm text-zinc-500">Status</span>
                                <StatusBadge status={project.status} />
                            </div>
                        </div>
                    </Card>

                    {/* Client Info Card */}
                    <Card className="p-6 border-zinc-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 text-zinc-900 font-semibold">
                            <div className="p-1.5 bg-zinc-100 rounded-md">
                                <span className="text-zinc-600 text-xs">👤</span>
                            </div>
                            Client Info
                        </div>

                        {client ? (
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-full bg-zinc-100 flex items-center justify-center font-semibold text-zinc-600">
                                        {client.avatar || client.name.charAt(0)}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-zinc-900">{client.name}</span>
                                        <span className="text-xs text-zinc-500">{client.companyName}</span>
                                    </div>
                                </div>
                                <Button variant="outline" className="w-full text-zinc-700 border-zinc-200 hover:bg-zinc-50">
                                    <Mail className="h-4 w-4 mr-2" />
                                    Contact Client
                                </Button>
                            </div>
                        ) : (
                            <div className="text-sm text-zinc-500">No client information available.</div>
                        )}
                    </Card>

                    {/* Recent Activity Card */}
                    <Card className="p-6 border-zinc-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 text-zinc-900 font-semibold">
                            <div className="p-1.5 bg-zinc-100 rounded-md">
                                <span className="text-zinc-600 text-xs">🕒</span>
                            </div>
                            Recent Activity & Versions
                        </div>

                        <div className="relative pl-2 space-y-6 max-h-[300px] overflow-y-auto">
                            {/* Vertical Line */}
                            <div className="absolute left-[6px] top-2 bottom-2 w-px bg-zinc-200" />

                            {versions.length > 0 ? (
                                versions.map((version) => (
                                    <div key={version.id} className="relative pl-6">
                                        <div className="absolute left-0 top-1.5 size-3 rounded-full bg-zinc-900 ring-4 ring-white" />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-zinc-900">Version {version.version_number}</span>
                                            <span className="text-xs text-zinc-500 mt-1">{new Date(version.created_at).toLocaleDateString()} at {new Date(version.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="pl-6 text-sm text-zinc-500">No versions saved yet.</div>
                            )}
                        </div>
                    </Card>
                </div>
            </div >

            {/* Share Dialog */}
            < ScopeShareDialog
                open={shareDialogOpen}
                onClose={() => setShareDialogOpen(false)
                }
                shareUrl={shareUrl}
                versionNumber={currentVersion?.version_number || 0}
            />
        </div >
    );
}
