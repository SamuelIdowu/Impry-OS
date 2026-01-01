"use client"

import React, { useState } from "react"
import {
    Search,
    UserPlus,
    Users,
    Layers,
    Wallet,
    LayoutGrid,
    List,
    Plus,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Upload
} from "lucide-react"
import { StatsCard } from "@/components/shared/StatsCard"
import { ClientCard } from "@/components/clientCard"
import { ClientListRow } from "@/components/clientListRow"
import { NewClientDialog } from "@/components/NewClientDialog"
import { cn } from "@/lib/utils"
// Import DB types
import type { ClientWithProjects } from "@/lib/types/client"
// Import UI types
import { Client as UIClient, Status } from "@/lib/types"
import { EmptyClients } from "@/components/emptyClients"
import { ImportClientsDialog } from "@/components/clients/ImportClientsDialog"

interface ClientListProps {
    initialClients: ClientWithProjects[];
    stats: {
        totalClients: number;
        activeProjects: number;
        totalRevenue: number;
        pendingRevenue: number;
    };
}

// Helper to map DB Client to UI Client
function mapDbClientToUiClient(dbClient: ClientWithProjects): UIClient {
    // Determine status based on projects or fields
    let status: Status = 'Active';

    if (dbClient.status === 'inactive') status = 'Inactive';
    if (dbClient.status === 'archived') status = 'Archived';
    if (dbClient.status === 'lead') status = 'Lead';
    // if (dbClient.active_projects_count === 0) status = 'Inactive';

    // Revenue mock calculation (since we don't have it in DB client yet)
    const totalRevenue = 0;

    return {
        id: dbClient.id,
        name: dbClient.name,
        email: dbClient.email,
        companyName: dbClient.company || dbClient.name,
        status: status,
        totalRevenue: totalRevenue,
        projectCount: dbClient.active_projects_count,
        lastActive: dbClient.last_contact_date ? new Date(dbClient.last_contact_date).toLocaleDateString() : 'Never',
        joinedDate: new Date(dbClient.created_at).toLocaleDateString(),
        location: 'Remote', // Placeholder
        description: dbClient.notes || undefined,
        avatar: dbClient.name.substring(0, 2).toUpperCase()
    };
}

export function ClientList({ initialClients, stats }: ClientListProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [activeTab, setActiveTab] = useState('All Clients')

    // State for clients list
    const [dbClients, setDbClients] = useState<ClientWithProjects[]>(initialClients)
    const [isAddClientOpen, setIsAddClientOpen] = useState(false)
    const [isImportOpen, setIsImportOpen] = useState(false)

    // Sync state with prop when it changes (e.g. after server action revalidate)
    React.useEffect(() => {
        setDbClients(initialClients);
    }, [initialClients]);

    // Derived UI clients
    const clients = dbClients.map(mapDbClientToUiClient);

    // Empty State Check
    if (initialClients.length === 0) {
        return (
            <div className="w-full max-w-[1600px] mx-auto py-8 px-4 lg:px-8">
                <NewClientDialog
                    open={isAddClientOpen}
                    onOpenChange={setIsAddClientOpen}
                    onClientAdd={(c) => {
                        console.log("Client added", c);
                        // Refresh logic would ideally go here or via router.refresh() 
                        // For now we assume optimistic update or page reload pattern usually handled by parent
                    }}
                />
                <ImportClientsDialog
                    open={isImportOpen}
                    onOpenChange={setIsImportOpen}
                    onSuccess={() => {
                        // Trigger a router refresh to ensure client components get updated data
                        // although revalidatePath should handle it, redundancy is safer here
                        // router.refresh() 
                        // Note: router is not imported yet, let's keep it simple for now as useEffect should handle prop updates
                    }}
                />
                <EmptyClients
                    onAddClient={() => setIsAddClientOpen(true)}
                    onImport={() => setIsImportOpen(true)}
                />
            </div>
        )
    }

    const tabs = ['All Clients', 'Active', 'Leads', 'Inactive', 'Archived']

    const filteredClients = clients.filter(client => {
        const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.companyName.toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;

        switch (activeTab) {
            case 'Active':
                return client.status === 'Active';
            case 'Leads':
                return client.status === 'Lead';
            case 'Inactive':
                return client.status === 'Inactive';
            case 'Archived':
                return client.status === 'Archived';
            default: // 'All Clients'
                return true;
        }
    })

    return (
        <div className="flex flex-col py-8 px-4 lg:px-8 w-full max-w-[1600px] mx-auto space-y-8">

            <NewClientDialog
                open={isAddClientOpen}
                onOpenChange={setIsAddClientOpen}
                onClientAdd={(c) => {
                    console.log("Client added", c);
                }}
            />

            <ImportClientsDialog
                open={isImportOpen}
                onOpenChange={setIsImportOpen}
            />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900">My Clients</h1>
                    <p className="text-zinc-500 mt-1">Manage relationships and active scopes.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsImportOpen(true)}
                        className="flex items-center justify-center rounded-lg h-10 px-5 bg-white border border-zinc-200 text-zinc-700 text-sm font-medium shadow-sm hover:shadow-md hover:bg-zinc-50 transition-all"
                    >
                        <Upload className="mr-2 h-4 w-4" />
                        <span>Import</span>
                    </button>
                    <button
                        onClick={() => setIsAddClientOpen(true)}
                        className="flex items-center justify-center rounded-lg h-10 px-5 bg-zinc-900 text-white text-sm font-medium shadow-sm hover:shadow-md hover:bg-zinc-800 transition-all group"
                    >
                        <UserPlus className="mr-2 h-4 w-4" />
                        <span>Add Customer</span>
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard
                    title="Total Clients"
                    value={stats.totalClients}
                    icon={Users}
                    trend="+0"
                    trendLabel="this month"
                    trendDirection="neutral"
                    iconColor="bg-green-50 text-green-600"
                />
                <StatsCard
                    title="Active Projects"
                    value={stats.activeProjects}
                    icon={Layers}
                    trendLabel={`Across ${stats.totalClients} clients`}
                    iconColor="bg-blue-50 text-blue-600"
                />
                <StatsCard
                    title="Revenue Pending"
                    value={`$${stats.pendingRevenue.toLocaleString()}`}
                    icon={Wallet}
                    trend={`$${stats.totalRevenue.toLocaleString()} collected`}
                    trendLabel="lifetime"
                    trendDirection="up"
                    iconColor="bg-orange-50 text-orange-600"
                />
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-6 justify-between items-center border-b border-zinc-100 pb-1">
                {/* Search */}
                <div className="relative w-full md:w-80 pb-4 md:pb-0">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-zinc-400">
                        <Search className="h-4 w-4" />
                    </div>
                    <input
                        className="w-full h-10 rounded-full bg-white border border-zinc-200 text-zinc-900 text-sm placeholder-zinc-400 pl-10 pr-4 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/10 focus:outline-none transition-all shadow-sm"
                        placeholder="Search customers..."
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-6 overflow-x-auto w-full md:w-auto pb-4 md:pb-0 hide-scrollbar">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "text-sm font-medium whitespace-nowrap transition-colors pb-3 border-b-2",
                                activeTab === tab
                                    ? "text-zinc-900 border-zinc-900"
                                    : "text-zinc-500 border-transparent hover:text-zinc-700"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* View Toggle */}
                <div className="hidden md:flex items-center gap-2 pb-4 md:pb-0">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={cn("p-2 rounded-md transition-all", viewMode === 'grid' ? "bg-zinc-100 text-zinc-900" : "text-zinc-400 hover:text-zinc-600")}
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={cn("p-2 rounded-md transition-all", viewMode === 'list' ? "bg-zinc-100 text-zinc-900" : "text-zinc-400 hover:text-zinc-600")}
                    >
                        <List className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Client Grid / List */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredClients.map(client => (
                        <ClientCard key={client.id} client={client} />
                    ))}

                    {/* Add New Client Card */}
                    <button
                        onClick={() => setIsAddClientOpen(true)}
                        className="h-full min-h-[280px] rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 hover:bg-zinc-50 hover:border-zinc-300 transition-all flex flex-col items-center justify-center gap-3 group cursor-pointer text-center p-6"
                    >
                        <div className="h-12 w-12 rounded-full bg-white border border-zinc-200 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                            <Plus className="h-6 w-6 text-zinc-400 group-hover:text-zinc-600" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-semibold text-zinc-900">Add New Client</h3>
                            <p className="text-xs text-zinc-500">Onboard a new client</p>
                        </div>
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                    <div className="flex flex-col">
                        {filteredClients.length > 0 ? (
                            filteredClients.map(client => (
                                <ClientListRow key={client.id} client={client} />
                            ))
                        ) : (
                            <div className="p-8 text-center text-zinc-500 text-sm">
                                No clients found.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Pagination */}
            <div className="flex items-center justify-end gap-2 pt-8">
                <button className="h-8 w-8 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 disabled:opacity-50">
                    <ChevronLeft className="h-4 w-4" />
                </button>
                <button className="h-8 w-8 rounded-full bg-zinc-900 text-white flex items-center justify-center text-sm font-medium">1</button>
                <button className="h-8 w-8 rounded-full border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 flex items-center justify-center text-sm font-medium">2</button>
                <button className="h-8 w-8 rounded-full border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 flex items-center justify-center text-sm font-medium">3</button>
                <button className="h-8 w-8 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50">
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    )
}
