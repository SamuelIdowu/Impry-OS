import { generatePageMetadata } from "@/lib/metadata-config";
import type { Metadata } from "next";

export const metadata: Metadata = generatePageMetadata({
    title: "Pricing",
    description: "Simple, transparent pricing for freelancers. Choose the plan that fits your needs and start protecting your revenue today.",
    path: "/pricing",
    keywords: ["pricing", "freelancer pricing", "subscription plans", "freelance tools pricing"],
});

export default function PricingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
