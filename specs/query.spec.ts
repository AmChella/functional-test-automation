import { test, expect, selectors, chromium } from "@playwright/test";
import * as utility from "../helpers/query.utility";
import logger from "../helpers/logger";
const articleUrl =
  "https://neoprcbeta.proofcentral.com/article/1kwtarozmb675t6";
let browser;
let context;
let page;

test.beforeAll(async () => {
  test.setTimeout(300_000);
  logger.banner("Query Suite - setup", { fg: "brightWhite", bg: "bgBlue", bold: true });
  browser = await chromium.launch({ args: ["--start-maximized"] });
  context = await browser.newContext();
  page = await context.newPage();
});

test.afterAll(async () => {
  await context.close();
  await browser.close();
  logger.banner("Query Suite - teardown", { fg: "brightWhite", bg: "bgBlue", bold: true });
});



test("should display article content after onboarding and cookie acceptance", async () => {
  logger.section("QUERY FLOW");
  await page.goto(articleUrl, { waitUntil: "load" });
  await page.getByRole("button", { name: "Accept All Cookies" }).click();
  await page.getByRole("button", { name: "Skip Onboarding" }).click();
  const elements = await utility.getListOfQueryElements(page, test);

  const count = await elements.count();
  logger.info(`Number of elements found: ${count}`);
  for (let i = 0; i < count; i++) {
    logger.step(`Open query #${i + 1}`);
    await elements.nth(i).click();

    const textarea = page.locator("textarea#response-textarea");
    if (await textarea.count() > 0) {
      const text = `Response for query ${i}`;
      logger.step(`Fill textarea: ${text}`);
      await textarea.fill(text);
    }

    const done = page.locator("button:has-text('Done')");
    if (await done.count() > 0) {
      logger.success("Mark query Done");
      await done.click();
    }

    await page.waitForTimeout(2000);
  }
});
