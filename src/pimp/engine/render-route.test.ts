import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { EMPTY_SPEC, type SpecBlock } from "../types.ts";
import {
  buildRenderPlan,
  defaultModel,
  deriveInstrumental,
  findModel,
  fitPrompt,
  gateRender,
  isAllowedModel,
  serializeLyrics,
  snapDuration,
  targetDuration,
  applyModelMetadata,
} from "./render-route.ts";

function spec(patch: Partial<SpecBlock> = {}): SpecBlock {
  return { ...EMPTY_SPEC, ...patch };
}

const LYRICS = "[Verse 1]\nI left the key on the counter\n\n[Chorus]\nUnsigned lease";

describe("K3-R duration snapping", () => {
  it("snaps an illegal ACE-Step duration to an exact allowed member", () => {
    const cap = findModel("ace-step-15");
    assert.ok(cap);
    const snapped = snapDuration(75, cap.durationOptions);
    assert.ok(snapped === 60 || snapped === 90, `expected 60 or 90, got ${snapped}`);
    assert.ok(cap.durationOptions?.includes(snapped));
  });

  it("never emits an ACE-Step duration outside the allowed set", () => {
    const cap = findModel("ace-step-15");
    assert.ok(cap);
    for (let s = 1; s <= 300; s += 7) {
      const snapped = snapDuration(s, cap.durationOptions);
      assert.ok(
        cap.durationOptions?.includes(snapped),
        `${s}s snapped to illegal ${snapped}`,
      );
    }
  });

  it("clamps to a range when the model has no discrete options", () => {
    assert.equal(snapDuration(900, undefined, 3, 600), 600);
    assert.equal(snapDuration(1, undefined, 3, 600), 3);
    assert.equal(snapDuration(180.4, undefined, 3, 600), 180);
  });
});

describe("K3-R spec derivation", () => {
  it("maps performance targets to durations", () => {
    assert.equal(targetDuration("short-form"), 60);
    assert.equal(targetDuration("trailer"), 60);
    assert.equal(targetDuration("club"), 120);
    assert.equal(targetDuration("sync"), 120);
    assert.equal(targetDuration("radio"), 180);
    assert.equal(targetDuration("streaming"), 180);
  });

  it("routes tier to model", () => {
    assert.equal(defaultModel("draft", "streaming"), "ace-step-15");
    assert.equal(defaultModel("release", "streaming"), "elevenlabs-music");
  });

  it("defaults a trailer with no vocal cue to instrumental", () => {
    assert.equal(
      deriveInstrumental(spec({ performanceTarget: "trailer", vocalProtocol: "swelling strings" })),
      true,
    );
  });

  it("keeps a trailer vocal when the protocol names one", () => {
    assert.equal(
      deriveInstrumental(
        spec({ performanceTarget: "trailer", vocalProtocol: "lone female vocal, breathy" }),
      ),
      false,
    );
  });

  it("honours an explicit instrumental protocol on any target", () => {
    assert.equal(
      deriveInstrumental(spec({ performanceTarget: "streaming", vocalProtocol: "instrumental" })),
      true,
    );
    assert.equal(
      deriveInstrumental(spec({ performanceTarget: "streaming", vocalProtocol: "no vocals" })),
      true,
    );
  });

  it("lets a user override beat the derivation in both directions", () => {
    const s = spec({ performanceTarget: "trailer", vocalProtocol: "swelling strings" });
    assert.equal(deriveInstrumental(s, false), false);
    assert.equal(deriveInstrumental(spec(), true), true);
  });
});

describe("K3-R lyric serialization", () => {
  it("strips (staging notes) but keeps [Section] tags", () => {
    const out = serializeLyrics("[Verse 1]\n(whispered, close mic)\nI left the key\n[Chorus]\nGone");
    assert.ok(out.includes("[Verse 1]"));
    assert.ok(out.includes("[Chorus]"));
    assert.ok(!out.includes("whispered"));
    assert.ok(!out.includes("("));
  });

  it("collapses the blank lines a stripped note leaves behind", () => {
    const out = serializeLyrics("[Verse 1]\nline one   \n\n\n\n[Chorus]\nhook");
    assert.ok(!/\n{3,}/.test(out));
    assert.ok(!/[ \t]\n/.test(out));
  });
});

describe("K3-R queue body construction", () => {
  it("omits force_instrumental entirely for ACE-Step", () => {
    const cap = findModel("ace-step-15");
    assert.ok(cap);
    const plan = buildRenderPlan({
      spec: spec({ performanceTarget: "trailer", vocalProtocol: "swelling strings" }),
      stylePrompt: "cinematic build",
      lyrics: LYRICS,
      cap,
    });
    assert.equal(plan.instrumental, true);
    assert.ok(!("force_instrumental" in plan.body), "must omit, not send false");
    assert.ok(!("lyrics_optimizer" in plan.body));
  });

  it("sends force_instrumental only when the model supports it", () => {
    const cap = findModel("elevenlabs-music");
    assert.ok(cap);
    const plan = buildRenderPlan({
      spec: spec({ vocalProtocol: "instrumental" }),
      stylePrompt: "brief",
      lyrics: LYRICS,
      cap,
    });
    assert.equal(plan.body.force_instrumental, true);
  });

  it("omits lyrics_prompt when instrumental", () => {
    const cap = findModel("elevenlabs-music");
    assert.ok(cap);
    const plan = buildRenderPlan({
      spec: spec({ vocalProtocol: "instrumental" }),
      stylePrompt: "brief",
      lyrics: LYRICS,
      cap,
    });
    assert.ok(!("lyrics_prompt" in plan.body));
  });

  it("sends serialized lyrics when singing", () => {
    const cap = findModel("ace-step-15");
    assert.ok(cap);
    const plan = buildRenderPlan({
      spec: spec({ vocalProtocol: "worn male, close mic" }),
      stylePrompt: "brief",
      lyrics: "[Verse 1]\n(spoken)\nI left the key",
      cap,
    });
    assert.ok(plan.body.lyrics_prompt?.includes("[Verse 1]"));
    assert.ok(!plan.body.lyrics_prompt?.includes("spoken"));
  });

  it("omits loop when the model does not support it, even on a club target", () => {
    const cap = findModel("ace-step-15");
    assert.ok(cap);
    const plan = buildRenderPlan({
      spec: spec({ performanceTarget: "club", vocalProtocol: "chanted hook" }),
      stylePrompt: "brief",
      lyrics: LYRICS,
      cap,
    });
    assert.ok(!("loop" in plan.body), "must omit, not send false");
  });

  it("sends loop on a club target once metadata reports support", () => {
    const base = findModel("elevenlabs-music");
    assert.ok(base);
    const cap = applyModelMetadata(base, { supports_loop: true });
    const plan = buildRenderPlan({
      spec: spec({ performanceTarget: "club", vocalProtocol: "chanted hook" }),
      stylePrompt: "brief",
      lyrics: LYRICS,
      cap,
    });
    assert.equal(plan.body.loop, true);
  });

  it("omits duration_seconds for models with no documented range", () => {
    const cap = findModel("minimax-music-v2");
    assert.ok(cap);
    const plan = buildRenderPlan({
      spec: spec({ vocalProtocol: "worn male" }),
      stylePrompt: "brief",
      lyrics: LYRICS,
      cap,
    });
    assert.ok(!("duration_seconds" in plan.body));
    assert.equal(plan.quoteDurationSeconds, 180, "quote still needs a number");
  });

  it("snaps a user duration override to a legal ACE-Step value", () => {
    const cap = findModel("ace-step-15");
    assert.ok(cap);
    const plan = buildRenderPlan({
      spec: spec({ vocalProtocol: "worn male" }),
      stylePrompt: "brief",
      lyrics: LYRICS,
      cap,
      durationSeconds: 75,
    });
    assert.ok(cap.durationOptions?.includes(plan.body.duration_seconds!));
  });
});

describe("K3-R prompt fitting (Venice caps prompt per model)", () => {
  const LONG = (
    "Worn male vocal, late thirties, close-mic and dry. " +
    "Heartland rock spine owns the backbeat and the two-guitar arrangement; " +
    "indie color owns the tape hiss and the detuned upright. "
  ).repeat(6);

  it("leaves a brief that already fits completely untouched", () => {
    const out = fitPrompt("short brief", 512);
    assert.equal(out.trimmed, false);
    assert.equal(out.prompt, "short brief");
  });

  it("never exceeds the cap", () => {
    for (const max of [64, 128, 512, 1000]) {
      const out = fitPrompt(LONG, max);
      assert.ok(out.prompt.length <= max, `${out.prompt.length} > ${max}`);
    }
  });

  it("cuts on a boundary rather than mid-word", () => {
    const out = fitPrompt(LONG, 512);
    assert.equal(out.trimmed, true);
    assert.ok(!/\s$/.test(out.prompt));
    // The character after the cut in the source must be a boundary, proving we
    // did not slice through a word.
    const next = LONG.trim().charAt(out.prompt.length);
    assert.ok(
      next === "" || /[\s,;.]/.test(next) || /[\s,;.]/.test(LONG.trim().charAt(out.prompt.length - 1) ?? ""),
      `cut landed mid-word before ${JSON.stringify(next)}`,
    );
  });

  it("keeps the front of the brief, where K3 puts identity", () => {
    const out = fitPrompt(LONG, 512);
    assert.ok(out.prompt.startsWith("Worn male vocal"));
  });

  it("does not leave dangling punctuation", () => {
    assert.ok(!/[\s,;.\-—]$/.test(fitPrompt(LONG, 512).prompt));
  });

  it("fits the queue body prompt to the model cap", () => {
    const cap = findModel("ace-step-15");
    assert.ok(cap);
    const plan = buildRenderPlan({
      spec: spec({ vocalProtocol: "worn male" }),
      stylePrompt: LONG,
      lyrics: LYRICS,
      cap,
    });
    assert.ok(plan.body.prompt.length <= 512);
    assert.equal(plan.promptTrimmed, true);
    assert.equal(plan.promptLimit, 512);
    assert.equal(gateRender({ plan, hasKey: true }), null, "a fitted prompt must pass the gate");
  });

  it("widens the cap when /models reports a larger prompt_character_limit", () => {
    const base = findModel("elevenlabs-music");
    assert.ok(base);
    const cap = applyModelMetadata(base, { prompt_character_limit: 2000 });
    assert.equal(cap.promptCharacterLimit, 2000);
    const plan = buildRenderPlan({
      spec: spec({ vocalProtocol: "worn male" }),
      stylePrompt: LONG.slice(0, 900),
      lyrics: LYRICS,
      cap,
    });
    assert.equal(plan.promptTrimmed, false, "900 chars fits a 2000 cap");
  });

  it("enforces a reported minimum prompt length", () => {
    const base = findModel("elevenlabs-music");
    assert.ok(base);
    const cap = applyModelMetadata(base, { min_prompt_length: 40 });
    assert.equal(cap.minPromptLength, 40);
  });
});

describe("K3-R allowlist and gate", () => {
  it("excludes SFX, TTS and out-of-scope models", () => {
    for (const id of [
      "elevenlabs-tts-v3",
      "elevenlabs-tts-multilingual-v2",
      "elevenlabs-sound-effects-v2",
      "sonilo-v1-1-sound-effects",
      "sonilo-v1-1-music",
      "mmaudio-v2-text-to-audio",
      "seed-audio-1-0",
      "stable-audio-25",
      "lyria-3-pro",
      "ace-step-1.5",
    ]) {
      assert.equal(isAllowedModel(id), false, `${id} must not be renderable`);
    }
    assert.equal(isAllowedModel("ace-step-15"), true);
  });

  it("blocks a render with no key", () => {
    const cap = findModel("ace-step-15");
    assert.ok(cap);
    const plan = buildRenderPlan({
      spec: spec({ vocalProtocol: "worn male" }),
      stylePrompt: "brief",
      lyrics: LYRICS,
      cap,
    });
    assert.match(gateRender({ plan, hasKey: false }) ?? "", /Venice API key/);
    assert.equal(gateRender({ plan, hasKey: true }), null);
  });

  it("blocks a vocal render with no lyrics", () => {
    const cap = findModel("ace-step-15");
    assert.ok(cap);
    const plan = buildRenderPlan({
      spec: spec({ vocalProtocol: "worn male" }),
      stylePrompt: "brief",
      lyrics: "   ",
      cap,
    });
    assert.match(gateRender({ plan, hasKey: true }) ?? "", /No lyrics/);
  });

  it("blocks an empty style prompt", () => {
    const cap = findModel("ace-step-15");
    assert.ok(cap);
    const plan = buildRenderPlan({
      spec: spec({ vocalProtocol: "worn male" }),
      stylePrompt: "  ",
      lyrics: LYRICS,
      cap,
    });
    assert.match(gateRender({ plan, hasKey: true }) ?? "", /Style prompt/);
  });
});
