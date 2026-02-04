import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/dashboard/',
                    '/clients/',
                    '/projects/',
                    '/invoices/',
                    '/calendar/',
                    '/reports/',
                    '/settings/',
                    '/login',
                    '/register',
                    '/api/',
                ],
            },
        ],
        sitemap: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://impryos.com'}/sitemap.xml`,
    };
}
