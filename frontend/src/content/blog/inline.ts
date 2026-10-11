/**
 * Tiny inline-markup parser shared by the React blog pages and the build-time
 * prerender script (`scripts/prerender-blog.ts`), so both produce the same
 * text. Supports `**bold**` and `[label](/href)` only. No imports on purpose:
 * Node runs this file directly at build time.
 */

export type InlineSegment =
  | { kind: "text"; text: string }
  | { kind: "bold"; text: string }
  | { kind: "link"; text: string; href: string };

const TOKEN = /\*\*(.+?)\*\*|\[(.+?)\]\((.+?)\)/g;

export function parseInline(source: string): InlineSegment[] {
  const out: InlineSegment[] = [];
  let last = 0;
  for (const m of source.matchAll(TOKEN)) {
    const at = m.index ?? 0;
    if (at > last) out.push({ kind: "text", text: source.slice(last, at) });
    if (m[1] !== undefined) out.push({ kind: "bold", text: m[1] });
    else out.push({ kind: "link", text: m[2], href: m[3] });
    last = at + m[0].length;
  }
  if (last < source.length) out.push({ kind: "text", text: source.slice(last) });
  return out;
}

/** Inline markup stripped to plain text (for meta descriptions, JSON-LD, word counts). */
export function plainText(source: string): string {
  return parseInline(source)
    .map((s) => s.text)
    .join("");
}

/** URL-safe id for a heading, used for in-page anchors and the table of contents. */
export function slugify(text: string): string {
  return plainText(text)
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
