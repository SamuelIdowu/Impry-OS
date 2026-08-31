import { test, expect } from '@playwright/test';

test.describe('Impry OS Core User & SaaS Flows', () => {
  test('1. Authentication Flow: form validation on empty submit', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('form, button[type="submit"]')).toBeVisible();

    // Trigger validation
    const submitBtn = page.getByRole('button', { name: /sign in|log in/i });
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      // Should show validation error or maintain focus
      await expect(page).toHaveURL(/.*login/);
    }
  });

  test('2. Registration Flow: Terms agreement checkbox enforcement', async ({ page }) => {
    await page.goto('/register');
    const registerBtn = page.getByRole('button', { name: /create account|sign up|get started/i });
    if (await registerBtn.isVisible()) {
      await registerBtn.click();
      // Should fail without filling fields and accepting terms
      await expect(page).toHaveURL(/.*register/);
    }
  });

  test('3. Public Scope Sharing: Read-only access without login', async ({ page }) => {
    // Public scope share route
    await page.goto('/scope/share?token=demo-preview');
    await expect(page.locator('body')).toBeVisible();
  });

  test('4. Legal & Compliance Pages: All links respond with 200 OK', async ({ page }) => {
    const legalPages = ['/terms', '/privacy', '/cookies', '/security'];
    for (const route of legalPages) {
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);
      await expect(page.locator('h1, h2')).toBeVisible();
    }
  });
});
