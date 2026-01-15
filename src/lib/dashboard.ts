import { createClient } from './auth';
import { logTimelineEvent } from './timeline';

export interface DashboardReminder {
    id: string;
    title: string;
    description: string | null;
    reminder_date: string;
    reminder_type: string;
    client_id: string | null;
    project_id: string | null;
    payment_id: string | null;
    client_name: string | null;
    project_name: string | null;
    client_email: string | null;
    overdue: boolean;
}

export interface AtRiskProject {
    id: string;
    name: string;
    client_id: string | null;
    client_name: string | null;
    risk_type: 'payment' | 'ghosting';
    risk_metadata: {
        days_overdue?: number;
        amount?: number;
        last_contact_days?: number;
        milestone?: string;
    };
}

export interface DashboardMetrics {
    monthly_revenue: number;
    previous_month_revenue: number;
    revenue_change_percent: number;
    pending_invoices_total: number;
    pending_invoices_count: number;
    revenue_goal: number;
    revenue_goal_percent: number;
}

/**
 * Get due and overdue reminders for the dashboard
 */
export async function getDashboardReminders(): Promise<DashboardReminder[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    // Get reminders due today or overdue, not yet sent
    const { data, error } = await supabase
        .from('reminders')
        .select(`
            id,
            title,
            description,
            reminder_date,
            reminder_type,
            client_id,
            project_id,
            payment_id,
            payment_id,
            clients (name, email),
            projects (name)
        `)
        .eq('user_id', user.id)
        .eq('is_sent', false)
        .lte('reminder_date', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString())
        .order('reminder_date', { ascending: true });

    if (error) {
        console.error('Error fetching reminders:', error);
        throw error;
    }

    // Transform the data
    return (data || []).map(reminder => ({
        id: reminder.id,
        title: reminder.title,
        description: reminder.description,
        reminder_date: reminder.reminder_date,
        reminder_type: reminder.reminder_type,
        client_id: reminder.client_id,
        project_id: reminder.project_id,
        payment_id: reminder.payment_id,
        client_name: (reminder.clients as any)?.name || null,
        client_email: (reminder.clients as any)?.email || null,
        project_name: (reminder.projects as any)?.name || null,
        overdue: new Date(reminder.reminder_date) < new Date(),
    }));
}

/**
 * Get projects at risk due to overdue payments
 */
export async function getPaymentRiskProjects(): Promise<AtRiskProject[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    // Get projects with overdue or soon-to-be-overdue payments
    const { data, error } = await supabase
        .from('payments')
        .select(`
            id,
            amount,
            due_date,
            status,
            project_id,
            projects (
                id,
                name,
                client_id,
                clients (name)
            )
        `)
        .eq('user_id', user.id)
        .in('status', ['pending', 'overdue'])
        .lt('due_date', new Date().toISOString());

    if (error) {
        console.error('Error fetching payment risk projects:', error);
        throw error;
    }

    // Group by project and get the most overdue payment
    const projectMap = new Map<string, AtRiskProject>();

    (data || []).forEach(payment => {
        const project = (payment as any).projects;
        if (!project) return;

        const client = project.clients;
        const daysOverdue = Math.floor(
            (new Date().getTime() - new Date(payment.due_date).getTime()) / (1000 * 60 * 60 * 24)
        );

        const existingProject = projectMap.get(project.id);
        if (!existingProject || (existingProject.risk_metadata.days_overdue || 0) < daysOverdue) {
            projectMap.set(project.id, {
                id: project.id,
                name: project.name,
                client_id: project.client_id,
                client_name: client?.name || null,
                risk_type: 'payment',
                risk_metadata: {
                    days_overdue: daysOverdue,
                    amount: payment.amount,
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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Get all active projects
    const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select(`
            id,
            name,
            client_id,
            created_at,
            clients (name)
        `)
        .eq('user_id', user.id)
        .in('status', ['planning', 'in_progress']);

    if (projectsError) {
        console.error('Error fetching projects:', projectsError);
        throw projectsError;
    }

    const atRiskProjects: AtRiskProject[] = [];

    for (const project of projects || []) {
        // Get latest timeline event for this project
        const { data: events } = await supabase
            .from('timeline_events')
            .select('event_date')
            .eq('project_id', project.id)
            .order('event_date', { ascending: false })
            .limit(1);

        const lastActivity = events && events.length > 0
            ? events[0].event_date
            : project.created_at;

        if (new Date(lastActivity) < new Date(sevenDaysAgo)) {
            const daysInactive = Math.floor(
                (new Date().getTime() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24)
            );

            atRiskProjects.push({
                id: project.id,
                name: project.name,
                client_id: project.client_id,
                client_name: (project.clients as any)?.name || null,
                risk_type: 'ghosting',
                risk_metadata: {
                    last_contact_days: daysInactive,
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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    // Get current month revenue
    const { data: currentRevenue } = await supabase
        .from('payments')
        .select('amount')
        .eq('user_id', user.id)
        .eq('status', 'paid')
        .gte('paid_date', `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`)
        .lt('paid_date', currentMonth === 12
            ? `${currentYear + 1}-01-01`
            : `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`
        );

    const monthlyRevenue = (currentRevenue || []).reduce((sum, p) => sum + Number(p.amount), 0);

    // Get previous month revenue
    const { data: prevRevenue } = await supabase
        .from('payments')
        .select('amount')
        .eq('user_id', user.id)
        .eq('status', 'paid')
        .gte('paid_date', `${previousYear}-${String(previousMonth).padStart(2, '0')}-01`)
        .lt('paid_date', `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`);

    const previousMonthRevenue = (prevRevenue || []).reduce((sum, p) => sum + Number(p.amount), 0);

    // Calculate percentage change
    const revenueChangePercent = previousMonthRevenue > 0
        ? ((monthlyRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
        : 0;

    // Get pending invoices
    const { data: pending } = await supabase
        .from('payments')
        .select('amount')
        .eq('user_id', user.id)
        .eq('status', 'pending');

    const pendingInvoicesTotal = (pending || []).reduce((sum, p) => sum + Number(p.amount), 0);
    const pendingInvoicesCount = (pending || []).length;

    // Revenue goal (hardcoded to $11,000 for now)
    const revenueGoal = 11000;
    const revenueGoalPercent = (monthlyRevenue / revenueGoal) * 100;

    return {
        monthly_revenue: monthlyRevenue,
        previous_month_revenue: previousMonthRevenue,
        revenue_change_percent: revenueChangePercent,
        pending_invoices_total: pendingInvoicesTotal,
        pending_invoices_count: pendingInvoicesCount,
        revenue_goal: revenueGoal,
        revenue_goal_percent: Math.min(revenueGoalPercent, 100),
    };
}

/**
 * Mark a reminder as done
 */
export async function markReminderDone(reminderId: string): Promise<void> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    const { error } = await supabase
        .from('reminders')
        .update({
            is_sent: true,
            sent_at: new Date().toISOString(),
        })
        .eq('id', reminderId)
        .eq('user_id', user.id);

    if (error) {
        console.error('Error marking reminder as done:', error);
        throw error;
    }

    // Log to timeline
    const { data: reminder } = await supabase
        .from('reminders')
        .select('title, project_id')
        .eq('id', reminderId)
        .single();

    if (reminder && reminder.project_id) {
        await logTimelineEvent({
            project_id: reminder.project_id,
            event_type: 'reminder',
            title: 'Reminder Completed',
            description: `Marked as done: ${reminder.title}`,
            metadata: { reminder_id: reminderId }
        });
    }
}

/**
 * Snooze a reminder by updating its date
 */
export async function snoozeReminder(reminderId: string, days: number): Promise<void> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    // Get current reminder
    const { data: reminder, error: fetchError } = await supabase
        .from('reminders')
        .select('reminder_date, project_id, title')
        .eq('id', reminderId)
        .eq('user_id', user.id)
        .single();

    if (fetchError) {
        console.error('Error fetching reminder:', fetchError);
        throw fetchError;
    }

    // Calculate new date
    const currentDate = new Date(reminder.reminder_date);
    const newDate = new Date(currentDate.getTime() + days * 24 * 60 * 60 * 1000);

    const { error } = await supabase
        .from('reminders')
        .update({
            reminder_date: newDate.toISOString(),
        })
        .eq('id', reminderId)
        .eq('user_id', user.id);

    if (error) {
        console.error('Error snoozing reminder:', error);
        throw error;
    }

    // Log to timeline
    if (reminder && reminder.project_id) {
        await logTimelineEvent({
            project_id: reminder.project_id,
            event_type: 'reminder',
            title: 'Reminder Snoozed',
            description: `Snoozed for ${days} days: ${reminder.title}`,
            metadata: { reminder_id: reminderId, days: days }
        });
    }
}
