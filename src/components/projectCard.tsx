import React from "react"
import Link from "next/link"
import { ArrowRight, Calendar, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
// Shared Components
import { StatusBadge } from "@/components/shared/StatusBadge"
// Types
import { Project } from "@/lib/types"

interface ProjectCardProps {
    project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
    return (
        <div className="group flex flex-col bg-white border border-zinc-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all h-full">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-zinc-100/80 text-zinc-600 flex items-center justify-center text-xs font-bold ring-4 ring-white">
                        {project.avatar || project.clientName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <h3 className="font-semibold text-zinc-900 group-hover:text-amber-600 transition-colors">
                            {project.name}
                        </h3>
                        <p className="text-xs text-zinc-500">{project.clientName}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <StatusBadge status={project.status} />
                    <button className="text-zinc-400 hover:text-zinc-600 p-1 opacity-0 group-hover:opacity-100 transition-all">
                        <MoreHorizontal className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Description */}
            <p className="text-sm text-zinc-500 mb-6 line-clamp-2 min-h-[40px]">
                {project.description}
            </p>

            {/* Progress Section */}
            <div className="mt-auto space-y-4">
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-500 font-medium">Progress</span>
                        <span className="text-zinc-900 font-semibold">{project.progress}%</span>
                    </div>
                    <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                        <div
                            className={cn("h-full rounded-full transition-all duration-500",
                                project.progress >= 90 ? "bg-green-500" :
                                    project.progress >= 50 ? "bg-blue-500" : "bg-orange-500"
                            )}
                            style={{ width: `${project.progress}%` }}
                        ></div>
                    </div>
                </div>

                <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 bg-zinc-50 px-2 py-1 rounded-md">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Due {project.dueDate}</span>
                    </div>
                    <Link
                        href={`/projects/${project.id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-zinc-900 bg-white border border-zinc-200 shadow-sm px-3 py-1.5 rounded-lg hover:bg-zinc-50 transition-colors"
                    >
                        Manage
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </div>
        </div>
    )
}
