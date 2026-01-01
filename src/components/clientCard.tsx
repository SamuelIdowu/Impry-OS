"use client"

import React from "react"
import Link from "next/link"
import { Calendar, MoreVertical, MessageSquare, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Client } from '@/lib/types';
import { cn } from "@/lib/utils";

interface ClientCardProps {
    client: Client;
}

export function ClientCard({ client }: ClientCardProps) {
    const isDark = client.name === 'North Star'; // For demo matching

    // Initials generation
    const initials = client.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    // Button Text Logic
    let buttonText = "Dashboard";
    if (client.status === 'Pending') buttonText = "View Proposal";
    if (client.name === 'Studio Graphene') buttonText = "View Details";

    return (
        <Card className={cn(
            "transition-all duration-200 border shadow-sm h-full flex flex-col",
            isDark ? "bg-zinc-950 border-zinc-800 text-white" : "bg-white border-zinc-200 hover:shadow-md"
        )}>
            <div className="p-5 flex flex-col h-full">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex gap-3">
                        <Avatar className={cn(
                            "h-10 w-10 border",
                            isDark ? "border-zinc-700" : "border-zinc-100"
                        )}>
                            <AvatarImage src={`https://avatar.vercel.sh/${client.name}.png`} />
                            <AvatarFallback className={cn(
                                "font-bold",
                                isDark ? "bg-zinc-800 text-zinc-300" : "bg-zinc-100 text-zinc-900"
                            )}>
                                {client.avatar || initials}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className={cn(
                                "font-bold text-sm leading-tight",
                                isDark ? "text-white" : "text-zinc-900"
                            )}>
                                {client.name}
                            </h3>
                            <p className={cn(
                                "text-xs mt-0.5",
                                isDark ? "text-zinc-400" : "text-zinc-500"
                            )}>
                                {client.location || "Remote"}
                            </p>
                        </div>
                    </div>
                    <button className={cn(
                        "p-1 rounded-md transition-colors",
                        isDark ? "hover:bg-zinc-800 text-zinc-500" : "hover:bg-zinc-100 text-zinc-400"
                    )}>
                        <MoreVertical className="h-4 w-4" />
                    </button>
                </div>

                {/* Description */}
                <div className="mb-6 flex-grow">
                    <p className={cn(
                        "text-sm leading-relaxed line-clamp-2",
                        isDark ? "text-zinc-400" : "text-zinc-500"
                    )}>
                        {client.description || "No description available."}
                    </p>
                </div>

                {/* Metadata */}
                <div className="space-y-3 mt-auto">
                    <div className="flex flex-col gap-2">
                        <div className={cn(
                            "flex items-center gap-2 text-xs",
                            isDark ? "text-zinc-400" : "text-zinc-500"
                        )}>
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{client.joinedDate || "Oct 24, 2023"}</span>
                        </div>
                        <div className={cn(
                            "flex items-center gap-2 text-xs",
                            isDark ? "text-zinc-400" : "text-zinc-500"
                        )}>
                            <MessageSquare className="h-3.5 w-3.5" />
                            <span>
                                {client.status === 'Pending' ? 'Lead Stage' :
                                    `${client.projectCount} active project${client.projectCount !== 1 ? 's' : ''}`}
                            </span>
                        </div>
                    </div>

                    <Link href={`/clients/${client.id}`} className="block w-full">
                        <button className={cn(
                            "w-full py-2 px-4 rounded-full text-xs font-semibold transition-all border",
                            isDark
                                ? "bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700 hover:text-white"
                                : "bg-white text-zinc-900 border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300"
                        )}>
                            {buttonText}
                        </button>
                    </Link>
                </div>
            </div>
        </Card>
    );
}
