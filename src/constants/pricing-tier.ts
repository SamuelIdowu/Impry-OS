export interface Tier {
  name: 'Starter' | 'Pro' | 'Advanced';
  id: 'starter' | 'pro' | 'advanced';
  description: string;
  features: string[];
  featured?: boolean;
  badge?: string;
  priceId: {
    month: string;
    year: string;
  };
}

export const PricingTier: Tier[] = [
  {
    name: 'Starter',
    id: 'starter',
    description: 'Perfect for getting started and exploring the platform.',
    featured: false,
    priceId: {
      month: process.env.NEXT_PUBLIC_PADDLE_STARTER_MONTHLY_PRICE_ID || 'pri_01m1595g7zrhxrva8d45r2dncz',
      year: process.env.NEXT_PUBLIC_PADDLE_STARTER_YEARLY_PRICE_ID || 'pri_01m1597w18aj9b4fnz9ybvqeqm',
    },
    features: [
      'Up to 3 Active Clients',
      'Up to 2 Projects',
      '5 Invoices per month',
      'Basic Scope of Work builder',
      'Client activity timeline',
      'Community Support',
    ],
  },
  {
    name: 'Pro',
    id: 'pro',
    description: 'Everything you need to run and scale a professional freelance business.',
    featured: true,
    badge: 'Most Popular',
    priceId: {
      month: process.env.NEXT_PUBLIC_PADDLE_PRO_MONTHLY_PRICE_ID || 'pri_01m158ypsmqr7dtwdcwk8qmf9x',
      year: process.env.NEXT_PUBLIC_PADDLE_PRO_YEARLY_PRICE_ID || 'pri_01m158yq3kqyzzdmvcnyfv1sn9',
    },
    features: [
      'Unlimited Clients',
      'Unlimited Projects & Milestones',
      'Unlimited Invoices & PDF Export',
      'Custom Brand Colors & Company Logo',
      'Full Scope Versioning & Public Share Links',
      'CSV Data Export & Detailed Reports',
      'Payment Reminders & Tracking',
      'Priority Email Support',
    ],
  },
  {
    name: 'Advanced',
    id: 'advanced',
    description: 'For growing studios, agencies, and high-volume independent collectives.',
    featured: false,
    badge: 'Agency & Studio',
    priceId: {
      month:
        process.env.NEXT_PUBLIC_PADDLE_ADVANCED_MONTHLY_PRICE_ID ||
        process.env.NEXT_PUBLIC_PADDLE_STUDIO_MONTHLY_PRICE_ID ||
        'pri_01m158yqrvk5d054tf4fkcp6ka',
      year:
        process.env.NEXT_PUBLIC_PADDLE_ADVANCED_YEARLY_PRICE_ID ||
        process.env.NEXT_PUBLIC_PADDLE_STUDIO_YEARLY_PRICE_ID ||
        'pri_01m158yr2hcxrbvvp5wf1r6drg',
    },
    features: [
      'Everything in Pro',
      'Up to 5 Team Members',
      'Role-based permissions (Owner, Admin, Member)',
      'Automated Email Notifications via Resend',
      'Advanced Calendar & Timeline Scheduling',
      'Dedicated Account Support',
      'Custom Integrations & API Access',
    ],
  },
];
