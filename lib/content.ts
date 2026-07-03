import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { contentRoadmap } from "@/lib/content-roadmap";
import type { ArticleDifficulty, ArticleMeta, ChapterMeta, VisualArtifactKey } from "@/lib/content-roadmap";

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
  chapterSlug: string;
  articleSlug: string;
  path: string;
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
  slug: string;
  order: number;
  title: string;
  subtitle?: string;
  status: TocSectionStatus;
  wordCount: number;
  articleCount: number;
  visualKey: TocVisualKey;
  articles: TocArticle[];
};

export type RoadmapArticle = ArticleMeta & {
  chapter: ChapterMeta;
  chapterSlug: string;
  chapterTitle: string;
  chapterOrder: number;
  articleSlug: string;
  path: string;
  wordCount: number;
};

export type RoadmapArticleDraft = {
  body: string;
  frontmatter: Record<string, unknown>;
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
const articleDraftDirs = [path.join(contentDir, "articles"), path.join(contentDir, "drafts")];

export function getRoadmapArticlePath(chapterSlug: string, articleSlug: string) {
  return `/guide/${chapterSlug}/${articleSlug}`;
}

const roadmapChapters = [...contentRoadmap.chapters].sort((a, b) => a.order - b.order);

const roadmapArticles: RoadmapArticle[] = roadmapChapters.flatMap((chapter) =>
  chapter.articles.map((article) => ({
    ...article,
    chapter,
    chapterSlug: chapter.slug,
    chapterTitle: chapter.title,
    chapterOrder: chapter.order,
    articleSlug: article.slug,
    path: getRoadmapArticlePath(chapter.slug, article.slug),
    wordCount: getArticleWordCount(chapter.slug, article),
  })),
);

const roadmapArticleByRoute = new Map(
  roadmapArticles.map((article) => [`${article.chapterSlug}/${article.articleSlug}`, article]),
);

const roadmapArticleIndexByRoute = new Map(
  roadmapArticles.map((article, index) => [`${article.chapterSlug}/${article.articleSlug}`, index]),
);

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

function countWords(value: string) {
  return value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/~~~[\s\S]*?~~~/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[`*_>#|[\]{}()]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}

function getArticleDraftPath(chapterSlug: string, articleSlug: string) {
  return articleDraftDirs
    .map((draftDir) => path.join(draftDir, chapterSlug, `${articleSlug}.mdx`))
    .find((candidate) => fs.existsSync(candidate)) ?? null;
}

function getArticleWordCount(chapterSlug: string, article: ArticleMeta) {
  const draftPath = getArticleDraftPath(chapterSlug, article.slug);

  if (!draftPath) {
    return article.actualWordCount ?? article.wordCountTarget;
  }

  const raw = fs.readFileSync(draftPath, "utf8");
  const { content } = matter(raw);
  const words = countWords(content);

  return words > 0 ? words : article.actualWordCount ?? article.wordCountTarget;
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

export function getRoadmapChapters() {
  return roadmapChapters;
}

export function getRoadmapArticles(): RoadmapArticle[] {
  return roadmapArticles;
}

export function getRoadmapArticleBySlugs(chapterSlug: string, articleSlug: string) {
  return roadmapArticleByRoute.get(`${chapterSlug}/${articleSlug}`) ?? null;
}

export function getAdjacentRoadmapArticles(chapterSlug: string, articleSlug: string) {
  const currentIndex = roadmapArticleIndexByRoute.get(`${chapterSlug}/${articleSlug}`) ?? -1;

  if (currentIndex === -1) {
    return {
      previousArticle: null,
      nextArticle: null,
    };
  }

  return {
    previousArticle: roadmapArticles[currentIndex - 1] ?? null,
    nextArticle: roadmapArticles[currentIndex + 1] ?? null,
  };
}

export function getRoadmapArticleDraftBySlugs(
  chapterSlug: string,
  articleSlug: string,
): RoadmapArticleDraft | null {
  const draftPath = getArticleDraftPath(chapterSlug, articleSlug);

  if (!draftPath) {
    return null;
  }

  const raw = fs.readFileSync(draftPath, "utf8");
  const { content, data } = matter(raw);

  return {
    body: content,
    frontmatter: data,
  };
}

export function getTocSections(): TocSection[] {
  return getRoadmapChapters().map((chapter) => {
    const articles = chapter.articles.map((article) => ({
      id: article.id,
      slug: article.slug,
      chapterSlug: chapter.slug,
      articleSlug: article.slug,
      path: getRoadmapArticlePath(chapter.slug, article.slug),
      order: article.order,
      title: article.title,
      status: article.status,
      branch: article.branch,
      difficulty: article.difficulty,
      visualKey: article.visualKey,
      readerQuestion: article.readerQuestion,
      zktlsBridge: article.zktlsBridge,
      wordCount: getArticleWordCount(chapter.slug, article),
    }));
    const wordCount = articles.reduce((total, article) => total + (article.wordCount ?? 0), 0);

    return {
      id: chapter.id,
      slug: chapter.slug,
      order: chapter.order,
      title: chapter.title,
      subtitle: chapter.guidingQuestion,
      status: chapter.status,
      wordCount,
      articleCount: chapter.articles.length,
      visualKey: chapter.visualKey,
      articles,
    };
  });
}
