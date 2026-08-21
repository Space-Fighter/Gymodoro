import { extractYoutubeVideoId } from "@/lib/youtube";

interface Props {
  videoUrl?: string;
}

export default function VideoDemo({ videoUrl }: Props) {
  const videoId = videoUrl ? extractYoutubeVideoId(videoUrl) : null;

  return (
    <section className="py-20 md:py-28">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
            SEE IT IN ACTION
          </span>
          <h2 className="font-heading font-extrabold text-3xl sm:text-5xl tracking-tight leading-tight mt-2 text-foreground">
            Watch Gymodoro in a real session.
          </h2>
        </div>

        <div className="rounded-3xl overflow-hidden border border-border/60 bg-background/70 backdrop-blur-xl shadow-2xl aspect-video">
          {videoId ? (
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0`}
              title="Gymodoro demo"
              allow="encrypted-media"
              allowFullScreen
              className="w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <span className="w-16 h-16 rounded-full border-2 border-current flex items-center justify-center text-2xl">
                ▶
              </span>
              <p className="text-sm font-semibold">Demo video coming soon</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
