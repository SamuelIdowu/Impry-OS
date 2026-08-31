"use client"
import React, { useState, useTransition } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowRight, Calendar, MoreHorizontal, Trash2, Eye, Receipt, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
// Shared Components
import { StatusBadge } from "@/components/shared/StatusBadge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdownMenu"
import { deleteProjectAction } from "@/server/actions/projects"
// Types
import { Project } from "@/lib/types"

interface ProjectCardProps {
    project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
    const params = useParams()
    const router = useRouter()
    const workspaceId = (params?.workspaceId as string) || 'default'
    const [isPending, startTransition] = useTransition()
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation()
        if (!confirm(`Are you sure you want to delete "${project.name}"?`)) return

        setIsDeleting(true)
        startTransition(async () => {
            const res = await deleteProjectAction(project.id)
            if (res.success) {
                router.refresh()
            } else {
                alert(res.error || 'Failed to delete project')
                setIsDeleting(false)
            }
        })
    }

    return (
        <div className={cn(
            "group flex flex-col bg-white border border-zinc-200 rounded-xl p-5 shadow-xs hover:shadow-md transition-all duration-200 h-full justify-between",
            isDeleting && "opacity-50 pointer-events-none"
        )}>
            {/* Header & Main Info */}
            <div>
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-zinc-100/80 text-zinc-600 flex items-center justify-center text-xs font-bold ring-4 ring-white shrink-0">
                            {project.avatar || project.clientName.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-semibold text-zinc-900 group-hover:text-zinc-700 transition-colors truncate">
                                {project.name}
                            </h3>
                            <p className="text-xs text-zinc-500 truncate">{project.clientName}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                        <StatusBadge status={project.status} />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    className="text-zinc-400 hover:text-zinc-700 p-1 rounded-md hover:bg-zinc-100 transition-colors"
                                    aria-label="More options"
                                >
                                    <MoreHorizontal className="w-4 h-4" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44 bg-white shadow-lg border border-zinc-200 rounded-lg p-1">
                                <DropdownMenuItem asChild>
                                    <Link
                                        href={`/${workspaceId}/projects/${project.id}`}
                                        className="flex items-center gap-2 cursor-pointer text-xs font-medium text-zinc-700 hover:bg-zinc-50 rounded px-2 py-1.5"
                                    >
                                        <Eye className="w-3.5 h-3.5" />
                                        View Details
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link
                                        href={`/${workspaceId}/projects/${project.id}#payments`}
                                        className="flex items-center gap-2 cursor-pointer text-xs font-medium text-zinc-700 hover:bg-zinc-50 rounded px-2 py-1.5"
                                    >
                                        <Receipt className="w-3.5 h-3.5" />
                                        Invoices & Payments
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="my-1 border-zinc-100" />
                                <DropdownMenuItem
                                    onClick={handleDelete}
                                    className="flex items-center gap-2 cursor-pointer text-xs font-medium text-red-600 hover:bg-red-50 rounded px-2 py-1.5"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Delete Project
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Description */}
                <p className="text-xs text-zinc-500 mb-5 line-clamp-2 min-h-[32px]">
                    {project.description || 'No description provided.'}
                </p>
            </div>

            {/* Progress & Footer Section */}
            <div className="space-y-4 pt-2 border-t border-zinc-100">
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-500 font-medium text-[11px]">Progress</span>
                        <span className="text-zinc-900 font-semibold text-[11px]">{project.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                        <div
                            className={cn(
                                "h-full rounded-full transition-all duration-300",
                                project.progress >= 90 ? "bg-emerald-500" :
                                project.progress >= 50 ? "bg-blue-500" : "bg-amber-500"
                            )}
                            style={{ width: `${project.progress}%` }}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 bg-zinc-50 px-2 py-1 rounded-md border border-zinc-100">
                        <Calendar className="w-3 h-3 text-zinc-400" />
                        <span>{project.dueDate ? `Due ${project.dueDate}` : 'No deadline'}</span>
                    </div>
                    <Link
                        href={`/${workspaceId}/projects/${project.id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-zinc-800 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 shadow-2xs px-2.5 py-1 rounded-lg transition-colors active:scale-95"
                    >
                        Manage
                        <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>
            </div>
        </div>
    )
}
