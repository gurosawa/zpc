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

export type AtlasLayer = {
  id: AtlasLayerId;
  order: number;
  label: string;
  fragment: string;
};

export type ChapterAtlasMapping = {
  chapterSlug: string;
  layerIds: AtlasLayerId[];
  mode: "boundary" | "layer" | "path";
  label: string;
};

export const atlasLayers: AtlasLayer[] = [
  {
    id: "source",
    order: 1,
    label: "Source / API Response",
    fragment: "GET /api/... -> 200",
  },
  {
    id: "tls",
    order: 2,
    label: "TLS Session",
    fragment: "16 03 03",
  },
  {
    id: "transcript",
    order: 3,
    label: "Transcript",
    fragment: "ServerHello -> Finished",
  },
  {
    id: "redaction",
    order: 4,
    label: "Redaction",
    fragment: "[REDACTED] + claim",
  },
  {
    id: "witness",
    order: 5,
    label: "Witness / Public Input",
    fragment: "witness | public input",
  },
  {
    id: "proof",
    order: 6,
    label: "Proof",
    fragment: "pi = Prove(C, w, x)",
  },
  {
    id: "verifier",
    order: 7,
    label: "Verifier Decision",
    fragment: "ACCEPT / VALID",
  },
];

const allLayerIds = [...atlasLayerIds];

export const chapterAtlasMappings: Record<string, ChapterAtlasMapping> = {
  "security-thinking": {
    chapterSlug: "security-thinking",
    layerIds: allLayerIds,
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
