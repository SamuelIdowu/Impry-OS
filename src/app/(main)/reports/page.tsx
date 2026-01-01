import React from "react"
import { ReportsView } from "@/components/reports/ReportsView"
import { fetchProjects } from "@/server/actions/projects"
import { getInvoices } from "@/server/actions/payments"

export default async function ReportsPage() {
    const [projects, invoices] = await Promise.all([
        fetchProjects(),
        getInvoices()
    ])

    return <ReportsView projects={projects.success && projects.data ? projects.data : []} invoices={invoices} />
}
