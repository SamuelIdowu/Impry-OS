import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://impryos.com';

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/workspaces/',
                    '/workspaces',
                    '/*-*-*-*/*', // Dynamic UUID workspace paths
                    '/api/',
                    '/login',
                    '/register',
                    '/forgot-password',
                    '/reset-password',
                    '/verify-email',
                ],
            },
            {
                userAgent: ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended', 'Amazonbot'],
                allow: ['/', '/pricing', '/legal', '/terms', '/privacy', '/cookies', '/security'],
                disallow: ['/api/', '/workspaces/', '/*-*-*-*/*'],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
