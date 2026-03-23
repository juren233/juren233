# Homepage Poster Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild the public homepage into a saturated digital-poster experience with blur-driven motion, restrained contact entry, and preserved journal/admin functionality.

**Architecture:** Keep the application as a server-rendered Hono site in `src/app.ts`, but replace the homepage visual system, layout, and lightweight browser interactions. Lock the redesign with homepage rendering tests first, then implement the new poster composition, modal treatment, and responsive behavior without changing the existing data and admin flows.

**Tech Stack:** TypeScript, Hono, inline HTML/CSS/JS, Vitest

---

### Task 1: Lock the new homepage structure with tests

**Files:**
- Modify: `F:\CodeXProjects\juren233web\tests\app.test.ts`

**Step 1: Write the failing test**

Add or update homepage assertions so the rendered HTML includes:
- `juren233.top`
- the latest post title
- a restrained cooperation trigger label
- the modal container id
- poster-oriented copy or structure markers

Also assert older visual language is gone, for example text that implies the current apple-green treatment or the current cooperation wording.

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/app.test.ts`
Expected: FAIL because the old homepage structure and copy still render.

**Step 3: Write minimal implementation**

Update only the homepage-facing assertions needed to describe the intended redesign, without changing admin tests or feed behavior.

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/app.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/app.test.ts
git commit -m "test: lock homepage poster structure"
```

### Task 2: Build the poster visual system

**Files:**
- Modify: `F:\CodeXProjects\juren233web\src\app.ts`

**Step 1: Replace the homepage visual thesis inputs**

Write the three frontend-skill anchors directly into the homepage implementation:
- visual thesis: a saturated digital poster with layered blur fields and oversized branding
- content plan: hero, journal slice, contact entry, final identity note
- interaction thesis: hero drift, scroll-linked focus shift, modal blur bloom

**Step 2: Replace the CSS tokens and layout**

Implement a completely new visual system:
- saturated background palette
- expressive typography
- strong poster composition
- limited section count
- no soft green glass aesthetic
- no generic card-first layout

**Step 3: Rebuild the hero**

Render:
- minimal navigation
- dominant `juren233.top` brand treatment
- short supporting copy
- one restrained primary action
- one strong visual anchor made from color fields, blur layers, and poster marks

**Step 4: Rebuild the latest update section**

Render the latest post as an editorial slice integrated into the poster language rather than a standard content card. Preserve readable title, date, body excerpt, and tags.

**Step 5: Rebuild the contact entry**

Change the cooperation entry so it feels like a creative access point rather than a business CTA. Use restrained copy and keep the trigger integrated with the page composition.

**Step 6: Keep the modal form working**

Preserve the existing form fields and submit flow while redesigning the modal shell, overlay, and typography to match the poster aesthetic.

**Step 7: Run homepage test**

Run: `npm test -- tests/app.test.ts`
Expected: PASS

**Step 8: Commit**

```bash
git add src/app.ts tests/app.test.ts
git commit -m "feat: redesign homepage as poster experience"
```

### Task 3: Add motion and responsive refinement

**Files:**
- Modify: `F:\CodeXProjects\juren233web\src\app.ts`

**Step 1: Implement motion behavior**

Add lightweight inline JS for:
- modal open/close
- async form submit
- scroll-linked poster transforms
- blur/focus reveal behavior

**Step 2: Respect reduced motion**

Ensure motion shuts down or simplifies when `prefers-reduced-motion` is enabled.

**Step 3: Recompose for mobile**

Adjust layout, type scale, blur intensity, and spacing so mobile reads like a deliberate vertical poster rather than a compressed desktop layout.

**Step 4: Smoke-test type safety**

Run: `npm run typecheck`
Expected: PASS

**Step 5: Re-run all tests**

Run: `npm test`
Expected: PASS

**Step 6: Commit**

```bash
git add src/app.ts
git commit -m "refactor: refine homepage motion and responsive behavior"
```

### Task 4: Verify final output before claiming completion

**Files:**
- Modify: `F:\CodeXProjects\juren233web\src\app.ts`
- Modify: `F:\CodeXProjects\juren233web\tests\app.test.ts`

**Step 1: Review the rendered homepage in a browser**

Run: `npm run dev`
Expected: local Worker starts successfully for visual review.

Check:
- first viewport feels like a poster, not a generic landing page
- cooperation entry does not feel commercial
- blur enhances hierarchy instead of washing out readability
- desktop and mobile both feel intentional

**Step 2: Make only minimal polish fixes**

If needed, adjust spacing, copy, blur intensity, or contrast without changing structure.

**Step 3: Run final verification**

Run:
- `npm run typecheck`
- `npm test`

Expected:
- TypeScript exits cleanly
- Vitest passes

**Step 4: Commit**

```bash
git add src/app.ts tests/app.test.ts
git commit -m "chore: finalize homepage poster redesign"
```
