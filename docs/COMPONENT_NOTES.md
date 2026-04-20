# Component Design Notes \u2014 Sprout Paycheck Lesson v3

Five new components to author under `src/features/finance/`. Each one gets lazy-loaded by `SimulationEmbed` in `src/pages/Lesson.jsx`.

## Conventions every component must follow

These are pulled from `InterestCalculator.jsx` and `BudgetWalkthrough.jsx` \u2014 match them exactly.

- **Signature:** `export default function ComponentName({ scenarioId, onComplete })`. Call `onComplete()` with no argument when the student finishes the interaction. `scenarioId` is an optional string from the lesson JSON that lets the component branch on scenario (e.g. `"jordan-first-paycheck"` vs a future `"maria-first-paycheck"`).
- **Styling:** Inline `style={{}}` objects against a top-of-file `C` color token map. Copy the token map from `InterestCalculator.jsx` \u2014 do not introduce new colors.
- **No direct Supabase calls.** Everything the component needs should be expressible through props and scenario config. If the component needs the student's name, accept it as a prop; don't fetch it.
- **Animation:** framer-motion `motion.div` and `AnimatePresence`, matching existing components. Respect `prefers-reduced-motion` by checking `window.matchMedia("(prefers-reduced-motion: reduce)").matches` and skipping animations when true.
- **Mobile-first.** Every component must be usable at 375px wide. Test with DevTools at that width.
- **Complete button.** Every component must eventually show a primary "Continue" button wired to `onComplete()`. The button must not be skippable \u2014 it only appears once the interaction's done.
- **Keyboard & a11y.** All interactive elements reachable by keyboard. Drag-drop components must have a keyboard fallback (tab to chip, space to pick up, arrow to bucket, enter to drop).

## Component 1: `PaystubReveal.jsx`

**Purpose:** Progressive disclosure of Jordan's paystub. Six rows start blurred; student taps each to reveal. Replaces the "What is Gross Pay?" and "How Taxes Reduce Your Pay" text blocks from v1.

**Scenario data (hardcode in the component, keyed by `scenarioId`):**

```js
const SCENARIOS = {
  "jordan-first-paycheck": {
    name: "Jordan Martinez",
    period: "First paycheck \u2014 bi-weekly",
    rows: [
      { id: "gross",    label: "Gross Pay",          value:  2000.00, kind: "total",
        caption: "What Jordan's contract says she earns every two weeks \u2014 before anything is taken out." },
      { id: "fed",      label: "Federal Income Tax", value:  -160.00, kind: "deduction",
        caption: "Goes to the IRS. Pays for national programs \u2014 military, roads, agencies." },
      { id: "state",    label: "State Income Tax",   value:   -60.00, kind: "deduction",
        caption: "Jordan lives in Michigan. Nine states don't have this \u2014 Texas and Florida, for example." },
      { id: "ss",       label: "Social Security",    value:  -124.00, kind: "deduction",
        caption: "6.2% of gross. Funds retirement income Jordan will collect when she's older." },
      { id: "medicare", label: "Medicare",           value:   -29.00, kind: "deduction",
        caption: "1.45% of gross. Funds healthcare coverage at age 65+." },
      { id: "net",      label: "Net Pay",            value:  1627.00, kind: "total",
        caption: "What actually hits Jordan's bank account. (Her real check was $1,538 \u2014 she has one more deduction we'll uncover later.)",
        emphasis: true },
    ],
  },
};
```

**UI:** Paystub-styled card, rows revealed in order. Unrevealed rows render dimmed with "Tap to reveal" text. Tapping reveals the amount and shows the caption beside or beneath the row (depending on viewport). The `emphasis: true` row animates in with a subtle pulse. Continue button appears only after all rows are revealed.

**Reference:** `PaycheckStatement.jsx` for the paystub visual style. But we're not using supabase or the walkthrough nav from that file \u2014 just the stub layout.

## Component 2: `DeductionSorter.jsx`

**Purpose:** Drag-categorize exercise. Six chips, two buckets. Replaces the mandatory-vs-optional question.

**Scenario data:**

```js
const SCENARIOS = {
  "mandatory-vs-optional": {
    prompt: "Which of these come out of every paycheck \u2014 and which only if Jordan chooses them?",
    chips: [
      { id: "fed",      label: "Federal Income Tax", correct: "mandatory" },
      { id: "ss",       label: "Social Security",    correct: "mandatory" },
      { id: "medicare", label: "Medicare",           correct: "mandatory" },
      { id: "401k",     label: "401(k) contribution", correct: "optional"  },
      { id: "health",   label: "Health Insurance",   correct: "optional"  },
      { id: "union",    label: "Union Dues",         correct: "optional"  },
    ],
    buckets: [
      { id: "mandatory", label: "Every paycheck, no choice" },
      { id: "optional",  label: "Only if Jordan signs up" },
    ],
    hints: {
      fed:      "Federal tax is withheld by law \u2014 no opt-out.",
      ss:       "Social Security (6.2%) is part of FICA \u2014 mandatory.",
      medicare: "Medicare (1.45%) is part of FICA \u2014 mandatory.",
      "401k":   "401(k) is a retirement plan Jordan chooses to join.",
      health:   "Health insurance is an elected benefit \u2014 she can decline.",
      union:    "Union dues only apply if she's in a union role.",
    },
  },
};
```

**Library:** Use `@hello-pangea/dnd` (already installed). Mirrors the pattern from any existing drag-drop in the repo if present; otherwise, lift the basic draggable-chip / droppable-zone structure from their docs.

**Behavior:** Drop on wrong bucket \u2192 chip bounces back to pool and shows `hints[chipId]` as a small toast (use `sonner` from existing imports, or a transient inline tooltip on the chip for 2s). Drop on correct \u2192 chip locks in. Continue appears when all 6 are in the right bucket.

**Keyboard fallback:** Tab through chips, Space to pick up, Arrow keys to move focus to a bucket, Enter to drop, Escape to cancel. Announce state changes via `aria-live`.

## Component 3: `ProgressiveTaxSlider.jsx`

**Purpose:** Student drags a salary slider and watches effective federal tax rate climb. Replaces the "progressive tax" text block.

**Scenario data:** for `scenarioId: "us-federal-2024-single"`, hardcode the 2024 single-filer brackets:

```js
const BRACKETS_2024_SINGLE = [
  { upto:  11600, rate: 0.10 },
  { upto:  47150, rate: 0.12 },
  { upto: 100525, rate: 0.22 },
  { upto: 191950, rate: 0.24 },
  { upto: 243725, rate: 0.32 },
  { upto: 609350, rate: 0.35 },
  { upto: Infinity, rate: 0.37 },
];

function federalTaxOwed(salary, brackets) {
  let tax = 0;
  let prev = 0;
  for (const { upto, rate } of brackets) {
    if (salary <= prev) break;
    tax += (Math.min(salary, upto) - prev) * rate;
    prev = upto;
  }
  return tax;
}

function effectiveRate(salary, brackets) {
  return salary === 0 ? 0 : federalTaxOwed(salary, brackets) / salary;
}
```

**UI:**
- Radix `Slider` (already installed, or `@radix-ui/react-slider`). Range: $20,000 to $220,000, step $1,000, default $52,000. Snap markers at $25K / $52K / $95K / $180K.
- Live readout: "At $X, the effective federal rate is about Y%." Updates on every value change. `aria-live="polite"`, throttled to ~200ms.
- Visualization below: a single horizontal bar showing the salary segmented by bracket (10% blue, 12% slightly darker, 22% even darker, etc.), with the effective rate as a big number to the right. Use `recharts` if it helps, or a plain styled divs layout \u2014 whichever stays cleaner.
- Follow-up question appears only after the slider has been touched once: "What pattern are you seeing as salary goes up?" with 4 options \u2014 flat, progressive, regressive, random. Correct answer: progressive. On correct, Continue button appears.

## Component 4: `BracketMathViz.jsx`

**Purpose:** The centerpiece. Dismantles the "raise into a higher bracket = less take-home" myth. This is the single highest-stakes screen.

**Scenario data (`scenarioId: "jordan-raise-40k-to-42k"`):**

```js
const SCENARIOS = {
  "jordan-raise-40k-to-42k": {
    persona: { name: "Jordan", avatarColor: "#1B2B5E" },
    message: "My manager said I can get a $2,000 raise but warned me it might push me into a higher tax bracket and I'd take home less money overall. Should I turn it down??",
    before: { salary: 40000, label: "Jordan now" },
    after:  { salary: 42000, label: "Jordan with raise" },
    brackets: BRACKETS_2024_SINGLE, // reused from ProgressiveTaxSlider
  },
};
```

**Flow:**

1. Render Jordan's message in a chat-bubble card.
2. Pre-question: "Quick gut check \u2014 is Jordan right to worry?" Two options. Capture answer.
3. On submit, **sweep in the visualization**:
   - Two horizontal stacked bars, one labeled "Before $40,000", one "After $42,000".
   - Each bar is segmented by bracket (10%, 12%, 22% \u2014 she only touches the first three).
   - The "after" bar has a highlighted sliver representing the $2,000 raise, colored differently, sitting in the 22% bracket.
   - To the right of each bar, running totals: "Federal tax: $X", "Take-home: $Y".
   - Animate the bracket threshold lines sweeping in left-to-right. 800ms total. Respect reduced-motion.
4. Readout lines type in (300ms apart) below the viz:
   - "Before: Jordan owes about $Xbefore in federal tax."
   - "After: Jordan owes about $Xafter in federal tax."
   - "The extra $2,000 is taxed at 22% \u2014 not her whole salary."
   - "Take-home goes UP by about $Ydelta."
5. Post-question: "So what should you tell Jordan?" Four options. Correct: "Take the raise \u2014 she'll keep most of it."
6. On correct post-answer, if pre-answer was wrong, emit analytics event `bracket_myth_resolved` via `trackEvent`.

**"Show as table" toggle** in the top-right of the viz for screen-reader users: renders the same numbers as a table.

**Continue** appears after the post-question is answered correctly.

**Math:**
- `taxBefore = federalTaxOwed(40000, brackets)` \u2248 $4,566
- `taxAfter  = federalTaxOwed(42000, brackets)` \u2248 $4,806
- `deltaTax  = 240`, `deltaTakehome = 2000 - 240 = 1760`
- (Values shown to student rounded: "~$4,570", "~$4,810", "+$1,760")

## Component 5: `PaystubBuilder.jsx`

**Purpose:** Culminating performance task. Student fills in Jordan's paystub using rates. Doubles as the lesson's evidence of learning.

**Scenario data (`scenarioId: "jordan-build-full-paystub"`):**

```js
const SCENARIOS = {
  "jordan-build-full-paystub": {
    subject: { name: "Jordan Martinez", period: "Bi-weekly", gross: 2000.00 },
    rates: [
      { id: "fed",      label: "Federal Income Tax", rate: 0.08   },
      { id: "state",    label: "State Income Tax",   rate: 0.03   },
      { id: "ss",       label: "Social Security",    rate: 0.062  },
      { id: "medicare", label: "Medicare",           rate: 0.0145 },
      { id: "health",   label: "Health Insurance",   flat: 48.10  },
    ],
    fields: [
      { id: "fed",      expected: 160.00,  tolerance: 0.50, hint: "Federal is 8% of gross. Try $2,000 \u00d7 0.08." },
      { id: "state",    expected:  60.00,  tolerance: 0.50, hint: "State is 3% of gross. $2,000 \u00d7 0.03." },
      { id: "ss",       expected: 124.00,  tolerance: 0.50, hint: "Social Security is 6.2%. $2,000 \u00d7 0.062." },
      { id: "medicare", expected:  29.00,  tolerance: 0.50, hint: "Medicare is 1.45%. $2,000 \u00d7 0.0145." },
      { id: "health",   expected:  48.10,  tolerance: 0.10, hint: "Health insurance is a flat $48.10 \u2014 not a percentage." },
      { id: "net",      expected: 1578.90, tolerance: 1.00, hint: "Net = Gross minus every deduction. Add them up and subtract from $2,000.",
        computed: true },
    ],
  },
};
```

**UI:**

- Two-column layout on desktop (paystub left, rates panel right); stacked on mobile.
- Paystub shows Gross at top, then five deduction rows as labeled numeric inputs, then a Net Pay row at the bottom.
- Rates panel on the right lists each rate as a small card \u2014 reference, not interactive.
- Running total: as the student fills deductions, a "Total deductions so far" number counts up live above the Net Pay row. Use framer-motion to animate the number.
- On submit ("Check my paystub"): each field validated against `expected` \u00b1 `tolerance`.
  - Correct \u2192 green check icon, field locks.
  - Wrong \u2192 red warning icon, `hint` shown inline below, field stays editable.
- When all 6 fields are correct:
  - Net Pay row gets a brief pulse/glow.
  - Message appears: "This is Jordan's actual paystub. The $1,578.90 \u2014 that's what she told us at the start, once you include the health insurance she'd signed up for."
  - Continue button appears.
- Emit analytics event `paystub_builder_completed` via `trackEvent`, with per-field first-attempt correctness.

**Accessibility:**
- Every input has a `<label>`.
- `inputMode="decimal"` on the numeric inputs.
- On wrong submission, focus moves to the first wrong field and the hint is announced via `aria-live`.

---

## How they're wired into the engine

Add each of these to the switch inside `SimulationEmbed` in `src/pages/Lesson.jsx`. The existing block already has this shape:

```js
if (componentName === "BudgetWalkthrough") m = await import("@/features/finance/BudgetWalkthrough");
// ...
```

Add five new lines:

```js
else if (componentName === "PaystubReveal")        m = await import("@/features/finance/PaystubReveal");
else if (componentName === "DeductionSorter")      m = await import("@/features/finance/DeductionSorter");
else if (componentName === "ProgressiveTaxSlider") m = await import("@/features/finance/ProgressiveTaxSlider");
else if (componentName === "BracketMathViz")       m = await import("@/features/finance/BracketMathViz");
else if (componentName === "PaystubBuilder")       m = await import("@/features/finance/PaystubBuilder");
```

That's the entirety of the engine change.

---

## Analytics events to emit

Use `trackEvent` from `@/services/activity` (already imported in `Lesson.jsx`). Fire these from inside the relevant components:

- `trackEvent("paystub_revealed", { lesson_id, scenario_id, duration_seconds })` \u2014 from PaystubReveal on completion.
- `trackEvent("deductions_sorted", { lesson_id, wrong_drops_count })` \u2014 from DeductionSorter on completion.
- `trackEvent("progressive_tax_discovered", { lesson_id, correct_first_try })` \u2014 from ProgressiveTaxSlider.
- `trackEvent("bracket_myth_resolved", { lesson_id, pre_correct, post_correct })` \u2014 from BracketMathViz. This one is the most important.
- `trackEvent("paystub_builder_completed", { lesson_id, fields_correct_first_try, total_fields })` \u2014 from PaystubBuilder.

These are the signals the teacher dashboard will eventually consume.
