import { PlanConfig, PlanTier } from './types';

export const PLANS: Record<PlanTier, PlanConfig> = {
  free: {
    id: 'free',
    name: 'Free Starter',
    description: 'Essential tools for solo freelancers starting their client journey.',
    priceMonthly: 0,
    priceYearly: 0,
    features: [
      'Up to 3 Active Clients',
      'Up to 2 Projects',
      '5 Invoices per month',
      'Basic Scope of Work builder',
      'Client activity timeline',
      'Community Support',
    ],
    limits: {
      clients: 3,
      projects: 2,
      invoicesPerMonth: 5,
      customBranding: false,
      teamMembers: 1,
      csvExport: false,
      prioritySupport: false,
    },
  },
  pro: {
    id: 'pro',
    name: 'Freelancer Pro',
    description: 'Everything you need to run and scale a professional freelance business.',
    priceMonthly: 19,
    priceYearly: 190, // Save 2 months
    features: [
      'Unlimited Clients',
      'Unlimited Projects & Milestones',
      'Unlimited Invoices & PDF Export',
      'Custom Brand Colors & Company Logo',
      'Full Scope Versioning & Public Share Links',
      'CSV Data Export & Detailed Reports',
      'Payment Reminders & Tracking',
    ],
    limits: {
      clients: 'unlimited',
      projects: 'unlimited',
      invoicesPerMonth: 'unlimited',
      customBranding: true,
      teamMembers: 1,
      csvExport: true,
      prioritySupport: true,
    },
    productIds: {
      dodo: {
        monthly: process.env.DODO_PRO_MONTHLY_PRODUCT_ID || 'p_pro_monthly',
        yearly: process.env.DODO_PRO_YEARLY_PRODUCT_ID || 'p_pro_yearly',
      },
      polar: {
        monthly: process.env.POLAR_PRO_MONTHLY_PRODUCT_ID,
        yearly: process.env.POLAR_PRO_YEARLY_PRODUCT_ID,
      },
    },
  },
  studio: {
    id: 'studio',
    name: 'Studio & Agency',
    description: 'For growing studios, agencies, and high-volume independent collectives.',
    priceMonthly: 49,
    priceYearly: 490,
    features: [
      'Everything in Pro',
      'Up to 5 Team Members',
      'Role-based permissions (Owner, Admin, Member)',
      'Automated Email Notifications via Resend',
      'Advanced Calendar & Timeline Scheduling',
      'Dedicated Priority Support',
    ],
    limits: {
      clients: 'unlimited',
      projects: 'unlimited',
      invoicesPerMonth: 'unlimited',
      customBranding: true,
      teamMembers: 5,
      csvExport: true,
      prioritySupport: true,
    },
    productIds: {
      dodo: {
        monthly: process.env.DODO_STUDIO_MONTHLY_PRODUCT_ID || 'p_studio_monthly',
        yearly: process.env.DODO_STUDIO_YEARLY_PRODUCT_ID || 'p_studio_yearly',
      },
      polar: {
        monthly: process.env.POLAR_STUDIO_MONTHLY_PRODUCT_ID,
        yearly: process.env.POLAR_STUDIO_YEARLY_PRODUCT_ID,
      },
    },
  },
};

export function getPlanConfig(planTier: PlanTier): PlanConfig {
  return PLANS[planTier] || PLANS.free;
}
