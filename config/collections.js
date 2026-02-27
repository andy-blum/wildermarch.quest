export default function(eleventyConfig) {
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
}
