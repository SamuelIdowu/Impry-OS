'use server';

import {
    getProjects,
    getProjectById,
    getProjectsByClient,
    createProject,
    updateProject,
    updateProjectStatus,
    deleteProject,
    getProjectPaymentSummary,
    getProjectNextReminder
} from '@/lib/projects';
import { CreateProjectInput, UpdateProjectInput, ProjectStatus } from '@/lib/types/project';
import { revalidatePath } from 'next/cache';

/**
 * Fetch all projects
 */
export async function fetchProjects() {
    try {
        const projects = await getProjects();
        return { success: true, data: projects };
    } catch (error) {
        console.error('Error fetching projects:', error);
        return { success: false, error: (error as Error).message };
    }
}

/**
 * Fetch a single project
 */
export async function fetchProject(id: string) {
    try {
        const project = await getProjectById(id);
        if (!project) {
            return { success: false, error: 'Project not found' };
        }
        return { success: true, data: project };
    } catch (error) {
        console.error('Error fetching project:', error);
        return { success: false, error: (error as Error).message };
    }
}

/**
 * Fetch projects for a specific client
 */
export async function fetchClientProjects(clientId: string) {
    try {
        const projects = await getProjectsByClient(clientId);
        return { success: true, data: projects };
    } catch (error) {
        console.error('Error fetching client projects:', error);
        return { success: false, error: (error as Error).message };
    }
}

/**
 * Create a new project
 */
export async function createProjectAction(data: CreateProjectInput) {
    try {
        const newProject = await createProject(data);
        revalidatePath('/projects');
        revalidatePath('/clients/' + data.client_id);
        revalidatePath('/'); // Dashboard
        return { success: true, data: newProject };
    } catch (error) {
        console.error('Error creating project:', error);
        return { success: false, error: (error as Error).message };
    }
}

/**
 * Update a project
 */
export async function updateProjectAction(id: string, data: UpdateProjectInput) {
    try {
        const updatedProject = await updateProject(id, data);
        revalidatePath('/projects');
        revalidatePath(`/projects/${id}`);
        // Also revalidate client page if we could infer client ID, but it's okay
        return { success: true, data: updatedProject };
    } catch (error) {
        console.error('Error updating project:', error);
        return { success: false, error: (error as Error).message };
    }
}

/**
 * Update project status
 */
export async function updateProjectStatusAction(id: string, status: ProjectStatus) {
    try {
        const updatedProject = await updateProjectStatus(id, status);
        revalidatePath('/projects');
        revalidatePath(`/projects/${id}`);
        revalidatePath('/'); // Dashboard activity might change
        return { success: true, data: updatedProject };
    } catch (error) {
        console.error('Error updating project status:', error);
        return { success: false, error: (error as Error).message };
    }
}

/**
 * Delete a project
 */
export async function deleteProjectAction(id: string) {
    try {
        await deleteProject(id);
        revalidatePath('/projects');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Error deleting project:', error);
        return { success: false, error: (error as Error).message };
    }
}

/**
 * Get project summary (payments, reminders)
 */
export async function fetchProjectSummary(id: string) {
    try {
        const [paymentSummary, nextReminder] = await Promise.all([
            getProjectPaymentSummary(id),
            getProjectNextReminder(id)
        ]);

        return {
            success: true,
            data: {
                payments: paymentSummary,
                nextReminder
            }
        };
    } catch (error) {
        console.error('Error fetching project summary:', error);
        return { success: false, error: (error as Error).message };
    }
}
