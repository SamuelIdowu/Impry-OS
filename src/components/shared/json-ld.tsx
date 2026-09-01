import React from 'react';

interface JsonLdProps {
  data: Record<string, any>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function generateSoftwareApplicationSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://impryos.com';

  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Impry OS',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Any (Web SaaS)',
    description:
      'Revenue protection operating system for freelancers and agencies with scope management, invoicing, automated follow-ups, and payment tracking.',
    url: baseUrl,
    offers: [
      {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        name: 'Starter / Free Plan',
        description: 'For getting started with core client and project management.',
      },
      {
        '@type': 'Offer',
        price: '19',
        priceCurrency: 'USD',
        name: 'Pro Plan',
        description: 'For active freelance professionals needing unlimited projects, invoices, and automated follow-ups.',
      },
      {
        '@type': 'Offer',
        price: '39',
        priceCurrency: 'USD',
        name: 'Studio Plan',
        description: 'For boutique agencies and multi-user freelance teams with workspace collaboration.',
      },
    ],
    publisher: {
      '@type': 'Organization',
      name: 'Impry OS',
      url: baseUrl,
      logo: `${baseUrl}/icon-32x32.png`,
    },
  };
}

export function generateOrganizationSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://impryos.com';

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Impry OS',
    url: baseUrl,
    logo: `${baseUrl}/icon-32x32.png`,
    sameAs: ['https://twitter.com/impryos'],
  };
}
