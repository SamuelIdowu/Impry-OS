import type { Metadata } from "next";
import { LegalHeader } from "@/components/legal/LegalHeader";
import { LegalDocumentViewer } from "@/components/legal/LegalDocumentViewer";
import { Footer } from "@/components/landing/Footer";
import { cookiePolicyData } from "@/lib/legal/cookies-data";

export const metadata: Metadata = {
    title: "Cookie Policy | Impry OS",
    description:
        "Official Cookie Policy for Impry OS covering session cookies, functional preferences, and ePrivacy compliance.",
};

export default function StandaloneCookiesPage() {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <LegalHeader />
            <div className="flex-1">
                <LegalDocumentViewer {...cookiePolicyData} />
            </div>
            <Footer />
        </div>
    );
}
