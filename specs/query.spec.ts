import { test, expect, selectors, chromium } from "@playwright/test";
import * as utility from "../helpers/query.utility";
const articleUrl =
  "https://neoprcbeta.proofcentral.com/article/1kwtarozmb675t6";
let browser;
let context;
let page;

test.beforeAll(async () => {
  test.setTimeout(300_000);
  browser = await chromium.launch({ args: ["--start-maximized"] });
  context = await browser.newContext();
  page = await context.newPage();
});

test.afterAll(async () => {
  await context.close();
  await browser.close();
});



test("should display article content after onboarding and cookie acceptance", async () => {
  await page.goto(articleUrl, { waitUntil: "load" });
  await page.getByRole("button", { name: "Accept All Cookies" }).click();
  await page.getByRole("button", { name: "Skip Onboarding" }).click();
  const elements = await utility.getListOfQueryElements(page, test);

  const count = await elements.count();
  console.log("Number of elements found:", count);
  for (let i = 0; i < count; i++) {
    await elements.nth(i).click();

    const textarea = page.locator("textarea#response-textarea");
    if (await textarea.count() > 0) {
      await textarea.fill(`Response for query ${i}`);
    }

    const done = page.locator("button:has-text('Done')");
    if (await done.count() > 0) {
      await done.click();
    }

    await page.waitForTimeout(2000);
  }
});
