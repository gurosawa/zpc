"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { KineticIndexFallback } from "@/components/atlas/atlas-fallback";
import type {
  KineticChapter,
  KineticFocusKind,
  KineticIndexCanvasProps,
  KineticIndexMode,
} from "@/components/atlas/atlas-canvas";

const DynamicKineticIndexCanvas = dynamic<KineticIndexCanvasProps>(
  () =>
    import("@/components/atlas/atlas-canvas").then(
      (module) => module.KineticIndexCanvas,
    ),
  {
    loading: () => null,
    ssr: false,
  },
);

type KineticIndexHeroProps = {
  activeChapterSlug: string | null;
  chapters: KineticChapter[];
  focusKind: KineticFocusKind;
  mode: KineticIndexMode;
  onRendererReady: () => void;
  reducedMotion: boolean;
};

function supportsWebgl() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export function KineticIndexHero({
  activeChapterSlug,
  chapters,
  focusKind,
  mode,
  onRendererReady,
  reducedMotion,
}: KineticIndexHeroProps) {
  const [webglAvailable, setWebglAvailable] = useState<boolean | null>(null);
  const [visualReady, setVisualReady] = useState(false);

  const handleRendererReady = useCallback(() => {
    setVisualReady(true);
    onRendererReady();
  }, [onRendererReady]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setWebglAvailable(supportsWebgl());
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <section
      className="kinetic-index-hero"
      aria-labelledby="kinetic-index-title"
      data-kinetic-active={activeChapterSlug ?? ""}
      data-kinetic-mode={mode}
      data-kinetic-renderer={
        webglAvailable === null ? "pending" : webglAvailable ? "webgl" : "fallback"
      }
    >
      <div className="kinetic-index-copy">
        <p className="kinetic-index-kicker">SPATIAL INDEX / 08 CHAPTERS</p>
        <h1 className="kinetic-index-title" id="kinetic-index-title">
          zkTLS MASTER GUIDE
        </h1>
        <p className="kinetic-index-tagline">
          A field manual for proving web data without overexposing trust.
        </p>
      </div>

      <div className="kinetic-index-visual">
        {webglAvailable !== true || !visualReady ? (
          <KineticIndexFallback
            activeChapterSlug={activeChapterSlug}
            chapters={chapters}
            focusKind={focusKind}
            mode={mode}
            onReady={webglAvailable === false ? handleRendererReady : undefined}
            reducedMotion={reducedMotion}
          />
        ) : null}

        {webglAvailable === true ? (
          <DynamicKineticIndexCanvas
            activeChapterSlug={activeChapterSlug}
            chapters={chapters}
            focusKind={focusKind}
            mode={mode}
            onRendererReady={handleRendererReady}
            reducedMotion={reducedMotion}
          />
        ) : null}
      </div>
    </section>
  );
}
