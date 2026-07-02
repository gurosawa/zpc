import Link from "next/link";
import { ArtifactDiagram } from "@/components/artifact-diagram";
import { GuideShell } from "@/components/guide-shell";
import { TocMotion } from "@/components/toc-motion";
import type { TocSection } from "@/lib/content";
import { getChapters, getTocSections } from "@/lib/content";

const columnOrders = [[1, 2], [3, 4, 5], [6, 7, 8]];

function formatWords(words: number) {
  return `${(words / 1000).toFixed(1)}K`;
}

function statusLabel(status: TocSection["status"]) {
  return status.toUpperCase();
}

function sectionHref(section: TocSection) {
  return `/guide/${section.articles[0]?.slug ?? section.id}`;
}

function columnsFor(sections: TocSection[]) {
  const sectionsByOrder = new Map(sections.map((section) => [section.order, section]));
  return columnOrders.map((orders) =>
    orders.map((order) => sectionsByOrder.get(order)).filter((section): section is TocSection => Boolean(section)),
  );
}

export default function Home() {
  const chapters = getChapters();
  const tocSections = getTocSections();
  const tocColumns = columnsFor(tocSections);
  const implementedSections = tocSections.filter((section) => section.status !== "planned").length;
  const totalWords = tocSections.reduce((total, section) => total + section.wordCount, 0);

  return (
    <GuideShell
      chapters={chapters}
      progressLabel={`${implementedSections}/${tocSections.length}`}
      wordsLabel={formatWords(totalWords)}
    >
      <div className="toc-page">
        <TocMotion />
        <nav className="editorial-toc" aria-label="Guide table of contents">
          <div className="editorial-toc-grid">
            {tocColumns.map((column, columnIndex) => (
              <div className="toc-column" key={columnIndex}>
                {column.map((section) => {
                  const headingId = `toc-section-${section.order}`;

                  return (
                    <section
                      className="toc-section"
                      aria-labelledby={headingId}
                      data-visual-key={section.visualKey}
                      key={section.id}
                    >
                      <div className="section-heading-row">
                        <h2 id={headingId}>
                          <span className="section-number">{section.order}.</span>
                          <Link className="section-title" href={sectionHref(section)}>
                            {section.title}
                          </Link>
                        </h2>
                        <span className="section-meta">
                          {statusLabel(section.status)} · {section.articleCount} ART ·{" "}
                          {formatWords(section.wordCount)} W
                        </span>
                      </div>

                      <div className="visual-artifact-slot" aria-label={`${section.visualKey} artifact`}>
                        <ArtifactDiagram
                          visualKey={section.visualKey}
                          label={`${section.title} visual artifact`}
                          variant="slot"
                        />
                        <span className="artifact-label">{section.visualKey.replace(/-/g, " ")}</span>
                      </div>

                      <ol className="article-list">
                        {section.articles.map((article) => (
                          <li key={article.id}>
                            <Link className="article-row" href={`/guide/${article.slug}`}>
                              <span className="article-marker">{String(article.order).padStart(2, "0")}</span>
                              <span className="article-title">{article.title}</span>
                              <span className="article-leader" aria-hidden />
                              <span className="compact-meta">
                                {formatWords(article.wordCount ?? 0)} W
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ol>
                    </section>
                  );
                })}
              </div>
            ))}
          </div>
        </nav>

        <section className="chapter-index" aria-label="현재 구현된 챕터">
          {chapters.map((chapter) => (
            <Link key={chapter.slug} href={`/guide/${chapter.slug}`}>
              <span>{String(chapter.order).padStart(2, "0")}</span>
              <strong>{chapter.title}</strong>
              <small>{chapter.readerPromise}</small>
            </Link>
          ))}
        </section>
      </div>
    </GuideShell>
  );
}
