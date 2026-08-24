//#region node_modules/.nitro/vite/services/ssr/assets/system-prompt-nkUwiAvs.js
var GENRES = [
	{
		name: "Pop (streaming-era)",
		rhythm: "tight, quantized, groove-forward; four-on-the-floor or trap-lite",
		instruments: "synth beds, processed guitars, programmed drums, sub bass",
		harmony: "diatonic loops, 4-chord cycles, bright pre-chorus lifts",
		vocal: "polished, forward, stacked harmonies in hooks",
		defaultTemplate: "Modern Pop (Streaming-Era)",
		tropeTier: "STRICT",
		visuals: "high-gloss, saturated palette, face-forward",
		fusion: "near-universal color; as spine demands early hook"
	},
	{
		name: "Indie / Alternative",
		rhythm: "looser, human, syncopation over grid",
		instruments: "jangly or textural guitars, analog synths, room-sound drums",
		harmony: "modal color, borrowed chords, unresolved cadences",
		vocal: "idiosyncratic timbre; intimacy or detachment",
		defaultTemplate: "Indie / Alternative (Looser Forms)",
		tropeTier: "STRICT",
		visuals: "film grain, muted palettes, negative space",
		fusion: "best as spine with unexpected color"
	},
	{
		name: "Metal / Hard Rock",
		rhythm: "riff-locked; aggressive kick; half-time breakdowns",
		instruments: "high-gain guitars, double-kick or heavy backbeat, low-tuned bass",
		harmony: "minor/modal, power-chord architecture, chromatic tension",
		vocal: "declare clean/harsh spectrum; dominance or catharsis",
		defaultTemplate: "Metal / Hard Rock (Riff-Module Logic)",
		tropeTier: "LENIENT",
		visuals: "fire, ash, rust, cracked stone; violent contrast",
		fusion: "spine keeps riffs and rhythm"
	},
	{
		name: "Hip-Hop / Trap",
		rhythm: "bar-structured flow, hi-hat subdivisions, 808 patterns",
		instruments: "808 bass, sparse loops, space as an instrument",
		harmony: "minimal, loop-based; mood from timbre",
		vocal: "flow identity first; sung hooks mark chorus",
		defaultTemplate: "Hip-Hop / Trap (Verse-Hook Core)",
		tropeTier: "STANDARD",
		visuals: "location-real or luxury-symbolic; hard contrast",
		fusion: "as spine owns rhythm AND vocal cadence"
	},
	{
		name: "Country / Heartland Rock",
		rhythm: "steady 4/4, backbeat honesty, train or shuffle",
		instruments: "acoustic/Telecaster, pedal steel, fiddle, real drums",
		harmony: "I-IV-V with relative-minor turns",
		vocal: "plainspoken storyteller, title-thesis choruses",
		defaultTemplate: "Heartland Rock / Country Rock",
		tropeTier: "STANDARD",
		visuals: "grain, sun fade, golden hour, story-first",
		fusion: "spine for storytelling hybrids"
	},
	{
		name: "R&B / Soul",
		rhythm: "pocket-deep groove, swung sixteenths",
		instruments: "electric piano, clean guitar chanks, round bass",
		harmony: "extended chords, gospel movement, chromatic passing",
		vocal: "lead instrument — runs, ad-libs, call-and-response",
		defaultTemplate: "R&B / Soul (Vocal Space + Vamp)",
		tropeTier: "STANDARD",
		visuals: "warm amber/midnight, intimate framing",
		fusion: "color that gifts harmony and vocal behavior"
	},
	{
		name: "EDM / Dance",
		rhythm: "four-on-the-floor or genre-specific grid",
		instruments: "synth risers, sidechained pads, sub drops, FX sweeps",
		harmony: "loop-based; tension via filter and arrangement",
		vocal: "topline hooks, chopped vocal textures",
		defaultTemplate: "EDM / Dance (Build-Drop Cycles)",
		tropeTier: "STANDARD",
		visuals: "neon bloom, luminous atmosphere, symmetrical scale",
		fusion: "spine owns rhythm and build-drop architecture"
	},
	{
		name: "Cinematic / Trailer",
		rhythm: "hit-based; percussion as impact architecture",
		instruments: "orchestral sections + sound design + optional rock edge",
		harmony: "modal grandeur, ostinato builds, delayed resolution",
		vocal: "optional choirs, wordless motifs, processed voice",
		defaultTemplate: "Cinematic Trailer / Hybrid Orchestral Rock (Three-Act)",
		tropeTier: "LENIENT",
		visuals: "widescreen scale, atmospheric depth, monumental subject",
		fusion: "color for scale; as spine, partners supply texture only"
	},
	{
		name: "Singer-Songwriter / Folk",
		rhythm: "rubato-tolerant, fingerpicked or brushed pulse",
		instruments: "one anchor instrument + sparse color",
		harmony: "open-voiced folk shapes, gentle suspensions",
		vocal: "close-mic intimacy, breath detail",
		defaultTemplate: "Singer-Songwriter / Acoustic Ballad",
		tropeTier: "STRICT",
		visuals: "natural light, handmade texture, solitary scale",
		fusion: "spine for Ballad Mode"
	},
	{
		name: "Dark Americana / Gothic Country",
		rhythm: "slow stomp, funeral waltz, chain-gang pulse",
		instruments: "baritone guitar, banjo/dobro dark, upright bass, drones",
		harmony: "minor keys, drones, hymn bones",
		vocal: "low, weathered, testimonial",
		defaultTemplate: "Heartland Rock / Country Rock",
		tropeTier: "STANDARD",
		visuals: "dust, old wood, fog, lantern dusk",
		fusion: "spine for gothic storytelling"
	},
	{
		name: "Synthwave / Retrowave",
		rhythm: "motorik 4/4 or gated 80s backbeat, arp pulse",
		instruments: "analog polysynths, FM bells, gated reverb drums",
		harmony: "minor-key nostalgia, suspended pads, filter movement",
		vocal: "optional; reverb-washed, restrained, or vocoded",
		defaultTemplate: "Modern Pop (Streaming-Era)",
		tropeTier: "STANDARD",
		visuals: "neon bloom, glass reflection, horizon symmetry",
		fusion: "color layer par excellence"
	},
	{
		name: "Gospel",
		rhythm: "clap-backbeat, swung triplets, tempo lifts",
		instruments: "Hammond organ, piano, choir, live kit, tambourine",
		harmony: "rich extended movement, walk-ups, modulation lifts",
		vocal: "lead + choir call-and-response, vamp endings",
		defaultTemplate: "R&B / Soul (Vocal Space + Vamp)",
		tropeTier: "STANDARD",
		visuals: "light rays, soft cloth, uplifted vertical framing",
		fusion: "color that sanctifies; as spine owns vamp"
	}
];
function getGenre(name) {
	return GENRES.find((g) => g.name === name) ?? GENRES[0];
}
var TEMPLATES = [
	{
		name: "Radio Rock / Alt Rock",
		sections: [
			"Intro",
			"Verse 1",
			"Pre-Chorus",
			"Chorus",
			"Verse 2",
			"Pre-Chorus",
			"Chorus",
			"Bridge",
			"Final Chorus",
			"Outro"
		],
		hook: "standard-to-early",
		chooseWhen: "guitar-driven spine, chorus earned but inevitable",
		arcs: ["Chase→Capture", "Confrontation→Resolution"]
	},
	{
		name: "Heartland Rock / Country Rock",
		sections: [
			"Intro",
			"Verse 1",
			"Chorus",
			"Verse 2",
			"Chorus",
			"Bridge",
			"Final Chorus",
			"Outro"
		],
		hook: "standard-to-early; title is the hook",
		chooseWhen: "lyric-first storytelling over steady 4/4",
		arcs: ["Ritual→Ascension", "Dominance→Surrender"]
	},
	{
		name: "Modern Pop (Streaming-Era)",
		sections: [
			"Hook Intro",
			"Verse 1",
			"Pre-Chorus",
			"Chorus",
			"Post-Chorus",
			"Verse 2",
			"Pre-Chorus",
			"Chorus",
			"Bridge",
			"Final Chorus",
			"Outro"
		],
		hook: "early (15–30s)",
		chooseWhen: "maximal hook density, streaming intent",
		arcs: ["Absurdity→Joy", "Chaos→Control"]
	},
	{
		name: "Singer-Songwriter / Acoustic Ballad",
		sections: [
			"Intro",
			"Verse 1",
			"Verse 2",
			"Chorus",
			"Verse 3",
			"Bridge",
			"Final Chorus",
			"Outro"
		],
		hook: "standard/refrain; longer setup ok",
		chooseWhen: "sparse instrumentation, introspection-first",
		arcs: ["Ritual→Ascension"]
	},
	{
		name: "Indie / Alternative (Looser Forms)",
		sections: [
			"Intro",
			"Verse 1",
			"Chorus",
			"Verse 2",
			"Instrumental",
			"Chorus",
			"C-Section",
			"Final Chorus",
			"Outro"
		],
		hook: "variable",
		chooseWhen: "texture/attitude over repetition",
		arcs: ["Chaos→Control", "Absurdity→Joy"]
	},
	{
		name: "Metal / Hard Rock (Riff-Module Logic)",
		sections: [
			"Intro",
			"Verse 1",
			"Chorus",
			"Verse 2",
			"Chorus",
			"Breakdown",
			"Solo",
			"Final Chorus",
			"Outro"
		],
		hook: "standard; riff-based motif ok",
		chooseWhen: "riff anchors + aggressive percussion",
		arcs: ["Confrontation→Resolution", "Ritual→Ascension"]
	},
	{
		name: "Hip-Hop / Trap (Verse-Hook Core)",
		sections: [
			"Cold Open",
			"Hook",
			"Verse 1",
			"Hook",
			"Verse 2",
			"Hook",
			"Outro"
		],
		hook: "early, often first",
		chooseWhen: "bar-structured flow and hook loop",
		arcs: ["Dominance→Surrender", "Absurdity→Joy"]
	},
	{
		name: "EDM / Dance (Build-Drop Cycles)",
		sections: [
			"Intro",
			"Break",
			"Build 1",
			"Drop",
			"Breakdown",
			"Build 2",
			"Drop",
			"Outro"
		],
		hook: "drop = hook",
		chooseWhen: "four-on-the-floor; energy contour IS the song",
		arcs: ["Chaos→Control", "Ritual→Ascension"]
	},
	{
		name: "R&B / Soul (Vocal Space + Vamp)",
		sections: [
			"Intro",
			"Verse 1",
			"Pre-Chorus",
			"Chorus",
			"Verse 2",
			"Pre-Chorus",
			"Chorus",
			"Bridge",
			"Final Chorus",
			"Vamp"
		],
		hook: "standard-to-early",
		chooseWhen: "vocal timbre, runs, groove lead",
		arcs: ["Ritual→Ascension"]
	},
	{
		name: "Cinematic Trailer / Hybrid Orchestral Rock (Three-Act)",
		sections: [
			"Act I Setup",
			"Act II Build",
			"Act III Climax",
			"Aftermath"
		],
		hook: "early motif statement",
		chooseWhen: "orchestral + hybrid percussion; trailer-ready",
		arcs: ["Confrontation→Resolution"]
	}
];
var STRUCTURE_MODS = [
	"Cold Open",
	"Cold Open Hook",
	"Add Pre-Chorus",
	"Add Post-Chorus",
	"Double Chorus Ending",
	"Remove Intro",
	"Remove Verse 2",
	"Remove Bridge",
	"Add Breakdown",
	"Add Vamp Outro",
	"Short-Form Hook Cut",
	"Radio Edit",
	"Streaming Hook Emphasis"
];
function getTemplate(name) {
	return TEMPLATES.find((t) => t.name === name) ?? TEMPLATES[2];
}
function applyMods(sections, mods) {
	let next = [...sections];
	for (const mod of mods) {
		if (mod === "Cold Open" || mod === "Remove Intro") {
			next = next.filter((s) => s !== "Intro" && s !== "Hook Intro");
			if (!next[0]?.includes("Verse") && !next[0]?.includes("Hook")) next = ["Cold Open", ...next];
		}
		if (mod === "Cold Open Hook") {
			next = next.filter((s) => s !== "Intro" && s !== "Hook Intro");
			if (next[0] !== "Hook Intro") next = ["Hook Intro", ...next];
		}
		if (mod === "Add Pre-Chorus" && !next.includes("Pre-Chorus")) {
			const vi = next.findIndex((s) => s.startsWith("Verse"));
			if (vi >= 0) next.splice(vi + 1, 0, "Pre-Chorus");
		}
		if (mod === "Add Post-Chorus" && !next.includes("Post-Chorus")) {
			const ci = next.findIndex((s) => s === "Chorus");
			if (ci >= 0) next.splice(ci + 1, 0, "Post-Chorus");
		}
		if (mod === "Double Chorus Ending") {
			const last = next.lastIndexOf("Final Chorus");
			if (last >= 0) next.splice(last + 1, 0, "Final Chorus (varied)");
			else next.push("Final Chorus (varied)");
		}
		if (mod === "Remove Verse 2") next = next.filter((s) => s !== "Verse 2");
		if (mod === "Remove Bridge") next = next.filter((s) => s !== "Bridge");
		if (mod === "Add Breakdown" && !next.includes("Breakdown")) {
			const bi = next.findIndex((s) => s === "Bridge");
			if (bi >= 0) next.splice(bi, 0, "Breakdown");
			else next.splice(Math.max(next.length - 2, 0), 0, "Breakdown");
		}
		if (mod === "Add Vamp Outro") {
			next = next.filter((s) => s !== "Outro");
			next.push("Vamp");
		}
		if (mod === "Short-Form Hook Cut") next = [
			"Hook Intro",
			"Chorus",
			"Post-Chorus"
		];
	}
	return next;
}
function selectTemplate(opts) {
	const { spine, performance } = opts;
	if (performance === "trailer" || performance === "sync") return "Cinematic Trailer / Hybrid Orchestral Rock (Three-Act)";
	if (performance === "club") return "EDM / Dance (Build-Drop Cycles)";
	if (spine.startsWith("Hip-Hop")) return "Hip-Hop / Trap (Verse-Hook Core)";
	if (spine.startsWith("Metal")) return "Metal / Hard Rock (Riff-Module Logic)";
	if (spine.startsWith("Pop")) return "Modern Pop (Streaming-Era)";
	if (spine.startsWith("Country") || spine.startsWith("Dark Americana")) return "Heartland Rock / Country Rock";
	if (spine.startsWith("Singer")) return "Singer-Songwriter / Acoustic Ballad";
	if (spine.startsWith("Indie")) return "Indie / Alternative (Looser Forms)";
	if (spine.startsWith("R&B") || spine.startsWith("Gospel")) return "R&B / Soul (Vocal Space + Vamp)";
	if (spine.startsWith("EDM")) return "EDM / Dance (Build-Drop Cycles)";
	if (spine.startsWith("Cinematic")) return "Cinematic Trailer / Hybrid Orchestral Rock (Three-Act)";
	if (performance === "radio") return "Radio Rock / Alt Rock";
	if (performance === "short-form") return "Modern Pop (Streaming-Era)";
	return "Modern Pop (Streaming-Era)";
}
function architectSpec(input) {
	const spine = getGenre(input.genreSpine);
	const templateName = input.structureTemplate && input.structureTemplate !== "auto" ? input.structureTemplate : selectTemplate({
		spine: input.genreSpine,
		performance: input.performanceTarget
	});
	const tpl = getTemplate(templateName);
	const mods = [...input.structureMods];
	if (input.performanceTarget === "short-form" && !mods.includes("Short-Form Hook Cut")) mods.push("Streaming Hook Emphasis");
	if (input.performanceTarget === "streaming" && templateName.includes("Ballad")) mods.push("Cold Open Hook");
	const sections = applyMods(tpl.sections, mods);
	const vocal = input.vocalProtocol.trim() || spine.vocal + (input.persona !== "—" ? ` Persona: ${input.persona}.` : "");
	return {
		...input,
		structureTemplate: templateName,
		structureMods: mods,
		structureSections: sections,
		vocalProtocol: vocal,
		emotionPath: input.emotionPath.trim() || "restrained verse → chorus release → bridge shift",
		narrativeArc: input.narrativeArc.trim() || tpl.arcs[0] || "Chaos → Control"
	};
}
function formatSpec(spec) {
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
		spec.toneFlags.length ? `Tone flags: ${spec.toneFlags.join(", ")}` : ""
	].filter(Boolean).join("\n");
}
var PIMP_SYSTEM = `You are P.I.M.P. — Psycho-Intelligence Musical Protocol.
Music = Identity + Tension + Release. One psychological intent per song.
Genre fusion: Primary Spine owns structure + rhythm; Secondary Color owns texture/harmony/vocals.
Routing: K5 → K1 → K2 → K3 → K4.
No filler. Concrete physical grounding. Streaming-era early hook unless spec says otherwise.
Never write in the style of a specific copyrighted song. Never regurgitate published lyrics.

OUTPUT: valid JSON only, no markdown:
{
  "title": string,
  "stylePrompt": string,  // ≤1000 chars, production brief not adjectives
  "lyrics": string        // [Section] tags on their own lines; (staging notes) non-lyrical
}

Lyrics rules:
- Follow the given section list exactly, in order.
- Verse 2 must add ≥2 concrete nouns not in Verse 1.
- Chorus must carry a concrete thesis, not title×3.
- Final chorus must vary a line to show consequence.
- Bridge must contain a stated intention (I will / I won't / I'm gonna + specific act).
- No mythology shorthand (phoenix, Icarus, juggernaut).
- No "rise above", "shattered dreams", "whispers in the dark", "we're all in this together".
- TropeTone as specified.

Style prompt: Identity → Emotion → Genre spine+color → Production behavior → Structure. One short negative clause max.`;
//#endregion
export { architectSpec as a, TEMPLATES as i, PIMP_SYSTEM as n, formatSpec as o, STRUCTURE_MODS as r, getGenre as s, GENRES as t };
