import React from "react"
import { InvoiceList } from "@/components/invoices/InvoiceList"
import { getInvoices } from "@/server/actions/payments"
import { fetchClients } from "@/server/actions/clients"
import { fetchProjects } from "@/server/actions/projects"

export default async function InvoicesPage() {
    const [invoices, clientsResult, projectsResult] = await Promise.all([
        getInvoices(),
        fetchClients(),
        fetchProjects()
    ])

    const clients = clientsResult.success && clientsResult.data ? clientsResult.data : [];
    const projectsWithClients = projectsResult.success && projectsResult.data ? projectsResult.data : [];

    // Map projects to format expected by InvoiceList
    const projects = projectsWithClients.map(p => ({
        id: p.id,
        name: p.name,
        clientId: p.client_id || ''
    }))

    return <InvoiceList invoices={invoices} clients={clients} projects={projects} />
}
