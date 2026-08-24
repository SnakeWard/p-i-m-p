import { getGenre } from "../knowledge/genres";
import {
  applyMods,
  getTemplate,
  selectTemplate,
} from "../knowledge/templates";
import type { SpecBlock } from "../types";
import { buildStylePrompt } from "./style-prompt";

export function architectSpec(input: SpecBlock): SpecBlock {
  const spine = getGenre(input.genreSpine);
  const templateName =
    input.structureTemplate && input.structureTemplate !== "auto"
      ? input.structureTemplate
      : selectTemplate({
          spine: input.genreSpine,
          performance: input.performanceTarget,
        });
  const tpl = getTemplate(templateName);
  const mods = [...input.structureMods];
  if (input.performanceTarget === "short-form" && !mods.includes("Short-Form Hook Cut")) {
    mods.push("Streaming Hook Emphasis");
  }
  if (input.performanceTarget === "streaming" && templateName.includes("Ballad")) {
    mods.push("Cold Open Hook");
  }
  const sections = applyMods(tpl.sections, mods);
  const vocal =
    input.vocalProtocol.trim() ||
    spine.vocal + (input.persona !== "—" ? ` Persona: ${input.persona}.` : "");

  return {
    ...input,
    structureTemplate: templateName,
    structureMods: mods,
    structureSections: sections,
    vocalProtocol: vocal,
    emotionPath:
      input.emotionPath.trim() || "restrained verse → chorus release → bridge shift",
    narrativeArc: input.narrativeArc.trim() || tpl.arcs[0] || "Chaos → Control",
  };
}

export function formatSpec(spec: SpecBlock) {
  return [
    "A. SPEC BLOCK",
    `Title: ${spec.title || "—"}`,
    `Persona: ${spec.persona}`,
    `Genre DNA: ${spec.genreSpine} / ${spec.genreColor}`,
    `Narrative Arc: ${spec.narrativeArc}`,
    `Emotion Path: ${spec.emotionPath}`,
    `Structure Template: ${spec.structureTemplate}`,
    `Sections: ${spec.structureSections.join(" → ") || "—"}`,
    `Mods: ${spec.structureMods.join(", ") || "none"}`,
    `Vocal Protocol: ${spec.vocalProtocol}`,
    `Performance Target: ${spec.performanceTarget}`,
    `TropeCheck: ${spec.tropeCheck}`,
    `TropeTone: ${spec.tropeTone}`,
    `Intent: ${spec.intent || "—"}`,
    spec.toneFlags.length ? `Tone flags: ${spec.toneFlags.join(", ")}` : "",
    spec.personaAnchors?.length ? `Persona anchors: ${spec.personaAnchors.join(", ")}` : "",
    spec.personaForbidden?.length
      ? `Persona forbidden: ${spec.personaForbidden.join(", ")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export { buildStylePrompt };
