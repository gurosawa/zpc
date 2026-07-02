import roadmapData from "../content/article-roadmap.json";

export type ChapterStatus = "planned" | "draft" | "review" | "stable";

export type ArticleDifficulty = "foundation" | "intermediate" | "deep" | "lab";

export type VisualArtifactKey =
  | "risk-matrix"
  | "trust-boundary-map"
  | "crypto-strip"
  | "hash-chain"
  | "tls-record-strip"
  | "tls-handshake-transcript"
  | "tunnel-encapsulation-stack"
  | "api-authz-object-graph"
  | "supply-chain-provenance"
  | "witness-public-circuit"
  | "proof-pipeline"
  | "transcript-receipt"
  | "circuit-grid"
  | "merkle-branch"
  | "browser-session-trace"
  | "trust-layer-stack"
  | string;

export type ArticleMeta = {
  id: string;
  chapterId: string;
  order: number;
  title: string;
  slug: string;
  branch: string;
  status: ChapterStatus;
  difficulty: ArticleDifficulty;
  wordCountTarget: number;
  actualWordCount?: number;
  visualKey: VisualArtifactKey;
  readerQuestion: string;
  whyItMatters: string;
  coreModel: string;
  protocolOrSystemArtifact: string;
  failureMode: string;
  minimalLabOrTrace: string;
  zktlsBridge: string;
  verificationChecklist: string[];
  references: string[];
};

export type ChapterMeta = {
  id: string;
  order: number;
  title: string;
  slug: string;
  status: ChapterStatus;
  visualKey: VisualArtifactKey;
  guidingQuestion: string;
  articles: ArticleMeta[];
};

export type ContentRoadmap = {
  version: string;
  currentPlanningBranch: string;
  branchSequence: string[];
  chapters: ChapterMeta[];
};

export const contentRoadmap = roadmapData as ContentRoadmap;
