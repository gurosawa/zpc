import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { TocSectionStatus, TocVisualKey } from "@/lib/content";

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
const chapterFiles = ["chapter1.mdx", "chapter2.mdx", "chapter3.mdx", "chapter4.mdx", "chapter5.mdx"];

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
  return chapterFiles
    .map(readChapter)
    .sort((a, b) => a.order - b.order);
}

export function getChapterBySlug(slug: string) {
  return getChapters().find((chapter) => chapter.slug === slug) ?? null;
}
