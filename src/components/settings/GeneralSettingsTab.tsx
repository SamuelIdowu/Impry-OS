"use client";

import React from "react";
import {
  Edit2,
  IdCard,
  Mail,
  CreditCard,
  Save,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { updateProfileAction } from "@/server/actions/user";

interface GeneralSettingsTabProps {
  user: any;
  profile?: any;
  workspacePlan?: string;
  workspaceStatus?: string;
}

export function GeneralSettingsTab({
  user,
  profile,
  workspacePlan = "free",
  workspaceStatus = "active",
}: GeneralSettingsTabProps) {
  const router = useRouter();
  const [name, setName] = React.useState(profile?.name || user?.name || "");
  const [email] = React.useState(profile?.email || user?.email || "");
  const [bio, setBio] = React.useState(profile?.bio || user?.bio || "");
  const [isSavingProfile, setIsSavingProfile] = React.useState(false);

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const res = await updateProfileAction({ name, bio });
      if (res.success) {
        alert("Profile updated successfully");
        router.refresh();
      } else {
        alert(res.error || "Failed to update profile");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred");
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <>
      <div className="mb-6 md:mb-8">
        <h1 className="text-zinc-900 text-2xl md:text-3xl font-bold leading-tight tracking-tight mb-2">
          Account Settings
        </h1>
        <p className="text-zinc-500 text-base font-normal">
          Manage your personal information and profile details.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden mb-8">
        <div className="p-6 md:p-8 border-b border-zinc-200">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            <div className="flex gap-5 items-center">
              <div className="relative group cursor-pointer">
                <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-20 md:size-24 ring-4 ring-zinc-50 bg-zinc-200 flex items-center justify-center font-bold text-2xl text-zinc-500">
                  {name ? name[0].toUpperCase() : "U"}
                </div>
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Edit2 className="text-white h-5 w-5" />
                </div>
              </div>
              <div className="flex flex-col">
                <h3 className="text-zinc-900 text-lg font-bold">Profile Picture</h3>
                <p className="text-zinc-500 text-sm">PNG, JPG up to 5MB</p>
              </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <button className="flex-1 md:flex-none cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-white border border-zinc-200 text-zinc-700 text-sm font-medium hover:bg-zinc-50 hover:border-zinc-300 transition-colors">
                Remove
              </button>
              <button className="flex-1 md:flex-none cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-zinc-900 text-white text-sm font-medium shadow-sm hover:bg-zinc-800 transition-colors">
                Upload New
              </button>
            </div>
          </div>
        </div>
        <div className="p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="flex flex-col gap-2">
              <span className="text-zinc-900 text-sm font-medium">Display Name</span>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                  <IdCard className="h-5 w-5" />
                </span>
                <input
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 h-11 pl-10 pr-4 text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/50 focus:border-zinc-900 transition-colors duration-150 placeholder:text-zinc-400"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-zinc-900 text-sm font-medium">Email Address</span>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                  <Mail className="h-5 w-5" />
                </span>
                <input
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 h-11 pl-10 pr-4 text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/50 focus:border-zinc-900 transition-colors duration-150 placeholder:text-zinc-400 truncate"
                  type="email"
                  value={email}
                  disabled
                  title={email}
                />
              </div>
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-zinc-900 text-sm font-medium">Subscription Plan</span>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                  <CreditCard className="h-5 w-5" />
                </span>
                <div className="flex items-center gap-2 w-full rounded-lg border border-zinc-200 bg-zinc-50 h-11 pl-10 pr-4 text-zinc-900 text-sm">
                  <span className="capitalize">{workspacePlan}</span>
                  {workspacePlan === "studio" && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                      STUDIO
                    </span>
                  )}
                  <span className="ml-auto text-xs text-zinc-400 capitalize">{workspaceStatus}</span>
                </div>
              </div>
            </label>
            <label className="flex flex-col gap-2 md:col-span-2">
              <span className="text-zinc-900 text-sm font-medium">Bio</span>
              <textarea
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 min-h-[100px] p-3 text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/50 focus:border-zinc-900 transition-colors duration-150 resize-y placeholder:text-zinc-400"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              ></textarea>
              <p className="text-xs text-zinc-500 text-right">{bio.length}/240 characters</p>
            </label>
          </div>
        </div>
        <div className="px-6 md:px-8 py-4 bg-zinc-50 border-t border-zinc-200 flex justify-end gap-3">
          <button
            onClick={handleSaveProfile}
            disabled={isSavingProfile}
            className="px-6 py-2 text-sm font-bold text-zinc-200 bg-zinc-900 text-white rounded-lg shadow-sm hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSavingProfile ? (
              <Loader2 className="h-[18px] w-[18px] animate-spin" />
            ) : (
              <Save className="h-[18px] w-[18px]" />
            )}
            Save Profile
          </button>
        </div>
      </div>
    </>
  );
}
