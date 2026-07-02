import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type TocSectionStatus = "draft" | "review" | "stable" | "planned";

export type TocVisualKey =
  | "tls-record-strip"
  | "proof-pipeline"
  | "transcript-receipt"
  | "circuit-grid"
  | "merkle-branch"
  | "browser-session-trace"
  | "trust-layer-stack"
  | string;

export type TocArticle = {
  id: string;
  slug: string;
  order: number;
  title: string;
  status: TocSectionStatus;
  wordCount?: number;
};

export type TocSection = {
  id: string;
  order: number;
  title: string;
  subtitle?: string;
  status: TocSectionStatus;
  wordCount: number;
  articleCount: number;
  visualKey: TocVisualKey;
  articles: TocArticle[];
};

export type Chapter = {
  slug: string;
  order: number;
  title: string;
  summary: string;
  status: TocSectionStatus;
  guidingQuestion: string;
  readerPromise: string;
  expectedWords: number;
  draftOutline: string[];
  illustrationIdea: string;
  interactiveIdea: string;
  visualKey: TocVisualKey;
  body: string;
};

const contentDir = path.join(process.cwd(), "content");

function normalizeStatus(value: unknown): TocSectionStatus {
  const status = String(value).toLowerCase();

  if (status === "review" || status === "stable" || status === "planned") {
    return status;
  }

  if (status === "final") {
    return "stable";
  }

  return "draft";
}

function readStringList(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

function readChapter(fileName: string): Chapter {
  const raw = fs.readFileSync(path.join(contentDir, fileName), "utf8");
  const { content, data } = matter(raw);
  const status = normalizeStatus(data.status);

  return {
    slug: String(data.slug),
    order: Number(data.order),
    title: String(data.title),
    summary: String(data.summary),
    status,
    guidingQuestion: String(data.guiding_question),
    readerPromise: String(data.reader_promise),
    expectedWords: Number(data.expected_words),
    draftOutline: readStringList(data.draft_outline),
    illustrationIdea: String(data.illustration_idea),
    interactiveIdea: String(data.interactive_idea),
    visualKey: String(data.visual_key),
    body: content,
  };
}

export function getChapters() {
  return fs
    .readdirSync(contentDir)
    .filter((fileName) => fileName.endsWith(".mdx"))
    .map(readChapter)
    .sort((a, b) => a.order - b.order);
}

export function getChapterBySlug(slug: string) {
  return getChapters().find((chapter) => chapter.slug === slug) ?? null;
}

export function getTocSections(): TocSection[] {
  return getChapters().map((chapter) => ({
    id: chapter.slug,
    order: chapter.order,
    title: chapter.title,
    subtitle: chapter.guidingQuestion,
    status: chapter.status,
    wordCount: chapter.expectedWords,
    articleCount: chapter.draftOutline.length,
    visualKey: chapter.visualKey,
    articles: chapter.draftOutline.map((title, index) => ({
      id: `${chapter.slug}-${index + 1}`,
      slug: chapter.slug,
      order: index + 1,
      title,
      status: chapter.status,
    })),
  }));
}
