import { AppShell } from "@/components/layout/app-shell"
import { redirect } from "next/navigation"
import { getUser } from "@/lib/auth"
import { verifyWorkspaceAccess } from "@/server/actions/workspaces"

export default async function MainLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ workspaceId: string }>
}) {
    const user = await getUser()

    if (!user) {
        redirect("/login")
    }

    const resolvedParams = await params
    const workspaceId = resolvedParams.workspaceId

    // Verify user has access to this workspace
    const hasAccess = await verifyWorkspaceAccess(workspaceId)
    if (!hasAccess) {
        // Redirect to a default workspace or 404/unauthorized
        // For now we could redirect to a workspaces select page or just throw a 404
        redirect("/login?error=unauthorized")
    }

    return (
        <AppShell user={user}>
            {children}
        </AppShell>
    )
}
