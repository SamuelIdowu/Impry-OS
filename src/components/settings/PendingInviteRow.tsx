"use client";

import React from "react";
import { Mail, RotateCw, Copy, Check, Trash2, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PendingInviteRowProps {
  invite: any;
  isOwnerOrAdmin: boolean;
  isCopied: boolean;
  actionLoadingId: string | null;
  onCopyLink: (token: string) => void;
  onResend: (id: string) => void;
  onRevoke: (id: string) => void;
}

export function PendingInviteRow({
  invite,
  isOwnerOrAdmin,
  isCopied,
  actionLoadingId,
  onCopyLink,
  onResend,
  onRevoke,
}: PendingInviteRowProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-4 gap-3 hover:bg-zinc-50/70 dark:hover:bg-zinc-900/30 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div className="size-9 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-400 shrink-0">
          <Mail className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 truncate">{invite.email}</span>
            <Badge variant="outline" className="text-[10px] font-normal border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 py-0">
              Pending Invite
            </Badge>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 mt-0.5">
            <Clock className="h-3 w-3 text-zinc-400" />
            <span>Role: <strong className="capitalize">{invite.role}</strong></span>
            <span>·</span>
            <span>Invited by {invite.inviter?.name || "Team member"}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center">
        <Button variant="outline" size="sm" onClick={() => onCopyLink(invite.token)} className="h-7 gap-1 text-[11px] px-2.5" title="Copy direct invite link">
          {isCopied ? (
            <><Check className="h-3 w-3 text-emerald-600" /><span className="text-emerald-600">Copied</span></>
          ) : (
            <><Copy className="h-3 w-3 text-zinc-500" /><span>Copy Link</span></>
          )}
        </Button>
        {isOwnerOrAdmin && (
          <>
            <Button variant="ghost" size="sm" onClick={() => onResend(invite.id)} disabled={actionLoadingId === invite.id} className="h-7 text-[11px] text-zinc-600 dark:text-zinc-400 gap-1 px-2.5" title="Resend invitation email">
              <RotateCw className={`h-3 w-3 ${actionLoadingId === invite.id ? "animate-spin" : ""}`} />
              Resend
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onRevoke(invite.id)} disabled={actionLoadingId === invite.id} className="h-7 text-[11px] text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 gap-1 px-2.5" title="Revoke invitation">
              <Trash2 className="h-3 w-3" /> Revoke
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
