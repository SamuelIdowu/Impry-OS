import type { Metadata } from "next";
import { LegalDocumentViewer } from "@/components/legal/LegalDocumentViewer";
import { privacyPolicyData } from "@/lib/legal/privacy-data";

export const metadata: Metadata = {
    title: "Privacy Policy",
    description:
        "Privacy Policy for Impry OS detailing GDPR, CCPA/CPRA, data processing, and international privacy protections.",
};

export default function PrivacyPage() {
    return <LegalDocumentViewer {...privacyPolicyData} />;
}
