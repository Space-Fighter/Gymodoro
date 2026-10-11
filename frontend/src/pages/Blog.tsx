import BlogShell, { Kicker } from "@/components/blog/BlogShell";
import PostCard from "@/components/blog/PostCard";
import ClosingCta from "@/components/welcome/cards/ClosingCta";
import { BLOG_DESCRIPTION, BLOG_SEO_TITLE, POSTS } from "@/content/blog/posts";
import { blogIndexJsonLd, blogPath } from "@/content/blog/seo";
import { usePageMeta } from "@/hooks/usePageMeta";

const JSON_LD = blogIndexJsonLd();

export default function Blog() {
  usePageMeta({
    title: BLOG_SEO_TITLE,
    description: BLOG_DESCRIPTION,
    path: blogPath,
    image: "/og-image.jpg",
    jsonLd: JSON_LD,
  });

  return (
    <BlogShell>
      <div className="mx-auto flex max-w-7xl flex-col gap-10">
        <header className="flex flex-col gap-4">
          <Kicker>the gymodoro journal</Kicker>
          <h1 className="m-0 font-heading text-[clamp(40px,7vw,88px)] leading-[0.92] font-extrabold tracking-[-0.03em] text-white uppercase [text-shadow:0_2px_24px_rgba(0,0,0,.5)]">
            Focus better.<br />Move more.
          </h1>
          <p className="m-0 max-w-[58ch] text-[18px] leading-[1.55] text-white/80">
            Research-backed guides on the Pomodoro Technique, desk exercises and taking breaks that actually
            recharge you.
          </p>
        </header>

        <div className="grid gap-[clamp(16px,2vw,28px)] sm:grid-cols-2 lg:grid-cols-3">
          {POSTS.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </div>
      <ClosingCta />
    </BlogShell>
  );
}
