"use client";

import { Canvas } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { Suspense, useMemo } from "react";
import {
  atlasLayers,
  getActiveLayerIds,
  type AtlasLayer,
  type AtlasLayerId,
} from "@/components/atlas/atlas-data";

export type AtlasCanvasProps = {
  activeChapterSlug: string | null;
};

const layerWidth = 4.8;
const layerDepth = 2.25;
const layerThickness = 0.055;
const layerGap = 0.34;
const stackHeight = (atlasLayers.length - 1) * layerGap;
const neutralLine = "#657184";
const neutralFill = "#d7def2";
const activeColor = "#8fa2ff";

function FlowEdges({ hasActiveLayer }: { hasActiveLayer: boolean }) {
  const opacity = hasActiveLayer ? 0.5 : 0.32;
  const flowPoints = [
    [-1.85, -1.02],
    [-0.62, -1.12],
    [0.62, -1.12],
    [1.85, -1.02],
  ] as const;

  return (
    <>
      {flowPoints.map(([x, z]) => (
        <group key={`${x}-${z}`}>
          <mesh position={[x, stackHeight / 2, z]}>
            <boxGeometry args={[0.022, stackHeight + 0.32, 0.022]} />
            <meshBasicMaterial color={activeColor} transparent opacity={opacity} />
          </mesh>
          <mesh position={[x, stackHeight + 0.24, z]} rotation={[0, 0, Math.PI / 4]}>
            <coneGeometry args={[0.075, 0.18, 4]} />
            <meshBasicMaterial color={activeColor} transparent opacity={opacity + 0.18} />
          </mesh>
        </group>
      ))}
    </>
  );
}

function GlassLayer({
  layer,
  y,
  activeLayerIds,
}: {
  layer: AtlasLayer;
  y: number;
  activeLayerIds: Set<AtlasLayerId>;
}) {
  const { id } = layer;
  const hasActiveLayer = activeLayerIds.size > 0;
  const isActive = activeLayerIds.has(id);
  const isDimmed = hasActiveLayer && !isActive;
  const layerOpacity = isActive ? 0.42 : isDimmed ? 0.09 : 0.2;
  const lineOpacity = isActive ? 0.95 : isDimmed ? 0.22 : 0.52;

  return (
    <group position={[0, y + (isActive ? 0.06 : 0), 0]}>
      <mesh>
        <boxGeometry args={[layerWidth, layerThickness, layerDepth]} />
        <meshStandardMaterial
          color={isActive ? activeColor : neutralFill}
          depthWrite={false}
          metalness={0}
          opacity={layerOpacity}
          roughness={0.42}
          transparent
        />
      </mesh>
      <mesh scale={[1.004, 1.08, 1.004]}>
        <boxGeometry args={[layerWidth, layerThickness, layerDepth]} />
        <meshBasicMaterial
          color={isActive ? activeColor : neutralLine}
          opacity={lineOpacity}
          transparent
          wireframe
        />
      </mesh>
      <Html
        className={[
          "atlas-html-label",
          isActive ? "is-active" : "",
          isDimmed ? "is-dimmed" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        position={[layerWidth / 2 + 0.44, 0.08, 0]}
        style={{ marginTop: `${(layer.order - 1) * 4}rem` }}
        zIndexRange={[20, 0]}
      >
        <span>{`${String(layer.order).padStart(2, "0")} ${layer.label}`}</span>
        <code>{layer.fragment}</code>
      </Html>
    </group>
  );
}

function AtlasScene({ activeChapterSlug }: AtlasCanvasProps) {
  const activeLayerIds = useMemo(() => getActiveLayerIds(activeChapterSlug), [activeChapterSlug]);

  return (
    <group position={[-0.48, -1.02, 0]} rotation={[-0.42, 0.08, -0.56]}>
      <FlowEdges hasActiveLayer={activeLayerIds.size > 0} />
      {atlasLayers.map((layer, index) => (
        <GlassLayer
          activeLayerIds={activeLayerIds}
          key={layer.id}
          layer={layer}
          y={index * layerGap}
        />
      ))}
    </group>
  );
}

export function AtlasCanvas({ activeChapterSlug }: AtlasCanvasProps) {
  const activeLayerIds = useMemo(() => getActiveLayerIds(activeChapterSlug), [activeChapterSlug]);
  const hasActiveLayer = activeLayerIds.size > 0;

  return (
    <div
      className="atlas-canvas-shell has-html-labels"
      role="img"
      aria-label="Seven transparent zkTLS evidence layers connected from source API response to verifier decision."
    >
      <Canvas
        camera={{ fov: 36, position: [5, 3.8, 6] }}
        dpr={[1, 1.5]}
        frameloop="demand"
        gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
      >
        <ambientLight intensity={1.55} />
        <directionalLight intensity={1.1} position={[4, 5, 3]} />
        <Suspense fallback={null}>
          <AtlasScene activeChapterSlug={activeChapterSlug} />
        </Suspense>
      </Canvas>
      <ol className="atlas-layer-overlay" aria-hidden="true">
        {atlasLayers.map((layer) => {
          const isActive = activeLayerIds.has(layer.id);

          return (
            <li
              className={[
                "atlas-layer-label",
                isActive ? "is-active" : "",
                hasActiveLayer && !isActive ? "is-dimmed" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              key={layer.id}
            >
              <span>{layer.label}</span>
              <code>{layer.fragment}</code>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
