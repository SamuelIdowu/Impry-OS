'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { createManualNote } from '@/server/actions/activities';
import { useQueryClient } from '@tanstack/react-query';

const formSchema = z.object({
    content: z.string().min(1, 'Note cannot be empty'),
});

interface AddNoteDialogProps {
    projectId: string;
}

export function AddNoteDialog({ projectId }: AddNoteDialogProps) {
    const [open, setOpen] = React.useState(false);
    const queryClient = useQueryClient();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            content: '',
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const result = await createManualNote({
                projectId,
                content: values.content,
            });

            if (result.success) {
                form.reset();
                setOpen(false);
                // Invalidate query to refresh list instantly
                queryClient.invalidateQueries({ queryKey: ['project-activities', projectId] });
            } else {
                console.error('Failed to add note:', result.error);
            }
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Note
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Note</DialogTitle>
                    <DialogDescription>
                        Add a manual note to the project timeline.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Note</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Discussed requirements with client..."
                                            className="resize-none h-32"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? 'Saving...' : 'Add Note'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
