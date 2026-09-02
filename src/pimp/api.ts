import { createServerFn } from "@tanstack/react-start";
import { architectSpec, formatSpec } from "./engine/architect";
import { PIMP_SYSTEM } from "./engine/system-prompt";
import { findModel, fitPrompt, type ModelMetadata } from "./engine/render-route";
import {
  bytesToBase64,
  veniceComplete,
  veniceMusicModels,
  veniceQueue,
  veniceQuote,
  veniceRetrieve,
  type QueueBody,
} from "./audio/venice-client";
import type { SpecBlock } from "./types";

export type GenerateInput = {
  spec: SpecBlock;
  providerId: string;
  providerKey?: string;
  providerBaseUrl?: string;
  providerModel?: string;
  instruction?: string;
};

export type GenerateResult =
  | { ok: true; lyrics: string; stylePrompt: string; model: string; fallback: boolean }
  | { ok: false; error: string };

function extractJson(text: string) {
  const fenced = text.match(/```json\s*([\s\S]*?)```/);
  const raw = fenced?.[1] ?? text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(raw.slice(start, end + 1)) as {
      title?: string;
      stylePrompt?: string;
      lyrics?: string;
    };
  } catch {
    return null;
  }
}

async function chatOpenAICompat(opts: {
  baseUrl: string;
  apiKey: string;
  model: string;
  system: string;
  user: string;
}) {
  const res = await fetch(`${opts.baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${opts.apiKey}`,
    },
    body: JSON.stringify({
      model: opts.model,
      temperature: 0.8,
      max_tokens: 2200,
      messages: [
        { role: "system", content: opts.system },
        { role: "user", content: opts.user },
      ],
    }),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${err.slice(0, 240)}`);
  }
  const body = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return body.choices?.[0]?.message?.content ?? "";
}

async function chatGemini(opts: { apiKey: string; model: string; system: string; user: string }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${opts.model}:generateContent?key=${encodeURIComponent(opts.apiKey)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: opts.system }] },
      contents: [{ role: "user", parts: [{ text: opts.user }] }],
      generationConfig: { temperature: 0.8, maxOutputTokens: 2200 },
    }),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`Gemini ${res.status}: ${err.slice(0, 240)}`);
  }
  const body = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  return body.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
}

export const generateTrack = createServerFn({ method: "POST" })
  .validator((input: GenerateInput) => input)
  .handler(async ({ data }): Promise<GenerateResult> => {
    const spec = architectSpec(data.spec);
    const user = [
      formatSpec(spec),
      data.instruction ? `Additional instruction: ${data.instruction}` : "",
      "Write the full song now as JSON.",
    ]
      .filter(Boolean)
      .join("\n\n");

    const provider = data.providerId || "grok";

    try {
      let text = "";
      let model = data.providerModel || "grok-4.5";

      if (provider === "grok") {
        const apiKey = process.env.XAI_API_KEY;
        if (!apiKey) {
          return { ok: false, error: "Grok is not available in this environment." };
        }
        text = await chatOpenAICompat({
          baseUrl: "https://api.x.ai/v1",
          apiKey,
          model,
          system: PIMP_SYSTEM,
          user,
        });
      } else if (provider === "gemini") {
        if (!data.providerKey) return { ok: false, error: "Gemini API key missing." };
        model = data.providerModel || "gemini-2.5-flash";
        text = await chatGemini({
          apiKey: data.providerKey,
          model,
          system: PIMP_SYSTEM,
          user,
        });
      } else {
        if (!data.providerKey) return { ok: false, error: "Provider API key missing." };
        const base =
          data.providerBaseUrl ||
          (provider === "deepseek"
            ? "https://api.deepseek.com"
            : "https://api.openai.com/v1");
        model = data.providerModel || (provider === "deepseek" ? "deepseek-chat" : "gpt-4.1");
        text = await chatOpenAICompat({
          baseUrl: base,
          apiKey: data.providerKey,
          model,
          system: PIMP_SYSTEM,
          user,
        });
      }

      const parsed = extractJson(text);
      if (!parsed?.lyrics) {
        return { ok: false, error: "Model did not return lyrics JSON." };
      }
      return {
        ok: true,
        lyrics: parsed.lyrics,
        stylePrompt: (parsed.stylePrompt ?? "").slice(0, 1000),
        model,
        fallback: false,
      };
    } catch (e) {
      return {
        ok: false,
        error: e instanceof Error ? e.message : "Generation failed",
      };
    }
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

/* ------------------------------------------------------------------ */
/* K3-R — Venice audio render                                          */
/*                                                                     */
/* The Venice key is user-supplied and arrives with each call; there is */
/* no shared server key for audio, because audio spend is metered per   */
/* generation. HTTP goes through here so the key never rides in a       */
/* browser-origin request.                                              */
/* ------------------------------------------------------------------ */

function failure(e: unknown, fallback: string) {
  return { ok: false as const, error: e instanceof Error ? e.message : fallback };
}

export type QuoteAudioResult =
  | { ok: true; quote: number }
  | { ok: false; error: string };

export const quoteAudio = createServerFn({ method: "POST" })
  .validator((input: { apiKey: string; model: string; duration_seconds: number }) => input)
  .handler(async ({ data }): Promise<QuoteAudioResult> => {
    if (!findModel(data.model)) {
      return { ok: false, error: `Model ${data.model} is not in the song allowlist.` };
    }
    try {
      const quote = await veniceQuote({
        apiKey: data.apiKey || undefined,
        model: data.model,
        durationSeconds: data.duration_seconds,
      });
      return { ok: true, quote };
    } catch (e) {
      return failure(e, "Quote failed");
    }
  });

export type QueueAudioInput = {
  apiKey: string;
  model: string;
  prompt: string;
  lyrics_prompt?: string;
  duration_seconds?: number;
  force_instrumental?: boolean;
  loop?: boolean;
};

export type QueueAudioResult =
  | { ok: true; model: string; queue_id: string; status: string }
  | { ok: false; error: string };

export const queueAudio = createServerFn({ method: "POST" })
  .validator((input: QueueAudioInput) => input)
  .handler(async ({ data }): Promise<QueueAudioResult> => {
    const cap = findModel(data.model);
    if (!cap) return { ok: false, error: `Model ${data.model} is not in the song allowlist.` };
    if (!data.apiKey) return { ok: false, error: "Venice API key missing." };
    if (!data.prompt.trim()) return { ok: false, error: "Style prompt is empty." };

    // Last line of defence: rebuild the body from the capability table so an
    // unsupported optional key — or an over-long prompt — can never reach
    // Venice and 400 the request.
    const body: QueueBody = {
      model: cap.id,
      prompt: fitPrompt(data.prompt, cap.promptCharacterLimit).prompt,
    };

    if (cap.supportsDuration && typeof data.duration_seconds === "number") {
      if (cap.durationOptions && !cap.durationOptions.includes(data.duration_seconds)) {
        return {
          ok: false,
          error: `${cap.label} only accepts ${cap.durationOptions.join(", ")} seconds.`,
        };
      }
      body.duration_seconds = data.duration_seconds;
    }
    if (cap.supportsLyrics && data.lyrics_prompt?.trim()) {
      body.lyrics_prompt = data.lyrics_prompt;
    }
    if (cap.supportsInstrumental && data.force_instrumental === true) {
      body.force_instrumental = true;
    }
    if (cap.supportsLoop && data.loop === true) {
      body.loop = true;
    }

    try {
      const out = await veniceQueue({ apiKey: data.apiKey, body });
      return { ok: true, model: out.model, queue_id: out.queue_id, status: out.status };
    } catch (e) {
      return failure(e, "Queue failed");
    }
  });

export type RetrieveAudioResult =
  | { ok: true; state: "processing"; average_execution_time: number; execution_duration: number }
  | { ok: true; state: "ready"; mime: string; audioBase64: string }
  | { ok: false; error: string };

/**
 * ONE shot. The client owns the poll interval so a reload can resume a job
 * from its stored {model, queueId} instead of holding a request open.
 */
export const retrieveAudio = createServerFn({ method: "POST" })
  .validator((input: { apiKey: string; model: string; queue_id: string }) => input)
  .handler(async ({ data }): Promise<RetrieveAudioResult> => {
    if (!data.apiKey) return { ok: false, error: "Venice API key missing." };
    try {
      const out = await veniceRetrieve({
        apiKey: data.apiKey,
        model: data.model,
        queueId: data.queue_id,
      });
      if (out.state === "processing") {
        return {
          ok: true,
          state: "processing",
          average_execution_time: out.averageExecutionTime,
          execution_duration: out.executionDuration,
        };
      }
      return { ok: true, state: "ready", mime: out.mime, audioBase64: bytesToBase64(out.bytes) };
    } catch (e) {
      return failure(e, "Retrieve failed");
    }
  });

export type CompleteAudioResult = { ok: true } | { ok: false; error: string };

export const completeAudio = createServerFn({ method: "POST" })
  .validator((input: { apiKey: string; model: string; queue_id: string }) => input)
  .handler(async ({ data }): Promise<CompleteAudioResult> => {
    if (!data.apiKey) return { ok: false, error: "Venice API key missing." };
    try {
      await veniceComplete({
        apiKey: data.apiKey,
        model: data.model,
        queueId: data.queue_id,
      });
      return { ok: true };
    } catch (e) {
      return failure(e, "Complete failed");
    }
  });

export type MusicModelsResult =
  | { ok: true; models: ModelMetadata[] }
  | { ok: false; error: string };

/** Capability discovery. The static table stays authoritative if this fails. */
export const musicModels = createServerFn({ method: "POST" })
  .validator((input: { apiKey: string }) => input)
  .handler(async ({ data }): Promise<MusicModelsResult> => {
    if (!data.apiKey) return { ok: false, error: "Venice API key missing." };
    try {
      const models = await veniceMusicModels({ apiKey: data.apiKey });
      return { ok: true, models: models.filter((m) => m.id && findModel(m.id)) };
    } catch (e) {
      return failure(e, "Model discovery failed");
    }
  });
