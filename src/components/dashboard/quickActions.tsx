"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"

export function QuickActions() {
    const router = useRouter()
    const params = useParams()
    const workspaceId = params.workspaceId as string || 'default'

    return (
        <section className="grid grid-cols-3 gap-4">
            <button
                onClick={() => router.push(`/${workspaceId}/clients`)}
                className="animate-fade-in-up col-span-1 group flex flex-col items-start gap-3 p-5 rounded-2xl bg-white border border-zinc-200 hover:border-black/20 hover:shadow-md transition-colors shadow duration-200 text-zinc-900 shadow-sm"
                style={{ animationDelay: '0ms' }}
            >
                <div className="p-2 bg-zinc-100 rounded-lg group-hover:bg-black group-hover:text-white transition-colors">
                    <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                        />
                    </svg>
                </div>
                <div>
                    <span className="block font-bold text-sm">New Client</span>
                    <span className="block text-xs text-zinc-500 mt-0.5">Onboard & Track</span>
                </div>
            </button>

            <button
                onClick={() => router.push(`/${workspaceId}/projects`)}
                className="animate-fade-in-up col-span-1 group flex flex-col items-start gap-3 p-5 rounded-2xl bg-white border border-zinc-200 hover:border-black/20 hover:shadow-md transition-colors shadow duration-200 text-zinc-900 shadow-sm"
                style={{ animationDelay: '60ms' }}
            >
                <div className="p-2 bg-zinc-100 rounded-lg group-hover:bg-black group-hover:text-white transition-colors">
                    <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                        />
                    </svg>
                </div>
                <div>
                    <span className="block font-bold text-sm">New Project</span>
                    <span className="block text-xs text-zinc-500 mt-0.5">Setup Workspace</span>
                </div>
            </button>

            <button
                onClick={() => router.push(`/${workspaceId}/invoices/new`)}
                className="animate-fade-in-up col-span-1 group flex flex-col items-start gap-3 p-5 rounded-2xl bg-white border border-zinc-200 hover:border-black/20 hover:shadow-md transition-colors shadow duration-200 text-zinc-900 shadow-sm"
                style={{ animationDelay: '120ms' }}
            >
                <div className="p-2 bg-zinc-100 rounded-lg group-hover:bg-black group-hover:text-white transition-colors">
                    <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                </div>
                <div>
                    <span className="block font-bold text-sm">Create Invoice</span>
                    <span className="block text-xs text-zinc-500 mt-0.5">Bill & Get Paid</span>
                </div>
            </button>
        </section>
    )
}
