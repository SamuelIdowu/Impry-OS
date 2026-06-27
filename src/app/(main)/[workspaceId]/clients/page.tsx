import React from "react"
import { fetchClients, fetchClientStats } from "@/server/actions/clients"
import { ClientList } from "@/components/clients/clientList"

export default async function ClientsPage() {
    const [clientsResult, statsResult] = await Promise.all([
        fetchClients(),
        fetchClientStats()
    ])

    const clients = clientsResult.success && clientsResult.data ? clientsResult.data : []
    const stats = statsResult.success && statsResult.data ? statsResult.data : {
        totalClients: 0,
        activeProjects: 0,
        totalRevenue: 0,
        pendingRevenue: 0
    }

    return <ClientList initialClients={clients} stats={stats} />
}
