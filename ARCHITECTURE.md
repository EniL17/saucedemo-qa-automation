# Architecture, Design Decisions, and Assumptions

This document explains the *why* behind the automation project.

---

## 1. Key Decisions and Why

### Language: TypeScript

I chose TypeScript over plain JavaScript for a few reasons. It catches mistakes while I'm writing the code — a wrong argument, a typo in a method name — instead of only finding out when I run the test. It's also Playwright's own recommended setup when you scaffold a new project, so it's the more standard, widely-used choice.

### Pattern: Page Object Model (POM)

One class per page of the application (`LoginPage`, `InventoryPage`, `CartPage`, `CheckoutPage`), each owning the selectors and actions for that page. This is the industry-standard structure for browser automation, and it directly satisfies "maintainable and scalable automation framework structure": if SauceDemo's markup changes, the fix happens in one Page Object file, not across every test file that touches that page.

### Test data: centralized, not hardcoded

`data/users.ts` holds all 6 seeded account credentials; `data/products.ts` holds the shared product identifier list used across multiple test files (originally duplicated between `problem-user.spec.ts` and `error-user.spec.ts`, refactored into a shared file after review — an example of the "reusable components" requirement).

### Reusable components

- `test.beforeEach` blocks handle login setup once per file, rather than repeating it in every individual test.
- `InventoryPage.addToCart(productSlug)` and `.removeFromCart(productSlug)` are parameterized methods that work for any of the 6 products, rather than six separate hardcoded methods.
- `data/products.ts` centralizes the product list itself, used by any test that needs to act on "all products."

### Assertion philosophy: always assert correct behaviour

Every assertion in this suite checks what the application **should** do, never the broken behaviour directly. For the 15 tests tracking confirmed defects, this means the test currently fails — deliberately and by design — because the defect is real. This keeps "pass = working, fail = needs attention" consistent across the entire suite, with no inverted-meaning tests to explain away. It also means that if a defect is ever fixed, the corresponding test will automatically start passing with zero code changes required — the test IS the fix-verification mechanism.

---

## 2. Manual Test Case Documentation

76 manual test cases are documented in `SauceDemo_Test_Cases_Final.xlsx`, covering all 6 seeded accounts (`standard_user`, `locked_out_user`, `problem_user`, `performance_glitch_user`, `error_user`, `visual_user`). Each case includes Test ID, User Profile, Objective, Preconditions, Test Steps, Expected Result, Actual Result, Bug Found (Y/N), Priority, and Automate decision.

**Priority basis:** business/revenue impact if the workflow were broken, independent of whether it turned out to actually be broken — High for login/checkout/cart entry points, Medium for supporting features, Low for cosmetic or peripheral checks. Priority assignments were audited for consistency across repeated patterns (e.g. Logout, About page, Reset App State) so the same type of check carries the same priority regardless of which account it was tested under.

**Automation selection basis:** every High-priority case was automated by default; the same underlying check was automated once (under the account where it was first confirmed) rather than once per user; cases needing subjective visual judgment or non-reproducible timing were documented manually rather than forced into a brittle automated assertion. Full reasoning and category-by-category breakdown is in `Automation_Selection_Rationale.docx`.

---

## 3. Automation Coverage

41 Excel-documented cases plus 4 supporting checks (added during implementation for stronger coverage, e.g. verifying cart contents match exactly) = **45 automated scenarios**, executed across 3 browsers = **135 total test runs**.

- **90 passing** — confirms correct, working behaviour
- **45 failing** — each one a regression check for one of 15 confirmed, documented defects.

---

## 4. CI/CD: Two-Tier Pipeline

The initial CI setup ran the full 135-test suite as a single job. This was replaced with a two-tier design after identifying a real production risk: a single combined pipeline always shows red (since 45 tests are intentional, permanent regression checks), meaning it could never safely gate a real release — an urgent, unrelated fix would be blocked by pre-existing, already-known issues every single time.

| Job | Runs | Blocking | Purpose |
|---|---|---|---|
| **Release Gate** | `--grep-invert @regression` (~90 tests, all genuinely working functionality) | Yes | Catches any regression a code change actually introduces |
| **Known Defects Tracker** | `--grep @regression` (15 known-defect tests) | No (`continue-on-error: true`) | Keeps documented defects visible to the team without ever blocking |

**Handling a brand-new, undiscovered bug during an urgent release** (a scenario considered during design, not just the steady-state case): a newly-discovered defect would initially show up as a failure in the blocking Release Gate. The correct response is not to silently bypass the pipeline — it is to (1) confirm the failure is unrelated to the change being shipped, (2) tag the new defect's test `@regression` in the same commit as the fix, converting it from "unknown, blocking" to "known, tracked," and (3) let the pipeline re-run, now correctly green on the gate while the tracker honestly records the new finding. Speed and honest tracking are kept together rather than traded off against each other.

---

## 5. Test Tagging Strategy

Chosen as the bonus item over parallel execution (the assignment offers "parallel execution or test tagging" as alternatives). Parallel execution is already in active use by default locally (Playwright auto-detects worker count), so tagging was the more meaningful additional deliverable to build deliberately.

- `@smoke` (5 scenarios): one representative check per stage of the critical user journey — login, access control, add-to-cart, cart state, checkout — covering the full pipeline with no redundancy.
- `@regression` (15 scenarios): a direct, literal mapping — every automated test where the manual test sheet records `Bug Found = Y`. Verified 1-to-1 consistent: every currently-failing test is tagged `@regression`, and every `@regression`-tagged test currently fails.

---

## 6. API Test Automation — Investigated Finding

SauceDemo was investigated for a real, callable backend API using the browser's Network tab, with caching explicitly disabled to avoid false positives from stale cached requests (an initial check without disabling cache produced a misleading result — a stray cached request that did not reproduce once cache was properly cleared). Across login, cart, checkout, and PDF-receipt generation, no genuine backend API call was found; the PDF receipt itself is generated entirely client-side using the `react-pdf` JavaScript library, with no server round-trip.

---

## 7. Known Flakiness — Investigated and Documented

A small number of timing-sensitive tests (`TC-STD-16`, occasionally `TC-ERR-02`) showed intermittent failures specifically on WebKit when the full suite runs under parallel load (6 auto-detected workers locally). Each passes reliably in isolation or on Chromium/Firefox.

**Investigation process:** confirmed the pattern was WebKit-specific and full-suite-specific (not reproducible when the affected file was run alone) — evidence of CPU resource contention across simultaneously-active browser instances, not an application defect. Two mitigations were applied: extending the explicit visibility timeout, and verifying the menu container's render (not just one child link) before interacting with it. These measurably reduced the frequency of the flake but did not guarantee elimination under maximum parallel load — a genuine, accepted characteristic of running many browser instances concurrently, not a code defect.

This is a known, accepted trade-off: parallel execution provides significant speed benefits (roughly 6x faster locally than sequential) at the cost of occasional timing sensitivity under the heaviest load.

---

## 8. Additional Quality Improvements

- **Custom dashboard** (`dashboard/index.html`): reads Playwright's JSON output directly, showing pass/fail totals, per-user and per-browser breakdowns, and a defect breakdown by priority — built on top of the standard HTML report rather than replacing it.
- **Husky pre-commit hook**: runs `@smoke` automatically before every commit; verified to both permit a passing commit and actively block a failing one, with the failure message and blocked commit confirmed directly in testing.
- **Two-tier CI redesign**: see Section 4 —addressing a real architectural gap rather than adding a standalone feature.

**Considered but not built:** visual regression (pixel-level) testing for the `visual_user` cosmetic findings. A same-run comparison approach — capturing both `standard_user` and `visual_user` screenshots within a single test execution, rather than comparing against a stored baseline file — would avoid cross-environment rendering mismatches entirely (a real limitation identified during design: a baseline generated on one OS/rendering engine produces false failures when compared against a different one). Deprioritized in favor of the CI architecture work given the time available; a natural next step.

---

## 9. Assumptions

- No formal Product Owner/Business Analyst was available to confirm priority assignments; priority was set by the candidate based on business-risk reasoning (see Section 2), which in a real team would typically be confirmed with a BA.
- "Automate selected test cases" was interpreted as automating a risk-based majority, not necessarily all documented cases — with explicit, stated reasoning for every case left manual.
- Manual test documentation format: Excel, chosen from the assignment's explicitly allowed options, and consistent with a real-world tool already used by the candidate professionally.
- Deadline and submission mechanism were confirmed directly with the assignment issuer rather than assumed.
