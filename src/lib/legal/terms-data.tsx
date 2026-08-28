import React from "react";
import { LegalDocumentProps } from "@/components/legal/LegalDocumentViewer";

export const termsOfServiceData: LegalDocumentProps = {
    title: "Terms of Service",
    badge: "User & Subscription Agreement",
    lastUpdated: "August 28, 2026",
    effectiveDate: "August 28, 2026",
    version: "2.4",
    description:
        "These Terms of Service govern your access to and use of Impry OS, including all software, client relationship tools, scope freeze engines, milestone invoicing, and related services.",
    highlights: [
        {
            title: "Your Data is 100% Yours",
            desc: "You retain full intellectual property and ownership over your clients, scopes, invoices, and project files.",
        },
        {
            title: "Transparent Billing",
            desc: "Clear Free Tier quotas (up to 3 clients) and straightforward Pro Tier subscription terms with no hidden lock-ins.",
        },
        {
            title: "Fair Use & Scope Defense",
            desc: "Public scope links and invoice viewers are provided for legitimate business communication between freelancers and clients.",
        },
    ],
    sections: [
        {
            id: "acceptance-of-terms",
            title: "1. Acceptance of Terms & Eligibility",
            summary: "By using Impry OS, you agree to these legally binding terms. You must be at least 18 years old.",
            content: (
                <div className="space-y-3">
                    <p>
                        By registering for, accessing, or using the Impry OS software-as-a-service platform ("Service", "Impry OS", "we", "us", or "our"), you ("User", "Customer", "you") confirm that you have read, understood, and agreed to be bound by these Terms of Service ("Terms").
                    </p>
                    <p>
                        If you are entering into these Terms on behalf of a company, agency, or other legal entity, you represent that you have the requisite authority to bind such entity. If you do not have such authority or do not agree with any part of these Terms, you must not access or use the Service.
                    </p>
                    <p>
                        You must be at least eighteen (18) years of age or the age of legal majority in your jurisdiction to create an account and utilize Impry OS.
                    </p>
                </div>
            ),
        },
        {
            id: "description-of-service",
            title: "2. Description of Impry OS Services",
            summary: "Impry OS is a revenue protection OS offering client management, follow-up automation, scope freezing, and milestone invoicing.",
            content: (
                <div className="space-y-3">
                    <p>
                        Impry OS provides independent software developers, UI/UX designers, creative freelancers, and small digital agencies with specialized tools to manage client relationships, safeguard project boundaries, and track payments.
                    </p>
                    <p>Core features include, but are not limited to:</p>
                    <ul className="list-disc pl-5 space-y-1.5">
                        <li><strong>The Follow-Up Guard:</strong> Automated and manual reminder tracking for client communications and pending payments.</li>
                        <li><strong>Scope Snapshot & Freeze Engine:</strong> Versioned, immutable project scope documentation with zero-auth public client viewing links.</li>
                        <li><strong>Milestone Invoicing & Billing:</strong> Milestone tracking, line-item invoice generators, and direct payment status recording.</li>
                        <li><strong>Project Timeline Feed:</strong> Chronological audit logs recording project activities, status changes, and notes.</li>
                        <li><strong>Financial Analytics:</strong> Revenue charts, pipeline funnels, and CSV data export capabilities.</li>
                    </ul>
                </div>
            ),
        },
        {
            id: "account-registration-security",
            title: "3. Accounts, Workspaces & Security",
            summary: "You are responsible for keeping your login credentials secure and for all actions within your workspaces.",
            content: (
                <div className="space-y-3">
                    <p>
                        To use Impry OS, you must register for an account using a valid email address and secure password, or through authorized third-party authentication providers (such as Google OAuth).
                    </p>
                    <p>
                        You agree to provide accurate, current, and complete registration information. You are solely responsible for maintaining the confidentiality of your credentials and for all activities that occur under your account and associated workspaces.
                    </p>
                    <p>
                        You must immediately notify Impry OS of any unauthorized access, security breach, or compromised credentials. We cannot and will not be liable for any loss or damage arising from your failure to maintain adequate credential security.
                    </p>
                </div>
            ),
        },
        {
            id: "subscription-billing-cancellation",
            title: "4. Subscription Tiers, Billing & Cancellation",
            summary: "Details on Free Tier limitations (3-client limit), Pro Tier recurring billing, refunds, and self-serve cancellation.",
            content: (
                <div className="space-y-3">
                    <p>
                        <strong>4.1 Subscription Plans:</strong> Impry OS is offered across multiple tiers:
                    </p>
                    <ul className="list-disc pl-5 space-y-1.5">
                        <li><strong>Free Tier:</strong> Includes core platform features capped at a maximum of three (3) active client profiles.</li>
                        <li><strong>Pro Tier:</strong> Monthly ($19/month) or Annual ($190/year) subscription offering unlimited clients, advanced team members, white-label branding, and priority support.</li>
                    </ul>
                    <p>
                        <strong>4.2 Payment Processing:</strong> Payments are securely processed through our Merchant of Record and payment gateway partners (including Paddle and Stripe). By subscribing to a paid tier, you authorize recurring billing to your designated payment method until cancelled.
                    </p>
                    <p>
                        <strong>4.3 Upgrades & Downgrades:</strong> Upgrades take effect immediately with pro-rated billing. Downgrades take effect at the conclusion of the current prepaid billing cycle.
                    </p>
                    <p>
                        <strong>4.4 Cancellation & Refunds:</strong> You may cancel your subscription at any time directly through the Workspace Settings. Unless required by applicable consumer law, subscription fees are non-refundable for partial billing periods once a cycle has commenced.
                    </p>
                </div>
            ),
        },
        {
            id: "intellectual-property-ownership",
            title: "5. Intellectual Property & Customer Content",
            summary: "You own 100% of your data and creative deliverables. Impry OS owns the platform, trademarks, and software code.",
            content: (
                <div className="space-y-3">
                    <p>
                        <strong>5.1 Your Content:</strong> You retain complete ownership, copyright, and intellectual property rights in all data, client lists, project files, scope descriptions, invoice line items, and materials uploaded or created by you on Impry OS ("Customer Content").
                    </p>
                    <p>
                        <strong>5.2 License to Host:</strong> You grant Impry OS a limited, worldwide, non-exclusive license strictly necessary to host, store, process, display, and transmit your Customer Content solely to provide and improve the Service to you.
                    </p>
                    <p>
                        <strong>5.3 Impry OS Property:</strong> The Impry OS software, user interface designs, logos, algorithms, and documentation are the exclusive intellectual property of Impry OS and its licensors. You may not copy, reverse engineer, decompile, or create derivative works of our software.
                    </p>
                </div>
            ),
        },
        {
            id: "scope-freezing-sharing",
            title: "6. Scope Snapshots & Public Sharing Disclaimers",
            summary: "Public share tokens allow clients to view read-only scopes and invoices. You control what you publish.",
            content: (
                <div className="space-y-3">
                    <p>
                        Impry OS allows users to generate public share tokens for Scope Snapshots (e.g., <code>/scope/share/[token]</code>) and Public Invoices (e.g., <code>/public/invoices/[id]</code>).
                    </p>
                    <p>
                        These links permit unauthenticated, read-only access to anyone holding the specific unique URL token. You are solely responsible for deciding what content to freeze and share with your external clients.
                    </p>
                    <p>
                        Scope Snapshots are intended as documentary clarity tools between freelancers and clients. Impry OS is not a formal legal escrow agent or dispute arbitration board; users remain responsible for enforcing their underlying client contracts.
                    </p>
                </div>
            ),
        },
        {
            id: "acceptable-use-conduct",
            title: "7. Acceptable Use Policy",
            summary: "Do not use Impry OS for illegal activities, spamming, malicious payload distribution, or system exploitation.",
            content: (
                <div className="space-y-3">
                    <p>When using Impry OS, you agree that you will NOT:</p>
                    <ul className="list-disc pl-5 space-y-1.5">
                        <li>Send unsolicited bulk emails, fraudulent invoices, or spam through the Resend email integration.</li>
                        <li>Upload malicious code, viruses, trojans, or attempt unauthorized penetration testing against our servers.</li>
                        <li>Attempt to bypass multi-tenant security, workspace boundaries, or Row Level Security (RLS) policies.</li>
                        <li>Use the platform to stalk, harass, or store sensitive personal data (e.g., health data, unencrypted credit cards).</li>
                        <li>Exceed API rate limits or deploy abusive scraping bots against the platform.</li>
                    </ul>
                    <p>
                        Violation of these standards may result in immediate suspension or permanent termination of your account without notice or refund.
                    </p>
                </div>
            ),
        },
        {
            id: "warranties-limitation-of-liability",
            title: "8. Disclaimers & Limitation of Liability",
            summary: "Impry OS is provided 'AS IS'. Our total liability is capped at the fees you paid us in the preceding 12 months.",
            content: (
                <div className="space-y-3">
                    <p>
                        <strong>8.1 Disclaimer of Warranties:</strong> THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
                    </p>
                    <p>
                        <strong>8.2 Limitation of Liability:</strong> TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL IMPRY OS, ITS DIRECTORS, EMPLOYEES, OR SUPPLIERS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES (INCLUDING LOSS OF PROFITS, DATA, OR BUSINESS REPUTATION) ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE SERVICE.
                    </p>
                    <p>
                        <strong>8.3 Aggregate Cap:</strong> IN NO EVENT SHALL OUR TOTAL AGGREGATE LIABILITY EXCEED THE TOTAL AMOUNT ACTUALLY PAID BY YOU TO IMPRY OS IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR ONE HUNDRED DOLLARS ($100 USD), WHICHEVER IS GREATER.
                    </p>
                </div>
            ),
        },
        {
            id: "indemnification",
            title: "9. Indemnification",
            summary: "You agree to hold Impry OS harmless from claims arising from your breach of terms or disputes with your clients.",
            content: (
                <div className="space-y-3">
                    <p>
                        You agree to defend, indemnify, and hold harmless Impry OS, its affiliates, licensors, officers, and employees from and against any third-party claims, liabilities, losses, damages, and expenses (including reasonable attorney fees) arising from:
                    </p>
                    <ul className="list-disc pl-5 space-y-1.5">
                        <li>Your breach of these Terms or violation of any applicable law.</li>
                        <li>Any disputes between you and your clients concerning deliverables, payments, scope changes, or contract breaches.</li>
                        <li>Any Customer Content uploaded by you that infringes on third-party intellectual property or privacy rights.</li>
                    </ul>
                </div>
            ),
        },
        {
            id: "governing-law-disputes",
            title: "10. Governing Law & Dispute Resolution",
            summary: "Disputes will be resolved through good-faith negotiation, followed by binding arbitration where applicable.",
            content: (
                <div className="space-y-3">
                    <p>
                        These Terms and any disputes related to Impry OS shall be governed by and construed in accordance with the laws of the applicable jurisdiction, without regard to conflict of law principles.
                    </p>
                    <p>
                        Before initiating formal legal proceedings, you and Impry OS agree to attempt to resolve any dispute informally for at least thirty (30) days by contacting our legal team at <a href="mailto:legal@impryos.com" className="underline font-medium">legal@impryos.com</a>.
                    </p>
                </div>
            ),
        },
        {
            id: "modifications-to-terms",
            title: "11. Modifications to Terms",
            summary: "We may update these terms periodically. Continued use after notice constitutes acceptance.",
            content: (
                <div className="space-y-3">
                    <p>
                        We reserve the right to modify these Terms at any time. When material updates occur, we will provide notice via in-app banner or email to your registered account address at least fourteen (14) days prior to the effective date.
                    </p>
                    <p>
                        Your continued use of Impry OS following the effective date of revised Terms constitutes your acceptance of the updated agreement.
                    </p>
                </div>
            ),
        },
        {
            id: "contact-information",
            title: "12. Contact Information",
            summary: "How to reach our legal and compliance department.",
            content: (
                <div className="space-y-3">
                    <p>If you have any questions or formal legal notices regarding these Terms, please contact us at:</p>
                    <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs space-y-1 font-mono">
                        <p><strong>Impry OS Legal & Compliance Office</strong></p>
                        <p>Email: legal@impryos.com</p>
                        <p>Support: support@impryos.com</p>
                        <p>Website: https://impryos.com/legal</p>
                    </div>
                </div>
            ),
        },
    ],
};
