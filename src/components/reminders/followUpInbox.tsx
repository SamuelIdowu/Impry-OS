'use client';

import { Reminder } from '@/lib/types/reminder';
import { ReminderCard } from './reminderCard';
import { Bell, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface FollowUpInboxProps {
    reminders: Reminder[];
}

export function FollowUpInbox({ reminders }: FollowUpInboxProps) {
    // Filter logic:
    // Show if status != completed
    // If status == snoozed, show ONLY if snoozed_until < now
    // Actually, backend 'getDueReminders' already filters completed.
    // We just need to filter snoozed that are not yet due.

    const now = new Date();
    const visibleReminders = reminders.filter(r => {
        if (r.status === 'snoozed' && r.snoozed_until) {
            return new Date(r.snoozed_until) <= now;
        }
        return true;
    });

    // Sort by date (asc)
    const sortedReminders = [...visibleReminders].sort((a, b) =>
        new Date(a.reminder_date).getTime() - new Date(b.reminder_date).getTime()
    );

    const hasReminders = sortedReminders.length > 0;

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    Follow-Up Inbox
                    {hasReminders && (
                        <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-xs text-red-600">
                            {sortedReminders.length}
                        </span>
                    )}
                </CardTitle>
                <Link href="/reminders">
                    <Button variant="link" size="sm" className="h-8 text-xs text-muted-foreground">
                        View all
                    </Button>
                </Link>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto pr-2">
                {hasReminders ? (
                    <div className="space-y-3 pt-2">
                        {sortedReminders.map((reminder) => (
                            <ReminderCard key={reminder.id} reminder={reminder} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-[200px] text-center text-muted-foreground">
                        <CheckCircle2 className="h-12 w-12 mb-3 text-green-500/20" />
                        <p className="text-sm font-medium">All caught up!</p>
                        <p className="text-xs">No pending follow-ups right now.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
