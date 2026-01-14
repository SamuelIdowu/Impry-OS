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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Copy, Mail, Check } from 'lucide-react';

interface EmailDraftModalProps {
    isOpen: boolean;
    onClose: () => void;
    recipientEmail: string;
    recipientName?: string;
    initialSubject: string;
    initialBody?: string;
    onSend: (subject: string, body: string) => Promise<void>;
}

export function EmailDraftModal({
    isOpen,
    onClose,
    recipientEmail,
    recipientName,
    initialSubject,
    initialBody = '',
    onSend,
}: EmailDraftModalProps) {
    const [subject, setSubject] = useState(initialSubject);
    const [body, setBody] = useState(initialBody);
    const [copied, setCopied] = useState(false);
    const [isSending, setIsSending] = useState(false);

    const handleSend = async () => {
        setIsSending(true);
        try {
            await onSend(subject, body);
            onClose();
        } catch (error) {
            console.error(error);
            // Error handling usually done in parent or via toast there
        } finally {
            setIsSending(false);
        }
    };

    const handleCopy = () => {
        const fullText = `To: ${recipientEmail}\nSubject: ${subject}\n\n${body}`;
        navigator.clipboard.writeText(fullText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Draft Follow-up Email</DialogTitle>
                    <DialogDescription>
                        Review and edit your message before sending it to {recipientName || recipientEmail}.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="recipient">To</Label>
                        <Input id="recipient" value={recipientEmail} disabled className="bg-muted" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                            id="subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="body">Message</Label>
                        <Textarea
                            id="body"
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            className="min-h-[200px]"
                        />
                    </div>
                </div>
                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button variant="outline" onClick={handleCopy} className="w-full sm:w-auto">
                        {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                        {copied ? 'Copied' : 'Copy to Clipboard'}
                    </Button>
                    <Button onClick={handleSend} disabled={isSending} className="w-full sm:w-auto">
                        <Mail className="mr-2 h-4 w-4" />
                        {isSending ? 'Sending...' : 'Send Email'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
