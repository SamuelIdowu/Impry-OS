'use client';

import { useEffect, useState } from 'react';
import { Calendar, Check, Clock, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from '@/lib/date-utils';
import { ReminderCreationModal } from '@/components/reminders/reminderCreationModal';
import { useRouter } from 'next/navigation';

interface ReminderData {
    id: string;
    title: string;
    description?: string | null;
    reminder_date: string;
    reminder_type: string;
    is_sent: boolean;
}

interface NextReminderCardProps {
    projectId: string;
    reminders: ReminderData[];
}

export function NextReminderCard({ projectId, reminders }: NextReminderCardProps) {
    const router = useRouter();
    const nextReminder = reminders
        .filter(r => !r.is_sent)
        .sort((a, b) => new Date(a.reminder_date).getTime() - new Date(b.reminder_date).getTime())[0];

    if (!nextReminder) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Next Reminder</CardTitle>
                    <CardDescription>Stay on top of follow-ups</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-center h-32 rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground">No upcoming reminders</p>
                    </div>
                    <ReminderCreationModal
                        projectId={projectId}
                        trigger={
                            <Button className="w-full gap-2">
                                <Calendar className="h-4 w-4" />
                                Add Reminder
                            </Button>
                        }
                        onSuccess={() => router.refresh()}
                    />
                </CardContent>
            </Card>
        );
    }

    const dueDate = new Date(nextReminder.reminder_date);
    const timeUntilDue = formatDistanceToNow(nextReminder.reminder_date);

    return (
        <Card className="bg-zinc-900 rounded-2xl p-6 flex flex-col text-white h-full relative overflow-hidden border-none shadow-none">
            <div className="flex justify-between items-start mb-6 z-10 transition-colors">
                <h3 className="text-lg font-bold text-white">Next Reminder</h3>
                <MoreVertical className="h-5 w-5 text-zinc-500 cursor-pointer" />
            </div>

            <div className="flex-1 z-10">
                <div className="inline-flex items-center gap-2 bg-zinc-800 rounded-md px-2.5 py-1.5 mb-4 max-w-fit">
                    <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                    <span className="text-xs font-medium text-zinc-300">
                        DueDate: {new Date(nextReminder.reminder_date).toLocaleDateString()}
                    </span>
                </div>

                <h4 className="text-xl font-bold mb-2 text-white">{nextReminder.title}</h4>
                {nextReminder.description && (
                    <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                        {nextReminder.description}
                    </p>
                )}
            </div>

            <div className="flex items-center justify-between z-10 mt-auto">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-white">
                        JD
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-zinc-500">Assigned to</span>
                        <span className="text-sm font-medium text-zinc-200">John Doe</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="h-8 w-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors">
                        <Clock className="h-4 w-4 text-zinc-400" />
                    </button>
                    <button className="h-8 w-8 rounded-full bg-white text-zinc-900 hover:bg-zinc-200 flex items-center justify-center transition-colors">
                        <Check className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </Card>
    );
}
