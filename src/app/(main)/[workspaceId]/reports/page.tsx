import React from "react"
import { ReportsView } from "@/components/reports/ReportsView"
import { fetchProjects } from "@/server/actions/projects"
import { getInvoices } from "@/server/actions/payments"
import { getUser } from "@/lib/auth"
import { getCurrentWorkspaceId } from "@/server/actions/workspaces"
import { getWorkspacePlan } from "@/lib/payments/guards"

export default async function ReportsPage() {
    const workspaceId = await getCurrentWorkspaceId()
    const [projects, invoices, user, planTier] = await Promise.all([
        fetchProjects(),
        getInvoices(),
        getUser(),
        workspaceId ? getWorkspacePlan(workspaceId) : Promise.resolve("free")
    ])

    return <ReportsView
        projects={projects.success && projects.data ? projects.data : []}
        invoices={invoices}
        userCreatedAt={user?.createdAt ? new Date(user.createdAt).toISOString() : new Date().toISOString()}
        planTier={planTier}
    />
}
