export const MOOD_PALETTES: Record<string, string> = {
  wrathful: "crimson, black, ember orange",
  mournful: "slate blue, ash gray, cold white",
  hopeful: "gold, ivory, sky blue",
  haunted: "deep teal, charcoal, violet haze",
  triumphant: "gold, red, obsidian",
  intimate: "warm amber, dusty rose, midnight blue",
  apocalyptic: "burnt orange, ash black, sickly yellow",
  redemptive: "white, gold, indigo",
  yearning: "faded rose, dusk violet, pale gold",
  defiant: "steel gray, blood red, off-white",
  euphoric: "hot pink, electric blue, white bloom",
  menacing: "oxblood, near-black green, dirty brass",
  nostalgic: "sepia, cream, washed teal",
  serene: "seafoam, bone white, soft slate",
};

export const THEME_SYMBOLS: Record<string, string[]> = {
  betrayal: ["cracked halo", "broken chain", "black roses"],
  vengeance: ["smoke trail", "spent shell", "burning road"],
  redemption: ["light through storm clouds", "open hands", "distant cross"],
  grief: ["folded flag", "empty chair", "rain on glass"],
  obsession: ["watchful eye", "spiral smoke", "fractured mirror"],
  faith: ["sunbeam through darkness", "weathered Bible", "crown-of-thorns silhouette"],
  outlaw: ["six-gun silhouette", "dust road", "brimmed-hat shadow"],
  war: ["torn banner", "embers", "scarred steel"],
  love: ["joined hands", "candlelight", "soft bloom"],
  freedom: ["open highway at dawn", "cut rope", "birds off a wire"],
  addiction: ["amber bottle glow", "tangled IV line", "moth to porch light"],
  isolation: ["single lit window", "unplowed road", "one set of footprints"],
  "pride/fall": ["burning wings", "black sun", "cracked crown"],
  rebirth: ["green shoot in ash", "shed skin", "first light on floodwater"],
  home: ["porch light on", "worn key", "kitchen table set for two"],
};

export const NEGATIVE_PROMPT =
  "extra fingers, extra limbs, mangled hands, blurry face, generic neon city, floating random objects, text artifacts, watermark, signature, logo clutter, plastic skin, unreadable typography, oversaturated AI glow, deformed anatomy";

export function inferMood(emotionPath: string, flags: string[]): string {
  const blob = `${emotionPath} ${flags.join(" ")}`.toLowerCase();
  if (flags.includes("darker") || /menace|cold report/.test(blob)) return "haunted";
  if (flags.includes("more aggressive")) return "defiant";
  if (flags.includes("intimate") || flags.includes("stripped")) return "intimate";
  if (flags.includes("sacred")) return "redemptive";
  if (flags.includes("anthemic")) return "triumphant";
  if (flags.includes("cinematic")) return "haunted";
  if (/grief|mourn/.test(blob)) return "mournful";
  if (/joy|euphor/.test(blob)) return "euphoric";
  if (/whisper|yearn/.test(blob)) return "yearning";
  return "haunted";
}

export function inferThemes(intent: string, title: string): string[] {
  const t = `${intent} ${title}`.toLowerCase();
  const hits: string[] = [];
  const tests: [string, string][] = [
    ["betray", "betrayal"],
    ["revenge|venge|pawn|burned", "vengeance"],
    ["redeem|grace|forgive", "redemption"],
    ["grief|died|funeral|empty chair", "grief"],
    ["obsess|can't stop|watch", "obsession"],
    ["church|pray|faith|gospel", "faith"],
    ["outlaw|warrant|run", "outlaw"],
    ["war|soldier|tour", "war"],
    ["love|kiss|held", "love"],
    ["highway|free|left town", "freedom"],
    ["bottle|whiskey|needle|using", "addiction"],
    ["alone|empty house|one set", "isolation"],
    ["crown|fall|pride", "pride/fall"],
    ["born|again|ash", "rebirth"],
    ["porch|kitchen|home|lease", "home"],
  ];
  for (const [re, theme] of tests) {
    if (new RegExp(re).test(t)) hits.push(theme);
  }
  if (hits.length === 0) hits.push("isolation", "home");
  return hits.slice(0, 3);
}
