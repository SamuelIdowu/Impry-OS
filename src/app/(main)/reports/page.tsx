import React from "react"
import { ReportsView } from "@/components/reports/ReportsView"
import { fetchProjects } from "@/server/actions/projects"
import { getInvoices } from "@/server/actions/payments"
import { getUser } from "@/lib/auth"

export default async function ReportsPage() {
    const [projects, invoices, user] = await Promise.all([
        fetchProjects(),
        getInvoices(),
        getUser()
    ])

    return <ReportsView
        projects={projects.success && projects.data ? projects.data : []}
        invoices={invoices}
        userCreatedAt={user?.created_at || new Date().toISOString()} // Fallback to now if no user (shouldn't happen in auth'd app)
    />
}
