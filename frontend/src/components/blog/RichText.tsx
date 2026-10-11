import { Link } from "react-router-dom";
import { parseInline, slugify } from "@/content/blog/inline";
import type { Block } from "@/content/blog/posts";

/** `**bold**` and `[label](href)` → React nodes. Internal links use the router. */
export function Inline({ text }: { text: string }) {
  return (
    <>
      {parseInline(text).map((s, i) => {
        if (s.kind === "bold") return <strong key={i} className="font-semibold text-white">{s.text}</strong>;
        if (s.kind === "link") {
          const cls = "font-medium text-[#4be277] underline decoration-[#4be277]/40 underline-offset-4 transition-colors hover:decoration-[#4be277]";
          return s.href.startsWith("/") ? (
            <Link key={i} to={s.href} className={cls}>{s.text}</Link>
          ) : (
            <a key={i} href={s.href} className={cls} target="_blank" rel="noopener noreferrer">{s.text}</a>
          );
        }
        return <span key={i}>{s.text}</span>;
      })}
    </>
  );
}

/** Article body. Typography mirrors the welcome page's fact cards, sized for long reading. */
export function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="flex flex-col gap-5 text-[18px] leading-[1.7] text-white/85 max-md:text-[17px]">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "h2":
            return (
              <h2 key={i} id={slugify(b.text)} className="mt-6 mb-0 scroll-mt-24 font-heading text-[clamp(24px,3vw,32px)] leading-[1.12] font-extrabold tracking-[-0.02em] text-white">
                <Inline text={b.text} />
              </h2>
            );
          case "h3":
            return (
              <h3 key={i} className="mt-2 mb-0 font-heading text-[21px] leading-[1.25] font-bold text-white">
                <Inline text={b.text} />
              </h3>
            );
          case "p":
            return <p key={i} className="m-0"><Inline text={b.text} /></p>;
          case "ul":
          case "ol": {
            const List = b.type === "ul" ? "ul" : "ol";
            return (
              <List key={i} className={`m-0 flex flex-col gap-2.5 pl-6 marker:font-semibold marker:text-[#4be277] ${b.type === "ul" ? "list-disc" : "list-decimal"}`}>
                {b.items.map((item, j) => (
                  <li key={j} className="pl-1.5"><Inline text={item} /></li>
                ))}
              </List>
            );
          }
          case "callout":
            return (
              <aside key={i} className="rounded-2xl border border-[#4be277]/30 bg-[#4be277]/10 p-4 text-white">
                <b className="text-[#4be277]">{b.title}: </b>
                <Inline text={b.text} />
              </aside>
            );
        }
      })}
    </div>
  );
}
