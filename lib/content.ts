import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { contentRoadmap } from "@/lib/content-roadmap";
import type { ArticleDifficulty, VisualArtifactKey } from "@/lib/content-roadmap";

export type TocSectionStatus = "draft" | "review" | "stable" | "planned";

export type TocVisualKey =
  | "risk-matrix"
  | "trust-boundary-map"
  | "crypto-strip"
  | "hash-chain"
  | "tls-record-strip"
  | "tls-handshake-transcript"
  | "proof-pipeline"
  | "transcript-receipt"
  | "circuit-grid"
  | "merkle-branch"
  | "browser-session-trace"
  | "trust-layer-stack"
  | "tunnel-encapsulation-stack"
  | "api-authz-object-graph"
  | "supply-chain-provenance"
  | "witness-public-circuit"
  | string;

export type TocArticle = {
  id: string;
  slug: string;
  articleSlug: string;
  order: number;
  title: string;
  status: TocSectionStatus;
  branch: string;
  difficulty: ArticleDifficulty;
  visualKey: VisualArtifactKey;
  readerQuestion: string;
  zktlsBridge: string;
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
const roadmapChapterRoutes: Record<string, string> = {
  c01: "foundations-of-cryptography",
  c02: "foundations-of-cryptography",
  c03: "tls-protocol",
  c04: "tls-protocol",
  c05: "implementation-and-runtime",
  c06: "implementation-and-runtime",
  c07: "advanced-cryptography",
  c08: "zktls-architecture",
};

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
  const chaptersBySlug = new Map(getChapters().map((chapter) => [chapter.slug, chapter]));

  return contentRoadmap.chapters.map((chapter) => {
    const routeSlug = chaptersBySlug.get(chapter.slug)?.slug ?? roadmapChapterRoutes[chapter.id] ?? "zktls-architecture";
    const wordCount = chapter.articles.reduce((total, article) => total + article.wordCountTarget, 0);

    return {
      id: chapter.id,
      order: chapter.order,
      title: chapter.title,
      subtitle: chapter.guidingQuestion,
      status: chapter.status,
      wordCount,
      articleCount: chapter.articles.length,
      visualKey: chapter.visualKey,
      articles: chapter.articles.map((article) => ({
        id: article.id,
        slug: routeSlug,
        articleSlug: article.slug,
        order: article.order,
        title: article.title,
        status: article.status,
        branch: article.branch,
        difficulty: article.difficulty,
        visualKey: article.visualKey,
        readerQuestion: article.readerQuestion,
        zktlsBridge: article.zktlsBridge,
        wordCount: article.actualWordCount ?? article.wordCountTarget,
      })),
    };
  });
}
