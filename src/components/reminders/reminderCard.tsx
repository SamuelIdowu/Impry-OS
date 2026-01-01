'use client';

import { useState, useTransition } from 'react';
import { format, isPast, isToday, isTomorrow, addDays } from 'date-fns';
import { Reminder } from '@/lib/types/reminder';
import { completeReminderAction, snoozeReminderAction } from '@/server/actions/reminders';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    CheckCircle2,
    Clock,
    ArrowUpRight,
    AlertCircle,
    CalendarClock,
    DollarSign,
    StickyNote
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdownMenu';
import Link from 'next/link';
import { cn } from '@/lib/utils'; // Assuming cn exists

interface ReminderCardProps {
    reminder: Reminder;
}

export function ReminderCard({ reminder }: ReminderCardProps) {
    const [isPending, startTransition] = useTransition();
    // Optimistic UI state could be added here, but for now relying on revalidate

    const handleComplete = () => {
        startTransition(async () => {
            await completeReminderAction(reminder.id, reminder.project_id);
        });
    };

    const handleSnooze = (days: number) => {
        startTransition(async () => {
            const newDate = addDays(new Date(), days).toISOString();
            await snoozeReminderAction(reminder.id, newDate, reminder.project_id);
        });
    };

    const isOverdue = isPast(new Date(reminder.reminder_date)) && !isToday(new Date(reminder.reminder_date));
    const isDueToday = isToday(new Date(reminder.reminder_date));

    // Type definition
    const TypeIcon = {
        follow_up: StickyNote,
        payment: DollarSign,
        deadline: CalendarClock,
        general: AlertCircle,
    }[reminder.reminder_type] || AlertCircle;

    const typeLabel = {
        follow_up: 'Follow-up',
        payment: 'Payment',
        deadline: 'Deadline',
        general: 'Reminder',
    }[reminder.reminder_type];

    const typeColor = {
        follow_up: 'text-blue-500 bg-blue-50',
        payment: 'text-green-500 bg-green-50',
        deadline: 'text-red-500 bg-red-50',
        general: 'text-gray-500 bg-gray-50',
    }[reminder.reminder_type];

    return (
        <Card className={cn(
            "group overflow-hidden transition-all hover:shadow-md border-l-4",
            isOverdue ? "border-l-red-500" : isDueToday ? "border-l-yellow-500" : "border-l-transparent"
        )}>
            <CardContent className="p-4 flex items-start gap-4">
                {/* Checkbox / Complete Action */}
                <div className="pt-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            "h-6 w-6 rounded-full border-2 border-gray-300 hover:border-green-500 hover:text-green-500 hover:bg-green-50 p-0 text-transparent transition-colors",
                            isPending && "opacity-50 cursor-not-allowed"
                        )}
                        onClick={handleComplete}
                        disabled={isPending}
                        title="Mark as complete"
                    >
                        <CheckCircle2 className="h-4 w-4" />
                    </Button>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={cn("text-xs font-normal border-0 px-1.5 py-0.5", typeColor)}>
                            <TypeIcon className="h-3 w-3 mr-1" />
                            {typeLabel}
                        </Badge>
                        {reminder.projects && (
                            <span className="text-xs text-muted-foreground truncate">
                                • {reminder.projects.name}
                            </span>
                        )}
                    </div>

                    <h4 className={cn(
                        "font-medium text-sm text-foreground mb-1",
                        isPending && "line-through text-muted-foreground"
                    )}>
                        {reminder.title}
                    </h4>

                    {reminder.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                            {reminder.description}
                        </p>
                    )}

                    <div className="flex items-center gap-2 text-xs">
                        <span className={cn(
                            "font-medium",
                            isOverdue ? "text-red-600" : isDueToday ? "text-yellow-600" : "text-muted-foreground"
                        )}>
                            {isOverdue ? "Overdue" : isDueToday ? "Due Today" : format(new Date(reminder.reminder_date), "MMM d")}
                            {" • " + format(new Date(reminder.reminder_date), "h:mm a")}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" disabled={isPending}>
                                <Clock className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleSnooze(1)}>
                                Snooze until Tomorrow
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSnooze(2)}>
                                Snooze 2 Days
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSnooze(7)}>
                                Snooze 1 Week
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {reminder.project_id && (
                        <Link href={`/projects/${reminder.project_id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" title="Open Project">
                                <ArrowUpRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
