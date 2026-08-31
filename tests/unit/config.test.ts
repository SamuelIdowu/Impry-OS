import { describe, it, expect } from 'vitest';
import { PLANS, getPlanConfig } from '@/lib/payments/config';
import { PlanTier } from '@/lib/payments/types';

describe('Plan Configuration (config.ts)', () => {
  it('defines Free, Pro, and Studio tiers with correct pricing', () => {
    expect(PLANS.free).toBeDefined();
    expect(PLANS.pro).toBeDefined();
    expect(PLANS.studio).toBeDefined();

    expect(PLANS.free.priceMonthly).toBe(0);
    expect(PLANS.pro.priceMonthly).toBe(19);
    expect(PLANS.studio.priceMonthly).toBe(49);
  });

  it('configures Free tier limits correctly', () => {
    const freeLimits = PLANS.free.limits;
    expect(freeLimits.clients).toBe(3);
    expect(freeLimits.projects).toBe(2);
    expect(freeLimits.invoicesPerMonth).toBe(5);
    expect(freeLimits.customBranding).toBe(false);
    expect(freeLimits.teamMembers).toBe(1);
    expect(freeLimits.csvExport).toBe(false);
  });

  it('configures Pro tier limits correctly', () => {
    const proLimits = PLANS.pro.limits;
    expect(proLimits.clients).toBe('unlimited');
    expect(proLimits.projects).toBe('unlimited');
    expect(proLimits.invoicesPerMonth).toBe('unlimited');
    expect(proLimits.customBranding).toBe(true);
    expect(proLimits.teamMembers).toBe(1);
    expect(proLimits.csvExport).toBe(true);
  });

  it('configures Studio tier limits correctly', () => {
    const studioLimits = PLANS.studio.limits;
    expect(studioLimits.clients).toBe('unlimited');
    expect(studioLimits.projects).toBe('unlimited');
    expect(studioLimits.invoicesPerMonth).toBe('unlimited');
    expect(studioLimits.customBranding).toBe(true);
    expect(studioLimits.teamMembers).toBe(5);
    expect(studioLimits.csvExport).toBe(true);
  });

  it('returns appropriate plan config from getPlanConfig', () => {
    expect(getPlanConfig('free').name).toBe('Free Starter');
    expect(getPlanConfig('pro').name).toBe('Freelancer Pro');
    expect(getPlanConfig('studio').name).toBe('Studio & Agency');
    // Fallback on unknown
    expect(getPlanConfig('unknown' as PlanTier).name).toBe('Free Starter');
  });
});
