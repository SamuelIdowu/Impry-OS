"use client"

import React from "react"
import {
    User,
    Lock,
    CreditCard,
    Bell,
    Edit2,
    IdCard,
    Mail,
    LockKeyhole,
    Save,
    Loader2
} from "lucide-react"
import { updateProfileAction, updatePasswordAction } from "@/server/actions/user"

interface SettingsFormProps {
    user: any; // User object from Supabase
}

export function SettingsForm({ user }: SettingsFormProps) {
    // In a real app we'd handle form state and submission here
    const [name, setName] = React.useState(user.user_metadata?.full_name || 'Agnes')
    const [email, setEmail] = React.useState(user.email || '')
    const [bio, setBio] = React.useState(user.user_metadata?.bio || '')

    const [isSavingProfile, setIsSavingProfile] = React.useState(false)
    const [isSavingPassword, setIsSavingPassword] = React.useState(false)
    const [passwordData, setPasswordData] = React.useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })

    const handleSaveProfile = async () => {
        setIsSavingProfile(true)
        try {
            const res = await updateProfileAction({ name, bio })
            if (res.success) {
                alert('Profile updated successfully')
            } else {
                alert(res.error || 'Failed to update profile')
            }
        } catch (error) {
            console.error(error)
            alert('An error occurred')
        } finally {
            setIsSavingProfile(false)
        }
    }

    const handleSavePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert('Passwords do not match')
            return
        }
        if (passwordData.newPassword.length < 6) {
            alert('Password must be at least 6 characters')
            return
        }

        setIsSavingPassword(true)
        try {
            const res = await updatePasswordAction(passwordData.newPassword)
            if (res.success) {
                alert('Password updated successfully')
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
            } else {
                alert(res.error || 'Failed to update password')
            }
        } catch (error) {
            console.error(error)
            alert('An error occurred')
        } finally {
            setIsSavingPassword(false)
        }
    }

    return (
        <div className="flex flex-1 p-6 mx-auto w-full">
            {/* Side Navigation */}
            <aside className="hidden md:flex flex-col w-64 pt-8 pb-10 pr-6 border-r border-zinc-200">
                <div className="flex flex-col gap-6 sticky top-24">
                    <div className="flex flex-col px-2">
                        <h1 className="text-zinc-900 text-base font-bold leading-normal">Settings</h1>
                        <p className="text-zinc-500 text-sm font-normal leading-normal">Manage account preferences</p>
                    </div>
                    <nav className="flex flex-col gap-1">
                        <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-zinc-900/10 text-zinc-900 font-medium transition-colors text-left w-full">
                            <User className="h-5 w-5" />
                            <span className="text-sm">General</span>
                        </button>
                        <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-500 hover:bg-zinc-100 transition-colors text-left w-full">
                            <Lock className="h-5 w-5" />
                            <span className="text-sm font-medium">Security</span>
                        </button>
                    </nav>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 py-8 px-4 md:px-10">
                {/* Page Heading */}
                <div className="mb-8">
                    <h1 className="text-zinc-900 text-3xl font-bold leading-tight tracking-tight mb-2">Account Settings</h1>
                    <p className="text-zinc-500 text-base font-normal">Manage your personal information and profile details.</p>
                </div>

                {/* Profile Card */}
                <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden mb-8">
                    <div className="p-6 md:p-8 border-b border-zinc-200">
                        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                            <div className="flex gap-5 items-center">
                                <div className="relative group cursor-pointer">
                                    <div
                                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-20 md:size-24 ring-4 ring-zinc-50 bg-zinc-200 flex items-center justify-center font-bold text-2xl text-zinc-500"
                                    >
                                        {/* Placeholder Initials if no image */}
                                        {name ? name[0].toUpperCase() : 'U'}
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
                                <button className="flex-1 md:flex-none cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-white border border-zinc-200 text-zinc-900 text-sm font-medium hover:bg-zinc-50 transition-colors">
                                    Remove
                                </button>
                                <button className="flex-1 md:flex-none cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-zinc-900 text-white text-sm font-bold shadow-sm hover:opacity-90 transition-opacity">
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
                                        className="w-full rounded-lg border border-zinc-200 bg-zinc-50 h-11 pl-10 pr-4 text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/50 focus:border-zinc-900 transition-all placeholder:text-zinc-400"
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
                                        className="w-full rounded-lg border border-zinc-200 bg-zinc-50 h-11 pl-10 pr-4 text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/50 focus:border-zinc-900 transition-all placeholder:text-zinc-400"
                                        type="email"
                                        value={email}
                                        disabled // Email usually managed via auth provider or specific flow
                                    />
                                </div>
                            </label>
                            <label className="flex flex-col gap-2 md:col-span-2">
                                <span className="text-zinc-900 text-sm font-medium">Bio</span>
                                <textarea
                                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 min-h-[100px] p-3 text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/50 focus:border-zinc-900 transition-all resize-y placeholder:text-zinc-400"
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
                            className="px-6 py-2 text-sm font-bold text-zinc-900 bg-zinc-900 text-white rounded-lg shadow-sm hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSavingProfile ? <Loader2 className="h-[18px] w-[18px] animate-spin" /> : <Save className="h-[18px] w-[18px]" />}
                            Save Profile
                        </button>
                    </div>
                </div>

                {/* Password / Security Section */}
                <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden mb-20">
                    <div className="p-6 md:p-8 border-b border-zinc-200 flex justify-between items-center">
                        <div>
                            <h3 className="text-zinc-900 text-lg font-bold">Password</h3>
                            <p className="text-zinc-500 text-sm">Update your password associated with this account.</p>
                        </div>
                        <LockKeyhole className="text-zinc-500 h-6 w-6" />
                    </div>
                    <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <label className="flex flex-col gap-2">
                            <span className="text-zinc-900 text-sm font-medium">Current Password</span>
                            <input
                                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 h-11 px-4 text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/50 focus:border-zinc-900 transition-all"
                                placeholder="••••••••"
                                type="password"
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            />
                        </label>
                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <label className="flex flex-col gap-2">
                                <span className="text-zinc-900 text-sm font-medium">New Password</span>
                                <input
                                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 h-11 px-4 text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/50 focus:border-zinc-900 transition-all"
                                    placeholder="Enter new password"
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                />
                            </label>
                            <label className="flex flex-col gap-2">
                                <span className="text-zinc-900 text-sm font-medium">Confirm New Password</span>
                                <input
                                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 h-11 px-4 text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/50 focus:border-zinc-900 transition-all"
                                    placeholder="Confirm new password"
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                />
                            </label>
                        </div>
                    </div>
                    <div className="px-6 md:px-8 py-4 bg-zinc-50 border-t border-zinc-200 flex justify-end gap-3">
                        <button className="px-4 py-2 text-sm font-medium text-zinc-900 bg-transparent hover:bg-zinc-200 rounded-lg transition-colors">
                            Cancel
                        </button>
                        <button
                            onClick={handleSavePassword}
                            disabled={isSavingPassword}
                            className="px-6 py-2 text-sm font-bold text-zinc-900 bg-zinc-900 text-white rounded-lg shadow-sm hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSavingPassword ? <Loader2 className="h-[18px] w-[18px] animate-spin" /> : <Save className="h-[18px] w-[18px]" />}
                            Save Changes
                        </button>
                    </div>
                </div>
            </main>
        </div>
    )
}
