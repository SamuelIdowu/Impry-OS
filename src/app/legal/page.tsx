import Link from "next/link";
import {
    ShieldCheck,
    FileText,
    Lock,
    Cookie,
    ArrowRight,
    CheckCircle2,
    Scale,
    Key,
    Server,
    Mail,
    Download,
    ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const LEGAL_DOCS = [
    {
        title: "Terms of Service",
        href: "/terms",
        badge: "User & SaaS Agreement",
        lastUpdated: "August 2026",
        icon: Scale,
        description:
            "Defines your rights, acceptable use, billing rules, project scope snapshot ownership, and limitation of liability.",
        highlights: [
            "You retain 100% intellectual property of your client data & scopes",
            "Clear subscription & refund terms for Free and Pro tiers",
            "No hidden fees or unexpected rate escalations",
        ],
    },
    {
        title: "Privacy Policy",
        href: "/privacy",
        badge: "GDPR & CCPA Compliant",
        lastUpdated: "August 2026",
        icon: ShieldCheck,
        description:
            "Transparent disclosures on data collection, lawful bases, third-party sub-processors, and your international privacy rights.",
        highlights: [
            "We never sell, rent, or monetize your personal data",
            "Full data export and account deletion on demand",
            "Strict sub-processor standards (Postgres, Better Auth, Resend, Paddle)",
        ],
    },
    {
        title: "Cookie Policy",
        href: "/cookies",
        badge: "ePrivacy Directive",
        lastUpdated: "August 2026",
        icon: Cookie,
        description:
            "Details how session tokens, workspace preferences, and functional local storage are used to keep you logged in safely.",
        highlights: [
            "Zero third-party cross-site advertising trackers",
            "Essential session security via Better Auth tokens",
            "Step-by-step browser cookie management guide",
        ],
    },
    {
        title: "Security & DPA",
        href: "/security",
        badge: "Technical Measures",
        lastUpdated: "August 2026",
        icon: Lock,
        description:
            "Our security whitepaper, technical encryption specifications (TLS 1.3, AES-256), and Data Processing Agreement.",
        highlights: [
            "Multi-tenant isolation and strict Row Level Security",
            "Database backups and 99.9% uptime commitments",
            "Standard Contractual Clauses (SCCs) for cross-border processing",
        ],
    },
];

const COMPLIANCE_BADGES = [
    {
        title: "GDPR Compliant",
        desc: "Strict adherence to EU Regulation 2016/679 for data subject rights.",
        icon: CheckCircle2,
    },
    {
        title: "CCPA / CPRA Ready",
        desc: "California Consumer Privacy Act compliance with explicit 'Do Not Sell' assurances.",
        icon: CheckCircle2,
    },
    {
        title: "256-Bit TLS Encryption",
        desc: "All traffic encrypted in transit via TLS 1.3 and at rest via AES-256.",
        icon: Lock,
    },
    {
        title: "Sub-Processor Audits",
        desc: "Vetted cloud infrastructure providers adhering to ISO/SOC standards.",
        icon: Server,
    },
];

export default function LegalOverviewPage() {
    return (
        <div className="pb-24">
            {/* Hero Section */}
            <section className="relative pt-16 pb-14 px-4 sm:px-6 lg:px-8 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-gradient-to-b from-zinc-50/60 to-transparent dark:from-zinc-900/30">
                <div className="max-w-5xl mx-auto text-center space-y-5">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 shadow-xs">
                        <ShieldCheck className="h-4 w-4" />
                        <span>Trust, Transparency & Compliance</span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-display text-zinc-950 dark:text-white">
                        Legal & Trust Center
                    </h1>

                    <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto leading-relaxed">
                        Impry OS is designed to protect freelancer revenue with the highest standards of legal clarity, data privacy, and security compliance.
                    </p>
                </div>
            </section>

            {/* Compliance Guarantee Bar */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {COMPLIANCE_BADGES.map((badge, idx) => (
                        <div
                            key={idx}
                            className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex items-start gap-3"
                        >
                            <badge.icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                                <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                                    {badge.title}
                                </h3>
                                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">
                                    {badge.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Core Legal Documents Grid */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
                <div className="flex items-center justify-between pb-6 border-b border-zinc-200/80 dark:border-zinc-800/80 mb-8">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
                            Legal Documents & Policies
                        </h2>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                            Browse official agreements, technical disclosures, and data rights
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {LEGAL_DOCS.map((doc) => (
                        <div
                            key={doc.title}
                            className="group p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs hover:shadow-lg hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 flex flex-col justify-between"
                        >
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 group-hover:scale-105 transition-transform">
                                        <doc.icon className="h-6 w-6" />
                                    </div>
                                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                                        {doc.badge}
                                    </span>
                                </div>

                                <div className="space-y-1.5">
                                    <h3 className="text-xl font-bold text-zinc-950 dark:text-white">
                                        {doc.title}
                                    </h3>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                        Last Updated: {doc.lastUpdated}
                                    </p>
                                </div>

                                <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                                    {doc.description}
                                </p>

                                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/60 space-y-2">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
                                        Key Highlights:
                                    </span>
                                    <ul className="space-y-1.5">
                                        {doc.highlights.map((h, i) => (
                                            <li
                                                key={i}
                                                className="text-xs text-zinc-600 dark:text-zinc-400 flex items-start gap-2"
                                            >
                                                <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600 shrink-0 mt-1.5" />
                                                <span>{h}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="pt-6 mt-6 border-t border-zinc-100 dark:border-zinc-800/60">
                                <Link href={doc.href} className="block">
                                    <Button
                                        className="w-full justify-between bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 rounded-xl h-10 px-4 text-xs font-semibold shadow-xs"
                                    >
                                        <span>Read Full {doc.title}</span>
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Direct Inquiries & Contact Card */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
                <div className="p-8 sm:p-10 rounded-3xl bg-zinc-950 text-white dark:bg-zinc-900 dark:border dark:border-zinc-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-2 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                            <Mail className="h-4 w-4" />
                            <span>Legal & Compliance Office</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                            Have specific legal or data privacy questions?
                        </h2>
                        <p className="text-zinc-400 text-sm max-w-xl">
                            Our team is available to assist with custom Data Processing Agreements, security questionnaires, and compliance verifications.
                        </p>
                    </div>

                    <a href="mailto:legal@impryos.com">
                        <Button
                            size="lg"
                            className="bg-white text-zinc-950 hover:bg-zinc-100 font-semibold rounded-xl text-xs px-6 h-11 shrink-0"
                        >
                            Email Legal Counsel
                        </Button>
                    </a>
                </div>
            </section>
        </div>
    );
}
