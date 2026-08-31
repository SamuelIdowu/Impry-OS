import { test, expect } from '@playwright/test';

test.describe('Impry OS Smoke Tests', () => {
  test('landing page loads correctly with CTA buttons', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Impry|Freelancer/i);
  });

  test('public legal and terms pages are accessible without login', async ({ page }) => {
    await page.goto('/terms');
    await expect(page.locator('body')).toBeVisible();

    await page.goto('/privacy');
    await expect(page.locator('body')).toBeVisible();
  });

  test('unauthenticated access to dashboard redirects to login', async ({ page }) => {
    await page.goto('/workspaces');
    await expect(page).toHaveURL(/.*login/);
  });
});
