import striptags from 'striptags';

const SEARCH_COLLECTIONS = [
  'characters', 'sessions', 'locations', 'npcs', 'rumors',
  'factions', 'items', 'creatures', 'storylines', 'documents',
];

// Frontmatter fields worth indexing per collection (skip slugs, images, urls, booleans)
const METADATA_FIELDS = {
  characters: ['race', 'class', 'subclass', 'background', 'titles', 'status'],
  sessions: ['date'],
  locations: ['type', 'status'],
  npcs: ['disposition'],
  rumors: ['source', 'status'],
  factions: ['disposition'],
  items: ['type', 'rarity'],
  creatures: ['type', 'threat'],
  storylines: ['status'],
  documents: ['type', 'date'],
};

function extractMetadata(data, collectionName) {
  const fields = METADATA_FIELDS[collectionName] || [];
  const parts = [];
  for (const field of fields) {
    const val = data[field];
    if (!val) continue;
    if (Array.isArray(val)) {
      parts.push(val.join(' '));
    } else if (val instanceof Date) {
      parts.push(val.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
    } else {
      parts.push(String(val));
    }
  }
  return parts.join(' ');
}

export default function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("fonts");
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy({"js/*.js": "js"});
  eleventyConfig.addPassthroughCopy({
    './node_modules/@orama/orama/dist/browser': './js/orama',
  });

  // Content collections
  eleventyConfig.addCollection("characters", collection =>
    collection.getFilteredByGlob("content/characters/*.md"));

  eleventyConfig.addCollection("sessions", collection =>
    collection.getFilteredByGlob("content/sessions/*.md").sort((a, b) =>
      new Date(b.data.date) - new Date(a.data.date)));

  eleventyConfig.addCollection("locations", collection =>
    collection.getFilteredByGlob("content/locations/*.md"));

  eleventyConfig.addCollection("npcs", collection =>
    collection.getFilteredByGlob("content/npcs/*.md"));

  eleventyConfig.addCollection("rumors", collection =>
    collection.getFilteredByGlob("content/rumors/*.md"));

  eleventyConfig.addCollection("factions", collection =>
    collection.getFilteredByGlob("content/factions/*.md"));

  eleventyConfig.addCollection("items", collection =>
    collection.getFilteredByGlob("content/items/*.md"));

  eleventyConfig.addCollection("creatures", collection =>
    collection.getFilteredByGlob("content/creatures/*.md"));

  eleventyConfig.addCollection("storylines", collection =>
    collection.getFilteredByGlob("content/storylines/*.md"));

  eleventyConfig.addCollection("documents", collection =>
    collection.getFilteredByGlob("content/documents/*.md").sort((a, b) =>
      new Date(b.data.date) - new Date(a.data.date)));

  eleventyConfig.addCollection("artwork", collection =>
    collection.getFilteredByGlob("content/artwork/*.md").sort((a, b) =>
      new Date(b.data.date) - new Date(a.data.date)));

  // Limit collection to first N items
  eleventyConfig.addFilter("head", (collection, n) => collection.slice(0, n));

  // Sort collection by nested data field
  eleventyConfig.addFilter("sortBy", (collection, field) =>
    [...collection].sort((a, b) => {
      const aVal = a.data[field] || '';
      const bVal = b.data[field] || '';
      return aVal.localeCompare(bVal);
    }));

  // Date formatting
  eleventyConfig.addFilter("dateDisplay", date => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  });

  // Filter to find items by slug
  eleventyConfig.addFilter("find", (collection, slug) =>
    collection.find(item => item.fileSlug === slug));

  // Filter to find all items matching an array of slugs
  eleventyConfig.addFilter("findAll", (collection, slugs) => {
    if (!slugs || !Array.isArray(slugs)) return [];
    return collection.filter(item => slugs.includes(item.fileSlug));
  });

  // Filter to find reverse relationships (e.g., sessions that include this character)
  eleventyConfig.addFilter("mentionedIn", (collection, field, slug) =>
    collection.filter(item => {
      const values = item.data[field];
      return Array.isArray(values) && values.includes(slug);
    }));

  // Filter to find items where a single field matches a slug
  eleventyConfig.addFilter("whereField", (collection, field, slug) =>
    collection.filter(item => item.data[field] === slug));

  // Orama search index shortcode
  eleventyConfig.addShortcode('oramaIndex', async function(collections) {
    const { create, insert, save } = await import('@orama/orama');

    const db = create({
      schema: {
        url: 'string',
        type: 'string',
        title: 'string',
        metadata: 'string',
        content: 'string',
      },
    });

    for (const name of SEARCH_COLLECTIONS) {
      const items = collections[name] || [];
      for (const item of items) {
        insert(db, {
          url: item.page.url,
          type: name,
          title: item.data.title || item.data.name || item.fileSlug,
          metadata: extractMetadata(item.data, name),
          content: striptags(item.content || '').replace(/\s+/g, ' ').trim(),
        });
      }
    }

    return JSON.stringify(save(db));
  });
};
