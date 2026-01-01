import { AppShell } from "@/components/layout/app-shell"
import { createClient } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function MainLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    return (
        <AppShell user={user}>
            {children}
        </AppShell>
    )
}
