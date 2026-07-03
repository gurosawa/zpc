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
const atlasCanvasSource = fs.readFileSync("components/atlas/atlas-canvas.tsx", "utf8");
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

test("atlas canvas adds ambient breathing and pointer parallax without controls", () => {
  assert.match(atlasCanvasSource, /useFrame/);
  assert.match(atlasCanvasSource, /prefers-reduced-motion:\s*reduce/);
  assert.match(atlasCanvasSource, /Math\.sin/);
  assert.match(atlasCanvasSource, /state\.pointer/);
  assert.match(atlasCanvasSource, /atlasFrameLoop/);
  assert.match(atlasCanvasSource, /"always"/);
  assert.doesNotMatch(atlasCanvasSource, /OrbitControls|PresentationControls/);
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
