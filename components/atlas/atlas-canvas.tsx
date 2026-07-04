"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as easing from "maath/easing";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { DoubleSide } from "three";
import type { Group } from "three";
import {
  atlasLayers,
  getActiveLayerIds,
  getPrimaryLayerIds,
  type AtlasLayer,
  type AtlasLayerId,
} from "@/components/atlas/atlas-data";

export type AtlasCanvasProps = {
  activeChapterSlug: string | null;
  hoveredLayerId?: AtlasLayerId | null;
  inspectedLayerId?: AtlasLayerId | null;
  onLayerHoverChange?: (layerId: AtlasLayerId | null) => void;
  onLayerInspectChange?: (layerId: AtlasLayerId | null) => void;
};

const layerWidth = 4.8;
const layerDepth = 2.25;
const layerThickness = 0.055;
const layerGap = 0.34;
const stackHeight = (atlasLayers.length - 1) * layerGap;
const scenePosition = [-0.48, -1.02, 0] as const;
const sceneRotation = [-0.42, 0.08, -0.56] as const;

type AtlasThemeMode = "dark" | "light";

type AtlasMaterialPalette = {
  activeColor: string;
  activeFill: string;
  neutralLine: string;
  neutralFill: string;
  activeFillOpacity: number;
  supportingFillOpacity: number;
  dimFillOpacity: number;
  idleFillOpacity: number;
  activeLineOpacity: number;
  supportingLineOpacity: number;
  dimLineOpacity: number;
  idleLineOpacity: number;
  roughness: number;
  transmission: number;
  thickness: number;
  ior: number;
};

const atlasMaterials: Record<AtlasThemeMode, AtlasMaterialPalette> = {
  dark: {
    activeColor: "#aab8ff",
    activeFill: "#aebdff",
    neutralLine: "#9ba8ff",
    neutralFill: "#c8d3ff",
    activeFillOpacity: 0.56,
    supportingFillOpacity: 0.32,
    dimFillOpacity: 0.06,
    idleFillOpacity: 0.18,
    activeLineOpacity: 0.98,
    supportingLineOpacity: 0.68,
    dimLineOpacity: 0.16,
    idleLineOpacity: 0.42,
    roughness: 0.18,
    transmission: 0.56,
    thickness: 0.72,
    ior: 1.32,
  },
  light: {
    activeColor: "#001eff",
    activeFill: "#5d73ff",
    neutralLine: "#657184",
    neutralFill: "#b8c0d8",
    activeFillOpacity: 0.46,
    supportingFillOpacity: 0.28,
    dimFillOpacity: 0.1,
    idleFillOpacity: 0.22,
    activeLineOpacity: 0.95,
    supportingLineOpacity: 0.58,
    dimLineOpacity: 0.18,
    idleLineOpacity: 0.38,
    roughness: 0.36,
    transmission: 0,
    thickness: 0.12,
    ior: 1.08,
  },
};

type AtlasLayerVisualState = "primary" | "supporting" | "dimmed" | "idle";

function getAtlasLayerVisualState({
  activeLayerIds,
  hoveredLayerId,
  inspectedLayerId,
  layerId,
  primaryLayerIds,
}: {
  activeLayerIds: Set<AtlasLayerId>;
  hoveredLayerId: AtlasLayerId | null;
  inspectedLayerId: AtlasLayerId | null;
  layerId: AtlasLayerId;
  primaryLayerIds: Set<AtlasLayerId>;
}): AtlasLayerVisualState {
  if (hoveredLayerId === layerId || inspectedLayerId === layerId || primaryLayerIds.has(layerId)) {
    return "primary";
  }

  if (activeLayerIds.has(layerId)) return "supporting";
  if (activeLayerIds.size > 0) return "dimmed";
  return "idle";
}

function getAtlasThemeMode(): AtlasThemeMode {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function useAtlasThemeMode() {
  const [themeMode, setThemeMode] = useState<AtlasThemeMode>(getAtlasThemeMode);

  useEffect(() => {
    const root = document.documentElement;
    const updateThemeMode = () => setThemeMode(getAtlasThemeMode());
    const observer = new MutationObserver(updateThemeMode);

    updateThemeMode();
    observer.observe(root, { attributeFilter: ["class"], attributes: true });

    return () => observer.disconnect();
  }, []);

  return themeMode;
}

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

function FlowEdges({
  hasActiveLayer,
  themeMode,
}: {
  hasActiveLayer: boolean;
  themeMode: AtlasThemeMode;
}) {
  const { activeColor } = atlasMaterials[themeMode];
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

function DioramaConnectors({
  hasActiveLayer,
  themeMode,
}: {
  hasActiveLayer: boolean;
  themeMode: AtlasThemeMode;
}) {
  const { activeColor, neutralLine } = atlasMaterials[themeMode];
  const color = hasActiveLayer ? activeColor : neutralLine;
  const opacity = hasActiveLayer ? 0.42 : 0.26;

  return (
    <group>
      {atlasLayers.slice(0, -1).map((layer, index) => (
        <group key={`diorama-connector-${layer.id}`}>
          {[-1.64, 1.64].map((x) => (
            <mesh key={`${layer.id}-${x}`} position={[x, index * layerGap + layerGap / 2, 1.04]}>
              <boxGeometry args={[0.018, layerGap * 0.72, 0.018]} />
              <meshBasicMaterial color={color} transparent opacity={opacity} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

type MotifProps = {
  isDimmed: boolean;
  isHighlighted: boolean;
  isSupporting: boolean;
  palette: AtlasMaterialPalette;
};

function getMotifColor({ isHighlighted, isSupporting, palette }: MotifProps) {
  if (isHighlighted) return palette.activeColor;
  if (isSupporting) return palette.activeFill;
  return palette.neutralLine;
}

function getMotifOpacity(
  { isDimmed, isHighlighted, isSupporting }: MotifProps,
  levels: { primary: number; supporting: number; idle: number; dimmed: number },
) {
  if (isDimmed) return levels.dimmed;
  if (isHighlighted) return levels.primary;
  if (isSupporting) return levels.supporting;
  return levels.idle;
}

const sourcePillars = [
  [-1.35, -0.62, 0.22],
  [-1.02, -0.18, 0.34],
  [-0.72, 0.44, 0.26],
  [-0.38, -0.54, 0.5],
  [-0.08, 0.05, 0.32],
  [0.24, 0.58, 0.42],
  [0.58, -0.28, 0.28],
  [0.86, 0.28, 0.48],
  [1.18, -0.62, 0.36],
] as const;

function SourcePillars(props: MotifProps) {
  const color = getMotifColor(props);
  const opacity = getMotifOpacity(props, { primary: 0.84, supporting: 0.58, idle: 0.42, dimmed: 0.16 });

  return (
    <group position={[0, 0.08, 0]}>
      {sourcePillars.map(([x, z, height]) => (
        <mesh key={`${x}-${z}`} position={[x, height / 2, z]}>
          <boxGeometry args={[0.14, height, 0.14]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.18} transparent opacity={opacity} />
        </mesh>
      ))}
    </group>
  );
}

function TlsTunnel(props: MotifProps) {
  const color = getMotifColor(props);
  const opacity = getMotifOpacity(props, { primary: 0.38, supporting: 0.27, idle: 0.2, dimmed: 0.08 });
  const spineOpacity = getMotifOpacity(props, { primary: 0.7, supporting: 0.5, idle: 0.36, dimmed: 0.14 });

  return (
    <group position={[0, 0.3, 0]}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.72, 0.72, 3.7, 28, 1, true]} />
        <meshPhysicalMaterial
          color={color}
          depthWrite={false}
          ior={1.18}
          roughness={0.24}
          side={DoubleSide}
          thickness={0.18}
          transmission={0.22}
          transparent
          opacity={opacity}
        />
      </mesh>
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.015, 0.015, 3.9, 8]} />
        <meshBasicMaterial color={color} transparent opacity={spineOpacity} />
      </mesh>
    </group>
  );
}

function TranscriptStrip(props: MotifProps) {
  const { palette } = props;
  const color = getMotifColor(props);
  const opacity = getMotifOpacity(props, { primary: 0.78, supporting: 0.58, idle: 0.42, dimmed: 0.16 });
  const railOpacity = getMotifOpacity(props, { primary: 0.68, supporting: 0.46, idle: 0.3, dimmed: 0.12 });

  return (
    <group position={[0, 0.14, 0]}>
      {[-1.12, -0.56, 0, 0.56, 1.12].map((x, index) => (
        <mesh key={`transcript-record-${x}`} position={[x, 0.08 + index * 0.018, 0]}>
          <boxGeometry args={[0.42, 0.055, 1.28]} />
          <meshStandardMaterial color={color} transparent opacity={opacity} />
        </mesh>
      ))}
      <mesh position={[0, 0.22, -0.74]}>
        <boxGeometry args={[2.92, 0.035, 0.035]} />
        <meshBasicMaterial color={palette.activeColor} transparent opacity={railOpacity} />
      </mesh>
    </group>
  );
}

function RedactionGrate(props: MotifProps) {
  const color = getMotifColor(props);
  const opacity = getMotifOpacity(props, { primary: 0.84, supporting: 0.62, idle: 0.44, dimmed: 0.16 });
  const blockOpacity = getMotifOpacity(props, { primary: 0.78, supporting: 0.6, idle: 0.42, dimmed: 0.22 });

  return (
    <group position={[0, 0.18, 0]}>
      {[-1.2, -0.6, 0, 0.6, 1.2].map((x) => (
        <mesh key={`redaction-x-${x}`} position={[x, 0.06, 0]}>
          <boxGeometry args={[0.045, 0.08, 1.55]} />
          <meshStandardMaterial color={color} transparent opacity={opacity} />
        </mesh>
      ))}
      {[-0.58, 0, 0.58].map((z) => (
        <mesh key={`redaction-z-${z}`} position={[0, 0.08, z]}>
          <boxGeometry args={[2.55, 0.08, 0.045]} />
          <meshStandardMaterial color={color} transparent opacity={opacity} />
        </mesh>
      ))}
      {[
        [-0.35, -0.28],
        [0.72, 0.44],
      ].map(([x, z]) => (
        <mesh key={`redaction-block-${x}-${z}`} position={[x, 0.22, z]}>
          <boxGeometry args={[0.28, 0.28, 0.28]} />
          <meshStandardMaterial color="#050505" transparent opacity={blockOpacity} />
        </mesh>
      ))}
    </group>
  );
}

function WitnessTray(props: MotifProps) {
  const { palette } = props;
  const color = getMotifColor(props);
  const opacity = getMotifOpacity(props, { primary: 0.8, supporting: 0.58, idle: 0.42, dimmed: 0.16 });
  const railOpacity = getMotifOpacity(props, { primary: 0.68, supporting: 0.48, idle: 0.34, dimmed: 0.12 });

  return (
    <group position={[0, 0.16, 0]}>
      {[-0.72, 0.72].map((x) => (
        <mesh key={`witness-rail-${x}`} position={[x, 0.1, 0]}>
          <boxGeometry args={[0.06, 0.08, 1.56]} />
          <meshStandardMaterial color={color} transparent opacity={opacity} />
        </mesh>
      ))}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[1.64, 0.05, 0.06]} />
        <meshBasicMaterial color={palette.activeColor} transparent opacity={railOpacity} />
      </mesh>
      {[
        [-0.42, -0.36],
        [0.08, 0.02],
        [0.46, 0.42],
      ].map(([x, z]) => (
        <mesh key={`witness-cube-${x}-${z}`} position={[x, 0.22, z]}>
          <boxGeometry args={[0.22, 0.18, 0.22]} />
          <meshStandardMaterial color={color} transparent opacity={opacity} />
        </mesh>
      ))}
    </group>
  );
}

function ProofPrism(props: MotifProps) {
  const { palette } = props;
  const color = getMotifColor(props);
  const opacity = getMotifOpacity(props, { primary: 0.66, supporting: 0.48, idle: 0.34, dimmed: 0.14 });
  const beamOpacity = getMotifOpacity(props, { primary: 0.76, supporting: 0.54, idle: 0.34, dimmed: 0.12 });

  return (
    <group position={[0, 0.28, 0]}>
      <mesh rotation={[0, Math.PI / 6, 0]}>
        <coneGeometry args={[0.5, 0.72, 3]} />
        <meshPhysicalMaterial
          color={color}
          depthWrite={false}
          ior={1.34}
          roughness={0.18}
          thickness={0.42}
          transmission={0.42}
          transparent
          opacity={opacity}
        />
      </mesh>
      <mesh position={[0.76, 0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.026, 0.026, 1.4, 10]} />
        <meshBasicMaterial color={palette.activeColor} transparent opacity={beamOpacity} />
      </mesh>
    </group>
  );
}

function VerifierGate(props: MotifProps) {
  const { palette } = props;
  const color = getMotifColor(props);
  const opacity = getMotifOpacity(props, { primary: 0.88, supporting: 0.64, idle: 0.46, dimmed: 0.16 });
  const signalOpacity = getMotifOpacity(props, { primary: 0.74, supporting: 0.54, idle: 0.34, dimmed: 0.12 });

  return (
    <group position={[0, 0.22, 0]}>
      {[-0.58, 0.58].map((x) => (
        <mesh key={`verifier-post-${x}`} position={[x, 0.24, 0]}>
          <boxGeometry args={[0.14, 0.48, 0.2]} />
          <meshStandardMaterial color={color} transparent opacity={opacity} />
        </mesh>
      ))}
      <mesh position={[0, 0.52, 0]}>
        <boxGeometry args={[1.42, 0.12, 0.2]} />
        <meshStandardMaterial color={color} transparent opacity={opacity} />
      </mesh>
      <mesh position={[0, 0.16, 0.38]}>
        <boxGeometry args={[0.72, 0.08, 0.12]} />
        <meshBasicMaterial color={palette.activeColor} transparent opacity={signalOpacity} />
      </mesh>
    </group>
  );
}

function LayerDioramaMotif({
  isDimmed,
  isHighlighted,
  isSupporting,
  layer,
  palette,
}: MotifProps & {
  layer: AtlasLayer;
}) {
  const props = { isDimmed, isHighlighted, isSupporting, palette };

  return (
    <group name={layer.inspectionLabel}>
      {(() => {
        switch (layer.motif) {
          case "pillars":
            return <SourcePillars {...props} />;
          case "tunnel":
            return <TlsTunnel {...props} />;
          case "record-strip":
            return <TranscriptStrip {...props} />;
          case "filter-grate":
            return <RedactionGrate {...props} />;
          case "input-tray":
            return <WitnessTray {...props} />;
          case "prism":
            return <ProofPrism {...props} />;
          case "verifier-gate":
            return <VerifierGate {...props} />;
          default:
            return null;
        }
      })()}
    </group>
  );
}

function GlassLayer({
  activeIndexes,
  layer,
  reducedMotion,
  themeMode,
  hoveredLayerId,
  inspectedLayerId,
  onLayerHoverChange,
  index,
  y,
  activeLayerIds,
  primaryLayerIds,
}: {
  activeIndexes: number[];
  layer: AtlasLayer;
  reducedMotion: boolean;
  themeMode: AtlasThemeMode;
  hoveredLayerId: AtlasLayerId | null;
  inspectedLayerId: AtlasLayerId | null;
  onLayerHoverChange: (layerId: AtlasLayerId | null) => void;
  index: number;
  y: number;
  activeLayerIds: Set<AtlasLayerId>;
  primaryLayerIds: Set<AtlasLayerId>;
}) {
  const layerRef = useRef<Group>(null);
  const palette = atlasMaterials[themeMode];
  const filledSlab = themeMode === "light";
  const { id } = layer;
  const isActive = activeLayerIds.has(id);
  const isHovered = hoveredLayerId === id;
  const isInspected = inspectedLayerId === id;
  const visualState = getAtlasLayerVisualState({
    activeLayerIds,
    hoveredLayerId,
    inspectedLayerId,
    layerId: id,
    primaryLayerIds,
  });
  const isPrimary = visualState === "primary";
  const isSupporting = visualState === "supporting";
  const isDimmed = visualState === "dimmed";
  const isHighlighted = isPrimary;
  const baseLayerOpacity = isPrimary
    ? palette.activeFillOpacity
    : isSupporting
      ? palette.supportingFillOpacity
      : isDimmed
        ? palette.dimFillOpacity
        : palette.idleFillOpacity;
  const baseLineOpacity = isPrimary
    ? palette.activeLineOpacity
    : isSupporting
      ? palette.supportingLineOpacity
      : isDimmed
        ? palette.dimLineOpacity
        : palette.idleLineOpacity;
  const layerOpacity = isHovered ? Math.max(baseLayerOpacity, palette.activeFillOpacity) : baseLayerOpacity;
  const lineOpacity = isHovered ? Math.max(baseLineOpacity, 0.86) : baseLineOpacity;
  const layerColor = isPrimary || isSupporting ? palette.activeFill : palette.neutralFill;
  const lineColor = isPrimary ? palette.activeColor : isSupporting ? palette.activeFill : palette.neutralLine;
  const emissiveIntensity = isPrimary ? 0.12 : isSupporting ? 0.035 : 0;
  const closestActiveIndex = activeIndexes.reduce<number | null>((closest, activeIndex) => {
    if (closest === null) return activeIndex;
    return Math.abs(activeIndex - index) < Math.abs(closest - index) ? activeIndex : closest;
  }, null);
  const distance = closestActiveIndex === null ? 0 : Math.abs(closestActiveIndex - index);
  const direction = closestActiveIndex === null || isActive ? 0 : Math.sign(index - closestActiveIndex);
  const accordionOffset = direction * Math.max(0, 0.1 - Math.max(0, distance - 1) * 0.025);
  const targetY = y + (isPrimary ? 0.1 : isSupporting ? 0.045 : accordionOffset);
  const targetPosition: [number, number, number] = [0, targetY, 0];
  const targetScale: [number, number, number] = isPrimary
    ? isInspected
      ? [1.075, 1.32, 1.075]
      : [1.05, 1.22, 1.05]
    : isSupporting
      ? [1.02, 1.12, 1.02]
      : [1, 1, 1];

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
    <group
      onPointerEnter={(event) => {
        event.stopPropagation();
        onLayerHoverChange(id);
      }}
      onPointerLeave={(event) => {
        event.stopPropagation();
        onLayerHoverChange(null);
      }}
      ref={layerRef}
      position={targetPosition}
      scale={targetScale}
    >
      <mesh>
        <boxGeometry args={[layerWidth, layerThickness, layerDepth]} />
        <meshPhysicalMaterial
          color={layerColor}
          depthWrite={false}
          emissive={lineColor}
          emissiveIntensity={emissiveIntensity}
          ior={palette.ior}
          metalness={0}
          opacity={layerOpacity}
          roughness={palette.roughness}
          thickness={palette.thickness}
          transmission={filledSlab ? 0 : palette.transmission}
          transparent
        />
      </mesh>
      <mesh scale={[1.004, 1.08, 1.004]}>
        <boxGeometry args={[layerWidth, layerThickness, layerDepth]} />
        <meshBasicMaterial
          color={lineColor}
          opacity={lineOpacity}
          transparent
          wireframe
        />
      </mesh>
      <LayerDioramaMotif
        isDimmed={isDimmed}
        isHighlighted={isHighlighted}
        isSupporting={isSupporting}
        layer={layer}
        palette={palette}
      />
      <Html
        className={[
          "atlas-html-label",
          isActive ? "is-active" : "",
          isPrimary ? "is-primary" : "",
          isSupporting ? "is-supporting" : "",
          isHovered ? "is-hovered" : "",
          isInspected ? "is-inspected" : "",
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
  themeMode,
  hoveredLayerId,
  inspectedLayerId,
  inspectionDepth,
  onLayerHoverChange,
}: AtlasCanvasProps & {
  reducedMotion: boolean;
  themeMode: AtlasThemeMode;
  hoveredLayerId: AtlasLayerId | null;
  inspectedLayerId: AtlasLayerId | null;
  inspectionDepth: number;
  onLayerHoverChange: (layerId: AtlasLayerId | null) => void;
}) {
  const activeLayerIds = useMemo(() => getActiveLayerIds(activeChapterSlug), [activeChapterSlug]);
  const primaryLayerIds = useMemo(() => getPrimaryLayerIds(activeChapterSlug), [activeChapterSlug]);
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
      scene.scale.setScalar(1 + inspectionDepth * 0.16);
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
    scene.scale.setScalar(
      scene.scale.x + (1 + inspectionDepth * 0.16 - scene.scale.x) * Math.min(1, delta * 4),
    );
  });

  return (
    <group ref={sceneRef} position={scenePosition} rotation={sceneRotation}>
      <FlowEdges hasActiveLayer={activeLayerIds.size > 0} themeMode={themeMode} />
      <DioramaConnectors hasActiveLayer={activeLayerIds.size > 0} themeMode={themeMode} />
      {atlasLayers.map((layer, index) => (
        <GlassLayer
          activeIndexes={activeIndexes}
          activeLayerIds={activeLayerIds}
          index={index}
          key={layer.id}
          layer={layer}
          primaryLayerIds={primaryLayerIds}
          reducedMotion={reducedMotion}
          themeMode={themeMode}
          hoveredLayerId={hoveredLayerId}
          inspectedLayerId={inspectedLayerId}
          onLayerHoverChange={onLayerHoverChange}
          y={index * layerGap}
        />
      ))}
    </group>
  );
}

export function AtlasCanvas({
  activeChapterSlug,
  hoveredLayerId = null,
  inspectedLayerId = null,
  onLayerHoverChange = () => undefined,
  onLayerInspectChange = () => undefined,
}: AtlasCanvasProps) {
  const activeLayerIds = useMemo(() => getActiveLayerIds(activeChapterSlug), [activeChapterSlug]);
  const primaryLayerIds = useMemo(() => getPrimaryLayerIds(activeChapterSlug), [activeChapterSlug]);
  const reducedMotion = usePrefersReducedMotion();
  const themeMode = useAtlasThemeMode();
  const shellRef = useRef<HTMLDivElement | null>(null);
  const [inspectionDepth, setInspectionDepth] = useState(0);
  const visibleInspectionDepth = inspectedLayerId ? inspectionDepth : 0;
  const atlasFrameLoop = reducedMotion ? "demand" : "always";

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;

    function handleWheel(event: WheelEvent) {
      if (!hoveredLayerId) return;

      event.preventDefault();

      const baseDepth = inspectedLayerId === hoveredLayerId ? inspectionDepth : 0;
      const nextDepth = Math.max(0, Math.min(1, baseDepth + (event.deltaY < 0 ? 0.18 : -0.18)));

      setInspectionDepth(nextDepth);
      onLayerInspectChange(nextDepth > 0.12 ? hoveredLayerId : null);
    }

    shell.addEventListener("wheel", handleWheel, { passive: false });
    return () => shell.removeEventListener("wheel", handleWheel);
  }, [hoveredLayerId, inspectedLayerId, inspectionDepth, onLayerInspectChange]);

  return (
    <div
      className="atlas-canvas-shell has-html-labels"
      data-atlas-inspected-layer={inspectedLayerId ?? ""}
      onPointerLeave={() => {
        onLayerHoverChange(null);
        onLayerInspectChange(null);
      }}
      ref={shellRef}
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
          <AtlasScene
            activeChapterSlug={activeChapterSlug}
            hoveredLayerId={hoveredLayerId}
            inspectedLayerId={inspectedLayerId}
            inspectionDepth={visibleInspectionDepth}
            onLayerHoverChange={onLayerHoverChange}
            reducedMotion={reducedMotion}
            themeMode={themeMode}
          />
        </Suspense>
      </Canvas>
      <ol className="atlas-layer-overlay" aria-hidden="true">
        {atlasLayers.map((layer) => {
          const isActive = activeLayerIds.has(layer.id);
          const isHovered = hoveredLayerId === layer.id;
          const isInspected = inspectedLayerId === layer.id;
          const visualState = getAtlasLayerVisualState({
            activeLayerIds,
            hoveredLayerId,
            inspectedLayerId,
            layerId: layer.id,
            primaryLayerIds,
          });
          const isPrimary = visualState === "primary";
          const isSupporting = visualState === "supporting";
          const isDimmed = visualState === "dimmed";

          return (
            <li
              className={[
                "atlas-layer-label",
                isActive ? "is-active" : "",
                isPrimary ? "is-primary" : "",
                isSupporting ? "is-supporting" : "",
                isHovered ? "is-hovered" : "",
                isInspected ? "is-inspected" : "",
                isDimmed ? "is-dimmed" : "",
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
