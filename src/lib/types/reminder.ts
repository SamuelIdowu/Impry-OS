export type ReminderType = 'follow_up' | 'payment' | 'deadline' | 'general';
export type ReminderStatus = 'pending' | 'completed' | 'snoozed';

export interface Reminder {
    id: string;
    userId: string;
    projectId?: string;
    clientId?: string;
    paymentId?: string;
    title: string;
    description?: string;
    reminderDate: string; // ISO string
    reminderType: ReminderType;
    status: ReminderStatus;
    snoozedUntil?: string;
    completedAt?: string;
    isSent: boolean;
    sentAt?: string;
    createdAt: string;
    updatedAt: string;

    // Joined fields (optional)
    project?: { name: string };
    client?: { name: string; email?: string };
}

export type CreateReminderInput = {
    projectId?: string;
    clientId?: string;
    paymentId?: string;
    title: string;
    description?: string;
    reminderDate: string;
    reminderType: ReminderType;
};

export type UpdateReminderInput = Partial<CreateReminderInput> & {
    status?: ReminderStatus;
    snoozedUntil?: string | null;
    completedAt?: string | null;
};
