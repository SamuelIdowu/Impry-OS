"use client"

import React from "react"
import Link from "next/link"
import { MoreVertical, ChevronRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Client } from '@/lib/types';
import { StatusBadge } from "@/components/shared/StatusBadge"
import { cn } from "@/lib/utils";

interface ClientListRowProps {
    client: Client;
}

export function ClientListRow({ client }: ClientListRowProps) {
    const initials = client.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="group flex items-center justify-between p-4 bg-white border-b border-zinc-100 last:border-0 hover:bg-zinc-50 transition-colors">

            <div className="flex items-center gap-4 flex-1 min-w-0">
                <Avatar className="h-10 w-10 border border-zinc-100">
                    <AvatarImage src={`https://avatar.vercel.sh/${client.name}.png`} />
                    <AvatarFallback className="bg-zinc-100 text-zinc-900 font-bold">
                        {client.avatar || initials}
                    </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                        <Link href={`/clients/${client.id}`} className="font-semibold text-sm text-zinc-900 hover:text-blue-600 transition-colors truncate">
                            {client.name}
                        </Link>
                        {client.companyName && client.companyName !== client.name && (
                            <span className="text-xs text-zinc-400 hidden sm:inline-block">• {client.companyName}</span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
                        <span className="truncate">{client.location || "Remote"}</span>
                    </div>
                </div>
            </div>

            <div className="hidden md:flex items-center gap-8 flex-shrink-0 px-4">
                <div className="w-32">
                    <p className="text-xs text-zinc-500 mb-0.5">Projects</p>
                    <p className="text-sm font-medium text-zinc-900">{client.projectCount} Active</p>
                </div>
                <div className="w-32">
                    <p className="text-xs text-zinc-500 mb-0.5">Total Revenue</p>
                    <p className="text-sm font-medium text-zinc-900">${client.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="w-24">
                    <StatusBadge status={client.status} />
                </div>
            </div>

            <div className="flex items-center gap-2 pl-4">
                <Link href={`/clients/${client.id}`}>
                    <button className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-zinc-200 text-zinc-400 hover:text-zinc-600 transition-colors">
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </Link>
                <button className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-zinc-200 text-zinc-400 hover:text-zinc-600 transition-colors">
                    <MoreVertical className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
