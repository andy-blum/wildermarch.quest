# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run start` - Start development server with live reload
- `npm run build` - Build static site to `_site/`

## Architecture

Eleventy (11ty) v3 static site for tracking a D&D West Marches campaign. Uses ES modules and Nunjucks templates.

### Directory Structure

```
content/           # All content as markdown files
  characters/      # Player characters
  sessions/        # Game session logs
  locations/       # Places in the world
  npcs/            # Non-player characters
  rumors/          # Quest hooks and leads
  factions/        # Groups and organizations
  items/           # Notable equipment and artifacts
  creatures/       # Bestiary
  storylines/      # Ongoing plot arcs
_includes/         # Nunjucks layout templates
fonts/             # Static font files (passthrough)
docs/              # Documentation (excluded from build via .eleventyignore)
```

Full content model documentation with field descriptions and relationships: `docs/CONTENT_MODEL.md`

### Content Model

Each content type is a collection of markdown files with YAML frontmatter. Files are referenced by their slug (filename without extension).

| Type | Fields |
|------|--------|
| **Characters** | name, class, level, status (active/retired/dead) |
| **Sessions** | title, date, characters[], locations[], npcs[], creatures[], items[], storylines[] |
| **Locations** | name, type, status (rumored/discovered/explored), parent, factions[] |
| **NPCs** | name, location, faction, disposition, alive |
| **Rumors** | title, source, status (open/completed/failed), locations[], npcs[], factions[] |
| **Factions** | name, disposition, headquarters |
| **Items** | name, type, rarity, owner, origin |
| **Creatures** | name, type, threat |
| **Storylines** | name, status (active/completed/abandoned), factions[], locations[] |

Array fields (e.g., `characters[]`) reference other content by slug.

### Relationships

Relationships are computed automatically via Eleventy filters defined in `eleventy.config.js`:
- `find(collection, slug)` - Find single item by slug
- `findAll(collection, slugs)` - Find items matching array of slugs
- `mentionedIn(collection, field, slug)` - Reverse lookup (e.g., sessions mentioning a character)
- `whereField(collection, field, slug)` - Filter by single-value field

### Adding Content

1. Create a markdown file in the appropriate `content/` subdirectory
2. Add required frontmatter fields
3. Reference other content by slug (filename without .md)

Example character (`content/characters/thorin.md`):
```yaml
---
name: Thorin Ironforge
class: Fighter
level: 3
status: active
---
Character description here.
```
