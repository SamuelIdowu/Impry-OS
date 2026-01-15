import React from "react"
import { createClient as createSupabaseClient } from '@/lib/auth'
import { SettingsForm } from "@/components/settings/SettingsForm"

export default async function SettingsPage() {
    const supabase = await createSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return <div>Please log in to view settings.</div>
    }

    const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

    return <SettingsForm user={user} profile={profile} />
}
