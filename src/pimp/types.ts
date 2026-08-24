export type TropeCheckMode = "strict" | "standard" | "off";
export type TropeTone =
  | "Poetic"
  | "Plainspoken"
  | "Violent"
  | "Tender"
  | "Ironic"
  | "Character Voice";

export type PerformanceTarget =
  | "streaming"
  | "radio"
  | "short-form"
  | "trailer"
  | "club"
  | "sync";

export type CollectionId = "human_pd" | "ai_permissive" | "self_generated";

export type StudioPhase =
  | "intent"
  | "spec"
  | "lyrics"
  | "sound"
  | "release"
  | "personas"
  | "module"
  | "providers"
  | "handoff";

export interface SpecBlock {
  title: string;
  persona: string;
  genreSpine: string;
  genreColor: string;
  narrativeArc: string;
  emotionPath: string;
  structureTemplate: string;
  structureSections: string[];
  structureMods: string[];
  vocalProtocol: string;
  performanceTarget: PerformanceTarget;
  tropeCheck: TropeCheckMode;
  tropeTone: TropeTone;
  intent: string;
  toneFlags: string[];
}

export interface ConflictAlert {
  field: string;
  issue: string;
  fix: string;
}

export interface LineReport {
  section: string;
  index: number;
  line: string;
  cds: number;
  classes: string[];
  verdict: "PASS" | "CONDITIONAL" | "REWRITE" | "BLOCK";
  note: string;
  rewrite?: string;
}

export interface TropeReport {
  mode: TropeCheckMode;
  lines: LineReport[];
  changes: string[];
  sectionFailures: string[];
  binding: string[];
  passed: boolean;
}

export interface Persona {
  id: string;
  name: string;
  voice: string;
  visual: string;
  houseTemplate: string;
  createdAt: string;
}

export interface ReleasePackage {
  coverPrompt: string;
  negativePrompt: string;
  coverAlts: [string, string];
  hookType: string;
  hookPlan: string;
  caption: string;
  shortCaption: string;
  hashtags: string[];
  facebook: string;
  instagram: string;
  tiktok: string;
  coverImage?: string;
}

export interface Track {
  id: string;
  createdAt: string;
  updatedAt: string;
  spec: SpecBlock;
  stylePrompt: string;
  lyrics: string;
  tropeReport: TropeReport | null;
  release: ReleasePackage | null;
  selfPlugged: boolean;
  providerUsed: string;
}

export interface ProviderConfig {
  id: string;
  label: string;
  key: string;
  baseUrl: string;
  model: string;
}

export interface LyricRecord {
  id: string;
  collection: CollectionId;
  title: string;
  lyrics: string;
  provenance: string;
  license: string;
  createdAt: string;
  humanOverride: string;
  annotation: TropeReport | null;
  specSnapshot: Partial<SpecBlock> | null;
}

export interface ModuleVersion {
  id: string;
  module: string;
  version: string;
  notes: string;
  diff: string;
  accepted: boolean;
  createdAt: string;
}

export const EMPTY_SPEC: SpecBlock = {
  title: "",
  persona: "—",
  genreSpine: "",
  genreColor: "none",
  narrativeArc: "Chaos → Control",
  emotionPath: "restrained verse → chorus release",
  structureTemplate: "Modern Pop (Streaming-Era)",
  structureSections: [],
  structureMods: [],
  vocalProtocol: "forward, conversational verse; stacked hook",
  performanceTarget: "streaming",
  tropeCheck: "standard",
  tropeTone: "Poetic",
  intent: "",
  toneFlags: [],
};
