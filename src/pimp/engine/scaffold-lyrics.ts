import type { SpecBlock } from "../types";

export function scaffoldLyrics(spec: SpecBlock) {
  const title = spec.title || "Unsigned Lease";
  const sections = spec.structureSections.length
    ? spec.structureSections
    : ["Verse 1", "Chorus", "Verse 2", "Chorus", "Bridge", "Final Chorus"];

  const verse1 = [
    "[Verse 1]",
    "(close-mic; dry room)",
    "Third shift ended and I still set two alarms",
    "Your sister waved me down outside the pharmacy",
    "The lease renewal's still unsigned on the counter",
    "I keep the mug you chipped in December",
  ];
  const verse2 = [
    "[Verse 2]",
    "(add bass; still restrained)",
    "The spare key hangs on the meter by the alley",
    "I paid the dog's shot with the ring you pawned",
    "Voicemail 14 still says you'll be late",
    "I eat the cold side of the casserole anyway",
  ];
  const chorus = [
    "[Chorus]",
    "(widen; stacked air, not belted)",
    `${title} on the Formica, curling at the edge`,
    "I initial every line except the one with your name",
    "The porch light stays on for a truck that doesn't turn in",
    `${title} — I keep signing around it`,
  ];
  const finalChorus = [
    "[Final Chorus]",
    "(consequence of the bridge; vary last line)",
    `${title} on the Formica, curling at the edge`,
    "I initial every line except the one with your name",
    "The porch light stays on for a truck that doesn't turn in",
    `${title} — I leave the pen and lock the door`,
  ];
  const bridge = [
    "[Bridge]",
    "(pull back; spoken-sung)",
    "I will drop the spare key in the mailbox Tuesday",
    "I won't set the second alarm after that",
  ];
  const hook = [
    "[Hook]",
    `${title} — I keep signing around it`,
    "Porch light on, truck never turns in",
  ];
  const extra: Record<string, string[]> = {
    Intro: ["[Intro]", "(instrumental motif; no lyric)"],
    "Hook Intro": ["[Hook Intro]", `${title} — I keep signing around it`],
    "Pre-Chorus": [
      "[Pre-Chorus]",
      "(lift: drums tighten)",
      "The kettle clicks and I still wait for two cups",
    ],
    "Post-Chorus": ["[Post-Chorus]", "(hook tag, no new story)", "Signing around it"],
    Outro: ["[Outro]", "(button)", "I leave the pen."],
    Vamp: ["[Vamp]", "(ad-lib space)", "Leave the pen — leave the pen"],
    Breakdown: ["[Breakdown]", "(half-weight)", "Mailbox Tuesday"],
    "Act I Setup": ["[Act I Setup]", "State the destination: I leave Tuesday."],
    "Act II Build": ["[Act II Build]", ...verse1.slice(2)],
    "Act III Climax": ["[Act III Climax]", ...chorus.slice(2)],
    Aftermath: ["[Aftermath]", "The second alarm stays dark."],
    Drop: ["[Drop]", title],
    "Build 1": ["[Build 1]", "(filter opens)", "Two alarms, one house"],
    "Build 2": ["[Build 2]", "(bigger)", "Mailbox Tuesday"],
    Break: ["[Break]", "(theme)", title],
    "C-Section": ["[C-Section]", "New world: I eat at the counter facing the lot"],
    Instrumental: ["[Instrumental]"],
    Solo: ["[Solo]"],
    "Cold Open": ["[Cold Open]", "Third shift ended and I still set two alarms"],
  };

  const out: string[] = [];
  const usedChorus = { n: 0 };
  for (const name of sections) {
    if (name === "Verse 1") out.push(...verse1);
    else if (name === "Verse 2") out.push(...verse2);
    else if (name === "Verse 3") {
      out.push(
        "[Verse 3]",
        "The landlord's card is still in the junk drawer",
        "I write my new address on the back of a receipt",
      );
    } else if (name === "Chorus" || name === "Hook") {
      usedChorus.n += 1;
      out.push(...(name === "Hook" ? hook : chorus));
    } else if (name.startsWith("Final Chorus")) out.push(...finalChorus);
    else if (name === "Bridge") out.push(...bridge);
    else if (extra[name]) out.push(...extra[name]);
    else out.push(`[${name}]`, `(${spec.emotionPath})`, title);
    out.push("");
  }
  return out.join("\n").trim();
}
