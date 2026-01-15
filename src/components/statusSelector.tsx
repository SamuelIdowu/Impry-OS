'use client';

import { useState } from 'react';
import { Check, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdownMenu';
import { updateProjectStatusAction } from '@/server/actions/projects';
import type { ProjectStatus } from '@/lib/types/project';
import { getStatusConfig } from '@/lib/types/project';

interface StatusSelectorProps {
    projectId: string;
    currentStatus: ProjectStatus;
    onStatusChange: () => void;
}

const statuses: ProjectStatus[] = ['lead', 'active', 'waiting', 'completed'];

export function StatusSelector({ projectId, currentStatus, onStatusChange }: StatusSelectorProps) {
    const [isUpdating, setIsUpdating] = useState(false);
    const [optimisticStatus, setOptimisticStatus] = useState<ProjectStatus>(currentStatus);

    const handleStatusChange = async (newStatus: ProjectStatus) => {
        if (newStatus === optimisticStatus || isUpdating) return;

        // Optimistic update
        setOptimisticStatus(newStatus);
        setIsUpdating(true);

        try {
            const result = await updateProjectStatusAction(projectId, newStatus);
            if (result.success) {
                onStatusChange();
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Failed to update status:', error);
            // Revert on error
            setOptimisticStatus(currentStatus);
        } finally {
            setIsUpdating(false);
        }
    };

    const config = getStatusConfig(optimisticStatus);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className={`gap-2 border transition-all ${config.color}`}
                    disabled={isUpdating}
                >
                    <Circle className={`h-2.5 w-2.5 ${config.iconColor}`} />
                    <span className="font-semibold">{config.label}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="p-1">
                {statuses.map((status) => {
                    const statusConfig = getStatusConfig(status);
                    const isActive = status === optimisticStatus;
                    return (
                        <DropdownMenuItem
                            key={status}
                            onClick={() => handleStatusChange(status)}
                            className="gap-2 focus:bg-zinc-50"
                        >
                            <div className="flex items-center justify-center w-4">
                                {isActive && <Check className="h-4 w-4 text-zinc-900" />}
                            </div>
                            <Circle className={`h-2.5 w-2.5 ${statusConfig.iconColor}`} />
                            <span className={isActive ? "font-medium text-zinc-900" : "text-zinc-600"}>
                                {statusConfig.label}
                            </span>
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
