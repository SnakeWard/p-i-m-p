import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  base64ToBytes,
  bytesToBase64,
  extensionForMime,
  isAudioMime,
  parseContentType,
  veniceComplete,
  veniceQueue,
  veniceQuote,
  veniceRetrieve,
  VeniceError,
  type FetchLike,
} from "./venice-client.ts";

interface Call {
  url: string;
  init?: RequestInit;
}

/** Queue of scripted responses; records what the client actually sent. */
function fakeFetch(responses: Response[]): { fetch: FetchLike; calls: Call[] } {
  const calls: Call[] = [];
  const queue = [...responses];
  const impl: FetchLike = async (url, init) => {
    calls.push({ url, init });
    const next = queue.shift();
    if (!next) throw new Error(`unexpected extra fetch to ${url}`);
    return next;
  };
  return { fetch: impl, calls };
}

function processingBody(avg: number, elapsed: number) {
  return new Response(
    JSON.stringify({
      status: "PROCESSING",
      average_execution_time: avg,
      execution_duration: elapsed,
    }),
    { status: 200, headers: { "content-type": "application/json" } },
  );
}

function audioBody(bytes: number[], mime = "audio/mpeg") {
  return new Response(new Uint8Array(bytes), {
    status: 200,
    headers: { "content-type": mime },
  });
}

describe("content-type parsing", () => {
  it("strips parameters", () => {
    assert.equal(parseContentType("audio/mpeg; charset=binary"), "audio/mpeg");
    assert.equal(parseContentType("application/json; charset=utf-8"), "application/json");
    assert.equal(parseContentType("AUDIO/WAV"), "audio/wav");
    assert.equal(parseContentType(null), "");
  });

  it("classifies audio mimes", () => {
    assert.equal(isAudioMime("audio/mpeg"), true);
    assert.equal(isAudioMime("audio/flac"), true);
    assert.equal(isAudioMime("application/json"), false);
  });

  it("maps mime to download extension", () => {
    assert.equal(extensionForMime("audio/mpeg"), "mp3");
    assert.equal(extensionForMime("audio/wav; charset=binary"), "wav");
    assert.equal(extensionForMime("audio/flac"), "flac");
    assert.equal(extensionForMime(null), "mp3");
  });
});

describe("retrieve: JSON while processing, raw bytes when ready", () => {
  it("reads the progress numbers from the JSON branch", async () => {
    const { fetch, calls } = fakeFetch([processingBody(20000, 5200)]);
    const out = await veniceRetrieve(
      { apiKey: "k", model: "ace-step-15", queueId: "q1" },
      fetch,
    );
    assert.equal(out.state, "processing");
    if (out.state === "processing") {
      assert.equal(out.averageExecutionTime, 20000);
      assert.equal(out.executionDuration, 5200);
    }
    // POST with a body — never GET /audio/retrieve/:id
    assert.equal(calls[0]!.init?.method, "POST");
    assert.ok(calls[0]!.url.endsWith("/audio/retrieve"));
    assert.ok(!calls[0]!.url.includes("q1"), "queue id belongs in the body, not the path");
    const sent = JSON.parse(String(calls[0]!.init?.body)) as Record<string, unknown>;
    assert.equal(sent.queue_id, "q1");
    assert.equal(sent.model, "ace-step-15");
    assert.equal(sent.delete_media_on_completion, false);
  });

  it("returns bytes and mime from the audio branch without parsing JSON", async () => {
    const { fetch } = fakeFetch([audioBody([73, 68, 51, 4])]);
    const out = await veniceRetrieve(
      { apiKey: "k", model: "ace-step-15", queueId: "q1" },
      fetch,
    );
    assert.equal(out.state, "ready");
    if (out.state === "ready") {
      assert.equal(out.mime, "audio/mpeg");
      assert.deepEqual(Array.from(new Uint8Array(out.bytes)), [73, 68, 51, 4]);
    }
  });

  it("polls processing then ready across successive one-shot calls", async () => {
    const { fetch, calls } = fakeFetch([
      processingBody(20000, 3000),
      processingBody(20000, 12000),
      audioBody([1, 2, 3], "audio/wav; charset=binary"),
    ]);
    const args = { apiKey: "k", model: "elevenlabs-music", queueId: "q9" };
    assert.equal((await veniceRetrieve(args, fetch)).state, "processing");
    assert.equal((await veniceRetrieve(args, fetch)).state, "processing");
    const done = await veniceRetrieve(args, fetch);
    assert.equal(done.state, "ready");
    if (done.state === "ready") assert.equal(done.mime, "audio/wav");
    assert.equal(calls.length, 3, "each retrieve is exactly one request");
  });

  it("fails the job on 404 rather than retrying blind", async () => {
    const { fetch } = fakeFetch([new Response("gone", { status: 404 })]);
    await assert.rejects(
      () => veniceRetrieve({ apiKey: "k", model: "ace-step-15", queueId: "q1" }, fetch),
      (e: unknown) => e instanceof VeniceError && e.status === 404,
    );
  });

  it("surfaces a body slice on other errors instead of calling .json()", async () => {
    const { fetch } = fakeFetch([
      new Response("upstream exploded", {
        status: 500,
        headers: { "content-type": "text/plain" },
      }),
    ]);
    await assert.rejects(
      () => veniceRetrieve({ apiKey: "k", model: "ace-step-15", queueId: "q1" }, fetch),
      (e: unknown) => e instanceof VeniceError && /upstream exploded/.test(e.message),
    );
  });

  it("rejects an unexpected content-type rather than guessing", async () => {
    const { fetch } = fakeFetch([
      new Response("<html>", { status: 200, headers: { "content-type": "text/html" } }),
    ]);
    await assert.rejects(
      () => veniceRetrieve({ apiKey: "k", model: "ace-step-15", queueId: "q1" }, fetch),
      /content-type/,
    );
  });
});

describe("queue / quote / complete", () => {
  it("posts the body verbatim and reads queue_id", async () => {
    const { fetch, calls } = fakeFetch([
      new Response(JSON.stringify({ model: "ace-step-15", queue_id: "abc", status: "QUEUED" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    ]);
    const out = await veniceQueue(
      { apiKey: "k", body: { model: "ace-step-15", prompt: "brief", duration_seconds: 120 } },
      fetch,
    );
    assert.equal(out.queue_id, "abc");
    assert.equal(out.status, "QUEUED");
    const sent = JSON.parse(String(calls[0]!.init?.body)) as Record<string, unknown>;
    assert.deepEqual(Object.keys(sent).sort(), ["duration_seconds", "model", "prompt"]);
    assert.ok(!("lyrics_optimizer" in sent));
    const auth = (calls[0]!.init?.headers as Record<string, string>).Authorization;
    assert.equal(auth, "Bearer k");
  });

  it("throws when queue returns no id", async () => {
    const { fetch } = fakeFetch([
      new Response(JSON.stringify({ status: "QUEUED" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    ]);
    await assert.rejects(
      () => veniceQueue({ apiKey: "k", body: { model: "ace-step-15", prompt: "b" } }, fetch),
      /queue_id/,
    );
  });

  it("reads a USD quote", async () => {
    const { fetch, calls } = fakeFetch([
      new Response(JSON.stringify({ quote: 0.18 }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    ]);
    const quote = await veniceQuote(
      { apiKey: "k", model: "minimax-music-v25", durationSeconds: 180 },
      fetch,
    );
    assert.equal(quote, 0.18);
    const sent = JSON.parse(String(calls[0]!.init?.body)) as Record<string, unknown>;
    assert.equal(sent.duration_seconds, 180);
  });

  it("completes a job", async () => {
    const { fetch, calls } = fakeFetch([
      new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    ]);
    assert.equal(
      await veniceComplete({ apiKey: "k", model: "ace-step-15", queueId: "q1" }, fetch),
      true,
    );
    assert.ok(calls[0]!.url.endsWith("/audio/complete"));
  });
});

describe("base64 round trip", () => {
  it("survives the server-fn boundary", () => {
    const original = new Uint8Array([0, 1, 127, 128, 255, 73, 68, 51]);
    const restored = new Uint8Array(base64ToBytes(bytesToBase64(original.buffer)));
    assert.deepEqual(Array.from(restored), Array.from(original));
  });

  it("handles a payload larger than one chunk", () => {
    const big = new Uint8Array(70000).map((_, i) => i % 256);
    const restored = new Uint8Array(base64ToBytes(bytesToBase64(big.buffer)));
    assert.equal(restored.length, big.length);
    assert.deepEqual(Array.from(restored.subarray(0, 16)), Array.from(big.subarray(0, 16)));
  });
});
