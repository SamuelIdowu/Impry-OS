"use client"

import React, { useState } from "react"
import Link from "next/link"
import {
    Search,
    Filter,
    ArrowRight,
    Plus,
    LayoutGrid,
    List as ListIcon
} from "lucide-react"
import { cn } from "@/lib/utils"
// Shared Components
import { PageHeader } from "@/components/shared/PageHeader"
import { StatusBadge } from "@/components/shared/StatusBadge"
// Data
import { AddProjectDialog } from "@/components/forms/addProjectDialog"
import { ProjectCard } from "@/components/projectCard"

import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdownMenu"
import { Status, Project as UIProject } from "@/lib/types"
import { EmptyProjects } from "@/components/emptyProjects"

// DB types
import { ProjectWithClient } from "@/lib/types/project"

interface ProjectListProps {
    initialProjects: ProjectWithClient[];
    clients: { id: string; name: string }[];
}

function mapDbProjectToUiProject(dbProject: ProjectWithClient): UIProject {
    return {
        id: dbProject.id,
        name: dbProject.name,
        clientId: dbProject.client_id || '',
        clientName: dbProject.client?.name || 'Unknown',
        status: dbProject.status as any, // Cast status
        progress: 0, // Not in DB yet
        dueDate: dbProject.deadline ? new Date(dbProject.deadline).toLocaleDateString() : 'No date',
        startDate: dbProject.start_date ? new Date(dbProject.start_date).toLocaleDateString() : 'No date',
        totalValue: dbProject.budget || 0,
        paidAmount: 0,
        description: dbProject.description || undefined,
        avatar: dbProject.client?.name.substring(0, 2).toUpperCase()
    };
}

export function ProjectList({ initialProjects, clients }: ProjectListProps) {
    const [view, setView] = useState<"list" | "grid">("list")
    const [searchTerm, setSearchTerm] = useState("")
    const [isAddProjectOpen, setIsAddProjectOpen] = useState(false)
    const [selectedStatuses, setSelectedStatuses] = useState<Status[]>([])

    // Empty State Check
    if (initialProjects.length === 0) {
        return (
            <div className="w-full max-w-[1200px] mx-auto py-8 px-4 lg:px-8">
                <AddProjectDialog
                    open={isAddProjectOpen}
                    onOpenChange={setIsAddProjectOpen}
                    onSuccess={() => { }}
                    clients={clients}
                />
                <EmptyProjects onAddProject={() => setIsAddProjectOpen(true)} />
            </div>
        )
    }

    // Map DB projects to UI projects
    const projects = initialProjects.map(mapDbProjectToUiProject);

    const allStatuses: Status[] = [
        "In Progress",
        "Completed",
        "On Track",
        "Pending",
        "Draft",
        "Overdue",
        "Active",
        "Inactive"
    ]

    const filteredProjects = projects.filter(project => {
        const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.clientName.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(project.status)

        return matchesSearch && matchesStatus
    })

    const toggleStatus = (status: Status) => {
        setSelectedStatuses(current =>
            current.includes(status)
                ? current.filter(s => s !== status)
                : [...current, status]
        )
    }

    return (
        <div className="flex flex-col items-center py-8 px-4 lg:px-8 w-full">
            <div className="w-full flex flex-col gap-10">

                <PageHeader
                    title="Projects"
                    description="Manage your active projects and deliverables."
                >
                    <button
                        onClick={() => setIsAddProjectOpen(true)}
                        className="flex items-center justify-center rounded-lg h-10 px-5 bg-zinc-900 text-white text-sm font-medium shadow-sm hover:shadow-md hover:bg-zinc-800 transition-all group"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        <span>New Project</span>
                    </button>
                </PageHeader>

                {/* Filters */}
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full lg:w-80 group">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-zinc-500 group-focus-within:text-zinc-900 transition-colors">
                            <Search className="h-5 w-5" />
                        </div>
                        <input
                            className="w-full h-10 rounded-lg bg-white border border-zinc-200 text-zinc-900 text-sm placeholder-zinc-500 pl-10 pr-4 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/10 focus:outline-none transition-all shadow-sm"
                            placeholder="Search projects..."
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="h-10 px-3 rounded-lg border border-zinc-200 bg-white text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-colors flex items-center gap-2">
                                    <Filter className="h-5 w-5" />
                                    <span className="text-sm font-medium">
                                        Filter
                                        {selectedStatuses.length > 0 && (
                                            <span className="ml-1 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-900">
                                                {selectedStatuses.length}
                                            </span>
                                        )}
                                    </span>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 bg-white">
                                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {allStatuses.map((status) => (
                                    <DropdownMenuCheckboxItem
                                        key={status}
                                        checked={selectedStatuses.includes(status)}
                                        onCheckedChange={() => toggleStatus(status)}
                                    >
                                        <StatusBadge status={status} className="mr-2" />
                                        <span className="sr-only">{status}</span>
                                    </DropdownMenuCheckboxItem>
                                ))}
                                {selectedStatuses.length > 0 && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuCheckboxItem
                                            checked={false}
                                            onCheckedChange={() => setSelectedStatuses([])}
                                            className="justify-center text-center text-red-500 focus:text-red-500"
                                        >
                                            Clear Filters
                                        </DropdownMenuCheckboxItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <div className="h-10 border-l border-zinc-200 mx-2"></div>
                        <button
                            onClick={() => setView("list")}
                            className={cn(
                                "p-2 rounded-md transition-all",
                                view === "list"
                                    ? "bg-white border border-zinc-200 text-zinc-900 shadow-sm"
                                    : "text-zinc-500 hover:bg-zinc-100"
                            )}
                        >
                            <ListIcon className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => setView("grid")}
                            className={cn(
                                "p-2 rounded-md transition-all",
                                view === "grid"
                                    ? "bg-white border border-zinc-200 text-zinc-900 shadow-sm"
                                    : "text-zinc-500 hover:bg-zinc-100"
                            )}
                        >
                            <LayoutGrid className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Projects Content */}
                {view === "list" ? (
                    <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-zinc-50/50 border-b border-zinc-200">
                                    <th className="py-3 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Project Name</th>
                                    <th className="py-3 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Client</th>
                                    <th className="py-3 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Deadline</th>
                                    <th className="py-3 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Progress</th>
                                    <th className="py-3 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                                    <th className="py-3 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200">
                                {filteredProjects.map((project) => (
                                    <tr key={project.id} className="hover:bg-zinc-50/50 transition-colors group">
                                        <td className="py-4 px-6">
                                            <div className="font-medium text-sm text-zinc-900">{project.name}</div>
                                            <div className="text-xs text-zinc-500 mt-0.5">{project.description?.substring(0, 20)}...</div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                <div className="size-6 rounded-full bg-zinc-100 text-zinc-600 flex items-center justify-center text-[10px] font-bold">
                                                    {project.avatar || project.clientName.substring(0, 2).toUpperCase()}
                                                </div>
                                                <span className="text-sm text-zinc-900">{project.clientName}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-zinc-500">{project.dueDate}</td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-24 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={cn("h-full rounded-full",
                                                            project.progress >= 90 ? "bg-green-500" :
                                                                project.progress >= 50 ? "bg-blue-500" : "bg-orange-500"
                                                        )}
                                                        style={{ width: `${project.progress}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs text-zinc-500">{project.progress}%</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <StatusBadge status={project.status} />
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <Link href={`/projects/${project.id}`} className="inline-flex text-zinc-500 hover:text-zinc-900 p-1 rounded hover:bg-zinc-100 transition-colors">
                                                <ArrowRight className="h-[18px] w-[18px]" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {filteredProjects.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-zinc-500 text-sm">
                                            No projects found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                        {filteredProjects.map((project) => (
                            <ProjectCard key={project.id} project={project} />
                        ))}
                    </div>
                )}
            </div>

            <AddProjectDialog
                open={isAddProjectOpen}
                onOpenChange={setIsAddProjectOpen}
                onSuccess={() => { }}
                clients={clients}
            />
        </div >
    )
}
