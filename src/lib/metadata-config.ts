import type { Metadata } from "next";

/**
 * Centralized metadata configuration for Impry OS
 * This file contains all default metadata values and helper functions
 */

// Base URL - update this with your production domain
export const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://impryos.com";

// Default metadata values
export const DEFAULT_TITLE = "Impry OS - Revenue Protection for Freelancers";
export const DEFAULT_DESCRIPTION =
    "Help freelance developers and designers avoid losing money, time, and clients with a lightweight system that enforces follow-ups, protects scope, tracks payments, and preserves client context.";

export const SITE_NAME = "Impry OS";
export const TWITTER_HANDLE = "@impryos"; // Update with actual Twitter handle

// OG Image configuration
export const OG_IMAGE = {
    url: "/og-image.png",
    width: 1200,
    height: 600,
    alt: "Impry OS - Revenue Protection for Freelancers",
    type: "image/png" as const,
};

// Default keywords
export const DEFAULT_KEYWORDS = [
    "freelancer tools",
    "client management",
    "payment tracking",
    "scope management",
    "freelance CRM",
    "revenue protection",
    "follow-up reminders",
    "project management",
    "freelance developers",
    "freelance designers",
];

/**
 * Generate default metadata for the application
 */
export const defaultMetadata: Metadata = {
    metadataBase: new URL(BASE_URL),
    title: {
        default: DEFAULT_TITLE,
        template: "%s | Impry OS",
    },
    description: DEFAULT_DESCRIPTION,
    keywords: DEFAULT_KEYWORDS,
    authors: [{ name: "Impry OS" }],
    creator: "Impry OS",
    publisher: "Impry OS",

    // Open Graph
    openGraph: {
        type: "website",
        locale: "en_US",
        url: BASE_URL,
        siteName: SITE_NAME,
        title: DEFAULT_TITLE,
        description: DEFAULT_DESCRIPTION,
        images: [OG_IMAGE],
    },

    // Twitter
    twitter: {
        card: "summary_large_image",
        title: DEFAULT_TITLE,
        description: DEFAULT_DESCRIPTION,
        images: [OG_IMAGE.url],
        creator: TWITTER_HANDLE,
        site: TWITTER_HANDLE,
    },

    // Icons
    icons: {
        icon: [
            { url: "/favicon.ico" },
            { url: "/icon-16x16.png", sizes: "16x16", type: "image/png" },
            { url: "/icon-32x32.png", sizes: "32x32", type: "image/png" },
        ],
        apple: [
            { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
        ],
    },

    // Robots
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
};

/**
 * Generate metadata for a specific page
 */
export function generatePageMetadata({
    title,
    description,
    path = "",
    keywords,
    noIndex = false,
    ogImage,
}: {
    title: string;
    description?: string;
    path?: string;
    keywords?: string[];
    noIndex?: boolean;
    ogImage?: typeof OG_IMAGE;
}): Metadata {
    const url = `${BASE_URL}${path}`;
    const pageDescription = description || DEFAULT_DESCRIPTION;
    const pageKeywords = keywords || DEFAULT_KEYWORDS;
    const image = ogImage || OG_IMAGE;

    return {
        title,
        description: pageDescription,
        keywords: pageKeywords,

        openGraph: {
            title,
            description: pageDescription,
            url,
            siteName: SITE_NAME,
            images: [image],
            type: "website",
            locale: "en_US",
        },

        twitter: {
            card: "summary_large_image",
            title,
            description: pageDescription,
            images: [image.url],
            creator: TWITTER_HANDLE,
            site: TWITTER_HANDLE,
        },

        robots: noIndex
            ? {
                index: false,
                follow: false,
            }
            : undefined,
    };
}

/**
 * Generate metadata for private/authenticated pages
 */
export function generatePrivatePageMetadata(title: string): Metadata {
    return {
        title,
        robots: {
            index: false,
            follow: false,
        },
    };
}

/**
 * Generate dynamic metadata for pages with user-generated content
 */
export function generateDynamicMetadata({
    title,
    description,
    noIndex = true,
}: {
    title: string;
    description?: string;
    noIndex?: boolean;
}): Metadata {
    return {
        title,
        description: description || DEFAULT_DESCRIPTION,
        robots: {
            index: !noIndex,
            follow: !noIndex,
        },
    };
}
