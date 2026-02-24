# Content Model

This document describes the content types and their relationships for the West of Wonder campaign tracker.

## Content Types

### Characters
Player characters in the campaign.

| Field | Type | Description |
|-------|------|-------------|
| name | string | Character's full name |
| race | string | Character race (Human, Elf, Dwarf, etc.) |
| class | string | Character class (Fighter, Wizard, etc.) |
| subclass | string | Character subclass (optional) |
| background | string | Character background (optional) |
| titles | string[] | Titles or honorifics gained |
| status | enum | `active`, `retired`, or `dead` |
| dndbeyond | url | Link to D&D Beyond character sheet (optional) |

**Reverse relationships:**
- Sessions they participated in
- Items they own

---

### Sessions
Records of game sessions/expeditions.

| Field | Type | Description |
|-------|------|-------------|
| title | string | Session title |
| date | date | Date played (YYYY-MM-DD) |
| characters | slug[] | Characters who participated |
| locations | slug[] | Locations visited |
| npcs | slug[] | NPCs encountered |
| creatures | slug[] | Creatures encountered |
| items | slug[] | Notable items found/used |
| storylines | slug[] | Storylines advanced |

---

### Locations
Places in the world - dungeons, towns, wilderness areas, etc.

| Field | Type | Description |
|-------|------|-------------|
| name | string | Location name |
| type | string | `dungeon`, `wilderness`, `settlement`, `landmark`, etc. |
| status | enum | `rumored`, `discovered`, or `explored` |
| parent | slug | Parent location (for sub-locations) |
| factions | slug[] | Factions with presence here |

**Reverse relationships:**
- Child locations (sub-locations)
- NPCs located here
- Sessions that visited
- Items originating here

---

### NPCs
Non-player characters.

| Field | Type | Description |
|-------|------|-------------|
| name | string | NPC's name |
| location | slug | Where they're found |
| faction | slug | Faction membership |
| disposition | string | `friendly`, `neutral`, `hostile`, etc. |
| alive | boolean | Whether they're still alive |

**Reverse relationships:**
- Sessions they appeared in
- Rumors mentioning them

---

### Rumors
Quest hooks, leads, and information gathered.

| Field | Type | Description |
|-------|------|-------------|
| title | string | Short description |
| source | string | Where the rumor came from |
| status | enum | `open`, `completed`, or `failed` |
| locations | slug[] | Related locations |
| npcs | slug[] | Related NPCs |
| factions | slug[] | Related factions |

---

### Factions
Organizations, groups, and power structures.

| Field | Type | Description |
|-------|------|-------------|
| name | string | Faction name |
| disposition | string | `friendly`, `neutral`, `hostile`, etc. |
| headquarters | slug | Primary location |

**Reverse relationships:**
- NPCs who are members
- Locations where they have presence
- Storylines involving them
- Rumors about them

---

### Items
Notable equipment, artifacts, and treasure.

| Field | Type | Description |
|-------|------|-------------|
| name | string | Item name |
| type | string | `weapon`, `armor`, `potion`, `artifact`, etc. |
| rarity | string | `common`, `uncommon`, `rare`, `very rare`, `legendary` |
| owner | slug | Current owner (character) |
| origin | slug | Where it was found (location) |

---

### Creatures
Bestiary of encountered monsters.

| Field | Type | Description |
|-------|------|-------------|
| name | string | Creature name |
| type | string | `humanoid`, `beast`, `undead`, `monstrosity`, etc. |
| threat | string | `low`, `medium`, `high`, `deadly` |

**Reverse relationships:**
- Sessions where encountered

---

### Storylines
Ongoing plot arcs and questlines.

| Field | Type | Description |
|-------|------|-------------|
| name | string | Storyline name |
| status | enum | `active`, `completed`, or `abandoned` |
| factions | slug[] | Factions involved |
| locations | slug[] | Key locations |

**Reverse relationships:**
- Sessions that advanced this storyline

---

## Slug References

Content is linked by **slug** - the filename without the `.md` extension.

For example, to reference a character file at `content/characters/thorin-ironforge.md`:

```yaml
characters:
  - thorin-ironforge
```

## File Locations

All content lives in `content/` subdirectories:

```
content/
  characters/*.md
  sessions/*.md
  locations/*.md
  npcs/*.md
  rumors/*.md
  factions/*.md
  items/*.md
  creatures/*.md
  storylines/*.md
```

Each directory has a `.json` file that sets defaults (layout, tags, permalink).
