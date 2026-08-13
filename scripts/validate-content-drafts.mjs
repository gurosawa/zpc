import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import matter from "gray-matter";

const allowedStatuses = new Set(["draft", "review", "stable", "planned"]);
const allowedDifficulties = new Set(["foundation", "intermediate", "deep", "lab"]);
const allowedVisualPriorities = new Set(["must", "should", "could"]);
const allowedVisualStatuses = new Set(["planned", "research-needed", "ready-for-production"]);
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
  const contentDir = path.join(root, "content");
  const roadmap = JSON.parse(fs.readFileSync(path.join(contentDir, "article-roadmap.json"), "utf8"));
  const startHerePath = path.join(contentDir, "start-here-roadmap.json");

  if (!fs.existsSync(startHerePath)) {
    return roadmap;
  }

  const startHere = JSON.parse(fs.readFileSync(startHerePath, "utf8"));
  return {
    ...roadmap,
    chapters: [startHere, ...roadmap.chapters],
  };
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
  const comparableActual = Array.isArray(actual) ? JSON.stringify(actual) : actual;
  const comparableExpected = Array.isArray(expected) ? JSON.stringify(expected) : expected;

  if (comparableActual !== comparableExpected) {
    errors.push(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function validateLearningPath(roadmap) {
  const errors = [];
  const learningArticles = getRoadmapArticles(roadmap)
    .filter((article) => article.pathRole === "core" || article.pathRole === "developer-lab")
    .sort((a, b) => a.order - b.order);
  const introduced = new Set();

  for (const article of learningArticles) {
    const label = `${article.chapterSlug}/${article.slug}`;

    if (!Array.isArray(article.assumes)) {
      errors.push(`${label}: assumes must be an array`);
    }
    if (!Array.isArray(article.introduces) || article.introduces.length === 0) {
      errors.push(`${label}: introduces must be a non-empty array`);
    }
    if (typeof article.checkpoint !== "string" || !article.checkpoint.trim()) {
      errors.push(`${label}: checkpoint must be a non-empty string`);
    }
    if (article.readingBudget !== article.wordCountTarget) {
      errors.push(`${label}: readingBudget must equal wordCountTarget`);
    }

    for (const concept of article.assumes ?? []) {
      if (!introduced.has(concept)) {
        errors.push(`${label}: assumes ${JSON.stringify(concept)} before it is introduced`);
      }
    }

    for (const concept of article.introduces ?? []) {
      introduced.add(concept);
    }
  }

  return errors;
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

  if (roadmapArticle.pathRole) {
    assertEqual(errors, `${relativePath}: pathRole`, data.pathRole, roadmapArticle.pathRole);
    assertEqual(errors, `${relativePath}: assumes`, data.assumes, roadmapArticle.assumes);
    assertEqual(errors, `${relativePath}: introduces`, data.introduces, roadmapArticle.introduces);
    assertEqual(errors, `${relativePath}: checkpoint`, data.checkpoint, roadmapArticle.checkpoint);
    assertEqual(
      errors,
      `${relativePath}: readingBudget`,
      data.readingBudget,
      roadmapArticle.readingBudget,
    );
  }

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
  } else if (h1Matches[0][1].trim() !== roadmapArticle.title) {
    errors.push(
      `${relativePath}: H1 must match roadmap title ${JSON.stringify(roadmapArticle.title)}`,
    );
  }

  const orderedHeadings = [...content.matchAll(/^##\s+(.+)$/gm)].map((match) => match[1].trim());
  const headings = new Set(orderedHeadings);
  for (const heading of requiredDraftHeadings) {
    if (!headings.has(heading)) {
      errors.push(`${relativePath}: missing heading ${heading}`);
    }
  }

  if (roadmapArticle.pathRole === "core" || roadmapArticle.pathRole === "developer-lab") {
    assertEqual(
      errors,
      `${relativePath}: H2 order`,
      orderedHeadings,
      requiredDraftHeadings,
    );

    const placeholders = [...content.matchAll(/<VisualPlaceholder\b([\s\S]*?)\/>/g)];
    if (placeholders.length !== 2) {
      errors.push(`${relativePath}: expected 2 VisualPlaceholder calls, got ${placeholders.length}`);
    }

    for (const [index, placeholder] of placeholders.entries()) {
      const attributes = placeholder[1];
      const label = `${relativePath}: VisualPlaceholder ${index + 1}`;
      for (const prop of [
        "title",
        "purpose",
        "recommended",
        "mustShow",
        "alt",
        "priority",
        "status",
      ]) {
        if (!new RegExp(`\\b${prop}="[^"]+"`).test(attributes)) {
          errors.push(`${label}: missing non-empty ${prop}`);
        }
      }

      const priority = attributes.match(/\bpriority="([^"]+)"/)?.[1];
      const status = attributes.match(/\bstatus="([^"]+)"/)?.[1];
      if (priority && !allowedVisualPriorities.has(priority)) {
        errors.push(`${label}: invalid priority ${JSON.stringify(priority)}`);
      }
      if (status && !allowedVisualStatuses.has(status)) {
        errors.push(`${label}: invalid status ${JSON.stringify(status)}`);
      }
    }

    if (/!\[[^\]]*\]\([^)]+\)|<img\b|<svg\b/i.test(content)) {
      errors.push(`${relativePath}: actual images or SVG are not allowed before visual production`);
    }

    if (content.length > roadmapArticle.readingBudget) {
      errors.push(
        `${relativePath}: body length ${content.length} exceeds readingBudget ${roadmapArticle.readingBudget}`,
      );
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
  const errors = validateLearningPath(roadmap);
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
