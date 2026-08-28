import type { Metadata } from "next";
import { LegalDocumentViewer } from "@/components/legal/LegalDocumentViewer";
import { securityDpaData } from "@/lib/legal/security-data";

export const metadata: Metadata = {
    title: "Security & DPA",
    description:
        "Security Whitepaper and Data Processing Agreement (DPA) for Impry OS detailing encryption, multi-tenant isolation, and GDPR Article 28 terms.",
};

export default function SecurityPage() {
    return <LegalDocumentViewer {...securityDpaData} />;
}
