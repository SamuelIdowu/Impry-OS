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
 * Get all projects for the authenticated user
 */
export async function getProjects(): Promise<ProjectWithClient[]> {
    const user = await getUser();
    if (!user) throw new Error('User not authenticated');

    const result = await db.query.projects.findMany({
        where: and(eq(projects.workspaceId, await getCurrentWorkspaceId()), eq(projects.userId, user.id)),
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

    const result = await db.query.projects.findMany({
        where: and(eq(projects.clientId, clientId), eq(projects.workspaceId, await getCurrentWorkspaceId()), eq(projects.userId, user.id)),
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

    const result = await db.query.projects.findFirst({
        where: and(eq(projects.id, id), eq(projects.workspaceId, await getCurrentWorkspaceId()), eq(projects.userId, user.id)),
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

    const client = await db.query.clients.findFirst({
        where: and(eq(clients.id, input.clientId), eq(clients.workspaceId, await getCurrentWorkspaceId()), eq(clients.userId, user.id)),
        columns: { id: true }
    });

    if (!client) {
        throw new Error('Client not found or does not belong to user');
    }

    const [newProject] = await db.insert(projects).values({
        name: input.name,
        clientId: input.clientId,
        description: input.description,
        status: input.status || 'planning',
        startDate: input.startDate,
        deadline: input.deadline,
        budget: input.budget?.toString(),
        currency: input.currency || 'USD',
        notes: input.notes,
        userId: user.id,
        workspaceId: await getCurrentWorkspaceId(),

    }).returning();

    return newProject as Project;
}

/**
 * Update an existing project
 */
export async function updateProject(id: string, input: UpdateProjectInput): Promise<Project> {
    const user = await getUser();
    if (!user) throw new Error('User not authenticated');

    const [updatedProject] = await db.update(projects).set({
        name: input.name,
        description: input.description,
        status: input.status,
        startDate: input.startDate,
        deadline: input.deadline,
        budget: input.budget?.toString(),
        currency: input.currency,
        notes: input.notes,
        updatedAt: new Date(),
    })
    .where(and(eq(projects.id, id), eq(projects.workspaceId, await getCurrentWorkspaceId()), eq(projects.userId, user.id)))
    .returning();

    return updatedProject as Project;
}

/**
 * Update project status
 */
export async function updateProjectStatus(id: string, status: ProjectStatus): Promise<Project> {
    const user = await getUser();
    if (!user) throw new Error('User not authenticated');

    const { mapAppToDatabaseStatus } = await import('./types/project');
    const dbStatus = mapAppToDatabaseStatus(status);

    const currentProject = await db.query.projects.findFirst({
        where: and(eq(projects.id, id), eq(projects.workspaceId, await getCurrentWorkspaceId()), eq(projects.userId, user.id)),
        columns: { name: true, status: true }
    });

    const [updatedProject] = await db.update(projects).set({
        status: dbStatus,
        updatedAt: new Date(),
    })
    .where(and(eq(projects.id, id), eq(projects.workspaceId, await getCurrentWorkspaceId()), eq(projects.userId, user.id)))
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

    await db.delete(projects).where(and(eq(projects.id, id), eq(projects.workspaceId, await getCurrentWorkspaceId()), eq(projects.userId, user.id)));
}

/**
 * Get payment summary for a project
 */
export async function getProjectPaymentSummary(projectId: string) {
    const user = await getUser();
    if (!user) throw new Error('User not authenticated');

    const projectPayments = await db.query.payments.findMany({
        where: and(eq(payments.projectId, projectId), eq(payments.workspaceId, await getCurrentWorkspaceId()), eq(payments.userId, user.id)),
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

    const nextReminder = await db.query.reminders.findFirst({
        where: and(
            eq(reminders.projectId, projectId),
            eq(reminders.userId, user.id),
            eq(reminders.isSent, false),
            gte(reminders.reminderDate, new Date())
        ),
        orderBy: (reminders, { asc }) => [asc(reminders.reminderDate)]
    });

    return nextReminder;
}
