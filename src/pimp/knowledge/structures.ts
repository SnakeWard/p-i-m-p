export interface StructureTemplate {
  name: string;
  sections: string[];
  hook: "early" | "standard" | "delayed";
  function: string;
  chooseWhen: string;
  anchors: string;
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
    hook: "standard",
    function: "Identity in verse storytelling; release in anthemic chorus.",
    chooseWhen: "guitar-driven spine; chorus earned but inevitable",
    anchors: "Since U Been Gone",
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
    hook: "standard",
    function: "Concrete narrative in verses; chorus states the truth.",
    chooseWhen: "lyric-first storytelling over steady 4/4",
    anchors: "Country Roads",
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
      "Tag",
    ],
    hook: "early",
    function: "Rapid identity; pre lifts; chorus arrival; post extends payoff.",
    chooseWhen: "maximal hook density, streaming intent",
    anchors: "Shape of You",
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
    hook: "standard",
    function: "Slow burn; sparse sections; single pivot unlocks release.",
    chooseWhen: "sparse instrumentation, introspection-first",
    anchors: "Yesterday",
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
    hook: "early",
    function: "Coherence with permission to deviate.",
    chooseWhen: "texture/attitude over repetition",
    anchors: "1979",
  },
  {
    name: "Metal / Hard Rock (Riff-Module Logic)",
    sections: [
      "Intro",
      "Verse 1",
      "Pre-Chorus",
      "Chorus",
      "Verse 2",
      "Pre-Chorus",
      "Chorus",
      "Breakdown",
      "Solo",
      "Final Chorus",
      "Outro",
    ],
    hook: "standard",
    function: "Riffs as identity modules; breakdown shifts weight.",
    chooseWhen: "riff anchors + aggressive percussion",
    anchors: "Enter Sandman",
  },
  {
    name: "Hip-Hop / Trap (Verse-Hook Core)",
    sections: ["Hook Intro", "Hook", "Verse 1", "Hook", "Verse 2", "Hook", "Bridge", "Hook"],
    hook: "early",
    function: "Hook is the headline; verses deliver detail and escalation.",
    chooseWhen: "bar-structured flow and hook loop",
    anchors: "verse-hook core",
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
    hook: "early",
    function: "Tension-and-release; the drop is the functional chorus.",
    chooseWhen: "four-on-the-floor; energy contour IS the song",
    anchors: "build-drop",
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
    hook: "standard",
    function: "Vocal nuance first; vamp is the catharsis zone.",
    chooseWhen: "vocal timbre, runs, and groove lead",
    anchors: "vamp outro",
  },
  {
    name: "Cinematic Trailer / Hybrid Orchestral Rock (Three-Act)",
    sections: ["Prologue", "Build", "Climax", "Aftermath"],
    hook: "early",
    function: "Three-act escalation; climax motif replaces the chorus.",
    chooseWhen: "orchestral + hybrid percussion; trailer-ready",
    anchors: "three-act trailer",
  },
];

export function getTemplate(name: string): StructureTemplate {
  return TEMPLATES.find((t) => t.name === name) ?? TEMPLATES[2];
}

export function selectTemplate(opts: {
  performanceTarget: string;
  genreTemplate: string;
  mode?: string;
}): StructureTemplate {
  const { performanceTarget, genreTemplate } = opts;
  if (performanceTarget === "trailer" || performanceTarget === "sync") {
    return getTemplate("Cinematic Trailer / Hybrid Orchestral Rock (Three-Act)");
  }
  if (performanceTarget === "club") {
    return getTemplate("EDM / Dance (Build-Drop Cycles)");
  }
  if (performanceTarget === "radio") {
    const g = getTemplate(genreTemplate);
    if (g.name.includes("Pop")) return getTemplate("Radio Rock / Alt Rock");
    return g;
  }
  if (performanceTarget === "short-form") {
    const g = getTemplate(genreTemplate);
    return g;
  }
  return getTemplate(genreTemplate);
}

export function applyMods(sections: string[], mods: string[]): string[] {
  let next = [...sections];
  for (const mod of mods) {
    if (mod === "Cold Open") {
      next = next.filter((s) => s !== "Intro");
      if (!next[0]?.toLowerCase().includes("hook") && !next[0]?.includes("Verse")) {
        next = ["Cold Open", ...next];
      }
    } else if (mod === "Cold Open Hook") {
      next = next.filter((s) => s !== "Intro" && s !== "Hook Intro");
      next = ["Hook Intro", ...next];
    } else if (mod === "Add Pre-Chorus" && !next.includes("Pre-Chorus")) {
      const v1 = next.indexOf("Verse 1");
      if (v1 >= 0) next.splice(v1 + 1, 0, "Pre-Chorus");
    } else if (mod === "Add Post-Chorus" && !next.includes("Post-Chorus")) {
      const c = next.indexOf("Chorus");
      if (c >= 0) next.splice(c + 1, 0, "Post-Chorus");
    } else if (mod === "Double Chorus Ending") {
      const last = next.lastIndexOf("Final Chorus");
      if (last >= 0) next.splice(last + 1, 0, "Final Chorus");
      else next.push("Final Chorus");
    } else if (mod === "Remove Verse 2") {
      next = next.filter((s) => s !== "Verse 2");
    } else if (mod === "Remove Bridge") {
      next = next.filter((s) => s !== "Bridge" && s !== "C-Section");
    } else if (mod === "Add Breakdown" && !next.includes("Breakdown")) {
      const br = next.indexOf("Bridge");
      if (br >= 0) next.splice(br, 0, "Breakdown");
      else next.splice(Math.max(0, next.length - 2), 0, "Breakdown");
    } else if (mod === "Add Vamp Outro") {
      next = next.filter((s) => s !== "Outro" && s !== "Tag");
      next.push("Vamp");
    } else if (mod === "Button Ending") {
      next = next.filter((s) => s !== "Outro");
      next.push("Button");
    }
  }
  return next;
}

export const STRUCTURE_MODS = [
  "Cold Open",
  "Cold Open Hook",
  "Add Pre-Chorus",
  "Add Post-Chorus",
  "Double Chorus Ending",
  "Remove Verse 2",
  "Remove Bridge",
  "Add Breakdown",
  "Add Vamp Outro",
  "Button Ending",
  "Short-Form Hook Cut",
] as const;
