import { useEffect } from "react";
import { SITE_URL } from "@/content/blog/posts";

export interface PageMeta {
  title: string;
  description: string;
  /** Site-relative path, e.g. "/blog/foo"; becomes the canonical and og:url. */
  path: string;
  /** Absolute or site-relative image URL for og:image / twitter:image. */
  image?: string;
  type?: "website" | "article";
  robots?: string;
  jsonLd?: object;
}

/** [selector, attribute] for every head tag a page can override. */
const TAGS = {
  description: ['meta[name="description"]', "content"],
  metaTitle: ['meta[name="title"]', "content"],
  robots: ['meta[name="robots"]', "content"],
  canonical: ['link[rel="canonical"]', "href"],
  ogTitle: ['meta[property="og:title"]', "content"],
  ogDescription: ['meta[property="og:description"]', "content"],
  ogUrl: ['meta[property="og:url"]', "content"],
  ogImage: ['meta[property="og:image"]', "content"],
  ogType: ['meta[property="og:type"]', "content"],
  twTitle: ['meta[name="twitter:title"]', "content"],
  twDescription: ['meta[name="twitter:description"]', "content"],
  twUrl: ['meta[name="twitter:url"]', "content"],
  twImage: ['meta[name="twitter:image"]', "content"],
} as const;

const absolute = (url: string) => (/^https?:\/\//.test(url) ? url : `${SITE_URL}${url}`);

/**
 * Points the existing <head> tags from index.html at this page while it's
 * mounted, and restores them on unmount. Crawlers get the same tags without
 * JS from the prerendered HTML (scripts/prerender-blog.ts); this keeps them
 * correct during client-side navigation.
 */
export function usePageMeta(meta: PageMeta) {
  const { title, description, path, image, type = "website", robots, jsonLd } = meta;
  const jsonLdText = jsonLd ? JSON.stringify(jsonLd) : "";

  useEffect(() => {
    const url = absolute(path);
    const values: Partial<Record<keyof typeof TAGS, string>> = {
      description,
      metaTitle: title,
      canonical: url,
      ogTitle: title,
      ogDescription: description,
      ogUrl: url,
      ogType: type,
      twTitle: title,
      twDescription: description,
      twUrl: url,
      ...(image && { ogImage: absolute(image), twImage: absolute(image) }),
      ...(robots && { robots }),
    };

    const prevTitle = document.title;
    const restore: (() => void)[] = [];
    document.title = title;

    for (const [key, value] of Object.entries(values)) {
      const [selector, attr] = TAGS[key as keyof typeof TAGS];
      const el = document.head.querySelector(selector);
      if (!el || value === undefined) continue;
      const prev = el.getAttribute(attr);
      el.setAttribute(attr, value);
      restore.push(() => (prev === null ? el.removeAttribute(attr) : el.setAttribute(attr, prev)));
    }

    // The prerendered HTML may already carry this page's JSON-LD; replace rather than duplicate.
    document.head.querySelector("#page-jsonld")?.remove();
    if (jsonLdText) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = "page-jsonld";
      script.textContent = jsonLdText;
      document.head.appendChild(script);
      restore.push(() => script.remove());
    }

    return () => {
      document.title = prevTitle;
      restore.forEach((fn) => fn());
    };
  }, [title, description, path, image, type, robots, jsonLdText]);
}
