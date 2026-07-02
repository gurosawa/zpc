# Making Software TOC Reference Measurement Notes

## Source

- Source asset: `references/makingsoftware/toc-desktop-source.png`
- Measured overlay: `references/makingsoftware/toc-desktop-measured.png`
- Captured size: `1533 x 692`
- Intended use: visual grammar reference for zkTLS Master Guide home TOC.
- Non-use: this image is not a pixel-perfect target and must not become a strict external screenshot diff baseline.

## Interpretation

The reference is a wide editorial table-of-contents spread, not a centered reading column. The relevant grammar is:

- a thin masthead rule with title, version, and right-side metadata;
- a wide three-column editorial canvas;
- section blocks placed into columns;
- uppercase mono section headings;
- compact article rows with dotted leaders and small right metadata;
- large quiet whitespace above the first TOC row.

The zkTLS implementation should adopt this grammar and adapt it to the current product identity:

- Departure Mono for English technical labels, counters, Latin code, numbers, and mechanical metadata;
- Neo둥근모 Code for Korean pixel/terminal/editorial meta and Korean titles;
- D2Coding for Korean readability fallback and code fallback;
- section-level visual artifact slots, not small icon badges;
- metric assertions and own golden screenshots, not strict diffs against this external reference.

## Approximate Reference Coordinates

All values below are hand-measured from the captured image and rounded to the nearest practical pixel. They are sufficient for deriving layout tokens, not for exact reproduction.

| Surface | Approx value | Notes |
|---|---:|---|
| Image width | `1533px` | Source capture width |
| Image height | `692px` | Source capture height |
| Left page gutter | `38-44px` | Title starts near `x=38`, first TOC column near `x=44` |
| Masthead title baseline | `y=37px` | Title and rule share the same visual row |
| Masthead rule start | `x=184px` | Starts after title and version |
| Masthead rule end | `x=1361px` | Ends before right metadata |
| Right metadata start | `x=1378px` | `PROGRESS · WORDS` |
| First TOC heading y | `y=151px` | Large editorial air after masthead |
| Column 1 start | `x=44px` | Section 1 heading starts here |
| Column 2 start | `x=535px` | Section 3 heading starts here |
| Column 3 start | `x=1028px` | Section 6 heading starts here |
| Column block width | `429-433px` | Approx list/right metadata extent |
| Column gap | `58-60px` | Derived from column starts and extents |
| Heading to first row gap | `38-46px` | Includes heading baseline and list offset |
| Article row pitch | `28-29px` | Rows in first section |
| Section block vertical gap | `36-44px` | Gap between sections in a column |
| Dotted leader y offset | row baseline minus `2-4px` | Dot line tracks the article baseline |

## Adapted 1440px Candidate Tokens

The p0b spec adapts the reference into a `1440 x 900`, DPR 1 target. Values are rounded to the nearest 4px or stable CSS-friendly value.

| Token | Candidate | Source | Status | Used by |
|---|---:|---|---|---|
| `--page-max-inline` | `1360px` | `1440px - 2 * 40px` | p0b freeze | p1b |
| `--page-gutter-x` | `40px` | reference gutter ratio rounded | p0b freeze | p1b |
| `--page-padding-top` | `30px` | masthead title y | p0b freeze | p1b |
| `--masthead-rule-y` | `38px` | masthead baseline/rule y | p0b freeze | p1b |
| `--toc-start-offset` | `112px` | rule y to first TOC heading | p0b freeze | p1b |
| `--toc-column-gap` | `56px` | reference gap adapted | p0b freeze | p1b |
| `--toc-section-gap-y` | `40px` | section block gap adapted | p0b freeze | p1b |
| `--toc-heading-list-gap` | `24px` | heading-to-list rhythm adapted | p0b freeze | p1b |
| `--toc-row-pitch` | `28px` | article row pitch adapted | p0b freeze | p1b |
| `--toc-row-line-height` | `18px` | dense article row line box | p0b freeze | p1b |
| `--leader-dot-size` | `1px` | visual dot weight | p0b freeze | p1b |
| `--leader-dot-gap` | `3px` | visual dot pitch | p0b freeze | p1b |
| `--artifact-slot-height` | `56px` | zkTLS adaptation, not reference clone | p1b provisional | p1b/p1c/p3a |

## Rejected Measurements

These values or models should not be used for the home TOC:

- `880px` or `960px` centered max-width as the home layout.
- A global serif-first typography system.
- A table-like four-column row model as the primary TOC structure.
- A `32 x 20px` icon as the primary visual slot.
- A strict screenshot diff against this reference.
- Generic SaaS hover backgrounds, shadows, pill controls, or card selection borders.

## Verification Notes

The first implementation should prove the adapted grammar with:

1. computed style assertions for tokens and typography roles;
2. bounding box assertions for page width, gutters, columns, masthead rule, and row pitch;
3. DOM assertions for navigation semantics and section/article order;
4. review screenshots from the local implementation;
5. own golden screenshot regression after p1b approval.
