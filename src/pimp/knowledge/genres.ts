export interface GenreProfile {
  name: string;
  rhythm: string;
  instruments: string;
  harmony: string;
  vocal: string;
  defaultTemplate: string;
  tropeTier: "STRICT" | "STANDARD" | "LENIENT";
  visuals: string;
  fusion: string;
}

export const GENRES: GenreProfile[] = [
  {
    name: "Pop (streaming-era)",
    rhythm: "tight, quantized, groove-forward; four-on-the-floor or trap-lite",
    instruments: "synth beds, processed guitars, programmed drums, sub bass",
    harmony: "diatonic loops, 4-chord cycles, bright pre-chorus lifts",
    vocal: "polished, forward, stacked harmonies in hooks",
    defaultTemplate: "Modern Pop (Streaming-Era)",
    tropeTier: "STRICT",
    visuals: "high-gloss, saturated palette, face-forward",
    fusion: "near-universal color; as spine demands early hook",
  },
  {
    name: "Indie / Alternative",
    rhythm: "looser, human, syncopation over grid",
    instruments: "jangly or textural guitars, analog synths, room-sound drums",
    harmony: "modal color, borrowed chords, unresolved cadences",
    vocal: "idiosyncratic timbre; intimacy or detachment",
    defaultTemplate: "Indie / Alternative (Looser Forms)",
    tropeTier: "STRICT",
    visuals: "film grain, muted palettes, negative space",
    fusion: "best as spine with unexpected color",
  },
  {
    name: "Metal / Hard Rock",
    rhythm: "riff-locked; aggressive kick; half-time breakdowns",
    instruments: "high-gain guitars, double-kick or heavy backbeat, low-tuned bass",
    harmony: "minor/modal, power-chord architecture, chromatic tension",
    vocal: "declare clean/harsh spectrum; dominance or catharsis",
    defaultTemplate: "Metal / Hard Rock (Riff-Module Logic)",
    tropeTier: "LENIENT",
    visuals: "fire, ash, rust, cracked stone; violent contrast",
    fusion: "spine keeps riffs and rhythm",
  },
  {
    name: "Hip-Hop / Trap",
    rhythm: "bar-structured flow, hi-hat subdivisions, 808 patterns",
    instruments: "808 bass, sparse loops, space as an instrument",
    harmony: "minimal, loop-based; mood from timbre",
    vocal: "flow identity first; sung hooks mark chorus",
    defaultTemplate: "Hip-Hop / Trap (Verse-Hook Core)",
    tropeTier: "STANDARD",
    visuals: "location-real or luxury-symbolic; hard contrast",
    fusion: "as spine owns rhythm AND vocal cadence",
  },
  {
    name: "Country / Heartland Rock",
    rhythm: "steady 4/4, backbeat honesty, train or shuffle",
    instruments: "acoustic/Telecaster, pedal steel, fiddle, real drums",
    harmony: "I-IV-V with relative-minor turns",
    vocal: "plainspoken storyteller, title-thesis choruses",
    defaultTemplate: "Heartland Rock / Country Rock",
    tropeTier: "STANDARD",
    visuals: "grain, sun fade, golden hour, story-first",
    fusion: "spine for storytelling hybrids",
  },
  {
    name: "R&B / Soul",
    rhythm: "pocket-deep groove, swung sixteenths",
    instruments: "electric piano, clean guitar chanks, round bass",
    harmony: "extended chords, gospel movement, chromatic passing",
    vocal: "lead instrument — runs, ad-libs, call-and-response",
    defaultTemplate: "R&B / Soul (Vocal Space + Vamp)",
    tropeTier: "STANDARD",
    visuals: "warm amber/midnight, intimate framing",
    fusion: "color that gifts harmony and vocal behavior",
  },
  {
    name: "EDM / Dance",
    rhythm: "four-on-the-floor or genre-specific grid",
    instruments: "synth risers, sidechained pads, sub drops, FX sweeps",
    harmony: "loop-based; tension via filter and arrangement",
    vocal: "topline hooks, chopped vocal textures",
    defaultTemplate: "EDM / Dance (Build-Drop Cycles)",
    tropeTier: "STANDARD",
    visuals: "neon bloom, luminous atmosphere, symmetrical scale",
    fusion: "spine owns rhythm and build-drop architecture",
  },
  {
    name: "Cinematic / Trailer",
    rhythm: "hit-based; percussion as impact architecture",
    instruments: "orchestral sections + sound design + optional rock edge",
    harmony: "modal grandeur, ostinato builds, delayed resolution",
    vocal: "optional choirs, wordless motifs, processed voice",
    defaultTemplate: "Cinematic Trailer / Hybrid Orchestral Rock (Three-Act)",
    tropeTier: "LENIENT",
    visuals: "widescreen scale, atmospheric depth, monumental subject",
    fusion: "color for scale; as spine, partners supply texture only",
  },
  {
    name: "Singer-Songwriter / Folk",
    rhythm: "rubato-tolerant, fingerpicked or brushed pulse",
    instruments: "one anchor instrument + sparse color",
    harmony: "open-voiced folk shapes, gentle suspensions",
    vocal: "close-mic intimacy, breath detail",
    defaultTemplate: "Singer-Songwriter / Acoustic Ballad",
    tropeTier: "STRICT",
    visuals: "natural light, handmade texture, solitary scale",
    fusion: "spine for Ballad Mode",
  },
  {
    name: "Dark Americana / Gothic Country",
    rhythm: "slow stomp, funeral waltz, chain-gang pulse",
    instruments: "baritone guitar, banjo/dobro dark, upright bass, drones",
    harmony: "minor keys, drones, hymn bones",
    vocal: "low, weathered, testimonial",
    defaultTemplate: "Heartland Rock / Country Rock",
    tropeTier: "STANDARD",
    visuals: "dust, old wood, fog, lantern dusk",
    fusion: "spine for gothic storytelling",
  },
  {
    name: "Synthwave / Retrowave",
    rhythm: "motorik 4/4 or gated 80s backbeat, arp pulse",
    instruments: "analog polysynths, FM bells, gated reverb drums",
    harmony: "minor-key nostalgia, suspended pads, filter movement",
    vocal: "optional; reverb-washed, restrained, or vocoded",
    defaultTemplate: "Modern Pop (Streaming-Era)",
    tropeTier: "STANDARD",
    visuals: "neon bloom, glass reflection, horizon symmetry",
    fusion: "color layer par excellence",
  },
  {
    name: "Gospel",
    rhythm: "clap-backbeat, swung triplets, tempo lifts",
    instruments: "Hammond organ, piano, choir, live kit, tambourine",
    harmony: "rich extended movement, walk-ups, modulation lifts",
    vocal: "lead + choir call-and-response, vamp endings",
    defaultTemplate: "R&B / Soul (Vocal Space + Vamp)",
    tropeTier: "STANDARD",
    visuals: "light rays, soft cloth, uplifted vertical framing",
    fusion: "color that sanctifies; as spine owns vamp",
  },
];

export function getGenre(name: string) {
  return GENRES.find((g) => g.name === name) ?? GENRES[0];
}
