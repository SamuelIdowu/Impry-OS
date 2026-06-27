import React from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { fetchProject } from "@/server/actions/projects"
import { getProjectPayments } from "@/server/actions/payments"
import { ProjectPaymentsView } from "@/components/projects/ProjectPaymentsView"

// Use standard PageProps type for Next.js App Router
type PageProps = {
    params: Promise<{ projectId: string }>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ProjectPaymentsPage(props: PageProps) {
    const params = await props.params;
    const { projectId } = params;

    // Fetch project and payments
    const [projectResult, payments] = await Promise.all([
        fetchProject(projectId),
        getProjectPayments(projectId)
    ])

    if (!projectResult.success || !projectResult.data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <h2 className="text-xl font-semibold text-zinc-900">Project not found</h2>
                <Link href="/projects" className="mt-4 text-sm font-medium text-zinc-900 underline hover:text-zinc-700">
                    Back to Projects
                </Link>
            </div>
        )
    }

    return <ProjectPaymentsView project={projectResult.data} payments={payments} />
}
