"use client"

import * as React from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { NotificationModal } from "./notificationModal"

import { Sidebar } from "./sidebar"
import { SearchDialog } from "@/components/search/searchDialog"
import { cn } from "@/lib/utils"

import { User } from "@supabase/supabase-js"

export function AppHeader({ user }: { user: User }) {
    const [notificationOpen, setNotificationOpen] = React.useState(false)

    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
    const [searchOpen, setSearchOpen] = React.useState(false) // Added state

    // Shortcut listener (Duplicate logical place, but ensures it works at header level)
    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setSearchOpen((open) => !open)
            }
        }
        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    return (
        <>
            <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />

            <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/90 backdrop-blur-md">
                <div className="px-6 lg:px-12 h-16 flex items-center justify-between">
                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 -ml-2 text-zinc-600 hover:text-zinc-900"
                        onClick={() => setMobileMenuOpen(true)}
                    >
                        <Menu className="size-6" />
                    </button>

                    {/* Logo and Brand - Hidden on Desktop since Sidebar has it */}
                    <div className="flex items-center gap-3 md:hidden">
                        <div className="size-8 rounded-lg bg-black text-white flex items-center justify-center">
                            <svg
                                className="size-5"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M12 2L2 7L12 12L22 7L12 2Z"
                                    fill="currentColor"
                                    fillOpacity="0.9"
                                />
                                <path
                                    d="M2 17L12 22L22 17"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <path
                                    d="M2 12L12 17L22 12"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                        <h1 className="text-lg font-bold tracking-tight text-zinc-900">
                            FreelanceShield
                        </h1>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-6 ml-auto md:ml-0">
                        {/* Search Bar */}
                        <button
                            onClick={() => setSearchOpen(true)}
                            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 transition-colors text-sm text-zinc-500 border border-transparent hover:border-zinc-300"
                        >
                            <svg
                                className="size-[18px]"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                            <span>Search projects...</span>
                            <span className="ml-4 text-xs bg-white border border-zinc-200 px-1.5 py-0.5 rounded shadow-sm">
                                ⌘K
                            </span>
                        </button>

                        <div className="flex items-center gap-3">
                            {/* Notification Bell */}
                            <NotificationModal
                                open={notificationOpen}
                                onOpenChange={setNotificationOpen}
                            />


                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Sidebar Overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setMobileMenuOpen(false)}
                    />

                    {/* Sidebar Container */}
                    <div className="absolute inset-y-0 left-0 w-64 bg-white shadow-xl animate-in slide-in-from-left duration-200">
                        <div className="relative h-full">
                            <button
                                className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-900 z-10"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <X className="size-5" />
                            </button>
                            <Sidebar user={user} className="block w-full border-none" />
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
