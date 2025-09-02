import { test, expect, selectors, chromium } from "@playwright/test";
import fs from "fs";
import * as utility from "../helpers/formatting.utility";
const articleUrl =
  "https://neoprcbeta.proofcentral.com/article/r1oi80dn86nmiga";
let browser;
let context;
let page;

test.beforeAll(async () => {
  test.setTimeout(12_00_00);
  browser = await chromium.launch();
  context = await browser.newContext();
  page = await context.newPage();
  await page.goto(articleUrl, { waitUntil: "load" });
});

test.afterAll(async () => {
  if (page && !page.isClosed()) {
    await page.close();
  }
  if (context) {
    await context.close();
  }
  if (browser) {
    await browser.close();
  }
});

const readTestCases = async (type: string) => {
  const response = fs.readFileSync("./test-cases/formatting.json", "utf8");
  const testCases = JSON.parse(response);
  return testCases[type] || [];
};

test("onboarding popup should be closed", async () => {
  await page.getByRole("button", { name: "Accept All Cookies" }).click();
  await page.getByRole("button", { name: "Skip Onboarding" }).click();
});

test("should bold format apply correctly", async () => {
  const boldTestCases = await readTestCases("bold");

  for (const selector of boldTestCases) {
    const elements = page.locator(selector);
    const count = await elements.count();

    console.log(`Selector: ${selector}, found ${count} element(s)`);

    for (let i = 0; i < count; i++) {
      const element = elements.nth(i);
      const text = await element.textContent();
      await utility.boldWord(page, element, text || "", "Bold");
    }
  }

  await page.waitForTimeout(1000);
});

test("should italic format apply correctly", async () => {
  const italicTestCases = await readTestCases("italic");

  for (const selector of italicTestCases) {
    const elements = page.locator(selector);
    const count = await elements.count();

    console.log(`Selector: ${selector}, found ${count} element(s)`);

    for (let i = 0; i < count; i++) {
      const element = elements.nth(i);
      const text = await element.textContent();
      await utility.boldWord(page, element, text || "", "Italic");
    }
  }

  await page.waitForTimeout(1000);
});

test("should superscript format apply correctly", async () => {
  const superscriptTestCases = await readTestCases("superscript");

  for (const selector of superscriptTestCases) {
    const elements = page.locator(selector);
    const count = await elements.count();

    console.log(`Selector: ${selector}, found ${count} element(s)`);

    for (let i = 0; i < count; i++) {
      const element = elements.nth(i);
      const text = await element.textContent();
      await utility.boldWord(page, element, text || "", "Superscript");
    }
  }

  await page.waitForTimeout(1000);
});

test("should subscript format apply correctly", async () => {
  const subscriptTestCases = await readTestCases("subscript");

  for (const selector of subscriptTestCases) {
    const elements = page.locator(selector);
    const count = await elements.count();

    console.log(`Selector: ${selector}, found ${count} element(s)`);

    for (let i = 0; i < count; i++) {
      const element = elements.nth(i);
      const text = await element.textContent();
      await utility.boldWord(page, element, text || "", "Subscript");
    }
  }

  await page.waitForTimeout(1000);
});