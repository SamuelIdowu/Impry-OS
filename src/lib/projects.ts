import { getCurrentWorkspaceId } from '@/lib/workspace';
import { db } from '@/server/db';
import { projects, clients, scopes, payments, reminders } from '@/server/db/schema';
import { eq, desc, and, gte } from 'drizzle-orm';
import { getUser } from './auth';
import type {
    Project,
    ProjectWithClient,
    ProjectWithDetails,
    CreateProjectInput,
    UpdateProjectInput,
    ProjectStatus,
    mapDatabaseToAppStatus,
    mapAppToDatabaseStatus,
} from './types/project';

/**
 * Get all projects for the authenticated workspace
 */
export async function getProjects(): Promise<ProjectWithClient[]> {
    const user = await getUser();
    if (!user) throw new Error('User not authenticated');
    const workspaceId = await getCurrentWorkspaceId();

    const result = await db.query.projects.findMany({
        where: eq(projects.workspaceId, workspaceId),
        orderBy: [desc(projects.createdAt)],
        limit: 100,
        with: {
            client: {
                columns: { id: true, name: true, email: true, company: true }
            }
        }
    });

    return result as ProjectWithClient[];
}

/**
 * Get projects by client ID
 */
export async function getProjectsByClient(clientId: string): Promise<Project[]> {
    const user = await getUser();
    if (!user) throw new Error('User not authenticated');
    const workspaceId = await getCurrentWorkspaceId();

    const result = await db.query.projects.findMany({
        where: and(eq(projects.clientId, clientId), eq(projects.workspaceId, workspaceId)),
        orderBy: [desc(projects.createdAt)],
        limit: 100,
    });

    return result as Project[];
}

/**
 * Get a single project by ID with all related data
 */
export async function getProjectById(id: string): Promise<ProjectWithDetails | null> {
    const user = await getUser();
    if (!user) throw new Error('User not authenticated');
    const workspaceId = await getCurrentWorkspaceId();

    const result = await db.query.projects.findFirst({
        where: and(eq(projects.id, id), eq(projects.workspaceId, workspaceId)),
        with: {
            client: {
                columns: { id: true, name: true, email: true, company: true }
            },
            scopes: true,
            payments: true,
        }
    });

    if (!result) return null;

    return result as ProjectWithDetails;
}

/**
 * Create a new project
 */
export async function createProject(input: CreateProjectInput): Promise<Project> {
    const user = await getUser();
    if (!user) throw new Error('User not authenticated');
    const workspaceId = await getCurrentWorkspaceId();

    const client = await db.query.clients.findFirst({
        where: and(eq(clients.id, input.clientId), eq(clients.workspaceId, workspaceId)),
        columns: { id: true }
    });

    if (!client) {
        throw new Error('Client not found or does not belong to workspace');
    }

    const [newProject] = await db.insert(projects).values({
        name: input.name,
        clientId: input.clientId,
        description: input.description || null,
        status: input.status || 'planning',
        startDate: input.startDate?.trim() || null,
        deadline: input.deadline?.trim() || null,
        budget: (input.budget !== undefined && input.budget !== null && !isNaN(Number(input.budget))) ? input.budget.toString() : null,
        currency: input.currency || 'USD',
        notes: input.notes || null,
        userId: user.id,
        workspaceId,
    }).returning();

    return newProject as Project;
}

/**
 * Update an existing project
 */
export async function updateProject(id: string, input: UpdateProjectInput): Promise<Project> {
    const user = await getUser();
    if (!user) throw new Error('User not authenticated');
    const workspaceId = await getCurrentWorkspaceId();

    const updatePayload: Record<string, any> = {
        updatedAt: new Date(),
    };

    if (input.name !== undefined) updatePayload.name = input.name;
    if (input.description !== undefined) updatePayload.description = input.description || null;
    if (input.status !== undefined) updatePayload.status = input.status;
    if (input.startDate !== undefined) updatePayload.startDate = input.startDate?.trim() || null;
    if (input.deadline !== undefined) updatePayload.deadline = input.deadline?.trim() || null;
    if (input.budget !== undefined) {
        updatePayload.budget = (input.budget !== null && !isNaN(Number(input.budget))) ? input.budget.toString() : null;
    }
    if (input.currency !== undefined) updatePayload.currency = input.currency;
    if (input.notes !== undefined) updatePayload.notes = input.notes || null;

    const [updatedProject] = await db.update(projects).set(updatePayload)
    .where(and(eq(projects.id, id), eq(projects.workspaceId, workspaceId)))
    .returning();

    return updatedProject as Project;
}

/**
 * Update project status
 */
export async function updateProjectStatus(id: string, status: ProjectStatus): Promise<Project> {
    const user = await getUser();
    if (!user) throw new Error('User not authenticated');
    const workspaceId = await getCurrentWorkspaceId();

    const { mapAppToDatabaseStatus } = await import('./types/project');
    const dbStatus = mapAppToDatabaseStatus(status);

    const currentProject = await db.query.projects.findFirst({
        where: and(eq(projects.id, id), eq(projects.workspaceId, workspaceId)),
        columns: { name: true, status: true }
    });

    const [updatedProject] = await db.update(projects).set({
        status: dbStatus,
        updatedAt: new Date(),
    })
    .where(and(eq(projects.id, id), eq(projects.workspaceId, workspaceId)))
    .returning();

    if (currentProject && currentProject.status !== dbStatus) {
        const { logTimelineEvent } = await import('./timeline');
        await logTimelineEvent({
            project_id: id,
            event_type: 'status_change',
            title: 'Project Status Updated',
            description: `Status changed from ${currentProject.status} to ${dbStatus}`,
            metadata: {
                old_status: currentProject.status,
                new_status: dbStatus,
                status_label: status
            }
        });
    }

    return updatedProject as Project;
}

/**
 * Delete a project
 */
export async function deleteProject(id: string): Promise<void> {
    const user = await getUser();
    if (!user) throw new Error('User not authenticated');
    const workspaceId = await getCurrentWorkspaceId();

    await db.delete(projects).where(and(eq(projects.id, id), eq(projects.workspaceId, workspaceId)));
}

/**
 * Get payment summary for a project
 */
export async function getProjectPaymentSummary(projectId: string) {
    const user = await getUser();
    if (!user) throw new Error('User not authenticated');
    const workspaceId = await getCurrentWorkspaceId();

    const projectPayments = await db.query.payments.findMany({
        where: and(eq(payments.projectId, projectId), eq(payments.workspaceId, workspaceId)),
        columns: { amount: true, status: true, currency: true }
    });

    const totalExpected = projectPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const totalPaid = projectPayments
        .filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    return {
        totalExpected,
        totalPaid,
        remaining: totalExpected - totalPaid,
        currency: projectPayments[0]?.currency || 'USD',
        paymentsCount: projectPayments.length,
    };
}

/**
 * Get next reminder for a project
 */
export async function getProjectNextReminder(projectId: string) {
    const user = await getUser();
    if (!user) throw new Error('User not authenticated');
    const workspaceId = await getCurrentWorkspaceId();

    const nextReminder = await db.query.reminders.findFirst({
        where: and(
            eq(reminders.projectId, projectId),
            eq(reminders.workspaceId, workspaceId),
            eq(reminders.isSent, false),
            gte(reminders.reminderDate, new Date())
        ),
        orderBy: (reminders, { asc }) => [asc(reminders.reminderDate)]
    });

    return nextReminder;
}
