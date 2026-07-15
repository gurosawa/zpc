"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
} from "react";
import { KineticIndexHero } from "@/components/atlas/atlas-hero";
import type {
  KineticChapter,
  KineticFocusKind,
  KineticIndexMode,
} from "@/components/atlas/atlas-canvas";
import { TocMotion } from "@/components/toc-motion";
import type { TocSection } from "@/lib/content";

type HomeKineticIndexExperienceProps = {
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

  if (remainder === 1) counts[2] += 1;
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

function usePrefersReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    const frame = window.requestAnimationFrame(() => setReducedMotion(media.matches));

    media.addEventListener("change", handleChange);
    return () => {
      window.cancelAnimationFrame(frame);
      media.removeEventListener("change", handleChange);
    };
  }, []);

  return reducedMotion;
}

export function HomeKineticIndexExperience({
  tocSections,
}: HomeKineticIndexExperienceProps) {
  const firstChapterSlug = tocSections[0]?.slug ?? null;
  const reducedMotion = usePrefersReducedMotion();
  const [rendererReady, setRendererReady] = useState(false);
  const [armingComplete, setArmingComplete] = useState(false);
  const [overviewActive, setOverviewActive] = useState(true);
  const [activeByHover, setActiveByHover] = useState<string | null>(null);
  const [activeByFocus, setActiveByFocus] = useState<string | null>(null);
  const [activeByScroll, setActiveByScroll] = useState<string | null>(firstChapterSlug);
  const tocRootRef = useRef<HTMLDivElement | null>(null);
  const tocColumns = useMemo(() => groupIntoEditorialColumns(tocSections), [tocSections]);
  const kineticChapters = useMemo<KineticChapter[]>(
    () =>
      tocSections.map(({ order, slug, title }) => ({
        order,
        slug,
        title,
      })),
    [tocSections],
  );
  const armed = reducedMotion || armingComplete;

  const activeByInteraction = activeByHover ?? activeByFocus;
  const activeChapterSlug =
    activeByInteraction ?? activeByScroll ?? firstChapterSlug;
  const focusKind: KineticFocusKind = activeByInteraction
    ? "preview"
    : overviewActive
      ? "idle"
      : "committed";
  const mode: KineticIndexMode = !armed
    ? "arming"
    : overviewActive
      ? "overview"
      : "chapter";

  const handleRendererReady = useCallback(() => setRendererReady(true), []);

  useEffect(() => {
    if (reducedMotion || !rendererReady) return;
    const timer = window.setTimeout(() => setArmingComplete(true), 1800);
    return () => window.clearTimeout(timer);
  }, [reducedMotion, rendererReady]);

  useEffect(() => {
    const tocRoot = tocRootRef.current;
    if (!tocRoot || !firstChapterSlug) return;

    const sections = Array.from(
      tocRoot.querySelectorAll<HTMLElement>(".toc-section[data-kinetic-chapter]"),
    );

    function updateReadingState() {
      const remainingScroll = Math.max(
        0,
        document.documentElement.scrollHeight - (window.scrollY + window.innerHeight),
      );
      const tailWindow = Math.min(window.innerHeight * 0.3, 260);
      const tailProgress = 1 - Math.min(1, remainingScroll / tailWindow);
      const readingLine = window.innerHeight * (0.35 + tailProgress * 0.45);
      const isOverview = window.scrollY <= 80;

      setOverviewActive(isOverview);

      if (isOverview) {
        setActiveByScroll(firstChapterSlug);
        return;
      }

      const closestSection = sections
        .map((section) => {
          const rect = section.getBoundingClientRect();
          return {
            distance: Math.abs(rect.top - readingLine),
            isReadable: rect.bottom >= readingLine * 0.45 && rect.top <= window.innerHeight,
            slug: section.dataset.kineticChapter ?? null,
          };
        })
        .filter((section) => section.isReadable && section.slug)
        .sort((a, b) => a.distance - b.distance)[0];

      setActiveByScroll(closestSection?.slug ?? firstChapterSlug);
    }

    const frame = window.requestAnimationFrame(updateReadingState);
    window.addEventListener("scroll", updateReadingState, { passive: true });
    window.addEventListener("resize", updateReadingState);

    const observer =
      "IntersectionObserver" in window
        ? new IntersectionObserver(updateReadingState, {
            rootMargin: "-20% 0px -55% 0px",
            threshold: [0, 0.25, 0.5, 0.75, 1],
          })
        : null;

    for (const section of sections) observer?.observe(section);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateReadingState);
      window.removeEventListener("resize", updateReadingState);
      observer?.disconnect();
    };
  }, [firstChapterSlug, tocSections]);

  function clearFocusedChapter(event: FocusEvent<HTMLElement>) {
    if (containsFocus(event.currentTarget, event.relatedTarget)) return;
    setActiveByFocus(null);
  }

  return (
    <div className="toc-page kinetic-home">
      <div className="kinetic-home-layout">
        <div className="kinetic-home-panel">
          <KineticIndexHero
            activeChapterSlug={activeChapterSlug}
            chapters={kineticChapters}
            focusKind={focusKind}
            mode={mode}
            onRendererReady={handleRendererReady}
            reducedMotion={reducedMotion}
          />
        </div>

        <div className="kinetic-home-toc" ref={tocRootRef}>
          <TocMotion />
          <nav className="editorial-toc" aria-label="Guide table of contents">
            <div className="editorial-toc-grid">
              {tocColumns.map((column, columnIndex) => (
                <div className="toc-column" key={`toc-column-${columnIndex}`}>
                  {column.map((section) => {
                    const headingId = `toc-section-${section.order}`;
                    const isActiveChapter = section.slug === activeChapterSlug;

                    return (
                      <section
                        className={[
                          "toc-section",
                          isActiveChapter ? "is-active" : "",
                          activeChapterSlug && !isActiveChapter ? "is-dimmed" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        aria-labelledby={headingId}
                        data-kinetic-chapter={section.slug}
                        data-visual-key={section.visualKey}
                        key={section.id}
                        onBlur={clearFocusedChapter}
                        onFocus={() => setActiveByFocus(section.slug)}
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
                            {section.articleCount} ARTICLES / {formatWords(section.wordCount)}
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
    </div>
  );
}
