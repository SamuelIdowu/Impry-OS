import type { Metadata } from "next";
import { LegalHeader } from "@/components/legal/LegalHeader";
import { LegalDocumentViewer } from "@/components/legal/LegalDocumentViewer";
import { Footer } from "@/components/landing/Footer";
import { termsOfServiceData } from "@/lib/legal/terms-data";

export const metadata: Metadata = {
    title: "Terms of Service | Impry OS",
    description:
        "Official Terms of Service for Impry OS - Revenue Protection OS for Freelance Developers & Designers.",
};

export default function StandaloneTermsPage() {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <LegalHeader />
            <div className="flex-1">
                <LegalDocumentViewer {...termsOfServiceData} />
            </div>
            <Footer />
        </div>
    );
}
