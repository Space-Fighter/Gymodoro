/**
 * Blog content: the single source of truth for both the React blog pages and
 * the build-time prerender (`scripts/prerender-blog.ts`, which bakes each post
 * into static HTML so search engines get the full text without running JS).
 *
 * No imports and erasable-only TypeScript: Node runs this file directly at
 * build time. Inline markup in strings: `**bold**` and `[label](/href)`.
 * `cover.asset` is a path under `src/assets/welcome/`.
 */

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "callout"; title: string; text: string };

export interface BlogPost {
  slug: string;
  /** On-page H1. */
  title: string;
  /** <title> tag; keep under ~60 characters. */
  seoTitle: string;
  /** Meta description; keep under ~160 characters. */
  description: string;
  /** Short mono label above the title, like the welcome page's section kickers. */
  kicker: string;
  /** ISO dates (YYYY-MM-DD). */
  published: string;
  updated: string;
  cover: { asset: string; alt: string };
  keywords: string[];
  /** "Key takeaways" box at the top: the answer up front, for readers and AI search. */
  takeaways: string[];
  body: Block[];
  faq: { q: string; a: string }[];
  related: string[];
}

export const SITE_URL = "https://gymodoro.com";

export const BLOG_TITLE = "The Gymodoro Journal";
export const BLOG_SEO_TITLE = "Gymodoro Blog: Pomodoro, Focus and Desk Exercise Guides";
export const BLOG_DESCRIPTION =
  "Practical, research-backed guides on the Pomodoro Technique, desk exercises, active breaks and beating the doomscroll. From the team behind the Gymodoro focus timer.";

export const POSTS: BlogPost[] = [
  {
    slug: "pomodoro-technique-with-exercise-breaks",
    title: "The Pomodoro Technique with exercise breaks: the complete guide",
    seoTitle: "Pomodoro Technique with Exercise Breaks: Complete Guide",
    description:
      "How to pair the Pomodoro Technique with short workouts: the 25/5 cycle, which exercises fit a 5-minute break, and why moving beats scrolling between sessions.",
    kicker: "guide · pomodoro",
    published: "2026-10-11",
    updated: "2026-10-11",
    cover: { asset: "fix/swap-pushup.jpg", alt: "A man doing push-ups on a yoga mat at home during a break" },
    keywords: ["pomodoro technique", "pomodoro with exercise", "pomodoro workout", "active breaks", "exercise breaks"],
    takeaways: [
      "The Pomodoro Technique is 25 minutes of focus, a 5-minute break, and a longer 15–30 minute break after four rounds.",
      "Spending those breaks on light exercise instead of your phone helps you come back fresher, and adds up to real activity over a week.",
      "Six 5-minute active breaks a day, five days a week, is 150 minutes: the WHO's weekly minimum for moderate activity.",
      "Keep each break simple: one bodyweight exercise, no equipment, done at a pace that leaves you ready to sit back down and think.",
    ],
    body: [
      { type: "h2", text: "What is the Pomodoro Technique?" },
      {
        type: "p",
        text: "The Pomodoro Technique is a time-management method created by Francesco Cirillo in the late 1980s, when he was a university student. He used a tomato-shaped kitchen timer (**pomodoro** is Italian for tomato) to commit to short, focused bursts of study. The rules are simple:",
      },
      {
        type: "ol",
        items: [
          "Pick one task.",
          "Set a timer for 25 minutes and work on only that task until it rings.",
          "Take a 5-minute break.",
          "After four rounds, take a longer break of 15–30 minutes.",
        ],
      },
      {
        type: "p",
        text: "The method works because it turns a vague, intimidating goal (“finish the report”) into a concrete one (“work on the report until the timer rings”). The ticking clock makes starting easier, and the guaranteed break makes it easier to resist distractions in the meantime.",
      },
      { type: "h2", text: "The weak spot: what happens in the break" },
      {
        type: "p",
        text: "Most guides say very little about the break itself, and that's where the technique tends to fall apart. Five minutes is just long enough to open a social feed and just short enough that you won't notice when it becomes fifteen. You come back to your desk with a head full of other people's content instead of a rested brain.",
      },
      {
        type: "p",
        text: "Research on interruptions shows why that matters. Gloria Mark's team at UC Irvine found that after an interruption it took people an average of about **23 minutes** to get back to the original task. A break that drags you into a feed doesn't recharge your attention. It fragments it. (We go deeper on this in [how to stop doomscrolling on your work breaks](/blog/stop-doomscrolling-on-work-breaks).)",
      },
      { type: "h2", text: "Why exercise is the ideal Pomodoro break" },
      {
        type: "p",
        text: "A short bout of movement fixes the break problem from several directions at once:",
      },
      {
        type: "ul",
        items: [
          "**It has a natural end.** A set of squats finishes. A feed never does. You return to work on time without relying on willpower.",
          "**It changes your state.** Getting up, raising your heart rate a little and changing posture is a clearer mental reset than switching from one screen to another.",
          "**It breaks up sitting.** Long, unbroken bouts of sitting are linked to worse health outcomes, and frequent short movement breaks are one of the simplest counters. See [exercise snacks and the science of breaking up desk time](/blog/sitting-all-day-exercise-snacks).",
          "**It compounds.** Six 5-minute active breaks a day is 30 minutes of movement. Over a five-day week that is 150 minutes, the World Health Organization's minimum weekly target for moderate activity.",
        ],
      },
      {
        type: "p",
        text: "There is a creativity bonus too. In a 2014 Stanford study, Marily Oppezzo and Daniel Schwartz found people produced around **60% more creative ideas** while walking than while sitting. If you're stuck on a problem, the break is often where it unsticks.",
      },
      { type: "h2", text: "How to structure a Pomodoro workout cycle" },
      {
        type: "p",
        text: "You don't need a training plan. A sensible default looks like this:",
      },
      {
        type: "ol",
        items: [
          "**Focus, 25 minutes.** One task, phone out of reach, notifications off.",
          "**Active break, 5 minutes.** One bodyweight exercise for about 2–3 minutes, then a minute of easy stretching or walking, then water.",
          "**Repeat three more times**, rotating the body area: legs, then upper body, then mobility, then core.",
          "**Long break, 15–30 minutes.** Step away properly: a walk outside, a meal, or a longer stretch session.",
        ],
      },
      {
        type: "callout",
        title: "Rule of thumb",
        text: "Aim for effort that warms you up without leaving you breathless or sweaty. You want to sit back down alert, not exhausted. Save hard training for a proper workout.",
      },
      { type: "h3", text: "Good exercises for a 5-minute break" },
      {
        type: "p",
        text: "The best Pomodoro exercises need no equipment, no changing clothes and very little floor space. Some reliable picks:",
      },
      {
        type: "ul",
        items: [
          "**Legs:** bodyweight squats, chair squats, reverse lunges, calf raises, wall sits.",
          "**Upper body:** desk push-ups (hands on a sturdy desk), wall push-ups, chair dips on a non-rolling chair.",
          "**Core:** standing knee drives, desk planks, dead bugs if you have a bit of floor.",
          "**Mobility:** hip flexor stretch, thoracic rotations, chest opener, wrist and forearm stretches.",
        ],
      },
      {
        type: "p",
        text: "For step-by-step instructions on fifteen of these, see our list of [desk exercises you can do in a 5-minute break](/blog/desk-exercises-5-minute-break).",
      },
      { type: "h2", text: "Adjusting the timer to fit your work" },
      {
        type: "p",
        text: "25/5 is a starting point, not a law. Deep creative or technical work often benefits from longer blocks such as 50/10, while admin tasks or low-energy afternoons can suit shorter ones. The principle that matters is that **every block ends in a deliberate break**, and every break ends on time. If you're studying, our guide to [using a Pomodoro timer for studying](/blog/pomodoro-timer-for-studying) covers how to adapt it to revision.",
      },
      { type: "h2", text: "Doing it with Gymodoro" },
      {
        type: "p",
        text: "Gymodoro is a free Pomodoro timer built around this exact idea. When the focus timer rings, it hands you an exercise for the break, with a demo video and instructions, from a library of over 160 bodyweight moves. You can roll the dice for a random one or pick a body area. It also tracks your focus time, active breaks and estimated calories, so you can see the minutes add up across the week.",
      },
      {
        type: "p",
        text: "Whether you use Gymodoro or a kitchen timer and a sticky note of exercises, the change is the same: **stop treating the break as dead time.** It's the part of the cycle that makes the next 25 minutes work.",
      },
    ],
    faq: [
      {
        q: "Can you exercise during Pomodoro breaks?",
        a: "Yes. Light bodyweight exercise such as squats, desk push-ups or stretching fits comfortably in a 5-minute Pomodoro break. Keep the effort moderate so you return to work alert rather than tired.",
      },
      {
        q: "How much exercise do you get from Pomodoro breaks?",
        a: "Six 5-minute active breaks a day adds up to 30 minutes of movement. Over a five-day work week that is 150 minutes, which matches the World Health Organization's minimum weekly recommendation for moderate activity.",
      },
      {
        q: "What is the best exercise for a 5-minute break?",
        a: "Choose something with no equipment and little space: bodyweight or chair squats, desk push-ups, calf raises, reverse lunges or a hip flexor stretch. Rotate body areas across breaks so no single area gets overworked.",
      },
    ],
    related: ["desk-exercises-5-minute-break", "what-to-do-on-a-pomodoro-break", "sitting-all-day-exercise-snacks"],
  },

  {
    slug: "desk-exercises-5-minute-break",
    title: "15 desk exercises you can do in a 5-minute break",
    seoTitle: "15 Desk Exercises for a 5-Minute Break (No Equipment)",
    description:
      "Fifteen no-equipment desk exercises for short work breaks: legs, upper body, core and stretches, with simple form cues and sample 5-minute routines.",
    kicker: "workouts · desk exercises",
    published: "2026-10-11",
    updated: "2026-10-11",
    cover: { asset: "fix/move-stretch.jpg", alt: "A woman stretching her arms overhead at her office desk" },
    keywords: ["desk exercises", "office exercises", "5 minute workout", "exercises at work", "no equipment exercises"],
    takeaways: [
      "You can get a useful workout in 5 minutes with no equipment: pick one or two moves and do them at a steady pace.",
      "Rotate between legs, upper body, core and mobility across the day so every break feels fresh.",
      "Use a sturdy, non-rolling surface for anything that takes your weight, and stop if anything hurts.",
    ],
    body: [
      {
        type: "p",
        text: "A 5-minute break is enough time for meaningful movement, if you skip the warm-up debate and just start. Every exercise below works in office clothes, needs no equipment, and fits in the space beside a desk. Do one exercise for 2–3 minutes, or pair two of them, then take a minute to breathe and drink water before you sit back down.",
      },
      {
        type: "callout",
        title: "Safety first",
        text: "Only put your weight on a sturdy desk or a chair that can't roll or tip. Move within a comfortable range, and stop if you feel sharp pain. If you have an injury or a medical condition, check with a professional before starting a new routine.",
      },
      { type: "h2", text: "Legs and glutes" },
      { type: "h3", text: "1. Chair squats" },
      {
        type: "p",
        text: "Stand in front of your chair, feet shoulder-width apart. Sit your hips back until you lightly touch the seat, then stand up tall. Keep your chest up and knees tracking over your toes. **Aim for 3 sets of 10–15.**",
      },
      { type: "h3", text: "2. Reverse lunges" },
      {
        type: "p",
        text: "Step one foot back and lower until both knees are bent at roughly 90 degrees, then push through your front heel to return. Alternate legs. Hold the desk for balance if you need to. **2–3 sets of 8 per leg.**",
      },
      { type: "h3", text: "3. Calf raises" },
      {
        type: "p",
        text: "Rise onto the balls of your feet, pause for a second at the top, then lower slowly. They're easy to do while thinking through a problem. **3 sets of 15–20.**",
      },
      { type: "h3", text: "4. Wall sit" },
      {
        type: "p",
        text: "Lean your back against a wall and slide down until your thighs are close to parallel with the floor. Hold. It's quiet, sweat-free and surprisingly tough. **3 holds of 20–45 seconds.**",
      },
      { type: "h2", text: "Upper body" },
      { type: "h3", text: "5. Desk push-ups" },
      {
        type: "p",
        text: "Place your hands on the edge of a sturdy desk, walk your feet back into a straight line from head to heels, and lower your chest toward the desk. The higher the surface, the easier it is. **3 sets of 8–15.**",
      },
      { type: "h3", text: "6. Wall push-ups" },
      {
        type: "p",
        text: "The gentlest version of the push-up, and a good start if desk push-ups feel like too much. Hands on the wall at shoulder height, body straight, bend your elbows. **3 sets of 15.**",
      },
      { type: "h3", text: "7. Chair dips" },
      {
        type: "p",
        text: "Sit on the edge of a **non-rolling** chair, hands gripping the seat beside your hips. Slide forward and bend your elbows to lower a few inches, then press back up. Keep your shoulders away from your ears. **2 sets of 8–12.**",
      },
      { type: "h3", text: "8. Arm circles and shoulder rolls" },
      {
        type: "p",
        text: "Big slow circles forward, then backward, followed by shoulder rolls. Ideal after a long stretch of typing. **30 seconds each direction.**",
      },
      { type: "h2", text: "Core" },
      { type: "h3", text: "9. Standing knee drives" },
      {
        type: "p",
        text: "Stand tall and drive one knee up toward your chest, then switch, like a slow march. Speed up for more heart rate. **60 seconds.**",
      },
      { type: "h3", text: "10. Desk plank" },
      {
        type: "p",
        text: "Forearms on the desk, feet back, body in one straight line. Squeeze your glutes and breathe. **3 holds of 20–40 seconds.**",
      },
      { type: "h3", text: "11. Standing side bends" },
      {
        type: "p",
        text: "Reach one arm overhead and lean gently to the opposite side, feeling the stretch along your ribs. Alternate sides. **8 per side.**",
      },
      { type: "h2", text: "Mobility and stretches" },
      { type: "h3", text: "12. Standing hip flexor stretch" },
      {
        type: "p",
        text: "Step into a short split stance, tuck your pelvis slightly and shift forward until you feel a stretch at the front of the back hip. Sitting all day tightens exactly this area. **30 seconds per side.**",
      },
      { type: "h3", text: "13. Seated figure-four stretch" },
      {
        type: "p",
        text: "Sitting tall, cross one ankle over the opposite knee and hinge forward slightly from the hips. **30 seconds per side.**",
      },
      { type: "h3", text: "14. Chest opener" },
      {
        type: "p",
        text: "Clasp your hands behind your back (or hold a doorframe), lift your chest and draw your shoulder blades together. It counteracts the hunched keyboard posture. **30 seconds.**",
      },
      { type: "h3", text: "15. Wrist and forearm stretch" },
      {
        type: "p",
        text: "Extend one arm, palm up, and gently pull the fingers back with the other hand. Then flip the palm down and repeat. **20 seconds each way, each arm.**",
      },
      { type: "h2", text: "Three ready-made 5-minute routines" },
      {
        type: "ul",
        items: [
          "**Energy boost:** 1 minute knee drives, 2 minutes chair squats, 1 minute calf raises, 1 minute hip flexor stretch.",
          "**Upper-body reset:** 2 minutes desk push-ups, 1 minute arm circles, 1 minute chest opener, 1 minute wrist stretches.",
          "**Quiet office:** 2 wall sits, 2 desk planks, then side bends and a figure-four stretch.",
        ],
      },
      {
        type: "p",
        text: "Don't forget your eyes. The American Academy of Ophthalmology suggests the **20-20-20 rule**: every 20 minutes, look at something 20 feet away for 20 seconds. Tacking it onto the end of each active break covers it automatically.",
      },
      {
        type: "p",
        text: "If choosing an exercise every break sounds like one more decision, let a timer do it. [Gymodoro](/) assigns an exercise with a demo video at the end of every focus block. Read [the complete guide to Pomodoro with exercise breaks](/blog/pomodoro-technique-with-exercise-breaks) for how to build the habit.",
      },
    ],
    faq: [
      {
        q: "What exercises can I do at my desk?",
        a: "Chair squats, desk push-ups, calf raises, wall sits, desk planks, standing knee drives, and stretches for the hip flexors, chest and wrists all work at a desk with no equipment.",
      },
      {
        q: "Is a 5-minute workout worth it?",
        a: "Yes. Short bouts of movement break up long periods of sitting, raise your energy and add up across the day. Six 5-minute breaks give you 30 minutes of activity.",
      },
      {
        q: "How do I exercise at work without sweating?",
        a: "Choose slower strength and mobility moves such as wall sits, calf raises, desk planks and stretches, and keep the pace steady rather than fast. Save jumping and sprint-style moves for home.",
      },
    ],
    related: ["pomodoro-technique-with-exercise-breaks", "sitting-all-day-exercise-snacks", "what-to-do-on-a-pomodoro-break"],
  },

  {
    slug: "stop-doomscrolling-on-work-breaks",
    title: "How to stop doomscrolling on your work breaks",
    seoTitle: "How to Stop Doomscrolling on Your Work Breaks",
    description:
      "Why a quick phone check turns into a lost half hour, what it costs your focus, and seven practical ways to take breaks that actually recharge you.",
    kicker: "focus · digital habits",
    published: "2026-10-11",
    updated: "2026-10-11",
    cover: { asset: "problem/problem-tired-break.jpg", alt: "Hands scrolling a grid of photos on a phone" },
    keywords: ["stop doomscrolling", "doomscrolling at work", "phone addiction breaks", "how to take better breaks", "focus"],
    takeaways: [
      "Feeds are designed to have no stopping point, so a 5-minute break on your phone rarely stays at 5 minutes.",
      "Research suggests it can take around 23 minutes to fully return to a task after an interruption, and that a phone in view can drain attention.",
      "Willpower alone loses. Replace the scroll with a break that has a built-in end, such as a short exercise, and put the phone out of reach.",
    ],
    body: [
      {
        type: "p",
        text: "You finish a solid block of work, reach for your phone “just for a minute”, and look up twenty minutes later feeling more drained than before. If that's familiar, it isn't a character flaw. It's the predictable result of putting a tired brain in front of an app engineered to keep it there.",
      },
      { type: "h2", text: "Why breaks turn into doomscrolling" },
      {
        type: "ul",
        items: [
          "**No stopping cue.** Infinite feeds and autoplay remove the natural endings (the bottom of a page, the end of an episode) that used to tell us to stop.",
          "**Variable rewards.** You never know if the next swipe holds something great, the same unpredictable-reward pattern that makes slot machines compelling.",
          "**Low effort.** When you're mentally tired, the easiest option wins. Unlocking a phone is easier than standing up.",
        ],
      },
      { type: "h2", text: "What it costs your work" },
      {
        type: "p",
        text: "The scroll doesn't stay in the break. Gloria Mark's research at UC Irvine found that after being interrupted, people took an average of about **23 minutes** to get back to their original task. Her later work found that attention on a screen now shifts every few dozen seconds on average.",
      },
      {
        type: "p",
        text: "Even a phone you aren't using has a cost. In a 2017 study (Ward and colleagues, University of Texas at Austin), people with their phone on the desk performed worse on tests of working memory and fluid intelligence than people who left it in another room, even when it was face-down and silent.",
      },
      {
        type: "callout",
        title: "The real problem",
        text: "A break is supposed to restore attention. A feed spends it. You return with the same fatigue plus a head full of unrelated content to clear out.",
      },
      { type: "h2", text: "Seven ways to break the habit" },
      { type: "h3", text: "1. Give every break a defined job" },
      {
        type: "p",
        text: "“Take a break” is an open invitation to scroll. “Do two minutes of squats, then refill my water” isn't. A specific activity with a clear finish line leaves no gap for the feed to fill.",
      },
      { type: "h3", text: "2. Put the phone in another room" },
      {
        type: "p",
        text: "Distance beats discipline. If you need it for two-factor codes, put it in a drawer across the room. The few seconds of friction are often enough to break the reflex.",
      },
      { type: "h3", text: "3. Make movement the default" },
      {
        type: "p",
        text: "Physical activity is the opposite of scrolling: it's active, it ends, and it changes how you feel. Standing up also physically separates you from the desk where the phone lives. Our list of [15 desk exercises for a 5-minute break](/blog/desk-exercises-5-minute-break) gives you plenty of options.",
      },
      { type: "h3", text: "4. Use a timer that owns the break too" },
      {
        type: "p",
        text: "Most timers only manage the work block. When the break also has a countdown, it ends without you having to decide to end it. This is the core of the [Pomodoro Technique with exercise breaks](/blog/pomodoro-technique-with-exercise-breaks).",
      },
      { type: "h3", text: "5. Batch your phone time" },
      {
        type: "p",
        text: "You don't have to quit your phone. Move it: check messages during your long break or at lunch, on purpose, instead of in every gap. Planned use feels very different from reflexive use.",
      },
      { type: "h3", text: "6. Turn off non-essential notifications" },
      {
        type: "p",
        text: "Every buzz is an invitation. Keep notifications only for people and apps that genuinely need an immediate response.",
      },
      { type: "h3", text: "7. Track what you replaced it with" },
      {
        type: "p",
        text: "Habits stick when you can see progress. Counting active breaks, or minutes moved this week, gives you a small win to protect. That's a much better motivator than guilt about screen time. Phillippa Lally's research at University College London found new habits took a median of **66 days** to feel automatic, and that missing a single day didn't derail them.",
      },
      { type: "h2", text: "A break that's better than the feed" },
      {
        type: "p",
        text: "We built [Gymodoro](/) for exactly this. When your focus timer rings, it gives you an exercise to do instead of a feed to scroll: a short move with a demo video, timed so the break ends on schedule. It also tracks how many active breaks you take. You'll still have your phone. You just won't need it every 25 minutes.",
      },
    ],
    faq: [
      {
        q: "Why do I doomscroll on my breaks?",
        a: "Social feeds have no natural stopping point and use unpredictable rewards, and a tired brain defaults to the easiest option. Without a planned break activity, the phone fills the gap.",
      },
      {
        q: "What should I do on a break instead of scrolling?",
        a: "Choose something with a clear end that changes your state: a few minutes of light exercise, a short walk, stretching, getting water or looking out of a window.",
      },
      {
        q: "Does having my phone nearby affect my focus?",
        a: "Research suggests it can. A 2017 study found people performed worse on cognitive tests with their phone on the desk than with it in another room, even when the phone was silent.",
      },
    ],
    related: ["what-to-do-on-a-pomodoro-break", "pomodoro-technique-with-exercise-breaks", "pomodoro-timer-for-studying"],
  },

  {
    slug: "sitting-all-day-exercise-snacks",
    title: "Sitting all day? What “exercise snacks” do for your body and brain",
    seoTitle: "Sitting All Day? The Science of Exercise Snacks",
    description:
      "What research says about long hours of sitting, how short bursts of movement (exercise snacks) help, and how to fit them into a desk-based workday.",
    kicker: "science · sedentary work",
    published: "2026-10-11",
    updated: "2026-10-11",
    cover: { asset: "science/fact-stairs.jpg", alt: "A person climbing a long staircase, one step at a time" },
    keywords: ["sitting all day", "exercise snacks", "sedentary lifestyle", "breaking up sitting", "movement breaks"],
    takeaways: [
      "Long, uninterrupted bouts of sitting are linked to worse health outcomes, separately from how much you exercise.",
      "Short, frequent movement breaks (exercise snacks) are a practical counter. Even 5 minutes of light walking every 30 minutes improved blood sugar and blood pressure in one lab study.",
      "The easiest way to get them is to tie them to something you already do, like the end of every focus session.",
    ],
    body: [
      {
        type: "p",
        text: "If you work at a desk, you might spend most of your waking hours sitting. A workout before or after work helps, but research increasingly suggests that **how you sit** matters too, especially how long you go without getting up.",
      },
      { type: "h2", text: "What long sitting does" },
      {
        type: "p",
        text: "In a 2017 study published in the Annals of Internal Medicine, Keith Diaz and colleagues tracked nearly 8,000 adults with activity monitors. Both total sitting time and longer uninterrupted sitting bouts were associated with higher mortality risk. People who usually got up before 30 minutes had passed had the lowest risk.",
      },
      {
        type: "p",
        text: "These are observational findings, so they show an association rather than proof of cause. But they point in a clear direction: **frequent interruptions to sitting appear to matter**, not just your daily step count.",
      },
      { type: "h2", text: "What are exercise snacks?" },
      {
        type: "p",
        text: "“Exercise snacks” is the informal name for very short bouts of activity, from under a minute to a few minutes, spread through the day. Climbing a few flights of stairs briskly, a set of squats, or a fast walk to the end of the corridor all count. They don't replace a full workout. They make sure the hours in between aren't completely still.",
      },
      { type: "h3", text: "What the research shows" },
      {
        type: "ul",
        items: [
          "**Blood sugar and blood pressure:** in a 2023 Columbia University lab study, adults who did 5 minutes of light walking every 30 minutes during 8 hours of sitting had much smaller blood sugar spikes after meals (reduced by close to 60%) and lower blood pressure than when they sat continuously.",
          "**Short vigorous bursts:** a 2022 study in Nature Medicine (Stamatakis and colleagues) using wrist-worn monitors found that people who regularly did around three 1–2 minute bursts of vigorous everyday activity a day, such as hurrying up stairs, had substantially lower risk of death from all causes over the follow-up period than those who did none. Again, this is observational.",
          "**Mood and fatigue:** a 2022 meta-analysis in PLOS ONE (Albulescu and colleagues) found that micro-breaks of 10 minutes or less reliably increased vigor and reduced fatigue at work.",
        ],
      },
      {
        type: "callout",
        title: "Honest caveat",
        text: "The same meta-analysis found that micro-breaks improved performance on routine tasks more clearly than on very demanding cognitive work. Breaks reliably make you feel better. The productivity gains depend on the task.",
      },
      { type: "h2", text: "What about the brain?" },
      {
        type: "p",
        text: "Movement and thinking are closely linked. Stanford researchers Oppezzo and Schwartz found people generated about 60% more creative ideas while walking than while sitting. Separately, a well-known 2011 study by Ariga and Lleras found that brief diversions from a long task helped people keep their performance from sliding over time. Both suggest the same practical idea: stepping away briefly helps you stay on task for longer.",
      },
      { type: "h2", text: "How to build exercise snacks into a desk job" },
      {
        type: "ol",
        items: [
          "**Anchor them to a trigger.** “Whenever I think of it” never works. “At the end of every focus session” does. A [Pomodoro timer with exercise breaks](/blog/pomodoro-technique-with-exercise-breaks) gives you a trigger every 25–30 minutes.",
          "**Keep them tiny.** One exercise, two or three minutes. The goal is frequency, not intensity.",
          "**Remove decisions.** Keep a short list of go-to moves, or use an app that picks one for you.",
          "**Mix in some vigorous bursts.** A brisk stair climb or a fast set of squats a few times a day pushes your heart rate up briefly.",
          "**Count them.** Tracking active breaks turns an abstract health goal into a daily number you can beat.",
        ],
      },
      {
        type: "p",
        text: "Need ideas? Start with these [15 desk exercises for a 5-minute break](/blog/desk-exercises-5-minute-break).",
      },
      { type: "h2", text: "The takeaway" },
      {
        type: "p",
        text: "You don't need to overhaul your life to sit less harmfully. Getting up regularly, for a few minutes of movement each time, is one of the most achievable health habits for desk workers. [Gymodoro](/) builds it into your focus timer, so every break becomes an exercise snack automatically.",
      },
    ],
    faq: [
      {
        q: "What are exercise snacks?",
        a: "Exercise snacks are very short bouts of physical activity, from under a minute to a few minutes, done several times across the day, such as a brisk stair climb or a set of squats.",
      },
      {
        q: "How often should I get up from my desk?",
        a: "Research on sitting patterns suggests getting up at least every 30 minutes. A study from Columbia University found 5 minutes of light walking every 30 minutes improved blood sugar and blood pressure compared with continuous sitting.",
      },
      {
        q: "Can exercise snacks replace a workout?",
        a: "Not entirely. They are best seen as a complement: they break up long periods of sitting, while longer workouts build fitness. Both add toward the WHO's 150 minutes of weekly moderate activity.",
      },
    ],
    related: ["desk-exercises-5-minute-break", "pomodoro-technique-with-exercise-breaks", "stop-doomscrolling-on-work-breaks"],
  },

  {
    slug: "pomodoro-timer-for-studying",
    title: "How to use a Pomodoro timer for studying (and actually stick to it)",
    seoTitle: "How to Use a Pomodoro Timer for Studying",
    description:
      "A practical guide to studying with the Pomodoro Technique: planning sessions, picking the right block length, pairing it with active recall, and using breaks well.",
    kicker: "study · pomodoro",
    published: "2026-10-11",
    updated: "2026-10-11",
    cover: { asset: "fix/habit-notebook.jpg", alt: "An open notebook on a table, ready for a study session" },
    keywords: ["pomodoro for studying", "pomodoro study timer", "study timer", "how to study", "study techniques"],
    takeaways: [
      "Plan what each Pomodoro is for before you start: one topic, one concrete output.",
      "Spend focus blocks on active study methods like practice questions and recall, not re-reading.",
      "Use breaks to move and rest your eyes, not your phone, and take a longer break after four rounds.",
    ],
    body: [
      {
        type: "p",
        text: "The Pomodoro Technique was invented by a student trying to study, and it's still one of the simplest ways to beat procrastination before an exam. Twenty-five minutes is short enough that starting doesn't feel daunting, and long enough to get something real done. Here's how to make it work for revision.",
      },
      { type: "h2", text: "Step 1: Plan your Pomodoros before you start" },
      {
        type: "p",
        text: "Sitting down with “study biology” as your plan wastes the first block deciding what to do. Spend two minutes writing a short list instead:",
      },
      {
        type: "ul",
        items: [
          "Pomodoro 1: 20 practice questions on cell respiration.",
          "Pomodoro 2: mark them, make flashcards from every mistake.",
          "Pomodoro 3: write out the Krebs cycle from memory, then check it.",
          "Pomodoro 4: past-paper essay plan.",
        ],
      },
      {
        type: "p",
        text: "Each block has **one topic and one output** you can point to when the timer rings.",
      },
      { type: "h2", text: "Step 2: Fill the blocks with active study" },
      {
        type: "p",
        text: "A timer keeps you at the desk. What you do there decides how much you remember. A widely cited 2013 review of learning techniques (Dunlosky and colleagues) rated two methods as having the strongest evidence behind them:",
      },
      {
        type: "ul",
        items: [
          "**Practice testing:** answering questions or recalling information from memory, rather than re-reading it.",
          "**Distributed practice:** spreading study of a topic over several sessions instead of cramming it into one.",
        ],
      },
      {
        type: "p",
        text: "Pomodoros make both easier. Each block is a natural unit for a self-test, and the cycle makes it simple to revisit a topic in a later session or on a later day.",
      },
      { type: "h2", text: "Step 3: Pick the right block length" },
      {
        type: "p",
        text: "25/5 is a good default. Adjust it based on how you actually work:",
      },
      {
        type: "ul",
        items: [
          "**Struggling to start?** Try 15/5 until the habit is built.",
          "**Deep problem-solving or essay writing?** 45/10 or 50/10 can stop you breaking flow mid-thought.",
          "**After four rounds,** take a longer 15–30 minute break regardless.",
        ],
      },
      { type: "h2", text: "Step 4: Make the breaks count" },
      {
        type: "p",
        text: "This is where most study sessions go wrong. Five minutes on your phone often becomes twenty, and the content you scroll competes with what you just learned. Better break options:",
      },
      {
        type: "ul",
        items: [
          "**Move.** Squats, a walk around the room, stretches. Getting your blood moving after sitting is one of the best resets there is. See [15 desk exercises for a 5-minute break](/blog/desk-exercises-5-minute-break).",
          "**Rest your eyes.** Look out of a window at something far away.",
          "**Refill water, grab a snack.**",
          "**Leave the phone in another room** until your long break. Our guide to [stopping doomscrolling on breaks](/blog/stop-doomscrolling-on-work-breaks) covers why this matters.",
        ],
      },
      {
        type: "callout",
        title: "Exam-season bonus",
        text: "Long study days mean long days of sitting. Six active Pomodoro breaks a day add 30 minutes of movement without taking time away from revision.",
      },
      { type: "h2", text: "Step 5: Track sessions, not hours" },
      {
        type: "p",
        text: "“I studied for 6 hours” often includes a lot of drifting. Counting completed Pomodoros is more honest and more motivating: you can see exactly how much focused work went in, and set a target for tomorrow.",
      },
      { type: "h2", text: "Common problems and fixes" },
      {
        type: "ul",
        items: [
          "**“I get interrupted mid-Pomodoro.”** Write the distraction on a notepad and deal with it in the break. If you truly have to stop, restart the block.",
          "**“I'm in flow when the timer rings.”** Finish your sentence or the current question, then break. Note where you were so restarting is instant.",
          "**“I skip the breaks.”** Skipped breaks catch up with you in the afternoon. Breaks are part of the method, not a reward for it.",
        ],
      },
      { type: "h2", text: "A study timer that handles the breaks for you" },
      {
        type: "p",
        text: "[Gymodoro](/) is a free online Pomodoro timer that gives you a quick exercise with a demo video every time a focus block ends, then brings you back on time. It tracks your focus time and active breaks so you can watch your study streak grow. Read [the complete guide to Pomodoro with exercise breaks](/blog/pomodoro-technique-with-exercise-breaks) to see how the whole cycle fits together.",
      },
    ],
    faq: [
      {
        q: "Is the Pomodoro Technique good for studying?",
        a: "Yes. It makes starting easier, keeps sessions focused, and builds in regular breaks. It works best when focus blocks are filled with active methods like practice questions and recall.",
      },
      {
        q: "How many Pomodoros should I study per day?",
        a: "It depends on your schedule, but 8–12 Pomodoros (roughly 3.5–5 hours of focused work) is a demanding but realistic study day for many students. Start lower and build up.",
      },
      {
        q: "What should I do during Pomodoro study breaks?",
        a: "Stand up and move, rest your eyes by looking at something distant, drink water, and keep your phone away. Light exercise is one of the best ways to return refreshed.",
      },
    ],
    related: ["pomodoro-technique-with-exercise-breaks", "what-to-do-on-a-pomodoro-break", "stop-doomscrolling-on-work-breaks"],
  },

  {
    slug: "what-to-do-on-a-pomodoro-break",
    title: "What to do on a Pomodoro break: 12 ideas, ranked",
    seoTitle: "What to Do on a Pomodoro Break: 12 Ideas, Ranked",
    description:
      "Twelve things to do on a 5-minute Pomodoro break, ranked by how refreshed and focused you'll be afterwards, from light exercise to the phone scroll.",
    kicker: "ideas · breaks",
    published: "2026-10-11",
    updated: "2026-10-11",
    cover: { asset: "science/fact-walk.jpg", alt: "A happy woman walking through a park" },
    keywords: ["pomodoro break ideas", "what to do on a break", "5 minute break ideas", "work break activities", "short break ideas"],
    takeaways: [
      "The best breaks get you away from screens, get you moving, and end on time.",
      "Light exercise, a short walk and stretching top the list. Scrolling and checking email come last.",
      "Rotate a few favourites so breaks never become one more decision.",
    ],
    body: [
      {
        type: "p",
        text: "A Pomodoro break is only five minutes, so what you do with it matters. We ranked twelve common break activities by three simple tests: **does it rest the parts of you that were working, does it get you off the screen, and does it end on time?**",
      },
      { type: "h2", text: "The best breaks" },
      { type: "h3", text: "1. A short bodyweight exercise" },
      {
        type: "p",
        text: "Squats, desk push-ups or lunges raise your heart rate a little, change your posture and finish when the set does. That's why we put them first. Here are [15 desk exercises for a 5-minute break](/blog/desk-exercises-5-minute-break).",
      },
      { type: "h3", text: "2. A quick walk" },
      {
        type: "p",
        text: "Even a lap of the office or a trip down the stairs and back helps. Stanford research found walking boosted creative idea generation by around 60%, so it's an ideal break when you're stuck.",
      },
      { type: "h3", text: "3. Stretching" },
      {
        type: "p",
        text: "Hip flexors, chest and wrists take the brunt of desk work. Two minutes of stretching each break adds up to a lot of mobility over a week.",
      },
      { type: "h3", text: "4. Look out of a window" },
      {
        type: "p",
        text: "Focusing on something far away rests eye muscles that have been locked on a screen at arm's length. Pair it with any of the above.",
      },
      { type: "h2", text: "Good breaks" },
      { type: "h3", text: "5. Refill water or make tea" },
      { type: "p", text: "It's a reason to stand and walk, and a reason to stay hydrated. It makes a good second half to an exercise break." },
      { type: "h3", text: "6. Breathing exercise" },
      {
        type: "p",
        text: "A minute of slow breathing (for example, a longer exhale than inhale) is a calm reset after a stressful block, especially on days when you can't move much.",
      },
      { type: "h3", text: "7. Tidy your desk" },
      { type: "p", text: "It's light movement with a small payoff: a clearer workspace for the next block." },
      { type: "h3", text: "8. A quick chat with someone nearby" },
      {
        type: "p",
        text: "Social breaks are restorative, but they're hard to keep to five minutes. Save longer chats for your long break.",
      },
      { type: "h2", text: "Breaks to avoid" },
      { type: "h3", text: "9. Checking email or messages" },
      {
        type: "p",
        text: "It feels productive, but it isn't a break. It's another task, and it often brings new problems back into your head before the next block.",
      },
      { type: "h3", text: "10. Reading the news" },
      {
        type: "p",
        text: "News is endless and often stressful, which is a bad combination for a five-minute reset.",
      },
      { type: "h3", text: "11. Short videos" },
      {
        type: "p",
        text: "Autoplay is designed to keep you watching. One video becomes six, and your attention is somewhere else entirely.",
      },
      { type: "h3", text: "12. Scrolling social media" },
      {
        type: "p",
        text: "The bottom of the list. Infinite feeds have no stopping cue, keep you seated and on a screen, and research on interruptions suggests it can take more than 20 minutes to fully re-engage with your work afterwards. See [how to stop doomscrolling on your work breaks](/blog/stop-doomscrolling-on-work-breaks).",
      },
      {
        type: "callout",
        title: "The pattern",
        text: "The breaks at the top all involve getting up, getting off the screen, and doing something with a natural end. The ones at the bottom keep you sitting in front of a screen with no stopping point.",
      },
      { type: "h2", text: "Make good breaks automatic" },
      {
        type: "p",
        text: "Knowing the list isn't the hard part. Remembering it when you're tired is. That's why [Gymodoro](/) puts an exercise on screen the moment your focus timer ends, with a demo video and a countdown, so the best option is also the easiest one. For the full method, read [the Pomodoro Technique with exercise breaks](/blog/pomodoro-technique-with-exercise-breaks).",
      },
    ],
    faq: [
      {
        q: "What is the best thing to do on a 5-minute break?",
        a: "Light physical activity such as a few bodyweight exercises, a short walk or stretching. These get you off the screen, change your posture and end on time.",
      },
      {
        q: "Is it bad to use your phone on a Pomodoro break?",
        a: "It is one of the least restorative options. Social feeds and video apps have no natural stopping point, so breaks overrun and it is harder to refocus afterwards.",
      },
      {
        q: "How long should a Pomodoro break be?",
        a: "The standard is 5 minutes after each 25-minute focus block, with a longer 15–30 minute break after four rounds.",
      },
    ],
    related: ["desk-exercises-5-minute-break", "stop-doomscrolling-on-work-breaks", "pomodoro-technique-with-exercise-breaks"],
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return POSTS.find((p) => p.slug === slug);
}

/** Approximate reading time in minutes (~220 words per minute). */
export function readingMinutes(post: BlogPost): number {
  const text = post.body
    .map((b) => (b.type === "ul" || b.type === "ol" ? b.items.join(" ") : b.type === "callout" ? `${b.title} ${b.text}` : b.text))
    .join(" ");
  return Math.max(1, Math.round(text.split(/\s+/).length / 220));
}

/** "11 October 2026" from an ISO date, independent of the reader's timezone. */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return `${d} ${months[m - 1]} ${y}`;
}
