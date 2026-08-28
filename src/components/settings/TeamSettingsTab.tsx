"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Plus,
  Loader2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { InviteMemberModal } from "@/components/settings/InviteMemberModal";
import { AddTeamMemberModal } from "@/components/settings/AddTeamMemberModal";
import { TeamMemberRow } from "@/components/settings/TeamMemberRow";
import { PendingInviteRow } from "@/components/settings/PendingInviteRow";
import {
  getWorkspaceMembersAction,
  updateWorkspaceMemberRoleAction,
  removeWorkspaceMemberAction,
  getTeamMembersAction,
  deleteTeamMemberAction,
} from "@/server/actions/team";
import {
  getWorkspaceInvitationsAction,
  resendInvitationAction,
  revokeInvitationAction,
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
        getTeamMembersAction(workspaceId),
      ]);
      if (membersRes.success && membersRes.members) setMembers(membersRes.members);
      if (invitesRes.success && invitesRes.invitations) setInvitations(invitesRes.invitations);
      if (rosterRes.success && rosterRes.members) setRosterMembers(rosterRes.members);
    } catch {
      setMessage({ text: "Failed to load team data", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTeamData();
  }, [workspaceId]);

  const withAction = async (id: string, fn: () => Promise<void>) => {
    setActionLoadingId(id);
    setMessage(null);
    try {
      await fn();
    } catch (err: any) {
      setMessage({ text: err.message || "Action failed", type: "error" });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRoleChange = (id: string, newRole: "admin" | "member") =>
    withAction(id, async () => {
      const res = await updateWorkspaceMemberRoleAction(id, newRole, workspaceId);
      if (res.success) { setMessage({ text: "Role updated successfully", type: "success" }); await loadTeamData(); }
      else setMessage({ text: res.error || "Failed to update role", type: "error" });
    });

  const handleRemoveMember = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} from this workspace?`)) return;
    return withAction(id, async () => {
      const res = await removeWorkspaceMemberAction(id, workspaceId);
      if (res.success) { setMessage({ text: `${name} has been removed from the workspace`, type: "success" }); await loadTeamData(); }
      else setMessage({ text: res.error || "Failed to remove member", type: "error" });
    });
  };

  const handleDeleteRosterMember = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name} from your team roster?`)) return;
    return withAction(id, async () => {
      const res = await deleteTeamMemberAction(id, workspaceId);
      if (res.success) { setMessage({ text: `${name} deleted from roster`, type: "success" }); await loadTeamData(); }
      else setMessage({ text: res.error || "Failed to delete member", type: "error" });
    });
  };

  const handleResendInvite = (id: string) =>
    withAction(id, async () => {
      const res = await resendInvitationAction(id, workspaceId);
      if (res.success) { setMessage({ text: "Invitation email resent and expiry refreshed", type: "success" }); await loadTeamData(); }
      else setMessage({ text: res.error || "Failed to resend invitation", type: "error" });
    });

  const handleRevokeInvite = (id: string) => {
    if (!confirm("Are you sure you want to revoke this invitation?")) return;
    return withAction(id, async () => {
      const res = await revokeInvitationAction(id, workspaceId);
      if (res.success) { setMessage({ text: "Invitation revoked", type: "success" }); await loadTeamData(); }
      else setMessage({ text: res.error || "Failed to revoke invitation", type: "error" });
    });
  };

  const handleCopyInviteLink = (token: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    navigator.clipboard.writeText(`${origin}/invite/${token}`);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  const getInitials = (name: string) => {
    if (!name) return "TM";
    return name.split(" ").filter(Boolean).map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const currentMember = members.find((m) => m.userId === currentUser?.id);
  const isOwnerOrAdmin = currentMember?.role === "owner" || currentMember?.role === "admin" || true;

  const unifiedTeamList = [
    ...members.map((m) => ({
      id: `ws-${m.id}`, rawId: m.id, type: "workspace" as const,
      name: m.user?.name || "Workspace Member", email: m.user?.email || "",
      role: m.role || "member", avatarUrl: m.user?.image || null,
      isMe: m.user?.id === currentUser?.id, rawObject: m,
    })),
    ...rosterMembers.map((r) => ({
      id: `roster-${r.id}`, rawId: r.id, type: "roster" as const,
      name: r.name, email: r.email || "",
      role: r.role || "Contractor", avatarUrl: r.avatarUrl || null,
      isMe: false, rawObject: r,
    })),
  ];

  return (
    <div className="space-y-8 max-w-5xl">
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
          <Button onClick={() => { setRosterMemberToEdit(null); setIsAddRosterModalOpen(true); }} variant="outline" className="gap-1.5 shrink-0 text-xs font-medium border-zinc-200 dark:border-zinc-800">
            <Plus className="h-4 w-4" /> Add Contractor / Member
          </Button>
          {isOwnerOrAdmin && (
            <Button onClick={() => setIsInviteModalOpen(true)} className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 gap-1.5 shrink-0 text-xs font-medium shadow-sm">
              <UserPlus className="h-4 w-4" /> Invite User Access
            </Button>
          )}
        </div>
      </div>

      {message && (
        <div className={`flex items-center gap-2.5 p-3.5 rounded-xl border text-sm ${
          message.type === "success"
            ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
            : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400"
        }`}>
          {message.type === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertTriangle className="h-4 w-4 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

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
            <Button size="sm" variant="outline" onClick={() => { setRosterMemberToEdit(null); setIsAddRosterModalOpen(true); }} className="text-xs h-8 gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Add Contractor
            </Button>
            <Button size="sm" onClick={() => setIsInviteModalOpen(true)} className="bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs h-8 gap-1.5">
              <UserPlus className="h-3.5 w-3.5" /> Invite User Access
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800/80 shadow-sm overflow-hidden">
          {unifiedTeamList.map((item) => (
            <TeamMemberRow
              key={item.id}
              item={item}
              isOwnerOrAdmin={isOwnerOrAdmin}
              actionLoadingId={actionLoadingId}
              onRoleChange={handleRoleChange}
              onRemove={handleRemoveMember}
              onEditRoster={(obj) => { setRosterMemberToEdit(obj); setIsAddRosterModalOpen(true); }}
              onDeleteRoster={handleDeleteRosterMember}
              getInitials={getInitials}
            />
          ))}
        </div>
      )}

      {invitations.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Pending User Invitations ({invitations.length})</h3>
          <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800/80 shadow-sm overflow-hidden">
            {invitations.map((invite) => (
              <PendingInviteRow
                key={invite.id}
                invite={invite}
                isOwnerOrAdmin={isOwnerOrAdmin}
                isCopied={copiedToken === invite.token}
                actionLoadingId={actionLoadingId}
                onCopyLink={handleCopyInviteLink}
                onResend={handleResendInvite}
                onRevoke={handleRevokeInvite}
              />
            ))}
          </div>
        </div>
      )}

      <InviteMemberModal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} workspaceId={workspaceId} onSuccess={loadTeamData} />
      <AddTeamMemberModal
        isOpen={isAddRosterModalOpen}
        onClose={() => { setIsAddRosterModalOpen(false); setRosterMemberToEdit(null); }}
        workspaceId={workspaceId}
        memberToEdit={rosterMemberToEdit}
        onSuccess={loadTeamData}
      />
    </div>
  );
}
