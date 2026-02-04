import { generatePrivatePageMetadata } from "@/lib/metadata-config";
import type { Metadata } from "next";

export const metadata: Metadata = generatePrivatePageMetadata("Sign In");

export default function LoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
