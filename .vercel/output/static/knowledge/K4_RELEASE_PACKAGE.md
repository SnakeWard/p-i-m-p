# K4 — Release Package Protocol

*Transcribed from the P.I.M.P. release pipeline modules (visualRules, scabVisual, hookTemplates, platformProfiles, generateCoverArt, generateVideoHook, generateLaunchAssets) — 2026-07. Code logic converted to in-chat procedure; tables expanded where marked.*

**WHEN TO USE THIS FILE:** the user asks for cover art, a teaser/hook video, captions/hashtags, or a "release package"; Studio Loop Phase 5 (Presentation).

**INDEX:** §1 Trigger & output contract · §2 Visual inference tables · §3 Visual guardrails · §4 Cover-art assembly · §5 Hook templates & selection · §6 Platform specs · §7 Launch assets · §8 CTA defaults

---

## §1 Trigger & output contract

Input is the song's **spec block** (the project's canonical song record) plus its lyrics and, if active, the persona's visual identity. No other schema exists. A **full release package** emits, in order:

1. **Cover-art prompt** + negative prompt + 2 alternates (§4)
2. **Short-form video hook plan** — timed beat sheet per target platform (§5)
3. **Launch assets** — caption, short caption, hashtags, per-platform post variants (§7)

Single asset requests emit only that section. All visual prompts are written tool-agnostic (any modern image model), square master first, platform crops after.

## §2 Visual inference tables

**Mood → palette** (first matching mood in the Emotion Path wins; no match → black/gray/white + cinematic dramatic lighting):

| Mood | Palette |
|---|---|
| wrathful | crimson, black, ember orange |
| mournful | slate blue, ash gray, cold white |
| hopeful | gold, ivory, sky blue |
| haunted | deep teal, charcoal, violet haze |
| triumphant | gold, red, obsidian |
| intimate | warm amber, dusty rose, midnight blue |
| apocalyptic | burnt orange, ash black, sickly yellow |
| redemptive | white, gold, indigo |
| yearning *(added)* | faded rose, dusk violet, pale gold |
| defiant *(added)* | steel gray, blood red, off-white |
| euphoric *(added)* | hot pink, electric blue, white bloom |
| menacing *(added)* | oxblood, near-black green, dirty brass |
| nostalgic *(added)* | sepia, cream, washed teal |
| serene *(added)* | seafoam, bone white, soft slate |

**Genre → texture / lighting / composition** (combine when fusing genres; also see K5 per-genre visual identity):

| Genre | Textures | Lighting | Composition |
|---|---|---|---|
| hard rock | smoke, scratched metal, stage haze | dramatic backlight, hard edge highlights | bold centered subject, heavy negative space |
| metal | fire, ash, rust, cracked stone | violent contrast, cinematic rim light | heroic central framing, aggressive scale |
| dark americana | dust, old wood, fog, worn leather | moody dusk, lantern warmth | wide lonely frame, grounded realism |
| country | grain, sun fade, barn wood | golden hour natural light | story-first framing, human warmth |
| synthwave | neon bloom, glass reflections, digital haze | colored edge light, luminous atmosphere | symmetrical cinematic framing, horizon depth |
| gospel | soft cloth, light rays, air particles | heavenly glow, soft contrast | uplifted vertical framing, emotional focus |
| *no match* | atmospheric detail | cinematic dramatic lighting | balanced story-driven framing |

**Theme → symbols** (use explicit narrative symbols from the spec first; infer from themes; cap at 6 total):

| Theme | Symbols |
|---|---|
| betrayal | cracked halo, broken chain, black roses |
| vengeance | smoke trail, spent shell, burning road |
| redemption | light through storm clouds, open hands, distant cross |
| grief | folded flag, empty chair, rain on glass |
| obsession | watchful eye, spiral smoke, fractured mirror |
| faith | sunbeam through darkness, weathered Bible, crown-of-thorns silhouette |
| outlaw | six-gun silhouette, dust road, brimmed-hat shadow |
| war | torn banner, embers, scarred steel |
| love | joined hands, candlelight, soft bloom |
| freedom *(added)* | open highway at dawn, cut rope, birds off a wire |
| addiction *(added)* | amber bottle glow, tangled IV line, moth to porch light |
| isolation *(added)* | single lit window, unplowed road, one set of footprints |
| pride/fall *(added)* | burning wings, black sun, cracked crown |
| rebirth *(added)* | green shoot in ash, shed skin, first light on floodwater |
| home *(added)* | porch light on, worn key, kitchen table set for two |

**Composition templates by target:** albumCover — square, center-weighted, crop-safe subject, release-ready framing · thumbnail — high-contrast focal center, bold silhouette readable small · poster — vertical dramatic perspective, headline-safe negative space · lyricCard — clean lower-third safe area for typography, unobtrusive background.

## §3 Visual guardrails

**Standing negative prompt** (always include; append persona/user extras, dedupe): extra fingers, extra limbs, mangled hands, blurry face, generic neon city, floating random objects, text artifacts, watermark, signature, logo clutter, plastic skin, unreadable typography, oversaturated AI glow, deformed anatomy.

**Tone-mismatch check** (generalized): before emitting, verify symbols and setting match the song's genre world and emotional register — e.g., no urban neon skyline on a country track unless requested; no gore on faith-centered art; no cheap collage look under a cinematic identity. On mismatch, state the issue in one line and use the corrected version.

## §4 Cover-art assembly (numbered procedure)

Build one comma-joined prompt in this order, then clean up spacing:
1. "professional-grade cinematic album cover"
2. `<Title> by <Artist/Persona>` (only when text-on-art is wanted; otherwise omit names — see note)
3. Persona/brand visual identity line, if active
4. Genres
5. `color palette of <§2 palette>`
6. `symbolic elements: <≤6 symbols>` (fallback: "story-driven symbolism")
7. `textures: <§2 textures>`
8. §2 lighting · 9. §2 composition · 10. §2 composition template for the target
11. Platform spec from §6 (e.g., "3000x3000, 1:1")
12. "ultra-detailed, emotionally resonant, polished release-ready finish"

Then emit: the **negative prompt** (§3), and **two alternates** — "minimalist variant with stronger negative space" and "poster-like variant with more dramatic scale."
*Note:* image models render text poorly; default to symbol-driven art with no lettering and tell the user to add typography in an editor, unless they insist.

## §5 Video hook templates & selection

**Selection rule** (theme/genre → hook type): grief, love, or redemption theme → **emotional** · metal genre, or vengeance/war theme → **shock** · country or dark americana → **cinematic** · one killer line dominates → **lyric-first** · EDM or drop-centric structure → **beat-drop** · otherwise → **curiosity**. User override always wins.

**Beat sheets** (timings in seconds; fill slots from the song's key lines):

| Type | Timeline |
|---|---|
| **shock** | 0.0–1.2: core line or TITLE, hard cut, immediate focal impact → 1.2–3.0: "No warm-up. Straight into conflict." — kinetic text, impact transition |
| **emotional** | 0.0–2.0: setup line — slow zoom, low motion, emotional focal point → 2.0–5.0: payoff line — subtle swell tied to lyric or beat lift |
| **cinematic** | 0.0–2.0: title — atmospheric reveal using 1–2 symbols → 2.0–5.0: "Something is coming." — camera push, rising tension |
| **curiosity** | 0.0–2.5: a question built from the song's stakes — minimal motion, bold centered text → 2.5–5.0: "Press play and find out." — quick reveal to title/chorus cue |
| **lyric-first** | 0.0–3.0: the strongest single line — clean typography over an emotionally matched still or motion plate |
| **beat-drop** | 0.0–2.0: pre-drop line — tight crop, tension build, restrained motion → 2.0–4.0: drop — smash cut synced to impact |

**Output per hook:** platform, ratio, duration, safe zone (§6), hook type, title card, the timed beat sheet, CTA (§8). Write the on-screen text fresh from the song — the quoted lines above are slot shapes, not copy to reuse.

## §6 Platform specs

| Platform | Asset | Spec |
|---|---|---|
| Ditto / DistroKid | artwork | 1:1, 3000×3000, center-weighted safe zone |
| TikTok | video | 9:16, 5–15s, center vertical, caption-safe lower third |
| Instagram Reels | video | 9:16, 5–15s, center vertical, UI-safe margins |
| YouTube Shorts | video | 9:16, 5–20s, center vertical, title-safe mid band |
| Facebook | image 1.91:1 or 1:1, center focal cluster | video 4:5 or 9:16, 5–20s, caption-safe lower band |

Unknown platform → use the Ditto artwork spec / 9:16 5–15s video and say so.

## §7 Launch assets

**Caption rule:** write the caption fresh from the song's strongest line + arc — never from a template. Fallback shape only if the song offers nothing: `<Title> is out now. <genres>. <two-step emotion arc>.` One caption (≤2 sentences), one short caption (`<Title> — out now.`), then platform variants:
- **Facebook:** caption + blank line + hashtags
- **Instagram:** caption + `.` spacer lines + hashtags
- **TikTok:** `<Title> // <CTA>` + hashtags

**Hashtags:** base `#NewMusic #OriginalSong` + one per genre (spaces stripped) + title tag (alphanumerics only) + persona tag if active; dedupe; cap at ~8.

**Anti-trope for marketing copy** (mini ban list — run K2 Pass 1 lightly): "this hits different" · "you're not ready for this" · "POV:" openers · "vibes" as the noun payload · "🔥🔥🔥" strings · "drop everything" · "trust me, listen to the end" · engagement-bait questions ("what would YOU do?"). Specific beats hype: name the image, the line, or the moment.

## §8 CTA defaults (by release phase)

| Phase | CTA |
|---|---|
| Pre-release | "Pre-save now" / "Drops <date>" |
| Release week | "Out now" |
| Catalog push | "Listen — link in bio" |
| Video-first push | "Full song on <platform>" |

User-specified CTA always wins.
