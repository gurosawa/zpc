"use client";

import { useEffect, type CSSProperties } from "react";
import type {
  KineticChapter,
  KineticFocusKind,
  KineticIndexMode,
} from "@/components/atlas/atlas-canvas";

type KineticIndexFallbackProps = {
  activeChapterSlug?: string | null;
  chapters: KineticChapter[];
  className?: string;
  focusKind: KineticFocusKind;
  mode: KineticIndexMode;
  onReady?: () => void;
  reducedMotion: boolean;
};

export function KineticIndexFallback({
  activeChapterSlug = null,
  chapters,
  className,
  focusKind,
  mode,
  onReady,
  reducedMotion,
}: KineticIndexFallbackProps) {
  useEffect(() => {
    if (!onReady) return;
    const frame = window.requestAnimationFrame(onReady);
    return () => window.cancelAnimationFrame(frame);
  }, [onReady]);

  return (
    <div
      aria-hidden="true"
      className={["kinetic-index-fallback", className].filter(Boolean).join(" ")}
      data-focus-kind={focusKind}
      data-mode={mode}
      data-reduced-motion={reducedMotion ? "true" : "false"}
    >
      <ol className="kinetic-index-fallback-stack">
        {chapters.map((chapter, index) => {
          const isActive = chapter.slug === activeChapterSlug;
          const isDefaultAccent = mode === "overview" && focusKind === "idle" && index === 0;

          return (
            <li
              className={[
                "kinetic-index-fallback-row",
                isActive ? "is-active" : "",
                isDefaultAccent ? "is-default-accent" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              key={chapter.slug}
              style={
                {
                  "--arming-x": `${(index - (chapters.length - 1) / 2) * 8}px`,
                  "--row-index": index,
                  "--row-z": `${index * -18}px`,
                } as CSSProperties
              }
            >
              <span>{String(chapter.order).padStart(2, "0")}</span>
              <strong>{chapter.title}</strong>
              <i aria-hidden="true" />
            </li>
          );
        })}
      </ol>
    </div>
  );
}
