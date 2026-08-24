import type { ConflictAlert, SpecBlock } from "../types";
import { personaIntentConflict, type PersonaV1 } from "../persona/schema";
import { getGenre } from "../knowledge/genres";
import { getTemplate } from "../knowledge/structures";

export function detectConflicts(spec: SpecBlock, persona?: PersonaV1 | null): ConflictAlert[] {
  const alerts: ConflictAlert[] = [];
  const genre = getGenre(spec.genreSpine);
  const tmpl = getTemplate(spec.structureTemplate);

  if (genre.defaultTemplate !== spec.structureTemplate) {
    const streamingPopOnMetal =
      spec.genreSpine.includes("Metal") && spec.structureTemplate.includes("Pop");
    const cinematicAsked =
      spec.performanceTarget === "trailer" || spec.performanceTarget === "sync";
    if (streamingPopOnMetal) {
      alerts.push({
        field: "structureTemplate",
        issue: "Metal spine on a pop-with-distortion form. Riffs need module logic.",
        fix: genre.defaultTemplate,
      });
    } else if (
      cinematicAsked &&
      !spec.structureTemplate.includes("Cinematic")
    ) {
      alerts.push({
        field: "structureTemplate",
        issue: "Trailer/sync target needs a three-act cinematic chassis.",
        fix: "Cinematic Trailer / Hybrid Orchestral Rock (Three-Act)",
      });
    }
  }

  if (spec.genreSpine === spec.genreColor) {
    alerts.push({
      field: "genreColor",
      issue: "Spine and color are the same genre — fusion is decorative.",
      fix: "none",
    });
  }

  if (
    spec.performanceTarget === "streaming" &&
    tmpl.hook === "delayed" &&
    !spec.structureMods.includes("Cold Open Hook")
  ) {
    alerts.push({
      field: "structureMods",
      issue: "Streaming target with a delayed hook. Early payoff is the default.",
      fix: "Cold Open Hook",
    });
  }

  if (!spec.vocalProtocol.toLowerCase().includes("lead")) {
    alerts.push({
      field: "vocalProtocol",
      issue: "Unclear singer identity — vocal performance will drift.",
      fix: "Declare gender, age, timbre, and delivery.",
    });
  }

  if (spec.genreSpine.includes("Pop") && spec.tropeCheck === "off") {
    alerts.push({
      field: "tropeCheck",
      issue: "Pop is STRICT trope tier. Off-mode invites chorus cliché.",
      fix: "standard",
    });
  }

  if (persona && spec.intent.trim()) {
    const fight = personaIntentConflict(spec.intent, persona);
    if (fight) {
      alerts.push({
        field: "persona",
        issue: fight.reason,
        fix: "Rewrite intent to match identity.one_line, or pick another persona.",
      });
    }
  }

  return alerts;
}

export const scanConflicts = detectConflicts;

