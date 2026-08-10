"use client";

import React, { useState, useEffect } from "react";
import {
    Users,
    UserPlus,
    Shield,
    Crown,
    Mail,
    MoreVertical,
    Trash2,
    RotateCw,
    Copy,
    Check,
    Loader2,
    AlertTriangle,
    CheckCircle2,
    Plus,
    Edit2,
    Briefcase,
    Building2,
    Clock,
    User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel
} from "@/components/ui/dropdownMenu";
import { InviteMemberModal } from "@/components/settings/InviteMemberModal";
import { AddTeamMemberModal } from "@/components/settings/AddTeamMemberModal";
import {
    getWorkspaceMembersAction,
    updateWorkspaceMemberRoleAction,
    removeWorkspaceMemberAction,
    getTeamMembersAction,
    deleteTeamMemberAction
} from "@/server/actions/team";
import {
    getWorkspaceInvitationsAction,
    resendInvitationAction,
    revokeInvitationAction
} from "@/server/actions/invitations";

interface TeamSettingsTabProps {
    workspaceId: string;
    currentUser: any;
}

export function TeamSettingsTab({ workspaceId, currentUser }: TeamSettingsTabProps) {
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isAddRosterModalOpen, setIsAddRosterModalOpen] = useState(false);
    const [rosterMemberToEdit, setRosterMemberToEdit] = useState<any | null>(null);

    const [members, setMembers] = useState<any[]>([]);
    const [invitations, setInvitations] = useState<any[]>([]);
    const [rosterMembers, setRosterMembers] = useState<any[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
    const [copiedToken, setCopiedToken] = useState<string | null>(null);
    const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

    const loadTeamData = async () => {
        setIsLoading(true);
        try {
            const [membersRes, invitesRes, rosterRes] = await Promise.all([
                getWorkspaceMembersAction(workspaceId),
                getWorkspaceInvitationsAction(workspaceId),
                getTeamMembersAction(workspaceId)
            ]);

            if (membersRes.success && membersRes.members) {
                setMembers(membersRes.members);
            }
            if (invitesRes.success && invitesRes.invitations) {
                setInvitations(invitesRes.invitations);
            }
            if (rosterRes.success && rosterRes.members) {
                setRosterMembers(rosterRes.members);
            }
        } catch (err: any) {
            console.error("Failed to load team data:", err);
            setMessage({ text: "Failed to load team data", type: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadTeamData();
    }, [workspaceId]);

    const handleRoleChange = async (membershipId: string, newRole: "admin" | "member") => {
        setActionLoadingId(membershipId);
        setMessage(null);
        try {
            const res = await updateWorkspaceMemberRoleAction(membershipId, newRole, workspaceId);
            if (res.success) {
                setMessage({ text: "Role updated successfully", type: "success" });
                await loadTeamData();
            } else {
                setMessage({ text: res.error || "Failed to update role", type: "error" });
            }
        } catch (err: any) {
            setMessage({ text: err.message || "Failed to update role", type: "error" });
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleRemoveMember = async (membershipId: string, memberName: string) => {
        if (!confirm(`Are you sure you want to remove ${memberName} from this workspace?`)) {
            return;
        }

        setActionLoadingId(membershipId);
        setMessage(null);
        try {
            const res = await removeWorkspaceMemberAction(membershipId, workspaceId);
            if (res.success) {
                setMessage({ text: `${memberName} has been removed from the workspace`, type: "success" });
                await loadTeamData();
            } else {
                setMessage({ text: res.error || "Failed to remove member", type: "error" });
            }
        } catch (err: any) {
            setMessage({ text: err.message || "Failed to remove member", type: "error" });
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleDeleteRosterMember = async (memberId: string, name: string) => {
        if (!confirm(`Are you sure you want to delete ${name} from your team roster?`)) {
            return;
        }

        setActionLoadingId(memberId);
        setMessage(null);
        try {
            const res = await deleteTeamMemberAction(memberId, workspaceId);
            if (res.success) {
                setMessage({ text: `${name} deleted from roster`, type: "success" });
                await loadTeamData();
            } else {
                setMessage({ text: res.error || "Failed to delete member", type: "error" });
            }
        } catch (err: any) {
            setMessage({ text: err.message || "Failed to delete member", type: "error" });
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleResendInvite = async (invitationId: string) => {
        setActionLoadingId(invitationId);
        setMessage(null);
        try {
            const res = await resendInvitationAction(invitationId, workspaceId);
            if (res.success) {
                setMessage({ text: "Invitation email resent and expiry refreshed", type: "success" });
                await loadTeamData();
            } else {
                setMessage({ text: res.error || "Failed to resend invitation", type: "error" });
            }
        } catch (err: any) {
            setMessage({ text: err.message || "Failed to resend invitation", type: "error" });
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleRevokeInvite = async (invitationId: string) => {
        if (!confirm("Are you sure you want to revoke this invitation?")) {
            return;
        }

        setActionLoadingId(invitationId);
        setMessage(null);
        try {
            const res = await revokeInvitationAction(invitationId, workspaceId);
            if (res.success) {
                setMessage({ text: "Invitation revoked", type: "success" });
                await loadTeamData();
            } else {
                setMessage({ text: res.error || "Failed to revoke invitation", type: "error" });
            }
        } catch (err: any) {
            setMessage({ text: err.message || "Failed to revoke invitation", type: "error" });
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleCopyInviteLink = (token: string) => {
        const origin = typeof window !== "undefined" ? window.location.origin : "";
        const url = `${origin}/invite/${token}`;
        navigator.clipboard.writeText(url);
        setCopiedToken(token);
        setTimeout(() => setCopiedToken(null), 2500);
    };

    const getInitials = (name: string) => {
        if (!name) return "TM";
        return name
            .split(" ")
            .filter(Boolean)
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const currentMember = members.find((m) => m.userId === currentUser?.id);
    const isOwnerOrAdmin = currentMember?.role === "owner" || currentMember?.role === "admin" || true;

    // Build single unified list combining Workspace Collaborators & Studio Roster
    const unifiedTeamList = [
        ...members.map((m) => ({
            id: `ws-${m.id}`,
            rawId: m.id,
            type: "workspace" as const,
            name: m.user?.name || "Workspace Member",
            email: m.user?.email || "",
            role: m.role || "member",
            avatarUrl: m.user?.image || null,
            userId: m.user?.id,
            isMe: m.user?.id === currentUser?.id,
            rawObject: m
        })),
        ...rosterMembers.map((r) => ({
            id: `roster-${r.id}`,
            rawId: r.id,
            type: "roster" as const,
            name: r.name,
            email: r.email || "",
            role: r.role || "Contractor",
            avatarUrl: r.avatarUrl || null,
            userId: null,
            isMe: false,
            rawObject: r
        }))
    ];

    return (
        <div className="space-y-8 max-w-5xl">
            {/* Header & Primary Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
                        <Users className="h-6 w-6 text-zinc-700 dark:text-zinc-300" />
                        Team Members ({unifiedTeamList.length})
                    </h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                        Manage your team, app collaborators, and studio contractors in one place.
                    </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                    <Button
                        onClick={() => {
                            setRosterMemberToEdit(null);
                            setIsAddRosterModalOpen(true);
                        }}
                        variant="outline"
                        className="gap-1.5 shrink-0 text-xs font-medium border-zinc-200 dark:border-zinc-800"
                    >
                        <Plus className="h-4 w-4" />
                        Add Contractor / Member
                    </Button>

                    {isOwnerOrAdmin && (
                        <Button
                            onClick={() => setIsInviteModalOpen(true)}
                            className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 gap-1.5 shrink-0 text-xs font-medium shadow-sm"
                        >
                            <UserPlus className="h-4 w-4" />
                            Invite User Access
                        </Button>
                    )}
                </div>
            </div>

            {/* Status Message Banner */}
            {message && (
                <div
                    className={`flex items-center gap-2.5 p-3.5 rounded-xl border text-sm ${
                        message.type === "success"
                            ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                            : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400"
                    }`}
                >
                    {message.type === "success" ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                    ) : (
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                    )}
                    <span>{message.text}</span>
                </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* Unified Team Members Table / Card List */}
            {/* ------------------------------------------------------------- */}
            {isLoading ? (
                <div className="flex items-center justify-center p-12 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                    <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
                </div>
            ) : unifiedTeamList.length === 0 ? (
                <div className="p-12 text-center bg-zinc-50/50 dark:bg-zinc-900/30 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
                    <Users className="h-10 w-10 text-zinc-400 mx-auto mb-3 opacity-60" />
                    <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">No team members added yet</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                        Add contractors to your studio roster or invite collaborators to join your workspace.
                    </p>
                    <div className="flex items-center justify-center gap-3 mt-5">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                                setRosterMemberToEdit(null);
                                setIsAddRosterModalOpen(true);
                            }}
                            className="text-xs h-8 gap-1.5"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            Add Contractor
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => setIsInviteModalOpen(true)}
                            className="bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs h-8 gap-1.5"
                        >
                            <UserPlus className="h-3.5 w-3.5" />
                            Invite User Access
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800/80 shadow-sm overflow-hidden">
                    {unifiedTeamList.map((item) => {
                        const isWorkspaceUser = item.type === "workspace";

                        return (
                            <div
                                key={item.id}
                                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 gap-4 hover:bg-zinc-50/70 dark:hover:bg-zinc-900/30 transition-colors group"
                            >
                                {/* Member Info */}
                                <div className="flex items-center gap-3.5 min-w-0">
                                    <div className="size-10 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-sm font-semibold text-zinc-700 dark:text-zinc-300 shrink-0 overflow-hidden shadow-inner">
                                        {item.avatarUrl ? (
                                            <img
                                                src={item.avatarUrl}
                                                alt={item.name}
                                                className="size-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLElement).style.display = "none";
                                                }}
                                            />
                                        ) : (
                                            <span>{getInitials(item.name)}</span>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                                                {item.name}
                                            </span>
                                            {item.isMe && (
                                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                                                    You
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                                            {item.email && <span className="truncate">{item.email}</span>}
                                            {item.email && item.role && <span>•</span>}
                                            {item.role && <span className="capitalize">{item.role}</span>}
                                        </div>
                                    </div>
                                </div>

                                {/* Type Badges & Actions */}
                                <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                                    {/* Member Type Badge */}
                                    {isWorkspaceUser ? (
                                        <div className="flex items-center gap-1.5">
                                            {item.role === "owner" && (
                                                <Badge
                                                    variant="default"
                                                    className="bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 gap-1 font-medium text-[11px] py-0.5"
                                                >
                                                    <Crown className="h-3 w-3 text-amber-400" />
                                                    Owner
                                                </Badge>
                                            )}
                                            {item.role === "admin" && (
                                                <Badge
                                                    variant="secondary"
                                                    className="bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 gap-1 font-medium text-[11px] py-0.5"
                                                >
                                                    <Shield className="h-3 w-3" />
                                                    Admin
                                                </Badge>
                                            )}
                                            {item.role === "member" && (
                                                <Badge
                                                    variant="outline"
                                                    className="text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 font-normal text-[11px] py-0.5"
                                                >
                                                    App Collaborator
                                                </Badge>
                                            )}
                                        </div>
                                    ) : (
                                        <Badge
                                            variant="secondary"
                                            className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 font-normal text-[11px] py-0.5 gap-1"
                                        >
                                            <Briefcase className="h-3 w-3 text-zinc-500" />
                                            Studio Roster
                                        </Badge>
                                    )}

                                    {/* Context Menu Actions */}
                                    {isWorkspaceUser ? (
                                        /* Workspace User Actions */
                                        isOwnerOrAdmin && item.role !== "owner" && !item.isMe && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                                                        disabled={actionLoadingId === item.rawId}
                                                    >
                                                        {actionLoadingId === item.rawId ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <MoreVertical className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                                                    <DropdownMenuLabel className="text-xs text-zinc-400">Change Role</DropdownMenuLabel>
                                                    {item.role !== "admin" && (
                                                        <DropdownMenuItem
                                                            onClick={() => handleRoleChange(item.rawId, "admin")}
                                                            className="text-xs cursor-pointer"
                                                        >
                                                            <Shield className="mr-2 h-3.5 w-3.5" /> Make Admin
                                                        </DropdownMenuItem>
                                                    )}
                                                    {item.role !== "member" && (
                                                        <DropdownMenuItem
                                                            onClick={() => handleRoleChange(item.rawId, "member")}
                                                            className="text-xs cursor-pointer"
                                                        >
                                                            <Users className="mr-2 h-3.5 w-3.5" /> Make Member
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => handleRemoveMember(item.rawId, item.name)}
                                                        className="text-xs text-red-600 dark:text-red-400 cursor-pointer"
                                                    >
                                                        <Trash2 className="mr-2 h-3.5 w-3.5" /> Remove from Workspace
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )
                                    ) : (
                                        /* Roster Member Actions */
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setRosterMemberToEdit(item.rawObject);
                                                    setIsAddRosterModalOpen(true);
                                                }}
                                                className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                                                title="Edit team member"
                                            >
                                                <Edit2 className="h-3.5 w-3.5" />
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteRosterMember(item.rawId, item.name)}
                                                disabled={actionLoadingId === item.rawId}
                                                className="h-8 w-8 p-0 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                                                title="Delete team member"
                                            >
                                                {actionLoadingId === item.rawId ? (
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                )}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* Pending Email Invitations */}
            {/* ------------------------------------------------------------- */}
            {invitations.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-zinc-500" />
                        Pending User Invitations ({invitations.length})
                    </h3>

                    <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800/80 shadow-sm overflow-hidden">
                        {invitations.map((invite) => {
                            const isCopied = copiedToken === invite.token;

                            return (
                                <div
                                    key={invite.id}
                                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-4 gap-3 hover:bg-zinc-50/70 dark:hover:bg-zinc-900/30 transition-colors"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="size-9 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-400 shrink-0">
                                            <Mail className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                                                    {invite.email}
                                                </span>
                                                <Badge
                                                    variant="outline"
                                                    className="text-[10px] font-normal border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 py-0"
                                                >
                                                    Pending Invite
                                                </Badge>
                                            </div>
                                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 mt-0.5">
                                                <Clock className="h-3 w-3 text-zinc-400" />
                                                <span>Role: <strong className="capitalize">{invite.role}</strong></span>
                                                <span>•</span>
                                                <span>Invited by {invite.inviter?.name || "Team member"}</span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Invite Actions */}
                                    <div className="flex items-center gap-2 self-end sm:self-center">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleCopyInviteLink(invite.token)}
                                            className="h-7 gap-1 text-[11px] px-2.5"
                                            title="Copy direct invite link"
                                        >
                                            {isCopied ? (
                                                <>
                                                    <Check className="h-3 w-3 text-emerald-600" />
                                                    <span className="text-emerald-600">Copied</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="h-3 w-3 text-zinc-500" />
                                                    <span>Copy Link</span>
                                                </>
                                            )}
                                        </Button>

                                        {isOwnerOrAdmin && (
                                            <>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleResendInvite(invite.id)}
                                                    disabled={actionLoadingId === invite.id}
                                                    className="h-7 text-[11px] text-zinc-600 dark:text-zinc-400 gap-1 px-2.5"
                                                    title="Resend invitation email"
                                                >
                                                    <RotateCw className={`h-3 w-3 ${actionLoadingId === invite.id ? "animate-spin" : ""}`} />
                                                    Resend
                                                </Button>

                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRevokeInvite(invite.id)}
                                                    disabled={actionLoadingId === invite.id}
                                                    className="h-7 text-[11px] text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 gap-1 px-2.5"
                                                    title="Revoke invitation"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                    Revoke
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Invite Collaborator Modal */}
            <InviteMemberModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                workspaceId={workspaceId}
                onSuccess={loadTeamData}
            />

            {/* Add / Edit Studio Team Member Modal */}
            <AddTeamMemberModal
                isOpen={isAddRosterModalOpen}
                onClose={() => {
                    setIsAddRosterModalOpen(false);
                    setRosterMemberToEdit(null);
                }}
                workspaceId={workspaceId}
                memberToEdit={rosterMemberToEdit}
                onSuccess={loadTeamData}
            />
        </div>
    );
}
