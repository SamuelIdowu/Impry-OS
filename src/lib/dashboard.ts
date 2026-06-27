import { getCurrentWorkspaceId } from '@/server/actions/workspaces';
import { db } from '@/server/db';
import { eq, and, lte, lt, gte, inArray, sql, desc, asc } from 'drizzle-orm';
import { reminders, payments, projects, timelineEvents } from '@/server/db/schema';
import { logTimelineEvent } from './timeline';
import { getUser } from './auth';

export interface DashboardReminder {
    id: string;
    title: string;
    description: string | null;
    reminderDate: string;
    reminderType: string;
    clientId: string | null;
    projectId: string | null;
    paymentId: string | null;
    clientName: string | null;
    projectName: string | null;
    clientEmail: string | null;
    overdue: boolean;
}

export interface AtRiskProject {
    id: string;
    name: string;
    clientId: string | null;
    clientName: string | null;
    riskType: 'payment' | 'ghosting';
    riskMetadata: {
        daysOverdue?: number;
        amount?: number;
        lastContactDays?: number;
        milestone?: string;
    };
}

export interface DashboardMetrics {
    monthlyRevenue: number;
    previousMonthRevenue: number;
    revenueChangePercent: number;
    pendingInvoicesTotal: number;
    pendingInvoicesCount: number;
    revenueGoal: number;
    revenueGoalPercent: number;
}

/**
 * Get due and overdue reminders for the dashboard
 */
export async function getDashboardReminders(): Promise<DashboardReminder[]> {
    const user = await getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    // Get reminders due today or overdue, not yet sent
    const data = await db.query.reminders.findMany({
        where: and(
            eq(reminders.userId, user.id),
            eq(reminders.isSent, false),
            lte(reminders.reminderDate, new Date(Date.now() + 24 * 60 * 60 * 1000))
        ),
        orderBy: [asc(reminders.reminderDate)],
        with: {
            project: {
                columns: { name: true },
                with: {
                    client: {
                        columns: { name: true, email: true }
                    }
                }
            }
        }
    });

    // Transform the data
    return data.map(reminder => ({
        id: reminder.id,
        title: reminder.title,
        description: reminder.description,
        reminderDate: reminder.reminderDate ? reminder.reminderDate.toISOString() : new Date().toISOString(),
        reminderType: reminder.reminderType || 'general',
        clientId: reminder.clientId,
        projectId: reminder.projectId,
        paymentId: reminder.paymentId,
        clientName: reminder.project?.client?.name || null,
        clientEmail: reminder.project?.client?.email || null,
        projectName: reminder.project?.name || null,
        overdue: reminder.reminderDate ? reminder.reminderDate < new Date() : false,
    }));
}

/**
 * Get projects at risk due to overdue payments
 */
export async function getPaymentRiskProjects(): Promise<AtRiskProject[]> {
    const user = await getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    const nowStr = new Date().toISOString().split('T')[0];
    
    // Get projects with overdue or soon-to-be-overdue payments
    const data = await db.query.payments.findMany({
        where: and(
            eq(payments.userId, user.id),
            inArray(payments.status, ['pending', 'overdue']),
            lt(payments.dueDate, nowStr)
        ),
        with: {
            project: {
                with: {
                    client: {
                        columns: { name: true }
                    }
                }
            }
        }
    });

    // Group by project and get the most overdue payment
    const projectMap = new Map<string, AtRiskProject>();

    data.forEach(payment => {
        const project = payment.project;
        if (!project) return;

        const client = project.client;
        let daysOverdue = 0;
        if (payment.dueDate) {
            daysOverdue = Math.floor(
                (new Date().getTime() - new Date(payment.dueDate).getTime()) / (1000 * 60 * 60 * 24)
            );
        }

        const existingProject = projectMap.get(project.id);
        if (!existingProject || (existingProject.riskMetadata.daysOverdue || 0) < daysOverdue) {
            projectMap.set(project.id, {
                id: project.id,
                name: project.name,
                clientId: project.clientId,
                clientName: client?.name || null,
                riskType: 'payment',
                riskMetadata: {
                    daysOverdue: daysOverdue,
                    amount: payment.amount ? Number(payment.amount) : undefined,
                },
            });
        }
    });

    return Array.from(projectMap.values());
}

/**
 * Get projects at risk due to lack of communication (ghosting)
 */
export async function getGhostingRiskProjects(): Promise<AtRiskProject[]> {
    const user = await getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Get all active projects
    const data = await db.query.projects.findMany({
        where: and(
            eq(projects.userId, user.id),
            inArray(projects.status, ['planning', 'in_progress'])
        ),
        with: {
            client: {
                columns: { name: true }
            }
        }
    });

    const atRiskProjects: AtRiskProject[] = [];

    for (const project of data) {
        // Get latest timeline event for this project
        const events = await db.query.timelineEvents.findMany({
            where: eq(timelineEvents.projectId, project.id),
            orderBy: [desc(timelineEvents.eventDate)],
            limit: 1,
            columns: { eventDate: true }
        });

        const lastActivity = events && events.length > 0 && events[0].eventDate
            ? events[0].eventDate
            : project.createdAt || new Date();

        if (lastActivity < sevenDaysAgo) {
            const daysInactive = Math.floor(
                (new Date().getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
            );

            atRiskProjects.push({
                id: project.id,
                name: project.name,
                clientId: project.clientId,
                clientName: project.client?.name || null,
                riskType: 'ghosting',
                riskMetadata: {
                    lastContactDays: daysInactive,
                },
            });
        }
    }

    return atRiskProjects;
}

/**
 * Get all at-risk projects (payment + ghosting)
 */
export async function getAtRiskProjects(): Promise<AtRiskProject[]> {
    const [paymentRisk, ghostingRisk] = await Promise.all([
        getPaymentRiskProjects(),
        getGhostingRiskProjects(),
    ]);

    // Combine and deduplicate (payment risk takes priority)
    const projectMap = new Map<string, AtRiskProject>();

    paymentRisk.forEach(project => projectMap.set(project.id, project));
    ghostingRisk.forEach(project => {
        if (!projectMap.has(project.id)) {
            projectMap.set(project.id, project);
        }
    });

    return Array.from(projectMap.values());
}

/**
 * Get dashboard metrics including revenue and pending invoices
 */
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
    const user = await getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    const currentMonthStart = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
    const nextMonthStart = currentMonth === 12
        ? `${currentYear + 1}-01-01`
        : `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`;
    
    const previousMonthStart = `${previousYear}-${String(previousMonth).padStart(2, '0')}-01`;

    // Get current month revenue
    const currentRevenue = await db.query.payments.findMany({
        where: and(
            eq(payments.userId, user.id),
            eq(payments.status, 'paid'),
            gte(payments.paidDate, currentMonthStart),
            lt(payments.paidDate, nextMonthStart)
        ),
        columns: { amount: true }
    });

    const monthlyRevenue = currentRevenue.reduce((sum, p) => sum + Number(p.amount), 0);

    // Get previous month revenue
    const prevRevenue = await db.query.payments.findMany({
        where: and(
            eq(payments.userId, user.id),
            eq(payments.status, 'paid'),
            gte(payments.paidDate, previousMonthStart),
            lt(payments.paidDate, currentMonthStart)
        ),
        columns: { amount: true }
    });

    const previousMonthRevenue = prevRevenue.reduce((sum, p) => sum + Number(p.amount), 0);

    // Calculate percentage change
    const revenueChangePercent = previousMonthRevenue > 0
        ? ((monthlyRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
        : 0;

    // Get pending invoices
    const pending = await db.query.payments.findMany({
        where: and(
            eq(payments.userId, user.id),
            eq(payments.status, 'pending')
        ),
        columns: { amount: true }
    });

    const pendingInvoicesTotal = pending.reduce((sum, p) => sum + Number(p.amount), 0);
    const pendingInvoicesCount = pending.length;

    // Revenue goal (hardcoded to $11,000 for now)
    const revenueGoal = 11000;
    const revenueGoalPercent = (monthlyRevenue / revenueGoal) * 100;

    return {
        monthlyRevenue: monthlyRevenue,
        previousMonthRevenue: previousMonthRevenue,
        revenueChangePercent: revenueChangePercent,
        pendingInvoicesTotal: pendingInvoicesTotal,
        pendingInvoicesCount: pendingInvoicesCount,
        revenueGoal: revenueGoal,
        revenueGoalPercent: Math.min(revenueGoalPercent, 100),
    };
}

/**
 * Mark a reminder as done
 */
export async function markReminderDone(reminderId: string): Promise<void> {
    const user = await getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    const [updated] = await db.update(reminders)
        .set({
            isSent: true,
            sentAt: new Date(),
        })
        .where(and(
            eq(reminders.id, reminderId),
            eq(reminders.userId, user.id)
        ))
        .returning({
            id: reminders.id,
            title: reminders.title,
            projectId: reminders.projectId
        });

    if (!updated) {
        throw new Error('Reminder not found');
    }

    // Log to timeline
    if (updated.projectId) {
        await logTimelineEvent({
            project_id: updated.projectId,
            event_type: 'reminder',
            title: 'Reminder Completed',
            description: `Marked as done: ${updated.title}`,
            metadata: { reminder_id: reminderId }
        });
    }
}

/**
 * Snooze a reminder by updating its date
 */
export async function snoozeReminder(reminderId: string, days: number): Promise<void> {
    const user = await getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    // Get current reminder
    const reminder = await db.query.reminders.findFirst({
        where: and(
            eq(reminders.id, reminderId),
            eq(reminders.userId, user.id)
        )
    });

    if (!reminder) {
        throw new Error('Reminder not found');
    }

    // Calculate new date
    const currentDate = new Date(reminder.reminderDate);
    const newDate = new Date(currentDate.getTime() + days * 24 * 60 * 60 * 1000);

    await db.update(reminders)
        .set({
            reminderDate: newDate,
        })
        .where(and(
            eq(reminders.id, reminderId),
            eq(reminders.userId, user.id)
        ));

    // Log to timeline
    if (reminder.projectId) {
        await logTimelineEvent({
            project_id: reminder.projectId,
            event_type: 'reminder',
            title: 'Reminder Snoozed',
            description: `Snoozed for ${days} days: ${reminder.title}`,
            metadata: { reminder_id: reminderId, days: days }
        });
    }
}
