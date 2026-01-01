'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Copy, Check, ExternalLink } from 'lucide-react';

interface ScopeShareDialogProps {
    open: boolean;
    onClose: () => void;
    shareUrl: string;
    versionNumber: number;
}

export function ScopeShareDialog({
    open,
    onClose,
    shareUrl,
    versionNumber
}: ScopeShareDialogProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    const handleOpenLink = () => {
        window.open(shareUrl, '_blank');
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-2xl">
                        Scope v{versionNumber} Saved! 🎉
                    </DialogTitle>
                    <DialogDescription>
                        Your scope has been frozen and a shareable link has been generated.
                        Share this link with your client to give them read-only access.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 pt-4">
                    <label className="text-sm font-medium">Shareable Link</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            readOnly
                            value={shareUrl}
                            className="flex-1 px-3 py-2 border rounded-md bg-muted text-sm font-mono"
                        />
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleCopy}
                        >
                            {copied ? (
                                <Check className="h-4 w-4 text-green-600" />
                            ) : (
                                <Copy className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                    {copied && (
                        <p className="text-sm text-green-600 font-medium">
                            ✓ Copied to clipboard!
                        </p>
                    )}
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                    <Button onClick={handleOpenLink}>
                        <ExternalLink className="h-4 w-4" />
                        Preview Link
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
