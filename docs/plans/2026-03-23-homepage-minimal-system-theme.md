# Homepage Minimal System Theme Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Clear the current public homepage and rebuild it as a minimal, multi-section homepage that follows system light/dark mode while preserving `/api` and `/admin` behavior.

**Architecture:** Keep the existing Hono application and all non-homepage routes intact, but replace the public homepage rendering path with a newly structured page. The implementation must explicitly remove the current homepage DOM and styling assumptions before rebuilding the page from scratch.

**Tech Stack:** TypeScript, Hono, inline HTML/CSS/JS, Vitest

---

### Task 1: Lock the blank-slate homepage contract with tests

**Files:**
- Modify: `F:\CodeXProjects\juren233web\tests\app.test.ts`

**Step 1: Write the failing test**

Update homepage assertions so they require:
- `juren233.top`
- contact entry text
- latest update title
- modal container
- new ordering appropriate for the minimal homepage

Also forbid obvious carryovers from the current failed redesign:
- stage poster wording
- poster/blur branding language
- old CTA wording

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/app.test.ts`
Expected: FAIL because the current homepage still reflects the previous redesign language.

**Step 3: Tighten only the public contract**

Do not alter the feed expectations or unrelated admin/access assertions.

**Step 4: Run test again**

Run: `npm test -- tests/app.test.ts`
Expected: FAIL for the intended homepage reasons.

**Step 5: Commit**

```bash
git add tests/app.test.ts
git commit -m "test: lock minimal homepage contract"
```

### Task 2: Clear the existing public homepage and rebuild the HTML structure

**Files:**
- Modify: `F:\CodeXProjects\juren233web\src\app.ts`

**Step 1: Preserve backend behavior**

Do not change:
- repository logic
- `/api` routes
- `/admin` pages
- auth/login flow

**Step 2: Remove the current homepage-specific structure**

Delete or replace:
- current public homepage skeleton
- current public homepage copy hierarchy
- current public homepage visual framing assumptions

**Step 3: Rebuild `home()` from scratch**

Create a new multi-section public page with:
- opening section
- entry section
- update section
- closing section

**Step 4: Keep modal functionality intact**

Preserve the form fields and async submit behavior while integrating them into the new page.

**Step 5: Run homepage test**

Run: `npm test -- tests/app.test.ts`
Expected: PASS

**Step 6: Commit**

```bash
git add src/app.ts tests/app.test.ts
git commit -m "feat: rebuild homepage from blank slate"
```

### Task 3: Replace the public CSS with a system-theme minimal design

**Files:**
- Modify: `F:\CodeXProjects\juren233web\src\app.ts`

**Step 1: Remove old homepage styling assumptions**

Replace the previous public-homepage:
- dramatic poster tokens
- strong blur composition
- large-stage layout assumptions
- old navigation styling if tied to the homepage

**Step 2: Implement system theme support**

Add a public homepage CSS system that:
- follows light mode by default
- adapts in dark mode with `prefers-color-scheme`
- preserves the same structure across themes

**Step 3: Keep the page minimal**

Use:
- restrained spacing
- simple surfaces
- low-noise contrast
- careful typography

Avoid:
- card grids
- giant stacked display effects
- loud gradients
- decorative blur-driven composition

**Step 4: Add small interaction states**

Implement subtle:
- section reveal or entrance behavior
- hover/focus states
- modal transitions

Respect `prefers-reduced-motion`.

**Step 5: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

**Step 6: Run full test suite**

Run: `npm test`
Expected: PASS

**Step 7: Commit**

```bash
git add src/app.ts
git commit -m "refactor: add minimal system-themed homepage"
```

### Task 4: Verify the homepage truly starts from a cleared slate

**Files:**
- Modify: `F:\CodeXProjects\juren233web\src\app.ts`

**Step 1: Start local preview**

Run: `npm run dev`
Expected: local Worker starts successfully.

**Step 2: Visually verify**

Check:
- current public homepage is gone
- no leftover stage-poster or previous homepage framing remains
- page is minimal in both light and dark themes
- entry and update are present but restrained
- homepage reads like a new page, not a revision of the old one

**Step 3: Make only minimal polish fixes**

Adjust copy, spacing, contrast, or ordering only as needed.

**Step 4: Run final verification**

Run:
- `npm run typecheck`
- `npm test`

Expected:
- TypeScript passes
- Vitest passes

**Step 5: Commit**

```bash
git add src/app.ts tests/app.test.ts
git commit -m "chore: finalize minimal homepage rebuild"
```
