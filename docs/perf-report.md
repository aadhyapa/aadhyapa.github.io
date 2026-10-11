# T23 Performance report

Oct 11, 2026. Branch `task/T23-perf`.

Method: `npm run build`, then `astro preview`, then Lighthouse 13 (performance only, mobile form factor, simulated throttling), one run per address. Scores come from single runs, so expect about 1 point of noise.

## Lighthouse mobile performance

| Address | Before | After | Before FCP / LCP | After FCP / LCP | CLS before / after |
| --- | --- | --- | --- | --- | --- |
| / | 99 | 99 | 1.7 / 1.7 s | 1.4 / 1.7 s | 0.010 / 0.001 |
| /about | n/a | n/a | page does not exist | page does not exist | n/a |
| /experience | 99 | 100 | 1.7 / 1.7 s | 1.4 / 1.5 s | 0 / 0 |
| /experience/work | 99 | 100 | 1.7 / 1.7 s | 1.4 / 1.5 s | 0 / 0 |
| /experience/projects | 99 | 100 | 1.7 / 1.7 s | 1.4 / 1.5 s | 0 / 0 |
| a role (software-engineer-intern-hes) | 100 | 100 | 1.5 / 1.5 s | 1.4 / 1.5 s | 0 / 0 |
| a project (ai-mock-interview-platform) | 100 | 100 | 1.5 / 1.5 s | 1.4 / 1.5 s | 0 / 0 |
| /letters | 100 | 100 | 1.4 / 1.5 s | 1.1 / 1.4 s | 0 / 0 |
| a letter (sample-letter-one) | 99 | 100 | 1.7 / 1.7 s | 1.4 / 1.5 s | 0 / 0 |
| a category (/letters/category/notes) | 100 | 100 | 1.4 / 1.5 s | 1.1 / 1.4 s | 0 / 0 |
| 404 (/404) | 99 | 100 | 1.7 / 1.7 s | 1.4 / 1.5 s | 0 / 0 |

Total blocking time is 0 to 10 ms everywhere. Every existing address is at 99 or higher before and after, so the 90 target is met.

## JavaScript shipped per page

Same on every page (all pages share the layout); the experience work page adds one more inline script of 567 B.

| File | Raw | Gzip |
| --- | --- | --- |
| client router chunk (`client.*.js`) | 12.3 KB | 4.3 KB |
| ClientRouter script | 4.1 KB | 1.8 KB |
| Layout script (window shell, `window.ts`) | 1.5 KB | 0.8 KB |
| two inline module scripts (clock, menu bar) | 0.6 KB | 0.5 KB |
| Total | about 18.5 KB | about 7.4 KB (Lighthouse: 7.9 KB transfer) |

The window shell itself is 1.5 KB raw (0.8 KB gzip), well inside any sensible budget. Most of the JS is Astro's view-transition router, which the plan requires for the persistent backdrop. Theme script budget for T17: it must be inline in the head and stay under about 0.5 KB; it fits easily in the remaining headroom (TBT is 0 ms).

## Changes

1. Fonts: preload the two fonts every page uses above the fold, Quicksand (latin, variable) and Silkscreen 700, in `src/layouts/Layout.astro`. This removed the font-swap layout shift on home (CLS 0.010 to 0.001) and cut FCP about 0.3 s. Bagel Fat One, Silkscreen 400 and La Belle Aurore are not preloaded because several addresses do not use them (a preload there would be wasted bytes).
2. Fonts already met the rest of the brief, so nothing else changed: only latin woff2 files are imported (no latin-ext or vietnamese files are fetched on any tested page), `font-display: swap` is emitted for every face, Quicksand is one variable file, and no unused weights are imported.
3. Images: the site has no raster images (decoration is inline SVG), so there was nothing to move to Astro image optimization. Rule for later: use `astro:assets` `<Image>` for the portrait and About photo.
4. Layout shift: the clock has a fixed width and tabular digits and causes none. The persisted backdrop causes none. The only shift found was the bio paragraph font swap on home, fixed by the preload above.

## Found but not fixed

- `/about` does not exist (no `src/pages/about.astro`), although T10 is listed as done. It could not be measured. Lighthouse should be re-run on it when it lands.
- Quicksand ships as a variable file (28 KB) to cover weights 500 and 700. Two static files would be larger, so left alone.
- Build output also includes `/dev/kit` and `/dev/window-2` demo pages; consider excluding them from production builds.
- `src/components/Window.astro` had an uncommitted change from T22 when this branch was cut; it was left out of this task's commit.
