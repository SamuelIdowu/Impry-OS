export type ReminderType = 'follow_up' | 'payment' | 'deadline' | 'general';
export type ReminderStatus = 'pending' | 'completed' | 'snoozed';

import { InferSelectModel } from 'drizzle-orm';
import { reminders } from '@/server/db/schema';

export type Reminder = InferSelectModel<typeof reminders> & {
    // Joined fields (optional)
    project?: { name: string } | null;
    client?: { name: string; email?: string | null } | null;
};

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
