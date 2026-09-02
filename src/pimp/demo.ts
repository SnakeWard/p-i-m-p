import type { Persona, Track } from "./types";
import { runTropeCheck } from "./engine/tropes";
import { buildStylePrompt } from "./engine/style";
import { buildRelease } from "./engine/release";

export const SEED_PERSONAS: Persona[] = [
  {
    id: "persona_vesper",
    name: "Vesper Hollow",
    voice:
      "female, late 20s, raspy but intimate, restrained then emotionally fragile; close-mic, worn, rarely belts until the last chorus",
    visual:
      "lantern dusk, dust, old wood, wide lonely frames, brimmed-hat shadow, no glamour",
    houseTemplate: "Heartland Rock / Country Rock",
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "persona_ash",
    name: "Ash Calder",
    voice:
      "male, early 30s, close-mic, worn, vulnerable; tight 2nd male harmony above lead in chorus; never glossy autotune",
    visual: "smoke, scratched metal, stage haze, hard edge highlights, heavy negative space",
    houseTemplate: "Radio Rock / Alt Rock",
    createdAt: "2026-07-01T00:00:00.000Z",
  },
];

const RENO_LYRICS = `[Intro]
(baritone guitar drone; no lyric)

[Verse 1]
(spoken-sung; dry, report-like)
Third shift ended and I still set two alarms
Your sister waved me down outside the pharmacy
The lease renewal's still unsigned on the counter
I kept the dog; you kept the reasons

[Chorus]
(release; forward vocal, harmony in last line)
The ring you pawned in Reno bought the amp I burned
Pawn ticket folded in the ashtray, dates I never learned
I drove it through the canyon with the windows down
And left the heat behind me in another town

[Verse 2]
(more grain; new facts only)
Glovebox still holds a lighter and your drugstore cross
Mileage on the Buick doesn't match the story you sold
I took the canyon road so I wouldn't pass the house
Left the amp where the heat could take it

[Chorus]
(release; forward vocal, harmony in last line)
The ring you pawned in Reno bought the amp I burned
Pawn ticket folded in the ashtray, dates I never learned
I drove it through the canyon with the windows down
And left the heat behind me in another town

[Bridge]
(drop the band; tense shift)
I'm gonna sell the lease before the first of the month
I won't set two alarms like you're still on the mail
I'll leave the dog with Mama if that's what it costs
And I will not come back for the reasons

[Final Chorus]
(consequence of the bridge; do not copy chorus 1)
The ring you pawned in Reno bought the amp I burned
Pawn ticket folded in the ashtray, dates I never learned
I drove it through the canyon with the windows down
I burned the amp and I did not turn around

[Outro]
(title once, dry)
(hard stop — no fade)
`;

export function seedTracks(): Track[] {
  const spec = {
    title: "The Ring You Pawned in Reno",
    persona: "Vesper Hollow",
    genreSpine: "Dark Americana / Gothic Country",
    genreColor: "Cinematic / Trailer",
    narrativeArc: "Confrontation → Resolution",
    emotionPath: "cold report → cracked confession",
    structureTemplate: "Heartland Rock / Country Rock",
    structureSections: [
      "Intro",
      "Verse 1",
      "Chorus",
      "Verse 2",
      "Chorus",
      "Bridge",
      "Final Chorus",
      "Outro",
    ],
    structureMods: [],
    vocalProtocol:
      "female lead, late 20s; raspy but intimate, restrained then fragile. Close-mic, worn; tight harmony above lead in chorus.",
    performanceTarget: "streaming" as const,
    tropeCheck: "standard" as const,
    tropeTone: "Plainspoken" as const,
    intent:
      "A woman in her late 20s. He pawned her ring in Reno to buy a guitar amp. She burned the amp, kept the dog, left town. Dark americana spine with cinematic scale. Concrete, no mythology.",
    toneFlags: ["darker", "cinematic"],
    personaAnchors: ["pharmacy counter", "unsigned lease", "pawn ticket"],
    personaForbidden: ["rise above", "shattered dreams", "neon lights"],
  };
  const persona = SEED_PERSONAS[0];
  const { report, lyrics } = runTropeCheck(RENO_LYRICS, spec);
  const stylePrompt = buildStylePrompt(spec, persona);
  const release = buildRelease(spec, lyrics, persona.name);
  return [
    {
      id: "track_reno",
      createdAt: "2026-07-12T18:04:00.000Z",
      updatedAt: "2026-07-12T18:04:00.000Z",
      spec,
      stylePrompt,
      lyrics,
      tropeReport: report,
      release,
      selfPlugged: true,
      providerUsed: "local",
      render: null,
    },
  ];
}
