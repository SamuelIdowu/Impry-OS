import type { Metadata } from "next";
import { LegalHeader } from "@/components/legal/LegalHeader";
import { LegalDocumentViewer } from "@/components/legal/LegalDocumentViewer";
import { Footer } from "@/components/landing/Footer";
import { privacyPolicyData } from "@/lib/legal/privacy-data";

export const metadata: Metadata = {
    title: "Privacy Policy | Impry OS",
    description:
        "Official Privacy Policy for Impry OS covering GDPR, CCPA/CPRA, data processing, and user privacy rights.",
};

export default function StandalonePrivacyPage() {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <LegalHeader />
            <div className="flex-1">
                <LegalDocumentViewer {...privacyPolicyData} />
            </div>
            <Footer />
        </div>
    );
}
