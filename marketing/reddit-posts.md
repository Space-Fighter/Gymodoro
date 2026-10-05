# Gymodoro: Reddit post drafts

Attach `gymodoro-demo.gif` to every post (upload it natively to Reddit rather than linking, since native media gets more reach).
Replace `[LINK]` with your live URL. Post at most 1–2 per day, spread across different subreddits, and reply to every comment in the first 2 hours.

**Before posting:** read each subreddit's self-promotion rules. Many require a 9:1 participation ratio, a specific flair, or a "Show-off Saturday" thread. Comment helpfully in a sub for a few days first.

---

## 1. r/SideProject — build story

**Title:** I built a Pomodoro timer that makes you do a quick workout on every break

**Body:**
I sit at a desk for about 10 hours a day, and every Pomodoro break I ended up on my phone instead of moving. So I built Gymodoro.

How it works:
- Run a normal focus session (25/5/15 by default)
- When the break starts, the app picks a random exercise (or you choose one) with a form video, tags for difficulty/muscle group, and a description
- Stats show sessions, focus time, and an estimated calories burned from the breaks

Stack: React 19 + Vite + Tailwind on the front end, Express + Prisma + Postgres on the back end, with a catalog of 160+ exercises scraped and curated from open sources.

It's free to try at [LINK]. I'd love to hear what's missing. Honest feedback is more useful to me than upvotes.

---

## 2. r/productivity — problem-first

**Title:** Pomodoro breaks are supposed to restore focus, but I spent mine scrolling. Here's what changed it.

**Body:**
Short breaks only work if you step away from the screen. For me they turned into 5 minutes of Reddit, which left me more drained than before.

What worked was making the break *specific*: one exercise, 5 minutes, no decisions. Standing, moving, and blood flow do more for focus than another feed.

I made a small tool to automate this (a Pomodoro timer that assigns an exercise each break), but the principle works with any timer: **decide the break activity before the break starts**, and make it physical.

Curious what others do on breaks. What actually leaves you refreshed rather than drained?

(Tool, if anyone wants it: [LINK], free. Not required for the advice above.)

---

## 3. r/getdisciplined — habit angle

**Title:** Attaching exercise to an existing habit (Pomodoro) is the only way I've stuck with working out at a desk job

**Body:**
Habit stacking worked for me: I already do focus sessions, so I attached a workout to the *end* of each one. 5 minutes, one exercise, every break. Over a week that's 8–10 short sessions without ever having to "find time to work out".

The key was removing the decision. I don't pick what to do, the timer does.

I turned this into an app, Gymodoro ([LINK]), but the structure is the point: trigger (focus ends) → action (random exercise) → done in 5 minutes.

Anyone else using habit stacking for fitness? What's your trigger?

---

## 4. r/homeworkouts — exercise angle

**Title:** Free tool that gives you a random bodyweight exercise (with form video) every time your work break starts

**Body:**
If you work from home and want movement without a gym routine, I built a Pomodoro timer that pairs each break with a bodyweight exercise.

- Filter by difficulty and body area
- Each exercise has a form video, muscle diagram, and tags
- "Roll the dice" for a surprise or pick your own
- Tracks sessions and estimated calories

[LINK] — free. Which exercises would you add to the catalog? I'm especially short on good mobility and stretching moves.

---

## 5. r/pomodoro — community-native

**Title:** Pomodoro timer with exercise breaks. Would this help your routine?

**Body:**
I've used Pomodoro for years, but my 5-minute breaks always got eaten by my phone. I built a timer that assigns a short exercise during each break, with a video for form.

Focus/short/long modes work as usual, and sessions are saved so you can see your history and a weekly focus score.

[LINK]. If you try it, what would make you use it daily instead of your current timer?

---

## 6. r/webdev — technical (Showoff Saturday)

**Title:** [Showoff Saturday] Gymodoro: Pomodoro timer + exercise catalog, React 19 / Express 5 / Prisma 7

**Body:**
Built a Pomodoro app where every break gets a guided exercise. Some implementation notes that might be interesting:

- **Auth:** 15-minute access JWT held in memory only, 7-day rotating refresh token in an httpOnly cookie, hashed at rest, with reuse detection that revokes all of a user's tokens
- **Session tracking:** the timer persists phase changes to the API as fire-and-forget calls so the countdown never blocks on the network
- **Catalog pipeline:** scrapers for two open exercise sources feed one JSON snapshot that seeds Postgres idempotently, plus a yt-dlp pass for instructional videos
- **UI:** shadcn/ui, Tailwind v4, liquid-glass panels

Live: [LINK]. Happy to go into detail on any of these. Roast the UX too.

---

## 7. r/programming-adjacent: r/cscareerquestions or r/ExperiencedDevs — only if the rules allow

**Title:** Developers sit all day. What do you actually do to avoid wrecking your back?

**Body (no link in the post, put it in a comment only if asked):**
Ten years in and my lower back is starting to complain. I've tried standing desks, stretching reminders, and Pomodoro, and nothing stuck. What routine do you actually keep up with, and what made it stick?

*(This is a genuine discussion post. If someone asks what you use, then mention Gymodoro. Don't lead with the link.)*

---

## 8. r/fitness or r/bodyweightfitness — **do not post a promo**

These subs ban self-promotion. Instead, comment helpfully in desk-worker/mobility threads and mention the app only if someone asks directly.

---

## Reply cheat-sheet

- "Is it free?" → state the actual plan plainly.
- "Why not just set a phone alarm?" → the app picks and shows the exercise, so there's nothing to decide or search for during the break.
- Bug reports → thank them, fix fast, reply with "fixed, thanks".
- Never argue with critical comments. Ask what they'd expect instead.
