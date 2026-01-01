'use client';

import { useState, useEffect } from 'react';
import { Edit3, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { updateClientNotes } from '@/lib/clients';
import { formatRelativeTime } from '@/lib/utils';

interface NotesSectionProps {
    clientId: string;
    initialNotes: string | null;
    lastUpdated: string;
    onUpdate: () => void;
}

export function NotesSection({ clientId, initialNotes, lastUpdated, onUpdate }: NotesSectionProps) {
    const [notes, setNotes] = useState(initialNotes || '');
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        setNotes(initialNotes || '');
    }, [initialNotes]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateClientNotes(clientId, notes);
            setIsEditing(false);
            setHasChanges(false);
            onUpdate();
        } catch (error) {
            console.error('Failed to save notes:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setNotes(initialNotes || '');
        setIsEditing(false);
        setHasChanges(false);
    };

    const handleChange = (value: string) => {
        setNotes(value);
        setHasChanges(value !== (initialNotes || ''));
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Notes</CardTitle>
                        <CardDescription>
                            {lastUpdated && `Last updated ${formatRelativeTime(lastUpdated)}`}
                        </CardDescription>
                    </div>
                    {!isEditing && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditing(true)}
                        >
                            <Edit3 className="h-4 w-4 mr-2" />
                            Edit
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {isEditing ? (
                    <div className="space-y-3">
                        <Textarea
                            value={notes}
                            onChange={(e) => handleChange(e.target.value)}
                            placeholder="Add notes about this client..."
                            rows={6}
                            className="resize-none"
                        />
                        <div className="flex gap-2">
                            <Button
                                onClick={handleSave}
                                disabled={isSaving || !hasChanges}
                                size="sm"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                {isSaving ? 'Saving...' : 'Save'}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleCancel}
                                disabled={isSaving}
                                size="sm"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="prose prose-sm max-w-none">
                        {notes ? (
                            <p className="text-sm whitespace-pre-wrap text-foreground">{notes}</p>
                        ) : (
                            <p className="text-sm text-muted-foreground italic">
                                No notes yet. Click edit to add notes about this client.
                            </p>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
