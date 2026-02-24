export default function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("fonts");

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
