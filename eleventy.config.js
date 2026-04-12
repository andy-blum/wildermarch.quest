export default function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("fonts");
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy({"js/*.js": "js"});

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
};
