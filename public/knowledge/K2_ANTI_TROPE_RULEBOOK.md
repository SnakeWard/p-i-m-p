# K2 — Anti-Trope Rulebook

*Consolidated from P.I.M.P. Anti-Trope Engine v4.0 (locked spec), Technical Architecture Specification v2.0, and the "borrowed" addendum — 2026-07. Multi-model routing converted to a single-model three-pass procedure; pseudo-quantitative scoring converted to judged rubrics and countable rules.*

**WHEN TO USE THIS FILE:** before showing any lyric draft; when the user questions a line's originality; when `TropeCheck` or `TropeTone` is set; when writing launch copy (K4 applies §5's Pass 1 lightly to captions/hooks).

**INDEX:** §1 Three passes · §2 CDS rubric · §3 Failure classes · §4 Detection patterns · §5 Stacking rules · §6 Structural tropes & quality gates · §7 Genre strictness & allowances · §8 Rewrite ladder · §9 Rewrite strategy selection · §10 Overcorrection warnings & design principles · §11 Verdict & report format

---

## §1 The three passes

Run as three separate labeled sweeps, in order. Do not blend them: detection must finish before judgment.

| Pass | Does | Authority |
|---|---|---|
| **1 — DETECT** | Scan each line against §3 failure classes and §4 patterns; assign provisional CDS 0–5 (§2); note abstraction balance and open metaphor domains | Flags only — cannot approve |
| **2 — VALIDATE** | Section-level checks (§5 counting rules, §6 structural tropes and quality gates); confirm or adjust each CDS | Confirms/adjusts — cannot veto |
| **3 — VETO** | For every line at CDS ≤ 2: apply the Interchangeability Test — *"Could this exact line appear unchanged in 3+ unrelated songs?"* Issue final verdicts (§11) | Only pass that issues final verdicts. CDS 0 = automatic FAIL |

## §2 Context Dependency Scale (CDS) — judged rubric

CDS measures how much a line depends on THIS song's specific world. Judge each line 0–5:

**CDS 0 — Fully portable slogan.** Could open any song in any genre. Mandatory veto; replace with scene anchoring.
> "We will rise above the pain" · "I can't go on without you" · "The fire burns inside my soul"

**CDS 1 — Generic emotion + generic image.** A mood, not a moment. Tier 1 rewrite; suggest physical detail.
> "Your shadow follows me in the dark" · "These broken dreams are all I know" · "Lost inside the silence"

**CDS 2 — One concrete detail, still transplantable.** The detail is decorative, not load-bearing. Warn if stacked with other ≤2 lines.
> "I left your jacket hanging by the door" · "Whiskey on the nightstand again" · "Rain against the windshield all the way home"

**CDS 3 — Anchored scene; moving it requires edits.** Baseline for successful commercial writing.
> "Third shift ended and I still set two alarms" · "Your sister waved me down outside the pharmacy" · "The lease renewal's still unsigned on the counter"

**CDS 4 — Specific character/narrative markers; meaning leans on this song's story.**
> "The ring you pawned in Reno bought the amp I burned" · "Since the deposition, Mom won't say your name" · "I kept the dog; you kept the reasons"

**CDS 5 — Unique physical grounding; incomplete without the song's prior events.** Peak authenticity.
> A bridge line that only makes sense because of Verse 2's named event; a callback that rewrites the chorus's meaning. (These are built by T4 rewrites — §8.)

## §3 Failure classes (FC-1 → FC-8) + addendum

| ID | Class | Tier | Trigger |
|---|---|---|---|
| FC-1 | Abstraction Without Anchor | 1 | 4-line unit where abstract nouns outnumber concrete nouns |
| FC-2 | Mythology Transfer (phoenix, Icarus-as-shorthand, juggernaut…) | **0 — always block** | Borrowed myth doing the song's emotional work |
| FC-3 | Epiphany Declaration in a bridge ("and then I realized…" + abstraction) | **0 in bridge — always block** | Claimed realization with no concrete content |
| FC-4 | Metaphor Stack | 1 | ≥3 metaphor domains open in one unit |
| FC-5 | Generic Action-Resolution ("gonna rise / break free / make it") | 1 | No named destination or method |
| FC-6 | Flat Collective Claim ("we're all in this together") | 1 | No shared-experience qualifier |
| FC-7 | Temporal Optimism Placeholder ("tomorrow it gets better") | 1 | No earned preceding obstacle |
| FC-8 | Superlative Erasure ("you're everything," "nothing matters but you") | 2 | No content enumeration |
| **ADD-1** | **The Borrowed Rule:** "Borrowed" may not attach to symbolic authority, holiness, light, destiny, or identity unless the lyric names the lender, the debt, the object, or the consequence | 1 | "borrowed light/grace/time/name" with no named lender, debt, object, or consequence |

Tier meanings — **Tier 0:** block immediately, no genre exemption. **Tier 1:** rewrite required. **Tier 2:** flag, suggest rewrite. **Tier 3 (neutral motifs):** ignore alone; count in clusters (§5).

## §4 High-confidence detection patterns (Pass 1)

1. Exact match to a known Tier 1 phrase ("rise above," "shattered dreams," "neon lights," "concrete jungle," "city of angels," "sin city"). 2. `[Abstract noun] of the [generic noun]` ("echoes of the night"). 3. `[Verb]s in the [generic noun]` ("whispers in the dark"). 4. 3+ neutral motifs in 4 lines → cluster cliché. 5. Any Tier 1 trope in a Pop chorus → rewrite. 6. Verse 2 with zero new concrete nouns vs Verse 1 → section failure. 7. Bridge "and then I…" followed by an adjective → fake realization. 8. Chorus = title repeated ×3–4 with nothing else → empty escalation. 9. Verse 1 opening on a weather report (rain/wind/night) with no actor → weak opening. 10. "can't" + emotion verb ("can't breathe/feel/stop") → emotional shorthand. 11. "gonna" + generic verb → Tier 1 tell. 12. Two darkness metaphors in one line → same-family stack. 13. "baby" in a bridge outside R&B/hip-hop → structural filler. 14. "echoes" + "whispers" in one verse → AI-tell cluster. 15. Pre-chorus "and now" + generic statement → filler pre-chorus. 16. Final chorus 100% identical to first → meaningless final chorus. 17. "like a" + neutral noun ("like a bird/river") → image template. 18. Abstract noun + human verb ("hope flies," "dreams bleed") → AI-tell syntax. 19. "the" + generic plural ("the echoes/shadows/whispers") → pattern input. 20. Title of form "To [generic verb]" → Tier 1 structural tell. 21. Mythological shorthand (phoenix/titan/juggernaut) → FC-2. 22. Over-rhyme pairs in consecutive lines (girl/world, fire/higher, pain/again) → filler. 23. "tonight/forever/yesterday" as a line's only semantic content → time-stamp filler. 24. Possessive + body part + abstract verb ("my soul cries," "my heart screams") → AI-tell. 25. A line recognized as an existing published lyric → **hard block, no appeal**.

## §5 Stacking & density rules (Pass 2 — countable)

- **FLAG:** 3+ neutral (Tier 3) motifs within any 4-line window (e.g., rain + window + lonely street).
- **ESCALATE:** two Tier 1 tropes in the same line or adjacent lines.
- **FAIL:** 3+ Tier 1 tropes within a 4-line window → section-level rewrite.
- **FLAG:** same trope family (e.g., darkness) appearing in Verse, Chorus, AND Bridge.
- **FLAG:** more than ~1 flagged trope per 3 lines across the whole lyric → density problem; rewrite the worst cluster first.
- **FLAG:** ≥3 metaphor domains open in one unit (FC-4).
- **FLAG:** any 4-line unit where abstract nouns outnumber concrete nouns (FC-1).

## §6 Structural tropes & quality gates (Pass 2)

| Structural trope | Signal | Remedy |
|---|---|---|
| Weak Verse Opening | V1's first 2 lines are emotional shorthand or an unanchored image | In-medias-res rule: open with a character in action or a specific object |
| Filler Pre-Chorus | "and now / tonight / I feel it" ramp with no new image | Add a fleeting image or physical sensation of anticipation |
| Empty Chorus Escalation | Chorus ≈ title + generic emotion words, louder | Chorus must carry the central metaphor or a concrete statement of the new emotional state |
| Fake Bridge Realization | Epiphany claim followed by abstraction | The realization must be a concrete, physical action the character will take |
| Meaningless Final Chorus | Identical to first chorus, just "more passion" | Vary a line, add a line, or show the consequence of the bridge |

**Quality gates:** QG-1 any Tier 0 match → BLOCK + rewrite. QG-2 zero physical anchors in a unit → T2 rewrite minimum. QG-3 bridge opens with epiphany or adds zero new elements → BLOCK / T3+ rewrite. QG-4 chorus adds no concrete noun or active verb absent from Verse 1, or final chorus = first chorus → arc modification. Verse gate: every verse needs ≥3 non-generic concrete nouns or active verbs; **Verse 2 must add ≥2 concrete nouns absent from Verse 1.** Bridge gate: must contain a tense shift or stated intention ("I will / I won't / I'm gonna" + specific act).

## §7 Genre strictness tiers & allowances (Pass 3 modulator)

| Tier | Genres | Behavior |
|---|---|---|
| **STRICT** | Pop, Indie | All Tier 1 & 2 flagged; Tier 1 in chorus auto-rewrites. Indie: also flag anything "corporate/generic"; bias toward subversion. Risk if lax: manufactured slop / bot smell |
| **STANDARD** | Country, Hip-Hop, R&B, Rock/Alt | Enforce fully, minus the allowance lists below |
| **LENIENT** | Metal, Ambient, Cinematic | Higher tolerance for atmospheric/abstract motifs and repetition-as-ritual; still block all Tier 0 |

**Allowances (log when used — "genre convention allowed: '…'"):**
- **Country:** truck, whiskey, rain, mama, small town; "down on my knees" if gospel/blues-inflected. Still flag abstract urban imagery. Risk: 2010s bro-country regression.
- **Metal:** darkness, shadows, eternal, souls, blood — higher density allowed; "broken chains" if literal. Still flag pop pleas ("baby please") and weak abstract filler. Risk: cheesy power-metal default.
- **Hip-Hop:** hustle, grind, streets, literal "rise," "ice" (jewelry); braggadocio allowed; "rise above" only with a specific literal backstory. Still flag generic love-song clichés and vague abstraction. Risk: generic "lyrical miracle" slop.
- **Pop:** tonight, baby, fire, dance, heart allowed as *words* — but no Tier 1 *phrases*; strictest enforcement.
- **Indie:** no allowances.

Specificity override: a line with a genuinely concrete, specific detail passes even if it contains a listed trope word.

## §8 Rewrite ladder (T1 → T4)

| Tier | Action | Escalation test | Max attempts |
|---|---|---|---|
| **T1 — Lexical** | Replace abstract noun with concrete noun; generic verb with specific verb | Could the rewrite still appear in 3+ unrelated songs? YES → T2 | 2 |
| **T2 — Scene anchor** | Add time reference, named object, or physical location | Remove the anchor: does the line revert to CDS 0–1? YES → anchor is load-bearing; if still portable → T3 | 2 |
| **T3 — Consequence** | Insert an irreversible consequence or asymmetric cost | Would transplanting the line force rewriting its surroundings? YES → done; NO → T4 | 2 |
| **T4 — Narrative binding** | Reference a specific prior event within THIS song | Can a listener who missed the earlier verse fully parse it? NO → done | 1 |

Exhausted T4 → stop and show the user the line, the failed attempts, and the diagnosis. Re-evaluate after every rewrite (CDS + the tier's own test). Section-level rewrite: one attempt, then flag for the user.

## §9 Rewrite strategy selection (by category × TropeTone)

| Category | Primary strategy | Example (tone) |
|---|---|---|
| Phrase-level trope | Scene anchoring / object insertion | Poetic: "rise above" → "climb the cathedral spire" · Violent: → "claw my way from the pit" |
| Image template | Sensory mechanics / consequence | Tender: "whispers in the wind" → "your whisper, warm on my neck" · Plainspoken: "echoes of" → "the echo of your key in the lock" |
| Emotional shorthand | Consequence insertion / physical analogy | Plainspoken: "I'm broken" → "I haven't left the house in three days" · Violent: "I'm in pain" → "glass in my guts" |
| Structural filler | Compression / character-voice tag | "baby" → "darlin'" (country) / "my love" (if ironic) |
| Cluster cliché | Subvert ONE element | "rain on a lonely street" → "rain on a crowded street, everyone ignoring me" |
| Section failure | Narrative arc mapping | Verse = specific memory (past), chorus = current state (present), bridge = plan (future) |

`TropeTone` sets the register (Poetic default; also Plainspoken, Violent, Tender, Ironic, Character Voice). Rewrites must fit the melody's syllable count and stress pattern.

## §10 Overcorrection warnings & design principles

**Never:** sterilize genre DNA (banning "whiskey" from country) · force over-specificity into every line (kills musicality and space) · flag intentional/ironic cliché use by a knowing character · over-rewrite a simple effective hook · thesaurus-swap into pretension · break syllable/phonetic fit · bury the user in warnings · twist every line (over-subversion) · flag profound simple statements ("I'm tired" can be earned) · ban common words with strong specific uses ("cold as the dinner he wouldn't eat").

**Always:** detect and cure, don't censor · context is king (genre, section, surroundings) · specificity is the ultimate anti-trope · stacking is the real enemy · genre modifies, never grants immunity · favor tension over stated resolution · favor active verbs over "is/are" · show the wound, not the scar · hold the chorus and the opening to the strictest standard.

## §11 Verdict & report format

Per line: `PASS` · `CONDITIONAL — binding requirement: <what a later lyric must deliver to earn this line>` (track it; verify before final output) · `REWRITE (T1–T4)` · `BLOCK (Tier 0)`.

At **TropeCheck: standard** — apply fixes silently; after the lyrics, report one line per change: `[V2/L3] FC-5 → T2: added named destination`. At **strict** — show the full table (line · CDS · class · verdict · fix). At **off** — skip (user request only). Binding requirements from CONDITIONAL passes must be confirmed satisfied in the same report.
