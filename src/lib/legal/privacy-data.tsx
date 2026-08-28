import React from "react";
import { LegalDocumentProps } from "@/components/legal/LegalDocumentViewer";

export const privacyPolicyData: LegalDocumentProps = {
    title: "Privacy Policy",
    badge: "GDPR, CCPA & International Compliance",
    lastUpdated: "August 28, 2026",
    effectiveDate: "August 28, 2026",
    version: "2.4",
    description:
        "This Privacy Policy explains how Impry OS collects, stores, processes, and protects personal information about you, your team, and your client metadata under GDPR, CCPA/CPRA, and global data privacy standards.",
    highlights: [
        {
            title: "Zero Data Selling",
            desc: "We do not sell, rent, or trade your personal data, client contacts, or invoice details to data brokers or advertisers.",
        },
        {
            title: "Granular Privacy Rights",
            desc: "Full support for GDPR Articles 15–22 (Access, Rectification, Erasure, Export) and California CCPA rights.",
        },
        {
            title: "Audited Sub-Processors",
            desc: "We only partner with industry-standard, SOC 2 compliant infrastructure providers (PostgreSQL, Better Auth, Resend, Paddle).",
        },
    ],
    sections: [
        {
            id: "introduction-scope",
            title: "1. Introduction & Overview",
            summary: "Impry OS acts as Data Controller for your user account, and Data Processor for client records you manage on our platform.",
            content: (
                <div className="space-y-3">
                    <p>
                        Impry OS ("we", "us", "our") is dedicated to safeguarding the privacy and security of your personal data. This Privacy Policy details our data collection practices when you visit our website, register for an account, and utilize the Impry OS software platform.
                    </p>
                    <p>
                        Under the European Union General Data Protection Regulation (GDPR) and UK Data Protection Act:
                    </p>
                    <ul className="list-disc pl-5 space-y-1.5">
                        <li><strong>Impry OS as Data Controller:</strong> We are the Data Controller for your account details, billing transactions, and technical telemetry collected to provide our service.</li>
                        <li><strong>Impry OS as Data Processor:</strong> For any client records, project scopes, or client contact info you store in your workspace, you are the Data Controller and Impry OS acts as your Data Processor.</li>
                    </ul>
                </div>
            ),
        },
        {
            id: "information-we-collect",
            title: "2. Information We Collect",
            summary: "We collect account details, workspace preferences, client metadata you provide, and anonymous telemetry.",
            content: (
                <div className="space-y-3">
                    <p>We collect information in the following categories:</p>
                    <div className="space-y-3 pt-1">
                        <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 text-xs">
                            <strong className="block text-zinc-900 dark:text-zinc-100 mb-1">A. Account & Registration Data</strong>
                            Name, email address, password hash (via Better Auth), profile avatar URL, company/studio name, and custom branding hex codes.
                        </div>
                        <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 text-xs">
                            <strong className="block text-zinc-900 dark:text-zinc-100 mb-1">B. Workspace & Business Data (Customer Input)</strong>
                            Client contact names, emails, phone numbers, addresses, project budgets, milestone deliverables, scope snapshot text, notes, and invoice amounts.
                        </div>
                        <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 text-xs">
                            <strong className="block text-zinc-900 dark:text-zinc-100 mb-1">C. Payment & Billing Details</strong>
                            Subscription plan status, transaction IDs, payment methods, and billing addresses (credit card numbers are processed directly by our Merchant of Record and never stored on Impry OS servers).
                        </div>
                        <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 text-xs">
                            <strong className="block text-zinc-900 dark:text-zinc-100 mb-1">D. Technical & Session Telemetry</strong>
                            IP address, browser user-agent, session cookies, timestamp logs, error reports, and operating system diagnostics.
                        </div>
                    </div>
                </div>
            ),
        },
        {
            id: "lawful-basis-processing",
            title: "3. Lawful Bases for Processing (GDPR Article 6)",
            summary: "We only process data when we have a legitimate legal ground under EU/UK law.",
            content: (
                <div className="space-y-3">
                    <p>We process personal data based on the following lawful bases:</p>
                    <ul className="list-disc pl-5 space-y-1.5">
                        <li><strong>Contractual Performance:</strong> Processing required to maintain your account, authenticate sessions, generate invoices, send reminders, and deliver the Impry OS service.</li>
                        <li><strong>Legitimate Interests:</strong> Improving platform performance, detecting fraudulent activity, preventing system abuse, and securing our multi-tenant architecture.</li>
                        <li><strong>Legal Obligations:</strong> Compliance with statutory tax reporting, financial accounting, and valid law enforcement inquiries.</li>
                        <li><strong>Consent:</strong> Where you explicitly opt in to optional marketing communications or specialized beta features (which you may withdraw at any time).</li>
                    </ul>
                </div>
            ),
        },
        {
            id: "how-we-use-information",
            title: "4. How We Use Your Information",
            summary: "Data is used strictly to power your workspace, deliver invoices, automate reminders, and secure the system.",
            content: (
                <div className="space-y-3">
                    <p>We use the personal information collected to:</p>
                    <ul className="list-disc pl-5 space-y-1.5">
                        <li>Authenticate and maintain secure multi-device sessions via Better Auth.</li>
                        <li>Calculate monthly revenue metrics, at-risk project alerts, and follow-up inbox items.</li>
                        <li>Deliver transactional emails, project updates, and client invoice notices via Resend.</li>
                        <li>Generate public read-only scope URLs and invoice documents for your clients.</li>
                        <li>Process subscription upgrades, renewals, and feature gate entitlements.</li>
                        <li>Provide technical support and diagnose system performance bottlenecks.</li>
                    </ul>
                </div>
            ),
        },
        {
            id: "sub-processors-data-sharing",
            title: "5. Third-Party Sub-Processors & Data Sharing",
            summary: "We partner with trusted cloud providers under strict Data Processing Agreements.",
            content: (
                <div className="space-y-3">
                    <p>
                        We do not sell personal data. We share data only with vetted third-party service providers ("Sub-Processors") strictly necessary to operate Impry OS:
                    </p>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                            <thead className="bg-zinc-100 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 font-semibold">
                                <tr>
                                    <th className="p-3 border-b">Sub-Processor</th>
                                    <th className="p-3 border-b">Purpose</th>
                                    <th className="p-3 border-b">Location</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                <tr>
                                    <td className="p-3 font-medium">PostgreSQL / Neon / Supabase</td>
                                    <td className="p-3 text-zinc-500 dark:text-zinc-400">Primary encrypted database hosting</td>
                                    <td className="p-3 text-zinc-500 dark:text-zinc-400">United States / EU</td>
                                </tr>
                                <tr>
                                    <td className="p-3 font-medium">Vercel Inc.</td>
                                    <td className="p-3 text-zinc-500 dark:text-zinc-400">Edge hosting, serverless computing & CDN</td>
                                    <td className="p-3 text-zinc-500 dark:text-zinc-400">Global Edge</td>
                                </tr>
                                <tr>
                                    <td className="p-3 font-medium">Resend Technologies</td>
                                    <td className="p-3 text-zinc-500 dark:text-zinc-400">Transactional email delivery & invoice dispatch</td>
                                    <td className="p-3 text-zinc-500 dark:text-zinc-400">United States</td>
                                </tr>
                                <tr>
                                    <td className="p-3 font-medium">Paddle.com / Stripe Inc.</td>
                                    <td className="p-3 text-zinc-500 dark:text-zinc-400">Payment processing, Merchant of Record & tax compliance</td>
                                    <td className="p-3 text-zinc-500 dark:text-zinc-400">UK / US</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            ),
        },
        {
            id: "international-transfers",
            title: "6. International Data Transfers",
            summary: "Data transfers outside the EEA/UK rely on Standard Contractual Clauses (SCCs) and encryption.",
            content: (
                <div className="space-y-3">
                    <p>
                        Your information may be transferred to and maintained on servers located outside of your state, province, or country. Where personal data originates in the European Economic Area (EEA) or UK and is transferred to jurisdictions without an adequacy decision, we implement standard contractual clauses (SCCs) approved by the European Commission to ensure equivalent data protection safeguards.
                    </p>
                </div>
            ),
        },
        {
            id: "data-retention-deletion",
            title: "7. Data Retention & Deletion",
            summary: "Data is retained while your account is active. When you delete your account, data is permanently erased.",
            content: (
                <div className="space-y-3">
                    <p>
                        We retain personal data for as long as your workspace account remains active or as required to fulfill legal, accounting, and tax compliance obligations.
                    </p>
                    <p>
                        When you delete your account via the Workspace Settings (Danger Zone), our system permanently removes your active user sessions, workspace memberships, and customer records from our primary production databases within thirty (30) days.
                    </p>
                </div>
            ),
        },
        {
            id: "your-privacy-rights",
            title: "8. Your Data Protection Rights",
            summary: "You have the right to access, rectify, download, and delete your data at any time.",
            content: (
                <div className="space-y-3">
                    <p>Depending on your location (e.g., GDPR, UK DPA, CCPA/CPRA), you have the following legal rights:</p>
                    <ul className="list-disc pl-5 space-y-1.5">
                        <li><strong>Right to Access:</strong> Request a copy of all personal data held about you.</li>
                        <li><strong>Right to Rectification:</strong> Correct inaccurate or incomplete account and profile records.</li>
                        <li><strong>Right to Erasure ("Right to be Forgotten"):</strong> Request complete deletion of your personal data.</li>
                        <li><strong>Right to Data Portability:</strong> Export your clients, projects, and invoices into standard machine-readable formats (CSV/JSON).</li>
                        <li><strong>Right to Restrict or Object to Processing:</strong> Object to processing based on legitimate interests.</li>
                        <li><strong>California Privacy Rights (CCPA/CPRA):</strong> We confirm that Impry OS does not sell personal information or share it for cross-context behavioral advertising.</li>
                    </ul>
                    <p>
                        To exercise any of these rights, email our Data Protection Officer at <a href="mailto:privacy@impryos.com" className="underline font-medium">privacy@impryos.com</a>. We respond to all verified requests within thirty (30) days.
                    </p>
                </div>
            ),
        },
        {
            id: "security-measures",
            title: "9. Security Safeguards",
            summary: "TLS 1.3 in-transit encryption, AES-256 at-rest encryption, and Row Level Security isolation.",
            content: (
                <div className="space-y-3">
                    <p>
                        We implement industry-standard technical and organizational measures to safeguard personal data, including:
                    </p>
                    <ul className="list-disc pl-5 space-y-1.5">
                        <li>Full TLS 1.3 encryption across all web traffic and API endpoints.</li>
                        <li>AES-256 database-level encryption at rest.</li>
                        <li>Row-Level Security (RLS) ensuring strict workspace isolation.</li>
                        <li>Argon2id and Bcrypt password hashing algorithms via Better Auth.</li>
                        <li>Multi-device session revocation triggers in settings.</li>
                    </ul>
                </div>
            ),
        },
        {
            id: "childrens-privacy",
            title: "10. Children's Privacy (COPPA)",
            summary: "Impry OS is intended strictly for adults 18+. We do not knowingly collect children's data.",
            content: (
                <div className="space-y-3">
                    <p>
                        Our Service is not directed to individuals under the age of eighteen (18). We do not knowingly collect personal information from minors. If we discover that a minor has provided us with personal information, we will take immediate steps to delete such data from our servers.
                    </p>
                </div>
            ),
        },
        {
            id: "privacy-contact",
            title: "11. Contact Our Data Protection Officer (DPO)",
            summary: "Direct contact channels for privacy inquiries and regulatory requests.",
            content: (
                <div className="space-y-3">
                    <p>For any questions, data subject access requests, or privacy concerns, please contact:</p>
                    <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs space-y-1 font-mono">
                        <p><strong>Impry OS Data Privacy & Protection Office</strong></p>
                        <p>Email: privacy@impryos.com</p>
                        <p>DPO Direct: dpo@impryos.com</p>
                        <p>Website: https://impryos.com/privacy</p>
                    </div>
                </div>
            ),
        },
    ],
};
