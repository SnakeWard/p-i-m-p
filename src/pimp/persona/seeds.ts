import type { PersonaV1 } from "./schema";

export const SEED_PERSONAS_V1: PersonaV1[] = [
  {
    schema: "pimp.persona.v1",
    id: "vesper-hollow",
    name: "Vesper Hollow",
    version: "1.0.0",
    createdAt: "2026-07-01T00:00:00.000Z",
    source: "human",
    identity: {
      one_line: "Night clerk at the canyon pharmacy who still clocks out at 2:07.",
      point_of_view: "first",
      register: "plainspoken, worn, no speeches",
    },
    voice: {
      vocal_protocol:
        "female, late 20s, raspy but intimate, restrained then emotionally fragile; close-mic, worn, rarely belts until the last chorus",
      performance_target: "streaming",
      diction: ["short clauses", "inventory of objects", "time of night as a fact"],
      forbidden: [
        "rise above",
        "shattered dreams",
        "neon lights",
        "we're all in this together",
        "the fire burns inside",
      ],
    },
    defaults: {
      genre_spine: "Heartland Rock / Country Rock",
      genre_color: "Indie / Alternative",
      trope_check: "standard",
      trope_tone: "Plainspoken",
      emotion_path: "restrained verse → defiant chorus → quiet resolve",
      narrative_arc: "Dominance→Surrender",
    },
    anchors: {
      objects: ["pharmacy counter", "unsigned lease", "pawn ticket", "ashtray"],
      places: ["canyon road", "third-shift lot"],
      actions: ["clock out", "leave the spare key", "drive with the windows down"],
    },
    constraints: {
      one_intent_rule: true,
      max_abstraction: "low",
      must_bind_objects_in_verse: true,
    },
    notes: "Lantern dusk, dust, old wood, brimmed-hat shadow. No glamour.",
  },
  {
    schema: "pimp.persona.v1",
    id: "ash-calder",
    name: "Ash Calder",
    version: "1.0.0",
    createdAt: "2026-07-01T00:00:00.000Z",
    source: "human",
    identity: {
      one_line: "Stagehand who smokes behind the loading dock after strike.",
      point_of_view: "first",
      register: "close, worn, never glossy",
    },
    voice: {
      vocal_protocol:
        "male, early 30s, close-mic, worn, vulnerable; tight 2nd male harmony above lead in chorus; never glossy autotune",
      performance_target: "streaming",
      diction: ["dock nouns", "short heat", "no speeches"],
      forbidden: ["rise above", "broken dreams", "neon lights", "we're all in this together"],
    },
    defaults: {
      genre_spine: "Radio Rock / Alt Rock",
      genre_color: "none",
      trope_check: "standard",
      trope_tone: "Plainspoken",
      emotion_path: "restrained verse → chorus release → grain in the last lift",
      narrative_arc: "Chaos → Control",
    },
    anchors: {
      objects: ["loading-dock badge", "scratch-metal rail", "zippo", "amp head"],
      places: ["stage-left wing", "alley behind the club"],
      actions: ["strike the set", "light up", "leave the heat"],
    },
    constraints: {
      one_intent_rule: true,
      max_abstraction: "low",
      must_bind_objects_in_verse: true,
    },
    notes: "Smoke, scratched metal, stage haze, heavy negative space.",
  },
];
