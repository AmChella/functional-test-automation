import { test, expect, Page } from "@playwright/test";
import fs from "fs";
type Mode = "mouse" | "keyboard" | "cursor";
type Result =
  | { success: true; mode: Mode; selectedWord: string }
  | { success: false; error: string };

const customSplitWords = (text: string): string[] => {
  const matches = text.match(
    /(\([^)]+\))|(['"‘’“”][^'"‘’“”]+?['"‘’“”])|([a-zA-Z0-9’'‑–—-]+)/g
  );
  return [...new Set(matches || [])];
};

const escapeForRegex = (s: string) =>
  s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const runTest = async (testCases: string[], page: Page, button: string, linkType: string = "web-link") => {
  for (const selector of testCases) {
    const elements = page.locator(selector);
    const count = await elements.count();

      console.log(`Selector: ${selector}, found ${count} element(s)`);

      for (let i = 0; i < count; i++) {
        const element = elements.nth(i);
        const text = await element.textContent();
        if (button === "Add Link") {
          await addLink(page, element, text || "", button, linkType);
        } else {
          await doFormat(page, element, text || "", button);
        }
      }
    }
};

const addLink = async (page: Page, element: any, words: string, button: string, linkType: string) => {
  if (linkType === "web-link") {
    await addLinkWeb(page, element, words, button);
  } else {
    await addLinkDatabase(page, element, words, button);
  }
};

const addLinkDatabase = async (page: Page, element: any, words: string, button: string) => {
  const length = words.split(" ").length; // Get the number of words
  console.log(`Number of words in selector ${element}:`, length);
  const randomWord = words.split(" ")[Math.floor(Math.random() * length)];
  console.log(`Random word selected from selector ${element}:`, randomWord);
  await selectWord(page, element, randomWord);
  await page.waitForTimeout(500);
  await page.getByRole("button", { name: "Add Link" }).click();
  await page.waitForTimeout(500);
  await page.getByRole("dialog").locator("path").waitFor({
    state: "visible",
  });
  await page.locator('.select__input-container').click();
  await page.locator('#react-select-3-input').fill('database url');
  await page.locator('#react-select-3-input').press('Enter');
  await page.locator('.select__control.css-13cymwt-control > .select__value-container > .select__input-container').click();
  await page.locator('#react-select-5-input').fill('agi');
  await page.locator('#react-select-5-input').press('Enter');
  await page.getByRole('textbox', { name: 'Database Number:' }).click();
  await page.getByRole('textbox', { name: 'Database Number:' }).fill('database url test');
  await page.getByRole('contentinfo').getByRole('button', { name: 'Insert' }).click();
};

export const addLinkWeb = async (page: Page, element: any, words: string, button: string) => {
  const length = words.split(" ").length; // Get the number of words
  console.log(`Number of words in selector ${element}:`, length);
  const randomWord = words.split(" ")[Math.floor(Math.random() * length)];
  console.log(`Random word selected from selector ${element}:`, randomWord);
  await selectWord(page, element, randomWord);
  await page.waitForTimeout(500);
  await page.getByRole("button", { name: "Add Link" }).click();
  await page.waitForTimeout(500);
  await page.getByRole("dialog").locator("path").waitFor({
    state: "visible"
  });
  await page.getByRole("dialog").locator("path").click();
  await page.getByRole("option", { name: "Web URL" }).click();
  await page.getByRole("textbox", { name: "URL:" }).click();
  await page.getByRole("textbox", { name: "URL:" }).fill("https://google.com");
  await page.getByRole("textbox", { name: "URL:" }).click();
  await page
    .getByRole("contentinfo")
    .getByRole("button", { name: "Insert" })
    .click();
}

export const readTestCases = async (type: string) => {
  const response = fs.readFileSync("./test-cases/formatting.json", "utf8");
  const testCases = JSON.parse(response);
  return testCases[type] || [];
};

export const getTextContent = async (page: Page, selector: string): Promise<string> => {
  return page.evaluate((sel) => {
    const element = document.querySelector(sel);
    return element ? element.textContent : "";
  }, selector);
};

export const hasMultipleElements = async (page: Page, selector: string): Promise<boolean> => {
  const elements = await page.$$(selector);
  return elements.length > 1;
};

export const hasLink = async (page: Page): Promise<boolean> => {
  return await page.evaluate(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return false;

    const range = selection.getRangeAt(0);
    const contents = range.cloneContents();
    // Check for <a> tags in the cloned contents or in the common ancestor
    if (contents.querySelector && contents.querySelector("a")) {
      return true;
    }
    // Fallback: check if the selection itself is inside a link
    const ancestor = range.commonAncestorContainer;
    let node = ancestor.nodeType === 1 ? ancestor : ancestor.parentElement;
    while (node) {
      if (node.nodeName && node.nodeName.toLowerCase() === "a") return true;
      node = node.parentElement;
    }
    return false;
  });
};

export const doFormat = async (page: Page, selector: string | any, words: string, button: string) => {
  // console.log(`Words in selector ${selector}:`, words);
  const length = words.split(" ").length; // Get the number of words
  console.log(`Number of words in selector ${selector}:`, length);
  const randomWord = words.split(" ")[Math.floor(Math.random() * length)];
  console.log(`Random word selected from selector ${selector}:`, randomWord);
  await selectWord(page, selector, randomWord);
  await page.waitForTimeout(500);
  if (await page.getByRole("button", { name: button }).isVisible()) {
    await page.getByRole("button", { name: button }).click();
  } else {
    console.log("Button not visible");
  }
}

export const selectWord = async (
  page: Page,
  elOrSelector: string | any,
  word: string,
  mode: "first" | "random" = "first"
) => {
  // Accept either a selector string or an ElementHandle. If a selector string is passed,
  // resolve it to an ElementHandle so we can use handle.evaluate() inside the page context.
  let handle: any = null;
  if (typeof elOrSelector === "string") {
    handle = await page.$(elOrSelector);
  } else if (elOrSelector && typeof elOrSelector.evaluate === "function") {
    // Already an ElementHandle
    handle = elOrSelector;
  } else {
    // Unsupported argument
    return;
  }

  if (!handle) return;

  const coords = await handle.evaluate(
    (el: Element, word: string, mode: string) => {
      if (!el) return null;

      el.scrollIntoView({ block: "center", inline: "center", behavior: "auto" });

      // Walk text nodes inside the element to find occurrences
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      let node: Node | null = null;
      while ((node = walker.nextNode())) {
        const text = node.textContent || "";
        const indices: number[] = [];
        let startIndex = 0;

        while (true) {
          const index = text.indexOf(word, startIndex);
          if (index === -1) break;
          indices.push(index);
          startIndex = index + word.length;
        }

        if (indices.length === 0) continue;

        const chosenIndex =
          mode === "random"
            ? indices[Math.floor(Math.random() * indices.length)]
            : indices[0];

        // Create a range for the chosen occurrence
        const range = document.createRange();
        range.setStart(node, chosenIndex);
        range.setEnd(node, chosenIndex + word.length);

        // If the range has no box (e.g. hidden), fallback to element rect
        const rect = range.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) {
          const elRect = el.getBoundingClientRect();
          return {
            x1: elRect.left + 2,
            y1: elRect.top + elRect.height / 2,
            x2: elRect.right - 2,
            y2: elRect.top + elRect.height / 2,
          };
        }

        // Use left/center and right/center of the text range as drag start/end
        return {
          x1: rect.left + 1,
          y1: rect.top + rect.height / 2,
          x2: rect.right - 1,
          y2: rect.top + rect.height / 2,
        };
      }

      return null;
    },
    word,
    mode
  );

  // If we created the handle from a selector, we can dispose it later.
  const createdHandle = typeof elOrSelector === "string";

  if (!coords) {
    if (createdHandle && handle.dispose) await handle.dispose();
    return;
  }

  // Simulate mouse drag from start to end to create a selection
  await page.mouse.move(coords.x1, coords.y1);
  await page.mouse.down();
  // move in small steps to imitate a real drag
  await page.mouse.move(coords.x2, coords.y2, { steps: 12 });
  await page.mouse.up();

  if (createdHandle && handle.dispose) await handle.dispose();
};


