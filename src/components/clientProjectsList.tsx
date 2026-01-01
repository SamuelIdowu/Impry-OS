'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyClientProjects } from '@/components/emptyClientProjects';

interface Project {
    id: string;
    name: string;
    status: string;
}

interface ClientProjectsListProps {
    projects: Project[];
    clientId: string;
    onAddProject: () => void;
}

const statusVariants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
    lead: 'secondary',
    active: 'default',
    waiting: 'outline',
    completed: 'outline',
};

const statusLabels: Record<string, string> = {
    lead: 'Lead',
    active: 'Active',
    waiting: 'Waiting',
    completed: 'Completed',
};

export function ClientProjectsList({ projects, clientId, onAddProject }: ClientProjectsListProps) {

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Projects</CardTitle>
                        <CardDescription>
                            {projects.length === 0
                                ? 'No projects yet'
                                : `${projects.length} project${projects.length !== 1 ? 's' : ''}`}
                        </CardDescription>
                    </div>
                    <Button onClick={onAddProject} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Project
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {projects.length === 0 ? (
                    <EmptyClientProjects onAddProject={onAddProject} />
                ) : (
                    <div className="space-y-3">
                        {projects.map((project) => (
                            <Link
                                key={project.id}
                                href={`/projects/${project.id}`}
                                className="block"
                            >
                                <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent hover:border-primary/50 transition-colors">
                                    <span className="font-medium">{project.name}</span>
                                    <Badge variant={statusVariants[project.status] || 'secondary'}>
                                        {statusLabels[project.status] || project.status}
                                    </Badge>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
