# Homepage Minimal System Theme Design

**Date:** 2026-03-23

## Summary

Rebuild the public homepage from a blank slate after clearing the existing homepage structure. Preserve `/api`, `/admin`, and form submission behavior, but treat the public homepage as a new multi-section page that adapts to system light/dark mode and uses a restrained, minimal visual language.

## Goals

- Completely remove the current public homepage composition before rebuilding.
- Keep the public homepage multi-section rather than a single-screen poster.
- Preserve:
  - brand presence
  - contact entry
  - latest update
- Build a brand-led homepage that still keeps content usable.
- Follow system theme automatically with light and dark mode support.
- Keep the page minimal, quiet, and intentional.

## Non-Goals

- No reuse of the current homepage layout skeleton.
- No large blur fields, oversized piled typography, or poster theatrics.
- No changes to `/api` or `/admin`.
- No multi-card dashboard-style public homepage.

## Visual Thesis

The homepage should feel like a calm, editorial, system-aware brand site. It should use spacing, typography, rhythm, and contrast rather than decorative effects. In light mode it should feel airy and paper-like; in dark mode it should feel quiet and precise.

## Content Plan

1. Opening section
   - brand-first introduction
2. Entry section
   - primary action and contact path
3. Update section
   - one current update signal
4. Closing section
   - minimal identity close

## Interaction Thesis

- Small entrance reveal for the first screen
- restrained hover/focus states
- modal transition that respects the current system theme

## Structure

### Opening

- No top navigation bar.
- Brand is established first with minimal supporting text.
- The opening should not feel like a conventional hero with side-by-side content blocks.
- Keep copy sparse.

### Entry Section

- This is the main action area after the brand.
- It should feel like a clear system action, not a marketing CTA.
- Copy should be short and neutral.

### Update Section

- Show only the latest update.
- Treat it as a current signal, not as a blog listing or a bulky featured card.
- Keep it readable and low-noise.

### Closing

- Minimal closing identity or short site note.
- Do not build a heavy footer.

## Theme Behavior

### Light Mode

- More paper-like, open, and spacious.
- Higher brightness but controlled contrast.
- Fine lines, soft surfaces, and disciplined spacing.

### Dark Mode

- More restrained and calm than dramatic.
- Stronger contrast, but still minimal.
- No neon, no heavy glow, no loud gradients.

### Shared Rules

- Same layout in both modes.
- Theme affects color, line weight, and contrast only.
- Avoid creating two separate visual identities.

## Typography

- One strong brand type treatment and one supporting text face.
- Avoid giant stacked display experiments.
- Use hierarchy through size, spacing, and rhythm rather than shock value.

## Motion

- Keep motion minimal.
- Section reveal can be subtle.
- Modal open/close should feel clean and quiet.
- Respect `prefers-reduced-motion`.

## Implementation Boundary

- Clear the existing homepage HTML structure.
- Clear the existing homepage-specific public visual styling.
- Rebuild `home()` from a blank page concept.
- Preserve backend behavior, admin routes, and APIs.

## Risks and Guardrails

- Risk: the page becomes too plain and loses identity.
  - Guardrail: keep brand typography and proportion strong.
- Risk: it falls back into generic corporate minimalism.
  - Guardrail: avoid template sections and card grids.
- Risk: it accidentally reuses the current page hierarchy.
  - Guardrail: explicitly remove the current homepage DOM skeleton before rebuilding.

## Success Criteria

- The homepage is structurally unrelated to the current version.
- The page feels minimal and system-native rather than decorative.
- Light and dark mode both feel intentional.
- Entry and latest update remain present without dominating the brand.
