import React from "react"
import { fetchProjects } from "@/server/actions/projects"
import { fetchClients } from "@/server/actions/clients"
import { ProjectList } from "@/components/projects/projectList"

export default async function ProjectsPage() {
    const [{ data: projects, success: projectsSuccess, error: projectsError }, { data: clients, success: clientsSuccess }] = await Promise.all([
        fetchProjects(),
        fetchClients()
    ]);

    if (!projectsSuccess || !projects) {
        return (
            <div className="p-8 text-center text-red-500">
                Error loading projects: {projectsError || 'Unknown error'}
            </div>
        )
    }

    return <ProjectList initialProjects={projects} clients={clients || []} />
}
