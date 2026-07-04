import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const roadmap = JSON.parse(fs.readFileSync("content/article-roadmap.json", "utf8"));
const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
const contentSource = fs.readFileSync("lib/content.ts", "utf8");
const contentFilesSource = fs.readFileSync("lib/content-files.ts", "utf8");
const homeSource = fs.readFileSync("app/page.tsx", "utf8");
const notFoundSource = fs.readFileSync("app/not-found.tsx", "utf8");
const homeAtlasSource = fs.readFileSync("components/atlas/home-atlas-experience.tsx", "utf8");
const atlasHeroSource = fs.readFileSync("components/atlas/atlas-hero.tsx", "utf8");
const atlasCanvasSource = fs.readFileSync("components/atlas/atlas-canvas.tsx", "utf8");
const atlasDataSource = fs.readFileSync("components/atlas/atlas-data.ts", "utf8");
const globalsSource = fs.readFileSync("app/globals.css", "utf8");
const searchDialogSource = fs.readFileSync("components/search-dialog.tsx", "utf8");

function articlePaths() {
  return roadmap.chapters.flatMap((chapter) =>
    chapter.articles.map((article) => `/guide/${chapter.slug}/${article.slug}`),
  );
}

test("roadmap article routes are unique article-level paths", () => {
  const paths = articlePaths();

  assert.equal(paths.length, 48);
  assert.equal(new Set(paths).size, 48);
  assert.ok(paths.includes("/guide/security-thinking/cia-triad"));
  assert.ok(paths.includes("/guide/cryptographic-primitives/hmac-tag-verification"));
  assert.ok(paths.includes("/guide/web-trust-and-tls/tls-record-layer"));
  assert.ok(paths.includes("/guide/zktls-architectures-and-labs/mpc-tls-tlsnotary"));
  assert.equal(paths.some((routePath) => routePath.includes("#")), false);
});

test("content helpers expose article lookup and adjacency contracts", () => {
  const expectedExports = [
    "getRoadmapChapters",
    "getRoadmapArticles",
    "getRoadmapArticleBySlugs",
    "getAdjacentRoadmapArticles",
    "getRoadmapArticlePath",
  ];

  for (const exportName of expectedExports) {
    assert.match(contentSource, new RegExp(`export function ${exportName}\\b`), `${exportName} export`);
  }

  assert.match(
    contentSource,
    /return `\/guide\/\$\{chapterSlug\}\/\$\{articleSlug\}`/,
    "getRoadmapArticlePath should use article-level route shape",
  );
});

test("roadmap content helpers stay filesystem-free for static shell routes", () => {
  assert.doesNotMatch(contentSource, /node:fs|node:path|gray-matter|process\.cwd|readFileSync|readdirSync/);
  assert.match(contentFilesSource, /node:fs/);
  assert.doesNotMatch(homeSource, /@\/lib\/content-files/);
  assert.doesNotMatch(notFoundSource, /@\/lib\/content-files/);
});

test("home TOC uses article route paths instead of legacy hash anchors", () => {
  const homeTocSource = `${homeSource}\n${homeAtlasSource}`;

  assert.match(homeTocSource, /href=\{article\.path\}/);
  assert.doesNotMatch(homeTocSource, /#\$\{article\.articleSlug/);
  assert.doesNotMatch(homeTocSource, /\/guide\/\$\{article\.slug\}#/);
});

test("home TOC does not render per-chapter artifact preview slots", () => {
  assert.doesNotMatch(homeAtlasSource, /ArtifactDiagram/);
  assert.doesNotMatch(homeAtlasSource, /visual-artifact-slot/);
  assert.doesNotMatch(homeAtlasSource, /artifact-label/);
});

test("home Atlas active chapter combines hover and scroll-spy state", () => {
  assert.match(homeAtlasSource, /activeByHover/);
  assert.match(homeAtlasSource, /activeByScroll/);
  assert.match(homeAtlasSource, /new IntersectionObserver/);
  assert.match(
    homeAtlasSource,
    /activeChapterSlug\s*=\s*activeByHover\s*\?\?\s*activeByScroll\s*\?\?\s*firstChapterSlug/,
  );
});

test("home TOC exposes active and dimmed reading states", () => {
  assert.match(homeAtlasSource, /section\.slug === activeChapterSlug/);
  assert.match(homeAtlasSource, /is-active/);
  assert.match(homeAtlasSource, /is-dimmed/);
  assert.match(globalsSource, /\.toc-section\.is-active/);
  assert.match(globalsSource, /\.toc-section\.is-dimmed/);
});

test("atlas canvas uses drei Html labels without forbidden controls", () => {
  assert.equal(typeof packageJson.dependencies["@react-three/drei"], "string");
  assert.match(atlasCanvasSource, /import\s+\{\s*Html\s*\}\s+from\s+"@react-three\/drei"/);
  assert.match(atlasCanvasSource, /<Html\b/);

  for (const forbidden of [
    "OrbitControls",
    "PresentationControls",
    "Float",
    "Environment",
    "Sparkles",
    "EffectComposer",
    "Bloom",
  ]) {
    assert.doesNotMatch(atlasCanvasSource, new RegExp(forbidden), `${forbidden} should stay unused`);
  }
});

test("atlas motif stagger keeps framer motion 3d behind a dependency gate", () => {
  assert.equal(packageJson.dependencies["framer-motion-3d"], "12.4.13");
});

test("atlas canvas adds ambient breathing and pointer parallax without controls", () => {
  assert.match(atlasCanvasSource, /useFrame/);
  assert.match(atlasCanvasSource, /prefers-reduced-motion:\s*reduce/);
  assert.match(atlasCanvasSource, /Math\.sin/);
  assert.match(atlasCanvasSource, /state\.pointer/);
  assert.match(atlasCanvasSource, /atlasFrameLoop/);
  assert.match(atlasCanvasSource, /"always"/);
  assert.doesNotMatch(atlasCanvasSource, /OrbitControls|PresentationControls/);
});

test("atlas canvas uses maath spring easing for accordion layer motion", () => {
  assert.equal(typeof packageJson.dependencies.maath, "string");
  assert.match(atlasCanvasSource, /from\s+"maath\/easing"/);
  assert.match(atlasCanvasSource, /accordionOffset/);
  assert.match(atlasCanvasSource, /targetScale/);
  assert.match(atlasCanvasSource, /easing\.damp3/);
});

test("atlas canvas tunes glass material for dark and light themes", () => {
  assert.match(atlasCanvasSource, /AtlasThemeMode/);
  assert.match(atlasCanvasSource, /document\.documentElement\.classList\.contains\("dark"\)/);
  assert.match(atlasCanvasSource, /MutationObserver/);
  assert.match(atlasCanvasSource, /meshPhysicalMaterial/);
  assert.match(atlasCanvasSource, /transmission=/);
  assert.match(atlasCanvasSource, /thickness=/);
  assert.match(atlasCanvasSource, /ior=/);
  assert.match(atlasCanvasSource, /themeMode === "light"/);
  assert.doesNotMatch(atlasCanvasSource, /Environment|Sparkles|EffectComposer|Bloom/);
});

test("atlas canvas separates primary supporting and dimmed layer states", () => {
  assert.match(atlasCanvasSource, /getPrimaryLayerIds/);
  assert.match(atlasCanvasSource, /type AtlasLayerVisualState = "primary" \| "supporting" \| "dimmed" \| "idle"/);
  assert.match(atlasCanvasSource, /function getAtlasLayerVisualState/);
  assert.match(atlasCanvasSource, /const isPrimary = visualState === "primary"/);
  assert.match(atlasCanvasSource, /const isSupporting = visualState === "supporting"/);
  assert.match(atlasCanvasSource, /supportingFillOpacity/);
  assert.match(atlasCanvasSource, /supportingLineOpacity/);
  assert.match(atlasCanvasSource, /emissiveIntensity/);
  assert.match(globalsSource, /\.atlas-layer-label\.is-primary/);
  assert.match(globalsSource, /\.atlas-layer-label\.is-supporting/);
  assert.match(globalsSource, /\.atlas-html-label\.is-primary/);
  assert.match(globalsSource, /\.atlas-html-label\.is-supporting/);
});

test("atlas data defines diorama motifs and layer article mappings", () => {
  const layerIds = ["source", "tls", "transcript", "redaction", "witness", "proof", "verifier"];
  const motifs = ["pillars", "tunnel", "record-strip", "filter-grate", "input-tray", "prism", "verifier-gate"];

  assert.match(atlasDataSource, /type AtlasLayerMotif/);
  assert.match(atlasDataSource, /inspectionLabel/);
  assert.match(atlasDataSource, /export const atlasLayerArticleMappings/);
  assert.match(atlasDataSource, /articleSlugs/);

  for (const motif of motifs) {
    assert.match(atlasDataSource, new RegExp(`"${motif}"`), `${motif} motif`);
  }

  for (const layerId of layerIds) {
    assert.match(
      atlasDataSource,
      new RegExp(`id: "${layerId}"[\\s\\S]*?motif:`),
      `${layerId} layer motif`,
    );
    assert.match(
      atlasDataSource,
      new RegExp(`id: "${layerId}"[\\s\\S]*?inspectionLabel:`),
      `${layerId} layer inspection label`,
    );
    assert.match(
      atlasDataSource,
      new RegExp(`layerId: "${layerId}"[\\s\\S]*?articleSlugs: \\[`),
      `${layerId} article mapping`,
    );
  }
});

test("atlas data marks core primary layers within broad chapter mappings", () => {
  assert.match(atlasDataSource, /primaryLayerIds\?: AtlasLayerId\[\]/);
  assert.match(atlasDataSource, /export function getPrimaryLayerIds/);
  assert.match(
    atlasDataSource,
    /"security-thinking": \{[\s\S]*?primaryLayerIds: \["source", "redaction", "verifier"\]/,
  );
  assert.match(
    atlasDataSource,
    /"zktls-architectures-and-labs": \{[\s\S]*?primaryLayerIds: \["source", "tls", "redaction", "proof", "verifier"\]/,
  );
});

test("home Atlas keeps 3D layer hover picking state local", () => {
  assert.match(homeAtlasSource, /hoveredAtlasLayerId/);
  assert.match(homeAtlasSource, /setHoveredAtlasLayerId/);
  assert.match(homeAtlasSource, /onLayerHoverChange=\{setHoveredAtlasLayerId\}/);
  assert.match(atlasCanvasSource, /hoveredLayerId/);
  assert.match(atlasCanvasSource, /onLayerHoverChange/);
  assert.match(atlasCanvasSource, /onPointerEnter/);
  assert.match(atlasCanvasSource, /onPointerLeave/);
  assert.doesNotMatch(`${homeAtlasSource}\n${atlasCanvasSource}`, /createStore|zustand|useSyncExternalStore/);
});

test("atlas canvas uses bounded wheel inspection for hovered layers", () => {
  assert.match(homeAtlasSource, /inspectedAtlasLayerId/);
  assert.match(homeAtlasSource, /setInspectedAtlasLayerId/);
  assert.match(homeAtlasSource, /onLayerInspectChange=\{setInspectedAtlasLayerId\}/);
  assert.match(atlasCanvasSource, /inspectedLayerId/);
  assert.match(atlasCanvasSource, /inspectionDepth/);
  assert.match(atlasCanvasSource, /function handleWheel/);
  assert.match(atlasCanvasSource, /if \(!hoveredLayerId\) return/);
  assert.match(atlasCanvasSource, /event\.preventDefault\(\)/);
  assert.match(atlasCanvasSource, /addEventListener\("wheel", handleWheel, \{ passive: false \}\)/);
  assert.doesNotMatch(atlasCanvasSource, /onWheel=\{handleWheel\}/);
  assert.match(atlasCanvasSource, /scene\.scale\.setScalar/);
  assert.doesNotMatch(atlasCanvasSource, /OrbitControls|PresentationControls/);
});

test("home TOC highlights article rows mapped from inspected atlas layers", () => {
  assert.match(homeAtlasSource, /atlasLayerArticleMappings/);
  assert.match(homeAtlasSource, /inspectedArticleSlugs/);
  assert.match(homeAtlasSource, /article\.articleSlug/);
  assert.match(homeAtlasSource, /is-atlas-inspected/);
  assert.match(homeAtlasSource, /data-atlas-article/);
  assert.match(globalsSource, /\.article-row\.is-atlas-inspected/);
});

test("atlas canvas renders primary diorama motifs on mapped layers", () => {
  for (const componentName of [
    "LayerDioramaMotif",
    "SourcePillars",
    "TlsTunnel",
    "RedactionGrate",
    "ProofPrism",
    "VerifierGate",
  ]) {
    assert.match(atlasCanvasSource, new RegExp(`function ${componentName}\\b`), componentName);
  }

  assert.match(atlasCanvasSource, /layer\.motif/);
  assert.match(atlasCanvasSource, /layer\.inspectionLabel/);
  assert.match(atlasCanvasSource, /case "pillars"/);
  assert.match(atlasCanvasSource, /case "tunnel"/);
  assert.match(atlasCanvasSource, /case "filter-grate"/);
  assert.match(atlasCanvasSource, /case "prism"/);
  assert.match(atlasCanvasSource, /case "verifier-gate"/);
  assert.doesNotMatch(atlasCanvasSource, /Environment|Sparkles|EffectComposer|Bloom/);
});

test("atlas canvas completes transcript witness motifs and diorama connectors", () => {
  for (const componentName of ["TranscriptStrip", "WitnessTray", "DioramaConnectors"]) {
    assert.match(atlasCanvasSource, new RegExp(`function ${componentName}\\b`), componentName);
  }

  assert.match(atlasCanvasSource, /case "record-strip"/);
  assert.match(atlasCanvasSource, /case "input-tray"/);
  assert.match(atlasCanvasSource, /<DioramaConnectors\b/);
  assert.match(atlasCanvasSource, /atlasLayers\.slice\(0, -1\)/);
  assert.doesNotMatch(atlasCanvasSource, /Environment|Sparkles|EffectComposer|Bloom/);
});

test("atlas hero exposes inspected layer telemetry labels", () => {
  assert.match(atlasHeroSource, /atlasLayers/);
  assert.match(atlasHeroSource, /inspectedLayer/);
  assert.match(atlasHeroSource, /inspectionLabel/);
  assert.match(atlasHeroSource, /data-atlas-inspected/);
  assert.match(atlasHeroSource, />INSPECT</);
});

test("search results use indexed article paths instead of chapter hash routes", () => {
  assert.match(searchDialogSource, /function hrefForItem/);
  assert.match(searchDialogSource, /href=\{hrefForItem\(item\)\}/);
  assert.doesNotMatch(searchDialogSource, /href=\{`\/guide\/\$\{item\.chapterSlug\}#/);
});

test("article route page and shell expose article content without internal metadata", () => {
  const routeFile = path.join("app", "guide", "[chapterSlug]", "[articleSlug]", "page.tsx");
  const shellFile = path.join("components", "article-page-shell.tsx");

  assert.equal(fs.existsSync(routeFile), true, "article route file should use [chapterSlug]");
  assert.equal(fs.existsSync(shellFile), true, "article page shell component should exist");

  const routeSource = fs.readFileSync(routeFile, "utf8");
  const shellSource = fs.readFileSync(shellFile, "utf8");

  assert.match(routeSource, /generateStaticParams/);
  assert.match(routeSource, /generateMetadata/);
  assert.match(routeSource, /notFound\(\)/);
  assert.match(routeSource, /ArticlePageShell/);
  assert.match(routeSource, /\$\{article\.title\} · zkTLS Master Guide/);

  const requiredShellText = [
    "Core Model",
    "Protocol or System Artifact",
    "Failure Mode",
    "Minimal Lab or Trace",
    "zkTLS Bridge",
    "Verification Checklist",
    "References",
    "Back to table of contents",
  ];

  for (const label of requiredShellText) {
    assert.match(shellSource, new RegExp(label), `${label} shell label`);
  }

  for (const fieldName of ["visualKey", "readerQuestion"]) {
    assert.match(shellSource, new RegExp(fieldName), `${fieldName} rendered by shell`);
  }

  assert.doesNotMatch(shellSource, /article-meta-line/, "top metadata block should not render");
  assert.doesNotMatch(shellSource, /article\.branch/, "branch should stay internal");
  assert.doesNotMatch(shellSource, /article\.difficulty/, "difficulty should stay internal");
  assert.doesNotMatch(shellSource, /article\.status\.toUpperCase/, "status should stay internal");
});

test("adjacent article expectations are defined over roadmap order", () => {
  const articles = roadmap.chapters.flatMap((chapter) =>
    chapter.articles.map((article) => ({
      chapterSlug: chapter.slug,
      articleSlug: article.slug,
      path: `/guide/${chapter.slug}/${article.slug}`,
    })),
  );

  assert.equal(articles[0].path, "/guide/security-thinking/cia-triad");
  assert.equal(articles[1].path, "/guide/security-thinking/asset-threat-vulnerability-risk");
  assert.equal(articles[5].path, "/guide/security-thinking/security-control-failure-modes");
  assert.equal(articles[6].path, "/guide/cryptographic-primitives/randomness-entropy");
  assert.equal(articles.at(-1).path, "/guide/zktls-architectures-and-labs/toy-circuit-production-risk");
});
