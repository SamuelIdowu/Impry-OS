import React from "react"
import { notFound } from "next/navigation"
import { fetchProject } from "@/server/actions/projects"
import { ProjectDetailView } from "@/components/projects/projectDetailView"

interface PageProps {
    params: Promise<{
        projectId: string;
    }>;
}

export default async function ProjectOverviewPage({ params }: PageProps) {
    const { projectId } = await params;

    const res = await fetchProject(projectId);

    if (!res.success || !res.data) {
        if (res.error === 'Project not found') {
            notFound();
        }
        return (
            <div className="flex items-center justify-center min-h-screen text-red-500">
                Error loading project: {res.error}
            </div>
        )
    }

    return <ProjectDetailView project={res.data} />
}
