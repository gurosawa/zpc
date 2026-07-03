# Forensic Isometric Atlas Design

## Status

- Date: 2026-07-03
- Scope: main page visual redesign design record and first implementation reference
- Decision: adopt a real Three.js/WebGL hero, not a temporary 2D mock
- Implementation branch: `codex/forensic-atlas-phase-1`

## Context

`zkTLS Master Guide` is a dense technical reference for security thinking, cryptography, TLS, network trust, application/API security, supply chain security, privacy-preserving proof systems, and zkTLS. The current home page already works as a table of contents. The missing piece is a first-viewport visual system that makes the reader curious before they start navigating.

The site should not become a security SaaS dashboard, a SOC console, or a cyberpunk demo. The visual system must still read as a reference manual: precise, diagrammatic, navigable, and calm enough to support reading.

## Review Outcome

Adopt **Forensic Isometric Atlas**:

- Use a real 3D/WebGL isometric glassbox as the primary hero.
- Represent the zkTLS trust/proof path as stacked transparent layers.
- Keep telemetry as small supporting evidence panels, not the main metaphor.
- Keep the existing editorial TOC structure and `WORDS` label.
- Connect TOC hover/focus to atlas layer highlighting.

Rejected as primary direction:

- **Telemetry Dashboard**: too likely to read as a product dashboard or operations console.
- **Pure Making Software imitation**: the project needs a trust/proof map, not a hardware-object exploded view.
- **2D-first placeholder**: useful fallback, but not the primary implementation path.

## Corrections Applied To The Review

The external review was directionally useful, but a few items were narrowed before recording this document:

- Removed fixed multi-week estimates. The implementation should be phased by shipped capability, not calendar guesses.
- Replaced immediate `zustand` adoption with local React state. Add a store only if state must cross the home experience boundary.
- Rejected hardware-concurrency based fallback as a first-pass rule. It can misclassify devices; use real WebGL failure and measured performance first.
- Kept telemetry to 2 or 3 compact panels. More panels would pull the design back toward a dashboard.
- Kept scroll behavior normal. No sticky hero, no scroll hijack, no scroll-driven layer separation in the first version.
- Kept Phase 1 visually strict: no bloom, particles, post-processing, OrbitControls, custom shaders, or shadow maps.
- Treated the fallback as a required semantic diagram, not a nice-to-have screenshot.

## Core Mental Model

The hero should make the reader remember zkTLS as an evidence stack:

```txt
SOURCE / API RESPONSE
TLS SESSION
TRANSCRIPT
REDACTION / SELECTIVE DISCLOSURE
WITNESS / PUBLIC INPUT
PROOF
VERIFIER DECISION
```

The reader should understand that each chapter explains a slice of this stack, not an arbitrary topic in a list.

## First Viewport

Desktop:

- Masthead stays as it is.
- Hero sits above the editorial TOC.
- Left side: title, one-sentence promise, 2 or 3 compact forensic panels.
- Right side: full-bleed or near-full-bleed WebGL atlas canvas.
- TOC begins below the hero. It should remain visible after one normal scroll; no scroll hijacking.

Recommended copy:

```txt
zkTLS MASTER GUIDE
A field manual for proving web data without overexposing trust.
```

Mobile:

- Title first.
- Atlas canvas second, fixed to a stable aspect ratio.
- Telemetry panels collapse to one or two short rows.
- TOC follows normally.
- No hover dependency; tap-to-cycle layer exploration is optional after the core version works.

## 3D Scene

Scene objects:

- `AtlasGroup`: root object.
- `GlassLayer`: seven stacked slabs, one per evidence layer.
- `FlowEdges`: thin vertical/directional proof path lines.
- `LayerLabels`: HTML overlay labels, not 3D text meshes.
- `TelemetryPanels`: DOM panels outside the canvas.
- `AtlasFallback`: static layered SVG/HTML fallback.

Layer appearance:

- Transparent slabs with visible wireframe edges.
- Low transmission and low roughness; avoid mirror-like glass.
- One accent color for active layer highlights.
- No bloom, particles, HDR environment, shadow maps, or free camera orbit in the first implementation.

The atlas must include artifact fragments so it does not become abstract decoration:

- Source: `GET /api/...`
- TLS: record/handshake bytes such as `16 03 03`
- Transcript: `ServerHello -> Certificate -> Finished`
- Redaction: `[REDACTED]` fields and disclosed claims
- Witness/input: `witness` and `public input` split
- Proof: compact proof tuple notation
- Verifier: `ACCEPT` / `VALID`

## TOC Mapping

The TOC is the navigation surface. The atlas is the orientation surface.

| Chapter | Atlas emphasis |
| --- | --- |
| Security Thinking | outer trust boundary frame |
| Cryptographic Primitives | proof and verifier primitives |
| Web Trust and TLS | TLS session and transcript |
| Network Tunnels and Identity Planes | session/path layer |
| Application and API Security | source/API layer |
| Secure Systems and Supply Chain | source plus provenance/transcript path |
| Privacy-Preserving Proof Systems | redaction and witness/public input split |
| zkTLS Architectures and Labs | full source-to-verifier path |

Hover and keyboard focus should trigger the same highlight. Click behavior remains normal navigation.

## Interaction Rules

Idle:

- Static is acceptable.
- If motion is added, keep it extremely subtle: slow layer breathing or path pulse only.

Hover/focus:

- Active layer moves slightly upward.
- Active layer edge and label use the accent color.
- Non-active layers dim but remain legible.
- Transition should be short and restrained.

Scroll:

- Do not hijack scroll.
- Do not drive layer separation from scroll in the first version.
- The reader must be able to get to the TOC immediately.

Mobile:

- No required hover behavior.
- Canvas remains an explanatory image first.
- Optional enhancement: tap canvas to cycle layers, with a visible text label.

Reduced motion:

- Stop idle motion and path crawling.
- Use static highlight changes only.
- Prefer `frameloop="demand"` or equivalent so no continuous render loop runs when static.

## Implementation Architecture

Use Three.js through React bindings:

- Add `three` and `@react-three/fiber` only when implementation starts.
- Add `@react-three/drei` later only if DOM overlay labels or simple geometry stop being enough.
- Do not add `zustand` in the first pass.
- Keep shared state local with `useState` in one client wrapper.

Proposed component structure:

```txt
components/atlas/
  atlas-data.ts
  home-atlas-experience.tsx
  atlas-hero.tsx
  atlas-canvas.tsx
  atlas-scene.tsx
  glass-layer.tsx
  flow-edges.tsx
  layer-label.tsx
  telemetry-panel.tsx
  atlas-fallback.tsx
```

Server/client boundary:

- `app/page.tsx` should stay responsible for loading `getChapters()` and `getTocSections()`.
- It can pass serializable `tocSections` into `HomeAtlasExperience`.
- `HomeAtlasExperience` becomes the small client wrapper that owns `activeChapterId`.
- This avoids a global store and avoids DOM event bridges.

First-pass data model:

```ts
type AtlasLayer = {
  id: string;
  order: number;
  label: string;
  fragment: string;
};

type ChapterAtlasMapping = {
  chapterId: string;
  layerIds: string[];
  mode: "boundary" | "layer" | "path";
};
```

Escalation rule:

- Add a global store only if atlas state is needed outside the home experience.
- Add shader/custom material only if stock material cannot meet the design after browser verification.

## Accessibility

Canvas requirements:

- Canvas wrapper needs `role="img"` or an equivalent labelled region.
- Provide a concise `aria-label` describing the seven-layer trust path.
- Do not make the canvas itself the only interactive control.
- TOC links remain real links and keep visible focus styles.

Fallback requirements:

- WebGL failure must show `AtlasFallback`.
- Reduced-motion users still get the same information through a static atlas.
- The fallback should be a semantic SVG/HTML diagram, not a screenshot.

## Performance

Performance budget for the first implementation:

- Use dynamic import for the WebGL canvas.
- Cap DPR, for example `dpr={[1, 1.5]}`.
- Use simple geometries only.
- Avoid post-processing.
- Avoid shadow maps.
- Use HTML overlay labels instead of 3D text geometry.
- Keep telemetry panels as DOM, not canvas text.

The site can accept an extra 3D chunk only if the TOC and text remain usable before the canvas finishes loading.

## Phased Plan

Phase 1: minimal 3D atlas

- Add atlas dependency set.
- Render seven glass layers, labels, path lines, and fallback.
- Place hero above the current TOC.
- Support light/dark theme.
- Verify desktop/mobile layout and nonblank canvas.

Phase 2: TOC focus/hover integration

- Move home TOC rendering into `HomeAtlasExperience` or a small client TOC component.
- Use local `activeChapterId` state.
- Highlight mapped atlas layers on hover and keyboard focus.
- Preserve normal link navigation.

Phase 3: forensic polish

- Add 2 or 3 telemetry panels.
- Add layer fragments.
- Add restrained idle motion.
- Add optional mobile tap-to-cycle if it improves comprehension.

Phase 4: hardening

- Verify reduced motion.
- Verify WebGL fallback.
- Verify keyboard navigation.
- Verify no horizontal overflow.
- Verify build, lint, typecheck, and browser console.

## Verification Checklist

Required before merging implementation:

- `pnpm content:check`
- `pnpm test`
- `pnpm lint`
- `npx tsc --noEmit`
- `pnpm build`
- `git diff --check`
- Desktop screenshot at a wide viewport
- Mobile screenshot around 390px width
- Canvas nonblank pixel check
- Console warnings/errors check
- Reduced-motion check
- Keyboard focus check for TOC-linked highlights
- No horizontal overflow check
- WebGL fallback check

## Things To Avoid

- Do not implement a full telemetry dashboard.
- Do not add scroll hijacking.
- Do not use OrbitControls as user-facing interaction.
- Do not add bloom, particles, HDR environments, or shader work in Phase 1.
- Do not make the 3D scene the only way to navigate.
- Do not add a global state dependency until local state fails.
- Do not replace the existing TOC information architecture.

## Final Design Decision

Build the main page hero as a real WebGL **Forensic Isometric Atlas**. Keep the first implementation deliberately small: seven layers, labels, path lines, fallback, and TOC hover/focus mapping. The visual goal is not spectacle; it is to make the zkTLS trust path spatially understandable before the reader opens an article.

## Implementation Notes

The first implementation follows the small baseline above:

- `app/page.tsx` still loads chapters and TOC data on the server.
- `HomeAtlasExperience` owns only local hover/focus state.
- The atlas uses `three` and `@react-three/fiber`; `@react-three/drei`, custom shaders, post-processing, and a global store were skipped.
- Layer labels are DOM overlay text, so the WebGL scene stays simple geometry.
- WebGL failure shows `AtlasFallback` before the canvas mounts.
- `three` is pinned to `0.182.0` because newer tested versions emitted a runtime `THREE.Clock` deprecation warning through the current R3F stack.
- The first pass uses static rendering and normal scroll. Mobile hides layer fragments inside the canvas overlay to keep the stack readable.
