"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as easing from "maath/easing";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import type { Group } from "three";
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
const scenePosition = [-0.48, -1.02, 0] as const;
const sceneRotation = [-0.42, 0.08, -0.56] as const;

function getPrefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function usePrefersReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(getPrefersReducedMotion);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");

    function handleChange(event: MediaQueryListEvent) {
      setReducedMotion(event.matches);
    }

    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  return reducedMotion;
}

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
  activeIndexes,
  layer,
  reducedMotion,
  index,
  y,
  activeLayerIds,
}: {
  activeIndexes: number[];
  layer: AtlasLayer;
  reducedMotion: boolean;
  index: number;
  y: number;
  activeLayerIds: Set<AtlasLayerId>;
}) {
  const layerRef = useRef<Group>(null);
  const { id } = layer;
  const hasActiveLayer = activeLayerIds.size > 0;
  const isActive = activeLayerIds.has(id);
  const isDimmed = hasActiveLayer && !isActive;
  const layerOpacity = isActive ? 0.42 : isDimmed ? 0.09 : 0.2;
  const lineOpacity = isActive ? 0.95 : isDimmed ? 0.22 : 0.52;
  const closestActiveIndex = activeIndexes.reduce<number | null>((closest, activeIndex) => {
    if (closest === null) return activeIndex;
    return Math.abs(activeIndex - index) < Math.abs(closest - index) ? activeIndex : closest;
  }, null);
  const distance = closestActiveIndex === null ? 0 : Math.abs(closestActiveIndex - index);
  const direction = closestActiveIndex === null || isActive ? 0 : Math.sign(index - closestActiveIndex);
  const accordionOffset = direction * Math.max(0, 0.1 - Math.max(0, distance - 1) * 0.025);
  const targetY = y + (isActive ? 0.08 : accordionOffset);
  const targetPosition: [number, number, number] = [0, targetY, 0];
  const targetScale: [number, number, number] = isActive ? [1.045, 1.22, 1.045] : [1, 1, 1];

  useFrame((_state, delta) => {
    const layerGroup = layerRef.current;
    if (!layerGroup) return;

    if (reducedMotion) {
      layerGroup.position.set(0, targetY, 0);
      layerGroup.scale.set(...targetScale);
      return;
    }

    easing.damp3(layerGroup.position, targetPosition, 0.24, delta);
    easing.damp3(layerGroup.scale, targetScale, 0.2, delta);
  });

  return (
    <group ref={layerRef} position={targetPosition} scale={targetScale}>
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

function AtlasScene({
  activeChapterSlug,
  reducedMotion,
}: AtlasCanvasProps & { reducedMotion: boolean }) {
  const activeLayerIds = useMemo(() => getActiveLayerIds(activeChapterSlug), [activeChapterSlug]);
  const activeIndexes = useMemo(
    () =>
      atlasLayers.flatMap((layer, index) => (activeLayerIds.has(layer.id) ? [index] : [])),
    [activeLayerIds],
  );
  const sceneRef = useRef<Group>(null);

  useFrame((state, delta) => {
    const scene = sceneRef.current;
    if (!scene) return;

    if (reducedMotion) {
      scene.position.set(...scenePosition);
      scene.rotation.set(...sceneRotation);
      return;
    }

    const breath = Math.sin(state.clock.elapsedTime * 0.72) * 0.035;
    const targetX = scenePosition[0] - state.pointer.x * 0.08;
    const targetY = scenePosition[1] + breath + state.pointer.y * 0.045;
    const targetRotX = sceneRotation[0] + state.pointer.y * 0.04;
    const targetRotY = sceneRotation[1] - state.pointer.x * 0.06;

    scene.position.x += (targetX - scene.position.x) * Math.min(1, delta * 4);
    scene.position.y += (targetY - scene.position.y) * Math.min(1, delta * 4);
    scene.position.z = scenePosition[2];
    scene.rotation.x += (targetRotX - scene.rotation.x) * Math.min(1, delta * 3);
    scene.rotation.y += (targetRotY - scene.rotation.y) * Math.min(1, delta * 3);
    scene.rotation.z += (sceneRotation[2] - scene.rotation.z) * Math.min(1, delta * 3);
  });

  return (
    <group ref={sceneRef} position={scenePosition} rotation={sceneRotation}>
      <FlowEdges hasActiveLayer={activeLayerIds.size > 0} />
      {atlasLayers.map((layer, index) => (
        <GlassLayer
          activeIndexes={activeIndexes}
          activeLayerIds={activeLayerIds}
          index={index}
          key={layer.id}
          layer={layer}
          reducedMotion={reducedMotion}
          y={index * layerGap}
        />
      ))}
    </group>
  );
}

export function AtlasCanvas({ activeChapterSlug }: AtlasCanvasProps) {
  const activeLayerIds = useMemo(() => getActiveLayerIds(activeChapterSlug), [activeChapterSlug]);
  const hasActiveLayer = activeLayerIds.size > 0;
  const reducedMotion = usePrefersReducedMotion();
  const atlasFrameLoop = reducedMotion ? "demand" : "always";

  return (
    <div
      className="atlas-canvas-shell has-html-labels"
      role="img"
      aria-label="Seven transparent zkTLS evidence layers connected from source API response to verifier decision."
    >
      <Canvas
        camera={{ fov: 36, position: [5, 3.8, 6] }}
        dpr={[1, 1.5]}
        frameloop={atlasFrameLoop}
        gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
      >
        <ambientLight intensity={1.55} />
        <directionalLight intensity={1.1} position={[4, 5, 3]} />
        <Suspense fallback={null}>
          <AtlasScene activeChapterSlug={activeChapterSlug} reducedMotion={reducedMotion} />
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
