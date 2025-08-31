import { expect, Page } from "@playwright/test";

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

export const boldWord = async (page: Page, selector: Element, words: string, button: string) => {
  // console.log(`Words in selector ${selector}:`, words);
  const length = words.split(" ").length; // Get the number of words
  console.log(`Number of words in selector ${selector}:`, length);
  const randomWord = words.split(" ")[Math.floor(Math.random() * length)];
  console.log(`Random word selected from selector ${selector}:`, randomWord);
  await selectWord(page, selector, randomWord);
  await page.getByRole("button", { name: button }).click();
  // await page.waitForTimeout(5000);
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


