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
import { withAuth } from '@/lib/auth-guard';
import { canCreateProject } from '@/lib/payments/guards';
import { z } from 'zod';

const createProjectSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    clientId: z.string().min(1, 'Client is required'),
    description: z.string().optional().nullable(),
    status: z.enum(['planning', 'in_progress', 'review', 'completed', 'on_hold', 'cancelled']).optional(),
    startDate: z.string().optional().nullable(),
    deadline: z.string().optional().nullable(),
    budget: z.union([z.number(), z.string()]).transform(val => {
        if (val === '' || val === undefined || val === null) return undefined;
        const num = Number(val);
        return isNaN(num) ? undefined : num;
    }).optional(),
    currency: z.string().optional(),
    notes: z.string().optional().nullable(),
});

const updateProjectSchema = createProjectSchema.partial().extend({
    progress: z.union([z.number(), z.string()]).transform(val => {
        if (val === '' || val === undefined || val === null) return undefined;
        const num = Number(val);
        return isNaN(num) ? undefined : Math.min(100, Math.max(0, num));
    }).optional(),
    total_value: z.union([z.number(), z.string()]).transform(val => {
        if (val === '' || val === undefined || val === null) return undefined;
        const num = Number(val);
        return isNaN(num) ? undefined : num;
    }).optional(),
});

/**
 * Fetch all projects
 */
export async function fetchProjects() {
    return withAuth(async () => {
        try {
            const projects = await getProjects();
            return { success: true, data: projects };
        } catch (error) {
            console.error('Error fetching projects:', error);
            return { success: false, error: (error as Error).message };
        }
    });
}

/**
 * Fetch a single project
 */
export async function fetchProject(id: string) {
    return withAuth(async () => {
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
    });
}

/**
 * Fetch projects for a specific client
 */
export async function fetchClientProjects(clientId: string) {
    return withAuth(async () => {
        try {
            const projects = await getProjectsByClient(clientId);
            return { success: true, data: projects };
        } catch (error) {
            console.error('Error fetching client projects:', error);
            return { success: false, error: (error as Error).message };
        }
    });
}

/**
 * Create a new project
 */
export async function createProjectAction(data: CreateProjectInput) {
    return withAuth(async (user, workspaceId) => {
        try {
            const limitCheck = await canCreateProject(workspaceId);
            if (!limitCheck.allowed) {
                return {
                    success: false,
                    error: `Workspace project limit reached (${limitCheck.currentCount}/${limitCheck.maxAllowed} projects). Upgrade to Pro for unlimited projects.`,
                    requiresUpgrade: true,
                    planTier: limitCheck.planTier,
                };
            }

            const validatedData = createProjectSchema.parse(data);
            const newProject = await createProject(validatedData);
            revalidatePath(`/${workspaceId}/projects`);
            revalidatePath(`/${workspaceId}/dashboard`);
            return { success: true, data: newProject };
        } catch (error: any) {
            console.error('Error creating project:', error);
            if (error instanceof z.ZodError) {
                return { success: false, error: error.issues[0].message };
            }
            return { success: false, error: error.message };
        }
    });
}

/**
 * Update a project
 */
export async function updateProjectAction(id: string, data: UpdateProjectInput) {
    return withAuth(async (user, workspaceId) => {
        try {
            const validatedData = updateProjectSchema.parse(data);
            const updatedProject = await updateProject(id, validatedData as UpdateProjectInput);
            revalidatePath(`/${workspaceId}/projects`);
            revalidatePath(`/${workspaceId}/projects/${id}`);
            return { success: true, data: updatedProject };
        } catch (error: any) {
            console.error('Error updating project:', error);
            if (error instanceof z.ZodError) {
                return { success: false, error: error.issues[0].message };
            }
            return { success: false, error: error.message };
        }
    });
}

/**
 * Update project status
 */
export async function updateProjectStatusAction(id: string, status: ProjectStatus) {
    return withAuth(async (user, workspaceId) => {
        try {
            const updatedProject = await updateProjectStatus(id, status);
            revalidatePath(`/${workspaceId}/projects`);
            revalidatePath(`/${workspaceId}/projects/${id}`);
            revalidatePath(`/${workspaceId}/dashboard`);
            return { success: true, data: updatedProject };
        } catch (error) {
            console.error('Error updating project status:', error);
            return { success: false, error: (error as Error).message };
        }
    });
}



/**
 * Delete a project
 */
export async function deleteProjectAction(id: string) {
    return withAuth(async (user, workspaceId) => {
        try {
            await deleteProject(id);
            revalidatePath(`/${workspaceId}/projects`);
            revalidatePath(`/${workspaceId}/dashboard`);
            return { success: true };
        } catch (error) {
            console.error('Error deleting project:', error);
            return { success: false, error: (error as Error).message };
        }
    });
}

/**
 * Get project summary (payments, reminders)
 */
export async function fetchProjectSummary(id: string) {
    return withAuth(async () => {
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
    });
}

