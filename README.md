# Functional Test Automation (Playwright + Allure)

This repository contains end-to-end and functional UI tests built with Playwright and Allure reporting.

Key characteristics:
- Test runner: @playwright/test (v1.55.x)
- Reporters: list + allure-playwright
- Test directory: ./specs
- Helpers and utilities in ./helpers
- Optional test cases data in ./test-cases/formatting.json
- GitHub Actions workflow for CI at .github/workflows/playwright.yml

## Prerequisites
- Node.js 18 or newer
- Yarn or npm
- Playwright browsers installed

## Setup
Using Yarn (preferred):
- Install dependencies: `yarn`
- Install Playwright browsers: `yarn playwright install --with-deps`

Using npm:
- Install dependencies: `npm ci` (or `npm install`)
- Install Playwright browsers: `npx playwright install --with-deps`

## Scripts
Defined in package.json:
- `yarn test:allure` — run all Playwright tests
- `yarn allure:generate` — generate Allure report into ./allure-report from ./allure-results
- `yarn allure:open` — open the generated Allure report locally

npm equivalents:
- `npm run test:allure`
- `npm run allure:generate`
- `npm run allure:open`

## Running tests
- Run all tests: `yarn playwright test` (same as `yarn test:allure`)
- Run a single file: `yarn playwright test specs/example.spec.ts`
- Run tests matching a title: `yarn playwright test -g "get started"`
- Choose a browser project (only chromium enabled by default): `yarn playwright test --project=chromium`

Headed vs headless:
- The config currently sets `headless: false` (headed by default).
- Override from CLI: add `--headless` to run headless, or `--headed` to ensure headed.

Timeouts and parallelism:
- Global timeout: 60s per test file
- Workers: 1 (serial across files)
- Retries on CI: 2 (0 locally)

## Folder structure
- specs/
  - example.spec.ts — sample Playwright tests
  - formatting.spec.ts — formatting and link tests targeting specific article pages
  - onboard.spec.ts — cookie consent and onboarding flow
  - query.spec.ts — iterates through pending queries and interacts with UI
  - test-1.spec.ts — scaffold placeholder
- helpers/
  - formatting.utility.ts — selection helpers, link insertion flows (web and database), formatting actions, reading test cases
  - query.utility.ts — utility functions for query list detection and interaction
- test-cases/
  - formatting.json — selectors per formatting type used by helpers
- playwright.config.ts — Playwright configuration (reporters, projects, timeouts)
- .github/workflows/playwright.yml — CI workflow: install deps, install browsers, run tests

## Configuration
Base URL:
- Tests currently navigate to explicit URLs in spec files (e.g., onboard.spec.ts and query.spec.ts use https://neoprcbeta.proofcentral.com and formatting.spec.ts points to a LAN IP).
- To centralize this, set `use.baseURL` in `playwright.config.ts` and update specs to use relative paths, or 
  uncomment the dotenv snippet in the config and provide values in a `.env` file (e.g., `BASE_URL=https://example.com`).

Reporters:
- Allure is enabled via `allure-playwright`. Test runs will write results into `./allure-results`.
- Generate HTML report with `yarn allure:generate` and open with `yarn allure:open`.

Traces:
- `trace: 'on-first-retry'` is enabled. When a test retries, a trace will be collected for debugging.

## CI
GitHub Actions workflow: `.github/workflows/playwright.yml`
- Uses Yarn and Node LTS
- Installs Playwright browsers
- Runs `yarn playwright test`
- Uploads `playwright-report/` as an artifact if present

Note: The default config does not enable Playwright's built-in HTML reporter. If you want the Playwright HTML report in CI, add the html reporter to `reporter` in `playwright.config.ts` and/or run `npx playwright show-report` after the run.

## Troubleshooting
- Network/unreachable errors (e.g., `net::ERR_ADDRESS_UNREACHABLE`): ensure the target application is reachable from your machine/CI. Update hardcoded URLs in specs if your environment differs.
- Strict mode violations (locators resolving to multiple elements): refine selectors in `helpers/formatting.utility.ts` (e.g., use `.first()` or more specific locators) to avoid ambiguity.
- Allure report not opening: ensure `allure:generate` completes successfully before `allure:open`. The first run may download the Allure binary.

## License
MIT
