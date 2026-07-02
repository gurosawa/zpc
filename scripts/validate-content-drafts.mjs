import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import matter from "gray-matter";

const allowedStatuses = new Set(["draft", "review", "stable", "planned"]);
const allowedDifficulties = new Set(["foundation", "intermediate", "deep", "lab"]);
const draftRoots = ["articles", "drafts"];

export const requiredDraftHeadings = [
  "Reader Question",
  "Why It Matters",
  "Core Model",
  "Protocol or System Artifact",
  "Failure Mode",
  "Minimal Lab or Trace",
  "zkTLS Bridge",
  "Verification Checklist",
  "References",
];

function readRoadmap(root) {
  return JSON.parse(fs.readFileSync(path.join(root, "content", "article-roadmap.json"), "utf8"));
}

function getRoadmapArticles(roadmap) {
  return roadmap.chapters.flatMap((chapter) =>
    chapter.articles.map((article) => ({
      ...article,
      chapterSlug: chapter.slug,
      chapterTitle: chapter.title,
    })),
  );
}

function findDraftFiles(root) {
  const contentDir = path.join(root, "content");

  return draftRoots.flatMap((draftRoot) => {
    const baseDir = path.join(contentDir, draftRoot);
    if (!fs.existsSync(baseDir)) {
      return [];
    }

    return fs
      .readdirSync(baseDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .flatMap((chapterEntry) => {
        const chapterSlug = chapterEntry.name;
        const chapterDir = path.join(baseDir, chapterSlug);

        return fs
          .readdirSync(chapterDir, { withFileTypes: true })
          .filter((entry) => entry.isFile() && entry.name.endsWith(".mdx"))
          .map((entry) => ({
            draftRoot,
            chapterSlug,
            articleSlug: entry.name.replace(/\.mdx$/, ""),
            filePath: path.join(chapterDir, entry.name),
          }));
      });
  });
}

function wordCount(value) {
  return value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}

function assertEqual(errors, label, actual, expected) {
  if (actual !== expected) {
    errors.push(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function validateDraft({ draft, roadmapByPath }) {
  const errors = [];
  const raw = fs.readFileSync(draft.filePath, "utf8");
  const { content, data } = matter(raw);
  const routeKey = `${draft.chapterSlug}/${draft.articleSlug}`;
  const roadmapArticle = roadmapByPath.get(routeKey);
  const relativePath = path.relative(process.cwd(), draft.filePath);

  if (!roadmapArticle) {
    errors.push(`${relativePath}: no matching roadmap article for ${routeKey}`);
    return { errors, summary: null };
  }

  assertEqual(errors, `${relativePath}: frontmatter chapterSlug`, data.chapterSlug, draft.chapterSlug);
  assertEqual(errors, `${relativePath}: frontmatter articleSlug`, data.articleSlug, draft.articleSlug);
  assertEqual(errors, `${relativePath}: title`, data.title, roadmapArticle.title);
  assertEqual(errors, `${relativePath}: status`, data.status, roadmapArticle.status);
  assertEqual(errors, `${relativePath}: difficulty`, data.difficulty, roadmapArticle.difficulty);
  assertEqual(errors, `${relativePath}: wordCountTarget`, data.wordCountTarget, roadmapArticle.wordCountTarget);
  assertEqual(errors, `${relativePath}: visualKey`, data.visualKey, roadmapArticle.visualKey);
  assertEqual(errors, `${relativePath}: branch`, data.branch, roadmapArticle.branch);

  if (!allowedStatuses.has(data.status)) {
    errors.push(`${relativePath}: invalid status ${JSON.stringify(data.status)}`);
  }

  if (!allowedDifficulties.has(data.difficulty)) {
    errors.push(`${relativePath}: invalid difficulty ${JSON.stringify(data.difficulty)}`);
  }

  if (!Array.isArray(data.references) || data.references.length === 0) {
    errors.push(`${relativePath}: references must be a non-empty array`);
  } else if (!data.references.every((reference) => /^https:\/\//.test(String(reference)))) {
    errors.push(`${relativePath}: references must be https URLs`);
  }

  const h1Matches = [...content.matchAll(/^#\s+(.+)$/gm)];
  if (h1Matches.length !== 1) {
    errors.push(`${relativePath}: expected exactly one H1, got ${h1Matches.length}`);
  }

  const headings = new Set([...content.matchAll(/^##\s+(.+)$/gm)].map((match) => match[1].trim()));
  for (const heading of requiredDraftHeadings) {
    if (!headings.has(heading)) {
      errors.push(`${relativePath}: missing heading ${heading}`);
    }
  }

  return {
    errors,
    summary: {
      path: relativePath,
      route: `/guide/${draft.chapterSlug}/${draft.articleSlug}`,
      words: wordCount(content),
    },
  };
}

export function validateContentDrafts({ root = process.cwd() } = {}) {
  const roadmap = readRoadmap(root);
  const roadmapByPath = new Map(
    getRoadmapArticles(roadmap).map((article) => [`${article.chapterSlug}/${article.slug}`, article]),
  );
  const seenRoutes = new Set();
  const drafts = findDraftFiles(root);
  const errors = [];
  const summaries = [];

  for (const draft of drafts) {
    const routeKey = `${draft.chapterSlug}/${draft.articleSlug}`;
    if (seenRoutes.has(routeKey)) {
      errors.push(`${routeKey}: duplicate draft across content/articles and content/drafts`);
      continue;
    }

    seenRoutes.add(routeKey);
    const result = validateDraft({ draft, roadmapByPath });
    errors.push(...result.errors);
    if (result.summary) {
      summaries.push(result.summary);
    }
  }

  return {
    drafts: summaries,
    errors,
  };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = validateContentDrafts();

  if (result.errors.length > 0) {
    for (const error of result.errors) {
      console.error(error);
    }
    process.exit(1);
  }

  console.log(`Validated ${result.drafts.length} draft article(s).`);
  for (const draft of result.drafts) {
    console.log(`${draft.route} ${draft.words} words`);
  }
}
