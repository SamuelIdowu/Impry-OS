"use client"

import React from "react"
import {
    User,
    Lock,
    Edit2,
    IdCard,
    Mail,
    LockKeyhole,
    Save,
    Loader2,
    Shield,
    Monitor,
    LogOut,
    Key,
    AlertTriangle,
    X,
    Copy,
    Check,
    CreditCard
} from "lucide-react"
import { PricingTable } from "@/components/stripe/pricing-table"
import {
    updateProfileAction,
    updatePasswordAction,
    signOutAllSessionsAction,
    deleteAccountAction,
    enrollMfaAction,
    verifyMfaAction,
    unenrollMfaAction,
    getMfaFactorsAction
} from "@/server/actions/user"
import { useRouter } from "next/navigation"

type SettingsTab = 'general' | 'security' | 'billing'

interface MfaFactor {
    id: string;
    friendly_name?: string;
    factor_type: string;
    status: string;
}

interface SettingsFormProps {
    user: any; // User object from Supabase
    profile?: any; // Public profile with subscription info
}

export function SettingsForm({ user, profile }: SettingsFormProps) {
    const router = useRouter()
    const [activeTab, setActiveTab] = React.useState<SettingsTab>('general')

    // Profile state
    const [name, setName] = React.useState(user.user_metadata?.full_name || 'Agnes')
    const [email, setEmail] = React.useState(user.email || '')
    const [bio, setBio] = React.useState(user.user_metadata?.bio || '')

    const [isSavingProfile, setIsSavingProfile] = React.useState(false)
    const [isSavingPassword, setIsSavingPassword] = React.useState(false)
    const [isSigningOut, setIsSigningOut] = React.useState(false)
    const [isDeletingAccount, setIsDeletingAccount] = React.useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false)
    const [deleteConfirmText, setDeleteConfirmText] = React.useState('')
    const [passwordData, setPasswordData] = React.useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })

    // MFA State
    const [mfaFactors, setMfaFactors] = React.useState<MfaFactor[]>([])
    const [isEnrollingMfa, setIsEnrollingMfa] = React.useState(false)
    const [showMfaSetup, setShowMfaSetup] = React.useState(false)
    const [mfaSetupData, setMfaSetupData] = React.useState<{
        id: string;
        qrCode: string;
        secret: string;
    } | null>(null)
    const [mfaVerifyCode, setMfaVerifyCode] = React.useState('')
    const [isVerifyingMfa, setIsVerifyingMfa] = React.useState(false)
    const [isDisablingMfa, setIsDisablingMfa] = React.useState(false)
    const [copiedSecret, setCopiedSecret] = React.useState(false)

    // Current session info from user data
    const currentSession = {
        lastSignIn: user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Unknown',
        createdAt: user.created_at ? new Date(user.created_at).toLocaleString() : 'Unknown',
        provider: user.app_metadata?.provider || 'email'
    }

    // Check for existing MFA factors on mount
    React.useEffect(() => {
        const checkMfaStatus = async () => {
            const res = await getMfaFactorsAction()
            if (res.success && res.factors) {
                setMfaFactors(res.factors)
            }
        }
        checkMfaStatus()
    }, [])

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

    const handleSignOutAllSessions = async () => {
        if (!confirm('This will sign you out from all devices including this one. Continue?')) {
            return
        }

        setIsSigningOut(true)
        try {
            const res = await signOutAllSessionsAction()
            if (res.success) {
                router.push('/login')
            } else {
                alert(res.error || 'Failed to sign out')
            }
        } catch (error) {
            console.error(error)
            alert('An error occurred')
        } finally {
            setIsSigningOut(false)
        }
    }

    const handleEnrollMfa = async () => {
        setIsEnrollingMfa(true)
        try {
            const res = await enrollMfaAction()
            if (res.success && res.data) {
                setMfaSetupData(res.data)
                setShowMfaSetup(true)
            } else {
                alert(res.error || 'Failed to start MFA enrollment')
            }
        } catch (error) {
            console.error(error)
            alert('An error occurred')
        } finally {
            setIsEnrollingMfa(false)
        }
    }

    const handleVerifyMfa = async () => {
        if (!mfaSetupData || mfaVerifyCode.length !== 6) {
            alert('Please enter a 6-digit code')
            return
        }

        setIsVerifyingMfa(true)
        try {
            const res = await verifyMfaAction(mfaSetupData.id, mfaVerifyCode)
            if (res.success) {
                setMfaFactors([...mfaFactors, {
                    id: mfaSetupData.id,
                    factor_type: 'totp',
                    status: 'verified',
                    friendly_name: 'Authenticator App'
                }])
                setShowMfaSetup(false)
                setMfaSetupData(null)
                setMfaVerifyCode('')
                alert('Two-factor authentication enabled successfully!')
            } else {
                alert(res.error || 'Invalid code. Please try again.')
            }
        } catch (error) {
            console.error(error)
            alert('An error occurred')
        } finally {
            setIsVerifyingMfa(false)
        }
    }

    const handleDisableMfa = async (factorId: string) => {
        if (!confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
            return
        }

        setIsDisablingMfa(true)
        try {
            const res = await unenrollMfaAction(factorId)
            if (res.success) {
                setMfaFactors(mfaFactors.filter(f => f.id !== factorId))
                alert('Two-factor authentication disabled')
            } else {
                alert(res.error || 'Failed to disable MFA')
            }
        } catch (error) {
            console.error(error)
            alert('An error occurred')
        } finally {
            setIsDisablingMfa(false)
        }
    }

    const handleCopySecret = () => {
        if (mfaSetupData?.secret) {
            navigator.clipboard.writeText(mfaSetupData.secret)
            setCopiedSecret(true)
            setTimeout(() => setCopiedSecret(false), 2000)
        }
    }

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== 'DELETE') {
            alert('Please type DELETE to confirm')
            return
        }

        setIsDeletingAccount(true)
        try {
            const res = await deleteAccountAction()
            if (res.success) {
                router.push('/login')
            } else {
                alert(res.error || 'Failed to delete account')
            }
        } catch (error) {
            console.error(error)
            alert('An error occurred')
        } finally {
            setIsDeletingAccount(false)
        }
    }

    const isMfaEnabled = mfaFactors.some(f => f.status === 'verified')

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
                        <button
                            onClick={() => setActiveTab('general')}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left w-full ${activeTab === 'general'
                                ? 'bg-zinc-900/10 text-zinc-900 font-medium'
                                : 'text-zinc-500 hover:bg-zinc-100'
                                }`}
                        >
                            <User className="h-5 w-5" />
                            <span className="text-sm">General</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('security')}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left w-full ${activeTab === 'security'
                                ? 'bg-zinc-900/10 text-zinc-900 font-medium'
                                : 'text-zinc-500 hover:bg-zinc-100'
                                }`}
                        >
                            <Lock className="h-5 w-5" />
                            <span className="text-sm font-medium">Security</span>
                        </button>
                        {/* Billing tab disabled
                        <button
                            onClick={() => setActiveTab('billing')}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left w-full ${activeTab === 'billing'
                                ? 'bg-zinc-900/10 text-zinc-900 font-medium'
                                : 'text-zinc-500 hover:bg-zinc-100'
                                }`}
                        >
                            <CreditCard className="h-5 w-5" />
                            <span className="text-sm font-medium">Billing</span>
                        </button>
                        */}
                    </nav>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 py-8 px-4 md:px-10">
                {/* Mobile Tab Navigation */}
                <div className="flex md:hidden gap-2 mb-6 p-1 bg-zinc-100 rounded-lg">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'general'
                            ? 'bg-white text-zinc-900 shadow-sm'
                            : 'text-zinc-500'
                            }`}
                    >
                        <User className="h-4 w-4" />
                        General
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'security'
                            ? 'bg-white text-zinc-900 shadow-sm'
                            : 'text-zinc-500'
                            }`}
                    >
                        <Lock className="h-4 w-4" />
                        Security
                    </button>
                    {/* Billing tab mobile disabled
                    <button
                        onClick={() => setActiveTab('billing')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'billing'
                            ? 'bg-white text-zinc-900 shadow-sm'
                            : 'text-zinc-500'
                            }`}
                    >
                        <CreditCard className="h-4 w-4" />
                        Billing
                    </button>
                    */}
                </div>

                {activeTab === 'general' && (
                    <>
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
                                                disabled
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
                                                <span className="capitalize">{profile?.subscription_plan || 'free'}</span>
                                                {profile?.subscription_plan === 'pro' && (
                                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                                                        PRO
                                                    </span>
                                                )}
                                                {/* Manage Subscription disabled
                                                <button
                                                    onClick={() => setActiveTab('billing')}
                                                    className="ml-auto text-xs text-blue-600 hover:underline font-medium"
                                                >
                                                    Manage
                                                </button>
                                                */}
                                            </div>
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
                                    className="px-6 py-2 text-sm font-bold text-zinc-200 bg-zinc-900 text-white rounded-lg shadow-sm hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSavingProfile ? <Loader2 className="h-[18px] w-[18px] animate-spin" /> : <Save className="h-[18px] w-[18px]" />}
                                    Save Profile
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'security' && (
                    <>
                        {/* Page Heading */}
                        <div className="mb-8">
                            <h1 className="text-zinc-900 text-3xl font-bold leading-tight tracking-tight mb-2">Security Settings</h1>
                            <p className="text-zinc-500 text-base font-normal">Manage your password, two-factor authentication, and active sessions.</p>
                        </div>

                        {/* Password Section */}
                        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden mb-6">
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
                                <button
                                    onClick={() => setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })}
                                    className="px-4 py-2 text-sm font-medium text-zinc-900 bg-transparent hover:bg-zinc-200 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSavePassword}
                                    disabled={isSavingPassword}
                                    className="px-6 py-2 text-sm font-bold text-zinc-200 bg-zinc-900 text-white rounded-lg shadow-sm hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSavingPassword ? <Loader2 className="h-[18px] w-[18px] animate-spin" /> : <Save className="h-[18px] w-[18px]" />}
                                    Update Password
                                </button>
                            </div>
                        </div>

                        {/* Two-Factor Authentication Section */}
                        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden mb-6">
                            <div className="p-6 md:p-8 flex flex-col md:flex-row gap-4 md:items-center justify-between">
                                <div className="flex gap-4 items-start">
                                    <div className="p-3 bg-zinc-100 rounded-lg">
                                        <Shield className="h-6 w-6 text-zinc-700" />
                                    </div>
                                    <div>
                                        <h3 className="text-zinc-900 text-lg font-bold">Two-Factor Authentication</h3>
                                        <p className="text-zinc-500 text-sm mt-1">Add an extra layer of security to your account by requiring a code in addition to your password.</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`text-sm font-medium ${isMfaEnabled ? 'text-emerald-600' : 'text-zinc-500'}`}>
                                        {isMfaEnabled ? 'Enabled' : 'Disabled'}
                                    </span>
                                    {!isMfaEnabled ? (
                                        <button
                                            onClick={handleEnrollMfa}
                                            disabled={isEnrollingMfa}
                                            className="px-4 py-2 text-sm font-medium bg-zinc-900 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {isEnrollingMfa ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                                            Enable
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleDisableMfa(mfaFactors.find(f => f.status === 'verified')?.id || '')}
                                            disabled={isDisablingMfa}
                                            className="px-4 py-2 text-sm font-medium bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {isDisablingMfa ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                            Disable
                                        </button>
                                    )}
                                </div>
                            </div>
                            {isMfaEnabled && (
                                <div className="px-6 md:px-8 pb-6 md:pb-8">
                                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3">
                                        <Key className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-emerald-800 text-sm font-medium">Two-factor authentication is active</p>
                                            <p className="text-emerald-700 text-sm mt-1">Your account is protected with an authenticator app.</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* MFA Setup Modal */}
                        {showMfaSetup && mfaSetupData && (
                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                                <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                                    <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
                                        <h3 className="text-lg font-bold text-zinc-900">Set Up Two-Factor Authentication</h3>
                                        <button
                                            onClick={() => {
                                                setShowMfaSetup(false)
                                                setMfaSetupData(null)
                                                setMfaVerifyCode('')
                                            }}
                                            className="p-1 hover:bg-zinc-100 rounded-lg transition-colors"
                                        >
                                            <X className="h-5 w-5 text-zinc-500" />
                                        </button>
                                    </div>
                                    <div className="p-6 space-y-6">
                                        <div>
                                            <p className="text-sm text-zinc-600 mb-4">
                                                Scan this QR code with your authenticator app (like Google Authenticator, Authy, or 1Password).
                                            </p>
                                            <div className="flex justify-center p-4 bg-white border border-zinc-200 rounded-lg">
                                                <img
                                                    src={mfaSetupData.qrCode}
                                                    alt="MFA QR Code"
                                                    className="w-48 h-48"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm text-zinc-600 mb-2">
                                                Or enter this secret key manually:
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <code className="flex-1 p-3 bg-zinc-100 rounded-lg text-sm font-mono text-zinc-800 break-all">
                                                    {mfaSetupData.secret}
                                                </code>
                                                <button
                                                    onClick={handleCopySecret}
                                                    className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
                                                    title="Copy to clipboard"
                                                >
                                                    {copiedSecret ? (
                                                        <Check className="h-5 w-5 text-emerald-600" />
                                                    ) : (
                                                        <Copy className="h-5 w-5 text-zinc-500" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-zinc-900 mb-2">
                                                Enter the 6-digit code from your app
                                            </label>
                                            <input
                                                type="text"
                                                value={mfaVerifyCode}
                                                onChange={(e) => setMfaVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                placeholder="000000"
                                                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 h-12 px-4 text-zinc-900 text-center text-lg font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-zinc-900/50 focus:border-zinc-900 transition-all"
                                                maxLength={6}
                                            />
                                        </div>
                                    </div>
                                    <div className="p-6 border-t border-zinc-200 flex justify-end gap-3">
                                        <button
                                            onClick={() => {
                                                setShowMfaSetup(false)
                                                setMfaSetupData(null)
                                                setMfaVerifyCode('')
                                            }}
                                            className="px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleVerifyMfa}
                                            disabled={isVerifyingMfa || mfaVerifyCode.length !== 6}
                                            className="px-6 py-2 text-sm font-bold bg-zinc-900 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            {isVerifyingMfa ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                            Verify & Enable
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Active Sessions Section */}
                        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden mb-6">
                            <div className="p-6 md:p-8 border-b border-zinc-200 flex flex-col md:flex-row gap-4 md:items-center justify-between">
                                <div>
                                    <h3 className="text-zinc-900 text-lg font-bold">Session Information</h3>
                                    <p className="text-zinc-500 text-sm">View your current session details and sign out from all devices.</p>
                                </div>
                                <button
                                    onClick={handleSignOutAllSessions}
                                    disabled={isSigningOut}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSigningOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                                    Sign out all devices
                                </button>
                            </div>
                            <div className="p-6 md:px-8">
                                <div className="flex gap-4 items-start">
                                    <div className="p-2.5 bg-zinc-100 rounded-lg">
                                        <Monitor className="h-5 w-5 text-zinc-600" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-zinc-900 text-sm font-semibold">Current Session</h4>
                                            <span className="px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">
                                                Active
                                            </span>
                                        </div>
                                        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <p className="text-zinc-400 text-xs uppercase tracking-wide mb-1">Last Sign In</p>
                                                <p className="text-zinc-700 text-sm">{currentSession.lastSignIn}</p>
                                            </div>
                                            <div>
                                                <p className="text-zinc-400 text-xs uppercase tracking-wide mb-1">Account Created</p>
                                                <p className="text-zinc-700 text-sm">{currentSession.createdAt}</p>
                                            </div>
                                            <div>
                                                <p className="text-zinc-400 text-xs uppercase tracking-wide mb-1">Auth Provider</p>
                                                <p className="text-zinc-700 text-sm capitalize">{currentSession.provider}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden mb-20">
                            <div className="p-6 md:p-8 border-b border-red-100 bg-red-50">
                                <div className="flex items-center gap-3">
                                    <AlertTriangle className="h-5 w-5 text-red-600" />
                                    <h3 className="text-red-800 text-lg font-bold">Danger Zone</h3>
                                </div>
                            </div>
                            <div className="p-6 md:p-8 flex flex-col md:flex-row gap-4 md:items-center justify-between">
                                <div>
                                    <h4 className="text-zinc-900 text-sm font-semibold">Delete Account</h4>
                                    <p className="text-zinc-500 text-sm mt-1">Permanently delete your account and all associated data. This action cannot be undone.</p>
                                </div>
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="self-start md:self-auto px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 rounded-lg transition-colors"
                                >
                                    Delete Account
                                </button>
                            </div>
                        </div>

                        {/* Delete Account Confirmation Modal */}
                        {showDeleteConfirm && (
                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                                <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                                    <div className="p-6 border-b border-zinc-200">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-red-100 rounded-lg">
                                                <AlertTriangle className="h-5 w-5 text-red-600" />
                                            </div>
                                            <h3 className="text-lg font-bold text-zinc-900">Delete Account</h3>
                                        </div>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        <p className="text-sm text-zinc-600">
                                            This action is <strong className="text-red-600">permanent and irreversible</strong>. All your data, projects, and settings will be permanently deleted.
                                        </p>
                                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                            <p className="text-sm text-red-800">
                                                To confirm, please type <strong>DELETE</strong> below:
                                            </p>
                                        </div>
                                        <input
                                            type="text"
                                            value={deleteConfirmText}
                                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                                            placeholder="Type DELETE to confirm"
                                            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 h-11 px-4 text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all"
                                        />
                                    </div>
                                    <div className="p-6 border-t border-zinc-200 flex justify-end gap-3">
                                        <button
                                            onClick={() => {
                                                setShowDeleteConfirm(false)
                                                setDeleteConfirmText('')
                                            }}
                                            className="px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleDeleteAccount}
                                            disabled={isDeletingAccount || deleteConfirmText !== 'DELETE'}
                                            className="px-6 py-2 text-sm font-bold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            {isDeletingAccount ? <Loader2 className="h-4 w-4 animate-spin" /> : <AlertTriangle className="h-4 w-4" />}
                                            Delete My Account
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'billing' && (
                    <>
                        <div className="mb-8">
                            <h1 className="text-zinc-900 text-3xl font-bold leading-tight tracking-tight mb-2">Billing & Subscription</h1>
                            <p className="text-zinc-500 text-base font-normal">Manage your plan and billing information.</p>
                        </div>

                        <div className="max-w-4xl">
                            <PricingTable currentPlan={profile?.subscription_plan || 'free'} />
                        </div>
                    </>
                )}
            </main>
        </div>
    )
}
