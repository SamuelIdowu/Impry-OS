import React from "react"
import { Badge } from "@/components/ui/badge"
import { Status } from "@/lib/types"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
    status: Status | string;
    className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    let variantStyles = "bg-zinc-100 text-zinc-700 border-zinc-200"; // Default/Draft

    switch (status) {
        case 'Active':
        case 'Paid':
        case 'paid':
        case 'On Track':
        case 'Completed':
            variantStyles = "bg-emerald-50 text-emerald-700 border-emerald-100";
            break;
        case 'Pending':
        case 'pending':
        case 'Sent':
        case 'In Progress':
        case 'Needs Review':
            variantStyles = "bg-amber-50 text-amber-700 border-amber-100";
            break;
        case 'Overdue':
        case 'overdue':
        case 'At Risk':
        case 'Payment Late':
        case 'cancelled':
        case 'Cancelled':
            variantStyles = "bg-red-50 text-red-700 border-red-100";
            break;
        case 'Inactive':
        case 'Archived':
        case 'Draft':
        case 'draft':
            variantStyles = "bg-zinc-100 text-zinc-700 border-zinc-200";
            break;
        case 'Ghosting':
            variantStyles = "bg-yellow-50 text-yellow-700 border-yellow-100";
            break;
        case 'partial':
        case 'Partial':
            variantStyles = "bg-blue-50 text-blue-700 border-blue-100";
            break;
        default:
            // Try to handle mapped statuses
            if (status === 'Scope Check') variantStyles = "bg-orange-50 text-orange-600 border-orange-100";
            else if (status === 'Contract Sign') variantStyles = "bg-blue-50 text-blue-600 border-blue-100";
            else variantStyles = "bg-zinc-100 text-zinc-700 border-zinc-200";
    }

    return (
        <span className={cn("inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border", variantStyles, className)}>
            {status}
        </span>
    )
}
