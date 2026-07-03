"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type FocusEvent } from "react";
import { AtlasHero } from "@/components/atlas/atlas-hero";
import { TocMotion } from "@/components/toc-motion";
import type { TocSection } from "@/lib/content";

type HomeAtlasExperienceProps = {
  tocSections: TocSection[];
};

function formatWords(words: number) {
  return `${Math.max(0, words).toLocaleString("en-US")} WORDS`;
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

function containsFocus(currentTarget: HTMLElement, nextTarget: EventTarget | null) {
  return nextTarget instanceof Node && currentTarget.contains(nextTarget);
}

export function HomeAtlasExperience({ tocSections }: HomeAtlasExperienceProps) {
  const firstChapterSlug = tocSections[0]?.slug ?? null;
  const [activeByHover, setActiveByHover] = useState<string | null>(null);
  const [activeByScroll, setActiveByScroll] = useState<string | null>(firstChapterSlug);
  const tocRootRef = useRef<HTMLDivElement | null>(null);
  const chapterSlugs = useMemo(() => tocSections.map((section) => section.slug), [tocSections]);
  const tocColumns = useMemo(() => groupIntoEditorialColumns(tocSections), [tocSections]);
  const activeChapterSlug = activeByHover ?? activeByScroll ?? firstChapterSlug;

  useEffect(() => {
    const tocRoot = tocRootRef.current;
    if (!tocRoot || !firstChapterSlug) return;

    const sections = Array.from(
      tocRoot.querySelectorAll<HTMLElement>(".toc-section[data-atlas-chapter]"),
    );

    function updateActiveByScroll() {
      if (window.scrollY <= 1) {
        setActiveByScroll(firstChapterSlug);
        return;
      }

      const readingLine = window.innerHeight * 0.35;
      const visibleSections = sections
        .map((section) => {
          const rect = section.getBoundingClientRect();
          return {
            distance: Math.abs(rect.top - readingLine),
            isVisible: rect.bottom >= 0 && rect.top <= window.innerHeight,
            slug: section.dataset.atlasChapter ?? null,
          };
        })
        .filter((section) => section.isVisible && section.slug);

      const closestSection = visibleSections.sort((a, b) => a.distance - b.distance)[0];
      setActiveByScroll(closestSection?.slug ?? firstChapterSlug);
    }

    if (!("IntersectionObserver" in window)) {
      updateActiveByScroll();
      return;
    }

    const observer = new IntersectionObserver(updateActiveByScroll, {
      rootMargin: "-20% 0px -55% 0px",
      threshold: [0, 0.25, 0.5, 0.75, 1],
    });
    const frame = window.requestAnimationFrame(updateActiveByScroll);

    for (const section of sections) {
      observer.observe(section);
    }

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [firstChapterSlug, chapterSlugs]);

  function clearActiveChapter(event: FocusEvent<HTMLElement>) {
    if (containsFocus(event.currentTarget, event.relatedTarget)) return;
    setActiveByHover(null);
  }

  return (
    <div className="toc-page atlas-home">
      <div className="atlas-home-layout">
        <div className="atlas-home-panel">
          <AtlasHero activeChapterSlug={activeChapterSlug} />
        </div>

        <div className="atlas-home-toc" ref={tocRootRef}>
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
                        data-atlas-chapter={section.slug}
                        data-visual-key={section.visualKey}
                        key={section.id}
                        onBlur={clearActiveChapter}
                        onFocus={() => setActiveByHover(section.slug)}
                        onPointerEnter={() => setActiveByHover(section.slug)}
                        onPointerLeave={() => setActiveByHover(null)}
                      >
                        <div className="section-heading-row">
                          <h2 id={headingId}>
                            <span className="section-number">{section.order}.</span>
                            <Link className="section-title" href={sectionHref(section)}>
                              {section.title}
                            </Link>
                          </h2>
                          <span className="section-meta">
                            {section.articleCount} ARTICLES · {formatWords(section.wordCount)}
                          </span>
                        </div>

                        <ol className="article-list">
                          {section.articles.map((article) => (
                            <li key={article.id}>
                              <Link className="article-row" href={article.path}>
                                <span className="article-marker">
                                  {String(article.order).padStart(2, "0")}
                                </span>
                                <span className="article-title">{article.title}</span>
                                <span className="article-leader" aria-hidden />
                                <span
                                  className="compact-meta"
                                  aria-label={formatWords(article.wordCount ?? 0)}
                                >
                                  <span className="article-words" aria-hidden="true">
                                    {formatWords(article.wordCount ?? 0)}
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
        </div>
      </div>

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
  );
}
