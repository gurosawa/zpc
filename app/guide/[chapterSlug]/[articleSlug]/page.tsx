import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticlePageShell } from "@/components/article-page-shell";
import {
  getAdjacentRoadmapArticles,
  getChapterNavItems,
  getRoadmapArticleBySlugs,
  getRoadmapArticles,
} from "@/lib/content";

type PageProps = {
  params: Promise<{ chapterSlug: string; articleSlug: string }>;
};

export function generateStaticParams() {
  return getRoadmapArticles().map((article) => ({
    chapterSlug: article.chapterSlug,
    articleSlug: article.articleSlug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { chapterSlug, articleSlug } = await params;
  const article = getRoadmapArticleBySlugs(chapterSlug, articleSlug);

  if (!article) {
    return {};
  }

  return {
    title: `${article.title} · zkTLS Master Guide`,
    description: article.readerQuestion || article.zktlsBridge,
  };
}

export default async function RoadmapArticlePage({ params }: PageProps) {
  const { chapterSlug, articleSlug } = await params;
  const article = getRoadmapArticleBySlugs(chapterSlug, articleSlug);

  if (!article) {
    notFound();
  }

  const { previousArticle, nextArticle } = getAdjacentRoadmapArticles(chapterSlug, articleSlug);
  const { getRoadmapArticleDraftBySlugs } = await import("@/lib/article-drafts");
  const draft = getRoadmapArticleDraftBySlugs(chapterSlug, articleSlug);

  return (
    <ArticlePageShell
      article={article}
      chapters={getChapterNavItems()}
      draftBody={draft?.body ?? null}
      nextArticle={nextArticle}
      previousArticle={previousArticle}
    />
  );
}
