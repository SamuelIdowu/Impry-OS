"use client";

import React from "react";
import {
  Shield,
  Crown,
  MoreVertical,
  Trash2,
  Edit2,
  Briefcase,
  Loader2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdownMenu";

interface TeamMemberRowProps {
  item: {
    id: string;
    rawId: string;
    type: "workspace" | "roster";
    name: string;
    email: string;
    role: string;
    avatarUrl: string | null;
    isMe: boolean;
    rawObject: any;
  };
  isOwnerOrAdmin: boolean;
  actionLoadingId: string | null;
  onRoleChange: (id: string, role: "admin" | "member") => void;
  onRemove: (id: string, name: string) => void;
  onEditRoster: (obj: any) => void;
  onDeleteRoster: (id: string, name: string) => void;
  getInitials: (name: string) => string;
}

export function TeamMemberRow({
  item,
  isOwnerOrAdmin,
  actionLoadingId,
  onRoleChange,
  onRemove,
  onEditRoster,
  onDeleteRoster,
  getInitials,
}: TeamMemberRowProps) {
  const isWorkspaceUser = item.type === "workspace";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 gap-4 hover:bg-zinc-50/70 dark:hover:bg-zinc-900/30 transition-colors group">
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="size-10 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-sm font-semibold text-zinc-700 dark:text-zinc-300 shrink-0 overflow-hidden shadow-inner">
          {item.avatarUrl ? (
            <img src={item.avatarUrl} alt={item.name} className="size-full object-cover" onError={(e) => { (e.target as HTMLElement).style.display = "none"; }} />
          ) : (
            <span>{getInitials(item.name)}</span>
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate">{item.name}</span>
            {item.isMe && <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">You</span>}
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
            {item.email && <span className="truncate">{item.email}</span>}
            {item.email && item.role && <span>·</span>}
            {item.role && <span className="capitalize">{item.role}</span>}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
        {isWorkspaceUser ? (
          <div className="flex items-center gap-1.5">
            {item.role === "owner" && (
              <Badge variant="default" className="bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 gap-1 font-medium text-[11px] py-0.5">
                <Crown className="h-3 w-3 text-amber-400" /> Owner
              </Badge>
            )}
            {item.role === "admin" && (
              <Badge variant="secondary" className="bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 gap-1 font-medium text-[11px] py-0.5">
                <Shield className="h-3 w-3" /> Admin
              </Badge>
            )}
            {item.role === "member" && (
              <Badge variant="outline" className="text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 font-normal text-[11px] py-0.5">
                App Collaborator
              </Badge>
            )}
          </div>
        ) : (
          <Badge variant="secondary" className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 font-normal text-[11px] py-0.5 gap-1">
            <Briefcase className="h-3 w-3 text-zinc-500" /> Studio Roster
          </Badge>
        )}

        {isWorkspaceUser ? (
          isOwnerOrAdmin && item.role !== "owner" && !item.isMe && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200" disabled={actionLoadingId === item.rawId}>
                  {actionLoadingId === item.rawId ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreVertical className="h-4 w-4" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                <DropdownMenuLabel className="text-xs text-zinc-400">Change Role</DropdownMenuLabel>
                {item.role !== "admin" && (
                  <DropdownMenuItem onClick={() => onRoleChange(item.rawId, "admin")} className="text-xs cursor-pointer">
                    <Shield className="mr-2 h-3.5 w-3.5" /> Make Admin
                  </DropdownMenuItem>
                )}
                {item.role !== "member" && (
                  <DropdownMenuItem onClick={() => onRoleChange(item.rawId, "member")} className="text-xs cursor-pointer">
                    <Users className="mr-2 h-3.5 w-3.5" /> Make Member
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onRemove(item.rawId, item.name)} className="text-xs text-red-600 dark:text-red-400 cursor-pointer">
                  <Trash2 className="mr-2 h-3.5 w-3.5" /> Remove from Workspace
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        ) : (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => onEditRoster(item.rawObject)} className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200" title="Edit team member">
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDeleteRoster(item.rawId, item.name)} disabled={actionLoadingId === item.rawId} className="h-8 w-8 p-0 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30" title="Delete team member">
              {actionLoadingId === item.rawId ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
