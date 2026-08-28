import type { Metadata } from "next";
import { LegalHeader } from "@/components/legal/LegalHeader";
import { LegalDocumentViewer } from "@/components/legal/LegalDocumentViewer";
import { Footer } from "@/components/landing/Footer";
import { securityDpaData } from "@/lib/legal/security-data";

export const metadata: Metadata = {
    title: "Security & Data Processing Agreement | Impry OS",
    description:
        "Official Security Whitepaper & Data Processing Agreement (DPA) for Impry OS covering encryption standards and multi-tenant security.",
};

export default function StandaloneSecurityPage() {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <LegalHeader />
            <div className="flex-1">
                <LegalDocumentViewer {...securityDpaData} />
            </div>
            <Footer />
        </div>
    );
}
