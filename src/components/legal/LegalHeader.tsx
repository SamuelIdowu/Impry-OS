"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldCheck, Printer, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const LEGAL_NAV = [
    { title: "Overview", href: "/legal" },
    { title: "Terms of Service", href: "/terms" },
    { title: "Privacy Policy", href: "/privacy" },
    { title: "Cookie Policy", href: "/cookies" },
    { title: "Security & DPA", href: "/security" },
];

export function LegalHeader() {
    const pathname = usePathname();

    const handlePrint = () => {
        if (typeof window !== "undefined") {
            window.print();
        }
    };

    return (
        <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between gap-4">
                    {/* Left: Brand & Back to app */}
                    <div className="flex items-center gap-6">
                        <Link href="/" className="flex items-center gap-2 group">
                            <Logo textClassName="text-lg font-bold text-zinc-900 dark:text-zinc-100" />
                        </Link>
                        <div className="hidden sm:flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-600">
                            <span>/</span>
                            <span className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                Legal & Trust Center
                            </span>
                        </div>
                    </div>

                    {/* Right: Quick actions */}
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handlePrint}
                            className="hidden sm:inline-flex text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 gap-1.5 h-8 px-2.5"
                            title="Print or Save as PDF"
                        >
                            <Printer className="h-3.5 w-3.5" />
                            <span>Print / PDF</span>
                        </Button>
                        <Link href="/">
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-8 px-3 rounded-lg border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 gap-1.5"
                            >
                                <ArrowLeft className="h-3.5 w-3.5" />
                                <span>Back to Home</span>
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Subnav tab bar */}
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-2 -mb-px border-t border-zinc-100 dark:border-zinc-900">
                    {LEGAL_NAV.map((item) => {
                        const isActive =
                            item.href === "/legal"
                                ? pathname === "/legal"
                                : pathname === item.href || pathname === `/legal${item.href}`;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150 flex items-center gap-1.5",
                                    isActive
                                        ? "bg-zinc-900 text-white shadow-xs dark:bg-zinc-100 dark:text-zinc-900"
                                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/80 dark:hover:bg-zinc-900/60"
                                )}
                            >
                                <FileText className={cn("h-3 w-3", isActive ? "text-white dark:text-zinc-900" : "text-zinc-400")} />
                                <span>{item.title}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </header>
    );
}
