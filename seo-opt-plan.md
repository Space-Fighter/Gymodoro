# Gymodoro: SEO and AI-Search (GEO) Optimization Plan

Goal: when someone searches **"gymodoro"** on Google, Gemini, ChatGPT, Perplexity or Copilot, they get **our product**
(not "Comodoro"), and Gymodoro starts to show up for the problems people actually search for (desk exercises,
Pomodoro with workouts, stopping doomscrolling).

> Honest expectations: nobody can guarantee a #1 ranking or that an AI assistant will cite us. Ranking for the exact
> brand word "gymodoro" is realistic once the site is indexed (almost nothing else uses that name). Ranking for generic
> searches and being cited by AI takes months of useful content plus mentions on other sites. This plan maximizes the odds.

Legend: **[ME]** = Claude can implement in the repo. **[YOU]** = needs your accounts, decisions or writing.
Status: `[x]` done, `[ ]` to do.

---

## 0. Where we are today

Done (committed locally, **not yet deployed**):

- [x] Title, description, canonical, Open Graph and Twitter tags in `frontend/index.html` (domain fixed to `gymodoro.com`)
- [x] `og-image.jpg` (1200x630) in `frontend/public/`
- [x] JSON-LD structured data: Organization, WebSite, SoftwareApplication
- [x] `robots.txt` (allows search + AI crawlers, links sitemap), `sitemap.xml` (homepage only), `llms.txt`
- [x] Crawlable text inside `#root` of `index.html` for crawlers that do not run JavaScript (React replaces it on load)
- [x] Landing page served at `/` for signed-out visitors (no redirect to `/welcome`)
- [x] `www.gymodoro.com` -> `gymodoro.com` 301 in `deploy/nginx/nginx.conf`

Known gaps:

- The app is a client-rendered single-page app. Google can render it; most AI crawlers cannot, so every public page needs
  server-rendered or pre-rendered HTML (Phase 4).
- nginx falls back to `index.html` for **any** unknown URL, so fake URLs return HTTP 200 ("soft 404"). Needs fixing (Phase 1).
- Nothing is submitted to Google Search Console or Bing yet.
- Only one public page exists (the homepage), so there is nothing to rank except the brand name.
- No third-party mentions of "Gymodoro" yet. AI assistants mostly learn what a product is from other sites.

---

## Phase 1: Foundations (week 1, right after the next deploy)

Do these first; they are quick and unblock everything else.

### 1.1 Deploy and verify the basics
- [ ] **[YOU]** Deploy (`bash deploy/deploy.sh` on the server). Hard refresh; purge Cloudflare cache if the old site persists.
- [ ] **[ME]** After deploy, verify with curl: `https://gymodoro.com/robots.txt`, `/sitemap.xml`, `/llms.txt`, `/og-image.jpg` all return 200 with the right content type, and `https://www.gymodoro.com` 301s to the apex.
- [ ] **[ME]** Check the homepage HTML (view-source) contains the title, description, JSON-LD and the static text block.
- [ ] **[YOU]** Test share previews (LinkedIn Post Inspector, X card preview, WhatsApp) and Google's Rich Results Test / Schema Markup Validator.

### 1.2 Search engine accounts
- [ ] **[YOU]** **Google Search Console**: add `gymodoro.com` as a **Domain property** (verify with a DNS TXT record in Cloudflare). Submit `https://gymodoro.com/sitemap.xml`. Use URL Inspection on `/` then **Request indexing**.
- [ ] **[YOU]** **Bing Webmaster Tools**: import the site from Search Console. Bing powers ChatGPT search, Copilot and DuckDuckGo results, so it matters for AI visibility.
- [ ] **[ME]** Add **IndexNow** (instant URL pinging for Bing and others): a key file in `public/` plus a small script run on deploy.
- [ ] **[YOU]** Add privacy-friendly analytics (Plausible or Umami) or Google Analytics, so we can measure traffic from search and AI referrals.

### 1.3 Cloudflare and server checks
- [ ] **[YOU]** In Cloudflare > Security > Bots, make sure **Bot Fight Mode / "Block AI bots" / AI crawl controls** are not blocking Googlebot, Bingbot, GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot. Blocking them makes us invisible to AI answers.
- [ ] **[YOU]** Confirm Cloudflare SSL mode is Full (strict) and "Always use HTTPS" is on.
- [ ] **[ME]** Fix soft 404s: only real public routes (and the app shell for signed-in routes) return 200; unknown paths return a real **404** page. Add a friendly 404 page with a link home.
- [ ] **[ME]** Add cache headers in nginx: long cache for hashed assets and videos, short for HTML, so repeat visits are fast.
- [ ] **[ME]** Add security/quality headers (HSTS, `X-Content-Type-Options`, `Referrer-Policy`). Not a ranking factor on its own, but part of a trustworthy site.

### 1.4 Performance (Core Web Vitals)
Speed affects ranking and conversion. The welcome page is video-heavy.
- [x] Hero and background videos re-encoded (114 MB -> 30 MB).
- [ ] **[ME]** Poster images for videos; load below-the-fold videos only near the viewport; second background clip loads late.
- [ ] **[ME]** `width`/`height` on images (avoid layout shift), `loading="lazy"` below the fold, preload the one hero image.
- [ ] **[ME]** Serve a smaller video for phones. Measure with Lighthouse / PageSpeed Insights; targets: LCP < 2.5 s, CLS < 0.1, INP < 200 ms on mobile.

---

## Phase 2: Brand identity (weeks 1-3): "Gymodoro, not Comodoro"

Search and AI systems decide what "Gymodoro" is from consistent signals across the web.

### 2.1 One canonical description (use everywhere)
> **Gymodoro is a free Pomodoro focus timer that turns every break into a workout. Work in 25-minute blocks, then do a guided 5-minute exercise with a demo video instead of scrolling your phone. gymodoro.com**

- [ ] **[YOU]** Approve or edit this sentence; it becomes the bio on every profile, the first line of every launch post and the `description` everywhere.
- Also keep a 10-word version: *"Pomodoro timer with built-in workouts for your breaks."*

### 2.2 Profiles (same name, logo, description, link)
Create or claim, then link them from the site footer and from our JSON-LD `sameAs`:
- [ ] **[YOU]** LinkedIn company page, X/Twitter, YouTube channel, Instagram (optional), GitHub org or repo README linking to gymodoro.com
- [ ] **[YOU]** Product Hunt page, AlternativeTo, SaaSHub, Slant, Toolify-style directories (pick reputable ones; skip spammy link farms)
- [ ] **[ME]** Once the URLs exist: add `sameAs` to the Organization JSON-LD and a footer social-links block.

### 2.3 Disambiguation
- [x] `llms.txt` states Gymodoro is unrelated to Comodoro.
- [ ] **[ME]** Add a short "About Gymodoro" page (`/about`) with: what it is, who made it, why, and the canonical description. Include the brand spelled exactly as "Gymodoro" and the tagline.
- [ ] **[YOU]** Always write "Gymodoro" (never "GymoDoro", "Gymadoro") in posts and profiles. Consistency is how entities get recognized.
- Later, once there is press coverage: consider a **Wikidata** entry (needs notable third-party sources; do not create it prematurely, it gets deleted).

---

## Phase 3: Content strategy (weeks 2-12)

### 3.1 Principles
- Pages must **help the visitor on their own** and be visible to everyone. No hidden text, no cloaking, no redirects that send users somewhere different from what Google saw.
- Answer first: the first paragraph answers the query in 2-3 sentences (AI assistants quote this).
- Original value: our exercise library, videos, muscle diagrams and the Pomodoro-plus-movement angle. No thin, duplicate or mass-generated filler.
- Health claims stay modest and sourced (WHO, peer-reviewed studies). Add "not medical advice".
- Every page ends with a relevant call to action to try Gymodoro.

### 3.2 Keyword clusters and pages
Validate volumes with Search Console / a keyword tool before writing; these are the starting hypotheses.

| Cluster | Example searches | Page (proposed URL) | Type |
|---|---|---|---|
| Brand | gymodoro, gymodoro app, what is gymodoro | `/` and `/about` | Home, about |
| Pomodoro + exercise | pomodoro workout, pomodoro timer with exercise, pomodoro technique exercise breaks | `/pomodoro-workout-timer` | Pillar |
| Desk exercises | desk exercises, 5 minute office workout, exercises to do at your desk | `/desk-exercises` | Pillar guide |
| Break ideas | what to do on a work break, active break ideas, break ideas that are not your phone | `/active-break-ideas` | List guide |
| Doomscrolling | how to stop doomscrolling, stop scrolling during work, phone addiction at work | `/how-to-stop-doomscrolling-at-work` | Guide |
| Habits | atomic habits for productivity, build an exercise habit at your desk | `/build-an-exercise-habit-at-work` | Guide |
| Sedentary risk | sitting too long, how often to move when working | `/how-often-should-you-move-when-working` | Guide (cite WHO etc.) |
| Comparison | pomodoro timer apps, best pomodoro apps with exercise | `/pomodoro-apps-compared` | Comparison (honest) |
| Exercises | "archers exercise", "air bike crunches", etc. | `/exercises/<slug>` x ~160 | Programmatic |
| Muscle groups / goals | core exercises at a desk, beginner no-equipment exercises | `/exercises/core`, `/exercises/beginner` | Hub pages |

Suggested **first batch (5-8 pages)**: `/pomodoro-workout-timer`, `/desk-exercises`, `/active-break-ideas`,
`/how-to-stop-doomscrolling-at-work`, `/about`, plus the exercise hub and ~10 flagship exercise pages. Expand after
Search Console shows what Google starts to associate with us.

### 3.3 Page template (each guide)
1. `<title>` (<= 60 chars) and meta description (<= 155 chars) written for humans, with the main keyword.
2. One `<h1>`, then a 2-3 sentence direct answer.
3. Table of contents for long pages; descriptive `<h2>`/`<h3>` headings phrased like the questions people ask.
4. Real content: steps, photos/videos from our library, muscle diagrams, "how long", "who it's for".
5. A visible **FAQ** section (3-6 real questions). Mark it up with `FAQPage` JSON-LD only if it is visible on the page.
6. Author/maintainer and "last updated" date; sources linked for any factual claim.
7. Internal links to 3+ related pages and one clear CTA ("Start your first cycle, free").
8. Open Graph image (can reuse the template in `og-image.jpg`, per-page headline).
9. `BreadcrumbList` JSON-LD; `Article` (or `HowTo` content, no rich-result promise) JSON-LD as appropriate; `VideoObject` where we embed a demo.

### 3.4 Programmatic exercise pages (161 exercises)
We already have structured data (name, description, difficulty, muscle groups, equipment, video, muscle diagram).
- Generate `/exercises/<slug>` from `backend/prisma/exercise-seed-data.json` at build time.
- **Avoid thin content**: each page needs more than the DB description. Add: when to do it during a break, regressions/progressions, common mistakes, duration (e.g. "30-45 seconds"), muscles worked, and links to 3-4 related exercises. Start with the best 20-30 and add as quality allows; do not publish 161 near-identical stubs.
- Each page gets `Exercise`-style content, `VideoObject`, breadcrumbs, and a CTA ("Get this in your next break").
- Hub pages by body area, difficulty and equipment link to the exercise pages (good internal linking).
- Credit sources properly (the data came from Darebee/wger importers: check their licenses and attribution requirements before publishing derived content). **[YOU]** confirm licensing.

### 3.5 Content for AI answers (GEO-friendly writing)
- State facts plainly and early ("The default Gymodoro cycle is 25 minutes of focus, a 5-minute active break, and a 15-minute long break after four rounds.").
- Keep a **facts page** (`/about` or `/facts`) with product facts: price, platform, cycle lengths, number of exercises, features. AI systems extract these.
- Use comparison tables and short lists; they are easy to quote.
- Cite sources for statistics (WHO 150 min/week; Lally et al. 66 days; Gloria Mark 23 minutes; Oppezzo and Schwartz walking study). Verify each against the original before publishing.

---

## Phase 4: Technical implementation (weeks 3-6)

### 4.1 Rendering strategy (the key decision)
Public pages must ship real HTML. Options:

| Option | What it is | Effort | Verdict |
|---|---|---|---|
| A. **Build-time prerender** of public routes (React `renderToString` via Vite SSR build, or a small prerender script) | Keep the Vite/React app; generate static `.html` for `/`, `/about`, guides and exercise pages; app routes stay client-side | Medium | **Recommended** |
| B. Separate static site (Astro or Eleventy) for `/guides`, `/exercises`, served by the same nginx; the React app keeps `/app` | Best for content-heavy SEO; two codebases | Medium-High | Good if content grows large |
| C. Migrate to Next.js / Remix | Full SSR | High | Overkill for now |

Recommendation: **A**, with content authored as Markdown/MDX or JSON in the repo and rendered through shared React
components so the pages match the site design.

Tasks:
- [ ] **[ME]** Add a prerender build step (public routes only) that outputs `dist/<route>/index.html` with real content, title, description, canonical, OG tags and JSON-LD per page.
- [ ] **[ME]** Per-page head management (build-time injection; use `react-helmet-async` on the client for navigation).
- [ ] **[ME]** Generate `sitemap.xml` automatically from the route list (with `lastmod`) during build; ping IndexNow on deploy.
- [ ] **[ME]** nginx: serve prerendered pages as static files; SPA fallback only for app routes (`/signin`, `/signup`, the timer); real 404 for everything else.
- [ ] **[ME]** Make sure signed-in users still get the app at `/` (the landing page is shown only when signed out, as today). Decide whether the Timer should move to `/app` so `/` is always the landing page (cleaner for SEO; needs a redirect for existing users and updated links).
- [ ] **[ME]** Internal linking: header "Guides" link and footer link columns so every page is reachable in 2-3 clicks from the homepage.
- [ ] **[ME]** Accessibility and semantic HTML on public pages (one `<h1>`, landmarks, alt text). Also helps AI agents parse pages.

### 4.2 Structured data
- Homepage: Organization, WebSite, SoftwareApplication (done). Add `sameAs` after Phase 2.
- Guides: `Article` + `BreadcrumbList`; visible FAQ -> `FAQPage`.
- Exercise pages: `VideoObject` + breadcrumbs.
- Note: Google now shows FAQ/HowTo rich results only in limited cases, so the value of this markup is mostly **helping machines understand the page**, not extra search-result decoration. Keep it accurate and matched to visible content.
- Validate every template with the Rich Results Test and Schema Markup Validator.

### 4.3 Public data for agents (optional, later)
- [ ] **[ME]** `llms-full.txt` (longer product and FAQ text) alongside `llms.txt`; update both whenever features change.
- [ ] **[ME]** Consider a documented, read-only public JSON of exercises (we already have `GET /api/exercises`). Only if we are comfortable with others reusing the data; check source licenses first.
- [ ] Keep read pages free of login walls, CAPTCHAs and heavy bot-blocking so agents can fetch them.

---

## Phase 5: Off-site presence and mentions (start week 2, ongoing)

Search engines and AI assistants trust what **other sites** say about us. Sequence matters: launch after the landing pages exist.

| Channel | What to post | Notes |
|---|---|---|
| Product Hunt | Launch with the canonical description, demo video, screenshots | Pick a Tue-Thu; line up a few real supporters first |
| Hacker News | "Show HN: Gymodoro, a Pomodoro timer that makes your breaks a workout" | Honest, technical, be present for comments |
| Reddit | r/productivity, r/pomodoro, r/getdisciplined, r/Fitness (check each sub's self-promo rules) | Share the story/lessons, not a bare link |
| Dev/maker blogs | dev.to / Hashnode / Medium: "Why I built Gymodoro", "Building a liquid-glass UI in React" | Link to gymodoro.com; use the exact brand spelling |
| YouTube | 60-90 s demo + a screen recording of a full cycle; description with link | Video results also show in Google |
| Directories | AlternativeTo, SaaSHub, StartupStash and similar | Reputable ones only |
| Newsletters / roundups | Pomodoro, productivity and indie-maker newsletters | Personal outreach, short, useful |
| Communities | Study and remote-work communities, university groups | Offer something useful, not spam |

Rules: no paid link schemes, no fake reviews, no comment spam. Earned mentions only.

---

## Phase 6: AI-search (GEO) and agent-readiness checklist

How AI search works in practice: assistants like Gemini, ChatGPT search, Perplexity and Copilot retrieve pages from a
search index (Google or Bing) and then summarize. So **ranking and being indexed come first**, then **clear,
quotable, well-sourced content**, then **mentions on other sites**.

- [ ] Indexed in Google **and** Bing (Phase 1.2).
- [ ] Crawlers allowed (robots.txt done; confirm Cloudflare does not block them).
- [ ] Content is in the HTML (prerender, Phase 4), not only built by JavaScript.
- [ ] Answer-first paragraphs and a facts page (Phase 3.5).
- [ ] Consistent brand description and `sameAs` links (Phase 2).
- [ ] `llms.txt` and `llms-full.txt` kept current.
- [ ] Third-party mentions growing (Phase 5).
- [ ] Fast pages and stable URLs (agents time out on slow pages).
- [ ] No important content behind sign-in.

**AI visibility test set**: re-run monthly and log answers in a sheet (model, date, did it name Gymodoro, was it correct, which sources it cited).
1. What is Gymodoro?
2. Gymodoro app review
3. Is there a Pomodoro timer with built-in exercises?
4. Best Pomodoro apps that include workouts
5. What are good exercises to do at your desk in 5 minutes?
6. How do I stop doomscrolling when I work?
7. Apps that make you exercise during work breaks
8. Gymodoro vs Forest / other focus timers
9. Is Gymodoro free?
10. What is the Pomodoro technique with active breaks?

Run each in Google (with AI Overviews/AI Mode), Gemini, ChatGPT (search on), Perplexity and Copilot.

---

## Phase 7: Measurement

| Metric | Tool | Target (rough, adjust once we have data) |
|---|---|---|
| Pages indexed | Search Console > Pages | Homepage within 1-2 weeks; all published pages within a month |
| Brand query "gymodoro" position | Search Console > Performance | #1 within weeks of indexing |
| Impressions / clicks for non-brand queries | Search Console | Growing month over month once guides are live |
| Core Web Vitals | Search Console + PageSpeed | "Good" on mobile |
| Organic sign-ups | Analytics + backend (`User` created from organic landing) | Track conversion rate per landing page |
| AI referrals | Analytics referrers (chatgpt.com, perplexity.ai, gemini.google.com, copilot.microsoft.com) | Non-zero, growing |
| AI answer accuracy | Prompt test set above | Gymodoro named and described correctly |
| Backlinks / mentions | Search Console > Links, Bing Webmaster | Steady growth from real sites |

Cadence: weekly glance at Search Console in the first month; monthly review and prompt test; quarterly content plan.

---

## Phase 8: Suggested timeline

| Week | Focus | Deliverables |
|---|---|---|
| 1 | Deploy + foundations | Deploy; Search Console + Bing; analytics; Cloudflare bot settings; soft-404 fix; verify files |
| 2 | Brand + profiles | Canonical description; LinkedIn/X/YouTube/GitHub/Product Hunt pages; `/about`; `sameAs` |
| 3-4 | Prerender + first guides | Build-time prerender; 4-5 guide pages live; auto sitemap; IndexNow |
| 5-6 | Exercise pages | Template + first 20-30 quality exercise pages + hubs; video schema; internal linking |
| 7-8 | Launch | Product Hunt, Show HN, Reddit posts, YouTube demo, directory listings |
| 9-12 | Iterate | Read Search Console; double down on pages gaining impressions; comparison page; more exercise pages; monthly AI test |

---

## Guardrails (things to avoid)

- **Cloaking / sneaky redirects:** users and crawlers must see the same content at the same URL.
- **Thin or duplicate pages:** do not auto-publish 161 near-identical exercise stubs; do not copy competitor text.
- **Keyword stuffing and fake reviews/links:** penalty risk and AI systems discount them.
- **Unsourced health or statistic claims:** verify and cite; include a "not medical advice" note.
- **Licensing:** confirm the exercise data/video/image licenses before republishing them as pages (Darebee, wger, Pexels credits).
- **Changing URLs:** once a page is indexed, keep the URL; if it must move, add a 301.

---

## Decisions needed from you

1. Approve the canonical description (Phase 2.1).
2. Which social/profile accounts you are willing to create, and who owns them.
3. Whether the Timer should move to `/app` so `/` is always the landing page (recommended for SEO).
4. Analytics tool (Plausible/Umami/GA).
5. Who writes or reviews guide content (I can draft; you should review for voice and accuracy).
6. License check on exercise content (Phase 3.4).
7. Whether to have a blog/"Guides" section in the main navigation.

---

## Appendix A: Files that exist today

- `frontend/index.html`: meta tags, JSON-LD, crawlable static text
- `frontend/public/robots.txt`, `sitemap.xml`, `llms.txt`, `og-image.jpg`
- `frontend/src/App.tsx`, `components/ProtectedRoute.tsx`: landing page at `/` for signed-out visitors
- `deploy/nginx/nginx.conf`: www -> apex redirect, SPA fallback (to be tightened)

## Appendix B: Per-page publishing checklist

- [ ] Unique `<title>` and meta description; one `<h1>`; canonical URL
- [ ] Answer in the first paragraph; headings match real questions
- [ ] Original value (our video, diagram, data, or a clear explanation)
- [ ] Facts sourced and linked; "last updated" date
- [ ] Internal links in and out; breadcrumb
- [ ] Open Graph image; JSON-LD validated
- [ ] Alt text on all images; page weight small; passes mobile PageSpeed
- [ ] Added to sitemap; submitted to Search Console (Request indexing) and IndexNow
- [ ] CTA to try Gymodoro
