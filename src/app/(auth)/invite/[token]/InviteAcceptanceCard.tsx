"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Users,
    Shield,
    Crown,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    Loader2,
    LogIn,
    UserPlus,
    Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { acceptInvitationAction } from "@/server/actions/invitations";

interface InviteAcceptanceCardProps {
    invitation: any;
    currentUser: any;
    token: string;
}

export function InviteAcceptanceCard({
    invitation,
    currentUser,
    token
}: InviteAcceptanceCardProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const workspace = invitation.workspace;
    const inviter = invitation.inviter;
    const isExpired = invitation.isExpired || new Date() > new Date(invitation.expiresAt);
    const isAlreadyAccepted = invitation.status === "accepted";
    const isRevoked = invitation.status === "revoked";

    const handleAccept = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await acceptInvitationAction(token);
            if (res.success && res.workspaceId) {
                router.push(`/${res.workspaceId}/dashboard`);
            } else {
                setError(res.error || "Failed to accept invitation");
                setIsLoading(false);
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred");
            setIsLoading(false);
        }
    };

    if (isRevoked || isAlreadyAccepted || isExpired) {
        return (
            <div className="w-full max-w-md p-8 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-xl text-center space-y-6">
                <div className="size-16 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400">
                    <AlertCircle className="h-8 w-8" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                        {isAlreadyAccepted
                            ? "Invitation Already Accepted"
                            : isRevoked
                            ? "Invitation Revoked"
                            : "Invitation Expired"}
                    </h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {isAlreadyAccepted
                            ? "This invitation token has already been claimed."
                            : isRevoked
                            ? "This invitation was revoked by the workspace administrator."
                            : "This invitation link has expired. Please ask the inviter for a new invite."}
                    </p>
                </div>
                <div className="pt-2">
                    <Button asChild className="w-full bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900">
                        <Link href="/workspaces">Go to Workspaces</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md p-8 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-xl space-y-6">
            {/* Workspace Logo / Header */}
            <div className="text-center space-y-3">
                <div className="size-16 mx-auto rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center text-2xl font-black shadow-md">
                    {workspace?.name ? workspace.name.slice(0, 2).toUpperCase() : "OS"}
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                        Join {workspace?.name || "Workspace"}
                    </h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                        <strong>{inviter?.name || "A team member"}</strong> invited you to collaborate.
                    </p>
                </div>
            </div>

            {/* Invite Details Card */}
            <div className="p-4 bg-zinc-50 dark:bg-zinc-900/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-3">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500 dark:text-zinc-400">Invited Role</span>
                    <Badge
                        variant="secondary"
                        className="bg-zinc-200/70 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-semibold uppercase tracking-wider text-[10px] px-2.5 py-0.5"
                    >
                        {invitation.role === "admin" ? "Admin" : "Member"}
                    </Badge>
                </div>
                <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500 dark:text-zinc-400">Invited Email</span>
                    <span className="font-mono text-zinc-700 dark:text-zinc-300 font-medium">
                        {invitation.email}
                    </span>
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-xs rounded-xl">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Actions depending on auth state */}
            {currentUser ? (
                <div className="space-y-3">
                    <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="truncate">
                            Logged in as <strong>{currentUser.email}</strong>
                        </span>
                    </div>

                    <Button
                        onClick={handleAccept}
                        disabled={isLoading}
                        className="w-full h-11 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold gap-2 rounded-xl shadow-sm"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Joining Workspace...
                            </>
                        ) : (
                            <>
                                Accept & Join Workspace
                                <ArrowRight className="h-4 w-4" />
                            </>
                        )}
                    </Button>
                </div>
            ) : (
                <div className="space-y-3">
                    <p className="text-xs text-center text-zinc-500 dark:text-zinc-400">
                        Please sign in or create an account to accept this invitation.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            asChild
                            variant="outline"
                            className="w-full h-10 text-xs font-medium rounded-xl gap-1.5"
                        >
                            <Link href={`/login?redirect=/invite/${token}`}>
                                <LogIn className="h-3.5 w-3.5" />
                                Sign In
                            </Link>
                        </Button>
                        <Button
                            asChild
                            className="w-full h-10 bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 text-xs font-medium rounded-xl gap-1.5"
                        >
                            <Link href={`/register?redirect=/invite/${token}`}>
                                <UserPlus className="h-3.5 w-3.5" />
                                Register
                            </Link>
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
