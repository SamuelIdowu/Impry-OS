"use client";

import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Mail,
    Shield,
    User,
    UserPlus,
    Check,
    Copy,
    Loader2,
    CheckCircle2,
    AlertCircle
} from "lucide-react";
import { inviteMemberAction } from "@/server/actions/invitations";

interface InviteMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    workspaceId: string;
    onSuccess?: () => void;
}

export function InviteMemberModal({
    isOpen,
    onClose,
    workspaceId,
    onSuccess
}: InviteMemberModalProps) {
    const [email, setEmail] = useState("");
    const [role, setRole] = useState<"admin" | "member">("member");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedLink, setGeneratedLink] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        setIsLoading(true);
        setError(null);

        try {
            const res = await inviteMemberAction({
                email: email.trim(),
                role,
                workspaceId
            });

            if (res.success && res.invitation) {
                const origin = typeof window !== "undefined" ? window.location.origin : "";
                setGeneratedLink(`${origin}/invite/${res.invitation.token}`);
                if (onSuccess) onSuccess();
            } else {
                setError(res.error || "Failed to send invitation");
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        if (!generatedLink) return;
        navigator.clipboard.writeText(generatedLink);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2500);
    };

    const handleResetAndClose = () => {
        setEmail("");
        setRole("member");
        setError(null);
        setGeneratedLink(null);
        setIsCopied(false);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleResetAndClose()}>
            <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-2xl shadow-2xl">
                <DialogHeader className="p-5 pb-3 border-b border-zinc-100 dark:border-zinc-800/80 shrink-0 text-left">
                    <DialogTitle className="text-lg font-bold tracking-tight flex items-center gap-2">
                        <UserPlus className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
                        Invite Workspace Member
                    </DialogTitle>
                    <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        Send an email invite or generate an invitation link for your team member.
                    </DialogDescription>
                </DialogHeader>

                {generatedLink ? (
                    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
                        <div className="p-5 space-y-4 overflow-y-auto flex-1">
                            <div className="flex items-center gap-2.5 p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs rounded-xl">
                                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                                <span>
                                    Invitation successfully generated for <strong>{email}</strong>.
                                </span>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                                    Direct Invite Link
                                </Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        readOnly
                                        value={generatedLink}
                                        className="h-9 text-xs bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 font-mono select-all"
                                    />
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={handleCopy}
                                        variant="outline"
                                        className="h-9 shrink-0 gap-1.5 text-xs"
                                    >
                                        {isCopied ? (
                                            <>
                                                <Check className="h-3.5 w-3.5 text-emerald-600" />
                                                <span className="text-emerald-600">Copied</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="h-3.5 w-3.5" />
                                                <span>Copy</span>
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="p-4 bg-zinc-50/80 dark:bg-zinc-900/60 border-t border-zinc-100 dark:border-zinc-800 shrink-0">
                            <Button
                                type="button"
                                size="sm"
                                onClick={handleResetAndClose}
                                className="w-full h-8 text-xs bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 font-medium"
                            >
                                Done
                            </Button>
                        </DialogFooter>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
                        <div className="p-5 space-y-4 overflow-y-auto flex-1">
                            {error && (
                                <div className="flex items-center gap-2.5 p-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-xs rounded-lg">
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <Label htmlFor="invite-email" className="text-[11px] font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                                    Email Address <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                                    <Input
                                        id="invite-email"
                                        type="email"
                                        placeholder="colleague@agency.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="pl-9 h-9 text-xs bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                                    Workspace Role
                                </Label>
                                <div className="grid grid-cols-2 gap-2.5">
                                    <button
                                        type="button"
                                        onClick={() => setRole("member")}
                                        className={`flex flex-col text-left p-3 rounded-xl border transition-all ${
                                            role === "member"
                                                ? "border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-900 ring-1 ring-zinc-900 dark:ring-zinc-100"
                                                : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                                        }`}
                                    >
                                        <div className="flex items-center gap-1.5 mb-0.5">
                                            <User className="h-3.5 w-3.5 text-zinc-700 dark:text-zinc-300" />
                                            <span className="text-xs font-semibold">Member</span>
                                        </div>
                                        <span className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">
                                            View projects, tasks & deliverables.
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setRole("admin")}
                                        className={`flex flex-col text-left p-3 rounded-xl border transition-all ${
                                            role === "admin"
                                                ? "border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-900 ring-1 ring-zinc-900 dark:ring-zinc-100"
                                                : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                                        }`}
                                    >
                                        <div className="flex items-center gap-1.5 mb-0.5">
                                            <Shield className="h-3.5 w-3.5 text-zinc-700 dark:text-zinc-300" />
                                            <span className="text-xs font-semibold">Admin</span>
                                        </div>
                                        <span className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">
                                            Manage clients, invoices & team.
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="p-4 bg-zinc-50/80 dark:bg-zinc-900/60 border-t border-zinc-100 dark:border-zinc-800 shrink-0 flex flex-row items-center justify-end gap-2 sm:gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleResetAndClose}
                                disabled={isLoading}
                                className="h-8 text-xs font-medium"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={isLoading || !email.trim()}
                                className="h-8 text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900"
                            >
                                {isLoading && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                                Send Invitation
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
