// .eleventy.js
module.exports = function(eleventyConfig) {
  // 添加Nunjucks语法转义过滤器
  eleventyConfig.addNunjucksFilter("escapeNjk", function(value) {
    if (!value) return "";
    return value
      .replace(/\{\{/g, "&#123;&#123;")
      .replace(/\}\}/g, "&#125;&#125;")
      .replace(/\{\%/g, "&#123;%")
      .replace(/\%\}/g, "%&#125;");
  });
  // 将css、js和search目录复制到输出目录
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/search");
  // 将根目录下的 image 文件夹复制到输出，确保 logo 等静态资源可访问
  eleventyConfig.addPassthroughCopy("image");
  
  // 监听 Sass 文件变化（开发模式）
  eleventyConfig.addWatchTarget("src/scss/**/*.scss");
  // 添加 notes 集合，基于 src/notes 下的所有 Markdown 文件
  eleventyConfig.addCollection("notes", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/notes/**/*.md");
  });
    // 添加一个自定义的permalink函数来解决冲突
  eleventyConfig.addFilter("notePermalink", function(title) {
    // 将中文标题转换为拼音或使用文件名
    return `/notes/${title}/index.html`;
  });
  return {
    // 输入目录
    dir: {
      input: "src",
      output: "public"
    },
    
    // 模板引擎
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    
    // 为笔记设置默认的permalink模式
    templateFormats: ["md", "njk", "html", "liquid"],
    pathPrefix: "/"
  };
};