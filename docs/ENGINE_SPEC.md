# Sprout Lesson Engine — v2 Spec

This document is the contract between the lesson JSON schema and the React component layer.
It is the **single source of truth** for what each step type must do and how it must behave.
All changes to the engine must be made here first, then reflected in code.

---

## Design principles (read first — these drive every decision)

1. **No screen exists that a paragraph of text + a "Got it" button could replace.** If a step only conveys information, it's the wrong step type.
2. **One narrative spine per lesson.** The lesson has a named protagonist (`narrative.protagonist`) and opens with a hook the lesson resolves. Character names in individual steps should default to the protagonist unless a step explicitly introduces someone new (e.g. the transfer step).
3. **Feedback diagnoses, it does not solve.** A wrong answer surfaces the likely misconception and prompts a retry. It does **not** state the correct answer. Only after the student has a second chance does the full explanation appear.
4. **Every step has a callable shape.** Progress, correctness, and time-on-step are emitted as events so the teacher dashboard and analytics can consume them without engine changes.
5. **Accessibility is not a pass at the end.** Every new step type must ship with a keyboard interaction model and a screen-reader contract, defined below.

---

## Step types

There are two tiers:
- **Existing** step types (kept from v1, styling refreshed): `multiple_choice`, `numeric_input`, `matching`, `paycheck_read`.
- **New** step types (this spec): `scenario_hook`, `predict`, `reveal_sequence`, `drag_categorize`, `slider_explore`, `bracket_math`, `build_artifact`, `transfer_scenario`, `reflection`.

The old `learn` step type is **deprecated**. No new lesson should use it. The information that used to live in `learn` blocks is now carried by the captions inside `reveal_sequence` steps and by the setup text in other step types.

---

### 1. `scenario_hook`

**Purpose:** Open the lesson with a concrete situation involving the protagonist. No right answer, no friction — just a CTA to start.

**Schema:**
```
{
  type: "scenario_hook",
  persona: string,                    // references narrative.protagonist
  message: { format: string, body: string },
  cta: string                          // button label, e.g. "Help Jordan"
}
```

**Rendering:**
- Message styled as a text/chat bubble from the persona (avatar optional, name shown).
- Single primary button with the CTA label.
- No progress bar increment on completion (this is setup, not a question).

**Events emitted:** `step_started`, `step_completed`.

**Keyboard/a11y:** CTA is a `<button>`. Message bubble has `role="figure"` with `aria-label` describing the speaker.

---

### 2. `predict`

**Purpose:** Surface the student's prior belief *before* teaching. Creates a callback anchor for later reflection. No answer is correct.

**Schema:**
```
{
  type: "predict",
  prompt: string,
  subtitle: string,
  options: [{ id: string, label: string }],
  callback_at_step: string,           // step id where this prediction is referenced
  callback_phrasing: string            // template with {label}
}
```

**Rendering:**
- Options rendered as tappable cards.
- When one is selected, it highlights — no right/wrong styling.
- Selection is stored in lesson state under `predictions[step_id] = option_id`.
- Primary button "Continue" advances.

**Events emitted:** `step_started`, `prediction_made` (payload: `{option_id, label}`), `step_completed`.

**Keyboard/a11y:** Options are `role="radio"` inside `role="radiogroup"`. Arrow keys move selection.

---

### 3. `reveal_sequence`

**Purpose:** Progressive disclosure of items (the paystub lines). Replaces the `learn` step type. The student *builds* the concept by revealing it line by line, with a caption teaching each element as it appears.

**Schema:**
```
{
  type: "reveal_sequence",
  heading: string,
  instruction: string,
  artifact_template: string,          // "paystub" | "budget" | "contract" etc.
  subject_name: string,
  period: string,
  items: [
    {
      id: string,
      label: string,
      value: number,                   // positive for totals, negative for deductions
      kind: "total" | "deduction",
      caption: string,                 // ONE sentence (hard cap: 140 chars)
      animate_in: boolean              // optional, defaults false
    }
  ],
  completion_prompt: string            // shown after all items revealed, before "Continue"
}
```

**Rendering:**
- Artifact rendered as a styled paystub (or whatever `artifact_template` specifies).
- Each item initially shown as a blurred/dimmed row labeled "Tap to reveal".
- Tapping a row: row animates to full opacity, caption appears *beside or below* the row (not as a modal), caption stays visible.
- `kind: "total"` rows render with bolder type and a divider above.
- Items must be revealed in array order (the next row is the only interactive one).
- After all items are revealed, `completion_prompt` fades in above a "Continue" button.

**Caption constraint:** Max 140 characters. Enforced at build time. This is the single most important rule for keeping reveal steps from becoming text-walls.

**Events emitted:** `step_started`, `item_revealed` (per item), `step_completed`.

**Keyboard/a11y:**
- Each unrevealed row is a `<button>` with `aria-label="Reveal {label}"`.
- On reveal, focus moves to the newly revealed caption (which has `tabindex="-1"`), so screen readers announce it.
- Respect `prefers-reduced-motion`: skip the fade animation but still reveal the content.

---

### 4. `drag_categorize`

**Purpose:** Student sorts chips into buckets. Tests categorical understanding (mandatory vs optional deductions).

**Schema:**
```
{
  type: "drag_categorize",
  prompt: string,
  chips: [{ id: string, label: string, correct_bucket: string }],
  buckets: [{ id: string, label: string }],
  chip_feedback: { [chip_id]: { wrong: string } },
  completion_feedback: string
}
```

**Rendering:**
- Chips start in a neutral pool at top.
- Two (or more) labeled drop zones below.
- Drop on wrong bucket: chip bounces back to pool, shows `chip_feedback[chip_id].wrong` as a transient tooltip on the chip (2s auto-dismiss).
- Drop on correct bucket: chip snaps into place and locks.
- Step completes when all chips are correctly placed.
- `completion_feedback` appears above the Continue button.

**Events emitted:** `step_started`, `chip_misplaced` (per wrong drop), `chip_placed` (per correct drop), `step_completed`. Analytics uses `chip_misplaced` count as a difficulty signal.

**Keyboard/a11y (required):**
- Tab cycles through chips.
- Space/Enter picks up a chip (announce "picked up {label}").
- Arrow keys move focus to buckets.
- Space/Enter drops (announce "placed {label} in {bucket}" or "{label} doesn't belong there" for wrong).
- Escape cancels a pickup.
- Every chip has a visible text label — never color-only.

---

### 5. `slider_explore`

**Purpose:** Student drags a slider and observes a live visualization. The pattern *is* the teaching. A check question follows.

**Schema:**
```
{
  type: "slider_explore",
  prompt: string,
  slider: {
    label: string, min: number, max: number, step: number,
    default: number, format: string, snap_markers: number[]
  },
  visualization: string,               // component key: "progressive_tax_bar" etc.
  data_function: string,               // pure function name the viz calls
  live_readout: string,                // template with {salary}, {rate}
  question: string,
  options: string[],
  correct_answer: number,
  feedback: { correct: string, incorrect: string }
}
```

**Rendering:**
- Slider component (full width, thumb with live value label).
- `snap_markers` render as tick marks and snap gently when dragged near.
- Visualization renders below slider, updating on every value change.
- `live_readout` is a live region above the question — updated but not disrupting focus.
- Question/options appear below, inactive until the student has moved the slider at least once (soft gate; recorded as `slider_touched` event).

**Data function:** `data_function` is a pure JS function registered in a lookup table. `us_federal_effective_rate_2024(salary) -> rate`. Adding a new slider type = register a new function. No hardcoding in components.

**Events emitted:** `step_started`, `slider_touched`, `slider_released` (final value), question events, `step_completed`.

**Keyboard/a11y:**
- Standard `<input type="range">` with ARIA value attributes.
- Arrow keys: ±step; Page keys: ±10× step; Home/End: min/max.
- Live readout has `aria-live="polite"` and throttles to ~200ms so screen readers aren't spammed.

---

### 6. `bracket_math`

**Purpose:** Dismantle the "raise into a higher bracket means I take home less" myth. This is the single highest-stakes screen in the lesson. Visualization shows stacked bars with only the marginal dollars highlighted.

**Schema:**
```
{
  type: "bracket_math",
  setup: { persona: string, message: string },
  pre_question: { prompt, options, correct_answer },
  visualization: {
    type: "stacked_bracket_bars",
    before: { salary, label },
    after:  { salary, label },
    brackets_2024_single: [{ upto, rate }],
    animate: string,                   // e.g. "sweep_bracket_lines"
    highlight_delta: boolean,
    show_running_totals: boolean,
    readout_lines: string[]            // templates: {before_tax}, {after_tax}, {marginal_rate}, {takehome_delta}
  },
  post_reveal_question: { prompt, options, correct_answer, feedback }
}
```

**Rendering contract:**

1. Persona message at top.
2. `pre_question` appears (student answers YES/NO on whether Jordan should worry). This answer is stored but the "real" right/wrong isn't scored here — it's re-asked after the visualization.
3. After the pre-question submit, the **visualization sweeps in**:
   - Two stacked horizontal bars: "Before $40,000" and "After $42,000".
   - Each bar is segmented by tax bracket (10%, 12%, 22%).
   - The `animate: "sweep_bracket_lines"` animation draws the bracket thresholds as vertical lines moving left-to-right, revealing which segments apply.
   - The "after" bar has a visually distinct highlight on the marginal slice (the $2,000 above the bracket line).
   - Running totals appear to the right of each bar: "Federal tax: $X", "Take-home: $Y".
   - `readout_lines` render below, one per line, typed in with a short delay between lines.
4. `post_reveal_question` appears after the animation completes, re-asking the real question. This one is graded.

**Tax math (implementation detail, not in JSON):**
- For each bracket `{upto, rate}`, tax on salary `S` is:
  - For each bracket in order, `min(S, upto) - prev_upto` × rate. Cap at 0 if already past.
- Marginal rate = rate of the bracket that contains `S`.
- Take-home = salary − total tax. (For this lesson we ignore FICA and state in this viz — scope creep killer.)

**Events emitted:** `pre_question_answered`, `visualization_completed`, `post_question_answered`, `bracket_myth_resolved` (true/false based on whether they flipped their answer).

**The `bracket_myth_resolved` event is the most valuable analytics signal in the entire lesson.** It tells a teacher exactly who walked into class believing a raise can cost them money and who left understanding otherwise. Surface it in the teacher dashboard.

**Keyboard/a11y:**
- Visualization has a textual equivalent exposed via a "Show as table" toggle: before/after side-by-side table with the same numbers.
- Animation respects `prefers-reduced-motion`: skip sweep, render final state immediately.

---

### 7. `build_artifact`

**Purpose:** The culminating performance task. Student fills in a paystub (or other artifact template) with real numbers, sees running totals update, and gets a correct-or-incorrect result per field. Doubles as the final evaluation — there is no separate quiz.

**Schema:**
```
{
  type: "build_artifact",
  artifact: "paystub" | "budget" | ...,
  intro: string,
  subject: { name, period, gross },
  rates_panel: [
    { id, label, rate?: number, flat?: number }
  ],
  fields: [
    {
      id: string,
      kind: "numeric" | "computed",
      expected: number,
      expected_formula?: string,        // for computed fields, human-readable for docs
      tolerance: number,
      hint_on_wrong: string
    }
  ],
  running_totals: { show: boolean, line_above_net: string },
  on_complete: { message, highlight_net: boolean }
}
```

**Rendering contract:**

- Layout: styled paystub on the left/center, rates panel on the right (on mobile, rates panel is above paystub).
- Each field is a numeric input shaped like a paystub line.
- As the student enters values, a running "Total deductions so far" updates above the net pay field.
- Field states:
  - **Empty** — neutral.
  - **Filled, not yet checked** — neutral, just a value.
  - **Checked, correct** — green check icon, input locks.
  - **Checked, wrong** — red warning icon, `hint_on_wrong` appears inline below the field. Input stays editable.
- Submit button labeled "Check my paystub" at the bottom. Checks all fields at once.
- `computed` fields are computed on the fly as the student fills dependencies, but checked against `expected` on submit (so they can still get it wrong if they do the arithmetic wrong).
- On full correctness: `on_complete.message` appears, the Net Pay line gets a highlight flourish (if `highlight_net`), Continue button appears.

**Animation:** Running totals count up rather than snap. Net Pay line gets a brief pulse/glow on final correctness. Both animations respect `prefers-reduced-motion`.

**Events emitted:** `field_checked` (per field, per attempt, with correct/incorrect), `artifact_completed`, `step_completed`. `attempts_per_field` is the key retention signal.

**Keyboard/a11y:**
- Inputs are `<input type="number" inputmode="decimal">` with labeled `<label>`s.
- Tab order: input, input, input, …, submit button.
- On wrong: focus moves to the first wrong field and the hint is announced via live region.

---

### 8. `transfer_scenario`

**Purpose:** Near-transfer question using a *different* character than the lesson's protagonist. Tests whether the student can apply the concept to a new case rather than just recognize it in the familiar one.

**Schema:**
```
{
  type: "transfer_scenario",
  persona: string,                     // NOT the protagonist
  message: string,
  prompt: string,
  estimated_net_monthly: number,       // used by the viz to ground the answer
  options: string[],
  correct_answer: number,
  feedback: { correct, incorrect }
}
```

**Rendering:**
- Visually distinct from protagonist screens: different avatar, a label ("New person!") for the first appearance.
- Otherwise works like a contextualized MCQ with supporting numbers available.

**Events emitted:** Standard question events, plus `transfer_attempted` for analytics.

---

### 9. `reflection`

**Purpose:** Close the loop. Call back to the `predict` step from the start. Have the student articulate the lesson's thesis in their own words (or pick from a bank of sentences).

**Schema:**
```
{
  type: "reflection",
  callback_to: string,                 // step id of the earlier predict
  callback_phrasing: string,           // template with {predicted_label}, {accuracy_line}
  prompt: string,
  mode: "phrase_pick" | "free_text",
  phrase_bank: string[],
  allow_custom: boolean,
  no_grading: true,
  completion_message: string
}
```

**Rendering:**
- Top: callback message referencing the prediction. If the prediction was "taxes", `{accuracy_line}` = "Turns out you were exactly right." If it was "savings", `{accuracy_line}` = "Close — part of it can go to savings (401(k)), but most of it went to taxes."
- Prompt shown.
- If `mode: phrase_pick`: phrase bank as tappable cards. Student can pick one, or if `allow_custom`, type their own into a text area.
- No grading, no right answer.
- `completion_message` appears on selection.

**Events emitted:** `reflection_submitted` (with the selected phrase or custom text — **PII warning: don't store custom text without consent**), `step_completed`.

---

## Lesson-level features

### Progress bar
- Replace "X / 16 correct" with "X of Y screens". Correctness is not the progress metric — completion is. This removes the anxiety-inducing counter that made the current lesson feel like a test.
- Optional: a small completion dot per screen (filled as they advance).

### Time tracking
- Engine emits `step_entered` and `step_completed` with timestamps. Teacher dashboard aggregates to `time_on_task`.
- If a student spends more than 3× median time on a step, emit `step_struggled` for analytics.

### Feedback policy (applies to every graded step)
- **First wrong:** Show only a diagnostic hint. Do not state the correct answer.
- **Second wrong on the same item:** Show the explanation and the correct answer. Move on.
- This replaces the current "reveal the answer, then let them retype it" loop.

### Performance task as final evaluation
- The `final_evaluation.mode: "performance_task"` on a lesson means: the last `build_artifact` step *is* the quiz. No separate quiz screen appears.
- The teacher dashboard reports per-field correctness on the artifact, not a letter grade.

### Teacher layer
- `teacher_layer` is consumed by a separate `/teacher/lessons/:id/plan` route.
- Class report fields are emitted as events and aggregated server-side per student.

### Accessibility gates
- Any new step type PR must include:
  - A keyboard-only walkthrough test (can you complete the step without a mouse?)
  - A screen-reader transcript (what is announced at each action?)
  - Contrast check against WCAG AA.

---

## File / code structure implications

Suggested layout under your existing React/Next.js app:

```
/components/lesson/
  LessonRunner.tsx                 # orchestrator; consumes JSON, renders steps in order
  StepRenderer.tsx                 # switch on step.type -> concrete component
  steps/
    ScenarioHook.tsx
    Predict.tsx
    RevealSequence.tsx
    DragCategorize.tsx
    SliderExplore.tsx
    BracketMath.tsx
    BuildArtifact.tsx
    TransferScenario.tsx
    Reflection.tsx
    MultipleChoice.tsx             # existing, restyled
    NumericInput.tsx               # existing, restyled
  visualizations/
    ProgressiveTaxBar.tsx
    StackedBracketBars.tsx
    Paystub.tsx                    # shared by RevealSequence and BuildArtifact
  widgets/
    Chip.tsx
    DropBucket.tsx
    RateCard.tsx
    RunningTotal.tsx
/lib/lesson/
  taxMath.ts                       # pure functions: effectiveRate, bracketTax, etc.
  dataFunctions.ts                 # registry: {us_federal_effective_rate_2024, ...}
  events.ts                        # typed event emitters
  state.ts                         # lesson state machine (predictions, answers, timings)
/types/
  lesson.ts                        # full TypeScript types for the schema above
```

---

## What "done" looks like

A lesson is ready for pilot when:
1. All 10 steps render and work on mobile and desktop.
2. Keyboard-only user can complete the entire lesson.
3. Screen reader announces each interaction correctly (spot-check: one run with VoiceOver).
4. `prefers-reduced-motion` is respected everywhere.
5. The teacher dashboard shows per-student completion, paystub field correctness, and the `bracket_myth_resolved` signal.
6. One real high school student (not on your team) completes the lesson in 8–11 minutes and can explain in their own words what gross vs net pay is.

Step 6 is the real bar. The other five are necessary but not sufficient.
