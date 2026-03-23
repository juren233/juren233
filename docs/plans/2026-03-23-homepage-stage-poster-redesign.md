# Homepage Stage Poster Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild the public homepage as a new stage-poster composition while leaving `/api` and `/admin` behavior intact.

**Architecture:** Keep the existing Hono app, repository logic, and admin routes, but replace the public homepage generation in `src/app.ts` with a newly structured page. The implementation must not preserve the current homepage skeleton; instead it should create a new information hierarchy and new CSS/JS behavior around the same public data and modal submission flow.

**Tech Stack:** TypeScript, Hono, inline HTML/CSS/JS, Vitest

---

### Task 1: Lock the new homepage hierarchy with tests

**Files:**
- Modify: `F:\CodeXProjects\juren233web\tests\app.test.ts`

**Step 1: Write the failing test**

Update the homepage test to assert the new public contract:
- homepage contains `juren233.top`
- homepage contains the latest post title
- homepage contains a restrained contact-entry trigger
- homepage contains the modal container
- homepage contains stage/poster vocabulary

Also assert the old homepage language is gone:
- no `apple green`
- no `打开合作申请`
- no `single update`
- no copy that implies the old homepage framing

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/app.test.ts`
Expected: FAIL because the current homepage still reflects the old public structure.

**Step 3: Write minimal test wording**

Keep assertions focused on hierarchy and identity, not on brittle exact layout wording.

**Step 4: Run test to verify it still fails for the expected reason**

Run: `npm test -- tests/app.test.ts`
Expected: FAIL on the new homepage expectations, not due to syntax or unrelated behavior.

**Step 5: Commit**

```bash
git add tests/app.test.ts
git commit -m "test: lock stage-poster homepage contract"
```

### Task 2: Replace the public homepage structure

**Files:**
- Modify: `F:\CodeXProjects\juren233web\src\app.ts`

**Step 1: Keep non-homepage behavior untouched**

Do not alter:
- repository interfaces
- `/api` routes
- `/admin` pages
- login/auth behavior

Only replace the public homepage rendering path and its supporting CSS/JS.

**Step 2: Rewrite the homepage composition**

Rebuild `home()` so the public page hierarchy becomes:
1. brand
2. contact entry
3. latest update

Do not preserve the old “hero + lower sections” skeleton for convenience.

**Step 3: Replace the hero/stage markup**

Implement a new first viewport that:
- does not use a standard left-copy/right-box structure
- makes the brand the dominant element
- embeds visual depth directly into the stage
- introduces the contact entry as the next-most-prominent action

**Step 4: Reposition the latest update**

Render the latest update as a lighter broadcast layer rather than a primary content block. Preserve title, date, summary, and tags in some form.

**Step 5: Keep the modal flow functional**

Retain the current form fields and async submit behavior while integrating the modal into the new homepage composition.

**Step 6: Run homepage test**

Run: `npm test -- tests/app.test.ts`
Expected: PASS

**Step 7: Commit**

```bash
git add src/app.ts tests/app.test.ts
git commit -m "feat: rebuild homepage as stage poster"
```

### Task 3: Replace the CSS system and motion model

**Files:**
- Modify: `F:\CodeXProjects\juren233web\src\app.ts`

**Step 1: Remove the old homepage visual tokens**

Delete or replace the old public-homepage tokens and patterns associated with:
- apple-green palette
- soft glass homepage language
- old hero motion variables
- old boxed visual framing

**Step 2: Add the new stage-poster visual system**

Implement:
- new color tokens
- new type hierarchy
- new depth and blur treatments
- new spacing and responsive rules

**Step 3: Add restrained motion**

Implement:
- entrance presence
- scroll-linked depth shift
- modal focus transition

Respect `prefers-reduced-motion`.

**Step 4: Recompose for mobile**

Ensure mobile uses a dedicated vertical hierarchy:
- brand first
- contact entry second
- latest update third

**Step 5: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

**Step 6: Re-run all tests**

Run: `npm test`
Expected: PASS

**Step 7: Commit**

```bash
git add src/app.ts
git commit -m "refactor: replace homepage visual system"
```

### Task 4: Verify the redesign as a full rewrite, not a reskin

**Files:**
- Modify: `F:\CodeXProjects\juren233web\src\app.ts`

**Step 1: Start local preview**

Run: `npm run dev`
Expected: local Worker starts.

**Step 2: Review the homepage manually**

Check:
- it no longer reads like the current homepage structure
- brand is first, contact entry second, latest update third
- there is no obvious right-side visual card inherited from the old layout
- the contact entry does not feel commercial
- mobile composition is distinct and readable

**Step 3: Make only minimal polish fixes**

If needed, adjust layout, copy, spacing, or blur strength without reintroducing the old structure.

**Step 4: Run final verification**

Run:
- `npm run typecheck`
- `npm test`

Expected:
- TypeScript exits cleanly
- Vitest passes

**Step 5: Commit**

```bash
git add src/app.ts tests/app.test.ts
git commit -m "chore: finalize homepage stage poster rewrite"
```
