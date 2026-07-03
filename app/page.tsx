import Link from "next/link";
import { ArtifactDiagram } from "@/components/artifact-diagram";
import { GuideShell } from "@/components/guide-shell";
import { TocMotion } from "@/components/toc-motion";
import type { TocSection } from "@/lib/content";
import { getChapters, getTocSections } from "@/lib/content";

function formatWords(words: number) {
  return `${(words / 1000).toFixed(1)}K`;
}

function statusLabel(status: TocSection["status"]) {
  return status.toUpperCase();
}

function sectionHref(section: TocSection) {
  return section.articles[0]?.path ?? `/guide/${section.slug}`;
}

function getEditorialColumnCounts(total: number): number[] {
  if (total <= 0) return [];
  if (total === 1) return [1];
  if (total === 2) return [1, 1];

  const base = Math.floor(total / 3);
  const remainder = total % 3;
  const counts = [base, base, base];

  if (remainder === 1) {
    counts[2] += 1;
  }

  if (remainder === 2) {
    counts[1] += 1;
    counts[2] += 1;
  }

  return counts.filter(Boolean);
}

function groupIntoEditorialColumns<T>(items: T[]): T[][] {
  const counts = getEditorialColumnCounts(items.length);
  let cursor = 0;

  return counts.map((count) => {
    const column = items.slice(cursor, cursor + count);
    cursor += count;
    return column;
  });
}

export default function Home() {
  const chapters = getChapters();
  const tocSections = getTocSections();
  const tocColumns = groupIntoEditorialColumns(tocSections);
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
              <div className="toc-column" key={`toc-column-${columnIndex}`}>
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
                            <Link className="article-row" href={article.path}>
                              <span className="article-marker">{String(article.order).padStart(2, "0")}</span>
                              <span className="article-title">{article.title}</span>
                              <span className="article-leader" aria-hidden />
                              <span
                                className="compact-meta"
                                aria-label={`${formatWords(article.wordCount ?? 0)} words, ${article.status}`}
                              >
                                <span className="article-words" aria-hidden="true">
                                  {formatWords(article.wordCount ?? 0)} W
                                </span>
                                <span className="meta-separator" aria-hidden="true">
                                  {" · "}
                                </span>
                                <span className="article-status" aria-hidden="true">
                                  {statusLabel(article.status)}
                                </span>
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

        <section className="chapter-index" aria-label="전체 챕터 인덱스">
          {tocSections.map((section) => (
            <Link key={section.id} href={sectionHref(section)}>
              <span>{String(section.order).padStart(2, "0")}</span>
              <strong>{section.title}</strong>
              <small>{section.subtitle}</small>
            </Link>
          ))}
        </section>
      </div>
    </GuideShell>
  );
}
