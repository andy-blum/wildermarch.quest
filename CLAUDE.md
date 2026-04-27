# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Content Rules

**IMPORTANT: The following are authoritative source material and MUST NOT be modified:**
- `content/sessions/` - Human-written session logs
- `content/documents/` - In-world writings (journals, reports, letters)
- Character `## Introduction` sections - Player-written backstories

Other content (locations, npcs, factions, etc.) and the `## What We've Learned` sections of characters contain AI-generated/inferred content that may be updated based on session events.

**Character `## What We've Learned` sections have a high bar:** only update them when a session reveals new backstory, motivation, identity, or otherwise dramatically alters the character. Routine session events — what they did, fought, found, or used — belong in session logs, NPC/location pages, or storylines, not on the character's own page.

**Item pages have a similar high bar:** only update them when a session reveals new properties, origin, history, or otherwise changes what the item *is*. Routine usage — who cast what with it, in which encounter — belongs in session logs, not on the item's page.

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
  documents/       # In-world writings (journals, reports, letters)
_includes/         # Nunjucks layout templates
fonts/             # Static font files (passthrough)
docs/              # Documentation (excluded from build via .eleventyignore)
```

### Content Model

Each content type is a collection of markdown files with YAML frontmatter. Files are referenced by their slug (filename without extension). Each content directory has a `TEMPLATE.md` showing the available fields.

Full content model documentation with field descriptions and relationships: `docs/CONTENT_MODEL.md`

### Relationships

Relationships are computed automatically via Eleventy filters defined in `eleventy.config.js`:
- `find(collection, slug)` - Find single item by slug
- `findAll(collection, slugs)` - Find items matching array of slugs
- `mentionedIn(collection, field, slug)` - Reverse lookup (e.g., sessions mentioning a character)
- `whereField(collection, field, slug)` - Filter by single-value field

### Adding Content

1. Create a markdown file in the appropriate `content/` subdirectory
2. Copy frontmatter from the `TEMPLATE.md` in that directory
3. Reference other content by slug (filename without .md)
