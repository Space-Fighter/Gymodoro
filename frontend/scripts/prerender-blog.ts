/**
 * Build step (runs after `vite build`, see package.json): bakes every blog
 * route into its own static HTML file so search engines and link previews get
 * the full article, title, description, canonical and JSON-LD in the initial
 * HTML response, with no JavaScript required. React replaces the static markup
 * when it mounts (createRoot), so visitors still get the full app.
 *
 * Writes dist/blog.html, dist/blog/<slug>.html (served by nginx via
 * `try_files $uri $uri.html ...`), dist/sitemap.xml, dist/blog/rss.xml, and
 * appends the post list to dist/llms.txt.
 *
 * Run with plain Node (>= 22.18 / 24 strips TypeScript types natively).
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, appendFileSync } from "node:fs";
import { dirname, join, basename, extname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  POSTS,
  SITE_URL,
  BLOG_TITLE,
  BLOG_SEO_TITLE,
  BLOG_DESCRIPTION,
  formatDate,
  readingMinutes,
  getPost,
  type BlogPost,
  type Block,
} from "../src/content/blog/posts.ts";
import { parseInline, slugify } from "../src/content/blog/inline.ts";
import { blogIndexJsonLd, blogPostJsonLd, blogPath, postPath } from "../src/content/blog/seo.ts";

const DIST = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
const TEMPLATE = readFileSync(join(DIST, "index.html"), "utf8");
const ASSETS = readdirSync(join(DIST, "assets"));

// ---------- helpers ----------

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Built (hashed) URL of a source asset, e.g. "fix/swap-pushup.jpg" -> "/assets/swap-pushup-AbC123.jpg". */
function builtAsset(source: string): string {
  const ext = extname(source);
  const stem = basename(source, ext);
  const hit = ASSETS.find((f) => f.startsWith(`${stem}-`) && f.endsWith(ext));
  if (!hit) throw new Error(`prerender-blog: no built asset for ${source} in dist/assets`);
  return `/assets/${hit}`;
}

function inline(text: string): string {
  return parseInline(text)
    .map((s) =>
      s.kind === "bold"
        ? `<strong>${esc(s.text)}</strong>`
        : s.kind === "link"
          ? `<a href="${esc(s.href)}">${esc(s.text)}</a>`
          : esc(s.text),
    )
    .join("");
}

function block(b: Block): string {
  switch (b.type) {
    case "h2":
      return `<h2 id="${slugify(b.text)}">${inline(b.text)}</h2>`;
    case "h3":
      return `<h3>${inline(b.text)}</h3>`;
    case "p":
      return `<p>${inline(b.text)}</p>`;
    case "ul":
    case "ol":
      return `<${b.type}>${b.items.map((i) => `<li>${inline(i)}</li>`).join("")}</${b.type}>`;
    case "callout":
      return `<aside class="pr-callout"><b>${esc(b.title)}: </b>${inline(b.text)}</aside>`;
  }
}

/** Self-contained styles for the static markup (it's replaced as soon as React mounts). */
const STYLE = `<style>
.pr{min-height:100vh;color:#f6efe7;font-family:'DM Sans',system-ui,sans-serif;background:#08090d linear-gradient(rgba(0,0,0,.6),rgba(0,0,0,.85)),url(${builtAsset("hero/solution-poster.webp")}) center/cover fixed;padding:96px 5vw 64px}
.pr-col{max-width:760px;margin:0 auto}.pr-wide{max-width:1200px;margin:0 auto}
.pr h1,.pr h2,.pr h3{font-family:Manrope,sans-serif;color:#fff;letter-spacing:-.02em}.pr h1{font-size:clamp(32px,5vw,56px);line-height:1.05}
.pr p,.pr li{font-size:18px;line-height:1.7;color:rgba(255,255,255,.85)}.pr a{color:#4be277}
.pr-kicker{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#4be277}
.pr-callout{border:1px solid rgba(75,226,119,.3);background:rgba(75,226,119,.1);border-radius:16px;padding:16px}
.pr-cover{width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:26px}
.pr-nav{position:absolute;top:0;left:0;right:0;display:flex;gap:24px;align-items:center;padding:20px 5vw;font-size:14px}.pr-nav a{color:#fff;text-decoration:none}
</style>`;

const NAV = `<nav class="pr-nav"><a href="/"><strong>GYMODORO</strong></a><a href="/blog">Blog</a><a href="/signup">Start focusing</a></nav>`;

function articleMarkup(post: BlogPost, cover: string): string {
  const related = post.related.map(getPost).filter((p): p is BlogPost => !!p);
  return `${STYLE}<div class="pr">${NAV}<article class="pr-col">
<nav aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/blog">Blog</a></nav>
<div class="pr-kicker">${esc(post.kicker)}</div>
<h1>${esc(post.title)}</h1>
<p>${esc(post.description)}</p>
<p>By the Gymodoro team · <time datetime="${post.published}">${formatDate(post.published)}</time> · ${readingMinutes(post)} min read</p>
<img class="pr-cover" src="${cover}" alt="${esc(post.cover.alt)}" width="1600" height="900">
<section class="pr-callout"><h2>Key takeaways</h2><ul>${post.takeaways.map((t) => `<li>${inline(t)}</li>`).join("")}</ul></section>
${post.body.map(block).join("\n")}
<section><h2 id="faq">Frequently asked questions</h2>${post.faq.map((f) => `<h3>${esc(f.q)}</h3><p>${inline(f.a)}</p>`).join("")}</section>
<p><a href="/signup">Start your first cycle with Gymodoro, free</a></p>
</article>
<section class="pr-col"><h2>More from the journal</h2><ul>${related.map((p) => `<li><a href="${postPath(p.slug)}">${esc(p.title)}</a></li>`).join("")}</ul></section>
</div>`;
}

function indexMarkup(): string {
  return `${STYLE}<div class="pr">${NAV}<div class="pr-wide">
<div class="pr-kicker">the gymodoro journal</div>
<h1>Focus better. Move more.</h1>
<p>Research-backed guides on the Pomodoro Technique, desk exercises and taking breaks that actually recharge you.</p>
${POSTS.map(
  (p) => `<article><div class="pr-kicker">${esc(p.kicker)}</div><h2><a href="${postPath(p.slug)}">${esc(p.title)}</a></h2>
<p>${esc(p.description)}</p><p><time datetime="${p.published}">${formatDate(p.published)}</time> · ${readingMinutes(p)} min read</p></article>`,
).join("\n")}
</div></div>`;
}

interface Page {
  title: string;
  description: string;
  path: string;
  image: string;
  type: "website" | "article";
  jsonLd: object;
  markup: string;
  extraHead?: string;
}

/** Replace one attribute value on an existing head tag; fails the build if the tag is missing. */
function setTag(html: string, tag: RegExp, value: string): string {
  if (!tag.test(html)) throw new Error(`prerender-blog: index.html is missing ${tag}`);
  return html.replace(tag, (_m, pre: string, post: string) => `${pre}${esc(value)}${post}`);
}

const meta = (attr: "name" | "property", key: string) =>
  new RegExp(`(<meta\\s+${attr}="${key}"\\s+content=")[^"]*(")`);

function render(page: Page): string {
  const url = `${SITE_URL}${page.path}`;
  const image = `${SITE_URL}${page.image}`;
  let html = TEMPLATE.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(page.title)}</title>`);
  const tags: [RegExp, string][] = [
    [meta("name", "title"), page.title],
    [meta("name", "description"), page.description],
    [/(<link\s+rel="canonical"\s+href=")[^"]*(")/, url],
    [meta("property", "og:type"), page.type],
    [meta("property", "og:url"), url],
    [meta("property", "og:title"), page.title],
    [meta("property", "og:description"), page.description],
    [meta("property", "og:image"), image],
    [meta("name", "twitter:url"), url],
    [meta("name", "twitter:title"), page.title],
    [meta("name", "twitter:description"), page.description],
    [meta("name", "twitter:image"), image],
  ];
  for (const [re, v] of tags) html = setTag(html, re, v);

  // The site's og:image dimensions describe og-image.jpg; drop them for other images.
  if (page.image !== "/og-image.jpg") {
    html = html.replace(/\s*<meta\s+property="og:image:(width|height|alt)"[^>]*>/g, "");
  }

  const ld = JSON.stringify(page.jsonLd).replace(/</g, "\\u003c");
  html = html.replace(
    "</head>",
    `${page.extraHead ?? ""}<script type="application/ld+json" id="page-jsonld">${ld}</script>\n</head>`,
  );

  if (!html.includes('<div id="root"></div>')) throw new Error("prerender-blog: empty #root not found in index.html");
  return html.replace('<div id="root"></div>', `<div id="root">${page.markup}</div>`);
}

const write = (rel: string, content: string) => {
  const file = join(DIST, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
};

// ---------- pages ----------

const RSS_LINK = `<link rel="alternate" type="application/rss+xml" title="${esc(BLOG_TITLE)}" href="${SITE_URL}/blog/rss.xml" />\n`;

write(
  "blog.html",
  render({
    title: BLOG_SEO_TITLE,
    description: BLOG_DESCRIPTION,
    path: blogPath,
    image: "/og-image.jpg",
    type: "website",
    jsonLd: blogIndexJsonLd(),
    markup: indexMarkup(),
    extraHead: RSS_LINK,
  }),
);

for (const post of POSTS) {
  const cover = builtAsset(post.cover.asset);
  write(
    `blog/${post.slug}.html`,
    render({
      title: post.seoTitle,
      description: post.description,
      path: postPath(post.slug),
      image: cover,
      type: "article",
      jsonLd: blogPostJsonLd(post, `${SITE_URL}${cover}`),
      markup: articleMarkup(post, cover),
      extraHead:
        RSS_LINK +
        `<meta property="article:published_time" content="${post.published}" />\n` +
        `<meta property="article:modified_time" content="${post.updated}" />\n`,
    }),
  );
}

// ---------- sitemap, RSS, llms.txt ----------

const latest = POSTS.map((p) => p.updated).sort().at(-1)!;
const urls = [
  { loc: "/", lastmod: latest, priority: "1.0", changefreq: "weekly" },
  { loc: blogPath, lastmod: latest, priority: "0.8", changefreq: "weekly" },
  ...POSTS.map((p) => ({ loc: postPath(p.slug), lastmod: p.updated, priority: "0.7", changefreq: "monthly" })),
];
write(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `  <url>\n    <loc>${SITE_URL}${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`,
  )
  .join("\n")}
</urlset>
`,
);

const rfc822 = (iso: string) => new Date(`${iso}T09:00:00Z`).toUTCString();
write(
  "blog/rss.xml",
  `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${esc(BLOG_TITLE)}</title>
  <link>${SITE_URL}${blogPath}</link>
  <atom:link href="${SITE_URL}/blog/rss.xml" rel="self" type="application/rss+xml" />
  <description>${esc(BLOG_DESCRIPTION)}</description>
  <language>en</language>
${POSTS.map(
  (p) => `  <item>
    <title>${esc(p.title)}</title>
    <link>${SITE_URL}${postPath(p.slug)}</link>
    <guid>${SITE_URL}${postPath(p.slug)}</guid>
    <pubDate>${rfc822(p.published)}</pubDate>
    <description>${esc(p.description)}</description>
  </item>`,
).join("\n")}
</channel>
</rss>
`,
);

appendFileSync(
  join(DIST, "llms.txt"),
  `\n## Blog\n- [${BLOG_TITLE}](${SITE_URL}${blogPath}): guides on the Pomodoro Technique, desk exercises and better breaks\n${POSTS.map(
    (p) => `- [${p.title}](${SITE_URL}${postPath(p.slug)}): ${p.description}`,
  ).join("\n")}\n`,
);

console.log(`prerender-blog: wrote ${POSTS.length + 1} pages, sitemap.xml, blog/rss.xml`);
