import React from "react"
import { InvoiceEditor } from "@/components/invoices/InvoiceEditor"
import { fetchClients } from "@/server/actions/clients"
import { fetchProjects } from "@/server/actions/projects"

export default async function NewInvoicePage() {
    const [clientsResult, projectsResult] = await Promise.all([
        fetchClients(),
        fetchProjects()
    ])

    const clients = clientsResult.success && clientsResult.data ? clientsResult.data : []
    const projectsWithClients = projectsResult.success && projectsResult.data ? projectsResult.data : []

    // Map projects to format expected by InvoiceEditor
    const projects = projectsWithClients.map(p => ({
        id: p.id,
        name: p.name,
        clientId: p.client_id || ''
    }))

    return (
        <InvoiceEditor clients={clients} projects={projects} />
    )
}
