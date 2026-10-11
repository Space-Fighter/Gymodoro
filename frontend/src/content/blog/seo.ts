/**
 * Schema.org JSON-LD for the blog, shared by the React pages (`usePageMeta`)
 * and the build-time prerender so the static HTML and the live page agree.
 * Imports use explicit `.ts` extensions because Node also runs this directly.
 */
import { BLOG_DESCRIPTION, BLOG_TITLE, POSTS, SITE_URL, type BlogPost } from "./posts.ts";
import { plainText } from "./inline.ts";

const ORG = { "@id": `${SITE_URL}/#organization` };

export const blogPath = "/blog";
export const postPath = (slug: string) => `/blog/${slug}`;

export function blogIndexJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Blog",
        "@id": `${SITE_URL}${blogPath}#blog`,
        url: `${SITE_URL}${blogPath}`,
        name: BLOG_TITLE,
        description: BLOG_DESCRIPTION,
        inLanguage: "en",
        publisher: ORG,
        blogPost: POSTS.map((p) => ({
          "@type": "BlogPosting",
          headline: p.title,
          url: `${SITE_URL}${postPath(p.slug)}`,
          datePublished: p.published,
          dateModified: p.updated,
        })),
      },
      breadcrumbs([{ name: "Blog", path: blogPath }]),
    ],
  };
}

/** `imageUrl` must be absolute (the built, hashed cover image). */
export function blogPostJsonLd(post: BlogPost, imageUrl: string) {
  const url = `${SITE_URL}${postPath(post.slug)}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${url}#article`,
        mainEntityOfPage: url,
        url,
        headline: post.title,
        description: post.description,
        image: imageUrl,
        datePublished: post.published,
        dateModified: post.updated,
        inLanguage: "en",
        keywords: post.keywords.join(", "),
        author: { "@type": "Organization", name: "Gymodoro", url: `${SITE_URL}/` },
        publisher: ORG,
        isPartOf: { "@id": `${SITE_URL}${blogPath}#blog` },
      },
      breadcrumbs([
        { name: "Blog", path: blogPath },
        { name: post.title, path: postPath(post.slug) },
      ]),
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: post.faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: plainText(f.a) },
        })),
      },
    ],
  };
}

function breadcrumbs(trail: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "/" }, ...trail].map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${SITE_URL}${c.path}`,
    })),
  };
}
