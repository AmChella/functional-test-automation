import { test, expect } from '@playwright/test';

test('should complete onboarding steps after accepting cookies', async ({ page }) => {
  await page.goto('https://neoprcbeta.proofcentral.com/article/m7v3hdi70hgluw7');
  await page.getByRole('button', { name: 'Accept All Cookies' }).dblclick();
  await page.getByRole('button', { name: 'Skip Onboarding' }).dblclick();
});