'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { createProjectAction } from '@/server/actions/projects';
import type { CreateProjectInput } from '@/lib/types/project';

interface ClientOption {
    id: string;
    name: string;
}

interface AddProjectDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    clientId?: string;
    clientName?: string;
    clients?: ClientOption[]; // List of clients for selection if clientId is not provided
    onSubmit?: (data: CreateProjectInput) => Promise<void>;
}

export function AddProjectDialog({
    open,
    onOpenChange,
    onSuccess,
    clientId,
    clientName,
    clients = [],
    onSubmit,
}: AddProjectDialogProps) {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState<CreateProjectInput>({
        name: '',
        client_id: clientId || '',
        description: '',
        status: 'planning', // Maps to 'lead'
    });

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Project name is required';
        }

        if (!formData.client_id) {
            newErrors.client_id = 'Client is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            if (onSubmit) {
                await onSubmit(formData);
            } else {
                const res = await createProjectAction(formData);
                if (!res.success) {
                    throw new Error(res.error || 'Failed to create project');
                }
            }
            // Reset form but keep clientId if provided as prop
            setFormData({
                name: '',
                client_id: clientId || '',
                description: '',
                status: 'planning',
            });
            setErrors({});
            onOpenChange(false);
            onSuccess();
        } catch (error) {
            console.error('Failed to create project:', error);
            setErrors({ submit: 'Failed to create project. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create New Project</DialogTitle>
                        <DialogDescription>
                            Add a new project to track scope, payments, and deadlines.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {clientName ? (
                            <div className="grid gap-2">
                                <Label>Client</Label>
                                <div className="text-sm font-medium px-3 py-2 bg-muted rounded-md">
                                    {clientName}
                                </div>
                            </div>
                        ) : (
                            <div className="grid gap-2">
                                <Label htmlFor="client_id">Client <span className="text-destructive">*</span></Label>
                                <Select
                                    value={formData.client_id}
                                    onValueChange={(value) =>
                                        setFormData({
                                            ...formData,
                                            client_id: value,
                                        })
                                    }
                                >
                                    <SelectTrigger className={errors.client_id ? 'border-destructive' : ''}>
                                        <SelectValue placeholder="Select a client" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {clients.map((client) => (
                                            <SelectItem key={client.id} value={client.id}>
                                                {client.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.client_id && (
                                    <p className="text-sm text-destructive">{errors.client_id}</p>
                                )}
                            </div>
                        )}
                        <div className="grid gap-2">
                            <Label htmlFor="name">
                                Project Name <span className="text-destructive">*</span>

                            </Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="E-Commerce Redesign"
                                className={errors.name ? 'border-destructive' : ''}
                            />
                            {errors.name && (
                                <p className="text-sm text-destructive">{errors.name}</p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="status">Initial Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) =>
                                    setFormData({
                                        ...formData,
                                        status: value as CreateProjectInput['status'],
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="planning">Lead</SelectItem>
                                    <SelectItem value="in_progress">Active</SelectItem>
                                    <SelectItem value="on_hold">Waiting</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                placeholder="Describe the project goals and deliverables..."
                                rows={3}
                            />
                        </div>
                        {errors.submit && (
                            <p className="text-sm text-destructive">{errors.submit}</p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Project'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
