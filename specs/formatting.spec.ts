import { test, expect, selectors, chromium } from "@playwright/test";
import logger from "../helpers/logger";
test.setTimeout(120_000);
import * as utility from "../helpers/formatting.utility";
import {runTest} from "./runner";


const articleUrl = "http://localhost:4000/article/3xrylma75cnlj76";
let browser;
let context;
let page;
const feature = "formatting";

test.beforeAll(async () => {
  logger.banner("Formatting Suite - setup", { fg: "brightWhite", bg: "bgBlue", bold: true });
  browser = await chromium.launch();
  context = await browser.newContext();
  page = await context.newPage();
  await page.goto(articleUrl, { waitUntil: "load" });
  await page.getByRole("button", { name: "Accept All Cookies" }).click();
  await page.getByRole("button", { name: "Skip Onboarding" }).click();
  logger.success("Setup complete");
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
  logger.banner("Formatting Suite - teardown", { fg: "brightWhite", bg: "bgBlue", bold: true });
});

test("should bold format apply correctly", async () => {
  logger.section("BOLD TEST");
  const boldTestCases = await utility.readTestCases("bold");
  await runTest(boldTestCases, page, "Bold", feature);
  await page.waitForTimeout(1000);
});

test("should italic format apply correctly", async () => {
  logger.section("ITALIC TEST");
  const italicTestCases = await utility.readTestCases("italic");
  await runTest(italicTestCases, page, "Italic", feature);
  await page.waitForTimeout(1000);
});

test("should superscript format apply correctly", async () => {
  logger.section("SUPERSCRIPT TEST");
  const superscriptTestCases = await utility.readTestCases("superscript");
  await runTest(superscriptTestCases, page, "Superscript", feature);
  await page.waitForTimeout(1000);
});

test("should subscript format apply correctly", async () => {
  logger.section("SUBSCRIPT TEST");
  const subscriptTestCases = await utility.readTestCases("subscript");
  await runTest(subscriptTestCases, page, "Subscript", feature);
  await page.waitForTimeout(1000);
});

test("should apply web link to the selection correctly", async () => {
  logger.section("ADD WEB LINK TEST");
  const linkTestCases = await utility.readTestCases("link");
  await runTest(linkTestCases, page, "Add Link", feature, "web-link");
  await page.waitForTimeout(1000);
});

test("should apply database link to the selection correctly", async () => {
  logger.section("ADD DATABASE LINK TEST");
  const linkTestCases = await utility.readTestCases("link");
  await runTest(linkTestCases, page, "Add Link", feature, "database");
  await page.waitForTimeout(1000);
});

