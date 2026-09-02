import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { applySilentRewrites, runK2 } from "./k2-core.mjs";

const BASE_SPEC = {
  title: "Unsigned Lease",
  tropeCheck: "standard",
  personaAnchors: [],
  personaForbidden: [],
  genreSpine: "Country / Heartland Rock",
  genreColor: "none",
};

const spec = (patch = {}) => ({ ...BASE_SPEC, ...patch });

const SLOGAN = `[Chorus]
We will rise above the pain
I can't go on without you
The fire burns inside my soul`;

describe("P3 — rewrites are built from this song, not a phrasebook", () => {
  it("draws on persona anchors when they exist", () => {
    const report = runK2(SLOGAN, spec({ personaAnchors: ["pawn ticket", "loading dock"] }));
    const rewrites = report.lines.filter((l) => l.rewrite).map((l) => l.rewrite);
    assert.ok(rewrites.length > 0, "anchored spec should produce rewrites");
    assert.ok(
      rewrites.some((r) => /pawn ticket|loading dock/.test(r)),
      `expected an anchor in ${JSON.stringify(rewrites)}`,
    );
  });

  it("gives two different songs different rewrite text", () => {
    const a = runK2(SLOGAN, spec({ title: "Unsigned Lease", personaAnchors: ["pawn ticket"] }));
    const b = runK2(SLOGAN, spec({ title: "Harbour Light", personaAnchors: ["harbour rope"] }));
    const ra = a.lines.filter((l) => l.rewrite).map((l) => l.rewrite);
    const rb = b.lines.filter((l) => l.rewrite).map((l) => l.rewrite);
    assert.ok(ra.length && rb.length);
    for (const line of ra) {
      assert.ok(!rb.includes(line), `"${line}" leaked across songs`);
    }
  });

  it("never repeats a rewrite string inside one track", () => {
    const report = runK2(SLOGAN, spec({ personaAnchors: ["pawn ticket", "loading dock"] }));
    const rewrites = report.lines.filter((l) => l.rewrite).map((l) => l.rewrite);
    assert.equal(new Set(rewrites).size, rewrites.length, "duplicate T2 string in one track");
  });

  it("emits none of the old hardcoded phrasebook lines", () => {
    const report = runK2(SLOGAN, spec({ personaAnchors: ["pawn ticket"] }));
    const all = report.lines.map((l) => l.rewrite ?? "").join(" | ");
    for (const ghost of [
      "third shift",
      "the lease unsigned on the counter",
      "your key still scraping the lock",
      "the voicemail I never deleted",
      "the night crew still clocks the same door",
      "the kettle clicks off and I still wait",
      "I still set two alarms for a house of one",
      "the fridge hums louder than the hallway",
    ]) {
      assert.ok(!all.includes(ghost), `phrasebook line survived: ${ghost}`);
    }
  });
});

describe("P3 — no anchor means no invention", () => {
  const bare = spec({ title: "", personaAnchors: [] });
  // A Tier-1 phrase that is not a GENERIC_SLOGANS match, so it lands on the
  // softer REWRITE tier rather than the CDS-0 veto.
  const TIER1 = "[Verse 1]\nWe will break free tonight";

  it("downgrades a REWRITE to CONDITIONAL instead of inventing a line", () => {
    const line = runK2(TIER1, bare).lines[0];
    assert.equal(line.verdict, "CONDITIONAL");
    assert.equal(line.rewrite, undefined);
    assert.match(line.note, /no persona anchor/i);
  });

  it("still offers a rewrite for the same line when an anchor exists", () => {
    const line = runK2(TIER1, spec({ personaAnchors: ["pawn ticket"] })).lines[0];
    assert.equal(line.verdict, "REWRITE");
    assert.match(line.rewrite, /pawn ticket/);
  });

  it("records a binding note so the writer sees the debt", () => {
    assert.ok(runK2(TIER1, bare).binding.some((b) => /no persona anchor/i.test(b)));
  });

  it("keeps a Tier 0 veto as BLOCK — a veto is not a suggestion", () => {
    const report = runK2("[Verse 1]\nI am the phoenix from the fire", bare);
    const line = report.lines[0];
    assert.equal(line.verdict, "BLOCK", "Tier 0 must not be downgraded to CONDITIONAL");
    assert.equal(report.passed, false);
  });
});

describe("P3 — applySilentRewrites addresses lines, not text", () => {
  it("rewrites every occurrence of a repeated line, not just the first", () => {
    const lyrics = `[Chorus]
We will rise above the pain

[Final Chorus]
We will rise above the pain`;
    const s = spec({ personaAnchors: ["pawn ticket", "loading dock"] });
    const out = applySilentRewrites(lyrics, runK2(lyrics, s));
    assert.ok(
      !out.includes("We will rise above the pain"),
      `a repeat survived:\n${out}`,
    );
  });

  it("does not corrupt a line that merely contains another line as a substring", () => {
    const lyrics = `[Verse 1]
We will rise above the pain tonight on the loading dock
We will rise above the pain`;
    const s = spec({ personaAnchors: ["pawn ticket"] });
    const report = runK2(lyrics, s);
    const out = applySilentRewrites(lyrics, report).split("\n").filter(Boolean);
    // Two distinct source lines must map to two distinct output lines.
    assert.equal(out.length, 3, out.join(" / "));
    assert.notEqual(out[1], out[2]);
  });

  it("leaves section tags, blank lines and staging notes untouched", () => {
    const lyrics = `[Chorus]
(whispered, close mic)
We will rise above the pain`;
    const s = spec({ personaAnchors: ["pawn ticket"] });
    const out = applySilentRewrites(lyrics, runK2(lyrics, s));
    assert.ok(out.includes("[Chorus]"));
    assert.ok(out.includes("(whispered, close mic)"));
  });

  it("counts lyric index past a staging note, so the right line moves", () => {
    const lyrics = `[Chorus]
(whispered)
I left the key on the pharmacy counter
We will rise above the pain`;
    const s = spec({ personaAnchors: ["pawn ticket"] });
    const out = applySilentRewrites(lyrics, runK2(lyrics, s));
    assert.ok(
      out.includes("I left the key on the pharmacy counter"),
      `the concrete line must survive:\n${out}`,
    );
  });

  it("is a no-op when TropeCheck is off", () => {
    const lyrics = "[Chorus]\nWe will rise above the pain";
    const report = runK2(lyrics, spec({ tropeCheck: "off" }));
    assert.equal(applySilentRewrites(lyrics, report), lyrics);
  });

  it("preserves the line count exactly", () => {
    const lyrics = `[Verse 1]
We will rise above the pain
I can't go on without you

[Chorus]
The fire burns inside my soul`;
    const s = spec({ personaAnchors: ["pawn ticket", "loading dock"] });
    const out = applySilentRewrites(lyrics, runK2(lyrics, s));
    assert.equal(out.split("\n").length, lyrics.split("\n").length);
  });
});
