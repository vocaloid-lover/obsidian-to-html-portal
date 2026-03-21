// .eleventy.js
module.exports = function (eleventyConfig) {
  const htmlEntityMap = {
    "&nbsp;": " ",
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
  };

  function decodeEntities(value = "") {
    return String(value).replace(
      /&(nbsp|amp|lt|gt|quot|#39);/g,
      (entity) => htmlEntityMap[entity] || entity
    );
  }

  function plainText(value = "") {
    return decodeEntities(String(value))
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\$\$[\s\S]*?\$\$/g, " ")
      .replace(/\$[^$\n]+\$/g, " ")
      .replace(/\\[a-zA-Z]+/g, " ")
      .replace(/[{}\[\]()]/g, " ")
      .replace(/\{\{[\s\S]*?\}\}/g, " ")
      .replace(/\{%[\s\S]*?%\}/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/^[“”"'`]+/, "");
  }

  function excerpt(value = "", maxLength = 160) {
    const text = plainText(value);

    if (!text) {
      return "";
    }

    if (text.length <= maxLength) {
      return text;
    }

    return `${text.slice(0, maxLength).trim()}…`;
  }

  eleventyConfig.addNunjucksFilter("escapeNjk", function (value) {
    if (!value) return "";

    return value
      .replace(/\{\{/g, "&#123;&#123;")
      .replace(/\}\}/g, "&#125;&#125;")
      .replace(/\{\%/g, "&#123;%")
      .replace(/\%\}/g, "%&#125;");
  });

  eleventyConfig.addFilter("plainText", plainText);
  eleventyConfig.addFilter("excerpt", excerpt);

  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/search");
  eleventyConfig.addPassthroughCopy("image");

  eleventyConfig.addWatchTarget("src/scss/**/*.scss");
  eleventyConfig.addWatchTarget("src/js/**/*.js");

  eleventyConfig.addCollection("notes", function (collectionApi) {
    return collectionApi.getFilteredByGlob("src/notes/**/*.md");
  });

  return {
    dir: {
      input: "src",
      output: "public",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["md", "njk", "html", "liquid"],
    pathPrefix: "/",
  };
};
