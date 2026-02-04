import { generatePrivatePageMetadata } from "@/lib/metadata-config";
import type { Metadata } from "next";

export const metadata: Metadata = generatePrivatePageMetadata("Dashboard");

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
