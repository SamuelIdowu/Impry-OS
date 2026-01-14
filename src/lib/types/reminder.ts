export type ReminderType = 'follow_up' | 'payment' | 'deadline' | 'general';
export type ReminderStatus = 'pending' | 'completed' | 'snoozed';

export interface Reminder {
    id: string;
    user_id: string;
    project_id?: string;
    client_id?: string;
    payment_id?: string;
    title: string;
    description?: string;
    reminder_date: string; // ISO string
    reminder_type: ReminderType;
    status: ReminderStatus;
    snoozed_until?: string;
    completed_at?: string;
    is_sent: boolean;
    sent_at?: string;
    created_at: string;
    updated_at: string;

    // Joined fields (optional)
    projects?: { name: string };
    clients?: { name: string; email?: string };
}

export type CreateReminderInput = {
    project_id?: string;
    client_id?: string;
    payment_id?: string;
    title: string;
    description?: string;
    reminder_date: string;
    reminder_type: ReminderType;
};

export type UpdateReminderInput = Partial<CreateReminderInput> & {
    status?: ReminderStatus;
    snoozed_until?: string | null;
    completed_at?: string | null;
};
