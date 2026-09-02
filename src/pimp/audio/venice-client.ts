import type { ModelMetadata } from "../engine/render-route";

/**
 * Thin Venice audio client. Runs server-side only (called from server fns in
 * `src/pimp/api.ts`) so the user's key never rides in a browser request.
 *
 * The landmine this file exists to contain: `/audio/retrieve` answers with
 * JSON while the job is running and with RAW AUDIO BYTES when it is done.
 * There is no `audio_url` and no `"completed"` status. Always branch on
 * Content-Type before touching the body.
 */

export const VENICE_BASE = "https://api.venice.ai/api/v1";

export class VeniceError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "VeniceError";
    this.status = status;
  }
}

export type FetchLike = (url: string, init?: RequestInit) => Promise<Response>;

/** Strip parameters: "audio/mpeg; charset=binary" → "audio/mpeg". */
export function parseContentType(raw: string | null): string {
  return (raw ?? "").split(";")[0]!.trim().toLowerCase();
}

export function isAudioMime(mime: string): boolean {
  return mime.startsWith("audio/");
}

/** File extension for a download, derived from the mime Venice actually sent. */
export function extensionForMime(mime: string | null): string {
  switch (parseContentType(mime)) {
    case "audio/wav":
      return "wav";
    case "audio/flac":
      return "flac";
    case "audio/mpeg":
    default:
      return "mp3";
  }
}

async function errorFrom(res: Response): Promise<VeniceError> {
  if (res.status === 404) {
    return new VeniceError("Render expired or was deleted on Venice (404).", 404);
  }
  const body = await res.text().catch(() => "");
  return new VeniceError(`Venice ${res.status}: ${body.slice(0, 240)}`, res.status);
}

function headers(apiKey?: string): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (apiKey) h.Authorization = `Bearer ${apiKey}`;
  return h;
}

export interface QueueBody {
  model: string;
  prompt: string;
  lyrics_prompt?: string;
  duration_seconds?: number;
  force_instrumental?: boolean;
  loop?: boolean;
}

export interface QueueResult {
  model: string;
  queue_id: string;
  status: string;
}

/** POST /audio/quote → estimated USD. Auth is not required here. */
export async function veniceQuote(
  opts: { apiKey?: string; model: string; durationSeconds: number },
  fetchImpl: FetchLike = fetch,
): Promise<number> {
  const res = await fetchImpl(`${VENICE_BASE}/audio/quote`, {
    method: "POST",
    headers: headers(opts.apiKey),
    body: JSON.stringify({ model: opts.model, duration_seconds: opts.durationSeconds }),
  });
  if (!res.ok) throw await errorFrom(res);
  const body = (await res.json()) as { quote?: number };
  if (typeof body.quote !== "number") throw new VeniceError("Quote response had no price.", 200);
  return body.quote;
}

/**
 * POST /audio/queue. The caller is responsible for having already stripped
 * fields the model does not support — this sends the body as given.
 */
export async function veniceQueue(
  opts: { apiKey: string; body: QueueBody },
  fetchImpl: FetchLike = fetch,
): Promise<QueueResult> {
  const res = await fetchImpl(`${VENICE_BASE}/audio/queue`, {
    method: "POST",
    headers: headers(opts.apiKey),
    body: JSON.stringify(opts.body),
  });
  if (!res.ok) throw await errorFrom(res);
  const body = (await res.json()) as Partial<QueueResult>;
  if (!body.queue_id) throw new VeniceError("Queue response had no queue_id.", 200);
  return {
    model: body.model ?? opts.body.model,
    queue_id: body.queue_id,
    status: body.status ?? "QUEUED",
  };
}

export type RetrieveOutcome =
  | { state: "processing"; averageExecutionTime: number; executionDuration: number }
  | { state: "ready"; mime: string; bytes: ArrayBuffer };

/**
 * POST /audio/retrieve — ONE shot. No polling loop lives here; the client
 * drives the interval so a reload can resume from {model, queueId}.
 *
 * Sends delete_media_on_completion: false so the remote copy survives until we
 * have written the bytes locally and explicitly called /audio/complete.
 */
export async function veniceRetrieve(
  opts: { apiKey: string; model: string; queueId: string },
  fetchImpl: FetchLike = fetch,
): Promise<RetrieveOutcome> {
  const res = await fetchImpl(`${VENICE_BASE}/audio/retrieve`, {
    method: "POST",
    headers: headers(opts.apiKey),
    body: JSON.stringify({
      model: opts.model,
      queue_id: opts.queueId,
      delete_media_on_completion: false,
    }),
  });
  if (!res.ok) throw await errorFrom(res);

  const mime = parseContentType(res.headers.get("content-type"));

  if (isAudioMime(mime)) {
    return { state: "ready", mime, bytes: await res.arrayBuffer() };
  }

  if (mime === "application/json") {
    const body = (await res.json()) as {
      status?: string;
      average_execution_time?: number;
      execution_duration?: number;
    };
    return {
      state: "processing",
      averageExecutionTime: body.average_execution_time ?? 0,
      executionDuration: body.execution_duration ?? 0,
    };
  }

  throw new VeniceError(`Unexpected retrieve content-type "${mime || "none"}".`, res.status);
}

/** POST /audio/complete — only after the bytes are safely in IndexedDB. */
export async function veniceComplete(
  opts: { apiKey: string; model: string; queueId: string },
  fetchImpl: FetchLike = fetch,
): Promise<boolean> {
  const res = await fetchImpl(`${VENICE_BASE}/audio/complete`, {
    method: "POST",
    headers: headers(opts.apiKey),
    body: JSON.stringify({ model: opts.model, queue_id: opts.queueId }),
  });
  if (!res.ok) throw await errorFrom(res);
  const body = (await res.json().catch(() => ({}))) as { success?: boolean };
  return body.success !== false;
}

/** GET /models?type=music — capability discovery. Allowlist still applies. */
export async function veniceMusicModels(
  opts: { apiKey: string },
  fetchImpl: FetchLike = fetch,
): Promise<ModelMetadata[]> {
  const res = await fetchImpl(`${VENICE_BASE}/models?type=music`, {
    method: "GET",
    headers: headers(opts.apiKey),
  });
  if (!res.ok) throw await errorFrom(res);
  const body = (await res.json()) as { data?: unknown };
  if (!Array.isArray(body.data)) return [];
  return body.data.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const row = entry as Record<string, unknown>;
    const spec = (row.model_spec ?? row.constraints ?? {}) as Record<string, unknown>;
    const pick = (key: string) => (row[key] !== undefined ? row[key] : spec[key]);
    const meta: ModelMetadata = { id: typeof row.id === "string" ? row.id : undefined };
    const options = pick("duration_options");
    if (Array.isArray(options) && options.every((n) => typeof n === "number")) {
      meta.duration_options = options as number[];
    }
    const min = pick("duration_min");
    if (typeof min === "number") meta.duration_min = min;
    const max = pick("duration_max");
    if (typeof max === "number") meta.duration_max = max;
    const loop = pick("supports_loop");
    if (typeof loop === "boolean") meta.supports_loop = loop;
    const inst = pick("supports_instrumental");
    if (typeof inst === "boolean") meta.supports_instrumental = inst;
    const lyr = pick("supports_lyrics");
    if (typeof lyr === "boolean") meta.supports_lyrics = lyr;
    const promptCap = pick("prompt_character_limit");
    if (typeof promptCap === "number") meta.prompt_character_limit = promptCap;
    const promptMin = pick("min_prompt_length");
    if (typeof promptMin === "number") meta.min_prompt_length = promptMin;
    return [meta];
  });
}

/** Base64 helper that works under Node (server fn) and the browser alike. */
export function bytesToBase64(bytes: ArrayBuffer): string {
  const view = new Uint8Array(bytes);
  const g = globalThis as { Buffer?: { from(b: Uint8Array): { toString(e: string): string } } };
  if (g.Buffer) return g.Buffer.from(view).toString("base64");
  let binary = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < view.length; i += CHUNK) {
    binary += String.fromCharCode(...view.subarray(i, i + CHUNK));
  }
  return btoa(binary);
}

export function base64ToBytes(b64: string): ArrayBuffer {
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) out[i] = binary.charCodeAt(i);
  return out.buffer;
}
