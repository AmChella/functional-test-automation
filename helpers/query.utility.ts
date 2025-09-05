import logger from "./logger";

export const hasPendingQueries = async (page) => {
  const selector =
    "main > div > div:nth-child(1) > div.flex.items-center.justify-between.text-lg.font-semibold.pb-2 > h1 span";
  const element = await page.$(selector);
  if (element) {
    const text = await element.textContent();
    const textContent = text ? parseFloat(text) : NaN;
    return !Number.isNaN(textContent) && textContent > 0;
  }

  return false;
};

export const getListOfQueryElements = async (page, test) => {
  logger.info("Checking for pending queries...");
  if ((await hasPendingQueries(page)) === false) {
    logger.warn("No pending queries found.");
    test.skip();
  }

  logger.success("Pending queries found.");

  const selector = "div.box-content";
  await page.waitForSelector(selector, { timeout: 5000 });
  const locator = page.locator(selector);

  if (locator) {
    return locator;
  }

  return [];
};