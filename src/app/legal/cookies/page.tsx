import type { Metadata } from "next";
import { LegalDocumentViewer } from "@/components/legal/LegalDocumentViewer";
import { cookiePolicyData } from "@/lib/legal/cookies-data";

export const metadata: Metadata = {
    title: "Cookie Policy",
    description:
        "Cookie Policy for Impry OS detailing session management, local storage usage, and ePrivacy compliance.",
};

export default function CookiesPage() {
    return <LegalDocumentViewer {...cookiePolicyData} />;
}
