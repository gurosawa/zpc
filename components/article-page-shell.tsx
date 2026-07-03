import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import remarkGfm from "remark-gfm";
import { ArtifactDiagram } from "@/components/artifact-diagram";
import { GuideShell } from "@/components/guide-shell";
import { mdxComponents } from "@/components/mdx-components";
import { MiniToc } from "@/components/mini-toc";
import type { Chapter, RoadmapArticle } from "@/lib/content";

type ArticlePageShellProps = {
  article: RoadmapArticle;
  chapters: Chapter[];
  draftBody?: string | null;
  previousArticle: RoadmapArticle | null;
  nextArticle: RoadmapArticle | null;
};

const roadmapSections = [
  { id: "core-model", order: 1, title: "Core Model" },
  { id: "protocol-or-system-artifact", order: 2, title: "Protocol or System Artifact" },
  { id: "failure-mode", order: 3, title: "Failure Mode" },
  { id: "minimal-lab-or-trace", order: 4, title: "Minimal Lab or Trace" },
  { id: "zktls-bridge", order: 5, title: "zkTLS Bridge" },
  { id: "verification-checklist", order: 6, title: "Verification Checklist" },
  { id: "references", order: 7, title: "References" },
];

function formatWords(words: number) {
  return `${(words / 1000).toFixed(1)}K`;
}

function formatLabel(value: string) {
  return value.replace(/-/g, " ").toUpperCase();
}

function draftBodyWithoutTitle(body: string) {
  return body.replace(/^\s*#\s+.+(?:\r?\n)+/, "").trim();
}

function ArticleNavLink({
  article,
  label,
}: {
  article: RoadmapArticle | null;
  label: "Previous" | "Next";
}) {
  if (!article) {
    return <span aria-hidden="true" />;
  }

  return (
    <Link href={article.path}>
      <span>{label}</span>
      {article.title}
    </Link>
  );
}

function RoadmapDraft({ article }: { article: RoadmapArticle }) {
  return (
    <>
      <p className="article-context">{article.whyItMatters}</p>

      <h2 id="core-model">Core Model</h2>
      <p>{article.coreModel}</p>

      <h2 id="protocol-or-system-artifact">Protocol or System Artifact</h2>
      <p>{article.protocolOrSystemArtifact}</p>

      <h2 id="failure-mode">Failure Mode</h2>
      <p>{article.failureMode}</p>

      <h2 id="minimal-lab-or-trace">Minimal Lab or Trace</h2>
      <p>{article.minimalLabOrTrace}</p>

      <h2 id="zktls-bridge">zkTLS Bridge</h2>
      <p>{article.zktlsBridge}</p>

      <h2 id="verification-checklist">Verification Checklist</h2>
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
    </>
  );
}

export function ArticlePageShell({
  article,
  chapters,
  draftBody,
  nextArticle,
  previousArticle,
}: ArticlePageShellProps) {
  const hasFullDraft = Boolean(draftBody?.trim());
  const fullDraftBody = hasFullDraft ? draftBodyWithoutTitle(draftBody ?? "") : "";

  return (
    <GuideShell chapters={chapters} activeSlug={article.chapterSlug}>
      <div className="chapter-layout article-route-layout">
        <article className="doc-content article-roadmap-page">
          <p className="eyebrow article-kicker">
            Chapter {String(article.chapterOrder).padStart(2, "0")} / Article{" "}
            {String(article.order).padStart(2, "0")} / {article.chapterTitle}
          </p>

          <h1>{article.title}</h1>
          <p className="lead article-reader-question">{article.readerQuestion}</p>

          <dl className="article-meta-line" aria-label="Article metadata">
            <div>
              <dt>Chapter</dt>
              <dd>{formatLabel(article.chapterSlug)}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{article.status.toUpperCase()}</dd>
            </div>
            <div>
              <dt>Words</dt>
              <dd>{formatWords(article.wordCount)} W</dd>
            </div>
            <div>
              <dt>Difficulty</dt>
              <dd>{article.difficulty.toUpperCase()}</dd>
            </div>
            <div>
              <dt>Branch</dt>
              <dd>
                <code>{article.branch}</code>
              </dd>
            </div>
          </dl>

          <div className="article-visual-panel">
            <ArtifactDiagram
              visualKey={article.visualKey}
              label={`${article.title} visual artifact`}
            />
            <p className="article-figure-label">
              Figure / {formatLabel(article.visualKey)} / visualKey: <code>{article.visualKey}</code>
            </p>
          </div>

          <div className="article-prose-column">
            {hasFullDraft ? (
              <section className="article-draft-mdx" aria-label="Full article draft">
                <MDXRemote
                  source={fullDraftBody}
                  components={mdxComponents}
                  options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
                />
              </section>
            ) : (
              <RoadmapDraft article={article} />
            )}
          </div>

          <nav className="article-route-footer" aria-label="Article navigation">
            <ArticleNavLink article={previousArticle} label="Previous" />
            <Link className="article-toc-link" href="/">
              Back to table of contents
            </Link>
            <ArticleNavLink article={nextArticle} label="Next" />
          </nav>
        </article>

        <MiniToc
          items={roadmapSections}
          label="Article sections"
          status={article.status}
          wordCount={article.wordCount}
        />
      </div>
    </GuideShell>
  );
}
