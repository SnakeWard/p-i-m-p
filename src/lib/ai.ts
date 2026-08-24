import { createServerFn } from "@tanstack/react-start";
import type { SpecBlock } from "@/pimp/types";

const SYSTEM = `You are P.I.M.P. — the Psycho-Intelligence Musical Protocol lyric and style engine.
Music = Identity + Tension + Release. One psychological intent per song.
Output STRICT JSON only, no markdown fences, matching:
{
  "title": string,
  "vocalProtocol": string,
  "stylePrompt": string,
  "lyrics": string
}

Rules for lyrics:
- Section tags in [brackets] on their own lines: [Verse 1], [Chorus], [Bridge], [Final Chorus].
- Staging notes in (parentheses), short, NON-lyrical. Never rhyme in directives.
- Concrete physical grounding. CDS 3+: named objects, times, places, irreversible costs.
- Verse 2 MUST add at least two concrete nouns absent from Verse 1.
- Bridge must contain a tense shift or stated intention ("I will / I won't / I'm gonna" + a specific act).
- Final chorus must vary a line to show the bridge's consequence. Never identical to chorus 1.
- FORBIDDEN: phoenix, Icarus, juggernaut, "rise above", "shattered dreams", "whispers in the dark", "echoes of the night", "gonna make it", "break free", "we're all in this together", "fire in my soul", "can't breathe/feel", epiphany-in-bridge ("and then I realized"), abstract noun + human verb ("hope flies", "dreams bleed").
- Do not write lyrics "in the style of" a specific real song.
- Title is the hook. Chorus states the title-thesis with a concrete cost.
- Style prompt ≤ 1000 characters. Production brief, not adjectives. Who is singing, emotion path, genre spine vs color, mix behavior, one short negative clause.

Honor the given spec: genre spine owns rhythm+structure; color owns texture only.`;

export const aiAvailable = createServerFn({ method: "GET" }).handler(async () => {
  return { ok: Boolean(process.env.XAI_API_KEY) };
});

export const generateTrack = createServerFn({ method: "POST" })
  .validator((input: { spec: SpecBlock; intent: string }) => input)
  .handler(async ({ data }) => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false as const, error: "Grok writer is not available here. Use Local composer." };

    const spec = data.spec;
    const user = [
      `INTENT: ${data.intent || spec.intent}`,
      `TITLE (may revise if weak): ${spec.title || "(invent a concrete title)"}`,
      `PERSONA / VOCAL: ${spec.persona} — ${spec.vocalProtocol}`,
      `GENRE SPINE: ${spec.genreSpine}`,
      `GENRE COLOR: ${spec.genreColor}`,
      `ARC: ${spec.narrativeArc}`,
      `EMOTION PATH: ${spec.emotionPath}`,
      `STRUCTURE: ${spec.structureSections.join(" → ") || spec.structureTemplate}`,
      `TROPETONE: ${spec.tropeTone}`,
      `TONE FLAGS: ${spec.toneFlags.join(", ") || "none"}`,
      `PERFORMANCE: ${spec.performanceTarget}`,
      `Write the full lyric to the structure. Keep syllable-singable lines. No filler.`,
    ].join("\n");

    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        temperature: 0.8,
        max_tokens: 2200,
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: user },
        ],
      }),
    });
    if (!res.ok) {
      return { ok: false as const, error: `Writer error ${res.status}` };
    }
    const body = (await res.json()) as {
      choices: { message: { content: string } }[];
    };
    const text = body.choices[0]?.message.content ?? "";
    const parsed = parseJson(text);
    if (!parsed?.lyrics) {
      return { ok: false as const, error: "Writer returned an unreadable draft. Try Local composer." };
    }
    return {
      ok: true as const,
      title: parsed.title ?? spec.title,
      vocalProtocol: parsed.vocalProtocol ?? spec.vocalProtocol,
      stylePrompt: parsed.stylePrompt ?? "",
      lyrics: parsed.lyrics,
    };
  });

export const generateCover = createServerFn({ method: "POST" })
  .validator((input: { prompt: string; negative: string }) => input)
  .handler(async ({ data }) => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false as const, error: "Cover generation is not available here." };
    const res = await fetch("https://api.x.ai/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-imagine-image",
        prompt: `${data.prompt}. Avoid: ${data.negative}`,
        n: 1,
        resolution: "1k",
        aspect_ratio: "1:1",
        response_format: "b64_json",
      }),
    });
    if (!res.ok) {
      return { ok: false as const, error: `Cover error ${res.status}` };
    }
    const body = (await res.json()) as { data?: { b64_json?: string; url?: string }[] };
    const b64 = body.data?.[0]?.b64_json;
    const url = body.data?.[0]?.url;
    if (b64) return { ok: true as const, image: `data:image/png;base64,${b64}` };
    if (url) return { ok: true as const, image: url };
    return { ok: false as const, error: "No image returned." };
  });

function parseJson(text: string): {
  title?: string;
  vocalProtocol?: string;
  stylePrompt?: string;
  lyrics?: string;
} | null {
  const stripped = text.replace(/```json|```/g, "").trim();
  const start = stripped.indexOf("{");
  const end = stripped.lastIndexOf("}");
  if (start < 0 || end < 0) return null;
  try {
    return JSON.parse(stripped.slice(start, end + 1)) as {
      title?: string;
      vocalProtocol?: string;
      stylePrompt?: string;
      lyrics?: string;
    };
  } catch {
    return null;
  }
}
