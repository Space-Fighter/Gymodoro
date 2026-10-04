# Frontend assets

| Folder | What lives here |
|---|---|
| `brand/` | Logo, the 25-minute badge, the character reference (`man.png`). |
| `backgrounds/` | Local timer-scene wallpapers (the rest of the catalog is remote URLs in `timer/backgrounds.ts`). |
| `sounds/timer-rings/` | Timer bell / gong / tick sounds. |
| `welcome/hero/` | Welcome hero clips (`*-scrub.mp4`), posters and `cta-bg.webp`. `source/` holds the raw originals (not bundled). |
| `welcome/problem/` | Photos on the Problem cards. |
| `welcome/fix/` | Photos on the Fix cards. `source/` holds original full-size images (not bundled). |
| `welcome/science/` | Photos on the Science cards (`fact-*.jpg`). |
| `welcome/screens/` | Product screenshots for the "See it in the app" row. |
| `welcome/bg/` | Looping background clips for the welcome page, played in filename order. |
| `welcome/docs/` | Prompts, manifest, credits for the welcome assets. Not bundled. |

Welcome files are resolved by name in `components/welcome/assets.ts` (e.g. `assetUrl("fix/move-stretch.jpg")`).
