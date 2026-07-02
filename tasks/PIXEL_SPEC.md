# zkTLS Master Guide Pixel Spec

## 0. Purpose

This project does not clone Making Software pixel-by-pixel. It adopts its editorial TOC grammar and adapts it for zkTLS Master Guide.

The target surface for this document is the home table-of-contents experience. The desired first impression is a dense technical reference spread: wide editorial canvas, thin masthead rule, three-column section blocks, dotted leader article rows, precise metadata, and restrained mechanical motion.

Non-goals:

- SaaS dashboard shell.
- Marketing landing page.
- Blog index.
- Narrow centered `880px` or `960px` home layout.
- Strict external screenshot clone of Making Software.

## 1. Reference Interpretation

Reference assets:

| Asset | Role |
|---|---|
| `references/makingsoftware/toc-desktop-source.png` | Captured visual grammar reference |
| `references/makingsoftware/toc-desktop-measured.png` | Hand-measured overlay for gutters, columns, and row pitch |
| `references/makingsoftware/measurement-notes.md` | Coordinate notes and adapted token derivation |

What we adopt:

- Wide white canvas with strong horizontal masthead rule.
- Small mono version/progress metadata.
- Three macro columns.
- Section blocks rather than global table rows.
- Uppercase mono section headings.
- Dotted leaders between article title and compact metadata.
- Editorial density, baseline rhythm, and quiet whitespace.

What we reject:

- External reference as strict pixel target.
- Serif-first global typography.
- Four-column data-table TOC as the main layout model.
- Small icon badges as primary visual artifacts.
- Card shadows, rounded SaaS panels, gradient decoration, and hover background fills.

## 2. Measurement Environment

Primary measurement viewport:

| Property | Value |
|---|---:|
| Viewport | `1440 x 900` |
| DPR | `1` |
| Browser | Chromium via Playwright |
| Theme | Light mode first |
| Motion | Default motion and `prefers-reduced-motion: reduce` both tested |

Secondary review viewports:

| Viewport | Requirement |
|---|---|
| `1536 x 960` | Wide desktop should keep the same editorial grammar |
| `1280 x 800` | Compact desktop should preserve three columns if space allows |
| `900 x 900` | Tablet may use two columns |
| `390 x 844` | Mobile must degrade to one column with no overflow |

Tolerance:

- Layout assertions: `±4px` for horizontal/vertical measurements.
- Typography computed style: exact token match where values are declared.
- Screenshot comparison: local review only in p0b/p1b. Own golden diff may start after p1b approval at `0.01-0.03`.

## 3. Design Token Contract

### 3.1 Layout Tokens

| Token | Candidate | Source | Status | Used by |
|---|---:|---|---|---|
| `--page-max-inline` | `1360px` | reference-adapted | p0b freeze | p1b |
| `--page-gutter-x` | `40px` | reference-adapted | p0b freeze | p1b |
| `--page-padding-top` | `30px` | reference-adapted | p0b freeze | p1b |
| `--page-padding-bottom` | `72px` | design adaptation | p0b freeze | p1b |
| `--toc-column-gap` | `56px` | reference-adapted | p0b freeze | p1b |
| `--toc-section-gap-y` | `40px` | reference-adapted | p0b freeze | p1b |
| `--toc-heading-list-gap` | `24px` | reference-adapted | p0b freeze | p1b |
| `--toc-row-pitch` | `28px` | reference-adapted | p0b freeze | p1b |
| `--toc-row-line-height` | `18px` | density target | p0b freeze | p1b |
| `--artifact-slot-height` | `56px` | zkTLS adaptation | p1b provisional | p1b/p1c/p3a |

### 3.2 Typography Tokens

| Token | Candidate | Role | Status |
|---|---:|---|---|
| `--font-technical` | `Departure Mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace` | English technical labels, lo-fi metadata, numbers, Latin code | p0b freeze |
| `--font-korean-pixel` | `Neo둥근모 Code, D2Coding, Apple SD Gothic Neo, Malgun Gothic, monospace` | Korean pixel/terminal/editorial meta, Korean titles and prose | p0b freeze |
| `--font-code` | `Departure Mono, D2Coding, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace` | code blocks, inline code, Korean code/comment fallback | p0b freeze |
| `--root-font-size` | `11px` | existing site scale | p0b freeze |
| `--masthead-title-size` | `16px` | editorial title | p0b freeze |
| `--masthead-meta-size` | `10px` | version/progress/search labels | p0b freeze |
| `--toc-section-title-size` | `14px` | uppercase section heading | p0b freeze |
| `--toc-article-size` | `14px` | article title row | p0b freeze |
| `--toc-meta-size` | `10px` | word count/status | p0b freeze |

Rules:

- Departure Mono is mandatory for English technical labels, lo-fi metadata, counters, status, word counts, section numbers, and Latin code tokens.
- Neo둥근모 Code is mandatory for Korean pixel/terminal/editorial meta and Korean headings where the pixel editorial tone matters.
- D2Coding is the Korean readability fallback and code fallback.
- Do not use negative letter spacing.
- Do not scale font size with viewport width.
- Bold text is not a primary hierarchy tool; use size, case, rule weight, and color.

### 3.3 Color Tokens

| Token | Light | Dark | Role |
|---|---|---|---|
| `--bg-primary` | `#f7f7f5` | `#0d0d0c` | paper/canvas |
| `--text-primary` | `#050505` | `#f0f0ea` | ink |
| `--text-secondary` | `#60666f` | `#a8a89e` | metadata |
| `--border` | `#151515` | `#e8e8df` | strong rules |
| `--border-light` | `#c8c8c0` | `#3a3a35` | dotted leaders |
| `--accent` | `#001eff` | `#8fa2ff` | active links and search trigger |

Forbidden:

- Purple/blue gradients.
- Decorative blobs or bokeh.
- Box shadow as hierarchy.
- Pill controls or radius above `2px`.

### 3.4 Rule And Leader Tokens

| Token | Candidate | Role | Status |
|---|---:|---|---|
| `--rule-thickness` | `1px` | masthead and section rules | p0b freeze |
| `--leader-thickness` | `1px` | dotted leader visual line | p0b freeze |
| `--leader-dot-size` | `1px` | dot width | p0b freeze |
| `--leader-dot-gap` | `3px` | space between dots | p0b freeze |
| `--leader-y-offset` | `0.16em` below baseline | aligns dots to row baseline | p0b freeze |

Implementation should prefer `repeating-linear-gradient` over `border-bottom: dotted` so p1c can animate leader drift.

## 4. Page Shell Metrics

Desktop primary target:

```txt
viewport width: 1440px
page max inline: 1360px
left/right visual gutter: 40px
top padding: 30px
bottom padding: 72px
home layout: unframed page section, no outer card
```

Required assertions:

- Main editorial canvas width is `1360px ± 4px` at `1440px` viewport.
- Canvas is horizontally centered or uses symmetric gutters.
- There is no page-level card, radius, shadow, or gradient background.
- Body background is `--bg-primary`.

## 5. Masthead Metrics

Structure:

```txt
masthead
├─ masthead-title
├─ masthead-version
├─ masthead-rule
└─ masthead-meta
   ├─ PROGRESS n/m
   ├─ WORDS x.xK
   ├─ SEARCH Ctrl/⌘K
   └─ MODE
```

Metrics:

| Surface | Candidate |
|---|---:|
| Masthead top | `30px` |
| Masthead visual line y | `38px` from viewport top |
| Masthead row height | `18px` |
| Rule thickness | `1px` |
| Rule min width | fills remaining space between version and meta |
| Title size | `16px` |
| Meta size | `10px` |

Behavior:

- `WORDS` is read-only metadata, not a search button.
- `SEARCH Ctrl/⌘K` is the search trigger.
- `PROGRESS`, `WORDS`, `SEARCH`, and `MODE` must sit on the same editorial control strip, not inside buttons or cards.
- Focus state uses rule/outline grammar with `0-2px` radius only.

## 6. Editorial TOC Grid

Home TOC macro structure:

```txt
main
└─ nav[aria-label="Guide table of contents"]
   └─ editorial-toc-grid
      ├─ toc-column
      │  └─ toc-section
      ├─ toc-column
      │  └─ toc-section
      └─ toc-column
         └─ toc-section
```

Desktop grid:

| Surface | Candidate |
|---|---:|
| Column count | `3` |
| Column gap | `56px` |
| Column width at 1440 | `(1360px - 112px) / 3 = 416px` |
| First TOC y offset | `masthead rule y + 112px` |
| Section vertical gap | `40px` |

Section placement:

- p1b must use stable manual column groups, not CSS masonry.
- For eight sections, use `[1, 2]`, `[3, 4, 5]`, `[6, 7, 8]`.
- For seven sections, use `[1, 2]`, `[3, 4]`, `[5, 6, 7]`.
- For six sections, use `[1, 2]`, `[3, 4]`, `[5, 6]`.
- Reading order in DOM remains numerical order; CSS/React grouping may render columns but must preserve keyboard navigation by section order.

## 7. TOC Section Block Anatomy

Required section structure:

```txt
toc-section
├─ section-heading-row
│  ├─ section-number
│  ├─ section-title
│  └─ section-meta
├─ visual-artifact-slot
└─ article-list
```

Section heading:

| Element | Font | Size | Requirement |
|---|---|---:|---|
| number | Departure Mono | `14px` | visible as `1.` or `01.` consistently |
| title | Departure Mono | `14px` | uppercase English label preferred |
| meta | Departure Mono | `10px` | status, article count, word count |

Visual artifact slot:

- p1b includes a stable placeholder container only.
- Slot height candidate: `56px`.
- Slot width: full section column width.
- Slot visual: thin-line schematic placeholder, no image-card framing.
- Slot may be hidden for Appendix if density is too high, but the layout API must support it.

## 8. Article Row Anatomy

Required row structure:

```txt
article-row
├─ marker
├─ title
├─ dotted-leader
└─ compact-meta
```

Metrics:

| Surface | Candidate |
|---|---:|
| Row pitch | `28px` |
| Line height | `18px` |
| Marker width | `14px` |
| Compact meta min width | `54px` |
| Leader min width | `24px` |

Long title behavior:

- Korean titles use `word-break: keep-all`.
- English technical terms may wrap normally.
- One-line rows are preferred on desktop; two-line rows are allowed only when the title is genuinely long.
- If a title wraps, the leader and meta align to the final visual line.
- No horizontal overflow is allowed.

## 9. Dotted Leader System

Implementation:

```css
background-image: repeating-linear-gradient(
  to right,
  var(--border-light) 0,
  var(--border-light) var(--leader-dot-size),
  transparent var(--leader-dot-size),
  transparent calc(var(--leader-dot-size) + var(--leader-dot-gap))
);
```

Rules:

- The leader is decoration and should be `aria-hidden`.
- The semantic link text remains the article title.
- The leader fills the available space between title and compact metadata.
- It must clip cleanly without leaking under wrapped text.
- Hover may shift `background-position` in p1c; p1b only needs static support.

## 10. Typography System

Departure Mono roles:

- Masthead metadata.
- `PROGRESS`, `WORDS`, `SEARCH`, `MODE`.
- Section numbers and section labels.
- Word counts, statuses, article counts.
- Latin code and inline technical tokens.

Neo둥근모 Code roles:

- Korean article titles.
- Korean pixel/terminal/editorial metadata.
- Korean section headings.
- Short Korean chapter prose where the lo-fi terminal tone is desired.

D2Coding roles:

- Korean readability fallback.
- Korean code/comment fallback.
- Long explanatory labels that contain Korean.

Mixed Korean/English rules:

- `font-family` must not force Korean text through Departure Mono if glyph support is missing or visually poor.
- Keep `line-height` unitless.
- Use `font-size-adjust` only if browser support does not create layout instability.
- Inline code in Korean prose uses Departure Mono first and D2Coding as fallback, with small vertical baseline adjustment if needed.

## 11. Visual Artifact Slot System

Allowed visual keys:

| Key | Meaning | p1b Requirement | Later Owner |
|---|---|---|---|
| `tls-record-strip` | TLS record bytes and encrypted payload | placeholder geometry | p3a |
| `proof-pipeline` | request to transcript to proof to verifier | placeholder geometry | p1c/p3a |
| `transcript-receipt` | notarized/redacted session receipt | placeholder geometry | p3a |
| `circuit-grid` | constraints and proof circuit | placeholder geometry | p3a |
| `merkle-branch` | membership path / commitment structure | placeholder geometry | p3a |
| `browser-session-trace` | browser request/session trace | placeholder geometry | p3a |
| `trust-layer-stack` | TLS, zkTLS, verifier, app stack | placeholder geometry | p3a |

Visual slot rules:

- Primary artifact is section-level, not a `32 x 20px` icon.
- A `32 x 20px` micro marker is allowed only as secondary status decoration.
- p1b must not attempt final SVG content.
- p1b must expose stable `visualKey`, dimensions, and semantic labels for p1c/p3a.

## 12. Motion Specification

Allowed motion language:

- Thin rule draw.
- Dotted leader reveal or drift.
- Mechanical counter increment.
- Baseline micro-shift.
- SVG line drawing.
- Artifact scanline or proof-pipeline pulse.

Forbidden as primary motion:

- Generic opacity fade as the main effect.
- Card hover lift.
- Shadow animation.
- Background color block selection.
- Large parallax on text.

p1b scope:

- Add motion-ready class names and CSS custom properties.
- Implement static final states.
- Add reduced-motion policy.

p1c scope:

- Implement rule draw, leader drift, counter increment, and placeholder artifact motion.

p3a scope:

- Implement final SVG line drawing and diagram-specific choreography.

Reduced motion:

- `prefers-reduced-motion: reduce` must set animations/transitions to static final states.
- Information must not depend on motion.

## 13. Responsive Behavior

| Width | Layout | p1b Requirement |
|---:|---|---|
| `>= 1280px` | 3 columns | primary quality target |
| `960-1279px` | 3 compressed columns or 2 columns | no overflow, acceptable density |
| `720-959px` | 2 columns | preserve section order |
| `< 720px` | 1 column | readable fallback, no advanced polish required |

Mobile rules:

- Masthead metadata may wrap to a second line.
- `SEARCH Ctrl/⌘K` may shorten to `SEARCH`.
- Visual artifact slots may reduce to `40px` height or hide if density requires.
- Article rows may wrap; meta remains visible.

## 14. Accessibility And Semantics

Required semantics:

```txt
<nav aria-label="Guide table of contents">
  <section aria-labelledby="toc-section-...">
    <h2 id="toc-section-...">...</h2>
    <ol>
      <li><a href="/guide/...">...</a></li>
    </ol>
  </section>
</nav>
```

Rules:

- Article rows are real links.
- Dotted leaders are decorative.
- Section headings follow a sensible hierarchy.
- Keyboard focus is visible and follows the editorial rule language.
- Focus cannot rely on color alone.
- Contrast must meet WCAG AA for text and critical controls.
- Motion must respect reduced-motion preferences.

## 15. Metadata Schema Contract

p0b defines the expected metadata shape; p1a owns content creation and data wiring.

```ts
type TocSectionStatus = "draft" | "review" | "stable" | "planned";

type TocArticle = {
  id: string;
  slug: string;
  order: number;
  title: string;
  status: TocSectionStatus;
  wordCount?: number;
};

type TocSection = {
  id: string;
  order: number;
  title: string;
  subtitle?: string;
  status: TocSectionStatus;
  wordCount: number;
  articleCount: number;
  visualKey:
    | "tls-record-strip"
    | "proof-pipeline"
    | "transcript-receipt"
    | "circuit-grid"
    | "merkle-branch"
    | "browser-session-trace"
    | "trust-layer-stack"
    | string;
  articles: TocArticle[];
};
```

p1b may use static data first, but the field names above should remain stable enough for p1a integration.

## 16. Playwright Verification Plan

Priority order:

1. Computed style assertion.
2. Bounding box assertion.
3. DOM structure assertion.
4. Clipped screenshot artifact for review.
5. Own golden screenshot regression after p1b approval.

p1b checks:

| Predicate | Verification |
|---|---|
| Viewport fixed at `1440 x 900` | Playwright context config |
| Main canvas is `1360px ± 4px` | bounding box |
| Masthead rule exists and is `1px` | computed style + bounding box |
| Three columns are present | DOM + bounding box x positions |
| Section block count/order is correct | DOM text/order |
| Article rows expose links | DOM role/link assertions |
| Dotted leader exists and clips | computed background + screenshot crop |
| `WORDS` is not the search trigger | DOM role/name assertions |
| `SEARCH` opens search | interaction test |
| Reduced motion disables animations | media emulation + computed styles |

External reference screenshot policy:

- The Making Software screenshot is a grammar source.
- Do not compare the local page against it with strict pixel diff.
- Save local review screenshots under a future test artifact path only after p1b implementation exists.

## 17. Branch Scope Mapping

| Branch | This spec says | This spec does not say |
|---|---|---|
| `docs/p0-design-direction` | Design goals and visual language | Exact pixel metrics |
| `docs/p0b-pixel-spec` | Home TOC pixel grammar, tokens, verification plan | Production implementation |
| `feature/p1a-content-metadata` | Use schema contract and populate content | Change visual layout |
| `feature/p1b-editorial-home-shell` | Implement home shell tokens, grid, row anatomy, static slots | Final SVG diagrams or full motion |
| `feature/p1c-home-motion-visual-slots` | Add allowed motion and visual slot behavior | Chapter page typography |
| `feature/p2a-chapter-typography` | Apply reading typography to chapter pages | Redesign home TOC |
| `feature/p3a-svg-diagram-system` | Implement artifact internals | Redefine p1b slot dimensions |

## 18. Open Decisions

| Decision | Current candidate | Source | Owner | Freeze branch |
|---|---|---|---|---|
| Korean font system | Departure Mono + Neo둥근모 Code + D2Coding adopted | user decision | decided | p1b |
| Masthead title font | Departure Mono for English, Neo둥근모 Code for Korean; serif removed | user font decision | decided | p1b |
| Section numbering format | `1.` vs `01.` | reference uses `1.` | design | p1b |
| Visual slot density | every section vs selected sections | zkTLS adaptation | design/implementation | p1b |
| Golden screenshot threshold | `0.01-0.03` after local baseline | QA policy | implementation | after p1b |

## 19. Acceptance Criteria

p0b is complete when:

- `references/makingsoftware/toc-desktop-source.png` exists.
- `references/makingsoftware/toc-desktop-measured.png` exists.
- `references/makingsoftware/measurement-notes.md` records measured coordinates and adapted tokens.
- `tasks/PIXEL_SPEC.md` defines the home TOC as a wide three-column editorial section-block grid.
- The spec rejects narrow centered home layout, serif-first global typography, table-row TOC, tiny icon primary visual slots, strict external screenshot diff, and generic SaaS motion.
- The spec provides p1b-ready token tables with `candidate`, `source`, `status`, and `used by` where relevant.
- The spec defines Playwright verification around metrics and semantics before screenshot diff.
- Actual SVG artifact content is explicitly deferred to p1c/p3a.
