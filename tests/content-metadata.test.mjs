import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import matter from "gray-matter";

const contentDir = path.join(process.cwd(), "content");
const roadmapFile = path.join(contentDir, "article-roadmap.json");
const startHereRoadmapFile = path.join(contentDir, "start-here-roadmap.json");
const requiredStringFields = [
  "guiding_question",
  "reader_promise",
  "illustration_idea",
  "interactive_idea",
  "visual_key",
];
const allowedStatuses = new Set(["draft", "review", "stable", "planned"]);
const allowedDifficulties = new Set(["foundation", "intermediate", "deep", "lab"]);
const requiredArticleFields = [
  "readerQuestion",
  "whyItMatters",
  "coreModel",
  "protocolOrSystemArtifact",
  "failureMode",
  "minimalLabOrTrace",
  "zktlsBridge",
  "visualKey",
  "branch",
];

test("chapter frontmatter contains p1a editorial metadata", () => {
  const files = fs
    .readdirSync(contentDir)
    .filter((fileName) => fileName.endsWith(".mdx"));

  assert.equal(files.length, 5);

  for (const fileName of files) {
    const raw = fs.readFileSync(path.join(contentDir, fileName), "utf8");
    const { data } = matter(raw);

    assert.ok(allowedStatuses.has(data.status), `${fileName}: invalid status`);
    assert.equal(typeof data.expected_words, "number", `${fileName}: expected_words`);
    assert.ok(data.expected_words > 0, `${fileName}: expected_words must be positive`);
    assert.ok(Array.isArray(data.draft_outline), `${fileName}: draft_outline`);
    assert.ok(data.draft_outline.length >= 4, `${fileName}: draft_outline entries`);

    for (const field of requiredStringFields) {
      assert.equal(typeof data[field], "string", `${fileName}: ${field}`);
      assert.ok(data[field].trim(), `${fileName}: ${field} must not be empty`);
    }
  }
});

test("article roadmap contains 8 chapters and 48 complete article briefs", () => {
  const roadmap = JSON.parse(fs.readFileSync(roadmapFile, "utf8"));
  const branches = new Set();
  const articleSlugs = new Set();
  const articleRoutes = new Set();

  assert.equal(roadmap.currentPlanningBranch, "docs/p4-content-roadmap");
  assert.equal(roadmap.chapters.length, 8);

  for (const chapter of roadmap.chapters) {
    assert.ok(chapter.id.match(/^c\d{2}$/), `${chapter.id}: chapter id`);
    assert.ok(allowedStatuses.has(chapter.status), `${chapter.id}: status`);
    assert.equal(typeof chapter.visualKey, "string", `${chapter.id}: visualKey`);
    assert.ok(chapter.visualKey.trim(), `${chapter.id}: visualKey must not be empty`);
    assert.equal(chapter.articles.length, 6, `${chapter.id}: article count`);

    for (const article of chapter.articles) {
      assert.equal(article.chapterId, chapter.id, `${article.id}: chapterId`);
      assert.ok(allowedStatuses.has(article.status), `${article.id}: status`);
      assert.ok(allowedDifficulties.has(article.difficulty), `${article.id}: difficulty`);
      assert.equal(typeof article.wordCountTarget, "number", `${article.id}: wordCountTarget`);
      assert.ok(article.wordCountTarget >= 3000, `${article.id}: wordCountTarget floor`);
      assert.match(article.branch, /^content\/c\d{2}-a\d{2}-[a-z0-9-]+$/, `${article.id}: branch`);

      for (const field of requiredArticleFields) {
        assert.equal(typeof article[field], "string", `${article.id}: ${field}`);
        assert.ok(article[field].trim(), `${article.id}: ${field} must not be empty`);
      }

      assert.ok(Array.isArray(article.references), `${article.id}: references`);
      assert.ok(article.references.length > 0, `${article.id}: references must not be empty`);
      assert.ok(
        article.references.every((reference) => /^https:\/\//.test(reference)),
        `${article.id}: references must be https URLs`,
      );

      assert.ok(
        Array.isArray(article.verificationChecklist) && article.verificationChecklist.length >= 3,
        `${article.id}: verificationChecklist`,
      );

      assert.equal(branches.has(article.branch), false, `${article.id}: duplicate branch`);
      assert.equal(articleSlugs.has(article.slug), false, `${article.id}: duplicate slug`);
      const routePath = `/guide/${chapter.slug}/${article.slug}`;
      assert.equal(articleRoutes.has(routePath), false, `${article.id}: duplicate article route`);
      branches.add(article.branch);
      articleSlugs.add(article.slug);
      articleRoutes.add(routePath);
    }
  }

  assert.equal(branches.size, 48);
  assert.equal(articleSlugs.size, 48);
  assert.equal(articleRoutes.size, 48);
});

test("start-here roadmap contains 18 core articles and 2 developer labs", () => {
  const chapter = JSON.parse(fs.readFileSync(startHereRoadmapFile, "utf8"));
  const introduced = new Set();
  const ids = new Set();
  const slugs = new Set();

  assert.equal(chapter.id, "c00");
  assert.equal(chapter.order, 0);
  assert.equal(chapter.slug, "start-here");
  assert.equal(chapter.articles.length, 20);

  for (const [index, article] of chapter.articles.entries()) {
    assert.equal(article.id, `c00-a${String(index + 1).padStart(2, "0")}`);
    assert.equal(article.order, index + 1);
    assert.equal(article.chapterId, "c00");
    assert.equal(article.readingBudget, article.wordCountTarget);
    assert.ok(["core", "developer-lab"].includes(article.pathRole));
    assert.ok(Array.isArray(article.assumes));
    assert.ok(Array.isArray(article.introduces) && article.introduces.length > 0);
    assert.ok(article.checkpoint.trim());
    assert.equal(ids.has(article.id), false, `${article.id}: duplicate id`);
    assert.equal(slugs.has(article.slug), false, `${article.id}: duplicate slug`);

    for (const concept of article.assumes) {
      assert.ok(introduced.has(concept), `${article.id}: assumes ${concept} too early`);
    }
    for (const concept of article.introduces) {
      introduced.add(concept);
    }

    ids.add(article.id);
    slugs.add(article.slug);
  }

  assert.equal(chapter.articles.filter((article) => article.pathRole === "core").length, 18);
  assert.equal(
    chapter.articles.filter((article) => article.pathRole === "developer-lab").length,
    2,
  );
  assert.equal(
    chapter.articles.slice(0, 18).reduce((sum, article) => sum + article.readingBudget, 0),
    70000,
  );
  assert.equal(
    chapter.articles.slice(18).reduce((sum, article) => sum + article.readingBudget, 0),
    12000,
  );
});
