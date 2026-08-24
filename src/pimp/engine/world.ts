export interface World {
  place: string;
  place2: string;
  object: string;
  object2: string;
  object3: string;
  person: string;
  time: string;
  surface: string;
  kept: string;
  cost: string;
  paper: string;
  vehicle: string;
  habit: string;
  action: string;
  destination: string;
  titleHint: string;
}

const GENRE_PALETTES: Record<string, Partial<World>> = {
  "Dark Americana / Gothic Country": {
    place: "pharmacy lot",
    place2: "canyon",
    object: "pawn ticket",
    object2: "amp",
    object3: "unsigned lease",
    person: "your sister",
    time: "third shift",
    surface: "counter",
    kept: "dog",
    cost: "reasons",
    paper: "lease renewal",
    vehicle: "the Buick",
    habit: "set two alarms",
    action: "burned the amp",
    destination: "another town",
  },
  "Country / Heartland Rock": {
    place: "county line",
    place2: "feed store",
    object: "porch light",
    object2: "worn key",
    object3: "kitchen table",
    person: "Mama",
    time: "golden hour",
    surface: "tailgate",
    kept: "truck",
    cost: "the house",
    paper: "title slip",
    vehicle: "the F-150",
    habit: "leave the porch light on",
    action: "crossed the county line",
    destination: "the next county",
  },
  "Indie / Alternative": {
    place: "laundromat",
    place2: "roof of the walk-up",
    object: "secondhand coat",
    object2: "unpaid tab",
    object3: "cracked phone",
    person: "the night clerk",
    time: "2 a.m.",
    surface: "windowsill",
    kept: "records",
    cost: "the spare key",
    paper: "eviction notice",
    vehicle: "the night bus",
    habit: "replay the last voicemail",
    action: "left the key in the mail slot",
    destination: "the river walk",
  },
  "Metal / Hard Rock": {
    place: "loading dock",
    place2: "underpass",
    object: "cracked windshield",
    object2: "rusted chain",
    object3: "paystub",
    person: "the foreman",
    time: "last call",
    surface: "workbench",
    kept: "the debt",
    cost: "the year",
    paper: "write-up",
    vehicle: "the van",
    habit: "count the dents",
    action: "cut the chain",
    destination: "the county line",
  },
  "Hip-Hop / Trap": {
    place: "corner store",
    place2: "fourth-floor walk-up",
    object: "receipt",
    object2: "old Nokia",
    object3: "lockbox",
    person: "my cousin",
    time: "late shift",
    surface: "stoop",
    kept: "the books",
    cost: "the block",
    paper: "lease",
    vehicle: "the Camry",
    habit: "check the peephole twice",
    action: "moved the lockbox",
    destination: "out of zip",
  },
  "Pop (streaming-era)": {
    place: "parking garage",
    place2: "balcony",
    object: "jacket on the chair",
    object2: "half-charged phone",
    object3: "toothbrush",
    person: "your roommate",
    time: "Tuesday",
    surface: "bathroom tile",
    kept: "the plants",
    cost: "the password",
    paper: "the note on the fridge",
    vehicle: "the rideshare",
    habit: "leave read receipts off",
    action: "changed the lock code",
    destination: "the east side",
  },
  "R&B / Soul": {
    place: "kitchen at midnight",
    place2: "back stair",
    object: "cold plate",
    object2: "silk robe",
    object3: "house key",
    person: "your auntie",
    time: "after last call",
    surface: "piano lid",
    kept: "the ring",
    cost: "the apology",
    paper: "the letter",
    vehicle: "the night train",
    habit: "warm the plate anyway",
    action: "left the key on the lid",
    destination: "my mother's street",
  },
  "Singer-Songwriter / Folk": {
    place: "kitchen table",
    place2: "dirt road",
    object: "chipped mug",
    object2: "capo",
    object3: "unopened mail",
    person: "the neighbor",
    time: "first frost",
    surface: "windowsill",
    kept: "the dog",
    cost: "the silence",
    paper: "the letter I didn't send",
    vehicle: "the station wagon",
    habit: "set a second mug out",
    action: "drove past the house",
    destination: "the reservoir",
  },
  "Gospel": {
    place: "third pew",
    place2: "riverbank",
    object: "worn hymnal",
    object2: "white shirt",
    object3: "collection plate",
    person: "Deacon James",
    time: "altar call",
    surface: "oak rail",
    kept: "the hymn",
    cost: "the old name",
    paper: "the program",
    vehicle: "the church van",
    habit: "stand on the last verse",
    action: "walked the aisle",
    destination: "the water",
  },
  "EDM / Dance": {
    place: "service hallway",
    place2: "roof above the club",
    object: "laminate",
    object2: "dead battery",
    object3: "earplugs",
    person: "the door girl",
    time: "hour four",
    surface: "flight case",
    kept: "the USBs",
    cost: "the night",
    paper: "the set list",
    vehicle: "the sprinter",
    habit: "check the booth twice",
    action: "killed the lights",
    destination: "the afters",
  },
  "Cinematic / Trailer": {
    place: "ridge road",
    place2: "empty terminal",
    object: "torn banner",
    object2: "last match",
    object3: "folded map",
    person: "the radio",
    time: "before dawn",
    surface: "hood of the car",
    kept: "the photograph",
    cost: "the city behind",
    paper: "orders",
    vehicle: "the convoy",
    habit: "watch the ridgeline",
    action: "crossed the river",
    destination: "the far shore",
  },
  "Synthwave / Retrowave": {
    place: "overpass",
    place2: "closed arcade",
    object: "dashboard clock",
    object2: "cassette",
    object3: "motel key",
    person: "the night clerk",
    time: "3:11 a.m.",
    surface: "hood",
    kept: "the tape",
    cost: "the year",
    paper: "the speeding ticket",
    vehicle: "the RX-7",
    habit: "rewind to the same song",
    action: "left the city lights",
    destination: "the coast highway",
  },
};

const DEFAULT: World = {
  place: "parking lot",
  place2: "county line",
  object: "jacket",
  object2: "key",
  object3: "unopened mail",
  person: "your sister",
  time: "last shift",
  surface: "counter",
  kept: "the dog",
  cost: "the reasons",
  paper: "the note",
  vehicle: "the car",
  habit: "set two alarms",
  action: "left the key",
  destination: "another town",
  titleHint: "",
};

function pickQuoted(intent: string): string | null {
  const m = intent.match(/[“"]([^”"]{3,48})[”"]/);
  return m?.[1] ?? null;
}

function firstProper(intent: string): string | null {
  const m = intent.match(/\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)\b/g);
  const skip = new Set([
    "I",
    "A",
    "The",
    "My",
    "Your",
    "And",
    "But",
    "When",
    "Where",
    "A",
    "An",
  ]);
  const hits = (m ?? []).filter((w) => !skip.has(w) && w.length > 2);
  return hits[0] ?? null;
}

export function extractWorld(intent: string, spine: string): World {
  const base = {
    ...DEFAULT,
    ...(GENRE_PALETTES[spine] ?? GENRE_PALETTES["Pop (streaming-era)"]),
  } as World;
  const t = intent.trim();
  if (!t) return { ...base, titleHint: "" };

  const quoted = pickQuoted(t);
  const proper = firstProper(t);
  const lower = t.toLowerCase();

  const placeMatch = lower.match(
    /\b(?:in|at|outside|near|from)\s+(?:the\s+)?([a-z][a-z0-9' -]{2,28})/,
  );
  const objMatch = lower.match(
    /\b(?:pawned|burned|left|kept|sold|lost|found|wore|drove)\s+(?:the\s+|your\s+|my\s+)?([a-z][a-z0-9' -]{2,24})/,
  );

  if (proper && /reno|dallas|memphis|tulsa|cairo|oslo|tokyo|paris/i.test(proper)) {
    base.place = proper;
  } else if (proper && proper.length <= 16) {
    base.place2 = base.place2 || proper;
  }
  if (placeMatch) base.place = placeMatch[1].trim();
  if (objMatch) base.object = objMatch[1].trim();
  if (/ring/.test(lower)) base.object = "ring";
  if (/amp/.test(lower)) base.object2 = "amp";
  if (/dog/.test(lower)) base.kept = "the dog";
  if (/lease/.test(lower)) base.paper = "lease renewal";
  if (/sister/.test(lower)) base.person = "your sister";
  if (/pawn/.test(lower)) base.action = "pawned the ring";
  if (/burn/.test(lower)) base.action = "burned the amp";

  base.titleHint = quoted ?? (proper && objMatch ? `${base.object}` : "");
  return base;
}

export function worldNouns(world: World): string[] {
  return [
    world.place,
    world.place2,
    world.object,
    world.object2,
    world.object3,
    world.person,
    world.time,
    world.surface,
    world.kept,
    world.paper,
    world.vehicle,
  ].filter(Boolean);
}
