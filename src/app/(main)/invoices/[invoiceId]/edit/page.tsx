import { InvoiceEditor } from "@/components/invoices/InvoiceEditor"
import { fetchClients } from "@/server/actions/clients"
import { fetchProjects } from "@/server/actions/projects"
import { getInvoice } from "@/server/actions/payments"

interface EditInvoicePageProps {
    params: Promise<{ invoiceId: string }>
}

export default async function EditInvoicePage({ params }: EditInvoicePageProps) {
    const { invoiceId } = await params
    const [invoice, clientsResult, projectsResult] = await Promise.all([
        getInvoice(invoiceId),
        fetchClients(),
        fetchProjects()
    ])

    const clients = clientsResult.success && clientsResult.data ? clientsResult.data : []
    const projects = projectsResult.success && projectsResult.data ? projectsResult.data : []

    return (
        <InvoiceEditor
            clients={clients}
            projects={projects.map((p: any) => ({
                id: p.id,
                name: p.name,
                clientId: p.client_id
            }))}
            initialData={invoice}
        />
    )
}
