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
| portrait | string | Filename in images/characters/ (optional) |

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
| image | string | Filename in images/locations/ (optional) |
| mapX | number | Percentage (0-100) from left edge of map image (optional) |
| mapY | number | Percentage (0-100) from top edge of map image (optional) |

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
| image | string | Filename in images/npcs/ (optional) |

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
| image | string | Filename in images/items/ (optional) |

---

### Creatures
Bestiary of encountered monsters.

| Field | Type | Description |
|-------|------|-------------|
| name | string | Creature name |
| type | string | `humanoid`, `beast`, `undead`, `monstrosity`, etc. |
| threat | string | `low`, `medium`, `high`, `deadly` |
| image | string | Filename in images/creatures/ (optional) |

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

### Documents
In-world writings authored by characters or NPCs.

| Field | Type | Description |
|-------|------|-------------|
| title | string | Document title |
| type | string | `report`, `letter`, `journal`, `note`, etc. |
| author | slug | Character or NPC who wrote it. Resolved against `characters` first, then `npcs` — if a character and NPC share a slug, the character wins. |
| session | slug | Related session (optional) |
| date | date | When written |

**Reverse relationships:**
- Listed on the author's character page, or on their NPC page if no character of that slug exists.

---

### Artwork
Player-created artwork from the campaign.

| Field | Type | Description |
|-------|------|-------------|
| title | string | Artwork title |
| type | enum | `character`, `scene`, `iconography`, or `video` |
| image | string | Filename in images/gallery/ (for images) |
| video | url | Embed URL for YouTube/Vimeo (for video type) |
| artist | string | Creator name (optional) |
| artistLink | url | Link to artist profile/site (optional) |
| description | string | Brief description |
| relatedTo | slug[] | Related content (characters, sessions, factions, etc.) |
| date | date | When created |

**Reverse relationships:**
- None currently

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
  documents/*.md
  artwork/*.md
```

## Image Locations

```
images/
  characters/   # Character portraits (referenced by portrait field)
  creatures/    # Creature images (referenced by image field)
  gallery/      # Artwork images (referenced by artwork image field)
  items/        # Item images (referenced by image field)
  locations/    # Location images (referenced by image field)
  npcs/         # NPC images (referenced by image field)
```

Each directory has a `.json` file that sets defaults (layout, tags, permalink).
