// .eleventy.mjs
import { DateTime } from "npm:luxon";
import pluginRss from "npm:@11ty/eleventy-plugin-rss";

export default function(eleventyConfig) {
  eleventyConfig.addGlobalData("ap", {
    serviceUrl: Deno.env.get("AP_SERVICE_URL") ?? "https://ap.arnorichter.de/ap",
    inboxUrl:   Deno.env.get("AP_INBOX_URL")   ?? "https://ap.arnorichter.de/ap/inbox",
    followersUrl:   Deno.env.get("AP_FOLLOWERS_URL")   ?? "https://ap.arnorichter.de/ap/followers"
  });
  
  eleventyConfig.addPlugin(pluginRss);
  
  // Collection: all notes (src/notes/*.md), sorted by published ascending
  eleventyConfig.addCollection("notes", (collectionApi) => {
    return collectionApi
      .getFilteredByGlob("src/notes/*.md")
      .sort((a, b) => {
        const da = new Date(a.data.published || a.date);
        const db = new Date(b.data.published || b.date);
        return da - db;
      });
  });

  // Filters
  // Usage in Nunjucks: {{ someDate | date("yyyy-LL-dd'T'HH:mm:ss'Z'") }}
  eleventyConfig.addFilter("date", (value, format = "yyyy-LL-dd'T'HH:mm:ss'Z'") => {
    // Accept JS Date, ISO string, or millis
    const dt =
      value instanceof Date
        ? DateTime.fromJSDate(value)
        : typeof value === "string"
          ? DateTime.fromISO(value, { setZone: true })
          : DateTime.fromMillis(Number(value), { zone: "utc" });
    return dt.toUTC().toFormat(format);
  });

  // Optional: copy anything under src/static/ straight through
  eleventyConfig.addPassthroughCopy({ "src/static": "static" });

  // (Nice-to-have) Watch JSON/NJK in notes dir too
  eleventyConfig.addWatchTarget("src/notes/");
  eleventyConfig.addWatchTarget("src/_includes/");

  return {
    dir: {
      input: "src", 
      includes: "_includes", 
      output: "_site" 
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    dataTemplateEngine: "njk",
    passthroughFileCopy: true,
    pathPrefix: "/ap-static-blog/"
  };
}
