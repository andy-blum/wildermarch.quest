import collections from "./config/collections.js";
import filters from "./config/filters.js";

export default function(eleventyConfig) {
  // Configure Nunjucks with autoescape disabled for .txt output
  eleventyConfig.setNunjucksEnvironmentOptions({
    autoescape: false
  });

  // Passthrough copies
  eleventyConfig.addPassthroughCopy("fonts");
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("robots.txt");
  eleventyConfig.addPassthroughCopy("llms.txt");

  // Load collections and filters
  collections(eleventyConfig);
  filters(eleventyConfig);
}
