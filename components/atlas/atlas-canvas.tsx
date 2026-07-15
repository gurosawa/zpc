"use client";

import { Text } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as easing from "maath/easing";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
import type { Group } from "three";

export type KineticChapter = {
  slug: string;
  order: number;
  title: string;
};

export type KineticIndexMode = "arming" | "overview" | "chapter";
export type KineticFocusKind = "idle" | "preview" | "committed";

export type KineticIndexCanvasProps = {
  activeChapterSlug: string | null;
  chapters: KineticChapter[];
  focusKind: KineticFocusKind;
  mode: KineticIndexMode;
  onRendererReady: () => void;
  reducedMotion: boolean;
};

type KineticThemeMode = "dark" | "light";

const paletteByTheme = {
  dark: {
    accent: "#aebdff",
    active: "#f4f6ff",
    dimmed: "#515a76",
    line: "#7683ca",
    neutral: "#a2a9bc",
  },
  light: {
    accent: "#001eff",
    active: "#11131a",
    dimmed: "#9da4b1",
    line: "#5d73ff",
    neutral: "#596171",
  },
} satisfies Record<KineticThemeMode, Record<string, string>>;

const fontUrl = "/fonts/DepartureMono-Regular.otf";
const transitionDuration = 0.6;
const armingDuration = 1.8;

function getThemeMode(): KineticThemeMode {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function useThemeMode() {
  const [themeMode, setThemeMode] = useState<KineticThemeMode>(getThemeMode);

  useEffect(() => {
    const root = document.documentElement;
    const updateThemeMode = () => setThemeMode(getThemeMode());
    const observer = new MutationObserver(updateThemeMode);

    observer.observe(root, { attributeFilter: ["class"], attributes: true });
    return () => observer.disconnect();
  }, []);

  return themeMode;
}

function smoothstep(value: number) {
  const bounded = Math.min(1, Math.max(0, value));
  return bounded * bounded * (3 - 2 * bounded);
}

function splitTitle(title: string, compact: boolean) {
  const limit = compact ? 24 : 30;
  if (title.length <= limit) return title;

  const words = title.split(" ");
  let bestIndex = 1;
  let smallestDifference = Number.POSITIVE_INFINITY;

  for (let index = 1; index < words.length; index += 1) {
    const firstLine = words.slice(0, index).join(" ");
    const secondLine = words.slice(index).join(" ");
    const difference = Math.abs(firstLine.length - secondLine.length);

    if (difference < smallestDifference) {
      bestIndex = index;
      smallestDifference = difference;
    }
  }

  return `${words.slice(0, bestIndex).join(" ")}\n${words.slice(bestIndex).join(" ")}`;
}

type KineticRowProps = {
  activeIndex: number;
  armingElapsedRef: MutableRefObject<number>;
  baseY: number;
  beatElapsedRef: MutableRefObject<number>;
  chapter: KineticChapter;
  compact: boolean;
  focusKind: KineticFocusKind;
  index: number;
  mode: KineticIndexMode;
  reducedMotion: boolean;
  themeMode: KineticThemeMode;
  title: string;
};

function KineticRow({
  activeIndex,
  armingElapsedRef,
  baseY,
  beatElapsedRef,
  chapter,
  compact,
  focusKind,
  index,
  mode,
  reducedMotion,
  themeMode,
  title,
}: KineticRowProps) {
  const rowRef = useRef<Group>(null);
  const palette = paletteByTheme[themeMode];
  const isActive = index === activeIndex;
  const isDefaultAccent = mode === "overview" && focusKind === "idle" && index === 0;
  const isForeground = focusKind !== "idle" && isActive;
  const isCommitted = focusKind === "committed" && isActive;
  const isSupporting = focusKind !== "idle" && !isActive;
  const depthGap = compact ? 0.1 : 0.19;
  const baseZ = 0.58 - index * depthGap;
  const hasTwoLines = title.includes("\n");
  const textColor = isForeground || isDefaultAccent ? palette.accent : palette.neutral;
  const textOpacity = isCommitted
    ? 1
    : isSupporting
      ? focusKind === "committed"
        ? 0.18
        : 0.48
      : 0.78;
  const lineColor = isForeground || isDefaultAccent ? palette.line : palette.dimmed;
  const lineOpacity = isCommitted
    ? 0.88
    : isSupporting
      ? focusKind === "committed"
        ? 0.08
        : 0.22
      : 0.34;
  const fontSize = compact ? 0.245 : chapter.title.length > 36 ? 0.255 : 0.285;
  const lineY = hasTwoLines ? -0.27 : -0.2;

  useFrame((_state, delta) => {
    const row = rowRef.current;
    if (!row) return;

    let targetX = index % 2 === 0 ? -0.03 : 0.03;
    let targetY = baseY;
    let targetZ = baseZ;
    let targetScale = 1;

    if (isForeground) {
      const committedDepth = compact ? 0.82 : 1.45;
      const previewDepth = compact ? 0.3 : 0.52;
      const depth = focusKind === "committed" ? committedDepth : previewDepth;
      const centering = focusKind === "committed" ? 0.34 : 0.82;

      targetX = compact ? -0.08 : -0.18;
      targetY = baseY * centering;
      targetZ = baseZ + depth;
      targetScale = focusKind === "committed" ? (compact ? 1.04 : 1.09) : 1.025;
    } else if (isSupporting) {
      const direction = index < activeIndex ? 1 : -1;
      const separation =
        focusKind === "committed" ? (compact ? 0.12 : 0.24) : compact ? 0.025 : 0.065;
      targetX += direction * (compact ? 0.03 : 0.08);
      targetY += direction * separation;
      targetZ -= compact ? 0.08 : 0.2;
      targetScale = compact ? 0.98 : 0.96;
    }

    if (mode === "arming" && !reducedMotion) {
      const elapsed = armingElapsedRef.current;
      const revealDelay = index * 0.045;
      const reveal = smoothstep((elapsed - revealDelay) / 0.14);
      const collision = smoothstep((elapsed - 0.45) / 0.9);
      const settle = smoothstep((elapsed - 1.35) / 0.45);
      const spreadDirection = index % 2 === 0 ? -1 : 1;
      const spreadX = spreadDirection * (compact ? 0.46 : 0.86);
      const spreadY = baseY * 1.42;
      const compressionOvershoot = Math.sin(collision * Math.PI) * spreadDirection * 0.14;

      targetX = spreadX * (1 - collision) + compressionOvershoot * (1 - settle);
      targetY = spreadY + (baseY - spreadY) * collision;
      targetZ = -2.2 + index * 0.08 + (baseZ + 2.2 - index * 0.08) * collision;
      targetScale = Math.max(0.001, reveal) * (0.92 + collision * 0.12 - settle * 0.04);
    } else if (focusKind === "committed" && beatElapsedRef.current < transitionDuration) {
      const elapsed = beatElapsedRef.current;
      const fold =
        elapsed < 0.14
          ? smoothstep(elapsed / 0.14)
          : 1 - smoothstep((elapsed - 0.14) / 0.36);
      const release = elapsed < 0.14 ? 0 : smoothstep((elapsed - 0.14) / 0.36);
      const settle = smoothstep((elapsed - 0.5) / 0.1);
      const overshoot = Math.sin(settle * Math.PI) * (isActive ? 0.08 : 0.02);

      targetX *= release;
      targetY *= 1 - fold * 0.82;
      targetZ = baseZ * (1 - release) + targetZ * release - fold * 0.46 + overshoot;
      targetScale *= 1 - fold * 0.11 + overshoot;
    }

    if (reducedMotion) {
      row.position.set(targetX, targetY, targetZ);
      row.scale.setScalar(targetScale);
      return;
    }

    easing.damp3(row.position, [targetX, targetY, targetZ], 0.12, delta);
    easing.damp3(row.scale, [targetScale, targetScale, targetScale], 0.12, delta);
  });

  return (
    <group
      ref={rowRef}
      scale={mode === "arming" && !reducedMotion ? 0.001 : 1}
      userData={{ chapter: chapter.slug }}
    >
      <Text
        anchorX="right"
        anchorY="middle"
        color={textColor}
        fillOpacity={textOpacity}
        font={fontUrl}
        fontSize={compact ? 0.2 : 0.22}
        position={[-2.76, 0, 0.02]}
      >
        {String(chapter.order).padStart(2, "0")}
      </Text>
      <Text
        anchorX="left"
        anchorY="middle"
        color={textColor}
        fillOpacity={textOpacity}
        font={fontUrl}
        fontSize={fontSize}
        lineHeight={0.92}
        maxWidth={compact ? 4.75 : 5.5}
        position={[-2.5, 0, 0]}
        textAlign="left"
      >
        {title}
      </Text>
      <mesh position={[0.22, lineY, -0.025]}>
        <boxGeometry args={[5.96, 0.009, 0.009]} />
        <meshBasicMaterial color={lineColor} opacity={lineOpacity} transparent />
      </mesh>
      <mesh position={[-2.83, lineY, -0.015]}>
        <boxGeometry args={[0.012, 0.16, 0.012]} />
        <meshBasicMaterial color={lineColor} opacity={lineOpacity + 0.08} transparent />
      </mesh>
    </group>
  );
}

type KineticIndexSceneProps = Omit<KineticIndexCanvasProps, "onRendererReady"> & {
  themeMode: KineticThemeMode;
};

function KineticIndexScene({
  activeChapterSlug,
  chapters,
  focusKind,
  mode,
  reducedMotion,
  themeMode,
}: KineticIndexSceneProps) {
  const sceneRef = useRef<Group>(null);
  const armingElapsedRef = useRef(mode === "arming" ? 0 : armingDuration);
  const beatElapsedRef = useRef(transitionDuration);
  const { size } = useThree();
  const compact = size.width <= size.height * 1.05;
  const activeIndex = Math.max(
    0,
    chapters.findIndex((chapter) => chapter.slug === activeChapterSlug),
  );
  const rowLayout = useMemo(() => {
    const rows = chapters.map((chapter) => {
      const title = splitTitle(chapter.title, compact);
      const height = title.includes("\n") ? (compact ? 0.5 : 0.54) : compact ? 0.3 : 0.34;
      return { chapter, height, title };
    });
    const gap = compact ? 0.1 : 0.12;
    const totalHeight =
      rows.reduce((total, row) => total + row.height, 0) + gap * Math.max(0, rows.length - 1);

    return rows.map((row, index) => {
      const precedingHeight = rows
        .slice(0, index)
        .reduce((total, precedingRow) => total + precedingRow.height, 0);
      const baseY = totalHeight / 2 - precedingHeight - gap * index - row.height / 2;
      return { ...row, baseY };
    });
  }, [chapters, compact]);

  useEffect(() => {
    if (mode === "arming" && !reducedMotion) armingElapsedRef.current = 0;
  }, [mode, reducedMotion]);

  useEffect(() => {
    if (focusKind !== "committed" || reducedMotion || mode === "arming") {
      beatElapsedRef.current = transitionDuration;
      return;
    }

    beatElapsedRef.current = 0;
  }, [activeChapterSlug, focusKind, mode, reducedMotion]);

  useFrame((state, delta) => {
    if (mode === "arming") {
      armingElapsedRef.current = Math.min(
        armingDuration,
        armingElapsedRef.current + delta,
      );
    }
    beatElapsedRef.current = Math.min(transitionDuration, beatElapsedRef.current + delta);

    const scene = sceneRef.current;
    if (!scene) return;

    const breathing = reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 0.58) * 0.018;
    const pointerX = reducedMotion || mode === "arming" ? 0 : state.pointer.x;
    const pointerY = reducedMotion || mode === "arming" ? 0 : state.pointer.y;
    const targetPosition: [number, number, number] = [
      pointerX * (compact ? 0.012 : 0.025),
      breathing + pointerY * (compact ? 0.008 : 0.018),
      0,
    ];

    if (reducedMotion) {
      scene.position.set(...targetPosition);
      return;
    }

    easing.damp3(scene.position, targetPosition, 0.22, delta);
  });

  return (
    <group ref={sceneRef} scale={compact ? 0.86 : 1}>
      {rowLayout.map(({ baseY, chapter, title }, index) => (
        <KineticRow
          activeIndex={activeIndex}
          armingElapsedRef={armingElapsedRef}
          baseY={baseY}
          beatElapsedRef={beatElapsedRef}
          chapter={chapter}
          compact={compact}
          focusKind={focusKind}
          index={index}
          key={chapter.slug}
          mode={mode}
          reducedMotion={reducedMotion}
          themeMode={themeMode}
          title={title}
        />
      ))}
    </group>
  );
}

export function KineticIndexCanvas({
  activeChapterSlug,
  chapters,
  focusKind,
  mode,
  onRendererReady,
  reducedMotion,
}: KineticIndexCanvasProps) {
  const themeMode = useThemeMode();
  const frameLoop = reducedMotion ? "demand" : "always";
  const rendererReadyRef = useRef(false);
  const signalRendererReady = useCallback(() => {
    if (rendererReadyRef.current) return;
    rendererReadyRef.current = true;
    onRendererReady();
  }, [onRendererReady]);

  return (
    <div aria-hidden="true" className="kinetic-index-canvas-shell">
      <Canvas
        aria-hidden="true"
        camera={{ fov: 35, near: 0.1, far: 100, position: [0, 0, 8.6] }}
        dpr={[1, 1.5]}
        frameloop={frameLoop}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
          preserveDrawingBuffer: true,
        }}
        onCreated={signalRendererReady}
      >
        <Suspense fallback={null}>
          <KineticIndexScene
            activeChapterSlug={activeChapterSlug}
            chapters={chapters}
            focusKind={focusKind}
            mode={mode}
            reducedMotion={reducedMotion}
            themeMode={themeMode}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
