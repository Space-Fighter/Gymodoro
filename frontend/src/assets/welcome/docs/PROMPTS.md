# Welcome-page photoreal asset production sheet

Everything the Welcome scroll-story (`frontend/src/components/welcome/story/`) needs
generated externally: a consistent photoreal character across ~15 shots, two short
loop clips, two alpha cloud PNGs, five app screenshots, and five looping music beds.

- **Character reference:** `frontend/src/assets/welcome/character-ref.png`
  (255x282, copy of the user-supplied `man.png`). Use it for **likeness only**.
- **Filenames are frozen** by `frontend/src/components/welcome/story/assets.ts` and
  `audio.ts`. Deliver each file at the exact path in `MANIFEST.md` (same folder).
  Placeholders currently sit at every one of those paths so the page builds today;
  overwrite them in place, no code change needed.
- **Look:** the page commits to one bright daytime world.
  - Part 1 (problem) — deliberately **hot / wrong**: harsh flat overexposed midday
    sun, sickly yellow-green parched grass, wrong hard shadows, sweat sheen.
  - Part 2 (solution) — warm **golden hour**, lush saturated Swiss green, clean air,
    soft long shadows.
  - Part 2 payoff + Part 3 — bright optimistic **golden-hour beach / open sky**.
- Aspect ratios below are targets; generate a hair larger and we crop.
- Deliver `.webp` (quality ~82) for stills unless noted; PNG only where a
  **transparent background** is required (noted per shot).

---

## CHARACTER SHEET — lock this likeness in every shot

**Who:** one young athletic man, mid-20s. Tousled dark brown wavy hair (loose curls,
a little length on top, natural — never gelled flat). Blue-grey eyes, fairly
close-set, level brows. Light even stubble. Straight nose, defined jaw, symmetrical
face, warm light-tan skin. Lean-athletic build in Part 1, visibly muscular by Part 2,
**ripped Greek-statue physique** at the payoff. Height reads ~6'0".

**Reference instruction for every prompt below:**
- Midjourney: append `--cref <URL-of-character-ref.png> --cw 80` (`--cw 100` for
  face-forward shots, `--cw 60` when the body/wardrobe should dominate).
- SDXL / Flux / other: load `character-ref.png` into an IP-Adapter (face) or
  InstantID / PuLID node at weight ~0.7; keep prompt hair/eye tokens as backup.
- **Lighting on the face must always match the scene** (harsh flat midday in P1,
  golden hour in P2, bright beach sun at the payoff) — do NOT carry the soft even
  studio light of the reference photo into the shots. Likeness only.
- Keep hair length/style, stubble density, eye colour and face shape identical
  across all shots; only wardrobe, physique and light change.

**Wardrobe by act:**
| Act | Wardrobe | Read |
|---|---|---|
| P1 grind | White/pale-blue office dress shirt, **untucked**, sleeves shoved up, **loose knotted tie** pulled away from an open collar, dark suit trousers, dress shoes off/askew | stressed, dishevelled, been-here-all-day |
| P2 Swiss work & workout | Casual outdoorsy: heather-grey tee or Henley, olive/khaki joggers or hiking shorts, barefoot or trail shoes | calm, healthy, unhurried |
| P2 payoff | **Shirtless or thin white tank**, board shorts — physique fully visible, Greek-statue definition, sun-kissed | triumphant, vital |
| P3 weekend walk | Relaxed weekend: open flannel or crew tee, chinos or shorts, sneakers, holding a coffee cup and a slim laptop; a friendly medium dog on a leash | contented, "this is my normal now" |

---

## PART 1 — THE PROBLEM  (harsh flat overexposed midday, sickly parched tones)

### `problemComposite` — the surreal hero (most important shot on the page)
- **Subject:** the character (P1 grind wardrobe — untucked shirt, loose tie),
  seated on a small plain wooden chair, hunched over a **cheap simple desk that is
  cluttered like hell**: stacks of paper, three coffee mugs, sticky notes fanned
  everywhere, tangled cables, an open laptop, energy-drink cans. One hand on the
  laptop, the **other holding a phone up near his face**. The **entire top of his
  head is flipped open on a hinge like a lid**, and **his brain sits inside a
  retro microwave** on the ground beside the desk; a thick bundle of cables runs
  from the microwave **into the trunk of the lone tree**.
- **Setting:** the iconic Windows-XP "Bliss" hill — but **scorched**: the rolling
  hill is parched yellow-brown, grass dead and patchy, the single tree at frame
  left half-bare. Big blown-out sky with a few hard cumulus.
- **cref:** `--cref <character-ref.png> --cw 75`
- **Framing:** wide, camera ~3/4 front, desk and tree both in frame, hill horizon
  high. Eye-level, slight hero low angle.
- **Lighting:** harsh flat **overexposed midday**, sun almost overhead, hard short
  shadows, highlights clipped, sickly warm-yellow cast, low contrast in shadows.
- **Aspect:** 16:10 (target 1600x1000). Opaque background.
- **Transparent bg:** no.

### `problemSky` — parched sky plate
- **Subject:** sky only — no character. Blown-out white-hot sun upper right,
  washed pale-yellow sky grading to hazy dirty-blue, a few hard-edged cumulus,
  heat shimmer. Bottom ~15% can fade so it composites under the hill.
- **Framing:** wide flat horizon-less sky field.
- **Lighting:** overexposed, sun disc clipped pure white with a yellow bloom.
- **Aspect:** 16:10 (1600x1000). **Transparent bg:** no (full-bleed plate).

> Note: beats 1a (desk grind + boss scolding), 1b (phone Instagram/Facebook/YouTube
> splash screens), 1d (day-dusk-night sky), 1e (zoom-to-iris) and beat 6
> (assessment) are all built in code from `problemComposite`, `problemSky`, CSS and
> DOM text — **no extra image assets** are required for them. If the generator
> wants to supply optional extras (a separate boss figure PNG, a phone-in-hand
> close-up, an iris macro), they are welcome but not wired; coordinate a filename
> first.

---

## PART 2 — THE SOLUTION  (warm golden hour, lush saturated green)

### `picnicScene` — Swiss work
- **Subject:** the character (P2 casual wardrobe), relaxed and smiling, working on
  a laptop at a **rustic wooden picnic table**. A **brown-and-white alpine cow
  leans its head in over his shoulder**, curiously looking at the screen. A
  **crystal-clear shallow stream runs past** in the near foreground.
- **Setting:** a Switzerland-like alpine meadow — deep green grass, wildflowers,
  soft-focus pine hills and a snow-dusted peak far behind, big gentle cumulus.
- **cref:** `--cref <character-ref.png> --cw 70`
- **Framing:** medium-wide, camera slightly low at table height, stream leading
  line bottom-left to mid-right, peak in the gap top-right.
- **Lighting:** warm **golden hour**, sun low behind/left, long soft shadows, hazy
  rim light on hair and the cow, gentle lens bloom.
- **Aspect:** 16:10 (1600x1000). **Transparent bg:** no.

### `streamStill` — still fallback for the stream loop
- **Subject:** a tight, near-top-down look at the same **crystal-clear stream**:
  clear water over smooth pebbles, a little white riffle, green banks at the edges.
  No character.
- **Framing:** fills the frame, water flowing left-to-right, shallow depth.
- **Lighting:** golden hour, sparkle highlights on ripples.
- **Aspect:** 16:10 (1600x1000). **Transparent bg:** no.
- Used under an animated SVG turbulence filter when the loop clip can't play
  (reduced-motion / no video support).

### `streamLoopWebm` + `streamLoopMp4` — the living-water loop clip
- **Content:** the exact `streamStill` framing, but **real flowing water** — the
  crystal stream running over pebbles, gentle riffles, leaves drifting through.
  Locked-off tripod shot, nothing else moving, no people.
- **Spec:** **6-10 second seamless loop** (first and last frame must match — either
  shoot a naturally cyclic ripple and trim on a zero-crossing, or crossfade the
  tail over the head ~0.5s). 1280x720 or 1920x1080, 24-30fps.
  - `stream-loop.webm` — VP9, ~0.8-1.5 Mbps, no audio.
  - `stream-loop.mp4` — H.264 High, `yuv420p`, ~1.5-2.5 Mbps, no audio, `faststart`.
  - Keep each file under ~2 MB. Played `muted loop playsinline preload="none"`.

### `catCow` — Swiss workout, part 1
- **Subject:** the character (P2 casual wardrobe) on a **yoga mat on the grass**,
  mid **cat-cow pose** (on hands and knees, spine arched, head lifted). The
  **cow grazes a few metres behind him**. The stream runs past in frame.
- **cref:** `--cref <character-ref.png> --cw 70`
- **Framing:** side-on, full body, low camera near grass level.
- **Lighting:** golden hour, backlit rim, soft.
- **Aspect:** 16:10 (1600x1000). **Transparent bg:** no.

### `pushups` — Swiss workout, part 2
- **Subject:** same character, same meadow, now doing **push-ups** on the mat —
  strong controlled form, early definition showing through the tee. Cow grazing
  beside him, stream running past.
- **cref:** `--cref <character-ref.png> --cw 70`
- **Framing:** low 3/4 front, full body, shallow depth.
- **Lighting:** golden hour, hard-ish warm key from the low sun, sweat sheen
  (healthy, not P1's sickly one).
- **Aspect:** 16:10 (1600x1000). **Transparent bg:** no.

### `cloudA` + `cloudB` — drifting alpha cumulus
- **Subject:** a single fat white **cumulus cloud**, soft fluffy edges, gentle
  under-shadow, nothing else.
- **Output:** **PNG with real alpha** — cloud fully opaque in the body, feathering
  to 0 alpha at the edges, rest of the canvas transparent. No baked sky colour.
- **cloudA:** ~400x260, a rounder compact puff.
- **cloudB:** ~500x300, a wider flatter bank.
- **Lighting:** lit from upper-left, warm white, faint golden underside.
- These are `motion.div` layers that drift continuously (60-120s loops) for depth.

---

## PART 2 PAYOFF — THE EMOTIONAL PEAK  (bright golden-hour beach)

### `vanBeach` — ripped man + friends + VW van + rainforest meets beach
- **Subject:** the character **shirtless / white tank, ripped Greek-statue
  physique**, laughing, mid-stride or arms wide, **surrounded by 3-4 friends
  (mixed genders, 20s, athletic, joyful)** genuinely having the time of their
  lives — someone with a surfboard, someone tossing a ball, towels, a cooler,
  a dog. An **iconic vintage Volkswagen Type 2 "kombi" van** (pale teal/white,
  roof rack) parked on the sand, doors open.
- **Setting:** the point where **lush rainforest meets a wide clean beach** —
  palms and dense jungle green behind the van, golden sand and gentle surf in
  front, headland in the haze.
- **cref:** `--cref <character-ref.png> --cw 65` (body should read; keep the face
  unmistakably him).
- **Framing:** **wide cinematic hero** — this is the biggest section on the page.
  Van slightly left of centre, group spread across the lower third, lots of sky
  and canopy up top for the overlaid `.glass` headline. Camera eye-level, slight
  low hero angle.
- **Lighting:** bright warm **golden hour**, sun low over the sea behind them,
  strong rim light on every figure, long shadows toward camera, sun flare / bloom,
  rich saturated colour.
- **Aspect:** 16:9 wide (target 1920x1080, deliver up to 2400x1350). Opaque.
- **Transparent bg:** no.

---

## PART 3 — THE FEATURES WALK  (bright open golden-hour, continuous stroll)

The walk composites cut-out figures over real app screenshots on a continuous
ground strip, so the three `walkGuy*` files and `walkGround` **must have
transparent backgrounds** and consistent scale, light direction and eye-line.

### `walkGround` — continuous path strip
- **Subject:** a seamless horizontal strip of ground the character walks along —
  short green grass / a light dirt path, a few pebbles and tufts, soft grass
  verge at the very bottom. No people, no big landmarks.
- **Output:** **PNG or WebP with transparent top** — ground occupies roughly the
  bottom 40-50% of the height, feathering to transparent above so sky/screenshots
  show through. Left and right edges must **tile seamlessly** (repeatable).
- **Framing:** very wide (target 1920x600), camera low, path receding slightly.
- **Lighting:** golden hour, shadows falling consistently to the **right**.
- **Transparent bg:** **yes** (above the ground line).

### `walkGuyCoffee` — walking, sipping coffee
- **Subject:** the character (P3 weekend wardrobe), **walking left-to-right in
  profile**, **slim laptop tucked under his left arm**, **coffee cup raised to his
  lips** in his right hand, a **friendly medium dog on a leash** trotting ahead.
  Relaxed, content, mid-step.
- **cref:** `--cref <character-ref.png> --cw 75`
- **Framing:** full body head-to-feet, side profile, feet near the bottom edge,
  generous transparent margin all around. Target 700x1100.
- **Lighting:** golden hour, key from the right (matches `walkGround` shadows),
  soft contact shadow under the feet baked in at low opacity.
- **Aspect:** portrait ~7:11. **Transparent bg:** **yes** (clean alpha cut-out,
  including between arm and torso and around the leash).

### `walkGuyPlank` — drops into a plank
- **Subject:** same character, same wardrobe, now in a **forearm plank** on the
  path, strong flat form; the **dog sits patiently** beside him, leash slack; the
  laptop and coffee set down on the grass next to him.
- **cref:** `--cref <character-ref.png> --cw 75`
- **Framing:** side-on, full body low to the ground, wide. Target 1000x500.
- **Lighting:** golden hour, key from the right, baked low-opacity contact shadow.
- **Transparent bg:** **yes**.

### `walkGuyBench` — reading stats on a bench
- **Subject:** same character, same wardrobe, **sitting on a simple wooden park
  bench**, laptop open on his knees, smiling at the screen; the **dog rests at his
  feet**, leash looped over the armrest. Coffee cup on the bench beside him.
- **cref:** `--cref <character-ref.png> --cw 75`
- **Framing:** 3/4 front, full figure + whole bench, feet on the ground line.
  Target 800x900.
- **Lighting:** golden hour, key from the right, baked contact shadow under bench
  and feet.
- **Transparent bg:** **yes** (bench included in the cut-out).

> Beat 11 also passes the "coffee while focusing" and "wallpaper swap" stations —
> those reuse `walkGuyCoffee` over the `shotTimerFocus` and `shotBackground`
> screenshots; no extra figure asset needed.

---

## SCREENSHOTS — captured live from the running app

Capture from the real Gymodoro frontend (`cd frontend && npm run dev`, backend
running with `npm run db:seed` done, signed in with a seeded account). Fixed clean
window, **~1440x900 at 2x device-pixel-ratio**, export **WebP** (quality ~85).
Save under `frontend/src/assets/welcome/screens/`.

| File | Screen to capture | State |
|---|---|---|
| `screens/timer-focus.webp` | Timer page, **focus mode running** | Timer counting down mid-session, focus dot active, a background set |
| `screens/timer-break.webp` | Timer page, **break mode with an exercise** | Break running, exercise name + video/tags visible in `BreakView` |
| `screens/workout-library.webp` | **Workout Library** tab | Exercise grid populated, a filter or two applied |
| `screens/stats.webp` | **Stats -> Analytics** tab | Stat tiles + hourly chart with some seeded session data |
| `screens/background.webp` | **Background** picker tab | Wallpaper thumbnails grid visible, one selected |

Placeholders (solid dark webp, 1440x900) sit at these paths now so the build works.

---

## AUDIO — five seamless-looping instrumental beds

Match the ids and moods in `frontend/src/components/welcome/story/audio.ts`. Short
loops (~30-60s), **seamless** (bar-aligned, zero-crossing or short tail crossfade),
instrumental only, no vocals, no sudden one-shot hits at the loop point. Deliver
**`.ogg` (Vorbis ~q4, primary)** + **`.mp3` (~128 kbps CBR, fallback)** per bed.
Combined budget ~1-2 min of audio / a few hundred KB. Save under
`frontend/src/assets/welcome/audio/`.

| File (`.ogg` + `.mp3`) | Bed id | Scroll range | Mood |
|---|---|---|---|
| `audio/problem.*` | `problem` | 0.00-0.28 | Tense, claustrophobic pad; low, airless; can subtly darken/detune toward its end (night falling) |
| `audio/turn.*` | `turn` | 0.28-0.34 | Short **bright resolve stinger** — a warm major lift, the moment relief arrives; fine for this one to be a ~6-10s phrase that loops softly |
| `audio/solution.*` | `solution` | 0.34-0.62 | Warm acoustic / folk, fingerpicked guitar or soft piano, unhurried, hopeful |
| `audio/payoff.*` | `payoff` | 0.62-0.74 | Uplifting **swell**, joyful, fuller instrumentation, the emotional peak |
| `audio/features.*` | `features` | 0.74-1.00 | Light **walking-tempo groove**, ~100-110 BPM, breezy, positive, unintrusive |

Silent 4s placeholders sit at these paths now (so `SceneAudioProvider` has
something to load without console errors); replace with the real loops.

### Sourcing (royalty-free only)
- **CC0 (no attribution needed):** Pixabay Music (pixabay.com/music — verify each
  track shows the Pixabay Content License), FreePD.com (all public domain).
- **CC-BY (attribution required):** incompetech.com (Kevin MacLeod). If any bed
  uses a CC-BY track, **record the attribution here**:

```
Attribution (fill in per delivered track):
- problem  : <title> by <artist> — <source URL> — <license>
- turn     : <title> by <artist> — <source URL> — <license>
- solution : <title> by <artist> — <source URL> — <license>
- payoff   : <title> by <artist> — <source URL> — <license>
- features : <title> by <artist> — <source URL> — <license>
```

CC0 tracks: note the source URL above anyway for our records, mark license `CC0`.
