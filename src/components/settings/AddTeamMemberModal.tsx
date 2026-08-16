"use client";

import React, { useState, useEffect } from "react";
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
    User,
    Mail,
    Briefcase,
    Image,
    Loader2,
    AlertCircle,
    Sparkles
} from "lucide-react";
import { addTeamMemberAction, updateTeamMemberAction } from "@/server/actions/team";
import { UpgradeModal } from "@/components/billing/UpgradeModal";

interface AddTeamMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    workspaceId: string;
    memberToEdit?: any | null;
    onSuccess?: () => void;
}

const ROLE_PRESETS = [
    "Frontend Developer",
    "Backend Developer",
    "UI/UX Designer",
    "Project Manager",
    "Copywriter",
    "QA Engineer",
    "Motion Designer",
    "Product Strategist"
];

export function AddTeamMemberModal({
    isOpen,
    onClose,
    workspaceId,
    memberToEdit = null,
    onSuccess
}: AddTeamMemberModalProps) {
    const isEditMode = Boolean(memberToEdit);

    const [name, setName] = useState("");
    const [role, setRole] = useState("");
    const [email, setEmail] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    useEffect(() => {
        if (memberToEdit) {
            setName(memberToEdit.name || "");
            setRole(memberToEdit.role || "");
            setEmail(memberToEdit.email || "");
            setAvatarUrl(memberToEdit.avatarUrl || "");
        } else {
            setName("");
            setRole("");
            setEmail("");
            setAvatarUrl("");
        }
        setError(null);
    }, [memberToEdit, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError("Member name is required");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            if (isEditMode && memberToEdit?.id) {
                const res = await updateTeamMemberAction(memberToEdit.id, {
                    name: name.trim(),
                    role: role.trim() || null,
                    email: email.trim() || null,
                    avatar_url: avatarUrl.trim() || null,
                    workspaceId
                });

                if (res.success) {
                    if (onSuccess) onSuccess();
                    onClose();
                } else {
                    setError(res.error || "Failed to update team member");
                }
            } else {
                const res = await addTeamMemberAction({
                    name: name.trim(),
                    role: role.trim() || null,
                    email: email.trim() || null,
                    avatar_url: avatarUrl.trim() || null,
                    workspaceId
                });

                if (res.success) {
                    if (onSuccess) onSuccess();
                    onClose();
                } else if ((res as any).requiresUpgrade) {
                    onClose();
                    setShowUpgradeModal(true);
                } else {
                    setError(res.error || "Failed to add team member");
                }
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const getInitials = (str: string) => {
        if (!str.trim()) return "TM";
        return str
            .split(" ")
            .filter(Boolean)
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <>
            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                title="Team Member Limit Reached"
                description="Your current plan allows 1 seat. Upgrade to Studio Plan to invite up to 5 team members with role-based permissions."
                targetTier="studio"
                limitName="Team Seats"
                currentCount={1}
                maxAllowed={1}
                workspaceId={workspaceId}
            />

            <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-2xl shadow-2xl">
                {/* Header (Fixed) */}
                <DialogHeader className="p-5 pb-3 border-b border-zinc-100 dark:border-zinc-800/80 shrink-0 text-left">
                    <DialogTitle className="text-lg font-bold tracking-tight flex items-center gap-2">
                        <User className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
                        {isEditMode ? "Edit Team Member" : "Add Team Member"}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        {isEditMode
                            ? "Update collaborator details, role, and contact info."
                            : "Add a contractor, freelancer, or collaborator to your studio roster."}
                    </DialogDescription>
                </DialogHeader>

                {/* Form (Scrollable Body) */}
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
                    <div className="p-5 space-y-4 overflow-y-auto flex-1">
                        {error && (
                            <div className="flex items-center gap-2 p-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-xs rounded-lg">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Live Avatar & Info Banner */}
                        <div className="flex items-center gap-3 p-2.5 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80">
                            <div className="size-10 rounded-full bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center font-bold text-xs text-zinc-700 dark:text-zinc-300 shrink-0 overflow-hidden shadow-inner">
                                {avatarUrl ? (
                                    <img
                                        src={avatarUrl}
                                        alt={name || "Avatar"}
                                        className="size-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLElement).style.display = "none";
                                        }}
                                    />
                                ) : (
                                    <span>{getInitials(name)}</span>
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                                    {name || "Member Name"}
                                </p>
                                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                                    {role || "Role / Specialization"} {email ? `• ${email}` : ""}
                                </p>
                            </div>
                        </div>

                        {/* Name Input */}
                        <div className="space-y-1.5">
                            <Label htmlFor="member-name" className="text-[11px] font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                                Full Name <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                                <Input
                                    id="member-name"
                                    type="text"
                                    placeholder="e.g. Alex Rivera"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="pl-9 h-9 text-xs bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                                />
                            </div>
                        </div>

                        {/* Role Input & Presets */}
                        <div className="space-y-1.5">
                            <Label htmlFor="member-role" className="text-[11px] font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                                Role / Specialization
                            </Label>
                            <div className="relative">
                                <Briefcase className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                                <Input
                                    id="member-role"
                                    type="text"
                                    placeholder="e.g. Senior Product Designer"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="pl-9 h-9 text-xs bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                                />
                            </div>

                            {/* Quick Preset Tags */}
                            <div className="flex flex-wrap gap-1 pt-1">
                                {ROLE_PRESETS.slice(0, 6).map((preset) => (
                                    <button
                                        key={preset}
                                        type="button"
                                        onClick={() => setRole(preset)}
                                        className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${
                                            role === preset
                                                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 font-medium"
                                                : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                                        }`}
                                    >
                                        {preset}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Email Input */}
                        <div className="space-y-1.5">
                            <Label htmlFor="member-email" className="text-[11px] font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                                Email Address <span className="text-zinc-400 font-normal normal-case">(optional)</span>
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                                <Input
                                    id="member-email"
                                    type="email"
                                    placeholder="alex@studio.design"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-9 h-9 text-xs bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                                />
                            </div>
                        </div>

                        {/* Avatar URL Input */}
                        <div className="space-y-1.5">
                            <Label htmlFor="member-avatar" className="text-[11px] font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                                Avatar URL <span className="text-zinc-400 font-normal normal-case">(optional)</span>
                            </Label>
                            <div className="relative">
                                <Image className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                                <Input
                                    id="member-avatar"
                                    type="url"
                                    placeholder="https://images.unsplash.com/photo-..."
                                    value={avatarUrl}
                                    onChange={(e) => setAvatarUrl(e.target.value)}
                                    className="pl-9 h-9 text-xs bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer (Fixed) */}
                    <DialogFooter className="p-4 bg-zinc-50/80 dark:bg-zinc-900/60 border-t border-zinc-100 dark:border-zinc-800 shrink-0 flex flex-row items-center justify-end gap-2 sm:gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={onClose}
                            disabled={isLoading}
                            className="h-8 text-xs font-medium"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={isLoading || !name.trim()}
                            className="h-8 text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900"
                        >
                            {isLoading && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                            {isEditMode ? "Save Changes" : "Add to Roster"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
            </Dialog>
        </>
    );
}
