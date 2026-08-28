import type { Metadata } from "next";
import { LegalDocumentViewer } from "@/components/legal/LegalDocumentViewer";
import { securityDpaData } from "@/lib/legal/security-data";

export const metadata: Metadata = {
    title: "Data Processing Agreement (DPA)",
    description:
        "Official Data Processing Agreement (DPA) and Standard Contractual Clauses for Impry OS.",
};

export default function DpaPage() {
    return <LegalDocumentViewer {...securityDpaData} />;
}
