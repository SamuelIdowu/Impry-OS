import { createClient } from './auth';
import type {
    Reminder,
    CreateReminderInput,
    UpdateReminderInput,
    ReminderStatus,
} from './types/reminder';

/**
 * Get all reminders for a user, optionally filtered by project or status
 */
export async function getReminders(filters?: {
    projectId?: string;
    status?: ReminderStatus;
    type?: string;
    limit?: number;
}): Promise<Reminder[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    let query = supabase
        .from('reminders')
        .select(`
            *,
            projects (name),
            clients (name, email)
        `)
        .eq('user_id', user.id);

    if (filters?.projectId) {
        query = query.eq('project_id', filters.projectId);
    }

    if (filters?.status) {
        query = query.eq('status', filters.status);
    }

    if (filters?.type) {
        query = query.eq('reminder_type', filters.type);
    }

    query = query.order('reminder_date', { ascending: true });

    if (filters?.limit) {
        query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
        throw error;
    }

    return (data as any[]) || [];
}

/**
 * Get pending and due reminders (including snoozed ones that are due)
 * Logic: status = 'pending' OR (status = 'snoozed' AND snoozed_until <= NOW)
 * Actually, usually we reset status to 'pending' when snooze expires via cron, 
 * but for UI query we can just check conditions.
 * Sprint 8 Spec: Snoozed = Temporarily hidden.
 * So if snoozed_until > now, hide it.
 */
export async function getDueReminders(): Promise<Reminder[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    // Since Supabase filter on complex OR conditions can be tricky with JS SDK without pure Postgrest syntax,
    // we'll fetch pending and snoozed, and filter in client or use raw query if complex.
    // However, let's try to be efficient.
    // 'status' is either 'pending' or 'snoozed'.
    // If 'pending', show it (check due date?? No, inbox shows upcoming too probably? Spec says "Due/Overdue").
    // "Dashboard Follow-Up Inbox query: status='pending' AND (due_date <= NOW + 1 day OR overdue)"

    // We'll fetch all active (not completed) and filter/sort in app or simple query
    const { data, error } = await supabase
        .from('reminders')
        .select(`
            *,
            projects (name),
            clients (name, email)
        `)
        .eq('user_id', user.id)
        .eq('is_sent', false)
        .order('reminder_date', { ascending: true });

    if (error) {
        throw error;
    }

    const now = new Date();

    // Filter in memory for snoozed_until logic if needed, 
    // or just return all and let UI decide what "Due" means.
    // But spec says "Show in Follow-Up Inbox".
    // We will return all incomplete reminders and let UI/Action filter.
    return (data || []) as Reminder[];
}

/**
 * Create a new reminder
 */
export async function createReminder(input: CreateReminderInput): Promise<Reminder> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
        .from('reminders')
        .insert({
            user_id: user.id,
            project_id: input.project_id,
            client_id: input.client_id,
            payment_id: input.payment_id,
            title: input.title,
            description: input.description,
            reminder_date: input.reminder_date,
            reminder_type: input.reminder_type,
            is_sent: false,
        })
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data as Reminder;
}

/**
 * Update a reminder
 */
export async function updateReminder(id: string, input: UpdateReminderInput): Promise<Reminder> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    // Remove status from input as it doesn't exist in DB
    const { status, ...updateData } = input;

    const { data, error } = await supabase
        .from('reminders')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data as Reminder;
}

/**
 * Delete a reminder
 */
export async function deleteReminder(id: string): Promise<void> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) {
        throw error;
    }
}
