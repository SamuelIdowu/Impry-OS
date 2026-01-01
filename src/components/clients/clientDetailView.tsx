"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
    ArrowLeft,
    MoreHorizontal,
    Mail,
    Globe,
    Pencil,
    Plus,
    Building2,
    MapPin,
    Wallet,
    AlertTriangle,
    ArrowRight,
    User,
    Calendar,
    Loader2
} from "lucide-react"

import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { AddProjectDialog } from "@/components/forms/addProjectDialog"
import { EditClientDialog } from "@/components/forms/editClientDialog"

// Import types
import { ClientWithProjects } from "@/lib/types/client"
import { Project } from "@/lib/types/project"
import { Client as UIClient, Project as UIProject } from "@/lib/types"
import { mapDatabaseToAppStatus } from "@/lib/types/project"

// Server Actions
import { updateClientNotesAction, updateClientStatusAction } from "@/server/actions/clients"
import { createProjectAction } from "@/server/actions/projects"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { Payment } from "@/lib/types/payment"
import { EmptyClientProjects } from "@/components/emptyClientProjects"


interface ClientDetailViewProps {
    client: ClientWithProjects;
    projects: Project[];
    payments: Payment[];
}

// ... helpers ...

export function ClientDetailView({ client, projects, payments }: ClientDetailViewProps) {
    // ... hooks ...
    const [noteInput, setNoteInput] = useState("")
    const [isSavingNote, setIsSavingNote] = useState(false)
    const [isEditClientOpen, setIsEditClientOpen] = useState(false)
    const [isAddProjectOpen, setIsAddProjectOpen] = useState(false)

    // Derived stats
    const totalRevenue = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0)
    const outstandingInvoices = payments.filter(p => p.status !== 'paid')
    const outstandingAmount = outstandingInvoices.reduce((sum, p) => sum + p.amount, 0)

    const uiProjects: UIProject[] = projects.map(p => {
        const appStatus = mapDatabaseToAppStatus(p.status);
        let uiStatus: import("@/lib/types").Status = 'Active'; // Default fallback

        switch (appStatus) {
            case 'lead': uiStatus = 'Draft'; break;
            case 'active': uiStatus = 'Active'; break;
            case 'waiting': uiStatus = 'On Track'; break;
            case 'completed': uiStatus = 'Completed'; break;
        }

        return {
            id: p.id,
            name: p.name,
            clientId: client.id,
            clientName: client.name,
            status: uiStatus,
            progress: 0, // Default for now
            dueDate: p.deadline || new Date().toISOString(), // Fallback
            startDate: p.start_date || new Date().toISOString(),
            totalValue: p.budget || 0,
            paidAmount: 0, // Needs calculation from payments if linked
            description: p.description || undefined,
        }
    })

    // Contact info placeholders
    const contactName = "Primary Contact"; // Placeholder
    const contactRole = "Role"; // Placeholder
    const address = ["Remote", "Earth"]; // Placeholder

    const handleStatusChange = async (newStatus: string) => {
        try {
            const res = await updateClientStatusAction(client.id, newStatus as any);
            if (!res.success) {
                console.error(res.error);
                alert("Failed to update status");
            }
        } catch (error) {
            console.error(error);
        }
    }

    const handleCreateProject = async (data: any) => {
        // Map form data to server action input
        // AddProjectDialog needs to be updated to match the input expected by createProjectAction
        // For now, we wrap it
        try {
            const res = await createProjectAction({
                name: data.name,
                client_id: client.id,
                description: data.description,
                status: 'planning', // Default status
                start_date: new Date().toISOString(),
                deadline: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
                budget: Number(data.budget) || 0
            });

            if (res.success) {
                // Determine if we need to refresh manually or if Server Action revalidatePath handles it
                // revalidatePath in action should handle it.
                // But AddProjectDialog might expect a promise resolution.
            } else {
                console.error(res.error);
            }
        } catch (e) {
            console.error(e);
        }
    }

    const handleUpdateClient = async (id: string, data: any) => {
        // Implement update client action here
        console.log("Update client", id, data);
    }

    const handleSaveNote = async () => {
        if (!noteInput.trim()) return;
        setIsSavingNote(true)
        const currentNotes = client.notes || "";
        const newNotes = currentNotes + "\n• " + noteInput;

        await updateClientNotesAction(client.id, newNotes);

        setNoteInput("")
        setIsSavingNote(false)
    }

    // Split notes by bullet point or newline for display
    const notesList = client.notes
        ? client.notes.split('\n').filter(line => line.trim().length > 0).map(line => line.replace(/^[•\-\*]\s*/, ''))
        : [];

    return (
        <div className="flex flex-col w-full mx-auto py-8 px-4 lg:px-8 gap-8">
            {/* Breadcrumb & Navigation */}
            <div className="flex items-center gap-2 text-sm text-zinc-500 mb-[-1rem]">
                <Link href="/clients" className="hover:text-zinc-900 transition-colors">Clients</Link>
                <span>/</span>
                <span className="text-zinc-900 font-medium">{client.name}</span>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 bg-white rounded-xl border border-zinc-200 flex items-center justify-center shadow-sm">
                        <Building2 className="h-8 w-8 text-zinc-900" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">{client.name}</h1>
                        <div className="flex items-center gap-2 text-zinc-500 mt-1">
                            <MapPin className="h-4 w-4" />
                            <span className="text-sm">{client.company || "Remote"}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Select
                        defaultValue={client.status || 'active'}
                        onValueChange={handleStatusChange}
                    >
                        <SelectTrigger className="w-[140px] h-10 bg-white border-zinc-200">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${(client.status === 'active' || !client.status) ? 'bg-green-500' :
                                        client.status === 'inactive' ? 'bg-zinc-400' :
                                            client.status === 'lead' ? 'bg-blue-500' : 'bg-orange-500'
                                    }`} />
                                <SelectValue placeholder="Status" />
                            </div>
                        </SelectTrigger>
                        <SelectContent align="end">
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="lead">Lead</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button
                        variant="outline"
                        className="h-10 border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900"
                        onClick={() => setIsEditClientOpen(true)}
                    >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Client
                    </Button>
                    <Button
                        className="h-10 bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm"
                        onClick={() => setIsAddProjectOpen(true)}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Project
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Details & Notes */}
                <div className="space-y-6 lg:col-span-1">
                    {/* Client Details Card */}
                    <Card className="border-zinc-200 shadow-sm overflow-hidden">
                        <CardHeader className="pb-3 border-b border-zinc-100 flex flex-row items-center justify-between">
                            <CardTitle className="text-lg font-bold">Client Details</CardTitle>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="pt-5 space-y-6">
                            {/* Primary Contact */}
                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center flex-shrink-0">
                                    <User className="h-5 w-5 text-zinc-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-0.5">Primary Contact</p>
                                    <h4 className="font-semibold text-zinc-900">{contactName}</h4>
                                    <p className="text-sm text-zinc-500">{contactRole}</p>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center flex-shrink-0">
                                    <Mail className="h-5 w-5 text-zinc-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-0.5">Email</p>
                                    <p className="font-medium text-zinc-900 break-all">{client.email}</p>
                                </div>
                            </div>

                            {/* Website */}
                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center flex-shrink-0">
                                    <Globe className="h-5 w-5 text-zinc-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-0.5">Website</p>
                                    <p className="font-medium text-zinc-900">--</p>
                                </div>
                            </div>

                            <Separator />

                            {/* Billing Address */}
                            <div className="space-y-2">
                                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Billing Address</p>
                                <div className="text-sm text-zinc-600 leading-relaxed">
                                    {address.map((line, i) => (
                                        <div key={i}>{line}</div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notes Card */}
                    <Card className="border-zinc-200 shadow-sm">
                        <CardHeader className="pb-3 flex flex-row items-center justify-between">
                            <CardTitle className="text-lg font-bold">Notes</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {notesList.length > 0 ? notesList.map((note, i) => (
                                <div key={i} className={`text-sm text-zinc-700 p-3 rounded-lg bg-yellow-50/50 border border-yellow-100 leading-relaxed`}>
                                    {note}
                                </div>
                            )) : (
                                <div className="text-sm text-zinc-400 italic">No notes yet.</div>
                            )}
                            <div className="relative mt-2">
                                <input
                                    className="w-full h-10 rounded-lg bg-zinc-50 border border-zinc-200 text-sm px-3 pr-10 focus:outline-none focus:ring-1 focus:ring-zinc-900/10 transition-shadow"
                                    placeholder="Add a quick note..."
                                    value={noteInput}
                                    onChange={(e) => setNoteInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSaveNote();
                                    }}
                                    disabled={isSavingNote}
                                />
                                <div
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 cursor-pointer hover:text-zinc-600"
                                    onClick={handleSaveNote}
                                >
                                    {isSavingNote ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Stats & Projects */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <Card className="border-zinc-200 shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-medium text-zinc-500">Total Revenue</p>
                                        <h3 className="text-3xl font-bold text-zinc-900 mt-2">${totalRevenue.toLocaleString()}</h3>
                                    </div>
                                    <div className="h-10 w-10 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-400">
                                        <Wallet className="h-5 w-5" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-zinc-200 shadow-sm relative overflow-hidden">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-medium text-zinc-500">Outstanding</p>
                                        <h3 className="text-3xl font-bold text-zinc-900 mt-2">${outstandingAmount.toLocaleString()}</h3>
                                    </div>
                                    <div className="h-10 w-10 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-400">
                                        <AlertTriangle className="h-5 w-5" />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center">
                                    <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100 rounded-md px-2 py-0.5 font-medium">
                                        {outstandingInvoices.length} overdue
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Projects Table */}
                    <Card className="border-zinc-200 shadow-sm overflow-hidden">
                        <CardHeader className="pb-0 border-b border-zinc-100 px-6 pt-6 mb-4">
                            <div className="flex items-center justify-between mb-4">
                                <CardTitle className="text-lg font-bold">Projects</CardTitle>
                                <Button variant="outline" size="sm" className="h-8 text-xs font-medium border-zinc-200">
                                    All Status
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="w-full">
                                <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-zinc-50 border-b border-zinc-100 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                    <div className="col-span-5">Project Name</div>
                                    <div className="col-span-3">Timeline</div>
                                    <div className="col-span-2">Revenue</div>
                                    <div className="col-span-2 text-right">Status</div>
                                </div>
                                <div className="divide-y divide-zinc-100">
                                    {uiProjects.length > 0 ? (
                                        uiProjects.map((project) => (
                                            <div key={project.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-zinc-50/50 transition-colors group cursor-pointer">
                                                <div className="col-span-5 min-w-0">
                                                    <h4 className="text-sm font-semibold text-zinc-900 truncate">{project.name}</h4>
                                                    <Badge variant="secondary" className="mt-1 bg-zinc-100 text-zinc-500 font-normal text-xs border-none shadow-none rounded-sm px-1.5 h-5 inline-flex">
                                                        {project.name.toLowerCase().includes('marketing') ? 'Marketing' : 'Development'}
                                                    </Badge>
                                                </div>
                                                <div className="col-span-3">
                                                    <div className="flex items-center gap-1.5 text-sm text-zinc-500">
                                                        <Calendar className="h-3.5 w-3.5" />
                                                        <span className="truncate">{project.startDate} - {project.dueDate.split(',')[0]}</span>
                                                    </div>
                                                </div>
                                                <div className="col-span-2">
                                                    <span className="text-sm font-bold text-zinc-900">${project.totalValue.toLocaleString()}</span>
                                                </div>
                                                <div className="col-span-2 flex justify-end items-center">
                                                    <StatusBadge status={project.status} />
                                                    <ArrowRight className="h-4 w-4 text-zinc-300 ml-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-4">
                                            <EmptyClientProjects
                                                onAddProject={() => setIsAddProjectOpen(true)}
                                                clientName={client.name}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="p-4 border-t border-zinc-100 flex justify-center">
                                <Button variant="ghost" size="sm" className="text-xs text-zinc-500 hover:text-zinc-900 font-medium tracking-wide items-center uppercase">
                                    View Full History
                                    <ArrowRight className="ml-1.5 h-3 w-3" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
            {/* Add Project Dialog */}
            <AddProjectDialog
                open={isAddProjectOpen}
                onOpenChange={setIsAddProjectOpen}
                onSuccess={() => {
                    // Refresh handled by Server Action revalidate
                }}
                clientId={client.id}
                clientName={client.name}
                onSubmit={handleCreateProject}
            />

            {/* Edit Client Dialog */}
            <EditClientDialog
                client={client as any}
                open={isEditClientOpen}
                onOpenChange={setIsEditClientOpen}
                onSuccess={() => console.log("Client updated")}
                onSubmit={handleUpdateClient}
            />
        </div>
    )
}
