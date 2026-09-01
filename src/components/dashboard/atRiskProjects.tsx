"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Risk } from "@/lib/types"
import { AlertCircle, Clock, CheckCircle2, Send, AlertTriangle } from "lucide-react"

interface AtRiskProjectsProps {
    projects: Risk[]
}

export function AtRiskProjects({ projects }: AtRiskProjectsProps) {
    const hasProjects = projects.length > 0

    return (
        <Card className="bg-white border-zinc-200 shadow-sm overflow-hidden flex flex-col">
            {/* Header matching FollowUpInbox exactly */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200 bg-white">
                <div className="flex items-center gap-3">
                    <div className="bg-zinc-100 p-1.5 rounded-md text-zinc-900 flex items-center justify-center">
                        <AlertTriangle className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-lg text-zinc-900">At-Risk Projects</h3>
                    {hasProjects && (
                        <Badge variant="destructive" className="text-[10px] font-bold px-2 py-1 rounded-full">
                            {projects.length}
                        </Badge>
                    )}
                </div>
                <button className="text-zinc-400 hover:text-zinc-600 cursor-help" title="Based on payment delays and communication gaps" aria-label="Risk information">
                    <AlertCircle className="h-4 w-4" />
                </button>
            </div>

            {/* Content */}
            {!hasProjects ? (
                <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="size-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="size-5" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-sm font-bold text-zinc-900">Zero Projects at Risk</h4>
                            <p className="text-xs text-zinc-500 leading-relaxed">
                                Great job! All your active projects are on track, and no payments are currently overdue.
                            </p>
                        </div>
                    </div>
                </CardContent>
            ) : (
                <div className="divide-y divide-zinc-100 p-3 space-y-2">
                    {projects.map((project) => (
                        <div key={project.id} className="p-4 relative overflow-hidden rounded-xl border border-zinc-100 bg-zinc-50/50 hover:bg-zinc-50 transition-colors group">
                            <div
                                className={cn(
                                    "absolute left-0 top-3 bottom-3 w-1 rounded-r-full",
                                    project.type === "payment" && "bg-red-500",
                                    project.type === "ghosting" && "bg-yellow-400"
                                )}
                            />
                            <div className="pl-2">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="font-bold text-zinc-900 text-sm">{project.projectName}</h4>
                                        <p className="text-xs text-zinc-500">Client: {project.clientName}</p>
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            "text-[10px] uppercase font-bold px-2 py-0.5 rounded-md tracking-wide flex items-center gap-1",
                                            project.type === "payment" && "bg-red-50 text-red-600 border-red-100",
                                            project.type === "ghosting" && "bg-yellow-50 text-yellow-700 border-yellow-100"
                                        )}
                                    >
                                        <AlertTriangle className="h-3 w-3" />
                                        {project.badgeLabel}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-zinc-500 mb-3 bg-white p-2 rounded-lg border border-zinc-100">
                                    <span className={cn("flex items-center gap-1 font-medium", project.type === "payment" && "text-red-500")}>
                                        <Clock className="h-3.5 w-3.5" />
                                        {project.metadata.split(' • ')[0]}
                                    </span>
                                    <span className="size-1 rounded-full bg-zinc-300"></span>
                                    <span className="font-mono text-zinc-900 font-medium">
                                        {project.metadata.split(' • ')[1]}
                                    </span>
                                </div>
                                <button disabled className="w-full bg-white border border-zinc-200 text-zinc-900 text-xs font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-2xs opacity-50 cursor-not-allowed">
                                    <Send className="h-3.5 w-3.5" />
                                    {project.actionLabel}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    )
}
