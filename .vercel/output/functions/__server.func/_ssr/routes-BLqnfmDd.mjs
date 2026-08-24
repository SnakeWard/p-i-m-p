import { i as __toESM } from "../_runtime.mjs";
import { R as require_react, v as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { a as architectSpec, i as TEMPLATES$1, n as PIMP_SYSTEM, o as formatSpec, r as STRUCTURE_MODS, s as getGenre, t as GENRES } from "./system-prompt-nkUwiAvs.mjs";
import { a as Package, c as KeyRound, d as Copy, f as Check, i as PenLine, l as FileJson, o as MicVocal, p as AudioLines, r as Sparkles, s as LayoutList, t as Users, u as Cpu } from "../_libs/lucide-react.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BLqnfmDd.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function buildStylePrompt(spec) {
	const spine = getGenre(spec.genreSpine);
	const color = spec.genreColor !== "none" ? getGenre(spec.genreColor) : null;
	const fusion = color ? `Primary spine ${spine.name} owns structure + rhythm (${spine.rhythm}). Secondary color ${color.name} owns texture/harmony/vocals (${color.instruments}; ${color.harmony}).` : `${spine.name} as sole identity. ${spine.rhythm}. ${spine.instruments}.`;
	const tempo = spec.performanceTarget === "club" ? "dance-tempo four-on-the-floor" : spec.performanceTarget === "trailer" ? "hit-based hybrid percussion, no groove grid" : spec.structureTemplate.includes("Ballad") ? "slow burn" : "mid-tempo streaming feel";
	const vocal = spec.vocalProtocol || spine.vocal;
	const flags = spec.toneFlags.length ? `Tone flags: ${spec.toneFlags.join(", ")}.` : "";
	const mix = "Artist Pitch Demo — Studio Fidelity Mix — Clear Lead Vocal. Forward vocal, controlled low-end, verse intimacy vs chorus width. Avoid glossy autotune.";
	const sections = spec.structureSections.length ? `Structure: ${spec.structureSections.join(" → ")}.` : "";
	return [
		`${tempo}. ${fusion}`,
		`Emotion path: ${spec.emotionPath}. Narrative arc: ${spec.narrativeArc}. Intent: ${spec.intent}.`,
		`Lead vocal: ${vocal}. ${flags}`,
		`Instrumentation behavior: ${spine.instruments}${color ? `; color accents: ${color.instruments}` : ""}.`,
		sections,
		mix
	].filter(Boolean).join(" ").slice(0, 1e3);
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function uid(prefix = "id") {
	return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
function nowIso() {
	return (/* @__PURE__ */ new Date()).toISOString();
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
		hook: "standard",
		function: "Identity in verse storytelling; release in anthemic chorus.",
		chooseWhen: "guitar-driven spine; chorus earned but inevitable",
		anchors: "Since U Been Gone"
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
		hook: "standard",
		function: "Concrete narrative in verses; chorus states the truth.",
		chooseWhen: "lyric-first storytelling over steady 4/4",
		anchors: "Country Roads"
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
			"Tag"
		],
		hook: "early",
		function: "Rapid identity; pre lifts; chorus arrival; post extends payoff.",
		chooseWhen: "maximal hook density, streaming intent",
		anchors: "Shape of You"
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
		hook: "standard",
		function: "Slow burn; sparse sections; single pivot unlocks release.",
		chooseWhen: "sparse instrumentation, introspection-first",
		anchors: "Yesterday"
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
		hook: "early",
		function: "Coherence with permission to deviate.",
		chooseWhen: "texture/attitude over repetition",
		anchors: "1979"
	},
	{
		name: "Metal / Hard Rock (Riff-Module Logic)",
		sections: [
			"Intro",
			"Verse 1",
			"Pre-Chorus",
			"Chorus",
			"Verse 2",
			"Pre-Chorus",
			"Chorus",
			"Breakdown",
			"Solo",
			"Final Chorus",
			"Outro"
		],
		hook: "standard",
		function: "Riffs as identity modules; breakdown shifts weight.",
		chooseWhen: "riff anchors + aggressive percussion",
		anchors: "Enter Sandman"
	},
	{
		name: "Hip-Hop / Trap (Verse-Hook Core)",
		sections: [
			"Hook Intro",
			"Hook",
			"Verse 1",
			"Hook",
			"Verse 2",
			"Hook",
			"Bridge",
			"Hook"
		],
		hook: "early",
		function: "Hook is the headline; verses deliver detail and escalation.",
		chooseWhen: "bar-structured flow and hook loop",
		anchors: "verse-hook core"
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
		hook: "early",
		function: "Tension-and-release; the drop is the functional chorus.",
		chooseWhen: "four-on-the-floor; energy contour IS the song",
		anchors: "build-drop"
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
		hook: "standard",
		function: "Vocal nuance first; vamp is the catharsis zone.",
		chooseWhen: "vocal timbre, runs, and groove lead",
		anchors: "vamp outro"
	},
	{
		name: "Cinematic Trailer / Hybrid Orchestral Rock (Three-Act)",
		sections: [
			"Prologue",
			"Build",
			"Climax",
			"Aftermath"
		],
		hook: "early",
		function: "Three-act escalation; climax motif replaces the chorus.",
		chooseWhen: "orchestral + hybrid percussion; trailer-ready",
		anchors: "three-act trailer"
	}
];
function getTemplate(name) {
	return TEMPLATES.find((t) => t.name === name) ?? TEMPLATES[2];
}
function detectConflicts(spec) {
	const alerts = [];
	const genre = getGenre(spec.genreSpine);
	const tmpl = getTemplate(spec.structureTemplate);
	if (genre.defaultTemplate !== spec.structureTemplate) {
		const streamingPopOnMetal = spec.genreSpine.includes("Metal") && spec.structureTemplate.includes("Pop");
		const cinematicAsked = spec.performanceTarget === "trailer" || spec.performanceTarget === "sync";
		if (streamingPopOnMetal) alerts.push({
			field: "structureTemplate",
			issue: "Metal spine on a pop-with-distortion form. Riffs need module logic.",
			fix: genre.defaultTemplate
		});
		else if (cinematicAsked && !spec.structureTemplate.includes("Cinematic")) alerts.push({
			field: "structureTemplate",
			issue: "Trailer/sync target needs a three-act cinematic chassis.",
			fix: "Cinematic Trailer / Hybrid Orchestral Rock (Three-Act)"
		});
	}
	if (spec.genreSpine === spec.genreColor) alerts.push({
		field: "genreColor",
		issue: "Spine and color are the same genre — fusion is decorative.",
		fix: "none"
	});
	if (spec.performanceTarget === "streaming" && tmpl.hook === "delayed" && !spec.structureMods.includes("Cold Open Hook")) alerts.push({
		field: "structureMods",
		issue: "Streaming target with a delayed hook. Early payoff is the default.",
		fix: "Cold Open Hook"
	});
	if (!spec.vocalProtocol.toLowerCase().includes("lead")) alerts.push({
		field: "vocalProtocol",
		issue: "Unclear singer identity — vocal performance will drift.",
		fix: "Declare gender, age, timbre, and delivery."
	});
	if (spec.genreSpine.includes("Pop") && spec.tropeCheck === "off") alerts.push({
		field: "tropeCheck",
		issue: "Pop is STRICT trope tier. Off-mode invites chorus cliché.",
		fix: "standard"
	});
	return alerts;
}
var scanConflicts = detectConflicts;
var TIER0_MYTH = [
	/\bphoenix\b/i,
	/\bicarus\b/i,
	/\bjuggernaut\b/i,
	/\btitan\b/i,
	/\brise from the ashes\b/i
];
var TIER1_PHRASES = [
	"rise above",
	"shattered dreams",
	"neon lights",
	"concrete jungle",
	"city of angels",
	"sin city",
	"broken dreams",
	"whispers in the dark",
	"echoes of the night",
	"fire burns inside",
	"can't go on without you",
	"we're all in this together",
	"tomorrow it gets better",
	"gonna rise",
	"break free",
	"make it through the night"
];
var GENERIC_SLOGANS = [
	/we will rise above the pain/i,
	/i can't go on without you/i,
	/the fire burns inside my soul/i,
	/lost inside the silence/i,
	/your shadow follows me/i
];
var ABSTRACT = [
	"pain",
	"soul",
	"dreams",
	"destiny",
	"hope",
	"love",
	"heart",
	"fate",
	"eternity",
	"forever",
	"silence",
	"darkness",
	"light",
	"shadow",
	"echoes",
	"whispers",
	"grace",
	"glory"
];
var CONCRETE_HINTS = [
	"door",
	"alarm",
	"counter",
	"lease",
	"pharmacy",
	"jacket",
	"nightstand",
	"windshield",
	"shift",
	"key",
	"amp",
	"ring",
	"dog",
	"kitchen",
	"porch",
	"receipt",
	"bus",
	"parking",
	"paycheck",
	"voicemail",
	"ashtray",
	"boot",
	"meter",
	"locker",
	"badge",
	"third shift"
];
function tokenize(line) {
	return line.toLowerCase().replace(/[^a-z0-9'\s]/g, " ").split(/\s+/).filter(Boolean);
}
function parseSections(lyrics) {
	const lines = lyrics.replace(/\r\n/g, "\n").split("\n");
	const sections = [];
	let current = {
		name: "Ungrouped",
		lines: []
	};
	sections.push(current);
	for (const raw of lines) {
		const trimmed = raw.trim();
		const tag = trimmed.match(/^\[([^\]]+)\]$/);
		if (tag) {
			current = {
				name: tag[1],
				lines: []
			};
			sections.push(current);
			continue;
		}
		if (!trimmed) continue;
		const staging = /^\(.*\)$/.test(trimmed);
		current.lines.push({
			raw: trimmed,
			lyric: !staging
		});
	}
	return sections.filter((s) => s.lines.length > 0);
}
function cdsFor(line) {
	const lower = line.toLowerCase();
	if (GENERIC_SLOGANS.some((r) => r.test(line))) return 0;
	const tokens = tokenize(line);
	const abs = tokens.filter((t) => ABSTRACT.includes(t)).length;
	const conc = CONCRETE_HINTS.filter((c) => lower.includes(c)).length;
	if (conc >= 2 && abs <= 1) return 4;
	if (conc >= 1 && tokens.length > 5) return 3;
	if (conc >= 1) return 2;
	if (abs >= 2 || TIER1_PHRASES.some((p) => lower.includes(p))) return 1;
	if (tokens.length <= 5 && abs >= 1) return 1;
	return 2;
}
function detectClasses(line, section) {
	const classes = [];
	const lower = line.toLowerCase();
	if (TIER0_MYTH.some((r) => r.test(line))) classes.push("FC-2");
	if (/and then i (realized|knew|understood)/i.test(line) && /bridge/i.test(section)) classes.push("FC-3");
	if (TIER1_PHRASES.some((p) => lower.includes(p))) classes.push("FC-5");
	if (/we're all in this together|all of us|everybody feels/i.test(line)) classes.push("FC-6");
	if (/tomorrow (it )?gets better|one day we'll/i.test(line)) classes.push("FC-7");
	if (/you're everything|nothing matters but/i.test(line)) classes.push("FC-8");
	if (/\bborrowed (light|grace|time|name|destiny)\b/i.test(line)) classes.push("ADD-1");
	const abs = tokenize(line).filter((t) => ABSTRACT.includes(t)).length;
	if (abs > CONCRETE_HINTS.filter((c) => lower.includes(c)).length && abs >= 2) classes.push("FC-1");
	if ([/like a (bird|river|fire|shadow)/i, /hope flies|dreams bleed|heart screams/i].filter((r) => r.test(line)).length >= 1 && abs >= 2) classes.push("FC-4");
	return [...new Set(classes)];
}
function rewriteLine(line, spec) {
	const object = (spec.title || "the unpaid invoice").split(" ")[0] || "counter";
	return line.replace(/rise above( the pain)?/gi, `climb the ${object} stairs on third shift`).replace(/shattered dreams/gi, "the lease unsigned on the counter").replace(/whispers in the dark/gi, "your key still scraping the lock").replace(/broken dreams/gi, "the voicemail I never deleted").replace(/we're all in this together/gi, "the night crew still clocks the same door").replace(/fire burns inside my soul/gi, "the kettle clicks off and I still wait").replace(/i can't go on without you/gi, "I still set two alarms for a house of one").replace(/lost inside the silence/gi, "the fridge hums louder than the hallway").replace(/you're everything/gi, `you left the ${object} and took the reasons`).replace(/and then i realized.+/gi, "I will leave the spare key on the meter");
}
function interchangeability(line) {
	return GENERIC_SLOGANS.some((r) => r.test(line)) || TIER1_PHRASES.some((p) => line.toLowerCase().includes(p));
}
function runK2(lyrics, spec) {
	if (spec.tropeCheck === "off") return {
		mode: "off",
		lines: [],
		changes: [],
		sectionFailures: [],
		binding: [],
		passed: true
	};
	const sections = parseSections(lyrics);
	const reports = [];
	const changes = [];
	const sectionFailures = [];
	const binding = [];
	const strict = spec.tropeCheck === "strict";
	const verseNouns = {};
	for (const section of sections) {
		const lyricLines = section.lines.filter((l) => l.lyric);
		let tier1Window = 0;
		for (let i = 0; i < lyricLines.length; i++) {
			const line = lyricLines[i].raw;
			const classes = detectClasses(line, section.name);
			let cds = cdsFor(line);
			if (classes.includes("FC-2") || classes.includes("FC-3")) cds = 0;
			let verdict = "PASS";
			let note = "";
			let rewrite;
			if (classes.includes("FC-2") || classes.includes("FC-3") || cds === 0) {
				verdict = "BLOCK";
				note = "Tier 0 / portable slogan — replace with scene anchoring";
				rewrite = rewriteLine(line, spec);
			} else if (classes.length || cds <= 2) {
				if (interchangeability(line) || cds <= 1) {
					verdict = "REWRITE";
					note = `CDS ${cds}${classes.length ? ` · ${classes.join(", ")}` : ""}`;
					rewrite = rewriteLine(line, spec);
				} else {
					verdict = "CONDITIONAL";
					note = "Concrete detail is decorative until a later line binds it";
					binding.push(`${section.name} L${i + 1}: later lyric must bind this object`);
				}
			}
			if (strict && /chorus/i.test(section.name) && classes.includes("FC-5")) {
				verdict = "REWRITE";
				note = "STRICT: Tier 1 in chorus auto-rewrites";
				rewrite = rewriteLine(line, spec);
			}
			if (verdict === "REWRITE" || verdict === "BLOCK") changes.push(`[${section.name}/L${i + 1}] ${classes[0] ?? "CDS" + cds} → T2: ${rewrite}`);
			if (classes.includes("FC-5") || classes.includes("FC-1")) tier1Window += 1;
			reports.push({
				section: section.name,
				index: i,
				line,
				cds,
				classes,
				verdict,
				note,
				rewrite
			});
			if (/verse/i.test(section.name)) {
				verseNouns[section.name] ??= /* @__PURE__ */ new Set();
				for (const c of CONCRETE_HINTS) if (line.toLowerCase().includes(c)) verseNouns[section.name].add(c);
			}
		}
		if (tier1Window >= 3) sectionFailures.push(`${section.name}: 3+ Tier 1 tropes in window`);
		if (/verse/i.test(section.name) && (verseNouns[section.name]?.size ?? 0) < 3) sectionFailures.push(`${section.name}: fewer than 3 concrete anchors`);
	}
	const v1 = verseNouns["Verse 1"];
	const v2 = verseNouns["Verse 2"];
	if (v1 && v2) {
		if ([...v2].filter((n) => !v1.has(n)).length < 2) sectionFailures.push("Verse 2 must add ≥2 concrete nouns absent from Verse 1");
	}
	const choruses = reports.filter((r) => /chorus/i.test(r.section));
	const firstC = choruses.filter((r) => r.section === "Chorus");
	const finalC = choruses.filter((r) => /final/i.test(r.section));
	if (firstC.length && finalC.length && firstC.map((r) => r.line).join("\n") === finalC.map((r) => r.line).join("\n")) sectionFailures.push("QG-4: Final chorus identical to first");
	const passed = reports.every((r) => r.verdict === "PASS" || r.verdict === "CONDITIONAL") && sectionFailures.length === 0;
	return {
		mode: spec.tropeCheck,
		lines: reports,
		changes,
		sectionFailures,
		binding,
		passed
	};
}
function applySilentRewrites(lyrics, report) {
	if (report.mode === "off") return lyrics;
	let out = lyrics;
	for (const line of report.lines) if ((line.verdict === "REWRITE" || line.verdict === "BLOCK") && line.rewrite) out = out.replace(line.line, line.rewrite);
	return out;
}
var SEED_PD = [
	{
		collection: "human_pd",
		title: "Amazing Grace (PD)",
		lyrics: `[Verse 1]
Amazing grace, how sweet the sound
That saved a wretch like me
I once was lost, but now am found
Was blind, but now I see`,
		provenance: "John Newton, 1779 — public domain",
		license: "PD",
		humanOverride: ""
	},
	{
		collection: "human_pd",
		title: "House of the Rising Sun (traditional PD verses)",
		lyrics: `[Verse 1]
There is a house in New Orleans
They call the Rising Sun
It's been the ruin of many a poor boy
And God, I know I'm one`,
		provenance: "Traditional folk — public domain verses",
		license: "PD",
		humanOverride: ""
	},
	{
		collection: "human_pd",
		title: "Barbara Allen (PD)",
		lyrics: `[Verse 1]
In Scarlet Town where I was born
There was a fair maid dwellin'
Made every youth cry well-a-day
Her name was Barbara Allen`,
		provenance: "Child ballad — public domain",
		license: "PD",
		humanOverride: ""
	}
];
function annotateRecord(rec, spec) {
	const full = {
		title: rec.title,
		persona: spec?.persona ?? "—",
		genreSpine: spec?.genreSpine ?? "Singer-Songwriter / Folk",
		genreColor: spec?.genreColor ?? "none",
		narrativeArc: spec?.narrativeArc ?? "Ritual→Ascension",
		emotionPath: spec?.emotionPath ?? "testimonial",
		structureTemplate: spec?.structureTemplate ?? "Singer-Songwriter / Acoustic Ballad",
		structureSections: spec?.structureSections ?? [],
		structureMods: spec?.structureMods ?? [],
		vocalProtocol: spec?.vocalProtocol ?? "close-mic",
		performanceTarget: spec?.performanceTarget ?? "streaming",
		tropeCheck: spec?.tropeCheck ?? "standard",
		tropeTone: spec?.tropeTone ?? "Plainspoken",
		intent: spec?.intent ?? rec.title,
		toneFlags: spec?.toneFlags ?? []
	};
	return {
		...rec,
		annotation: runK2(rec.lyrics, full),
		specSnapshot: spec
	};
}
function makeRecord(partial) {
	const rec = {
		id: uid("lyr"),
		createdAt: nowIso(),
		annotation: null,
		...partial,
		humanOverride: partial.humanOverride ?? ""
	};
	return annotateRecord(rec, rec.specSnapshot);
}
function runSuites(records) {
	const by = (c) => records.filter((r) => r.collection === c);
	const human = by("human_pd");
	const ai = by("ai_permissive");
	const self = by("self_generated");
	const meanCds = (list) => {
		const lines = list.flatMap((r) => r.annotation?.lines ?? []);
		if (!lines.length) return 0;
		return lines.reduce((a, l) => a + l.cds, 0) / lines.length;
	};
	const flagRate = (list) => {
		const lines = list.flatMap((r) => r.annotation?.lines ?? []);
		if (!lines.length) return 0;
		return lines.filter((l) => l.verdict !== "PASS").length / lines.length;
	};
	const detection = {
		name: "Detection accuracy (proxy)",
		summary: "Without labeled ground-truth, this reports flag rate and mean CDS per collection. Human override tags become gold labels when present.",
		metrics: {
			human_flag_rate: flagRate(human),
			ai_flag_rate: flagRate(ai),
			self_flag_rate: flagRate(self),
			n_human: human.length,
			n_ai: ai.length,
			n_self: self.length
		},
		notes: records.filter((r) => r.humanOverride).map((r) => `${r.title}: override “${r.humanOverride}”`)
	};
	const genre = {
		name: "Genre-strictness calibration",
		summary: "Share of BLOCK verdicts — should be rare in PD folk, higher in synthetic slogans.",
		metrics: { block_share: records.flatMap((r) => r.annotation?.lines ?? []).filter((l) => l.verdict === "BLOCK").length / Math.max(1, records.flatMap((r) => r.annotation?.lines ?? []).length) },
		notes: []
	};
	const rewrite = {
		name: "Rewrite ladder effectiveness",
		summary: "Count of REWRITE/BLOCK lines that produced a T2 rewrite string.",
		metrics: {
			rewrite_offered: records.flatMap((r) => r.annotation?.lines ?? []).filter((l) => l.rewrite).length,
			rewrite_needed: records.flatMap((r) => r.annotation?.lines ?? []).filter((l) => l.verdict === "REWRITE" || l.verdict === "BLOCK").length
		},
		notes: []
	};
	const divergence = {
		name: "Cross-corpus divergence",
		summary: "Mean CDS human_pd vs ai_permissive vs self_generated. Collections must stay separated.",
		metrics: {
			cds_human: meanCds(human),
			cds_ai: meanCds(ai),
			cds_self: meanCds(self)
		},
		notes: ["Never mix collections for primary precision/recall.", "Self-plugs feed only the overuse suite."]
	};
	const termFreq = {};
	for (const rec of self) for (const w of rec.lyrics.toLowerCase().match(/[a-z']{4,}/g) ?? []) termFreq[w] = (termFreq[w] ?? 0) + 1;
	const overused = Object.entries(termFreq).filter(([, n]) => n >= 4).sort((a, b) => b[1] - a[1]).slice(0, 12);
	return [
		detection,
		genre,
		rewrite,
		divergence,
		{
			name: "Self-overuse / internal drift",
			summary: "Terms recurring ≥4 times across self_generated plugs (last corpus).",
			metrics: {
				unique_overused: overused.length,
				self_n: self.length
			},
			notes: overused.map(([w, n]) => `${w} × ${n}`)
		}
	];
}
function toJsonl(records) {
	return records.map((r) => JSON.stringify(r)).join("\n");
}
var PALETTES = {
	wrathful: "crimson, black, ember orange",
	mournful: "slate blue, ash gray, cold white",
	hopeful: "gold, ivory, sky blue",
	haunted: "deep teal, charcoal, violet haze",
	triumphant: "gold, red, obsidian",
	intimate: "warm amber, dusty rose, midnight blue",
	apocalyptic: "burnt orange, ash black, sickly yellow",
	redemptive: "white, gold, indigo",
	yearning: "faded rose, dusk violet, pale gold",
	defiant: "steel gray, blood red, off-white",
	nostalgic: "sepia, cream, washed teal",
	serene: "seafoam, bone white, soft slate"
};
function moodFrom(path) {
	const p = path.toLowerCase();
	if (p.includes("grief") || p.includes("mourn")) return "mournful";
	if (p.includes("haunt")) return "haunted";
	if (p.includes("defiant") || p.includes("anger")) return "defiant";
	if (p.includes("hope") || p.includes("lift")) return "hopeful";
	if (p.includes("yearn")) return "yearning";
	if (p.includes("triumph")) return "triumphant";
	if (p.includes("intimate") || p.includes("tender")) return "intimate";
	if (p.includes("redempt")) return "redemptive";
	return "haunted";
}
function hookType(spec) {
	const g = spec.genreSpine.toLowerCase();
	const e = spec.emotionPath.toLowerCase();
	if (g.includes("metal") || e.includes("venge")) return "shock";
	if (g.includes("country") || g.includes("americana")) return "cinematic";
	if (g.includes("edm")) return "beat-drop";
	if (e.includes("grief") || e.includes("love") || e.includes("redempt")) return "emotional";
	return "curiosity";
}
function buildRelease(spec, lyrics) {
	const palette = PALETTES[moodFrom(spec.emotionPath)] ?? "black, gray, white";
	const genre = getGenre(spec.genreSpine);
	const hook = hookType(spec);
	const strongest = lyrics.split("\n").map((l) => l.trim()).find((l) => l && !l.startsWith("[") && !l.startsWith("(")) ?? spec.title;
	const coverPrompt = [
		"professional-grade cinematic album cover",
		`${spec.genreSpine}${spec.genreColor !== "none" ? ` with ${spec.genreColor} color` : ""}`,
		`color palette of ${palette}`,
		"symbolic elements: single subject, empty chair or unplowed road, one lit window",
		`textures: ${genre.visuals}`,
		"cinematic dramatic lighting, balanced story-driven framing",
		"albumCover, square, center-weighted, crop-safe subject",
		"3000x3000, 1:1",
		"ultra-detailed, emotionally resonant, polished release-ready finish",
		"no lettering, no typography"
	].join(", ");
	const negative = "extra fingers, extra limbs, mangled hands, blurry face, generic neon city, floating random objects, text artifacts, watermark, signature, logo clutter, plastic skin, unreadable typography, oversaturated AI glow, deformed anatomy";
	const beat = hook === "shock" ? "0.0–1.2: TITLE hard cut → 1.2–3.0: kinetic text of the conflict line, no warm-up" : hook === "emotional" ? `0.0–2.0: setup — slow zoom on the object → 2.0–5.0: payoff line “${strongest}”` : hook === "cinematic" ? "0.0–2.0: title over lantern dusk / empty road → 2.0–5.0: camera push, something is coming" : hook === "beat-drop" ? "0.0–2.0: pre-drop crop, restrained → 2.0–4.0: smash cut on drop" : `0.0–2.5: a question built from the stakes → 2.5–5.0: reveal title “${spec.title}”`;
	const caption = `${spec.title} is out. ${spec.genreSpine.replace(/\s+/g, " ")}. ${spec.emotionPath}.`;
	const shortCaption = `${spec.title} — out now.`;
	const tags = [
		"#NewMusic",
		"#OriginalSong",
		`#${spec.genreSpine.split(" ")[0].replace(/[^A-Za-z]/g, "")}`,
		`#${spec.title.replace(/[^A-Za-z0-9]/g, "")}`
	].slice(0, 8);
	return {
		coverPrompt,
		negativePrompt: negative,
		coverAlts: [coverPrompt + ", minimalist variant with stronger negative space", coverPrompt + ", poster-like variant with more dramatic scale, vertical"],
		hookType: hook,
		hookPlan: `TikTok / Reels / Shorts · 9:16 · 5–15s · caption-safe lower third · ${hook}\n${beat}\nCTA: Out now`,
		caption,
		shortCaption,
		hashtags: tags,
		facebook: `${caption}\n\n${tags.join(" ")}`,
		instagram: `${caption}\n.\n.\n${tags.join(" ")}`,
		tiktok: `${spec.title} // Out now\n${tags.join(" ")}`
	};
}
function scaffoldLyrics(spec) {
	const title = spec.title || "Unsigned Lease";
	const sections = spec.structureSections.length ? spec.structureSections : [
		"Verse 1",
		"Chorus",
		"Verse 2",
		"Chorus",
		"Bridge",
		"Final Chorus"
	];
	const verse1 = [
		"[Verse 1]",
		"(close-mic; dry room)",
		"Third shift ended and I still set two alarms",
		"Your sister waved me down outside the pharmacy",
		"The lease renewal's still unsigned on the counter",
		"I keep the mug you chipped in December"
	];
	const verse2 = [
		"[Verse 2]",
		"(add bass; still restrained)",
		"The spare key hangs on the meter by the alley",
		"I paid the dog's shot with the ring you pawned",
		"Voicemail 14 still says you'll be late",
		"I eat the cold side of the casserole anyway"
	];
	const chorus = [
		"[Chorus]",
		"(widen; stacked air, not belted)",
		`${title} on the Formica, curling at the edge`,
		"I initial every line except the one with your name",
		"The porch light stays on for a truck that doesn't turn in",
		`${title} — I keep signing around it`
	];
	const finalChorus = [
		"[Final Chorus]",
		"(consequence of the bridge; vary last line)",
		`${title} on the Formica, curling at the edge`,
		"I initial every line except the one with your name",
		"The porch light stays on for a truck that doesn't turn in",
		`${title} — I leave the pen and lock the door`
	];
	const bridge = [
		"[Bridge]",
		"(pull back; spoken-sung)",
		"I will drop the spare key in the mailbox Tuesday",
		"I won't set the second alarm after that"
	];
	const hook = [
		"[Hook]",
		`${title} — I keep signing around it`,
		"Porch light on, truck never turns in"
	];
	const extra = {
		Intro: ["[Intro]", "(instrumental motif; no lyric)"],
		"Hook Intro": ["[Hook Intro]", `${title} — I keep signing around it`],
		"Pre-Chorus": [
			"[Pre-Chorus]",
			"(lift: drums tighten)",
			"The kettle clicks and I still wait for two cups"
		],
		"Post-Chorus": [
			"[Post-Chorus]",
			"(hook tag, no new story)",
			"Signing around it"
		],
		Outro: [
			"[Outro]",
			"(button)",
			"I leave the pen."
		],
		Vamp: [
			"[Vamp]",
			"(ad-lib space)",
			"Leave the pen — leave the pen"
		],
		Breakdown: [
			"[Breakdown]",
			"(half-weight)",
			"Mailbox Tuesday"
		],
		"Act I Setup": ["[Act I Setup]", "State the destination: I leave Tuesday."],
		"Act II Build": ["[Act II Build]", ...verse1.slice(2)],
		"Act III Climax": ["[Act III Climax]", ...chorus.slice(2)],
		Aftermath: ["[Aftermath]", "The second alarm stays dark."],
		Drop: ["[Drop]", title],
		"Build 1": [
			"[Build 1]",
			"(filter opens)",
			"Two alarms, one house"
		],
		"Build 2": [
			"[Build 2]",
			"(bigger)",
			"Mailbox Tuesday"
		],
		Break: [
			"[Break]",
			"(theme)",
			title
		],
		"C-Section": ["[C-Section]", "New world: I eat at the counter facing the lot"],
		Instrumental: ["[Instrumental]"],
		Solo: ["[Solo]"],
		"Cold Open": ["[Cold Open]", "Third shift ended and I still set two alarms"]
	};
	const out = [];
	const usedChorus = { n: 0 };
	for (const name of sections) {
		if (name === "Verse 1") out.push(...verse1);
		else if (name === "Verse 2") out.push(...verse2);
		else if (name === "Verse 3") out.push("[Verse 3]", "The landlord's card is still in the junk drawer", "I write my new address on the back of a receipt");
		else if (name === "Chorus" || name === "Hook") {
			usedChorus.n += 1;
			out.push(...name === "Hook" ? hook : chorus);
		} else if (name.startsWith("Final Chorus")) out.push(...finalChorus);
		else if (name === "Bridge") out.push(...bridge);
		else if (extra[name]) out.push(...extra[name]);
		else out.push(`[${name}]`, `(${spec.emotionPath})`, title);
		out.push("");
	}
	return out.join("\n").trim();
}
var EMPTY_SPEC = {
	title: "",
	persona: "—",
	genreSpine: "",
	genreColor: "none",
	narrativeArc: "Chaos → Control",
	emotionPath: "restrained verse → chorus release",
	structureTemplate: "Modern Pop (Streaming-Era)",
	structureSections: [],
	structureMods: [],
	vocalProtocol: "forward, conversational verse; stacked hook",
	performanceTarget: "streaming",
	tropeCheck: "standard",
	tropeTone: "Poetic",
	intent: "",
	toneFlags: []
};
var DEFAULT_PROVIDERS = [
	{
		id: "grok",
		label: "Grok (xAI native)",
		key: "",
		baseUrl: "https://api.x.ai/v1",
		model: "grok-4.5"
	},
	{
		id: "openai",
		label: "OpenAI",
		key: "",
		baseUrl: "https://api.openai.com/v1",
		model: "gpt-4.1"
	},
	{
		id: "gemini",
		label: "Gemini",
		key: "",
		baseUrl: "https://generativelanguage.googleapis.com/v1beta",
		model: "gemini-2.5-flash"
	},
	{
		id: "deepseek",
		label: "DeepSeek",
		key: "",
		baseUrl: "https://api.deepseek.com",
		model: "deepseek-chat"
	}
];
function activeTrack(tracks, id) {
	return tracks.find((t) => t.id === id) ?? null;
}
var BASE_SPEC = {
	...EMPTY_SPEC,
	genreSpine: "Pop (streaming-era)"
};
var usePimp = create()(persist((set, get) => ({
	phase: "intent",
	draft: { ...BASE_SPEC },
	conflicts: [],
	tracks: [],
	activeId: null,
	personas: [{
		id: "persona_vesper",
		name: "Vesper Hollow",
		voice: "female, late 20s, raspy but intimate, restrained then emotionally fragile; close-mic, worn, rarely belts until the last chorus",
		visual: "lantern dusk, dust, old wood, wide lonely frames, brimmed-hat shadow, no glamour",
		houseTemplate: "Heartland Rock / Country Rock",
		createdAt: "2026-07-01T00:00:00.000Z"
	}, {
		id: "persona_ash",
		name: "Ash Calder",
		voice: "male, early 30s, close-mic, worn, vulnerable; tight 2nd male harmony above lead in chorus; never glossy autotune",
		visual: "smoke, scratched metal, stage haze, hard edge highlights, heavy negative space",
		houseTemplate: "Radio Rock / Alt Rock",
		createdAt: "2026-07-01T00:00:00.000Z"
	}],
	corpus: SEED_PD.map((s) => makeRecord({
		...s,
		humanOverride: s.humanOverride ?? ""
	})),
	moduleVersions: [],
	providers: DEFAULT_PROVIDERS,
	defaultGenerateProvider: "grok",
	defaultEvalProvider: "grok",
	selfPlugOptIn: false,
	generating: false,
	lastError: null,
	setPhase: (phase) => set({ phase }),
	patchDraft: (p) => set({ draft: {
		...get().draft,
		...p
	} }),
	toggleMod: (mod) => {
		const mods = get().draft.structureMods;
		const next = mods.includes(mod) ? mods.filter((m) => m !== mod) : [...mods, mod];
		set({ draft: {
			...get().draft,
			structureMods: next
		} });
	},
	toggleTone: (flag) => {
		const flags = get().draft.toneFlags;
		const next = flags.includes(flag) ? flags.filter((f) => f !== flag) : [...flags, flag];
		set({ draft: {
			...get().draft,
			toneFlags: next
		} });
	},
	lockSpec: () => {
		const spec = architectSpec(get().draft);
		const conflicts = scanConflicts(spec);
		const style = buildStylePrompt(spec);
		const current = activeTrack(get().tracks, get().activeId);
		const track = current ? {
			...current,
			spec,
			stylePrompt: style,
			updatedAt: nowIso()
		} : {
			id: uid("trk"),
			createdAt: nowIso(),
			updatedAt: nowIso(),
			spec,
			stylePrompt: style,
			lyrics: "",
			tropeReport: null,
			release: null,
			selfPlugged: false,
			providerUsed: "none"
		};
		set({
			draft: spec,
			conflicts,
			tracks: current ? get().tracks.map((t) => t.id === track.id ? track : t) : [track, ...get().tracks],
			activeId: track.id,
			phase: "spec"
		});
	},
	setLyrics: (lyrics) => {
		const id = get().activeId;
		if (!id) return;
		set({ tracks: get().tracks.map((t) => t.id === id ? {
			...t,
			lyrics,
			updatedAt: nowIso()
		} : t) });
	},
	setStyle: (stylePrompt) => {
		const id = get().activeId;
		if (!id) return;
		set({ tracks: get().tracks.map((t) => t.id === id ? {
			...t,
			stylePrompt,
			updatedAt: nowIso()
		} : t) });
	},
	runQc: () => {
		const t = activeTrack(get().tracks, get().activeId);
		if (!t?.lyrics) return;
		let report = runK2(t.lyrics, t.spec);
		let lyrics = t.lyrics;
		if (t.spec.tropeCheck === "standard") {
			lyrics = applySilentRewrites(lyrics, report);
			report = runK2(lyrics, t.spec);
		}
		set({ tracks: get().tracks.map((x) => x.id === t.id ? {
			...x,
			lyrics,
			tropeReport: report,
			updatedAt: nowIso()
		} : x) });
	},
	applyRewrites: () => {
		const t = activeTrack(get().tracks, get().activeId);
		if (!t?.tropeReport) return;
		const lyrics = applySilentRewrites(t.lyrics, t.tropeReport);
		const report = runK2(lyrics, t.spec);
		set({ tracks: get().tracks.map((x) => x.id === t.id ? {
			...x,
			lyrics,
			tropeReport: report,
			updatedAt: nowIso()
		} : x) });
	},
	buildReleasePackage: () => {
		const t = activeTrack(get().tracks, get().activeId);
		if (!t) return;
		const release = buildRelease(t.spec, t.lyrics);
		set({
			tracks: get().tracks.map((x) => x.id === t.id ? {
				...x,
				release,
				updatedAt: nowIso()
			} : x),
			phase: "release"
		});
	},
	saveTrack: () => {
		const t = activeTrack(get().tracks, get().activeId);
		if (!t) return;
		set({ tracks: get().tracks.map((x) => x.id === t.id ? {
			...x,
			updatedAt: nowIso()
		} : x) });
	},
	loadTrack: (id) => {
		const t = get().tracks.find((x) => x.id === id);
		if (!t) return;
		set({
			activeId: id,
			draft: t.spec,
			phase: "spec",
			conflicts: scanConflicts(t.spec)
		});
	},
	newTrack: () => {
		set({
			draft: { ...BASE_SPEC },
			conflicts: [],
			activeId: null,
			phase: "intent",
			lastError: null
		});
	},
	loadExample: () => {
		const draft = {
			...BASE_SPEC,
			title: "Unsigned Lease",
			intent: "Leave without a speech — lock the door on a life already gone.",
			genreSpine: "Country / Heartland Rock",
			genreColor: "Indie / Alternative",
			narrativeArc: "Dominance→Surrender",
			emotionPath: "restrained verse → defiant chorus → quiet resolve",
			vocalProtocol: "male, late 30s, worn, close-mic, no belting until last line",
			performanceTarget: "streaming",
			tropeCheck: "standard",
			persona: "—"
		};
		const spec = architectSpec(draft);
		const lyrics = scaffoldLyrics(spec);
		const style = buildStylePrompt(spec);
		let report = runK2(lyrics, spec);
		const gated = applySilentRewrites(lyrics, report);
		report = runK2(gated, spec);
		const track = {
			id: uid("trk"),
			createdAt: nowIso(),
			updatedAt: nowIso(),
			spec,
			stylePrompt: style,
			lyrics: gated,
			tropeReport: report,
			release: buildRelease(spec, gated),
			selfPlugged: false,
			providerUsed: "scaffold"
		};
		set({
			draft: spec,
			conflicts: scanConflicts(spec),
			tracks: [track, ...get().tracks],
			activeId: track.id,
			phase: "lyrics"
		});
	},
	setGenerating: (generating) => set({ generating }),
	setLastError: (lastError) => set({ lastError }),
	applyGeneration: (lyrics, style, providerUsed) => {
		const t = activeTrack(get().tracks, get().activeId);
		if (!t) return;
		let report = runK2(lyrics, t.spec);
		let gated = lyrics;
		if (t.spec.tropeCheck === "standard") {
			gated = applySilentRewrites(lyrics, report);
			report = runK2(gated, t.spec);
		}
		set({
			tracks: get().tracks.map((x) => x.id === t.id ? {
				...x,
				lyrics: gated,
				stylePrompt: style || t.stylePrompt,
				tropeReport: report,
				providerUsed: providerUsed ?? t.providerUsed,
				updatedAt: nowIso()
			} : x),
			phase: "lyrics"
		});
		if (get().selfPlugOptIn) get().selfPlugActive();
	},
	upsertPersona: (p) => {
		set({ personas: get().personas.some((x) => x.id === p.id) ? get().personas.map((x) => x.id === p.id ? p : x) : [p, ...get().personas] });
	},
	dropPersona: (id) => set({ personas: get().personas.filter((p) => p.id !== id) }),
	usePersona: (id) => {
		const p = get().personas.find((x) => x.id === id);
		if (!p) return;
		set({ draft: {
			...get().draft,
			persona: p.name,
			vocalProtocol: p.voice,
			structureTemplate: p.houseTemplate || get().draft.structureTemplate
		} });
	},
	ingestText: (text, collection, provenance) => {
		set({ corpus: [makeRecord({
			collection,
			title: provenance.slice(0, 48) || "ingest",
			lyrics: text,
			provenance,
			license: collection === "human_pd" ? "PD/CC-attested" : collection === "self_generated" ? "self" : "permissive-attested",
			humanOverride: ""
		}), ...get().corpus] });
	},
	overrideRecord: (id, note) => set({ corpus: get().corpus.map((r) => r.id === id ? {
		...r,
		humanOverride: note
	} : r) }),
	dropRecord: (id) => set({ corpus: get().corpus.filter((r) => r.id !== id) }),
	selfPlugActive: () => {
		const t = activeTrack(get().tracks, get().activeId);
		if (!t?.lyrics) return;
		const rec = makeRecord({
			collection: "self_generated",
			title: t.spec.title,
			lyrics: t.lyrics,
			provenance: `self-plug ${t.id}`,
			license: "self",
			humanOverride: "",
			specSnapshot: t.spec
		});
		const others = get().corpus.filter((r) => r.collection !== "self_generated");
		const cutoff = Date.now() - 7776e6;
		set({
			corpus: [...[rec, ...get().corpus.filter((r) => r.collection === "self_generated")].filter((r) => new Date(r.createdAt).getTime() > cutoff).slice(0, 20), ...others],
			tracks: get().tracks.map((x) => x.id === t.id ? {
				...x,
				selfPlugged: true
			} : x)
		});
	},
	pruneSelfPlugs: () => {
		const cutoff = Date.now() - 7776e6;
		set({ corpus: get().corpus.filter((r) => r.collection !== "self_generated" || new Date(r.createdAt).getTime() > cutoff) });
	},
	setProviderKey: (id, key) => set({ providers: get().providers.map((p) => p.id === id ? {
		...p,
		key
	} : p) }),
	setDefaultProvider: (kind, id) => set(kind === "generate" ? { defaultGenerateProvider: id } : { defaultEvalProvider: id }),
	setSelfPlugOptIn: (selfPlugOptIn) => set({ selfPlugOptIn }),
	proposeModule: (module, notes, diff) => {
		set({ moduleVersions: [{
			id: uid("mod"),
			module,
			version: `0.${get().moduleVersions.length + 1}.0-proposed`,
			notes,
			diff,
			accepted: false,
			createdAt: nowIso()
		}, ...get().moduleVersions] });
	},
	acceptModule: (id) => set({ moduleVersions: get().moduleVersions.map((m) => m.id === id ? {
		...m,
		accepted: true,
		version: m.version.replace("-proposed", "")
	} : m) })
}), {
	name: "pimp-console-v1",
	skipHydration: true,
	partialize: (s) => ({
		draft: s.draft,
		tracks: s.tracks,
		activeId: s.activeId,
		personas: s.personas,
		corpus: s.corpus,
		moduleVersions: s.moduleVersions,
		providers: s.providers,
		defaultGenerateProvider: s.defaultGenerateProvider,
		defaultEvalProvider: s.defaultEvalProvider,
		selfPlugOptIn: s.selfPlugOptIn,
		phase: s.phase
	})
}));
var buttonVariants = cva("inline-flex items-center justify-center gap-2 font-medium transition-opacity duration-150 disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 active:scale-[0.98]", {
	variants: {
		variant: {
			primary: "bg-accent text-accent-fg hover:opacity-90",
			secondary: "bg-bg-subtle text-fg border border-border hover:border-accent/40",
			ghost: "text-muted hover:text-fg hover:bg-bg-subtle",
			danger: "bg-danger text-fg hover:opacity-90"
		},
		size: {
			sm: "h-9 px-3 text-sm rounded-[var(--radius-sm)]",
			md: "h-11 px-4 text-sm rounded-[var(--radius-md)]",
			lg: "h-12 px-5 text-base rounded-[var(--radius-md)]"
		}
	},
	defaultVariants: {
		variant: "primary",
		size: "md"
	}
});
function Button({ className, variant, size, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
}
function CopyBtn({ text, label = "Copy" }) {
	const [ok, setOk] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		type: "button",
		variant: "secondary",
		size: "sm",
		onClick: async () => {
			await navigator.clipboard.writeText(text);
			setOk(true);
			setTimeout(() => setOk(false), 1400);
		},
		children: [ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-3.5" }), ok ? "Copied" : label]
	});
}
var CLI = `pimp-mod — Module Update CLI
Usage:
  node cli/pimp-mod.mjs ingest --source human_pd --file lyrics.jsonl
  node cli/pimp-mod.mjs suite
  node cli/pimp-mod.mjs export --out corpus.jsonl

Sources allowed: human_pd (PD/CC only), ai_permissive, self_generated.
Never scrape Genius, Musixmatch, or other protected catalogs.
SQLite-compatible JSONL is the interchange format. Version bumps require human accept.`;
function HandoffView() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-w-3xl space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs uppercase tracking-[0.2em] text-muted",
				children: "Protocol 7"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl mt-1",
				children: "Handoff package"
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted leading-relaxed",
				children: "Paste the system prompt into a local model host. Keep K1–K5 routing locked. Store personas and specs as JSON. Run pimp-mod beside the studio for empirical updates."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-between items-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm uppercase tracking-widest text-muted",
						children: "System prompt"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyBtn, { text: PIMP_SYSTEM })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
					className: "rounded-[var(--radius-md)] border border-border p-4 text-xs whitespace-pre-wrap font-mono text-muted",
					children: PIMP_SYSTEM
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-between items-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm uppercase tracking-widest text-muted",
						children: "CLI"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyBtn, { text: CLI })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
					className: "rounded-[var(--radius-md)] border border-border p-4 text-xs whitespace-pre-wrap font-mono text-muted",
					children: CLI
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-subtle",
				children: "P.I.M.P. v0.9 · 2026-08-24 · protocols 0–7 locked"
			})
		]
	});
}
function Label({ children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
		className: cn("block text-xs font-medium tracking-wide text-muted uppercase mb-1.5", className),
		children
	});
}
function Input({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		className: cn("h-11 w-full rounded-[var(--radius-sm)] border border-border bg-bg-elevated px-3 text-sm text-fg placeholder:text-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50", className),
		...props
	});
}
function Textarea({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("w-full rounded-[var(--radius-md)] border border-border bg-bg-elevated px-3 py-2.5 text-sm text-fg placeholder:text-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 leading-relaxed", className),
		...props
	});
}
function Select({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
		className: cn("h-11 w-full rounded-[var(--radius-sm)] border border-border bg-bg-elevated px-3 text-sm text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50", className),
		...props,
		children
	});
}
function Badge({ children, tone = "neutral" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] tracking-wide uppercase", {
			neutral: "border-border text-muted",
			ok: "border-ok/40 text-ok",
			warn: "border-warn/40 text-warn",
			danger: "border-danger/40 text-danger"
		}[tone]),
		children
	});
}
var TONES = [
	"darker",
	"more aggressive",
	"cinematic",
	"intimate",
	"defiant"
];
var ARCS = [
	"Chaos → Control",
	"Confrontation → Resolution",
	"Ritual → Ascension",
	"Dominance → Surrender",
	"Chase → Capture",
	"Absurdity → Joy"
];
function IntentView() {
	const d = usePimp((s) => s.draft);
	const patch = usePimp((s) => s.patchDraft);
	const toggleMod = usePimp((s) => s.toggleMod);
	const toggleTone = usePimp((s) => s.toggleTone);
	const lockSpec = usePimp((s) => s.lockSpec);
	const loadExample = usePimp((s) => s.loadExample);
	const personas = usePimp((s) => s.personas);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-w-3xl space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-[0.2em] text-muted",
					children: "Intent Architecture"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl md:text-4xl mt-2 tracking-tight",
					children: "One intent. Then lock the spec."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted mt-3 max-w-xl leading-relaxed",
					children: "Identity + Tension + Release. Spine owns rhythm and form. Color owns texture."
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Psychological intent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						rows: 3,
						value: d.intent,
						onChange: (e) => patch({ intent: e.target.value }),
						placeholder: "Leave without a speech. Lock the door on a life already gone."
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid md:grid-cols-2 gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Title" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: d.title,
							onChange: (e) => patch({ title: e.target.value }),
							placeholder: "Unsigned Lease"
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Persona" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: d.persona,
							onChange: (e) => patch({ persona: e.target.value }),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "—",
								children: "— none —"
							}), personas.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: p.name,
								children: p.name
							}, p.id))]
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid md:grid-cols-2 gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Primary spine" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
							value: d.genreSpine,
							onChange: (e) => patch({ genreSpine: e.target.value }),
							children: GENRES.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: g.name }, g.name))
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Secondary color" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: d.genreColor,
							onChange: (e) => patch({ genreColor: e.target.value }),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "none",
								children: "none"
							}), GENRES.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: g.name }, g.name))]
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid md:grid-cols-2 gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Narrative arc" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
							value: d.narrativeArc,
							onChange: (e) => patch({ narrativeArc: e.target.value }),
							children: ARCS.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: a }, a))
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Emotion path" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: d.emotionPath,
							onChange: (e) => patch({ emotionPath: e.target.value }),
							placeholder: "restrained verse → chorus release"
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Vocal protocol" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: d.vocalProtocol,
						onChange: (e) => patch({ vocalProtocol: e.target.value }),
						placeholder: "female, late 20s, raspy, intimate, restrained"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid md:grid-cols-3 gap-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Performance" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
								value: d.performanceTarget,
								onChange: (e) => patch({ performanceTarget: e.target.value }),
								children: [
									"streaming",
									"radio",
									"short-form",
									"trailer",
									"club",
									"sync"
								].map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: p }, p))
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "TropeCheck" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: d.tropeCheck,
								onChange: (e) => patch({ tropeCheck: e.target.value }),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "standard",
										children: "standard"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "strict",
										children: "strict"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "off",
										children: "off"
									})
								]
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "TropeTone" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
								value: d.tropeTone,
								onChange: (e) => patch({ tropeTone: e.target.value }),
								children: [
									"Poetic",
									"Plainspoken",
									"Violent",
									"Tender",
									"Ironic",
									"Character Voice"
								].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: t }, t))
							})] })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Structure template (auto if unchanged)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
						value: d.structureTemplate,
						onChange: (e) => patch({ structureTemplate: e.target.value }),
						children: TEMPLATES$1.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: t.name }, t.name))
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Tone flags" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: TONES.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => toggleTone(t),
							className: `h-9 px-3 rounded-full border text-sm ${d.toneFlags.includes(t) ? "border-accent bg-bg-subtle text-fg" : "border-border text-muted"}`,
							children: t
						}, t))
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Structure mods" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: STRUCTURE_MODS.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => toggleMod(m),
							className: `h-9 px-3 rounded-full border text-xs ${d.structureMods.includes(m) ? "border-accent bg-bg-subtle text-fg" : "border-border text-muted"}`,
							children: m
						}, m))
					})] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-3 pt-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					onClick: lockSpec,
					children: "Lock Spec"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "secondary",
					onClick: loadExample,
					children: "Load example track"
				})]
			})
		]
	});
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var generateTrack = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("8bd2aa46c750df84344a5dd7ccd1b4aa6c79a0a0d319b9ee7d75c224bb8aa18b"));
createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("b1b086ca2d8fd36d3d1496ae6b8c82eb5b4035603c5bb731d7a9b17424b00219"));
function GenerateBar() {
	const [instruction, setInstruction] = (0, import_react.useState)("");
	const generating = usePimp((s) => s.generating);
	const lastError = usePimp((s) => s.lastError);
	const tracks = usePimp((s) => s.tracks);
	const activeId = usePimp((s) => s.activeId);
	const providers = usePimp((s) => s.providers);
	const defaultGenerateProvider = usePimp((s) => s.defaultGenerateProvider);
	const lockSpec = usePimp((s) => s.lockSpec);
	const applyGeneration = usePimp((s) => s.applyGeneration);
	const setGenerating = usePimp((s) => s.setGenerating);
	const setLastError = usePimp((s) => s.setLastError);
	const setPhase = usePimp((s) => s.setPhase);
	const spec = tracks.find((t) => t.id === activeId)?.spec;
	const provider = providers.find((p) => p.id === defaultGenerateProvider);
	async function run(mode) {
		if (!spec) lockSpec();
		const current = usePimp.getState();
		const t = current.tracks.find((x) => x.id === current.activeId);
		if (!t) {
			setLastError("Lock a spec first.");
			setPhase("intent");
			return;
		}
		if (mode === "scaffold") {
			applyGeneration(scaffoldLyrics(t.spec), t.stylePrompt, "scaffold");
			setLastError(null);
			return;
		}
		setGenerating(true);
		setLastError(null);
		try {
			const result = await generateTrack({ data: {
				spec: t.spec,
				providerId: defaultGenerateProvider,
				providerKey: provider?.key || void 0,
				providerBaseUrl: provider?.baseUrl,
				providerModel: provider?.model,
				instruction: instruction || void 0
			} });
			if (!result.ok) {
				setLastError(result.error);
				return;
			}
			applyGeneration(result.lyrics, result.stylePrompt, result.model);
		} catch (e) {
			setLastError(e instanceof Error ? e.message : "Generation failed");
		} finally {
			setGenerating(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-[var(--radius-lg)] border border-border bg-bg-elevated p-4 space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col md:flex-row gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: instruction,
					onChange: (e) => setInstruction(e.target.value),
					placeholder: "Optional mutation — one layer only (e.g. darker chorus, more concrete V2)"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2 shrink-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						disabled: generating,
						onClick: () => void run("ai"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-4" }), generating ? "Generating…" : `Generate · ${provider?.label ?? "Grok"}`]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "secondary",
						onClick: () => void run("scaffold"),
						children: "Local scaffold"
					})]
				})]
			}),
			lastError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-danger",
				children: lastError
			}),
			generating && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-1 rounded-full shimmer" })
		]
	});
}
function LyricsView() {
	const tracks = usePimp((s) => s.tracks);
	const activeId = usePimp((s) => s.activeId);
	const setLyrics = usePimp((s) => s.setLyrics);
	const runQc = usePimp((s) => s.runQc);
	const applyRewrites = usePimp((s) => s.applyRewrites);
	const selfPlug = usePimp((s) => s.selfPlugActive);
	const t = tracks.find((x) => x.id === activeId);
	if (!t) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-w-3xl space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl",
				children: "Lyrics"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted",
				children: "Lock a spec on Intent, then generate."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GenerateBar, {})
		]
	});
	const report = t.tropeReport;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-w-5xl grid lg:grid-cols-[1fr_280px] gap-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "flex flex-wrap items-end justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-[0.2em] text-muted",
						children: "K2-gated lyrics"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-3xl mt-1",
						children: t.spec.title || "Untitled"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyBtn, {
						text: t.lyrics,
						label: "Copy lyrics"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GenerateBar, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					rows: 22,
					className: "font-mono text-[13px]",
					value: t.lyrics,
					onChange: (e) => setLyrics(e.target.value),
					placeholder: "[Verse 1]"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "secondary",
							onClick: runQc,
							children: "Run TropeCheck"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "secondary",
							onClick: applyRewrites,
							children: "Apply rewrites"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "ghost",
							onClick: selfPlug,
							children: "Self-plug this take"
						})
					]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "rounded-[var(--radius-lg)] border border-border bg-bg-elevated p-4 space-y-3 h-fit",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs uppercase tracking-widest text-muted",
				children: "QC"
			}), report ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
					tone: report.passed ? "ok" : "warn",
					children: [
						report.passed ? "Pass" : "Needs work",
						" · ",
						report.mode
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted",
					children: [
						report.lines.filter((l) => l.verdict === "REWRITE" || l.verdict === "BLOCK").length,
						" ",
						"rewrite/block · ",
						report.lines.filter((l) => l.verdict === "CONDITIONAL").length,
						" ",
						"conditional"
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-2 max-h-[480px] overflow-auto",
					children: report.lines.filter((l) => l.verdict !== "PASS").map((l, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "text-xs leading-relaxed",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-muted",
								children: [
									l.section,
									" L",
									l.index + 1,
									" · CDS ",
									l.cds
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-fg",
								children: l.line
							}),
							l.rewrite && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-ok",
								children: ["→ ", l.rewrite]
							})] })
						]
					}, `${l.section}-${l.index}-${i}`))
				}),
				report.sectionFailures.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-danger",
					children: f
				}, f))
			] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Generate or run TropeCheck."
			})]
		})]
	});
}
function ModuleView() {
	const corpus = usePimp((s) => s.corpus);
	const ingest = usePimp((s) => s.ingestText);
	const overrideRecord = usePimp((s) => s.overrideRecord);
	const dropRecord = usePimp((s) => s.dropRecord);
	const versions = usePimp((s) => s.moduleVersions);
	const propose = usePimp((s) => s.proposeModule);
	const accept = usePimp((s) => s.acceptModule);
	const [text, setText] = (0, import_react.useState)("");
	const [collection, setCollection] = (0, import_react.useState)("human_pd");
	const [filter, setFilter] = (0, import_react.useState)("all");
	const suites = (0, import_react.useMemo)(() => runSuites(corpus), [corpus]);
	const shown = filter === "all" ? corpus : corpus.filter((r) => r.collection === filter);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-w-5xl space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-[0.2em] text-muted",
					children: "pimp-mod"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl mt-1",
					children: "Module Lab"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted mt-2 max-w-2xl leading-relaxed",
					children: "Public-domain / CC human lyrics only. Permissive AI only. Self-plugs stay separated. No scraping of protected catalogs. Version bumps require human accept."
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-[var(--radius-lg)] border border-border bg-bg-elevated p-5 space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Ingest (JSONL, JSON, or raw lyrics)" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						rows: 6,
						className: "font-mono text-xs",
						value: text,
						onChange: (e) => setText(e.target.value),
						placeholder: "{\"title\":\"…\",\"lyrics\":\"[Verse 1]\\n…\"}"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								className: "max-w-xs",
								value: collection,
								onChange: (e) => setCollection(e.target.value),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "human_pd",
										children: "human_pd"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "ai_permissive",
										children: "ai_permissive"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "self_generated",
										children: "self_generated"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								onClick: () => {
									if (!text.trim()) return;
									ingest(text, collection, `ui-ingest ${collection}`);
									setText("");
								},
								children: "Ingest + annotate"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyBtn, {
								text: toJsonl(corpus),
								label: "Export JSONL"
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "grid md:grid-cols-2 xl:grid-cols-3 gap-3",
				children: suites.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "rounded-[var(--radius-md)] border border-border p-4 space-y-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-sm font-medium",
							children: s.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted leading-relaxed",
							children: s.summary
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "text-xs font-mono text-subtle space-y-0.5",
							children: Object.entries(s.metrics).map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
								k,
								": ",
								Number.isInteger(v) ? v : v.toFixed(3)
							] }, k))
						}),
						s.notes.slice(0, 4).map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted",
							children: n
						}, n))
					]
				}, s.name))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm uppercase tracking-widest text-muted",
						children: "Corpus"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						className: "max-w-[200px]",
						value: filter,
						onChange: (e) => setFilter(e.target.value),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "all",
								children: "all"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "human_pd",
								children: "human_pd"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "ai_permissive",
								children: "ai_permissive"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "self_generated",
								children: "self_generated"
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-2",
					children: shown.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-[var(--radius-md)] border border-border p-3 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-medium",
									children: r.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-subtle",
									children: [
										r.collection,
										" · ",
										r.license,
										" · ",
										r.provenance
									]
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									size: "sm",
									variant: "ghost",
									onClick: () => dropRecord(r.id),
									children: "Drop"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted mt-1",
								children: r.annotation ? `mean CDS ${(r.annotation.lines.reduce((a, l) => a + l.cds, 0) / Math.max(1, r.annotation.lines.length)).toFixed(2)} · ${r.annotation.lines.filter((l) => l.verdict !== "PASS").length} flags` : "unannotated"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "mt-2 h-9 w-full rounded-[var(--radius-sm)] border border-border bg-bg-elevated px-2 text-xs",
								placeholder: "Human override / gold label",
								defaultValue: r.humanOverride,
								onBlur: (e) => overrideRecord(r.id, e.target.value)
							})
						]
					}, r.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm uppercase tracking-widest text-muted",
						children: "Proposed diffs"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "secondary",
						onClick: () => {
							const over = suites.find((s) => s.name.startsWith("Self-overuse"));
							propose("K2", "Auto-proposal from self-overuse suite. Review before accept.", (over?.notes.join("\n") || "No overused terms.") + "\n\nSuggested: add frequency-cap negatives for listed tokens in Style prompt layer.");
						},
						children: "Propose K2 diff from suites"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "space-y-2",
						children: versions.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "rounded-[var(--radius-md)] border border-border p-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-sm",
									children: [
										v.module,
										" ",
										v.version,
										" ",
										v.accepted ? "· accepted" : "· pending"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
									className: "text-xs text-muted whitespace-pre-wrap mt-2",
									children: v.diff
								}),
								!v.accepted && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									size: "sm",
									className: "mt-2",
									onClick: () => accept(v.id),
									children: "Accept version"
								})
							]
						}, v.id))
					})
				]
			})
		]
	});
}
function PersonasView() {
	const personas = usePimp((s) => s.personas);
	const upsert = usePimp((s) => s.upsertPersona);
	const drop = usePimp((s) => s.dropPersona);
	const useP = usePimp((s) => s.usePersona);
	const [name, setName] = (0, import_react.useState)("");
	const [voice, setVoice] = (0, import_react.useState)("");
	const [visual, setVisual] = (0, import_react.useState)("");
	const [house, setHouse] = (0, import_react.useState)(TEMPLATES$1[2].name);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-w-3xl space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs uppercase tracking-[0.2em] text-muted",
				children: "Identity Stabilization"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl mt-1",
				children: "Personas"
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "rounded-[var(--radius-lg)] border border-border bg-bg-elevated p-5 space-y-4",
				onSubmit: (e) => {
					e.preventDefault();
					if (!name.trim()) return;
					upsert({
						id: uid("per"),
						name: name.trim(),
						voice,
						visual,
						houseTemplate: house,
						createdAt: nowIso()
					});
					setName("");
					setVoice("");
					setVisual("");
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid md:grid-cols-2 gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Name" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: name,
							onChange: (e) => setName(e.target.value),
							required: true
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "House template" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
							value: house,
							onChange: (e) => setHouse(e.target.value),
							children: TEMPLATES$1.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: t.name }, t.name))
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Voice" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: voice,
						onChange: (e) => setVoice(e.target.value),
						placeholder: "male, 40s, gravel, close-mic"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Visual identity" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						rows: 2,
						value: visual,
						onChange: (e) => setVisual(e.target.value)
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						children: "Create persona"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "space-y-3",
				children: [personas.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted text-sm",
					children: "No personas yet."
				}), personas.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "rounded-[var(--radius-md)] border border-border p-4 flex flex-col gap-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-medium",
								children: p.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted",
								children: p.voice || "No voice spec"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-subtle",
								children: p.houseTemplate
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								size: "sm",
								variant: "secondary",
								onClick: () => useP(p.id),
								children: "Use"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								size: "sm",
								variant: "ghost",
								onClick: () => drop(p.id),
								children: "Drop"
							})]
						})]
					})
				}, p.id))]
			})
		]
	});
}
function ProvidersView() {
	const providers = usePimp((s) => s.providers);
	const setKey = usePimp((s) => s.setProviderKey);
	const setDefault = usePimp((s) => s.setDefaultProvider);
	const gen = usePimp((s) => s.defaultGenerateProvider);
	const evalP = usePimp((s) => s.defaultEvalProvider);
	const optIn = usePimp((s) => s.selfPlugOptIn);
	const setOpt = usePimp((s) => s.setSelfPlugOptIn);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-w-3xl space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-[0.2em] text-muted",
					children: "Auth layer"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl mt-1",
					children: "Providers"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted mt-2 leading-relaxed",
					children: "Native Grok uses the studio session. Other engines take API keys stored only in this browser. Keys are sent with a generate request and never written to a remote store."
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-3",
				children: providers.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-[var(--radius-md)] border border-border p-4 space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-medium",
								children: p.label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									size: "sm",
									variant: gen === p.id ? "primary" : "secondary",
									onClick: () => setDefault("generate", p.id),
									children: "Default generate"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									size: "sm",
									variant: evalP === p.id ? "primary" : "secondary",
									onClick: () => setDefault("eval", p.id),
									children: "Default eval"
								})]
							})]
						}),
						p.id !== "grok" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "API key" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "password",
							autoComplete: "off",
							value: p.key,
							onChange: (e) => setKey(p.id, e.target.value),
							placeholder: "stored locally only"
						})] }),
						p.id === "grok" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted",
							children: "No key required in this studio. Offline builds accept XAI_API_KEY."
						})
					]
				}, p.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex items-center gap-3 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "checkbox",
					className: "size-4",
					checked: optIn,
					onChange: (e) => setOpt(e.target.checked)
				}), "Auto self-plug last generations (cap 20 / 90 days)"]
			})
		]
	});
}
function ReleaseView() {
	const tracks = usePimp((s) => s.tracks);
	const activeId = usePimp((s) => s.activeId);
	const build = usePimp((s) => s.buildReleasePackage);
	const t = tracks.find((x) => x.id === activeId);
	if (!t) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-muted",
		children: "Lock a spec first."
	});
	const r = t.release;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-w-3xl space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex items-end justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs uppercase tracking-[0.2em] text-muted",
				children: "K4 Release Package"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl mt-1",
				children: "Cover, hook, launch"
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				onClick: build,
				children: "Build package"
			})]
		}), !r ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-muted",
			children: "Build from the current spec and lyrics."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "space-y-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between items-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-sm uppercase tracking-widest text-muted",
								children: "Cover prompt"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyBtn, { text: r.coverPrompt })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm leading-relaxed text-fg",
							children: r.coverPrompt
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-subtle",
							children: ["Negative: ", r.negativePrompt]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted",
							children: ["Alt 1 — ", r.coverAlts[0].slice(-80)]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted",
							children: ["Alt 2 — ", r.coverAlts[1].slice(-80)]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "text-sm uppercase tracking-widest text-muted",
						children: ["Video hook · ", r.hookType]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
						className: "text-sm whitespace-pre-wrap font-sans text-fg",
						children: r.hookPlan
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "space-y-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between items-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-sm uppercase tracking-widest text-muted",
								children: "Caption"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyBtn, { text: r.caption })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: r.caption }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-muted text-sm",
							children: r.shortCaption
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-subtle",
							children: r.hashtags.join(" ")
						})
					]
				})
			]
		})]
	});
}
function SoundView() {
	const tracks = usePimp((s) => s.tracks);
	const activeId = usePimp((s) => s.activeId);
	const setStyle = usePimp((s) => s.setStyle);
	const t = tracks.find((x) => x.id === activeId);
	if (!t) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-muted",
		children: "Lock a spec first. Style prompt is built from the signal stack."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-w-3xl space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-[0.2em] text-muted",
					children: "K3 Style / Production"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl mt-1",
					children: "Paste-ready brief"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyBtn, { text: t.stylePrompt })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: [t.stylePrompt.length, "/1000 characters · Identity → Emotion → Genre → Production → Structure"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
				rows: 12,
				value: t.stylePrompt,
				onChange: (e) => setStyle(e.target.value.slice(0, 1e3))
			})
		]
	});
}
function SpecRail() {
	const draft = usePimp((s) => s.draft);
	const conflicts = usePimp((s) => s.conflicts);
	const text = formatSpec(draft);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: "hidden xl:flex w-[320px] shrink-0 flex-col border-l border-border bg-bg-elevated",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between px-4 py-3 border-b border-border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-widest text-muted",
					children: "Spec Block"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyBtn, {
					text,
					label: "Copy spec"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
				className: "flex-1 overflow-auto p-4 text-[12px] leading-relaxed font-mono text-muted whitespace-pre-wrap",
				children: text
			}),
			conflicts.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-t border-border p-4 space-y-2 max-h-48 overflow-auto",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-widest text-danger",
					children: "Conflict Alert"
				}), conflicts.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-fg leading-relaxed",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-danger",
							children: [c.field, "."]
						}),
						" ",
						c.issue,
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted",
							children: c.fix
						})
					]
				}, c.field))]
			})
		]
	});
}
function SpecView() {
	const draft = usePimp((s) => s.draft);
	const conflicts = usePimp((s) => s.conflicts);
	const lockSpec = usePimp((s) => s.lockSpec);
	const setPhase = usePimp((s) => s.setPhase);
	const text = formatSpec(draft);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-w-3xl space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs uppercase tracking-[0.2em] text-muted",
				children: "Locked record"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl mt-1",
				children: "Spec Block"
			})] }),
			conflicts.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-[var(--radius-md)] border border-danger/40 p-4 space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-widest text-danger",
					children: "Conflict Alert"
				}), conflicts.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm leading-relaxed",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [c.field, "."] }),
						" ",
						c.issue,
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted",
							children: c.fix
						})
					]
				}, c.field))]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
				className: "rounded-[var(--radius-lg)] border border-border bg-bg-elevated p-5 text-[13px] font-mono leading-relaxed whitespace-pre-wrap",
				children: text
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyBtn, { text }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "secondary",
						onClick: lockSpec,
						children: "Re-lock"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "ghost",
						onClick: () => setPhase("intent"),
						children: "Edit intent"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GenerateBar, {})
		]
	});
}
function TracksDrawer() {
	const tracks = usePimp((s) => s.tracks);
	const activeId = usePimp((s) => s.activeId);
	const load = usePimp((s) => s.loadTrack);
	const neu = usePimp((s) => s.newTrack);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-3 pb-4 space-y-1",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between px-1 mb-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] uppercase tracking-widest text-subtle",
					children: "Tracks"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					size: "sm",
					variant: "ghost",
					onClick: neu,
					children: "New"
				})]
			}),
			tracks.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-subtle px-1",
				children: "Empty session"
			}),
			tracks.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => load(t.id),
				className: `w-full text-left rounded-[var(--radius-sm)] px-2 py-2 text-sm ${t.id === activeId ? "bg-bg-subtle text-fg" : "text-muted hover:text-fg"}`,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block truncate",
					children: t.spec.title || "Untitled"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block text-[11px] text-subtle truncate",
					children: t.spec.genreSpine.split(" ")[0]
				})]
			}, t.id))
		]
	});
}
var NAV = [
	{
		id: "intent",
		label: "Intent",
		icon: PenLine
	},
	{
		id: "spec",
		label: "Spec",
		icon: LayoutList
	},
	{
		id: "lyrics",
		label: "Lyrics",
		icon: MicVocal
	},
	{
		id: "sound",
		label: "Sound",
		icon: AudioLines
	},
	{
		id: "release",
		label: "Release",
		icon: Package
	},
	{
		id: "personas",
		label: "Personas",
		icon: Users
	},
	{
		id: "module",
		label: "Module Lab",
		icon: Cpu
	},
	{
		id: "providers",
		label: "Providers",
		icon: KeyRound
	},
	{
		id: "handoff",
		label: "Handoff",
		icon: FileJson
	}
];
function StudioShell() {
	const [ready, setReady] = (0, import_react.useState)(false);
	const phase = usePimp((s) => s.phase);
	const setPhase = usePimp((s) => s.setPhase);
	(0, import_react.useEffect)(() => {
		const unsub = usePimp.persist.onFinishHydration(() => setReady(true));
		usePimp.persist.rehydrate();
		if (usePimp.persist.hasHydrated()) setReady(true);
		return unsub;
	}, []);
	if (!ready) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-dvh bg-bg text-muted flex items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm tracking-widest uppercase",
			children: "P.I.M.P."
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh flex flex-col bg-bg text-fg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex items-center justify-between gap-4 border-b border-border px-4 md:px-6 h-14 shrink-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-baseline gap-3 min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-display text-lg tracking-tight",
					children: "P.I.M.P."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "hidden sm:inline text-xs uppercase tracking-[0.18em] text-subtle truncate",
					children: "Identity · Tension · Release"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] text-subtle hidden md:block",
				children: "Studio loop live"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-1 min-h-0",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
					className: "hidden md:flex w-52 shrink-0 flex-col border-r border-border bg-bg-elevated",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex-1 overflow-auto py-3",
						children: NAV.map((item) => {
							const Icon = item.icon;
							const on = phase === item.id;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setPhase(item.id),
								className: `w-full flex items-center gap-2.5 px-4 h-10 text-sm ${on ? "text-fg bg-bg-subtle" : "text-muted hover:text-fg"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4 shrink-0" }), item.label]
							}, item.id);
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TracksDrawer, {})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1 min-w-0 flex flex-col",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "md:hidden overflow-x-auto border-b border-border flex",
						children: NAV.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setPhase(item.id),
							className: `h-12 px-3 text-xs whitespace-nowrap ${phase === item.id ? "text-fg border-b border-accent" : "text-muted"}`,
							children: item.label
						}, item.id))
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex-1 overflow-auto p-4 md:p-8",
						children: [
							phase === "intent" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IntentView, {}),
							phase === "spec" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpecView, {}),
							phase === "lyrics" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LyricsView, {}),
							phase === "sound" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SoundView, {}),
							phase === "release" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReleaseView, {}),
							phase === "personas" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonasView, {}),
							phase === "module" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModuleView, {}),
							phase === "providers" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProvidersView, {}),
							phase === "handoff" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HandoffView, {})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpecRail, {})
			]
		})]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StudioShell, {});
}
//#endregion
export { Home as component };
