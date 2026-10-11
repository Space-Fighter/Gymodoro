import { Link } from "react-router-dom";
import GlassArticle from "@/components/welcome/cards/GlassArticle";
import { assetUrl } from "@/components/welcome/assets";
import { formatDate, readingMinutes, type BlogPost } from "@/content/blog/posts";
import { postPath } from "@/content/blog/seo";

/** Blog post teaser: same glass card + photo-with-overlay treatment as the welcome page's fact cards. */
export default function PostCard({ post, headingLevel = "h2" }: { post: BlogPost; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  return (
    <GlassArticle className="group relative !gap-3 !p-3.5 transition-transform duration-300 hover:-translate-y-1">
      <div className="relative h-[190px] flex-none overflow-hidden rounded-[18px] bg-[#141824]">
        <img
          src={assetUrl(post.cover.asset)}
          alt={post.cover.alt}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-3.5 pt-10 pb-2.5">
          <div className="font-mono text-[11px] tracking-[0.2em] text-[#4be277] uppercase">{post.kicker}</div>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2.5 px-1.5 pb-1.5">
        <Heading className="m-0 font-heading text-[22px] leading-[1.15] font-bold text-white">
          {/* Stretched link: the whole card is clickable, but only the title is the link text. */}
          <Link to={postPath(post.slug)} className="after:absolute after:inset-0 after:content-['']">
            {post.title}
          </Link>
        </Heading>
        <p className="m-0 text-[16px] leading-[1.5] text-white/75">{post.description}</p>
        <div className="mt-auto pt-1 text-[13px] tracking-wide text-white/55">
          <time dateTime={post.published}>{formatDate(post.published)}</time> · {readingMinutes(post)} min read
        </div>
      </div>
    </GlassArticle>
  );
}
