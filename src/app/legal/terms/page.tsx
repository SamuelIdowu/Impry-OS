import type { Metadata } from "next";
import { LegalDocumentViewer } from "@/components/legal/LegalDocumentViewer";
import { termsOfServiceData } from "@/lib/legal/terms-data";

export const metadata: Metadata = {
    title: "Terms of Service",
    description:
        "Terms of Service governing the use of Impry OS, freelancer rights, client scope snapshots, and subscription billing.",
};

export default function TermsPage() {
    return <LegalDocumentViewer {...termsOfServiceData} />;
}
