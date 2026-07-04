export const atlasLayerIds = [
  "source",
  "tls",
  "transcript",
  "redaction",
  "witness",
  "proof",
  "verifier",
] as const;

export type AtlasLayerId = (typeof atlasLayerIds)[number];

export type AtlasLayerMotif =
  | "pillars"
  | "tunnel"
  | "record-strip"
  | "filter-grate"
  | "input-tray"
  | "prism"
  | "verifier-gate";

export type AtlasLayer = {
  id: AtlasLayerId;
  order: number;
  label: string;
  fragment: string;
  motif: AtlasLayerMotif;
  inspectionLabel: string;
};

export type ChapterAtlasMapping = {
  chapterSlug: string;
  layerIds: AtlasLayerId[];
  primaryLayerIds?: AtlasLayerId[];
  mode: "boundary" | "layer" | "path";
  label: string;
};

export const atlasLayers: AtlasLayer[] = [
  {
    id: "source",
    order: 1,
    label: "Source / API Response",
    fragment: "GET /api/... -> 200",
    motif: "pillars",
    inspectionLabel: "Source data pillars",
  },
  {
    id: "tls",
    order: 2,
    label: "TLS Session",
    fragment: "16 03 03",
    motif: "tunnel",
    inspectionLabel: "Encrypted session tunnel",
  },
  {
    id: "transcript",
    order: 3,
    label: "Transcript",
    fragment: "ServerHello -> Finished",
    motif: "record-strip",
    inspectionLabel: "Ordered transcript records",
  },
  {
    id: "redaction",
    order: 4,
    label: "Redaction",
    fragment: "[REDACTED] + claim",
    motif: "filter-grate",
    inspectionLabel: "Selective disclosure filter",
  },
  {
    id: "witness",
    order: 5,
    label: "Witness / Public Input",
    fragment: "witness | public input",
    motif: "input-tray",
    inspectionLabel: "Witness and public input tray",
  },
  {
    id: "proof",
    order: 6,
    label: "Proof",
    fragment: "pi = Prove(C, w, x)",
    motif: "prism",
    inspectionLabel: "Proof compression prism",
  },
  {
    id: "verifier",
    order: 7,
    label: "Verifier Decision",
    fragment: "ACCEPT / VALID",
    motif: "verifier-gate",
    inspectionLabel: "Verifier acceptance gate",
  },
];

export const atlasLayerArticleMappings: {
  layerId: AtlasLayerId;
  articleSlugs: string[];
}[] = [
  {
    layerId: "source",
    articleSlugs: [
      "cia-triad",
      "asset-threat-vulnerability-risk",
      "api-inventory-shadow-api-rate-limit",
      "zktls-provenance-problem",
      "fetch-prove-verify-pipeline",
    ],
  },
  {
    layerId: "tls",
    articleSlugs: [
      "ssl-vs-tls",
      "https-protection-path",
      "tls12-vs-tls13",
      "tls-record-layer",
      "pki-x509-certificate-chain",
      "zero-rtt-ech-quic-mtls",
      "mpc-tls-tlsnotary",
    ],
  },
  {
    layerId: "transcript",
    articleSlugs: [
      "hash-functions-collision-resistance",
      "hmac-tag-verification",
      "tls-record-layer",
      "zktls-provenance-problem",
      "deco-design-lineage",
    ],
  },
  {
    layerId: "redaction",
    articleSlugs: [
      "commitment-selective-disclosure",
      "merkle-proof-inclusion-claim",
      "verifiable-anonymous-credentials",
      "zktls-provenance-problem",
      "deco-design-lineage",
    ],
  },
  {
    layerId: "witness",
    articleSlugs: [
      "randomness-entropy",
      "zk-proof-properties",
      "mpc-garbled-circuit",
      "fetch-prove-verify-pipeline",
      "toy-circuit-production-risk",
    ],
  },
  {
    layerId: "proof",
    articleSlugs: [
      "hmac-tag-verification",
      "public-key-signatures-key-exchange",
      "zk-proof-properties",
      "snark-stark-tradeoff",
      "toy-circuit-production-risk",
    ],
  },
  {
    layerId: "verifier",
    articleSlugs: [
      "authentication-authorization-audit",
      "security-control-failure-modes",
      "fetch-prove-verify-pipeline",
      "mpc-tls-tlsnotary",
      "verifiable-anonymous-credentials",
    ],
  },
];

const allLayerIds = [...atlasLayerIds];

export const chapterAtlasMappings: Record<string, ChapterAtlasMapping> = {
  "security-thinking": {
    chapterSlug: "security-thinking",
    layerIds: allLayerIds,
    primaryLayerIds: ["source", "redaction", "verifier"],
    mode: "boundary",
    label: "Trust boundary frame",
  },
  "cryptographic-primitives": {
    chapterSlug: "cryptographic-primitives",
    layerIds: ["witness", "proof", "verifier"],
    mode: "path",
    label: "Proof and verifier primitives",
  },
  "web-trust-and-tls": {
    chapterSlug: "web-trust-and-tls",
    layerIds: ["tls", "transcript"],
    mode: "path",
    label: "TLS session and transcript",
  },
  "network-tunnels-and-identity-planes": {
    chapterSlug: "network-tunnels-and-identity-planes",
    layerIds: ["source", "tls", "transcript"],
    mode: "path",
    label: "Network path and session layer",
  },
  "application-and-api-security": {
    chapterSlug: "application-and-api-security",
    layerIds: ["source", "redaction"],
    mode: "layer",
    label: "Source API and disclosure boundary",
  },
  "secure-systems-and-supply-chain": {
    chapterSlug: "secure-systems-and-supply-chain",
    layerIds: ["source", "transcript", "verifier"],
    mode: "path",
    label: "Provenance from source to decision",
  },
  "privacy-preserving-proof-systems": {
    chapterSlug: "privacy-preserving-proof-systems",
    layerIds: ["redaction", "witness", "proof"],
    mode: "path",
    label: "Selective disclosure proof path",
  },
  "zktls-architectures-and-labs": {
    chapterSlug: "zktls-architectures-and-labs",
    layerIds: allLayerIds,
    primaryLayerIds: ["source", "tls", "redaction", "proof", "verifier"],
    mode: "path",
    label: "Full source-to-verifier path",
  },
};

export function getActiveMapping(chapterSlug: string | null): ChapterAtlasMapping | null {
  if (!chapterSlug) return null;
  return chapterAtlasMappings[chapterSlug] ?? null;
}

export function getActiveLayerIds(chapterSlug: string | null): Set<AtlasLayerId> {
  const mapping = getActiveMapping(chapterSlug);
  return new Set(mapping?.layerIds ?? []);
}

export function getPrimaryLayerIds(chapterSlug: string | null): Set<AtlasLayerId> {
  const mapping = getActiveMapping(chapterSlug);
  return new Set(mapping?.primaryLayerIds ?? mapping?.layerIds ?? []);
}
