import { AppShell } from "@/components/layout/app-shell"

import { redirect } from "next/navigation"

import { getUser } from "@/lib/auth"

export default async function MainLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const user = await getUser()

    if (!user) {
        redirect("/login")
    }

    return (
        <AppShell user={user}>
            {children}
        </AppShell>
    )
}
