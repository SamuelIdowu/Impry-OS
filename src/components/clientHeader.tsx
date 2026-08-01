'use client';

import { Building2, Mail, Pencil, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import type { Client } from '@/lib/types/client';

interface ClientHeaderProps {
    client: Client;
    onEdit: () => void;
    onDelete: () => void;
}

export function ClientHeader({ client, onEdit, onDelete }: ClientHeaderProps) {
    const params = useParams();
    const workspaceId = params.workspaceId as string || 'default';

    const initials = client.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <Link href={`/${workspaceId}/clients`}>
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Clients
                    </Button>
                </Link>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <Avatar className="h-16 w-16 shrink-0">
                                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="space-y-2">
                                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{client.name}</h1>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Mail className="h-4 w-4" />
                                        <a
                                            href={`mailto:${client.email}`}
                                            className="hover:underline text-sm"
                                        >
                                            {client.email}
                                        </a>
                                    </div>
                                    {client.company && (
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Building2 className="h-4 w-4" />
                                            <span className="text-sm">{client.company}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                            <Button variant="outline" size="sm" onClick={onEdit}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
                            <Button variant="outline" size="sm" onClick={onDelete}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
