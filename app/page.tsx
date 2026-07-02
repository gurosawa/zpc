import Link from "next/link";
import { ArtifactDiagram } from "@/components/artifact-diagram";
import { GuideShell } from "@/components/guide-shell";
import { TocMotion } from "@/components/toc-motion";
import type { TocSection } from "@/lib/content";
import { getChapters, getTocSections } from "@/lib/content";

const sectionOverrides: Record<string, Partial<TocSection>> = {
  "foundations-of-cryptography": {
    title: "CRYPTOGRAPHIC PRIMITIVES",
    visualKey: "merkle-branch",
  },
  "tls-protocol": {
    title: "TLS AND WEB TRUST",
    visualKey: "tls-record-strip",
  },
  "advanced-cryptography": {
    title: "ZERO-KNOWLEDGE FOUNDATIONS",
    visualKey: "circuit-grid",
  },
  "zktls-architecture": {
    title: "THE ZKTLS PIPELINE",
    visualKey: "proof-pipeline",
  },
  "implementation-and-runtime": {
    order: 6,
    title: "HANDS-ON LAB",
    visualKey: "browser-session-trace",
  },
};

const plannedSections: TocSection[] = [
  {
    id: "implementations-in-the-wild",
    order: 5,
    title: "IMPLEMENTATIONS IN THE WILD",
    subtitle: "실제 프로젝트들은 zkTLS를 어떻게 구현했고, 어떤 한계가 있는가?",
    status: "planned",
    wordCount: 9200,
    articleCount: 3,
    visualKey: "transcript-receipt",
    articles: [
      {
        id: "implementations-in-the-wild-1",
        slug: "zktls-architecture",
        order: 1,
        title: "TLSNotary deep dive",
        status: "planned",
        wordCount: 3400,
      },
      {
        id: "implementations-in-the-wild-2",
        slug: "zktls-architecture",
        order: 2,
        title: "DECO and oracle patterns",
        status: "planned",
        wordCount: 3000,
      },
      {
        id: "implementations-in-the-wild-3",
        slug: "zktls-architecture",
        order: 3,
        title: "Reclaim, zkPass and emerging protocols",
        status: "planned",
        wordCount: 2800,
      },
    ],
  },
  {
    id: "trust-models-and-ecosystem",
    order: 7,
    title: "TRUST MODELS & ECOSYSTEM",
    subtitle: "zkTLS는 더 넓은 Web3 신뢰 인프라에서 어떤 위치에 있는가?",
    status: "planned",
    wordCount: 7800,
    articleCount: 3,
    visualKey: "trust-layer-stack",
    articles: [
      {
        id: "trust-models-and-ecosystem-1",
        slug: "zktls-architecture",
        order: 1,
        title: "Oracles, attestations and zkTLS",
        status: "planned",
        wordCount: 2600,
      },
      {
        id: "trust-models-and-ecosystem-2",
        slug: "zktls-architecture",
        order: 2,
        title: "On-chain verification patterns",
        status: "planned",
        wordCount: 2400,
      },
      {
        id: "trust-models-and-ecosystem-3",
        slug: "zktls-architecture",
        order: 3,
        title: "Privacy, compliance and selective disclosure",
        status: "planned",
        wordCount: 2800,
      },
    ],
  },
  {
    id: "appendix-and-reference",
    order: 8,
    title: "APPENDIX & REFERENCE",
    subtitle: "용어, 비교표, 추가 자료를 한 곳에 모은 보조 섹션.",
    status: "planned",
    wordCount: 2600,
    articleCount: 3,
    visualKey: "trust-layer-stack",
    articles: [
      {
        id: "appendix-and-reference-1",
        slug: "foundations-of-cryptography",
        order: 1,
        title: "Glossary of terms",
        status: "planned",
        wordCount: 1200,
      },
      {
        id: "appendix-and-reference-2",
        slug: "advanced-cryptography",
        order: 2,
        title: "Protocol comparison matrix",
        status: "planned",
        wordCount: 800,
      },
      {
        id: "appendix-and-reference-3",
        slug: "tls-protocol",
        order: 3,
        title: "Further reading & sources",
        status: "planned",
        wordCount: 600,
      },
    ],
  },
];

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

function estimateArticleWords(section: TocSection) {
  return Math.max(100, Math.round(section.wordCount / Math.max(section.articleCount, 1) / 100) * 100);
}

function prepareTocSections() {
  const contentSections = getTocSections().map((section) => {
    const override = sectionOverrides[section.id] ?? {};
    const estimatedWords = estimateArticleWords(section);

    return {
      ...section,
      ...override,
      articles: section.articles.map((article) => ({
        ...article,
        wordCount: article.wordCount ?? estimatedWords,
      })),
    };
  });

  return [...contentSections, ...plannedSections].sort((a, b) => a.order - b.order);
}

function columnsFor(sections: TocSection[]) {
  const sectionsByOrder = new Map(sections.map((section) => [section.order, section]));
  return columnOrders.map((orders) =>
    orders.map((order) => sectionsByOrder.get(order)).filter((section): section is TocSection => Boolean(section)),
  );
}

export default function Home() {
  const chapters = getChapters();
  const tocSections = prepareTocSections();
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
                                {formatWords(article.wordCount ?? estimateArticleWords(section))} W
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
