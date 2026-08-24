# pimp.persona.v1

First-class identity card. Import → validate → Use → Spec bind.
Personas do **not** mutate global K2 phrase lists. Forbidden/anchors are session bias on the Spec.

## Schema

`schema` must equal `pimp.persona.v1`.

Required:

- `id`, `name`, `version`, `createdAt` (ISO-8601), `source` (`llm` | `human` | `hybrid`)
- `identity.one_line`, `identity.point_of_view` (`first` | `second` | `third`), `identity.register`
- `voice.vocal_protocol`, `voice.performance_target`, `voice.diction[]`, `voice.forbidden[]`
- `defaults.genre_spine`, `defaults.genre_color`, `defaults.trope_check` (`off` | `standard` | `strict`)
- `defaults.trope_tone`, `defaults.emotion_path`, `defaults.narrative_arc`
- `anchors.objects` (length ≥ 3), `anchors.places[]`, `anchors.actions[]`
- `constraints.one_intent_rule` (boolean), `constraints.max_abstraction` (`low` | `medium` | `high`), `constraints.must_bind_objects_in_verse` (boolean)
- `notes` optional string

Validator lives in `src/pimp/persona/schema.ts` (`validatePersona`).

Storage: `data/personas/<id>.json` + `index.json` (CLI). Studio mirrors the same objects in local persist.

```text
pimp-mod persona validate --file <path>
pimp-mod persona load --file <path>
pimp-mod persona list
pimp-mod persona show <id>
pimp-mod persona drop <id>
```

## Valid example

See [`data/personas/_example.json`](../data/personas/_example.json) (Vesper Hollow).

## Use → Spec bind

On **Use**:

| Spec field | Persona field |
|---|---|
| persona | name |
| genreSpine | defaults.genre_spine |
| genreColor | defaults.genre_color |
| tropeCheck | defaults.trope_check |
| tropeTone | defaults.trope_tone |
| vocalProtocol | voice.vocal_protocol |
| performanceTarget | voice.performance_target |
| emotionPath | defaults.emotion_path |
| narrativeArc | defaults.narrative_arc |
| personaAnchors | objects + places + actions |
| personaForbidden | voice.forbidden |

If a Spec already has title / intent / persona, the UI asks overwrite vs cancel.
Soft Conflict Alert if intent fights `identity.one_line` or contains a forbidden phrase.

## Criteria card for other LLMs

Emit ONLY valid JSON matching schema `pimp.persona.v1`.

Rules:

1. One psychological identity — not a genre list.
2. `one_line` must be concrete (job, place, or habit), not a mood slogan.
3. `anchors.objects` ≥ 3 physical, nameable things.
4. `voice.forbidden` blocks portable slogans this persona would never say.
5. `defaults.genre_spine` = structural ownership; `genre_color` = texture only.
6. `trope_check` is `off` | `standard` | `strict`.
7. No lyrics. No full song. Persona only.
8. `source`: `"llm"`
