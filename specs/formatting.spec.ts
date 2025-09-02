import { test, expect, selectors, chromium } from "@playwright/test";
test.setTimeout(120_000);
import fs from "fs";
import * as utility from "../helpers/formatting.utility";
const articleUrl = "http://192.168.31.230:4000/article/50jp6dei5h2zxsw";
let browser;
let context;
let page;

test.beforeAll(async () => {
  browser = await chromium.launch();
  context = await browser.newContext();
  page = await context.newPage();
  await page.goto(articleUrl, { waitUntil: "load" });
  await page.getByRole("button", { name: "Accept All Cookies" }).click();
  await page.getByRole("button", { name: "Skip Onboarding" }).click();
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

test("should bold format apply correctly", async () => {
  const boldTestCases = await utility.readTestCases("bold");
  await utility.runTest(boldTestCases, page, "Bold");
  await page.waitForTimeout(1000);
});

test("should italic format apply correctly", async () => {
  const italicTestCases = await utility.readTestCases("italic");
  await utility.runTest(italicTestCases, page, "Italic");
  await page.waitForTimeout(1000);
});

test("should superscript format apply correctly", async () => {
  const superscriptTestCases = await utility.readTestCases("superscript");
  await utility.runTest(superscriptTestCases, page, "Superscript");
  await page.waitForTimeout(1000);
});

test("should subscript format apply correctly", async () => {
  const subscriptTestCases = await utility.readTestCases("subscript");
  await utility.runTest(subscriptTestCases, page, "Subscript");
  await page.waitForTimeout(1000);
});

test("should apply web link to the selection correctly", async () => {
  const linkTestCases = await utility.readTestCases("link");
  await utility.runTest(linkTestCases, page, "Add Link", "web-link");
  await page.waitForTimeout(1000);
});

test("should apply database link to the selection correctly", async () => {
  const linkTestCases = await utility.readTestCases("link");
  await utility.runTest(linkTestCases, page, "Add Link", "database");
  await page.waitForTimeout(1000);
});

