import React from "react"
import { notFound } from "next/navigation"
import { fetchClient, fetchClientPayments } from "@/server/actions/clients"
import { fetchClientProjects } from "@/server/actions/projects"
import { ClientDetailView } from "@/components/clients/clientDetailView"

// Use standard PageProps type for Next.js App Router
type PageProps = {
    params: Promise<{ clientId: string }>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ClientDetailPage(props: PageProps) {
    const params = await props.params;
    const { clientId } = params

    const [clientResult, projectsResult, paymentsResult] = await Promise.all([
        fetchClient(clientId),
        fetchClientProjects(clientId),
        fetchClientPayments(clientId)
    ])

    if (!clientResult.success || !clientResult.data) {
        return <div>Client not found</div>
    }

    const client = clientResult.data
    const projects = projectsResult.success ? projectsResult.data || [] : []
    const payments = paymentsResult.success ? paymentsResult.data || [] : []

    return (
        <ClientDetailView
            client={client}
            projects={projects}
            payments={payments}
        />
    )
}
