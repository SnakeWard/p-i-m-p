# K3 — Suno Generation Protocol

*Consolidated from P.I.M.P. Suno Generation Protocol v1.0, Audio Enhancement & Perception Layer, and "Unlocking Suno's Full Potential" research — 2026-07. Suno-first; the §1 signal stack applies to any text-to-music engine.*

**WHEN TO USE THIS FILE:** writing any Style/Production Prompt; formatting lyrics for generation; the user reports a bad generation (garbled vocals, sung cues, ignored brief, generic output); planning the iteration/repair workflow; setting sliders.

**INDEX:** §1 Signal stack · §2 Style-prompt construction · §3 Lyrics formatting · §4 Iteration workflow · §5 Control knobs · §6 Troubleshooting · §7 Rights note

---

## §1 The Signal Stack

Music generation is behavioral direction, not description. A prompt must define identity, emotion, and structure or the result will be unstable. Build every prompt in this priority order — order matters:

1. **Identity** — who is performing: gender, age, tone, texture, emotional state. *"female, late 20s, raspy but intimate, restrained but emotionally fragile."* Rule: unclear singer identity → vocal performance drifts.
2. **Emotion** — the arc across sections: verse emotion → chorus release → bridge shift. Rule: emotion must evolve; static emotion produces flat songs.
3. **Genre** — primary genre = rhythmic foundation; secondary = aesthetic color. Rule: two equal genres compete; one must lead. **Fusion = Skeleton + Color** (skeleton: grunge rhythm and guitars; color: mariachi trumpet accents). The skeleton must remain stable.
4. **Production** — mix style, instrumentation behavior, space, compression, mastering character. Production shapes the sound stage, not the composition.
5. **Structure** — section list. Structure stabilizes generation; without it, songs wander.

**Prime directive: clarity beats complexity.** The engine needs: who is singing, what the emotional journey is, what musical world it lives in, where the song is going. Everything else is optional. When in doubt, simplify — remove anything that doesn't serve Identity + Tension + Release.

## §2 Style-prompt construction (≤ ~1,000 characters)

The ~1,000-character Style limit is community-reported, not officially guaranteed; write to it. Allocate by information gain:

| Budget | Content |
|---|---|
| 25–35% | Genre spine + era + tempo feel ("mid-tempo," "slow burn to explosive lift," BPM if it matters) |
| 20–30% | Instrumentation + drum/bass behavior, per section where useful |
| 15–25% | Vocal spec: gender, timbre, delivery, harmony behavior |
| 10–20% | Mix/master intent: width, depth, saturation, low-end, dynamics |
| 0–10% | Negative constraints — ONE short clause max ("avoid pop tropes, avoid EDM drums, avoid glossy autotune") |

Write it as a **production brief**, not adjectives. Replace "epic, emotional" with observable behavior: instrument roles, section contrast, mix space.

> **Before:** "alternative rock, emotional, male singer, big chorus"
> **After:** "Mid-tempo contemporary alt rock/post-grunge. Intimate verses: restrained drums, clean chorused guitars; chorus swells to wide distorted guitars without going full metal. Male lead: close-mic, worn, vulnerable; tight 2nd male harmony above lead in chorus. Mix: forward vocal, wide stereo guitars, controlled low-end, minimal verse reverb, larger chorus ambience."

**Descriptor vocabulary** (stack 2–4 per prompt as fits):
- *Fidelity:* High-Fidelity Production · Studio Fidelity Mix · Broadcast Quality Mix · Professional Mastering · Full Spectrum Mix · Tight Low-End Mix · Wide Stereo Field
- *Vocal clarity:* Clear Lead Vocal · Forward Vocal Mix · Crisp Vocal Presence · Close-Mic Vocal Detail · Breath Detail Capture · Clean Harmony Layers · Focused Center Vocal
- *Instrument/mix:* Punchy Drum Mix · Balanced Stereo Imaging · Defined Guitar Separation · Warm Bass Foundation · Controlled Dynamic Range · Layered Rhythm Guitars · Textured Ambient Reverb · Modern Rock Compression
- *Pitch framing:* Artist Pitch Demo · Songwriter Demo · Studio Demo · Pre-Production Demo
- *Sync framing:* Sync Ready · Trailer Ready · Film/TV Cue · Cinematic Mix · Underscore Version · Instrumental Mix
- *Version tags:* Radio Mix · Album Version · Extended Version · Acoustic Version · Stripped Version · Live Studio Version
- *Proven stacks:* "Artist Pitch Demo — Studio Fidelity Mix — Clear Lead Vocal" · "Sync Ready — Cinematic Mix — Broadcast Master" · "Studio Demo — Forward Vocal Mix — Modern Rock Production"

Spatial and timing intent when psychologically relevant: narrow field = intimacy/confinement, wide = grandeur/dominance; short reverb = tension/immediacy, long tails = dream/distance; tight quantization = mechanical precision, loose = human groove; snare behind beat = swagger, vocal ahead = urgency.

## §3 Lyrics formatting for generation

- Section tags in `[brackets]` on their own lines: `[Verse 1]`, `[Chorus]`, `[Bridge]`. Tags are soft constraints — nudges, not commands.
- Staging notes in `(parentheses)`, short and NON-lyrical: `(ambient guitar swells)`, `(pull back; intimate vocal)`. Avoid rhyme or poetic phrasing in directives or they may get sung.
- Keep directives on their own lines; keep lyric lines clean. If a cue keeps being sung, move it into the Style field or shorten it to a bare section label.
- Vocals respond more to emotion cues than technical language: `(whispered verse)`, `(strained chorus)`, `(belted final line)`.

## §4 Iteration workflow (the canonical loop)

Never rely on one generation. One controlled loop:

1. **Seed Discovery** — generate multiple candidates from the same brief (Custom Mode: Style + Lyrics; Simple Mode is for ideation only). Judge only vocal identity, hook strength, and genre fidelity — not the whole song.
2. **Seed Selection** — pick the take with the best voice + strongest hook + stable genre reading. This is the **root seed**. Never discard a strong root seed.
3. **Section Expansion** — extend section by section (intro → verse → chorus → …), never the whole song at once. Section control preserves stability.
4. **Prompt Mutation** — change ONE layer at a time (emotional intensity, instrumentation, bridge contrast). Small changes preserve motifs; large changes reset direction. Bad chorus energy → modify the Emotion layer only.
5. **Structural Repair** — crop the failed section, regenerate only that segment (Replace Section: "more harmonic lift, add harmony, widen guitars"), reconnect to the root seed. Repair before regeneration.
6. **Polish & lock** — **Remaster Subtle** = keep arrangement, improve mix/pronunciation; **Remaster High** = explore new textures without rewriting; **Cover** = keep melody, new identity. **Persona** = save the artist essence (voice + style) for cross-song consistency — this is how PIMP personas (§2 of the instructions) stabilize in Suno. For release-grade work: export stems (up to 12-track; WAV / tempo-locked / MIDI), finish in Studio or a DAW; Remove FX to reprocess vocals externally.

**A/B method:** hold lyrics constant; change one variable per batch (brief phrasing OR one slider OR one tag); judge several generations per condition on: genre fidelity, structural coherence, vocal intelligibility, harmony behavior, mix translation.

## §5 Control knobs

| Knob | Behaves like | Raise when | Lower when |
|---|---|---|---|
| **Weirdness** | Temperature/diversity | Outputs too generic | Stability/diction problems |
| **Style Influence** | Conditioning weight | It ignores your brief | Output rigid/sterile |
| **Audio Influence** | Upload conditioning weight | Preserve uploaded groove | Let it reimagine |
| **Remaster variation** | Controlled mutation | Explore textures (High) | Preserve performance (Subtle) |

Standard corrections: too generic → nudge Weirdness up, loosen Style Influence. Ignoring the brief → raise Style Influence, cut Weirdness.

## §6 Troubleshooting

| Symptom | Likely causes | Fixes |
|---|---|---|
| Garbled/mushy vocals | Syllable-dense lines; rare words/consonant clusters; directives mixed into lyrics; high Weirdness | Edit Lyrics preserving syllable count; Remaster Subtle (documented pronunciation fix); lower Weirdness, raise Style Influence |
| Cues being sung | Verbose/poetic directives | Bare `[labels]`; non-lyrical `(notes)`; move the cue to the Style field |
| Wrong vocal gender / no harmony | Weak identity signal; high variance | Explicit "male lead vocal / female backing vocals"; name techniques (harmonization, call-and-response, falsetto); lower Weirdness; use a Persona; for deterministic harmony, comp two takes via stems |
| Generic "AI filler" sound | Vague adjectives; prompt spent on negatives | Swap adjectives for production behavior (§2); one short negative clause only |
| Unstable generations | Too many genres; excessive adjectives; unclear identity; missing structure | Simplify to the Signal Stack; one genre must lead |
| Song wanders | No structure signal | Add the section list; expand section-by-section (§4) |

## §7 Rights note (as of mid-2025 — verify before release decisions)

Paid-tier creations: creator owns and keeps commercial rights. Free tier: Suno owns; non-commercial use with attribution. Fully AI-generated works may not be copyrightable (US human-authorship standard) — document your human contribution. Never generate lyrics "in the style of <specific song/artist's lyrics>" — regurgitation risk. You must hold rights to anything you upload.
