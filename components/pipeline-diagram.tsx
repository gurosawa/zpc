"use client";

import { useEffect, useRef, useState } from "react";
import { SvgDraw } from "@/components/svg-draw";

export type PipelineMode = "tls12" | "tls13" | "zktls";

type FlowNode = {
  id: string;
  label: string;
  x: number;
  y: number;
};

type Flow = {
  label: string;
  nodes: FlowNode[];
  edges: Array<[string, string]>;
};

const flows: Record<PipelineMode, Flow> = {
  tls12: {
    label: "TLS 1.2 handshake sequence",
    nodes: [
      { id: "client", label: "CLIENT", x: 54, y: 220 },
      { id: "hello", label: "HELLO", x: 180, y: 140 },
      { id: "cert", label: "CERT", x: 306, y: 220 },
      { id: "key", label: "KEY EX", x: 432, y: 140 },
      { id: "server", label: "SERVER", x: 558, y: 220 },
    ],
    edges: [
      ["client", "hello"],
      ["hello", "cert"],
      ["cert", "key"],
      ["key", "server"],
    ],
  },
  tls13: {
    label: "TLS 1.3 handshake sequence",
    nodes: [
      { id: "client", label: "CLIENT", x: 64, y: 210 },
      { id: "keyshare", label: "KEYSHARE", x: 220, y: 140 },
      { id: "encrypted", label: "ENCRYPTED", x: 376, y: 140 },
      { id: "server", label: "SERVER", x: 532, y: 210 },
    ],
    edges: [
      ["client", "keyshare"],
      ["keyshare", "encrypted"],
      ["encrypted", "server"],
    ],
  },
  zktls: {
    label: "zkTLS fetch proof verify pipeline",
    nodes: [
      { id: "request", label: "REQUEST", x: 44, y: 214 },
      { id: "tls", label: "TLS SESSION", x: 174, y: 132 },
      { id: "transcript", label: "TRANSCRIPT", x: 310, y: 214 },
      { id: "proof", label: "PROOF", x: 448, y: 132 },
      { id: "verifier", label: "VERIFIER", x: 582, y: 214 },
    ],
    edges: [
      ["request", "tls"],
      ["tls", "transcript"],
      ["transcript", "proof"],
      ["proof", "verifier"],
    ],
  },
};

function nodeById(flow: Flow, id: string) {
  const node = flow.nodes.find((item) => item.id === id);
  if (!node) {
    throw new Error(`Unknown pipeline node: ${id}`);
  }

  return node;
}

function edgePath(flow: Flow, [fromId, toId]: [string, string]) {
  const from = nodeById(flow, fromId);
  const to = nodeById(flow, toId);
  const startX = from.x + 88;
  const startY = from.y + 22;
  const endX = to.x;
  const endY = to.y + 22;
  const midX = (startX + endX) / 2;

  return `M${startX} ${startY} C${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
}

type PipelineDiagramProps = {
  mode?: PipelineMode;
};

export function PipelineDiagram({ mode = "zktls" }: PipelineDiagramProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const flow = flows[mode];

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const maxStep = flow.nodes.length - 1;

    if (prefersReducedMotion) {
      host.style.setProperty("--progress", "1");
      const frame = window.requestAnimationFrame(() => setActiveStep(maxStep));
      return () => window.cancelAnimationFrame(frame);
    }

    let frame = 0;
    const update = () => {
      const rect = host.getBoundingClientRect();
      const range = window.innerHeight + rect.height;
      const raw = (window.innerHeight - rect.top) / range;
      const progress = Math.min(1, Math.max(0, raw));
      host.style.setProperty("--progress", progress.toFixed(3));
      setActiveStep(Math.min(maxStep, Math.floor(progress * flow.nodes.length)));
    };
    const requestUpdate = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(update);
    };

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    requestUpdate();

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, [flow.nodes.length, mode]);

  return (
    <div ref={hostRef} className="pipeline-diagram-host" data-mode={mode}>
      <SvgDraw className="pipeline-draw">
        <svg viewBox="0 0 720 340" role="img" aria-label={flow.label}>
          <title>{flow.label}</title>
          <path
            data-draw
            pathLength={1}
            className="pipeline-baseline"
            d="M40 286H680"
          />
          {flow.edges.map((edge, index) => (
            <path
              data-draw
              pathLength={1}
              className={index < activeStep ? "pipeline-edge active" : "pipeline-edge"}
              d={edgePath(flow, edge)}
              key={`${edge[0]}-${edge[1]}`}
            />
          ))}
          {flow.nodes.map((node, index) => (
            <g
              className={index <= activeStep ? "pipeline-node active" : "pipeline-node"}
              key={node.id}
              transform={`translate(${node.x} ${node.y})`}
            >
              <rect data-draw pathLength={1} width="88" height="44" />
              <text x="10" y="28">
                {node.label}
              </text>
            </g>
          ))}
          {mode === "zktls" ? (
            <g className="pipeline-proof-note">
              <path data-draw pathLength={1} d="M354 96h116l28 22" />
              <text x="354" y="88">
                SELECTIVE DISCLOSURE
              </text>
            </g>
          ) : null}
        </svg>
      </SvgDraw>
    </div>
  );
}
