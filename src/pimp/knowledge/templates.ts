export interface StructureTemplate {
  name: string;
  sections: string[];
  hook: string;
  chooseWhen: string;
  arcs: string[];
}

export const TEMPLATES: StructureTemplate[] = [
  {
    name: "Radio Rock / Alt Rock",
    sections: [
      "Intro",
      "Verse 1",
      "Pre-Chorus",
      "Chorus",
      "Verse 2",
      "Pre-Chorus",
      "Chorus",
      "Bridge",
      "Final Chorus",
      "Outro",
    ],
    hook: "standard-to-early",
    chooseWhen: "guitar-driven spine, chorus earned but inevitable",
    arcs: ["Chase→Capture", "Confrontation→Resolution"],
  },
  {
    name: "Heartland Rock / Country Rock",
    sections: [
      "Intro",
      "Verse 1",
      "Chorus",
      "Verse 2",
      "Chorus",
      "Bridge",
      "Final Chorus",
      "Outro",
    ],
    hook: "standard-to-early; title is the hook",
    chooseWhen: "lyric-first storytelling over steady 4/4",
    arcs: ["Ritual→Ascension", "Dominance→Surrender"],
  },
  {
    name: "Modern Pop (Streaming-Era)",
    sections: [
      "Hook Intro",
      "Verse 1",
      "Pre-Chorus",
      "Chorus",
      "Post-Chorus",
      "Verse 2",
      "Pre-Chorus",
      "Chorus",
      "Bridge",
      "Final Chorus",
      "Outro",
    ],
    hook: "early (15–30s)",
    chooseWhen: "maximal hook density, streaming intent",
    arcs: ["Absurdity→Joy", "Chaos→Control"],
  },
  {
    name: "Singer-Songwriter / Acoustic Ballad",
    sections: [
      "Intro",
      "Verse 1",
      "Verse 2",
      "Chorus",
      "Verse 3",
      "Bridge",
      "Final Chorus",
      "Outro",
    ],
    hook: "standard/refrain; longer setup ok",
    chooseWhen: "sparse instrumentation, introspection-first",
    arcs: ["Ritual→Ascension"],
  },
  {
    name: "Indie / Alternative (Looser Forms)",
    sections: [
      "Intro",
      "Verse 1",
      "Chorus",
      "Verse 2",
      "Instrumental",
      "Chorus",
      "C-Section",
      "Final Chorus",
      "Outro",
    ],
    hook: "variable",
    chooseWhen: "texture/attitude over repetition",
    arcs: ["Chaos→Control", "Absurdity→Joy"],
  },
  {
    name: "Metal / Hard Rock (Riff-Module Logic)",
    sections: [
      "Intro",
      "Verse 1",
      "Chorus",
      "Verse 2",
      "Chorus",
      "Breakdown",
      "Solo",
      "Final Chorus",
      "Outro",
    ],
    hook: "standard; riff-based motif ok",
    chooseWhen: "riff anchors + aggressive percussion",
    arcs: ["Confrontation→Resolution", "Ritual→Ascension"],
  },
  {
    name: "Hip-Hop / Trap (Verse-Hook Core)",
    sections: ["Cold Open", "Hook", "Verse 1", "Hook", "Verse 2", "Hook", "Outro"],
    hook: "early, often first",
    chooseWhen: "bar-structured flow and hook loop",
    arcs: ["Dominance→Surrender", "Absurdity→Joy"],
  },
  {
    name: "EDM / Dance (Build-Drop Cycles)",
    sections: [
      "Intro",
      "Break",
      "Build 1",
      "Drop",
      "Breakdown",
      "Build 2",
      "Drop",
      "Outro",
    ],
    hook: "drop = hook",
    chooseWhen: "four-on-the-floor; energy contour IS the song",
    arcs: ["Chaos→Control", "Ritual→Ascension"],
  },
  {
    name: "R&B / Soul (Vocal Space + Vamp)",
    sections: [
      "Intro",
      "Verse 1",
      "Pre-Chorus",
      "Chorus",
      "Verse 2",
      "Pre-Chorus",
      "Chorus",
      "Bridge",
      "Final Chorus",
      "Vamp",
    ],
    hook: "standard-to-early",
    chooseWhen: "vocal timbre, runs, groove lead",
    arcs: ["Ritual→Ascension"],
  },
  {
    name: "Cinematic Trailer / Hybrid Orchestral Rock (Three-Act)",
    sections: ["Act I Setup", "Act II Build", "Act III Climax", "Aftermath"],
    hook: "early motif statement",
    chooseWhen: "orchestral + hybrid percussion; trailer-ready",
    arcs: ["Confrontation→Resolution"],
  },
];

export const STRUCTURE_MODS = [
  "Cold Open",
  "Cold Open Hook",
  "Add Pre-Chorus",
  "Add Post-Chorus",
  "Double Chorus Ending",
  "Remove Intro",
  "Remove Verse 2",
  "Remove Bridge",
  "Add Breakdown",
  "Add Vamp Outro",
  "Short-Form Hook Cut",
  "Radio Edit",
  "Streaming Hook Emphasis",
];

export function getTemplate(name: string) {
  return TEMPLATES.find((t) => t.name === name) ?? TEMPLATES[2];
}

export function applyMods(sections: string[], mods: string[]) {
  let next = [...sections];
  for (const mod of mods) {
    if (mod === "Cold Open" || mod === "Remove Intro") {
      next = next.filter((s) => s !== "Intro" && s !== "Hook Intro");
      if (!next[0]?.includes("Verse") && !next[0]?.includes("Hook")) {
        next = ["Cold Open", ...next];
      }
    }
    if (mod === "Cold Open Hook") {
      next = next.filter((s) => s !== "Intro" && s !== "Hook Intro");
      if (next[0] !== "Hook Intro") next = ["Hook Intro", ...next];
    }
    if (mod === "Add Pre-Chorus" && !next.includes("Pre-Chorus")) {
      const vi = next.findIndex((s) => s.startsWith("Verse"));
      if (vi >= 0) next.splice(vi + 1, 0, "Pre-Chorus");
    }
    if (mod === "Add Post-Chorus" && !next.includes("Post-Chorus")) {
      const ci = next.findIndex((s) => s === "Chorus");
      if (ci >= 0) next.splice(ci + 1, 0, "Post-Chorus");
    }
    if (mod === "Double Chorus Ending") {
      const last = next.lastIndexOf("Final Chorus");
      if (last >= 0) next.splice(last + 1, 0, "Final Chorus (varied)");
      else next.push("Final Chorus (varied)");
    }
    if (mod === "Remove Verse 2") next = next.filter((s) => s !== "Verse 2");
    if (mod === "Remove Bridge") next = next.filter((s) => s !== "Bridge");
    if (mod === "Add Breakdown" && !next.includes("Breakdown")) {
      const bi = next.findIndex((s) => s === "Bridge");
      if (bi >= 0) next.splice(bi, 0, "Breakdown");
      else next.splice(Math.max(next.length - 2, 0), 0, "Breakdown");
    }
    if (mod === "Add Vamp Outro") {
      next = next.filter((s) => s !== "Outro");
      next.push("Vamp");
    }
    if (mod === "Short-Form Hook Cut") {
      next = ["Hook Intro", "Chorus", "Post-Chorus"];
    }
  }
  return next;
}

export function selectTemplate(opts: {
  spine: string;
  performance: string;
}): string {
  const { spine, performance } = opts;
  if (performance === "trailer" || performance === "sync") {
    return "Cinematic Trailer / Hybrid Orchestral Rock (Three-Act)";
  }
  if (performance === "club") return "EDM / Dance (Build-Drop Cycles)";
  if (spine.startsWith("Hip-Hop")) return "Hip-Hop / Trap (Verse-Hook Core)";
  if (spine.startsWith("Metal")) return "Metal / Hard Rock (Riff-Module Logic)";
  if (spine.startsWith("Pop")) return "Modern Pop (Streaming-Era)";
  if (spine.startsWith("Country") || spine.startsWith("Dark Americana")) {
    return "Heartland Rock / Country Rock";
  }
  if (spine.startsWith("Singer")) return "Singer-Songwriter / Acoustic Ballad";
  if (spine.startsWith("Indie")) return "Indie / Alternative (Looser Forms)";
  if (spine.startsWith("R&B") || spine.startsWith("Gospel")) {
    return "R&B / Soul (Vocal Space + Vamp)";
  }
  if (spine.startsWith("EDM")) return "EDM / Dance (Build-Drop Cycles)";
  if (spine.startsWith("Cinematic")) {
    return "Cinematic Trailer / Hybrid Orchestral Rock (Three-Act)";
  }
  if (performance === "radio") return "Radio Rock / Alt Rock";
  if (performance === "short-form") return "Modern Pop (Streaming-Era)";
  return "Modern Pop (Streaming-Era)";
}
