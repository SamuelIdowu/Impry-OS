'use client';

import Link from 'next/link';
import { Pencil, ListTodo, BellPlus, FileText, StickyNote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusSelector } from '@/components/statusSelector';
import { ReminderCreationModal } from '@/components/reminders/reminderCreationModal';
import { EditProjectModal } from '@/components/projects/editProjectModal';
import { AddNoteModal } from '@/components/timeline/AddNoteModal';
import type { ProjectWithDetails } from '@/lib/types/project';
import { mapDatabaseToAppStatus } from '@/lib/types/project';

interface ProjectHeaderProps {
    project: ProjectWithDetails;
    onStatusChange: () => void;
    onProjectUpdate: () => void;
    onTabChange?: (tab: string) => void;
}

export function ProjectHeader({ project, onStatusChange, onProjectUpdate, onTabChange }: ProjectHeaderProps) {
    const appStatus = mapDatabaseToAppStatus(project.status);

    return (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-4 flex-wrap">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{project.name}</h1>
                    <StatusSelector
                        projectId={project.id}
                        currentStatus={appStatus}
                        onStatusChange={onStatusChange}
                    />
                </div>
                <p className="text-muted-foreground text-base">
                    Client:{' '}
                    {project.client ? (
                        <Link
                            href={`/clients/${project.client.id}`}
                            className="font-medium text-foreground hover:underline"
                        >
                            {project.client.name}
                        </Link>
                    ) : (
                        <span className="font-medium text-foreground">No client</span>
                    )}
                </p>
            </div>
            <div className="flex items-center gap-3">
                {onTabChange && (
                    <Button variant="outline" className="gap-2" onClick={() => onTabChange('scope')}>
                        <FileText className="h-4 w-4" />
                        Update Scope
                    </Button>
                )}

                <AddNoteModal
                    projectId={project.id}
                    onSuccess={onProjectUpdate}
                    trigger={
                        <Button variant="outline" className="gap-2">
                            <StickyNote className="h-4 w-4" />
                            Add Note
                        </Button>
                    }
                />

                <EditProjectModal
                    project={project}
                    onSuccess={onProjectUpdate}
                    trigger={
                        <Button variant="ghost" title="Edit details" className="gap-2">
                            <Pencil className="h-4 w-4" />
                            Update Project
                        </Button>
                    }
                />

                <ReminderCreationModal
                    projectId={project.id}
                    clientId={project.client?.id}
                    trigger={
                        <Button className="gap-2">
                            <BellPlus className="h-4 w-4" />
                            Add Reminder
                        </Button>
                    }
                    onSuccess={onProjectUpdate}
                />
            </div>
        </div>
    );
}
