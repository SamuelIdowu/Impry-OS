"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { FileQuestion, ArrowLeft, LayoutGrid } from "lucide-react"

export default function NotFound() {
    const router = useRouter()

    const handleGoBack = () => {
        if (typeof window !== "undefined" && window.history.length > 1) {
            router.back()
        } else {
            router.push("/workspaces")
        }
    }

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-white dark:bg-zinc-950 p-4 text-center">
            <div className="rounded-2xl bg-zinc-100 dark:bg-zinc-800 p-4 mb-4 text-zinc-600 dark:text-zinc-400">
                <FileQuestion className="h-10 w-10" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-2 text-zinc-900 dark:text-zinc-100">
                Page Not Found
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-[400px] mb-8 leading-relaxed text-sm">
                The page you are looking for doesn&apos;t exist or has been moved.
                Please check the URL or return to your workspaces.
            </p>
            <div className="flex items-center gap-3">
                <Button
                    variant="outline"
                    onClick={handleGoBack}
                    className="flex items-center gap-2 cursor-pointer"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Go Back</span>
                </Button>
                <Button asChild className="flex items-center gap-2">
                    <Link href="/workspaces">
                        <LayoutGrid className="h-4 w-4" />
                        <span>Go to Workspaces</span>
                    </Link>
                </Button>
            </div>
        </div>
    )
}
