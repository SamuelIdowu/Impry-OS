import { generatePrivatePageMetadata } from "@/lib/metadata-config";
import type { Metadata } from "next";

export const metadata: Metadata = generatePrivatePageMetadata("Get Started");

export default function RegisterLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
