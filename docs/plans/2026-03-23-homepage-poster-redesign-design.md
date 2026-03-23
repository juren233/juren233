# Homepage Poster Redesign Design

**Date:** 2026-03-23

## Summary

Rebuild the public homepage into a high-impact digital poster experience that feels artistic, modern, and technological without reading like a commercial landing page. The design should be unmistakably different from the current soft green glass treatment and should make `juren233.top` itself feel like the primary artifact.

## Goals

- Replace the current UI language with a bold poster-style visual system.
- Make the first viewport feel like a branded digital artwork rather than a standard website.
- Preserve the current information architecture at a high level:
  - brand homepage
  - latest journal update
  - cooperation/contact entry
  - admin entry remains available
- Keep the cooperation flow usable but avoid sales-heavy or startup-style CTA patterns.
- Use blur intentionally as a spatial and atmospheric device, not as a generic glass-card effect.

## Non-Goals

- No new CMS or routing changes.
- No expansion into a multi-page marketing site.
- No card-grid SaaS layout, testimonial area, feature matrix, or commercial conversion section.
- No change to admin workflows beyond preserving compatibility.

## Visual Thesis

The homepage should feel like a living digital poster with saturated color fields, oversized typography, layered composition, and controlled chaos. It should look more like an experimental cover, branded artboard, or motion poster than a conventional personal site.

## Content Plan

1. Hero poster
   - Dominant `juren233.top` brand treatment
   - Very short supporting line
   - One restrained primary action
2. Journal slice
   - The latest update appears as an editorial fragment integrated into the poster
3. Contact entry
   - A subtle but memorable interaction point that opens the cooperation modal
4. Closing brand note
   - Minimal footer-style identity and orientation

## Interaction Thesis

- Large blurred color masses drift subtly behind the main composition.
- Scroll introduces focus shifts between sharp and blurred layers, as if moving across a printed poster under a lens.
- Opening the cooperation modal expands blur and color bloom in the background, while the form snaps into crisp focus.

## Information Architecture

### Hero

- The hero occupies the full first viewport.
- Brand name is the loudest text and the main visual anchor.
- Navigation becomes minimal and secondary.
- Supporting copy stays short enough to read at a glance.
- The primary action uses restrained wording such as `打开入口`, `发来一条消息`, or similar non-commercial phrasing.

### Latest Update

- The site still shows only the most important current journal item.
- Instead of a standard content card, the update appears as a poster slice, annotation strip, or editorial label embedded into the composition.
- The layout should still surface title, date, summary, and tags clearly enough to scan.

### Cooperation Entry

- The trigger should feel like an interaction artifact, not a sales CTA.
- Avoid business-heavy copy such as `立即合作`, `获取方案`, `开始咨询`, or anything that feels promotional.
- The trigger may appear as a floating tag, side label, or highlighted strip, but it should remain visually integrated with the poster.

### Modal

- The existing cooperation form remains the same in function.
- Background blur intensifies when the modal opens, flattening the poster into a soft color field.
- The form surface itself remains highly legible with strong contrast and calm spacing.

## Art Direction

### Color

- Use a saturated poster palette rather than soft gradients.
- Limit the palette to two or three dominant hues plus neutral text colors.
- Candidate combinations:
  - electric blue + hot red + acid yellow
  - magenta + cobalt + orange
  - cyan + scarlet + off-white
- Color should be organized into large fields, blooms, and diffused overlays rather than many small accents.

### Typography

- Use one expressive display family and one supporting UI family at most.
- Oversized brand typography should drive the composition.
- Allow cropping, overlap, angled alignment, and editorial placement where it strengthens the poster feel.
- Supporting labels should feel like annotations, not section headers from a template.

### Texture and Blur

- Use Gaussian blur for depth, motion atmosphere, and color mixing.
- Add subtle grain or print-like texture to avoid flat digital gradients.
- Avoid turning the entire layout into generic translucent panels.

## Motion

### Required motions

- Hero entrance sequence for brand layers and background color masses.
- Scroll-linked blur/focus or parallax transitions in the poster composition.
- Modal open/close transition with blur bloom and focus pull.

### Motion constraints

- Motion should be noticeable but restrained.
- Respect `prefers-reduced-motion`.
- Mobile motion should be simplified to preserve smoothness.

## Mobile Behavior

- Mobile should not be a scaled-down desktop poster.
- Recompose into a vertical cover layout with fewer simultaneous elements.
- Keep the brand dominant in the first screen.
- Reduce blur layer count and motion intensity for performance.
- Preserve readable form controls and adequate touch targets.

## Technical Approach

- Continue using the existing server-rendered Hono view in `src/app.ts`.
- Replace the homepage HTML, CSS, and inline client-side behavior.
- Keep API endpoints and admin pages functionally compatible.
- Protect the redesign with tests that lock the homepage content structure and modal trigger behavior.

## Risks and Guardrails

- Risk: the page becomes visually loud but loses hierarchy.
  - Guardrail: keep each section responsible for one message only.
- Risk: the cooperation entry feels like a generic CTA.
  - Guardrail: use restrained copy and integrate it into the poster composition.
- Risk: heavy blur harms performance on mobile.
  - Guardrail: limit layer count, use transform/opacity where possible, and simplify small-screen effects.
- Risk: the update section becomes too decorative to read.
  - Guardrail: preserve a clear title, date, and summary in the editorial treatment.

## Success Criteria

- The new homepage is immediately and obviously different from the previous UI.
- The first viewport has a strong branded poster quality.
- The latest update remains visible and understandable.
- The cooperation flow feels artistic and usable without looking commercial.
- The site works on desktop and mobile and respects reduced-motion preferences.
