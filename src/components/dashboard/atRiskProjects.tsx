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

    if (!hasProjects) {
        return (
            <section className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg text-zinc-900">At-Risk Projects</h3>
                    <button className="text-zinc-500 cursor-help" title="Based on payment delays and communication gaps">
                        <AlertCircle className="h-5 w-5" />
                    </button>
                </div>
                <Card className="flex flex-col items-center justify-center p-8 md:p-16 text-center border-zinc-200">
                    <div className="mb-8 flex flex-col items-center">
                        <div className="relative mb-4 flex size-40 items-center justify-center rounded-full bg-green-50">
                            <div className="absolute inset-0 rounded-full bg-zinc-900/10 blur-xl"></div>
                            <div className="relative flex h-32 w-32 items-center justify-center bg-zinc-900/20 backdrop-blur-sm rounded-full">
                                <CheckCircle2 className="h-16 w-16 text-zinc-900" />
                            </div>
                        </div>
                    </div>
                    <div className="max-w-md space-y-3">
                        <h2 className="text-xl font-bold text-zinc-900 md:text-2xl">Zero Projects at Risk</h2>
                        <p className="text-base text-zinc-500">
                            Great job! All your active projects are on track, and no payments are currently overdue.
                        </p>
                    </div>
                </Card>
            </section>
        )
    }

    return (
        <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-zinc-900">At-Risk Projects</h3>
                <button className="text-zinc-500 cursor-help" title="Based on payment delays and communication gaps">
                    <AlertTriangle className="h-5 w-5" />
                </button>
            </div>
            <div className="flex flex-col gap-4">
                {projects.map((project) => (
                    <Card
                        key={project.id}
                        className="relative overflow-hidden border-zinc-200 hover:shadow-lg transition-all cursor-pointer group"
                    >
                        <div
                            className={cn(
                                "absolute left-0 top-6 bottom-6 w-1 rounded-r-full z-20",
                                project.type === "payment" && "bg-red-500",
                                project.type === "ghosting" && "bg-yellow-400"
                            )}
                        ></div>
                        <CardContent className="p-5">
                            <div className="flex justify-between items-start mb-3 pl-2">
                                <div>
                                    <h4 className="font-bold text-zinc-900 text-base">{project.projectName}</h4>
                                    <p className="text-xs text-zinc-500 mt-0.5">Client: {project.clientName}</p>
                                </div>
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        "text-[10px] uppercase font-bold px-2 py-1 rounded-md tracking-wide flex items-center gap-1",
                                        project.type === "payment" &&
                                        "bg-red-50 text-red-600 border-red-100",
                                        project.type === "ghosting" &&
                                        "bg-yellow-50 text-yellow-700 border-yellow-100"
                                    )}
                                >
                                    <AlertTriangle className="h-3.5 w-3.5" />
                                    {project.badgeLabel}
                                </Badge>
                            </div>
                            <div className="pl-2">
                                <div className="flex items-center gap-3 text-xs text-zinc-500 mb-4 bg-zinc-50 p-2 rounded-lg">
                                    <span
                                        className={cn(
                                            "flex items-center gap-1 font-medium",
                                            project.type === "payment" && "text-red-500"
                                        )}
                                    >
                                        <Clock className="h-3.5 w-3.5" />
                                        {project.metadata.split(' • ')[0]}
                                    </span>
                                    <span className="size-1 rounded-full bg-zinc-300"></span>
                                    <span className="font-mono text-zinc-900 font-medium">
                                        {project.metadata.split(' • ')[1]}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <button className="w-full bg-white border border-zinc-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-zinc-900 text-xs font-semibold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm">
                                        <Send className="h-4 w-4" />
                                        {project.actionLabel}
                                    </button>
                                </div>
                                {project.progress !== undefined && (
                                    <div className="space-y-2 mt-4">
                                        <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden flex">
                                            <div
                                                className="bg-black h-full"
                                                style={{ width: `${project.progress}%` }}
                                                title="Work Done"
                                            ></div>
                                        </div>
                                        <div className="flex justify-between text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
                                            <span>Scope Progress</span>
                                            <span>{project.progress}%</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
    )
}
