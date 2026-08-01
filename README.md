# SauceDemo QA Automation

Playwright test automation suite for [SauceDemo](https://www.saucedemo.com/), built for the TK Elevator QA Automation Engineer assignment.

- **76** manual test cases documented across all 6 seeded user accounts
- **45** automated test scenarios (**135** total test runs across Chromium, Firefox, and WebKit)
- Page Object Model architecture, reusable fixtures, centralized test data
- Custom dashboard, two-tier CI pipeline, test tagging strategy

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for design decisions and assumptions, and [`Automation_Selection_Rationale.docx`](./Automation_Selection_Rationale.docx) for the full test-selection reasoning.

---

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS version recommended)
- npm (bundled with Node.js)

## Setup

```bash
# 1. Clone the repository
git clone https://github.com/EniL17/saucedemo-qa-automation.git
cd saucedemo-qa-automation

# 2. Install dependencies (this also activates the Husky pre-commit hook automatically)
npm install

# 3. Install Playwright's browser binaries
npx playwright install
```

---

## Running the Tests

### Run everything

```bash
npx playwright test
```

Runs all 135 test executions (45 scenarios x 3 browsers).

**Expected result: 90 passed, 45 failed.** The 45 failures are **intentional** — each one is a regression check for a specific, documented defect (see "Understanding the Failing Tests" below). This is not a broken build.

### Run a targeted subset

```bash
npx playwright test --grep @smoke          # 5 scenarios (15 runs) - fastest critical-path check
npx playwright test --grep @regression     # 15 scenarios (45 runs) - known-defect tracking, expected to fail
npx playwright test --grep-invert @regression   # ~30 scenarios (90 runs) - everything EXCEPT known defects
npx playwright test tests/login.spec.ts    # a single file
```

---

## Understanding the Failing Tests

**45 of the 135 test runs are expected to fail.** This is intentional, not a bug in the automation.

Every assertion in this suite checks the **correct, expected behaviour** of the application (e.g., "Remove should clear the item from the cart"). Where SauceDemo has a genuine, confirmed defect — verified through manual exploration and cross-checked against the manual test case sheet — the assertion correctly fails, because the defect is real. Pass always means "working correctly"; fail always means "needs attention." Nothing is inverted.

If a failing test ever turns green, it means the underlying defect may have been fixed, and the manual test case documentation should be reviewed and updated to match.

The full list of the 15 confirmed defects and their corresponding tests is in the manual test case spreadsheet (`Automate?` and `Bug Found?` columns) and in `ARCHITECTURE.md`.

---

## Viewing Test Results

### Playwright's built-in HTML report

```bash
npx playwright show-report
```

Opens an interactive report with every test result, grouped by file and browser, with automatic **screenshots**, **video recordings**, and **trace files** attached to every failing test.

### Custom dashboard

A lightweight, custom-built dashboard is included at `dashboard/index.html`, reading live from Playwright's JSON test output. It shows total pass/fail counts, a breakdown by user account, a breakdown by browser, a breakdown of confirmed defects by priority, and a dedicated defects table.

**Must be viewed through a local server, not by double-clicking the file** — browsers block a local file from reading another local file (`test-results/results.json`) for security reasons.

```bash
npx http-server -p 8080
```

Then open: **http://localhost:8080/dashboard/**

---

## Continuous Integration (GitHub Actions)

Every push to `main`/`master` triggers **two independent jobs**:

| Job | Runs | Blocking? | Purpose |
|---|---|---|---|
| **Release Gate** | ~90 tests — everything EXCEPT known defects (`--grep-invert @regression`) | ✅ Yes | Catches genuine regressions — anything a code change breaks |
| **Known Defects Tracker** | 15 known-defect tests (`--grep @regression`) | ❌ No (`continue-on-error: true`) | Keeps documented defects visible without ever blocking a release |

**Why two jobs instead of one:** a single combined pipeline would always show red (45 known defects never pass), meaning it could never safely be used as a real release gate — an urgent, unrelated fix would be permanently blocked by pre-existing, already-documented issues. Splitting the pipeline this way means the release gate reflects only genuinely new problems, while known issues stay honestly tracked without holding anything up. See `ARCHITECTURE.md` for the full reasoning.

CI runs with a single worker (`workers: 1` in `playwright.config.ts`) rather than local's auto-detected parallel workers, since shared CI runners have limited CPU resources — a deliberate reliability choice.

---

## Pre-commit Hook (Husky)

This project uses [Husky](https://typicode.github.io/husky/) to automatically run the `@smoke` test suite before every commit. If any smoke test fails, the commit is blocked. This is activated automatically by `npm install` (via the `prepare` script in `package.json`) — no extra setup needed.

---

## Project Structure

```
saucedemo-qa-automation/
├── pages/                    # Page Object Model - one class per page
│   ├── LoginPage.ts
│   ├── InventoryPage.ts
│   ├── CartPage.ts
│   └── CheckoutPage.ts
├── data/                     # Centralized, reusable test data
│   ├── users.ts               # All 6 seeded account credentials
│   └── products.ts            # Shared product identifiers
├── tests/                    # Test specs, one file per user account/flow
│   ├── login.spec.ts
│   ├── inventory.spec.ts
│   ├── cart.spec.ts
│   ├── checkout.spec.ts
│   ├── session.spec.ts
│   ├── locked-out-user.spec.ts
│   ├── problem-user.spec.ts
│   ├── error-user.spec.ts
│   ├── performance-user.spec.ts
│   └── visual-user.spec.ts
├── dashboard/                 # Custom results dashboard
│   └── index.html
├── .husky/                    # Pre-commit hook
│   └── pre-commit
├── .github/workflows/         # CI pipeline definition (two-tier)
│   └── playwright.yml
├── playwright.config.ts       # Reporters, browsers, timeouts, tagging support
├── ARCHITECTURE.md
├── Automation_Selection_Rationale.docx
├── SauceDemo_Test_Cases.xlsx
└── package.json
```

---

## Test Tagging Strategy

| Tag | Purpose | Count |
|---|---|---|
| `@smoke` | Fastest possible check that the application's critical path works | 5 scenarios (15 runs) |
| `@regression` | Every automated test tracking a confirmed, documented defect | 15 scenarios (45 runs) |
| *(untagged)* | Standard functional coverage of working features | 25 scenarios (75 runs) |

---

## Manual Test Documentation

[`SauceDemo_Test_Cases.xlsx`](./SauceDemo_Test_Cases.xlsx) documents all 76 test cases across all 6 seeded accounts: objective, preconditions, steps, expected result, actual result, priority, bug status, and automation decision for each case.
