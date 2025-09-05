import { test, expect } from '@playwright/test';
import logger from "../helpers/logger";

test('has title', async ({ page }) => {
  logger.section("PLAYWRIGHT DOCS - TITLE");
  await page.goto('https://playwright.dev/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Playwright/);
});

test('get started link', async ({ page }) => {
  logger.section("PLAYWRIGHT DOCS - GET STARTED");
  await page.goto('https://playwright.dev/');

  // Click the get started link.
  await page.getByRole('link', { name: 'Get started' }).click();
  logger.success('Clicked Get started link');

  // Expects page to have a heading with the name of Installation.
  await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
});
