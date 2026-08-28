"use client";

import * as React from "react";
import Link from "next/link";
import {
    Calendar,
    CheckCircle2,
    Copy,
    Check,
    Search,
    Shield,
    Sparkles,
    ArrowUp,
    Download,
    HelpCircle,
    Info,
    ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface LegalSection {
    id: string;
    title: string;
    summary?: string;
    content: React.ReactNode;
}

export interface LegalDocumentProps {
    title: string;
    badge: string;
    lastUpdated: string;
    effectiveDate: string;
    version: string;
    description: string;
    highlights: { title: string; desc: string }[];
    sections: LegalSection[];
    contactEmail?: string;
}

export function LegalDocumentViewer({
    title,
    badge,
    lastUpdated,
    effectiveDate,
    version,
    description,
    highlights,
    sections,
    contactEmail = "legal@impryos.com",
}: LegalDocumentProps) {
    const [activeSection, setActiveSection] = React.useState<string>(sections[0]?.id || "");
    const [searchQuery, setSearchQuery] = React.useState("");
    const [copiedId, setCopiedId] = React.useState<string | null>(null);
    const [showBackToTop, setShowBackToTop] = React.useState(false);

    // Scroll spy for sticky table of contents
    React.useEffect(() => {
        const handleScroll = () => {
            setShowBackToTop(window.scrollY > 400);

            const scrollPosition = window.scrollY + 160;
            for (let i = sections.length - 1; i >= 0; i--) {
                const section = document.getElementById(sections[i].id);
                if (section && section.offsetTop <= scrollPosition) {
                    setActiveSection(sections[i].id);
                    break;
                }
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [sections]);

    const handleCopyLink = (id: string) => {
        if (typeof window !== "undefined") {
            const url = `${window.location.origin}${window.location.pathname}#${id}`;
            navigator.clipboard.writeText(url);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        }
    };

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const yOffset = -100;
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: "smooth" });
        }
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const filteredSections = React.useMemo(() => {
        if (!searchQuery.trim()) return sections;
        const query = searchQuery.toLowerCase();
        return sections.filter(
            (sec) =>
                sec.title.toLowerCase().includes(query) ||
                sec.summary?.toLowerCase().includes(query)
        );
    }, [sections, searchQuery]);

    return (
        <div className="min-h-screen pb-24 text-zinc-900 dark:text-zinc-100">
            {/* Hero Header Section */}
            <section className="relative pt-12 pb-10 px-4 sm:px-6 lg:px-8 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-gradient-to-b from-zinc-50/70 to-transparent dark:from-zinc-900/30">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6">
                        <div className="max-w-3xl space-y-4">
                            <div className="flex flex-wrap items-center gap-2.5">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                                    <Shield className="h-3 w-3" />
                                    {badge}
                                </span>
                                <span className="text-xs font-mono px-2.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                                    v{version}
                                </span>
                                <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                                    <Calendar className="h-3.5 w-3.5" />
                                    Effective: {effectiveDate}
                                </span>
                            </div>

                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-display text-zinc-950 dark:text-white">
                                {title}
                            </h1>

                            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-2xl">
                                {description}
                            </p>
                        </div>

                        {/* Search in Document */}
                        <div className="w-full lg:w-72">
                            <div className="relative">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                <input
                                    type="text"
                                    placeholder="Search this document..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9.5 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 shadow-xs"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Executive Summary / Key Highlights Bar */}
                    {highlights && highlights.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-zinc-200/60 dark:border-zinc-800/60 grid grid-cols-1 md:grid-cols-3 gap-4">
                            {highlights.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="p-4 rounded-2xl bg-white/70 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex flex-col gap-1.5"
                                >
                                    <div className="flex items-center gap-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                                        <Sparkles className="h-3.5 w-3.5 text-zinc-900 dark:text-zinc-100" />
                                        <span>{item.title}</span>
                                    </div>
                                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Document Content & Sticky Sidebar Navigation */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Sticky Table of Contents (Desktop) */}
                    <aside className="hidden lg:block lg:col-span-4 sticky top-28 h-[calc(100vh-8rem)] overflow-y-auto pr-4 no-scrollbar">
                        <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/80 space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-zinc-200/80 dark:border-zinc-800/80">
                                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-mono">
                                    Table of Contents
                                </span>
                                <span className="text-[11px] text-zinc-400">
                                    {sections.length} Sections
                                </span>
                            </div>

                            <nav className="space-y-1">
                                {sections.map((section, idx) => {
                                    const isActive = activeSection === section.id;
                                    return (
                                        <button
                                            key={section.id}
                                            onClick={() => scrollToSection(section.id)}
                                            className={cn(
                                                "w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 flex items-start gap-2.5 group",
                                                isActive
                                                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                                                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    "font-mono text-[11px] shrink-0 mt-0.5",
                                                    isActive
                                                        ? "text-zinc-300 dark:text-zinc-600 font-bold"
                                                        : "text-zinc-400"
                                                )}
                                            >
                                                {(idx + 1).toString().padStart(2, "0")}.
                                            </span>
                                            <span className="line-clamp-1">{section.title}</span>
                                        </button>
                                    );
                                })}
                            </nav>

                            <div className="pt-3 border-t border-zinc-200/80 dark:border-zinc-800/80 text-[11px] text-zinc-500 dark:text-zinc-400">
                                Questions? Contact{" "}
                                <a
                                    href={`mailto:${contactEmail}`}
                                    className="underline font-medium text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white"
                                >
                                    {contactEmail}
                                </a>
                            </div>
                        </div>
                    </aside>

                    {/* Main Legal Clauses Stream */}
                    <main className="lg:col-span-8 space-y-12 max-w-3xl">
                        {filteredSections.length === 0 ? (
                            <div className="p-12 text-center rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                                <Search className="h-8 w-8 mx-auto text-zinc-400 mb-3" />
                                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                    No clauses found
                                </h3>
                                <p className="text-xs text-zinc-500 mt-1">
                                    No clauses matched your query "{searchQuery}". Try another keyword.
                                </p>
                            </div>
                        ) : (
                            filteredSections.map((section, idx) => (
                                <article
                                    key={section.id}
                                    id={section.id}
                                    className="group relative scroll-mt-28 p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs hover:shadow-md transition-all duration-200"
                                >
                                    {/* Section Header */}
                                    <div className="flex items-start justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800/60 mb-6">
                                        <div className="space-y-1">
                                            <span className="text-xs font-mono font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                                                Section {(idx + 1).toString().padStart(2, "0")}
                                            </span>
                                            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
                                                {section.title}
                                            </h2>
                                        </div>

                                        <button
                                            onClick={() => handleCopyLink(section.id)}
                                            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                            title="Copy link to this section"
                                        >
                                            {copiedId === section.id ? (
                                                <Check className="h-4 w-4 text-emerald-600" />
                                            ) : (
                                                <Copy className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>

                                    {/* Plain English Summary Box */}
                                    {section.summary && (
                                        <div className="mb-6 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-800/60 flex items-start gap-3">
                                            <Info className="h-4 w-4 text-zinc-700 dark:text-zinc-300 shrink-0 mt-0.5" />
                                            <div className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                                                <span className="font-semibold text-zinc-900 dark:text-zinc-200 block mb-0.5">
                                                    Plain English Summary:
                                                </span>
                                                {section.summary}
                                            </div>
                                        </div>
                                    )}

                                    {/* Formal Legal Clause Content */}
                                    <div className="prose prose-zinc dark:prose-invert max-w-none text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 space-y-4">
                                        {section.content}
                                    </div>
                                </article>
                            ))
                        )}

                        {/* Regulatory Legal Disclaimer */}
                        <div className="p-6 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-3.5">
                            <HelpCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className="font-semibold">Legal Notice & Disclaimer</p>
                                <p className="leading-relaxed opacity-90">
                                    This document is structured to provide clear, binding terms and regulatory transparency under applicable laws (including GDPR, CCPA/CPRA, and ePrivacy Directives). If you have specific jurisdictional inquiries or require enterprise custom MSAs/DPAs, contact{" "}
                                    <a href={`mailto:${contactEmail}`} className="underline font-semibold">
                                        {contactEmail}
                                    </a>
                                    .
                                </p>
                            </div>
                        </div>
                    </main>
                </div>
            </div>

            {/* Back to Top Floating Button */}
            {showBackToTop && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-6 right-6 p-3 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-lg hover:scale-105 active:scale-95 transition-all z-30 group"
                    title="Back to top"
                >
                    <ArrowUp className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}
