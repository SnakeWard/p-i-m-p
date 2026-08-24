import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { PERSONA_SCHEMA_ID, validatePersona } from "./schema.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

describe("pimp.persona.v1 validator", () => {
  it("accepts the example fixture", () => {
    const raw = readFileSync(path.join(ROOT, "data/personas/_example.json"), "utf8");
    const result = validatePersona(JSON.parse(raw));
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.persona.schema, PERSONA_SCHEMA_ID);
      assert.equal(result.persona.name, "Vesper Hollow");
      assert.ok(result.persona.anchors.objects.length >= 3);
    }
  });

  it("rejects missing objects[3] and non-array forbidden", () => {
    const raw = readFileSync(path.join(ROOT, "cli/fixtures/persona-invalid.json"), "utf8");
    const result = validatePersona(JSON.parse(raw));
    assert.equal(result.ok, false);
    if (!result.ok) {
      const fields = result.errors.map((e) => e.field);
      assert.ok(fields.includes("anchors.objects"));
      assert.ok(fields.includes("voice.forbidden"));
    }
  });

  it("rejects wrong schema id", () => {
    const raw = JSON.parse(
      readFileSync(path.join(ROOT, "data/personas/_example.json"), "utf8"),
    );
    raw.schema = "pimp.persona.v0";
    const result = validatePersona(raw);
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.ok(result.errors.some((e) => e.field === "schema"));
    }
  });
});
