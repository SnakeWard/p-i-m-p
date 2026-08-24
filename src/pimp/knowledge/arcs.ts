export const NARRATIVE_ARCS = [
  "Chase → Capture",
  "Confrontation → Resolution",
  "Ritual → Ascension",
  "Dominance → Surrender",
  "Absurdity → Joy",
  "Chaos → Control",
  "Grief → Continuance",
  "Confession → Consequence",
] as const;

export const EMOTION_PATHS = [
  "restrained verse → chorus release",
  "intimate whisper → belted lift",
  "cold report → cracked confession",
  "swagger verse → wounded hook",
  "slow burn → explosive lift",
  "numb verse → angry chorus → quiet resolve",
  "testimonial hush → choir lift",
  "menace → catharsis",
] as const;

export const TONE_FLAGS = [
  "darker",
  "more aggressive",
  "cinematic",
  "stripped",
  "intimate",
  "anthemic",
  "ironic",
  "sacred",
] as const;

export function inferArc(intent: string, spine: string): string {
  const t = intent.toLowerCase();
  if (/revenge|owed|payback|burned|pawn/.test(t)) return "Confrontation → Resolution";
  if (/grief|died|funeral|empty chair|left me/.test(t)) return "Grief → Continuance";
  if (/church|grace|pray|choir|saved/.test(t)) return "Ritual → Ascension";
  if (/party|stupid|joke|absurd/.test(t)) return "Absurdity → Joy";
  if (/control|spiral|chaos|lost/.test(t)) return "Chaos → Control";
  if (/confess|secret|told|lied/.test(t)) return "Confession → Consequence";
  if (spine.includes("Metal") || spine.includes("Hip-Hop")) return "Dominance → Surrender";
  if (spine.includes("Gospel")) return "Ritual → Ascension";
  if (spine.includes("Country") || spine.includes("Americana"))
    return "Confrontation → Resolution";
  return "Chaos → Control";
}

export function inferEmotion(intent: string, flags: string[]): string {
  if (flags.includes("intimate") || flags.includes("stripped"))
    return "intimate whisper → belted lift";
  if (flags.includes("more aggressive")) return "menace → catharsis";
  if (flags.includes("darker")) return "cold report → cracked confession";
  if (flags.includes("anthemic")) return "restrained verse → chorus release";
  const t = intent.toLowerCase();
  if (/whisper|quiet|bedroom|close/.test(t)) return "intimate whisper → belted lift";
  if (/rage|scream|fight/.test(t)) return "menace → catharsis";
  if (/numb|report|facts/.test(t)) return "cold report → cracked confession";
  return "restrained verse → chorus release";
}
