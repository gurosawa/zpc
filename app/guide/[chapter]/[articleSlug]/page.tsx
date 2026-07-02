import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArtifactDiagram } from "@/components/artifact-diagram";
import { GuideShell } from "@/components/guide-shell";
import { MiniToc } from "@/components/mini-toc";
import { getChapters, getRoadmapArticleBySlugs, getRoadmapArticles } from "@/lib/content";

type PageProps = {
  params: Promise<{ chapter: string; articleSlug: string }>;
};

function formatWords(words: number) {
  return `${(words / 1000).toFixed(1)}K`;
}

export function generateStaticParams() {
  return getRoadmapArticles().map((article) => ({
    chapter: article.chapterSlug,
    articleSlug: article.articleSlug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { chapter, articleSlug } = await params;
  const article = getRoadmapArticleBySlugs(chapter, articleSlug);

  if (!article) {
    return {};
  }

  return {
    title: `${article.title} | ${article.chapterTitle} | zkTLS Master Guide`,
    description: article.readerQuestion,
  };
}

export default async function RoadmapArticlePage({ params }: PageProps) {
  const { chapter, articleSlug } = await params;
  const article = getRoadmapArticleBySlugs(chapter, articleSlug);

  if (!article) {
    notFound();
  }

  const chapters = getChapters();
  const miniTocItems = [
    { id: "brief", order: 1, title: "Brief" },
    { id: "model", order: 2, title: "Core Model" },
    { id: "verification", order: 3, title: "Verification" },
    { id: "references", order: 4, title: "References" },
  ];

  return (
    <GuideShell chapters={chapters}>
      <div className="chapter-layout">
        <article className="doc-content article-roadmap-page">
          <p className="eyebrow">
            Chapter {String(article.chapterOrder).padStart(2, "0")} / Article{" "}
            {String(article.order).padStart(2, "0")}
          </p>
          <h1>{article.title}</h1>
          <p className="lead">{article.readerQuestion}</p>

          <dl className="chapter-meta">
            <div>
              <dt>Status</dt>
              <dd>{article.status.toUpperCase()}</dd>
            </div>
            <div>
              <dt>Words</dt>
              <dd>{formatWords(article.wordCount)}</dd>
            </div>
            <div>
              <dt>Difficulty</dt>
              <dd>{article.difficulty.toUpperCase()}</dd>
            </div>
          </dl>

          <ArtifactDiagram
            visualKey={article.visualKey}
            label={`${article.title} visual artifact`}
          />

          <h2 id="brief">Brief</h2>
          <p>{article.whyItMatters}</p>
          <p>{article.zktlsBridge}</p>

          <h2 id="model">Core Model</h2>
          <p>{article.coreModel}</p>
          <p>{article.protocolOrSystemArtifact}</p>
          <p>{article.failureMode}</p>
          <p>{article.minimalLabOrTrace}</p>

          <h2 id="verification">Verification</h2>
          <p>
            Draft branch: <code>{article.branch}</code>
          </p>
          <ul>
            {article.verificationChecklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <h2 id="references">References</h2>
          <ul>
            {article.references.map((reference) => (
              <li key={reference}>
                <Link className="text-link" href={reference}>
                  {reference}
                </Link>
              </li>
            ))}
          </ul>
        </article>
        <MiniToc items={miniTocItems} status={article.status} wordCount={article.wordCount} />
      </div>
    </GuideShell>
  );
}
