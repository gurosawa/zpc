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

export type ChapterNavItem = {
  slug: string;
  order: number;
  title: string;
  status: TocSectionStatus;
};

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

export function getRoadmapArticlePath(chapterSlug: string, articleSlug: string) {
  return `/guide/${chapterSlug}/${articleSlug}`;
}

const roadmapChapters = [...contentRoadmap.chapters].sort((a, b) => a.order - b.order);

function getArticleWordCount(article: ArticleMeta) {
  return article.actualWordCount ?? article.wordCountTarget;
}

const roadmapArticles: RoadmapArticle[] = roadmapChapters.flatMap((chapter) =>
  chapter.articles.map((article) => ({
    ...article,
    chapter,
    chapterSlug: chapter.slug,
    chapterTitle: chapter.title,
    chapterOrder: chapter.order,
    articleSlug: article.slug,
    path: getRoadmapArticlePath(chapter.slug, article.slug),
    wordCount: getArticleWordCount(article),
  })),
);

const roadmapArticleByRoute = new Map(
  roadmapArticles.map((article) => [`${article.chapterSlug}/${article.articleSlug}`, article]),
);

const roadmapArticleIndexByRoute = new Map(
  roadmapArticles.map((article, index) => [`${article.chapterSlug}/${article.articleSlug}`, index]),
);

export function getChapterNavItems(): ChapterNavItem[] {
  return roadmapChapters.map((chapter) => ({
    slug: chapter.slug,
    order: chapter.order,
    title: chapter.title,
    status: chapter.status,
  }));
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
      wordCount: getArticleWordCount(article),
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
