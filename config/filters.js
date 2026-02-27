export default function(eleventyConfig) {
  // Extract raw markdown content (without frontmatter) for .txt output
  eleventyConfig.addFilter("rawMarkdown", item => {
    if (!item?.rawInput) return "";
    const content = item.rawInput;
    // Remove YAML frontmatter (between --- markers)
    const match = content.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n([\s\S]*)$/);
    return match ? match[1].trim() : content.trim();
  });

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
}
