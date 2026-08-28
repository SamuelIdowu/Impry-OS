import React from "react";
import { LegalDocumentProps } from "@/components/legal/LegalDocumentViewer";

export const cookiePolicyData: LegalDocumentProps = {
    title: "Cookie Policy",
    badge: "ePrivacy & Cookie Compliance",
    lastUpdated: "August 28, 2026",
    effectiveDate: "August 28, 2026",
    version: "2.4",
    description:
        "This Cookie Policy explains what cookies and local storage tokens are, how Impry OS uses them for secure authentication and workspace preferences, and how you can control them.",
    highlights: [
        {
            title: "No Cross-Site Ad Trackers",
            desc: "Impry OS does not use invasive third-party behavioral advertising cookies.",
        },
        {
            title: "Essential Session Security",
            desc: "Cookies are primarily used to keep you securely signed in (Better Auth session tokens).",
        },
        {
            title: "Full User Control",
            desc: "Easily manage, inspect, or delete cookies directly through your browser preferences.",
        },
    ],
    sections: [
        {
            id: "what-are-cookies",
            title: "1. What Are Cookies & Local Storage?",
            summary: "Cookies and local storage are small data files stored on your device to keep you logged in and remember settings.",
            content: (
                <div className="space-y-3">
                    <p>
                        Cookies are small text files placed on your computer, tablet, or mobile device by websites that you visit. They are widely used to make websites function efficiently, enhance user experience, and provide secure authentication.
                    </p>
                    <p>
                        In addition to traditional HTTP cookies, Impry OS may use HTML5 Local Storage and Session Storage to cache user interface preferences (such as collapsed sidebar state or active tab selections) directly in your browser.
                    </p>
                </div>
            ),
        },
        {
            id: "categories-of-cookies",
            title: "2. Categories of Cookies We Use",
            summary: "We only use strictly necessary authentication cookies and functional UI preference cookies.",
            content: (
                <div className="space-y-3">
                    <p>We classify the cookies used on Impry OS into the following categories:</p>
                    <div className="space-y-3 pt-1">
                        <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 text-xs">
                            <strong className="block text-zinc-900 dark:text-zinc-100 mb-1">A. Strictly Necessary & Security Cookies (Mandatory)</strong>
                            <p className="text-zinc-600 dark:text-zinc-400 mb-2">
                                These cookies are essential for you to navigate the platform and use secure features such as user authentication and CSRF protection. Without these cookies, services like logging into your workspace cannot function.
                            </p>
                            <div className="font-mono text-[11px] bg-white dark:bg-zinc-900 p-2 rounded-lg border border-zinc-200 dark:border-zinc-700">
                                <code>better-auth.session_token</code> • <code>__Secure-better-auth.session_token</code> (Session authentication)
                            </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 text-xs">
                            <strong className="block text-zinc-900 dark:text-zinc-100 mb-1">B. Functional & Preference Cookies</strong>
                            <p className="text-zinc-600 dark:text-zinc-400 mb-2">
                                These cookies allow the platform to remember choices you make (such as dark/light theme mode, expanded sidebar state, or active workspace ID) to provide a tailored experience.
                            </p>
                            <div className="font-mono text-[11px] bg-white dark:bg-zinc-900 p-2 rounded-lg border border-zinc-200 dark:border-zinc-700">
                                <code>impry_theme</code> • <code>impry_active_workspace</code> • <code>sidebar_state</code>
                            </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 text-xs">
                            <strong className="block text-zinc-900 dark:text-zinc-100 mb-1">C. Performance & Diagnostic Telemetry</strong>
                            <p className="text-zinc-600 dark:text-zinc-400">
                                Anonymous performance cookies that help us monitor page load times, API latency, and application error logs. These cookies do not identify you personally.
                            </p>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            id: "cookies-table",
            title: "3. Detailed Cookie Inventory",
            summary: "A complete technical breakdown of cookies set by the Impry OS platform.",
            content: (
                <div className="space-y-3">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                            <thead className="bg-zinc-100 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 font-semibold">
                                <tr>
                                    <th className="p-3 border-b">Cookie Name</th>
                                    <th className="p-3 border-b">Type</th>
                                    <th className="p-3 border-b">Duration</th>
                                    <th className="p-3 border-b">Purpose</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                <tr>
                                    <td className="p-3 font-mono font-medium">better-auth.session_token</td>
                                    <td className="p-3">Strictly Necessary</td>
                                    <td className="p-3 text-zinc-500">7 to 30 Days</td>
                                    <td className="p-3 text-zinc-500">Authenticates active user session across requests</td>
                                </tr>
                                <tr>
                                    <td className="p-3 font-mono font-medium">__Secure-better-auth.session_token</td>
                                    <td className="p-3">Strictly Necessary</td>
                                    <td className="p-3 text-zinc-500">7 to 30 Days</td>
                                    <td className="p-3 text-zinc-500">Secure HTTPS-only auth token for production environment</td>
                                </tr>
                                <tr>
                                    <td className="p-3 font-mono font-medium">x-workspace-id</td>
                                    <td className="p-3">Functional</td>
                                    <td className="p-3 text-zinc-500">Session</td>
                                    <td className="p-3 text-zinc-500">Maintains active workspace context across page navigation</td>
                                </tr>
                                <tr>
                                    <td className="p-3 font-mono font-medium">theme</td>
                                    <td className="p-3">Preferences</td>
                                    <td className="p-3 text-zinc-500">1 Year</td>
                                    <td className="p-3 text-zinc-500">Persists Dark Mode vs Light Mode visual preference</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            ),
        },
        {
            id: "managing-cookies",
            title: "4. How to Manage & Disable Cookies",
            summary: "You can configure your browser to reject cookies, though this may impact your ability to remain logged in.",
            content: (
                <div className="space-y-3">
                    <p>
                        Most web browsers automatically accept cookies by default, but you can modify your browser settings to decline cookies or notify you when a cookie is set.
                    </p>
                    <p>
                        Please note that disabling strictly necessary cookies will prevent you from signing in to your Impry OS account or accessing your workspaces.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                        <a
                            href="https://support.google.com/chrome/answer/95647"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors flex items-center justify-between"
                        >
                            <span>Google Chrome Cookie Settings</span>
                            <span className="text-zinc-400">&rarr;</span>
                        </a>
                        <a
                            href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors flex items-center justify-between"
                        >
                            <span>Apple Safari Cookie Settings</span>
                            <span className="text-zinc-400">&rarr;</span>
                        </a>
                        <a
                            href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors flex items-center justify-between"
                        >
                            <span>Mozilla Firefox Cookie Settings</span>
                            <span className="text-zinc-400">&rarr;</span>
                        </a>
                        <a
                            href="https://support.microsoft.com/en-us/windows/microsoft-edge-browsing-data-and-privacy-bb8174ba-9d73-dcf2-9b4a-9c082b6c84a0"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors flex items-center justify-between"
                        >
                            <span>Microsoft Edge Cookie Settings</span>
                            <span className="text-zinc-400">&rarr;</span>
                        </a>
                    </div>
                </div>
            ),
        },
        {
            id: "updates-cookie-policy",
            title: "5. Updates to this Policy & Contact",
            summary: "Periodic reviews of our cookie inventory and contact information.",
            content: (
                <div className="space-y-3">
                    <p>
                        We may update this Cookie Policy from time to time to reflect changes in the cookies we use or for legal and regulatory compliance reasons.
                    </p>
                    <p>
                        For any questions regarding our use of cookies and tracking technologies, email us at <a href="mailto:privacy@impryos.com" className="underline font-medium">privacy@impryos.com</a>.
                    </p>
                </div>
            ),
        },
    ],
};
