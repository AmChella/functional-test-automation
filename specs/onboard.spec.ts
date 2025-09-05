import { test, expect } from '@playwright/test';
import logger from "../helpers/logger";

test('should complete onboarding steps after accepting cookies', async ({ page }) => {
  logger.section("ONBOARDING FLOW");
  await page.goto('https://neoprcbeta.proofcentral.com/article/m7v3hdi70hgluw7');
  logger.step("Accept All Cookies");
  await page.getByRole('button', { name: 'Accept All Cookies' }).dblclick();
  logger.step("Skip Onboarding");
  await page.getByRole('button', { name: 'Skip Onboarding' }).dblclick();
  logger.success("Onboarding completed");
});