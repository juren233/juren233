# Homepage Stage Poster Redesign Design

**Date:** 2026-03-23

## Summary

Rebuild the public homepage as a new stage-poster page rather than modifying the current homepage structure. Keep `/api` and `/admin` behavior unchanged, but replace the public homepage composition, layout, visual system, and interaction model so the result no longer feels derived from the current page.

## Goals

- Treat the homepage as a full redesign, not a style refresh.
- Preserve the existence of:
  - brand homepage
  - latest update
  - contact entry
- Reorder the public information hierarchy to:
  1. brand
  2. contact entry
  3. latest update
- Make the page feel like a stage poster instead of a conventional website.
- Avoid commercial landing-page behavior and wording.
- Use blur as a spatial and atmospheric device rather than generic glass UI.

## Non-Goals

- No changes to `/api` routes.
- No changes to `/admin` pages or workflows.
- No new CMS structure.
- No incremental polishing of the current public homepage layout.

## Visual Thesis

The homepage should feel like a branded stage poster with one dominant composition, dramatic scale, controlled blur, and a clear sense of depth. It must no longer read like a left-text/right-card landing page.

## Content Plan

1. Main stage
   - brand is the dominant layer
2. Entry layer
   - contact entry becomes the primary interaction point after the brand
3. Broadcast layer
   - latest update becomes a lighter editorial signal
4. Closing identity note
   - minimal footer orientation only

## Interaction Thesis

- One strong entrance sequence for brand and background field.
- One scroll-linked depth shift using blur, offset, and focus.
- One modal transition where the page recedes into a blurred stage and the form becomes the only crisp layer.

## New Homepage Structure

### Layer 1: Main Stage

- The first viewport is built around the brand, not around explanatory copy.
- The brand name occupies the largest visual area and anchors the entire composition.
- The page should not split into a standard “copy column + visual card” arrangement.
- The dominant visual should feel like part of the stage itself, not a boxed panel placed on the right.

### Layer 2: Entry Layer

- The contact entry is the second priority after the brand.
- It should appear as a stage action marker, channel, strip, or embedded directional cue.
- It should feel discoverable and intentional, not promotional.
- Copy should remain restrained and non-commercial.

### Layer 3: Broadcast Layer

- The latest update remains present, but it becomes a current-broadcast signal rather than a full content block.
- It can behave like a stage note, current bulletin, or editorial annotation.
- It should remain readable and clearly connected to current activity.

## Art Direction

### Composition

- Build the page as one integrated composition rather than stacked modules.
- Use overlap, cropping, offset text, negative space, and depth before adding containers.
- Avoid obvious right-side hero boxes or inherited section cards.
- The page should still feel coherent if visible separators are removed.

### Typography

- Brand typography is the hero.
- Use one heavy display family and one supporting family at most.
- Allow intentional cropping, overhang, overlap, and edge contact.
- Supporting text must stay short and secondary.

### Color and Blur

- Use a dark stage base with saturated accents.
- Blur should create depth, light bloom, and focus hierarchy.
- Avoid turning blur into a universal treatment on every surface.
- Keep the number of accent hues limited and controlled.

## Copy Direction

- Brand first.
- Contact entry should read like an invitation or opening, not a business conversion CTA.
- Latest update copy should sound like a current signal, not like a blog section intro.
- Remove any leftover phrasing that sounds like template marketing copy or design commentary.

## Motion

- Entrance: introduce stage presence.
- Scroll: subtle focus and blur drift.
- Modal: stage recedes, form sharpens.
- Motion should be visible but not noisy.
- Respect `prefers-reduced-motion`.

## Mobile Behavior

- Mobile gets a dedicated vertical composition.
- Brand remains first.
- Contact entry appears earlier than the update layer.
- Latest update moves lower without becoming a full-width bulky card.
- Blur layers and typography scale must be rebalanced for readability.

## Implementation Boundary

- Keep all repository, API, and admin logic as-is.
- Replace the public homepage HTML structure.
- Replace the public homepage CSS system.
- Replace the public homepage client-side interaction script for motion and modal handling.
- Do not preserve the current homepage layout skeleton for convenience.

## Risks and Guardrails

- Risk: the new page still feels like the old layout with bigger typography.
  - Guardrail: reject any two-column hero with a framed right-side visual box.
- Risk: contact entry becomes a marketing CTA.
  - Guardrail: use subdued wording and stage-like placement.
- Risk: latest update disappears too much.
  - Guardrail: keep a clear title/date/signal treatment.
- Risk: blur makes the page muddy.
  - Guardrail: use blur mainly in background and depth transitions, not on every foreground surface.

## Success Criteria

- The public homepage no longer looks structurally derived from the current version.
- Brand reads first, contact entry second, latest update third.
- The homepage feels like one stage-poster composition rather than stacked website sections.
- `/api` and `/admin` remain unchanged in behavior.
