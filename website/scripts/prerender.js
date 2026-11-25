import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { PAGES, PRIVACY, SITE } from "../src/data/siteContent.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const ssrDir = path.join(rootDir, "dist-ssr");

const templatePath = path.join(distDir, "index.html");
let template = fs.readFileSync(templatePath, "utf-8");

// Inline all CSS stylesheets so initial paint has zero render-blocking requests
const stylesheetRegex = /<link\s+rel="stylesheet"[^>]*href="([^"]+\.css)"[^>]*\/?>/gi;
let combinedCss = "";
const matches = [...template.matchAll(stylesheetRegex)];

for (const match of matches) {
  const cssRelPath = match[1].replace(/^\//, "");
  const cssFullPath = path.join(distDir, cssRelPath);
  if (fs.existsSync(cssFullPath)) {
    const cssContent = fs.readFileSync(cssFullPath, "utf-8");
    combinedCss += "\n" + cssContent;
    fs.rmSync(cssFullPath, { force: true });
  }
  template = template.replace(match[0], "");
}

if (combinedCss) {
  template = template.replace("</head>", `  <style>${combinedCss.trim()}</style>\n  </head>`);
}

const serverEntryUrl = pathToFileURL(path.join(ssrDir, "entry-server.js")).href;
const { render } = await import(serverEntryUrl);

const routes = [
  { url: "/", outFile: path.join(distDir, "index.html") },
  { url: "/privacy/", outFile: path.join(distDir, "privacy", "index.html") },
  { url: "/support/", outFile: path.join(distDir, "support", "index.html") },
  { url: "/404.html", outFile: path.join(distDir, "404.html") },
];

for (const route of routes) {
  const { html, head } = render(route.url);
  const pageHtml = template
    .replace("<!--app-head-->", head)
    .replace("<!--app-html-->", html);

  fs.mkdirSync(path.dirname(route.outFile), { recursive: true });
  fs.writeFileSync(route.outFile, pageHtml, "utf-8");
}

// Generate sitemap.xml and robots.txt straight from siteContent.js.
const indexablePages = [PAGES.home, PAGES.privacy, PAGES.support];
const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexablePages
  .map(
    (p) => `  <url>
    <loc>${SITE.siteUrl}${p.path}</loc>
    <lastmod>${PRIVACY.effectiveIso}</lastmod>
    <changefreq>${p.path === "/" ? "monthly" : "yearly"}</changefreq>
    <priority>${p.path === "/" ? "1.0" : "0.8"}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;
fs.writeFileSync(path.join(distDir, "sitemap.xml"), sitemapXml, "utf-8");

const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${SITE.siteUrl}/sitemap.xml
`;
fs.writeFileSync(path.join(distDir, "robots.txt"), robotsTxt, "utf-8");

// Clean temporary SSR bundle output.
fs.rmSync(ssrDir, { recursive: true, force: true });

console.log(
  `[prerender] Built ${routes.length} routes, sitemap.xml, and robots.txt into dist/.`
);
