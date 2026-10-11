import { Link, useParams } from "react-router-dom";
import BlogShell, { Kicker } from "@/components/blog/BlogShell";
import PostCard from "@/components/blog/PostCard";
import { Blocks, Inline } from "@/components/blog/RichText";
import { assetUrl } from "@/components/welcome/assets";
import { slugify } from "@/content/blog/inline";
import { formatDate, getPost, readingMinutes, SITE_URL, type BlogPost as Post } from "@/content/blog/posts";
import { blogPath, blogPostJsonLd, postPath } from "@/content/blog/seo";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function BlogPost() {
  const { slug = "" } = useParams();
  const post = getPost(slug);
  return post ? <Article key={post.slug} post={post} /> : <NotFound slug={slug} />;
}

function Article({ post }: { post: Post }) {
  const cover = assetUrl(post.cover.asset) ?? "/og-image.jpg";
  usePageMeta({
    title: post.seoTitle,
    description: post.description,
    path: postPath(post.slug),
    image: cover,
    type: "article",
    jsonLd: blogPostJsonLd(post, `${SITE_URL}${cover}`),
  });

  const toc = post.body.filter((b) => b.type === "h2");
  const related = post.related.map(getPost).filter((p): p is Post => !!p);

  return (
    <BlogShell>
      <article className="mx-auto flex max-w-3xl flex-col gap-8">
        <header className="flex flex-col gap-4">
          <nav aria-label="Breadcrumb" className="text-[13px] tracking-wide text-white/60">
            <Link to="/" className="hover:text-white">Home</Link>
            <span className="px-2">/</span>
            <Link to={blogPath} className="hover:text-white">Blog</Link>
          </nav>
          <Kicker>{post.kicker}</Kicker>
          <h1 className="m-0 font-heading text-[clamp(32px,5vw,56px)] leading-[1.02] font-extrabold tracking-[-0.03em] text-white [text-shadow:0_2px_24px_rgba(0,0,0,.5)]">
            {post.title}
          </h1>
          <p className="m-0 text-[19px] leading-[1.55] text-white/80">{post.description}</p>
          <div className="text-[14px] tracking-wide text-white/60">
            By the Gymodoro team · <time dateTime={post.published}>{formatDate(post.published)}</time> ·{" "}
            {readingMinutes(post)} min read
          </div>
        </header>

        <img
          src={cover}
          alt={post.cover.alt}
          className="aspect-[16/9] w-full rounded-[26px] border border-white/10 object-cover shadow-2xl"
        />

        {/* Not `.glass`: its unlayered `background` would override the dark backing long-form text needs.
            Same rim/highlight look, darker tint, light blur (a big blurred panel is costly to paint). */}
        <div className="flex flex-col gap-8 rounded-[26px] border border-white/10 bg-[#0b0d12]/80 p-[clamp(20px,4vw,44px)] shadow-[0_20px_50px_rgba(0,0,0,0.45),inset_0_1px_1px_rgba(255,255,255,0.25),inset_0_0_0_1px_rgba(255,255,255,0.08)] backdrop-blur-sm">
          <section aria-labelledby="takeaways" className="rounded-2xl border border-[#4be277]/30 bg-[#4be277]/10 p-5">
            <h2 id="takeaways" className="m-0 mb-3 font-mono text-[12px] tracking-[0.2em] text-[#4be277] uppercase">
              Key takeaways
            </h2>
            <ul className="m-0 flex list-disc flex-col gap-2 pl-5 text-[17px] leading-[1.55] text-white marker:text-[#4be277]">
              {post.takeaways.map((t) => (
                <li key={t}><Inline text={t} /></li>
              ))}
            </ul>
          </section>

          {toc.length > 2 && (
            <nav aria-label="Contents" className="flex flex-col gap-2">
              <div className="font-mono text-[11px] tracking-[0.2em] text-white/50 uppercase">In this article</div>
              <ol className="m-0 flex list-decimal flex-col gap-1 pl-5 text-[15px] text-white/75 marker:text-white/40">
                {toc.map((h) => (
                  <li key={h.text}>
                    <a href={`#${slugify(h.text)}`} className="hover:text-[#4be277]">{h.text}</a>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          <Blocks blocks={post.body} />

          <section aria-labelledby="faq" className="flex flex-col gap-3 border-t border-white/10 pt-8">
            <h2 id="faq" className="m-0 font-heading text-[clamp(24px,3vw,32px)] font-extrabold tracking-[-0.02em] text-white">
              Frequently asked questions
            </h2>
            {post.faq.map((f) => (
              <details key={f.q} className="group rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 open:bg-white/[0.07]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-heading text-[18px] font-bold text-white">
                  {f.q}
                  <span className="text-[#4be277] transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="m-0 mt-3 text-[17px] leading-[1.6] text-white/80"><Inline text={f.a} /></p>
              </details>
            ))}
          </section>
        </div>

        <aside className="glass flex flex-col items-center gap-4 rounded-[26px] border border-white/10 p-8 text-center">
          <h2 className="m-0 font-heading text-[clamp(26px,3.6vw,40px)] leading-[1] font-extrabold tracking-[-0.03em] text-white uppercase">
            Turn your next break into a workout
          </h2>
          <p className="m-0 max-w-[46ch] text-[17px] leading-[1.55] text-white/80">
            Gymodoro is a free Pomodoro timer that hands you a guided exercise every time the focus timer rings.
          </p>
          <Link
            to="/signup"
            className="rounded-full bg-white px-8 py-3.5 text-[17px] font-bold text-slate-900 shadow-xl transition hover:-translate-y-0.5"
          >
            Start your first cycle
          </Link>
        </aside>
      </article>

      {related.length > 0 && (
        <section aria-labelledby="related" className="mx-auto mt-16 flex max-w-7xl flex-col gap-6">
          <Kicker>keep reading</Kicker>
          <h2 id="related" className="m-0 font-heading text-[clamp(24px,3.4vw,42px)] leading-[0.95] font-extrabold tracking-[-0.03em] text-white uppercase">
            More from the journal
          </h2>
          <div className="grid gap-[clamp(16px,2vw,28px)] sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <PostCard key={p.slug} post={p} headingLevel="h3" />
            ))}
          </div>
        </section>
      )}
    </BlogShell>
  );
}

function NotFound({ slug }: { slug: string }) {
  usePageMeta({
    title: "Article not found | Gymodoro",
    description: "This article doesn't exist. Browse the Gymodoro blog for Pomodoro and desk exercise guides.",
    path: postPath(slug),
    robots: "noindex, follow",
  });
  return (
    <BlogShell>
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 py-20 text-center">
        <Kicker>404</Kicker>
        <h1 className="m-0 font-heading text-[clamp(32px,5vw,56px)] font-extrabold tracking-[-0.03em] text-white uppercase">
          Article not found
        </h1>
        <Link to={blogPath} className="rounded-full bg-white px-7 py-3 font-bold text-slate-900">
          Browse all articles
        </Link>
      </div>
    </BlogShell>
  );
}
