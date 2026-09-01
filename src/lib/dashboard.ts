import { getCurrentWorkspaceId } from '@/lib/workspace';
import { db } from '@/server/db';
import { eq, and, lte, lt, gte, inArray, sql, desc, asc } from 'drizzle-orm';
import { reminders, payments, projects, timelineEvents } from '@/server/db/schema';
import { logTimelineEvent } from './timeline';

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
export async function getDashboardReminders(user: any): Promise<DashboardReminder[]> {
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
        limit: 50,
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
export async function getPaymentRiskProjects(user: any): Promise<AtRiskProject[]> {
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
        limit: 50,
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
export async function getGhostingRiskProjects(user: any): Promise<AtRiskProject[]> {
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
        limit: 50,
        with: {
            client: {
                columns: { name: true }
            }
        }
    });

    const atRiskProjects: AtRiskProject[] = [];

    // Batch fetch latest timeline event for ALL active projects in one query (fixes N+1)
    const projectIds = data.map(p => p.id);
    const allLatestEvents = projectIds.length > 0
        ? await db.query.timelineEvents.findMany({
            where: inArray(timelineEvents.projectId, projectIds),
            orderBy: [desc(timelineEvents.eventDate)],
            limit: projectIds.length * 3,
            columns: { projectId: true, eventDate: true }
        })
        : [];

    const lastEventMap = new Map<string, Date>();
    for (const event of allLatestEvents) {
        if (event.projectId && event.eventDate && !lastEventMap.has(event.projectId)) {
            lastEventMap.set(event.projectId, event.eventDate);
        }
    }

    for (const project of data) {
        const lastActivity = lastEventMap.get(project.id)
            || project.createdAt
            || new Date();

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
export async function getAtRiskProjects(user: any): Promise<AtRiskProject[]> {
    const [paymentRisk, ghostingRisk] = await Promise.all([
        getPaymentRiskProjects(user),
        getGhostingRiskProjects(user),
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
export async function getDashboardMetrics(user: any): Promise<DashboardMetrics> {
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

    // Use SQL aggregations instead of fetching all rows
    const [currentRevenueResult, prevRevenueResult, pendingResult] = await Promise.all([
        db.select({ total: sql<string>`COALESCE(SUM(${payments.amount}::numeric), 0)` }).from(payments)
            .where(and(
                eq(payments.userId, user.id),
                eq(payments.status, 'paid'),
                gte(payments.paidDate, currentMonthStart),
                lt(payments.paidDate, nextMonthStart)
            )),
        db.select({ total: sql<string>`COALESCE(SUM(${payments.amount}::numeric), 0)` }).from(payments)
            .where(and(
                eq(payments.userId, user.id),
                eq(payments.status, 'paid'),
                gte(payments.paidDate, previousMonthStart),
                lt(payments.paidDate, currentMonthStart)
            )),
        db.select({
            total: sql<string>`COALESCE(SUM(${payments.amount}::numeric), 0)`,
            count: sql<string>`COUNT(*)::int`
        }).from(payments)
            .where(and(
                eq(payments.userId, user.id),
                eq(payments.status, 'pending')
            )),
    ]);

    const monthlyRevenue = Number(currentRevenueResult[0]?.total || 0);
    const previousMonthRevenue = Number(prevRevenueResult[0]?.total || 0);

    // Calculate percentage change
    const revenueChangePercent = previousMonthRevenue > 0
        ? ((monthlyRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
        : 0;

    const pendingInvoicesTotal = Number(pendingResult[0]?.total || 0);
    const pendingInvoicesCount = Number(pendingResult[0]?.count || 0);

    // Dynamic revenue goal based on monthly revenue + pending pipeline target
    const baseGoal = 10000;
    const rawTarget = Math.max(monthlyRevenue + pendingInvoicesTotal, baseGoal);
    const revenueGoal = Math.ceil(rawTarget / 1000) * 1000;
    const revenueGoalPercent = revenueGoal > 0 ? (monthlyRevenue / revenueGoal) * 100 : 0;

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
export async function markReminderDone(reminderId: string, user: any): Promise<void> {
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
export async function snoozeReminder(reminderId: string, days: number, user: any): Promise<void> {
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
