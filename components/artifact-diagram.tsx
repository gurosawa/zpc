import type { TocVisualKey } from "@/lib/content";
import { SvgDraw } from "@/components/svg-draw";

type ArtifactDiagramProps = {
  visualKey: TocVisualKey;
  label: string;
  variant?: "slot" | "figure";
};

const knownKeys = new Set([
  "tls-record-strip",
  "proof-pipeline",
  "transcript-receipt",
  "circuit-grid",
  "merkle-branch",
  "browser-session-trace",
  "trust-layer-stack",
]);

function isKnownArtifactKey(key: string): boolean {
  return knownKeys.has(key);
}

function TlsRecordStrip() {
  const cells = [
    { x: 18, width: 54, label: "TYPE" },
    { x: 78, width: 58, label: "VER" },
    { x: 142, width: 66, label: "LEN" },
    { x: 214, width: 150, label: "CIPHER" },
    { x: 370, width: 72, label: "TAG" },
  ];

  return (
    <>
      <line data-draw pathLength={1} x1="18" y1="36" x2="442" y2="36" />
      {cells.map((cell, index) => (
        <g key={cell.label} className={index === 3 ? "diagram-accent" : undefined}>
          <rect data-draw pathLength={1} x={cell.x} y="18" width={cell.width} height="36" />
          <text x={cell.x + 8} y="42">
            {cell.label}
          </text>
        </g>
      ))}
      <path data-draw pathLength={1} d="M225 64h122m-98 8h78m-54 8h38" />
    </>
  );
}

function ProofPipeline() {
  const nodes = [
    { x: 24, label: "REQ" },
    { x: 106, label: "TLS" },
    { x: 188, label: "TX" },
    { x: 270, label: "PROOF" },
    { x: 366, label: "VERIFY" },
  ];

  return (
    <>
      <path data-draw pathLength={1} d="M64 36H376" />
      {nodes.map((node, index) => (
        <g key={node.label} className={index >= 3 ? "diagram-accent" : undefined}>
          <rect data-draw pathLength={1} x={node.x} y="18" width="66" height="36" />
          <text x={node.x + 10} y="42">
            {node.label}
          </text>
        </g>
      ))}
      <path data-draw pathLength={1} d="M300 64l30 18 30-18" />
    </>
  );
}

function TranscriptReceipt() {
  return (
    <>
      <rect data-draw pathLength={1} x="130" y="10" width="210" height="76" />
      <line data-draw pathLength={1} x1="148" y1="28" x2="320" y2="28" />
      <path data-draw pathLength={1} d="M150 44h52m16 0h34m16 0h46M150 58h30m14 0h70m14 0h36" />
      <rect data-draw pathLength={1} className="diagram-accent" x="150" y="68" width="70" height="10" />
      <path data-draw pathLength={1} d="M250 73h64" />
    </>
  );
}

function CircuitGrid() {
  const dots = [
    [68, 24],
    [116, 38],
    [164, 24],
    [212, 52],
    [260, 38],
    [308, 66],
    [356, 24],
    [404, 52],
  ];

  return (
    <>
      {Array.from({ length: 8 }, (_, index) => (
        <line
          data-draw
          pathLength={1}
          key={`v-${index}`}
          x1={56 + index * 48}
          y1="16"
          x2={56 + index * 48}
          y2="78"
        />
      ))}
      {Array.from({ length: 5 }, (_, index) => (
        <line
          data-draw
          pathLength={1}
          key={`h-${index}`}
          x1="48"
          y1={18 + index * 14}
          x2="416"
          y2={18 + index * 14}
        />
      ))}
      {dots.map(([cx, cy], index) => (
        <rect
          data-draw
          pathLength={1}
          className={index % 3 === 0 ? "diagram-accent" : undefined}
          key={`${cx}-${cy}`}
          x={cx - 4}
          y={cy - 4}
          width="8"
          height="8"
        />
      ))}
    </>
  );
}

function MerkleBranch() {
  return (
    <>
      <path data-draw pathLength={1} d="M76 72L156 46l80 26 80-26 80 26" />
      <path data-draw pathLength={1} d="M156 46l80-26 80 26" />
      <path data-draw pathLength={1} className="diagram-accent" d="M76 72l80-26 80-26" />
      {[76, 156, 236, 316, 396].map((cx, index) => (
        <rect
          data-draw
          pathLength={1}
          className={index === 0 || index === 2 ? "diagram-accent" : undefined}
          key={cx}
          x={cx - 16}
          y={index === 2 ? 8 : index === 1 || index === 3 ? 34 : 60}
          width="32"
          height="24"
        />
      ))}
    </>
  );
}

function BrowserSessionTrace() {
  return (
    <>
      <rect data-draw pathLength={1} x="42" y="14" width="172" height="64" />
      <line data-draw pathLength={1} x1="42" y1="30" x2="214" y2="30" />
      <path data-draw pathLength={1} d="M58 46h92M58 60h122" />
      <path data-draw pathLength={1} className="diagram-accent" d="M232 30h150m-22-10 22 10-22 10" />
      <rect data-draw pathLength={1} x="392" y="18" width="48" height="48" />
      <path data-draw pathLength={1} d="M402 34h28M402 48h18" />
    </>
  );
}

function TrustLayerStack() {
  const layers = [
    { y: 62, label: "TLS" },
    { y: 46, label: "zkTLS" },
    { y: 30, label: "VERIFY" },
    { y: 14, label: "APP" },
  ];

  return (
    <>
      {layers.map((layer, index) => (
        <g key={layer.label} className={index === 1 ? "diagram-accent" : undefined}>
          <rect data-draw pathLength={1} x="74" y={layer.y} width="322" height="14" />
          <text x="86" y={layer.y + 10}>
            {layer.label}
          </text>
        </g>
      ))}
      <path data-draw pathLength={1} d="M420 68V18" strokeDasharray="2 3" />
      <path data-draw pathLength={1} className="diagram-accent" d="M410 26l10-10 10 10" />
    </>
  );
}

function PendingArtifact({ visualKey }: { visualKey: string }) {
  return (
    <>
      <rect x="2" y="2" width="460" height="92" strokeDasharray="4 4" stroke="var(--border-light)" fill="none" />
      <text x="232" y="44" textAnchor="middle" fill="var(--text-secondary)">{visualKey.toUpperCase()}</text>
      <text x="232" y="60" textAnchor="middle" fill="var(--text-secondary)">[ DIAGRAM PENDING ]</text>
    </>
  );
}

function diagramFor(key: string) {
  if (key === "tls-record-strip") return <TlsRecordStrip />;
  if (key === "transcript-receipt") return <TranscriptReceipt />;
  if (key === "circuit-grid") return <CircuitGrid />;
  if (key === "merkle-branch") return <MerkleBranch />;
  if (key === "browser-session-trace") return <BrowserSessionTrace />;
  if (key === "trust-layer-stack") return <TrustLayerStack />;
  return <ProofPipeline />;
}

export function ArtifactDiagram({ visualKey, label, variant = "figure" }: ArtifactDiagramProps) {
  const isKnownKey = isKnownArtifactKey(visualKey);

  const svg = (
    <svg
      className={`artifact-diagram artifact-diagram-${isKnownKey ? visualKey : "pending"}`}
      viewBox="0 0 464 96"
      role="img"
      aria-label={`${label} diagram`}
    >
      <title>{label}</title>
      {isKnownKey ? diagramFor(visualKey) : <PendingArtifact visualKey={visualKey} />}
    </svg>
  );

  if (variant === "slot") {
    return svg;
  }

  return (
    <figure className="artifact-figure">
      <SvgDraw>{svg}</SvgDraw>
      <figcaption>{label}</figcaption>
    </figure>
  );
}
