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
const homeKineticSource = fs.readFileSync(
  "components/atlas/home-atlas-experience.tsx",
  "utf8",
);
const kineticHeroSource = fs.readFileSync("components/atlas/atlas-hero.tsx", "utf8");
const kineticCanvasSource = fs.readFileSync("components/atlas/atlas-canvas.tsx", "utf8");
const kineticFallbackSource = fs.readFileSync("components/atlas/atlas-fallback.tsx", "utf8");
const globalsSource = fs.readFileSync("app/globals.css", "utf8");
const searchDialogSource = fs.readFileSync("components/search-dialog.tsx", "utf8");
const kineticHomeBundle = [
  homeKineticSource,
  kineticHeroSource,
  kineticCanvasSource,
  kineticFallbackSource,
].join("\n");

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
    assert.match(
      contentSource,
      new RegExp(`export function ${exportName}\\b`),
      `${exportName} export`,
    );
  }

  assert.match(
    contentSource,
    /return `\/guide\/\$\{chapterSlug\}\/\$\{articleSlug\}`/,
    "getRoadmapArticlePath should use article-level route shape",
  );
});

test("roadmap content helpers stay filesystem-free for static shell routes", () => {
  assert.doesNotMatch(
    contentSource,
    /node:fs|node:path|gray-matter|process\.cwd|readFileSync|readdirSync/,
  );
  assert.match(contentFilesSource, /node:fs/);
  assert.doesNotMatch(homeSource, /@\/lib\/content-files/);
  assert.doesNotMatch(notFoundSource, /@\/lib\/content-files/);
});

test("home TOC keeps article routes and omits chapter artifact preview slots", () => {
  const homeTocSource = `${homeSource}\n${homeKineticSource}`;

  assert.match(homeTocSource, /href=\{article\.path\}/);
  assert.doesNotMatch(homeTocSource, /#\$\{article\.articleSlug/);
  assert.doesNotMatch(homeTocSource, /\/guide\/\$\{article\.slug\}#/);
  assert.doesNotMatch(homeKineticSource, /ArtifactDiagram|visual-artifact-slot|artifact-label/);
});

test("kinetic home derives all eight spatial rows from the existing chapter data", () => {
  assert.equal(roadmap.chapters.length, 8);
  assert.equal(roadmap.chapters.every((chapter) => chapter.articles.length === 6), true);
  assert.match(homeKineticSource, /tocSections\.map\(\(\{ order, slug, title \}\)/);
  assert.match(homeKineticSource, /chapters=\{kineticChapters\}/);
  assert.match(kineticCanvasSource, /export type KineticChapter = \{/);
  assert.match(kineticCanvasSource, /const rows = chapters\.map\(\(chapter\)/);
  assert.match(kineticCanvasSource, /rowLayout\.map\(\(\{ baseY, chapter, title \}, index\)/);
});

test("home state implements arming overview and chapter modes with direct reading priority", () => {
  assert.match(
    kineticCanvasSource,
    /export type KineticIndexMode = "arming" \| "overview" \| "chapter"/,
  );
  assert.match(homeKineticSource, /const \[activeByHover/);
  assert.match(homeKineticSource, /const \[activeByFocus/);
  assert.match(homeKineticSource, /const \[activeByScroll/);
  assert.match(homeKineticSource, /new IntersectionObserver/);
  assert.match(
    homeKineticSource,
    /activeChapterSlug\s*=\s*[\s\S]*?activeByInteraction \?\? activeByScroll \?\? firstChapterSlug/,
  );
  assert.match(homeKineticSource, /const isOverview = window\.scrollY <= 80/);
  assert.match(homeKineticSource, /const tailProgress = 1 - Math\.min/);
  assert.match(homeKineticSource, /0\.35 \+ tailProgress \* 0\.45/);
  assert.match(homeKineticSource, /overviewActive[\s\S]*?"overview"[\s\S]*?: "chapter"/);
});

test("arming starts from renderer readiness and reduced motion bypasses the delay", () => {
  assert.match(homeKineticSource, /const \[rendererReady, setRendererReady\]/);
  assert.match(homeKineticSource, /const armed = reducedMotion \|\| armingComplete/);
  assert.match(homeKineticSource, /window\.setTimeout\(\(\) => setArmingComplete\(true\), 1800\)/);
  assert.match(homeKineticSource, /onRendererReady=\{handleRendererReady\}/);
  assert.match(kineticCanvasSource, /const armingDuration = 1\.8/);
});

test("the detailed 48-entry TOC starts directly without accordion or duplicate index", () => {
  assert.equal(roadmap.chapters.flatMap((chapter) => chapter.articles).length, 48);
  assert.match(homeKineticSource, /<nav className="editorial-toc"/);
  assert.match(homeKineticSource, /tocColumns\.map/);
  assert.match(homeKineticSource, /href=\{article\.path\}/);
  assert.doesNotMatch(homeKineticSource, /kinetic-overview|aria-expanded|aria-controls/);
  assert.doesNotMatch(homeKineticSource, /expandedChapterSlug|chapter-index/);
  assert.doesNotMatch(homeKineticSource, /scrollIntoView|window\.scrollTo|location\.href/);
});

test("full TOC retains hover focus and scroll reading states", () => {
  assert.match(homeKineticSource, /section\.slug === activeChapterSlug/);
  assert.match(homeKineticSource, /onPointerEnter=\{\(\) => setActiveByHover/);
  assert.match(homeKineticSource, /onPointerLeave=\{\(\) => setActiveByHover\(null\)\}/);
  assert.match(homeKineticSource, /onFocus=\{\(\) => setActiveByFocus/);
  assert.match(homeKineticSource, /is-active/);
  assert.match(homeKineticSource, /is-dimmed/);
  assert.match(globalsSource, /\.toc-section\.is-active/);
  assert.match(globalsSource, /\.toc-section\.is-dimmed/);
});

test("kinetic canvas uses local Departure Mono text and line geometry only", () => {
  assert.equal(typeof packageJson.dependencies["@react-three/drei"], "string");
  assert.match(kineticCanvasSource, /import \{ Text \} from "@react-three\/drei"/);
  assert.match(kineticCanvasSource, /<Text\b/);
  assert.match(kineticCanvasSource, /\/fonts\/DepartureMono-Regular\.otf/);
  assert.equal(fs.existsSync("public/fonts/DepartureMono-Regular.otf"), true);
  assert.equal(fs.existsSync("public/fonts/DepartureMono-LICENSE.txt"), true);
  assert.match(kineticCanvasSource, /boxGeometry args=\{\[5\.96, 0\.009, 0\.009\]\}/);
  assert.doesNotMatch(kineticCanvasSource, /<Html\b|meshPhysicalMaterial|meshStandardMaterial/);
});

test("kinetic canvas keeps text front-facing while using bounded depth and position parallax", () => {
  assert.equal(typeof packageJson.dependencies.maath, "string");
  assert.match(kineticCanvasSource, /from "maath\/easing"/);
  assert.match(kineticCanvasSource, /useFrame/);
  assert.match(kineticCanvasSource, /state\.pointer/);
  assert.match(kineticCanvasSource, /Math\.sin/);
  assert.match(kineticCanvasSource, /targetZ = baseZ \+ depth/);
  assert.match(kineticCanvasSource, /easing\.damp3/);
  assert.doesNotMatch(kineticCanvasSource, /targetRotation|scene\.rotation|easing\.dampE/);
  assert.match(kineticCanvasSource, /useRef<Group>/);
  assert.doesNotMatch(kineticHomeBundle, /createStore|zustand|useSyncExternalStore/);
});

test("committed chapter changes use the 140 360 100 millisecond fold release settle beat", () => {
  assert.match(kineticCanvasSource, /const transitionDuration = 0\.6/);
  assert.match(kineticCanvasSource, /elapsed < 0\.14/);
  assert.match(kineticCanvasSource, /\(elapsed - 0\.14\) \/ 0\.36/);
  assert.match(kineticCanvasSource, /\(elapsed - 0\.5\) \/ 0\.1/);
  assert.match(kineticCanvasSource, /focusKind === "committed"/);
  assert.match(kineticCanvasSource, /focusKind === "committed" \? committedDepth : previewDepth/);
});

test("arming sequence implements reveal collision compression and final settle", () => {
  assert.match(kineticCanvasSource, /const revealDelay = index \* 0\.045/);
  assert.match(kineticCanvasSource, /\(elapsed - revealDelay\) \/ 0\.14/);
  assert.match(kineticCanvasSource, /\(elapsed - 0\.45\) \/ 0\.9/);
  assert.match(kineticCanvasSource, /\(elapsed - 1\.35\) \/ 0\.45/);
  assert.match(kineticCanvasSource, /compressionOvershoot/);
  assert.match(kineticCanvasSource, /onCreated=\{signalRendererReady\}/);
});

test("reduced motion shows final transforms immediately while normal mode keeps animation frames", () => {
  assert.match(homeKineticSource, /prefers-reduced-motion: reduce/);
  assert.match(kineticCanvasSource, /const frameLoop = reducedMotion \? "demand" : "always"/);
  assert.match(kineticCanvasSource, /if \(reducedMotion\) \{[\s\S]*?row\.position\.set/);
  assert.match(kineticCanvasSource, /if \(reducedMotion\) \{[\s\S]*?scene\.position\.set/);
  assert.match(globalsSource, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(globalsSource, /\.kinetic-index-fallback-row[\s\S]*?animation: none !important/);
});

test("WebGL detection falls back to the same hidden eight-title spatial index", () => {
  assert.match(kineticHeroSource, /function supportsWebgl/);
  assert.match(kineticHeroSource, /canvas\.getContext\("webgl2"\)/);
  assert.match(kineticHeroSource, /<KineticIndexFallback/);
  assert.match(kineticFallbackSource, /chapters\.map\(\(chapter, index\)/);
  assert.match(kineticFallbackSource, /aria-hidden="true"/);
  assert.match(kineticCanvasSource, /aria-hidden="true"/);
  assert.match(globalsSource, /\.kinetic-index-fallback[\s\S]*?perspective: 900px/);
  const fallbackStackRule = globalsSource.match(
    /\.kinetic-index-fallback-stack\s*\{([\s\S]*?)\}/,
  )?.[1];
  assert.ok(fallbackStackRule);
  assert.doesNotMatch(fallbackStackRule, /rotateX|rotateY/);
});

test("the visual card keeps the guide introduction without a bottom status panel", () => {
  assert.match(kineticHeroSource, /zkTLS MASTER GUIDE/);
  assert.match(kineticHeroSource, /A field manual for proving web data without overexposing trust/);
  assert.doesNotMatch(kineticHeroSource, /kinetic-index-meta|articleCount|focusLabel|modeLabel/);
  assert.doesNotMatch(kineticHeroSource, /Forensic Isometric Atlas|>TRACE<|>DISCLOSE<|>INSPECT</);
});

test("home kinetic code excludes wheel capture evidence motifs controls and post processing", () => {
  const forbidden = [
    "atlas-data",
    "preventDefault",
    "addEventListener(\\\"wheel",
    "onWheel=",
    "OrbitControls",
    "PresentationControls",
    "Float",
    "Environment",
    "Sparkles",
    "EffectComposer",
    "Bloom",
    "SourcePillars",
    "TlsTunnel",
    "TranscriptStrip",
    "RedactionGrate",
    "WitnessTray",
    "ProofPrism",
    "VerifierGate",
    "LayerDioramaMotif",
  ];

  for (const token of forbidden) {
    assert.equal(kineticHomeBundle.includes(token.replace("\\\"", "\"")), false, token);
  }

  assert.equal(fs.existsSync("components/atlas/atlas-data.ts"), false);
  assert.equal(packageJson.dependencies["framer-motion-3d"], undefined);
  assert.equal(packageJson.dependencies.zustand, undefined);
});

test("kinetic home keeps the desktop sticky split and mobile shallow spatial layout", () => {
  assert.match(globalsSource, /\.kinetic-home-layout[\s\S]*?grid-template-columns: minmax\(36rem/);
  assert.match(globalsSource, /\.kinetic-home-panel[\s\S]*?position: sticky/);
  assert.match(globalsSource, /@media \(max-width: 719px\)[\s\S]*?\.kinetic-index-visual/);
  assert.match(globalsSource, /\.kinetic-home-toc > \.editorial-toc[\s\S]*?padding-top: 20px/);
  assert.doesNotMatch(globalsSource, /\.kinetic-overview|\.kinetic-index-meta-grid/);
  assert.match(kineticCanvasSource, /const depthGap = compact \? 0\.1 : 0\.19/);
  assert.match(kineticCanvasSource, /splitTitle\(chapter\.title, compact\)/);
});

test("kinetic canvas responds to light and dark themes without environment assets", () => {
  assert.match(kineticCanvasSource, /type KineticThemeMode = "dark" \| "light"/);
  assert.match(kineticCanvasSource, /document\.documentElement\.classList\.contains\("dark"\)/);
  assert.match(kineticCanvasSource, /MutationObserver/);
  assert.match(kineticCanvasSource, /dark: \{/);
  assert.match(kineticCanvasSource, /light: \{/);
  assert.doesNotMatch(kineticCanvasSource, /Environment|textureLoader|useGLTF/);
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
  assert.match(routeSource, /\$\{article\.title\}.*zkTLS Master Guide/);

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
  assert.equal(
    articles.at(-1).path,
    "/guide/zktls-architectures-and-labs/toy-circuit-production-risk",
  );
});
