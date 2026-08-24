/** Canonical persona schema pimp.persona.v1 — types + validator. */

export const PERSONA_SCHEMA_ID = "pimp.persona.v1" as const;

export type PersonaSource = "llm" | "human" | "hybrid";
export type PersonaPointOfView = "first" | "second" | "third";
export type PersonaTropeCheck = "off" | "standard" | "strict";
export type PersonaAbstraction = "low" | "medium" | "high";

export interface PersonaV1 {
  schema: typeof PERSONA_SCHEMA_ID;
  id: string;
  name: string;
  version: string;
  createdAt: string;
  source: PersonaSource;
  identity: {
    one_line: string;
    point_of_view: PersonaPointOfView;
    register: string;
  };
  voice: {
    vocal_protocol: string;
    performance_target: string;
    diction: string[];
    forbidden: string[];
  };
  defaults: {
    genre_spine: string;
    genre_color: string;
    trope_check: PersonaTropeCheck;
    trope_tone: string;
    emotion_path: string;
    narrative_arc: string;
  };
  anchors: {
    objects: string[];
    places: string[];
    actions: string[];
  };
  constraints: {
    one_intent_rule: boolean;
    max_abstraction: PersonaAbstraction;
    must_bind_objects_in_verse: boolean;
  };
  notes?: string;
}

export interface PersonaIssue {
  field: string;
  message: string;
}

export type PersonaValidateResult =
  | { ok: true; persona: PersonaV1 }
  | { ok: false; errors: PersonaIssue[] };

export interface PersonaIndexEntry {
  id: string;
  name: string;
  version: string;
  source: PersonaSource;
  updatedAt: string;
}

const POV = new Set(["first", "second", "third"]);
const TROPE = new Set(["off", "standard", "strict"]);
const ABS = new Set(["low", "medium", "high"]);
const SOURCE = new Set(["llm", "human", "hybrid"]);

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function isStrArr(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === "string");
}

function err(errors: PersonaIssue[], field: string, message: string) {
  errors.push({ field, message });
}

export function validatePersona(json: unknown): PersonaValidateResult {
  const errors: PersonaIssue[] = [];
  if (!isObj(json)) {
    return { ok: false, errors: [{ field: "schema", message: "persona must be a JSON object" }] };
  }

  if (json.schema !== PERSONA_SCHEMA_ID) {
    err(errors, "schema", `schema must be ${PERSONA_SCHEMA_ID}`);
  }
  if (typeof json.id !== "string" || !json.id.trim()) {
    err(errors, "id", "id is required");
  }
  if (typeof json.name !== "string" || !json.name.trim()) {
    err(errors, "name", "name is required");
  }
  if (typeof json.version !== "string" || !json.version.trim()) {
    err(errors, "version", "version is required");
  }
  if (typeof json.createdAt !== "string" || !json.createdAt.trim()) {
    err(errors, "createdAt", "createdAt is required (ISO-8601)");
  }
  if (!SOURCE.has(json.source as string)) {
    err(errors, "source", 'source must be "llm" | "human" | "hybrid"');
  }

  const identity = json.identity;
  if (!isObj(identity)) {
    err(errors, "identity", "identity object is required");
  } else {
    if (typeof identity.one_line !== "string" || !identity.one_line.trim()) {
      err(errors, "identity.one_line", "identity.one_line is required");
    }
    if (!POV.has(identity.point_of_view as string)) {
      err(errors, "identity.point_of_view", 'point_of_view must be "first" | "second" | "third"');
    }
    if (typeof identity.register !== "string") {
      err(errors, "identity.register", "identity.register is required");
    }
  }

  const voice = json.voice;
  if (!isObj(voice)) {
    err(errors, "voice", "voice object is required");
  } else {
    if (typeof voice.vocal_protocol !== "string" || !voice.vocal_protocol.trim()) {
      err(errors, "voice.vocal_protocol", "voice.vocal_protocol is required");
    }
    if (typeof voice.performance_target !== "string") {
      err(errors, "voice.performance_target", "voice.performance_target is required");
    }
    if (!isStrArr(voice.diction)) {
      err(errors, "voice.diction", "voice.diction must be an array of strings");
    }
    if (!Array.isArray(voice.forbidden)) {
      err(errors, "voice.forbidden", "voice.forbidden must be an array");
    } else if (!isStrArr(voice.forbidden)) {
      err(errors, "voice.forbidden", "voice.forbidden must be an array of strings");
    }
  }

  const defaults = json.defaults;
  if (!isObj(defaults)) {
    err(errors, "defaults", "defaults object is required");
  } else {
    if (typeof defaults.genre_spine !== "string" || !defaults.genre_spine.trim()) {
      err(errors, "defaults.genre_spine", "defaults.genre_spine is required");
    }
    if (typeof defaults.genre_color !== "string") {
      err(errors, "defaults.genre_color", "defaults.genre_color is required");
    }
    if (!TROPE.has(defaults.trope_check as string)) {
      err(errors, "defaults.trope_check", 'defaults.trope_check must be "off" | "standard" | "strict"');
    }
    if (typeof defaults.trope_tone !== "string") {
      err(errors, "defaults.trope_tone", "defaults.trope_tone is required");
    }
    if (typeof defaults.emotion_path !== "string") {
      err(errors, "defaults.emotion_path", "defaults.emotion_path is required");
    }
    if (typeof defaults.narrative_arc !== "string") {
      err(errors, "defaults.narrative_arc", "defaults.narrative_arc is required");
    }
  }

  const anchors = json.anchors;
  if (!isObj(anchors)) {
    err(errors, "anchors", "anchors object is required");
  } else {
    if (!isStrArr(anchors.objects)) {
      err(errors, "anchors.objects", "anchors.objects must be an array of strings");
    } else if (anchors.objects.filter((o) => o.trim()).length < 3) {
      err(errors, "anchors.objects", "anchors.objects must contain at least 3 items");
    }
    if (!isStrArr(anchors.places)) {
      err(errors, "anchors.places", "anchors.places must be an array of strings");
    }
    if (!isStrArr(anchors.actions)) {
      err(errors, "anchors.actions", "anchors.actions must be an array of strings");
    }
  }

  const constraints = json.constraints;
  if (!isObj(constraints)) {
    err(errors, "constraints", "constraints object is required");
  } else {
    if (typeof constraints.one_intent_rule !== "boolean") {
      err(errors, "constraints.one_intent_rule", "constraints.one_intent_rule must be boolean");
    }
    if (!ABS.has(constraints.max_abstraction as string)) {
      err(
        errors,
        "constraints.max_abstraction",
        'max_abstraction must be "low" | "medium" | "high"',
      );
    }
    if (typeof constraints.must_bind_objects_in_verse !== "boolean") {
      err(
        errors,
        "constraints.must_bind_objects_in_verse",
        "must_bind_objects_in_verse must be boolean",
      );
    }
  }

  if (json.notes !== undefined && typeof json.notes !== "string") {
    err(errors, "notes", "notes must be a string if present");
  }

  if (errors.length) return { ok: false, errors };

  const persona = json as unknown as PersonaV1;
  return { ok: true, persona };
}

export function formatPersonaErrors(errors: PersonaIssue[]): string {
  return errors.map((e) => `${e.field}: ${e.message}`).join("\n");
}

export function indexEntry(p: PersonaV1, updatedAt = new Date().toISOString()): PersonaIndexEntry {
  return {
    id: p.id,
    name: p.name,
    version: p.version,
    source: p.source,
    updatedAt,
  };
}

const STOP = new Set([
  "that",
  "this",
  "with",
  "from",
  "have",
  "been",
  "were",
  "they",
  "them",
  "then",
  "when",
  "what",
  "your",
  "into",
  "just",
  "about",
  "would",
  "could",
  "should",
]);

function tokens(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9'\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !STOP.has(w));
}

/** Soft warn: spec intent shares no substance with identity.one_line, or hits forbidden. */
export function personaIntentConflict(
  intent: string,
  persona: PersonaV1,
): { fights: boolean; reason: string } | null {
  const one = persona.identity.one_line;
  const i = intent.trim();
  if (!i) return null;
  const forbidden = persona.voice.forbidden ?? [];
  const hit = forbidden.find((f) => f.trim() && i.toLowerCase().includes(f.toLowerCase()));
  if (hit) {
    return {
      fights: true,
      reason: `Intent contains persona-forbidden phrase “${hit}”.`,
    };
  }
  const a = new Set(tokens(i));
  const b = tokens(one);
  if (b.length && ![...b].some((w) => a.has(w))) {
    return {
      fights: true,
      reason: `Intent does not share concrete terms with “${one}”.`,
    };
  }
  return null;
}
