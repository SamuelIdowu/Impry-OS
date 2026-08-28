import React from "react";
import { LegalDocumentProps } from "@/components/legal/LegalDocumentViewer";

export const securityDpaData: LegalDocumentProps = {
    title: "Security & Data Processing Agreement",
    badge: "Technical Measures & DPA",
    lastUpdated: "August 28, 2026",
    effectiveDate: "August 28, 2026",
    version: "2.4",
    description:
        "This document constitutes our Technical Security Whitepaper and Data Processing Agreement (DPA), outlining our encryption standards, multi-tenant isolation, disaster recovery, and GDPR Article 28 commitments.",
    highlights: [
        {
            title: "End-to-End TLS 1.3 & AES-256",
            desc: "All web traffic, API transactions, and database storage are encrypted using high-grade cryptography.",
        },
        {
            title: "Multi-Tenant Row Level Security",
            desc: "Hardware and database-level isolation guarantees that no workspace can ever query or leak another workspace's records.",
        },
        {
            title: "GDPR Article 28 Compliance",
            desc: "Full standard contractual clauses (SCCs) governing data processing on behalf of customers.",
        },
    ],
    sections: [
        {
            id: "security-overview",
            title: "1. Security Philosophy & Architecture",
            summary: "Security by design: zero-trust architecture, minimal attack surfaces, and strict tenant boundaries.",
            content: (
                <div className="space-y-3">
                    <p>
                        At Impry OS, safeguarding freelancer revenue and client data is our highest engineering priority. Our infrastructure is architected around the principles of <strong>Defense-in-Depth</strong>, <strong>Least Privilege</strong>, and <strong>Zero Trust</strong>.
                    </p>
                    <p>
                        We operate on modern serverless and managed database architectures provided by audited cloud providers with SOC 2 Type II, ISO 27001, and HIPAA-compliant facilities.
                    </p>
                </div>
            ),
        },
        {
            id: "data-encryption-standards",
            title: "2. Cryptography & Encryption Standards",
            summary: "TLS 1.3 for in-transit traffic, AES-256 for database storage, and Argon2id/Bcrypt for authentication credentials.",
            content: (
                <div className="space-y-3">
                    <p>We enforce modern cryptographic standards across the entire application lifecycle:</p>
                    <ul className="list-disc pl-5 space-y-1.5">
                        <li><strong>Encryption in Transit:</strong> All HTTP requests are strictly routed over HTTPS using TLS 1.3 with HSTS (HTTP Strict Transport Security) enabled. Insecure HTTP connections are automatically terminated.</li>
                        <li><strong>Encryption at Rest:</strong> PostgreSQL database disks, automated snapshots, and object storage volumes are encrypted using industry-standard AES-256 with managed KMS keys.</li>
                        <li><strong>Credential Hashing:</strong> User passwords are never stored in plaintext. Passwords are salted and hashed using compute-hard algorithms (Argon2id and Bcrypt) through Better Auth.</li>
                        <li><strong>Payment Tokenization:</strong> Credit card numbers are tokenized directly with PCI-DSS Level 1 certified processors (Paddle / Stripe). Impry OS never receives or stores raw cardholder data.</li>
                    </ul>
                </div>
            ),
        },
        {
            id: "multi-tenancy-isolation",
            title: "3. Multi-Tenant Isolation & Access Control",
            summary: "Database-level Row Level Security (RLS) and server authorization middleware prevent cross-tenant data leaks.",
            content: (
                <div className="space-y-3">
                    <p>
                        Impry OS utilizes strict logical multi-tenancy. Every request is verified through a multi-tier authorization gate:
                    </p>
                    <ul className="list-disc pl-5 space-y-1.5">
                        <li><strong>Server Middleware & withAuth Guard:</strong> Incoming Server Actions evaluate the user's session token and verify workspace membership (<code>verifyWorkspaceAccess</code>) before executing any business logic.</li>
                        <li><strong>Scoped Database Queries:</strong> All database operations are explicitly scoped by <code>workspace_id</code> and <code>user_id</code>.</li>
                        <li><strong>Role-Based Access Control (RBAC):</strong> Granular permissions enforce distinctions between Workspace Owners, Admins, and Members.</li>
                    </ul>
                </div>
            ),
        },
        {
            id: "vulnerability-management-incident-response",
            title: "4. Vulnerability Management & Incident Response",
            summary: "Continuous automated dependency scanning, automated backups, and 72-hour breach notification commitments.",
            content: (
                <div className="space-y-3">
                    <p>
                        <strong>4.1 Dependency & Code Auditing:</strong> Our CI/CD pipelines run continuous static analysis (SAST) and automated vulnerability auditing against all third-party npm packages.
                    </p>
                    <p>
                        <strong>4.2 Incident Response & Notification:</strong> In the unlikely event of a security incident impacting customer data, Impry OS will notify affected account holders within seventy-two (72) hours of confirmation, in compliance with GDPR Article 33.
                    </p>
                    <p>
                        <strong>4.3 Backups & Disaster Recovery:</strong> Automated rolling PostgreSQL database backups are taken continuously with point-in-time recovery (PITR) enabled across geo-redundant storage regions.
                    </p>
                </div>
            ),
        },
        {
            id: "data-processing-agreement-terms",
            title: "5. Data Processing Agreement (DPA)",
            summary: "Formal GDPR Article 28 terms governing our processing of client records on your behalf.",
            content: (
                <div className="space-y-3">
                    <p>
                        This Section constitutes the Data Processing Agreement ("DPA") between you (the "Data Controller") and Impry OS (the "Data Processor") regarding personal data processed through your use of the Service.
                    </p>
                    <p>
                        <strong>5.1 Scope & Purpose:</strong> The Data Processor shall process Personal Data solely on documented instructions from the Data Controller and exclusively for providing the Service.
                    </p>
                    <p>
                        <strong>5.2 Confidentiality:</strong> All personnel authorized to process personal data are bound by strict contractual confidentiality obligations.
                    </p>
                    <p>
                        <strong>5.3 Sub-Processors:</strong> The Data Controller provides general authorization for Impry OS to engage sub-processors (e.g., PostgreSQL hosting, Resend email dispatch, Vercel infrastructure) subject to equivalent data protection standards.
                    </p>
                    <p>
                        <strong>5.4 Assistance & Audits:</strong> Impry OS shall assist the Data Controller in fulfilling data subject access requests and provide necessary compliance certifications upon reasonable request.
                    </p>
                </div>
            ),
        },
        {
            id: "responsible-disclosure-bug-bounty",
            title: "6. Responsible Disclosure & Security Inquiries",
            summary: "Guidelines for reporting potential security vulnerabilities to our engineering team.",
            content: (
                <div className="space-y-3">
                    <p>
                        We welcome reports from security researchers. If you believe you have discovered a security vulnerability in Impry OS, please report it responsibly to <a href="mailto:security@impryos.com" className="underline font-medium">security@impryos.com</a> with detailed reproduction steps.
                    </p>
                    <p>
                        We commit to acknowledging all security disclosures within twenty-four (24) hours and will not pursue legal action against researchers acting in good faith under responsible disclosure guidelines.
                    </p>
                </div>
            ),
        },
    ],
};
