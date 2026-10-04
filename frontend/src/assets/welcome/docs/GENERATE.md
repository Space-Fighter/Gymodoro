# Ready-to-paste prompts

Flattened from `PROMPTS.md`. After generating, save each at the filename shown
(overwrite the placeholder), stills as `.webp` q~82, cut-outs as `.png` with a
transparent background.

## Using Gemini (Google — "Nano Banana" / Gemini 2.5 Flash Image)

Gemini is conversational — it ignores `--ar` / `--cref` / `--cw`. Do this instead:

1. **One chat thread for everything.** First message: attach
   `character-ref.png` and say:
   > "This is the character. In every image I ask you to make, keep his face,
   > hair (tousled dark wavy), stubble and blue-grey eyes **identical** — only
   > his wardrobe, physique and the lighting change. Photoreal, cinematic."
2. For each shot, paste the prompt body below **without the `--` flags**, and add
   the aspect ratio in words: *"wide 16:10 landscape"* / *"tall portrait"* /
   *"wide 16:9 cinematic"*. Ignore the `--cw` numbers.
3. **Keep environment consistent by editing:** after you get `picnic-scene`, say
   *"same man, same meadow, now doing a cat-cow yoga pose on a mat, cow grazing
   behind"* — Gemini reuses the scene. Do the same for `pushups`.
4. **Transparent cut-outs** (`walk-guy-*`, `walk-ground`, `cloud-*`): ask for
   *"on a solid flat chroma-green background, full body, nothing cropped"*, then
   the background gets removed afterward (I can do this).
5. Download the images (they'll be PNG, ~1024px, often near-square — some cropping
   needed; generate a bit wider than the target).
6. Hand me the raw files — I convert to `.webp`, crop to the target ratios, remove
   backgrounds, and file them at the right paths.

The `--cref <REF> --cw N` lines below are Midjourney-only; skip them for Gemini.

---

## problem-composite.webp  (16:10, opaque — the hero shot)
```
young athletic man mid-20s, tousled dark wavy hair, light stubble, untucked pale-blue office dress shirt with a loose knotted tie and sleeves shoved up, hunched on a plain wooden chair at a cheap simple desk CLUTTERED like hell — paper stacks, three coffee mugs, sticky notes fanned everywhere, tangled cables, open laptop, energy-drink cans — one hand on the laptop, the other holding a phone up near his face, the ENTIRE TOP OF HIS HEAD flipped open on a hinge like a lid, his brain sitting inside a retro microwave on the ground beside the desk, thick bundle of cables running from the microwave into the trunk of a lone half-bare tree at frame left, on the iconic Windows-XP Bliss rolling hill but SCORCHED — parched yellow-brown dead patchy grass, blown-out sky, hard cumulus, wide shot camera 3/4 front eye-level slight low hero angle desk and tree both in frame high horizon, harsh flat OVEREXPOSED midday sun almost overhead, hard short shadows, clipped highlights, sickly warm-yellow cast, photorealistic, 35mm --ar 16:10 --cref <REF> --cw 75
```

## problem-sky.webp  (16:10, opaque — sky only, no character)
```
sky only, no people, blown-out white-hot sun in the upper right with a yellow bloom, washed pale-yellow sky grading down to hazy dirty-blue, a few hard-edged cumulus clouds, visible heat shimmer, overexposed, wide flat sky field, photorealistic --ar 16:10 --no people, person, figure
```

## picnic-scene.webp  (16:10, opaque)
```
the same young man, casual heather-grey henley and olive joggers, relaxed and smiling, working on a laptop at a rustic wooden picnic table, a brown-and-white alpine cow leaning its head in over his shoulder curiously looking at the screen, a crystal-clear shallow stream running past in the near foreground, Switzerland-like alpine meadow with deep green grass and wildflowers, soft-focus pine hills and a snow-dusted peak far behind, big gentle cumulus, medium-wide shot camera low at table height, stream as a leading line bottom-left to mid-right, warm GOLDEN HOUR sun low behind-left, long soft shadows, hazy rim light on his hair and the cow, gentle lens bloom, photorealistic, 35mm --ar 16:10 --cref <REF> --cw 70
```

## stream-still.webp  (16:10, opaque — no character)
```
tight near-top-down view of a crystal-clear shallow stream, clear water over smooth rounded pebbles, a little white riffle, mossy green banks at the edges, water flowing left to right, shallow depth of field, golden hour with sparkle highlights on the ripples, photorealistic --ar 16:10 --no people
```

## stream-loop.webm / stream-loop.mp4  (6–10s seamless loop, no audio, <2MB each)
Not an image. Film ~8s of any real creek on a locked-off phone, or use an AI video
tool (Runway / Kling / Luma) with `stream-still.webp` as the first frame. Trim to a
seamless loop (match first/last frame or crossfade the last ~0.5s over the start).
Export: webm VP9 ~1 Mbps + mp4 H.264 yuv420p faststart ~2 Mbps, both muted.
Optional — the page has an animated fallback if these are missing.

## cat-cow.webp  (16:10, opaque)
```
the same young man, casual heather-grey tee and olive joggers, on a yoga mat on the grass mid cat-cow pose — on hands and knees, spine arched, head lifted — a brown-and-white cow grazing a few metres behind him, a crystal-clear stream running past, Switzerland-like alpine meadow, snow-dusted peak far behind, side-on full-body shot camera low near grass level, GOLDEN HOUR backlit rim light, soft, photorealistic, 35mm --ar 16:10 --cref <REF> --cw 70
```

## pushups.webp  (16:10, opaque)
```
the same young man, casual heather-grey tee and olive joggers, doing push-ups on a yoga mat on the grass, strong controlled form, early muscle definition through the tee, a brown-and-white cow grazing beside him, a crystal-clear stream running past, Switzerland-like alpine meadow, low 3/4 front full-body shot, shallow depth of field, GOLDEN HOUR hard-ish warm key light from the low sun, healthy sweat sheen, photorealistic, 35mm --ar 16:10 --cref <REF> --cw 70
```

## cloud-a.png  (~400x260, TRANSPARENT bg)  /  cloud-b.png  (~500x300, TRANSPARENT bg)
```
a single fat white cumulus cloud, soft fluffy feathered edges, gentle warm-white under-shadow, lit from the upper left, faint golden underside, nothing else, on a plain flat green background, photorealistic
```
Then remove the background → PNG with real alpha (opaque body, feathering to 0 at edges).
cloud-a = a rounder compact puff; cloud-b = a wider flatter bank.

## van-beach.webp  (16:9, up to 2400x1350, opaque — the emotional peak, biggest section)
```
the same young man now SHIRTLESS with a ripped Greek-statue physique, sun-kissed, laughing arms wide mid-stride, surrounded by 3-4 joyful athletic friends in their 20s genuinely having the time of their lives — one holding a surfboard, one tossing a ball, towels, a cooler, a dog — an iconic vintage pale-teal-and-white Volkswagen Type 2 kombi van with a roof rack parked on golden sand with its doors open, at the point where lush green rainforest and palms meet a wide clean beach, gentle surf, headland hazy in the distance, WIDE CINEMATIC hero shot van slightly left of centre group across the lower third lots of sky and canopy up top, camera eye-level slight low hero angle, bright warm GOLDEN HOUR sun low over the sea behind them, strong rim light on every figure, long shadows toward camera, sun flare and bloom, rich saturated colour, photorealistic, anamorphic --ar 16:9 --cref <REF> --cw 65
```

## walk-ground.webp  (1920x600, TRANSPARENT above the ground line, tileable L↔R)
```
a seamless horizontal strip of short green grass and a light dirt path with a few pebbles and grass tufts, soft grass verge along the very bottom, no people no landmarks, very wide, camera low, path receding slightly, golden hour with shadows falling to the RIGHT, photorealistic
```
Then cut so ground fills the bottom ~40–50%, feathering to transparent above; make
the left and right edges tile seamlessly.

## walk-guy-coffee.png  (~700x1100 portrait, TRANSPARENT bg — clean cut-out)
```
the same young man, relaxed weekend open flannel over a crew tee and chinos and sneakers, walking left-to-right in strict side profile, a slim laptop tucked under his left arm, a coffee cup raised to his lips in his right hand, a friendly medium brown dog on a leash trotting ahead, relaxed and content mid-step, full body head to feet, plain flat grey background, golden hour key light from the right, soft contact shadow under the feet, photorealistic, 35mm --ar 7:11 --cref <REF> --cw 75
```
Then remove background → clean alpha (including between arm and torso, around the leash).

## walk-guy-plank.png  (~1000x500, TRANSPARENT bg)
```
the same young man, relaxed weekend flannel and chinos, in a forearm plank on a grass path with strong flat form, a friendly medium brown dog sitting patiently beside him with a slack leash, a laptop and coffee cup set down on the grass next to him, side-on full body low to the ground, wide, plain flat grey background, golden hour key light from the right, low contact shadow, photorealistic --ar 2:1 --cref <REF> --cw 75
```
Remove background → alpha.

## walk-guy-bench.png  (~800x900, TRANSPARENT bg, bench included)
```
the same young man, relaxed weekend flannel and chinos and sneakers, sitting on a simple wooden park bench with a laptop open on his knees smiling at the screen, a friendly medium brown dog resting at his feet with the leash looped over the armrest, a coffee cup on the bench beside him, 3/4 front full figure and the whole bench, feet on the ground line, plain flat grey background, golden hour key light from the right, contact shadow under bench and feet, photorealistic --ar 8:9 --cref <REF> --cw 75
```
Remove background → alpha (keep the bench in the cut-out).

---

## Screenshots — leave to the build (captured from the running app)
`screens/timer-focus.webp`, `screens/timer-break.webp`, `screens/workout-library.webp`,
`screens/stats.webp`, `screens/background.webp`

## Audio — 5 loops from pixabay.com/music (CC0), ~30–60s seamless, instrumental
`audio/problem`, `audio/turn`, `audio/solution`, `audio/payoff`, `audio/features`
— each as `.ogg` + `.mp3`. Moods in `PROMPTS.md` §AUDIO.
