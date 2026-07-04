"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { AtlasFallback } from "@/components/atlas/atlas-fallback";
import { atlasLayers, getActiveMapping } from "@/components/atlas/atlas-data";
import type { AtlasLayerId } from "@/components/atlas/atlas-data";
import type { AtlasCanvasProps } from "@/components/atlas/atlas-canvas";

const DynamicAtlasCanvas = dynamic<AtlasCanvasProps>(
  () => import("@/components/atlas/atlas-canvas").then((module) => module.AtlasCanvas),
  {
    loading: () => <AtlasFallback />,
    ssr: false,
  },
);

type AtlasHeroProps = {
  activeChapterSlug: string | null;
  hoveredLayerId: AtlasLayerId | null;
  inspectedLayerId: AtlasLayerId | null;
  onLayerHoverChange: (layerId: AtlasLayerId | null) => void;
  onLayerInspectChange: (layerId: AtlasLayerId | null) => void;
};

function supportsWebgl() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export function AtlasHero({
  activeChapterSlug,
  hoveredLayerId,
  inspectedLayerId,
  onLayerHoverChange,
  onLayerInspectChange,
}: AtlasHeroProps) {
  const [webglAvailable, setWebglAvailable] = useState<boolean | null>(null);
  const activeMapping = getActiveMapping(activeChapterSlug);
  const inspectedLayer = atlasLayers.find((layer) => layer.id === inspectedLayerId) ?? null;

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setWebglAvailable(supportsWebgl());
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <section
      className="atlas-hero"
      aria-labelledby="atlas-title"
      data-atlas-active={activeChapterSlug ?? ""}
      data-atlas-inspected={inspectedLayerId ?? ""}
      data-atlas-renderer={webglAvailable === true ? "webgl" : "fallback"}
    >
      <div className="atlas-hero-copy">
        <p className="atlas-kicker">Forensic Isometric Atlas</p>
        <h1 className="atlas-title" id="atlas-title">
          zkTLS MASTER GUIDE
        </h1>
        <p className="atlas-tagline">
          A field manual for proving web data without overexposing trust.
        </p>
      </div>

      <div className="atlas-visual">
        {webglAvailable === true ? (
          <DynamicAtlasCanvas
            activeChapterSlug={activeChapterSlug}
            hoveredLayerId={hoveredLayerId}
            inspectedLayerId={inspectedLayerId}
            onLayerHoverChange={onLayerHoverChange}
            onLayerInspectChange={onLayerInspectChange}
          />
        ) : (
          <AtlasFallback activeChapterSlug={activeChapterSlug} />
        )}
      </div>

      <div className="atlas-telemetry-grid" aria-label="Evidence samples">
        <div className="atlas-telemetry-panel">
          <small>TRACE</small>
          <code>16 03 03 / ServerHello</code>
        </div>
        <div className="atlas-telemetry-panel">
          <small>DISCLOSE</small>
          <code>[REDACTED] -&gt; claim</code>
        </div>
        <div className="atlas-telemetry-panel">
          <small>ACTIVE</small>
          <code>{activeMapping?.label ?? "Full evidence stack"}</code>
        </div>
        <div className="atlas-telemetry-panel">
          <small>INSPECT</small>
          <code>{inspectedLayer?.inspectionLabel ?? "Layer focus idle"}</code>
        </div>
      </div>
    </section>
  );
}
