# Homepage Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild the juren233 main homepage into a more minimal, Apple-like landing page that highlights only `share`, preserves the journal, and moves the cooperation form into a blur modal.

**Architecture:** Keep the app as a server-rendered single-file Hono view in `src/app.ts`, but replace the homepage HTML, CSS, and lightweight client-side interactions. Protect the redesign with homepage rendering tests in `tests/app.test.ts` so the main information architecture stays stable during future visual changes.

**Tech Stack:** TypeScript, Hono, inline HTML/CSS/JS, Vitest

---

### Task 1: Lock the new homepage information architecture with tests

**Files:**
- Modify: `tests/app.test.ts`

**Step 1: Write the failing test**

Add assertions that the homepage renders:
- `share.juren233.top`
- a cooperation trigger button label
- a modal container id
- journal content

Also assert old secondary entry labels like `pods.juren233.top` are not present.

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/app.test.ts`
Expected: FAIL because the old homepage still renders multiple subdomain entries and no modal trigger.

**Step 3: Write minimal implementation**

Update homepage rendering in `src/app.ts` to satisfy the new assertions without touching unrelated admin functionality.

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/app.test.ts`
Expected: PASS

### Task 2: Rebuild the homepage visual system and interaction layer

**Files:**
- Modify: `src/app.ts`

**Step 1: Replace homepage structure**

Implement a simplified page structure:
- Hero with brand, minimal copy, and single `share` entry
- Journal section
- CTA area with cooperation button
- Blur modal with the existing cooperation form

**Step 2: Add motion and material treatment**

Add:
- scroll-reactive hero transforms via CSS variables updated in JS
- reveal-on-scroll for key sections
- blur, translucent surfaces, and restrained highlights

**Step 3: Keep client behavior minimal**

Use small inline JS to:
- submit the cooperation form
- open/close the modal
- update scroll-linked transforms
- respect reduced motion

**Step 4: Verify manually through tests/typecheck**

Run:
- `npm test`
- `npm run typecheck`

Expected:
- all tests pass
- TypeScript exits cleanly
