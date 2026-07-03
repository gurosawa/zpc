# Scroll-Driven Forensic Atlas Implementation Plan

## Status
Draft plan for the next implementation session.

## Goal
Turn the home page Atlas from a one-time hero into a scroll-driven reading companion:

- Chapter 01 is active on entry.
- Scrolling through the ToC updates the active chapter.
- The sticky 3D Atlas changes to the active chapter layer mapping.
- The active ToC chapter stays clear while inactive chapters are visually quieter.
- `@react-three/drei` is used only for `Html` labels attached to Atlas layers.
- The per-chapter artifact preview boxes under ToC headings are removed.

## Non-Goals
- No scroll hijacking.
- No OrbitControls.
- No bloom, particles, environment maps, or post-processing.
- No global store unless local state cannot cover the final shape.
- No rewrite of article pages or content loaders.

## Current Baseline
- Home UI entry: `app/page.tsx`
- Home Atlas wrapper: `components/atlas/home-atlas-experience.tsx`
- 3D canvas: `components/atlas/atlas-canvas.tsx`
- Atlas data mapping: `components/atlas/atlas-data.ts`
- Atlas hero/fallback: `components/atlas/atlas-hero.tsx`, `components/atlas/atlas-fallback.tsx`
- Home CSS: `app/globals.css`
- Route/content regression tests: `tests/article-routes.test.mjs`

## Workflow Rule
Each task below should be completed as its own branch:

1. Branch from latest `main`.
2. Implement only that task.
3. Run verification listed for that task.
4. If verification passes, commit and push the branch.
5. After push, check the branch build or deployment status when applicable.
6. Merge to `main` only after the task branch is proven clean.

Use branch names with the `codex/` prefix.

## Task 1: Remove Home ToC Artifact Preview Slots
**Branch:** `codex/remove-home-toc-artifacts`

**Description:** Remove the dashed diagram preview area under each ToC chapter heading. These previews duplicate the new Atlas role and currently add visual noise.

**Files likely touched:**
- `components/atlas/home-atlas-experience.tsx`
- `tests/article-routes.test.mjs`

**Acceptance criteria:**
- Home ToC chapter sections no longer render `ArtifactDiagram`.
- `visual-artifact-slot` and `artifact-label` do not appear in `home-atlas-experience.tsx`.
- Article page visual artifacts remain untouched.

**Verification:**
- `pnpm test`
- `pnpm lint`
- `npx tsc --noEmit`
- `pnpm build`
- `git diff --check`

## Task 2: Convert Home Layout To Sticky Split Atlas
**Branch:** `codex/sticky-atlas-layout`

**Description:** Reframe the desktop home layout so the Atlas stays visible while the ToC scrolls. The Atlas should become a sticky companion panel, not just a top hero.

**Files likely touched:**
- `components/atlas/home-atlas-experience.tsx`
- `components/atlas/atlas-hero.tsx`
- `app/globals.css`

**Acceptance criteria:**
- Desktop layout has a sticky Atlas panel and a scrollable ToC column.
- Mobile layout remains stacked: Atlas first, ToC below.
- No horizontal overflow at common desktop and mobile widths.
- Existing hover/focus state still updates the Atlas.

**Verification:**
- `pnpm test`
- `pnpm lint`
- `npx tsc --noEmit`
- `pnpm build`
- Playwright check: desktop and mobile screenshots, canvas nonblank, no horizontal overflow.
- `git diff --check`

## Task 3: Add Scroll-Spy Active Chapter State
**Branch:** `codex/atlas-scroll-spy`

**Description:** Make the active Atlas chapter follow scroll position when the user is not hovering or focusing a ToC chapter.

**Implementation rule:**
- Prefer local state in `HomeAtlasExperience`.
- Use `IntersectionObserver`.
- Keep ordinary browser scrolling. Do not intercept wheel/touch/keyboard scrolling.

**State model:**
```txt
activeByHover = hovered or focused chapter slug
activeByScroll = chapter closest to the viewport reading zone
activeChapter = activeByHover ?? activeByScroll ?? first chapter
```

**Files likely touched:**
- `components/atlas/home-atlas-experience.tsx`
- `app/globals.css`
- `tests/article-routes.test.mjs`

**Acceptance criteria:**
- On initial load, Chapter 01 is active.
- Scrolling down activates Chapter 02, then later chapters as they enter the reading zone.
- Hover/focus overrides scroll-spy.
- Leaving hover/focus returns to scroll-spy state.
- Reduced-motion users still get state changes without animation-dependent behavior.

**Verification:**
- `pnpm test`
- `pnpm lint`
- `npx tsc --noEmit`
- `pnpm build`
- Playwright check: scroll to chapters 1, 2, 5, 8 and assert `data-atlas-active` changes.
- `git diff --check`

## Task 4: Add Active/Dim ToC Reading States
**Branch:** `codex/atlas-active-toc-states`

**Description:** Tie the ToC visual hierarchy to the active chapter. The active chapter should read as the current section; inactive chapters should remain readable but visually quieter.

**Files likely touched:**
- `components/atlas/home-atlas-experience.tsx`
- `app/globals.css`

**Acceptance criteria:**
- Active chapter has a clear accent cue.
- Inactive chapters are dimmed enough to show focus, but not so dim that scanning becomes difficult.
- Focus-visible styles remain visible.
- Keyboard tabbing updates the active chapter just like pointer hover.

**Verification:**
- `pnpm test`
- `pnpm lint`
- `npx tsc --noEmit`
- `pnpm build`
- Playwright check: keyboard tab through ToC sections and active state changes.
- `git diff --check`

## Task 5: Add Drei Html Layer Labels
**Branch:** `codex/atlas-drei-html-labels`

**Description:** Add `@react-three/drei` only for `Html` labels anchored near Atlas layers. This makes the Atlas read more like a technical exploded diagram.

**Allowed drei usage:**
- `Html`

**Forbidden drei usage in this task:**
- `OrbitControls`
- `PresentationControls`
- `Float`
- `Environment`
- `Sparkles`
- post-processing helpers

**Files likely touched:**
- `package.json`
- `pnpm-lock.yaml`
- `components/atlas/atlas-canvas.tsx`
- `app/globals.css`

**Acceptance criteria:**
- `@react-three/drei` is installed and locked.
- Layer labels are positioned in relation to the 3D layer stack.
- Labels remain readable on desktop.
- Mobile can keep the simpler existing overlay or fallback if 3D labels crowd the view.
- Existing DOM overlay can be reduced or removed only if the `Html` labels fully replace its purpose.

**Verification:**
- `pnpm install --frozen-lockfile`
- `pnpm test`
- `pnpm lint`
- `npx tsc --noEmit`
- `pnpm build`
- Playwright canvas nonblank check.
- Visual check: desktop screenshot confirms layer labels are not overlapping core text or each other.
- `git diff --check`

## Task 6: Hardening And Deployment Check
**Branch:** `codex/atlas-scroll-hardening`

**Description:** Verify the combined scroll-driven Atlas experience after Tasks 2-5 have landed on `main`.

**Acceptance criteria:**
- Desktop first viewport shows the Atlas and first ToC chapter relationship clearly.
- Scrolling to Chapters 2, 4, 5, 7, and 8 keeps Atlas visible and updates the active layer mapping.
- Reduced-motion mode still provides static state changes.
- WebGL unavailable path shows fallback.
- Azure Static Web Apps deploys successfully after merge.

**Verification:**
- `pnpm test`
- `pnpm lint`
- `npx tsc --noEmit`
- `pnpm content:check`
- `pnpm build`
- Playwright:
  - desktop 1440 x 1100
  - mobile 390 x 844
  - reduced-motion desktop
  - scroll assertions for chapters 1, 2, 5, 8
  - canvas nonblank or fallback visible
- After merge: verify live Azure URL contains expected Atlas markers.
- `git diff --check`

## Design Rules
- The Atlas is an instrument panel for the ToC, not a separate animation showcase.
- Scroll is input, not a thing to hijack.
- Text density should feel like a technical reference, not a SaaS telemetry dashboard.
- The ToC remains the primary navigational surface.
- The 3D layer labels explain structure; they must not compete with article titles.

## Next Session Prompt
Copy and paste this into a new Codex session:

```txt
Always speak in Korean. Always use vowline. Ponytail remains active: choose the smallest working implementation.

Workspace: C:\Users\dieyo\Documents\zktls

Continue the zkTLS Master Guide home Atlas work from:
docs/scroll-driven-atlas-implementation-plan.md

Current design direction:
- Build a scroll-driven Forensic Isometric Atlas on the home page.
- Desktop: sticky Atlas panel plus scrollable ToC.
- Mobile: stacked Atlas then ToC.
- Chapter 01 is active on entry.
- Scrolling updates the active chapter and Atlas layer mapping.
- Hover/focus overrides scroll-spy; leaving hover/focus returns to scroll-spy.
- Use `@react-three/drei` only for `Html` layer labels when implementing Task 5.
- Do not add OrbitControls, PresentationControls, Float, Environment, Sparkles, bloom, particles, post-processing, scroll hijacking, or a global state store unless there is current code evidence that local state cannot work.

Workflow rule for every task:
1. Branch from latest `main` with `codex/` prefix.
2. Implement only one task from the plan.
3. Run the task's verification commands.
4. If verification passes, commit and push the task branch.
5. Report exact validation results and branch/commit.
6. Merge to `main` only when explicitly asked.

Start with the next unmerged task in the plan. Before editing, inspect:
- components/atlas/home-atlas-experience.tsx
- components/atlas/atlas-hero.tsx
- components/atlas/atlas-canvas.tsx
- components/atlas/atlas-data.ts
- app/globals.css
- tests/article-routes.test.mjs

Important existing decision:
The dashed per-chapter ToC artifact preview slots should stay removed from the home ToC. Article-page visual artifacts should remain untouched.
```
