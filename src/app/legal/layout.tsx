import type { Metadata } from "next";
import { LegalHeader } from "@/components/legal/LegalHeader";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
    title: {
        template: "%s | Impry OS Legal Center",
        default: "Legal & Trust Center | Impry OS",
    },
    description:
        "Official legal documents, Terms of Service, Privacy Policy, Cookie Policy, and Security disclosures for Impry OS.",
};

export default function LegalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col bg-background selection:bg-zinc-900 selection:text-white dark:selection:bg-zinc-100 dark:selection:text-zinc-900">
            {/* Subtle background ambient mesh */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute -top-[15%] left-[10%] w-[45%] h-[45%] rounded-full bg-zinc-200/40 dark:bg-zinc-800/20 blur-[130px]" />
                <div className="absolute top-[40%] -right-[15%] w-[40%] h-[40%] rounded-full bg-zinc-100/50 dark:bg-zinc-800/15 blur-[120px]" />
            </div>

            <LegalHeader />

            <div className="flex-1 relative z-10">
                {children}
            </div>

            <Footer />
        </div>
    );
}
