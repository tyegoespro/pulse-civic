# Pulse Promo (Remotion)

30-second editorial promo video for Pulse. Same Space Mono / paper /
Pulse-pink language as the landing page, animated programmatically with
Remotion.

## Commands

```bash
# Live preview in the Remotion Studio (browser at localhost:3000)
npm run studio

# Render the landscape 1920×1080 cut straight into the web app's public/
# so the landing-page embed picks it up
npm run render:web

# Render variants to remotion/out/
npm run render          # landscape (1920×1080)
npm run render:square   # 1080×1080 for IG feed
npm run render:vertical # 1080×1920 for Reels / TikTok / Stories
```

After `render:web`, the output lands at `../public/pulse-promo.mp4` and
the `<video>` element on the landing page (in `src/components/LandingPage.jsx`)
plays it automatically (autoplay, muted, loop).

## Edit the storyboard

Everything lives in `src/PulsePromo.tsx`. Each scene is a small React
component wrapped in a `<Sequence />` with explicit `from` and
`durationInFrames`. 30fps × 30s = 900 total frames.

| Frames | Scene |
| --- | --- |
| 0–60 | Masthead reveal |
| 60–210 | Hero headline ("The same twelve people show up to every council meeting.") |
| 210–300 | "The rest of us stopped going." |
| 300–450 | "Pulse is for the rest of us." (pink accent block sweep) |
| 450–660 | Four numbered planks |
| 660–810 | Verified residents / Real consensus / In real time |
| 810–900 | End card — brand mark + URL + CTA |

Reuse the `useSlideUp`, `useFadeIn`, `useFadeOut` helpers for consistent
motion across new scenes.
