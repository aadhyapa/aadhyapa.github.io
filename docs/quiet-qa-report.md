# T20 quiet-mode QA report

Date: 2026-10-11 · Branch: `task/T20-quiet-qa` · Production build (`npm run build`, `astro preview`).
Tested with Playwright 1.58 (Chromium) and axe-core, at 390, 768 and 1280px, in both themes.
Screenshots: `docs/t20-screenshots/` (`<theme>_<width>_<address>.png`, plus `switch_focus_*` for the focus ring).

## Addresses

Role = `/experience/qa-engineer-intern-hudl`, project = `/experience/ai-mock-interview-platform`, letter = `/letters/sample-letter-one`, category = `/letters/category/making`, 404 = `/nope`.
`/about` no longer exists (removed in 975fef1) and returns the 404 window, so it is covered by the 404 run.
Names used in screenshots: `home`, `exp`, `work`, `projects`, `role`, `project`, `letters`, `letter`, `category`, `notfound`.

## Result summary

| Check | Result |
| --- | --- |
| 1. Contrast, both themes | PASS (quiet lowest 5.61:1; axe 0 violations in 60 runs) |
| 2. Saved choice | PASS (and degrades as expected with storage blocked) |
| 3. First-load flash | PASS (no cute frame before quiet, even at 6x CPU) |
| 4. Layout shift on toggle | **FAIL**: menu bar box never moves, but the window, its content and the controls inside the menu bar do (open items O5 to O7) |
| 5. The switch | PASS on the control itself; 2 open items on reaching it while a window is open |
| 6. Keyboard flow in quiet | PASS (54 of 54 checks) |
| 7. No decoration in quiet | 1 defect found and fixed (heart-shaped portrait frame); nothing else renders |

## 1. Contrast

- axe-core (wcag2a, wcag2aa, wcag21aa, wcag22aa, best-practice): **0 violations** on all 10 addresses x 3 widths x 2 themes.
- Real-pixel measurement (method from `docs/a11y-report.md`: record each visible text node's computed colour, hide all text, screenshot, then take the worst contrast between that colour and every background pixel under the text). 1,098 text nodes in total. Excluded as in T22: decorative `aria-hidden` content, visually hidden text, and anything covered by the full-screen sheet or the dim overlay (found with `elementFromPoint`).
  - **Quiet: 0 below 4.5:1. Lowest 5.61:1** (muted `#a3a3a3` on the panel surface). Most text is 7.49:1 or better.
  - Cute: unchanged by this task. 4 nodes read below 4.5:1 (`/experience/projects` at 768 and 1280, role and project at 1280). All four are list items whose last line is scrolled half under the window's bottom frame, so the sampled box includes the dark frame, not page background. Not a real failure; screenshot `open_cute_1280_role_clipped_text.png` (an artifact of measuring clipped text, not a design defect).
- `node scripts/contrast.mjs` is cute-token only and was not changed.

## 2. Saved choice

Run at 1280 and 390, identical results.

| Step | Theme after |
| --- | --- |
| Click switch | quiet |
| Reload | quiet |
| Menu bar link to `/experience`; link from inbox to a letter; link from home to `/letters` | quiet |
| Back and forward buttons (several steps) | quiet |
| Direct address in the same tab (full page load) | quiet |
| Fresh tab, direct `/letters/sample-letter-one`, `/nope`, `/` | quiet |
| Switch back to cute, reload | cute |
| **localStorage blocked** (every access throws): load | cute |
| Blocked: click switch | quiet (lasts for the visit) |
| Blocked: link navigation and back button | quiet (the theme is copied into the new page on `astro:before-swap`) |
| Blocked: reload | cute (expected: nothing can be saved) |
| Blocked: console and page errors | none |

## 3. First-load flash

Quiet saved, reload with CDP CPU throttling 6x (and 1x for comparison), on `/`, `/experience` and a letter. Three evidence sources per run:

- Paint timing: `data-theme="quiet"` was set 6 to 8ms (1x) or about 28ms (6x) into the page, before `first-paint` at 28 to 36ms (1x) and 64 to 80ms (6x). The theme was already `quiet` inside every `paint` entry callback.
- Screencast: 2 to 18 frames per run; every sampled frame was the quiet background (`rgb(10,10,10)`), none the cute colours.
- Cause: the inline `<script>` in `<head>` (Layout.astro) sets the attribute before the body parses, and it also preloads the Plex Mono file.

Result: **no cute-theme frame was recorded.** Limit: sampling is every compositor frame the screencast delivered, not a guaranteed capture of every paint.

## 4. Layout shift on toggle

For each of 30 combinations (10 addresses x 3 widths), bounding boxes were taken in cute, after one toggle to quiet, and after toggling back (the round trip always returned to the cute boxes exactly). Boxes: menu bar (`#menubar .bar`), window layer, window, title bar, window body, document scroll size; plus inner pieces (explorer toolbar, preview, sheet, inbox, home card, menu bar controls).

Note on an earlier pass: a first run of this check reported 0 shifts because of a bug in my own script (it compared nothing). It was rewritten, checked against a known shift (the switch width) and re-run; the numbers below are from the rewritten run.

- **Menu bar box (`#menubar .bar`): never moves.** Same x, y, width, height in every combination.
- **Window, title bar and body boxes: no shift in 22 of 30 combinations** (all at 390; at 768 all except letter; at 1280 all except experience, work and letter).
- **Shifts (defects):**
  - 1280, `/experience` and `/experience/work`: window 667.06px tall in cute, 680px in quiet, so it moves up 6.5px (y 94.47 to 88) and the title bar moves with it.
  - 1280 and 768, letter: window 583.73px tall in cute (1280 and 768), 629.73px (1280) or 656.92px (768) in quiet, so the window moves up 23px (1280) or 37px (768) (y 136.13 to 113.13 or 99.53).
  - Home page document height changes by a few px (390: 1477 to 1504; 768: 964 to 968; 1280: 924 to 923).
  - Inside fixed windows, content boxes change height because Plex Mono is wider than Quicksand and wraps differently: 390 explorer toolbar grows from 114px to 166px (tabs wrap to a third row) and pushes the preview down 52px; sheets, inboxes and previews are 5 to 20% taller in quiet (for example role at 390: 1268.59 to 1375.34px; project at 1280: 1073.34 to 1205.28px). Titles and close buttons stay put there.
  - Menu bar controls: the switch is 86px wide in cute and 69px in quiet, the nav list is 224px and 245px, the résumé button 145px and 148px, so the controls to the right of the nav list (résumé button, switch) move sideways by up to 17px. The clock does not move.
- Cause: not a bug in one rule. The quiet theme swaps the font from Quicksand (and Silkscreen labels in a different width) to IBM Plex Mono, so anything sized by its text changes size. A fix needs either windows with a fixed height and fixed control widths, or font sizes tuned so the wraps match. Both are bigger than a quiet-token fix, so they are listed as open items rather than patched here.

## 5. The switch

| Property | Cute | Quiet |
| --- | --- | --- |
| Text label (no icon only) | "quiet" (screen reader: "Switch to quiet theme") | "cute" ("Switch to cute theme") |
| Size | 86 x 44px | 69 x 44px |
| Enter toggles, Space toggles | yes | yes |
| Focus ring (3px solid, 2px offset) | dark ink `rgb(30,43,34)` | white `rgb(255,255,255)` on `#0a0a0a` |

Screenshots: `switch_focus_cute_1280.png`, `switch_focus_quiet_1280.png`, and the 390 versions. The ring is visible and not clipped in both.

The switch is 69px wide in quiet and 86px in cute, so its own box changes size on toggle (see O7).

Open items about reaching the switch are O2 and O3 below.

## 6. Keyboard flow in quiet mode

54 of 54 checks pass at 1280 and 390:

- Focus starts inside the window on all six window types (experience, work, role, letters, letter, 404).
- Tab (16 presses) and Shift+Tab (5 presses) never leave the window.
- Escape closes to `/` and the theme stays quiet.
- Opening Letters from the menu bar by Enter, then Escape, returns focus to the menu bar link.
- Opening Experience from the home card button, then Escape, returns focus to that button (T22 fix A1 still holds).
- Back button: letter to inbox to home, one step each; the theme stays quiet.
- Back and Close controls: role Back goes to `/experience`; Close goes to `/`.
- Outside click on a desktop window closes it (at 390 there is no outside; the sheet is full screen).

## 7. Decoration in quiet mode

Scanned all 30 combinations for: visible `svg`, `img` or `canvas`; `background-image` other than flat fills; pseudo-element content; mask; non-hairline box shadows; and heart, sparkle or flower glyphs in the text. Screenshots reviewed by eye on home, experience, role, letters and letter.

- Bows, hearts, leaves, sparkles, lace, gingham and scallops: none render (the `svg` icon in the link directory buttons is a folder, envelope and document icon, which is content, not decoration).
- **Defect D1 (fixed):** the home card portrait was still heart-shaped in quiet (a grey heart outline with "[your photo]"). Fixed in `src/components/HomeCard.astro` (quiet rules only): `clip-path: none` plus token radii on `.heart-outer` and `.heart-inner`. The box stays 240 x 240px at all widths, so no layout moves (re-measured: still 240 x 240 in both themes). Cute still clips to the heart (checked).
- Solid-colour `linear-gradient(x, x)` fills and `0 0 0 1px` shadows are hairline borders and flat fills, not decoration.
- Design note, not a defect: the quiet backdrop is a faint dot grid (`#1f1f1f` on `#0a0a0a`). It is a pattern but is not in the forbidden list (bows, lace, gingham, hearts, sparkles). Owner can decide whether "no decoration" should include it.

## Open items

| ID | Address | Theme | Width | Issue | Screenshot |
| --- | --- | --- | --- | --- | --- |
| O1 | `/` and every window | both (cute 822px wide, quiet 829px wide) | 701 to about 850 (tested 768) | The menu bar content is wider than the screen, so the clock is cut off at the right edge (shows "2:1"). It is already so in cute; quiet's wider mono type makes it 7px worse. Not fixed here: the base menu bar rules are cute-theme code. Suggested fix: hide the clock or the résumé label (as already done below 700px) up to about 860px. | `quiet_768_letters.png`, `cute_768_home.png`, `quiet_768_home.png` |
| O2 | any window | both | 390 | The theme switch is under the full-screen sheet, so it cannot be tapped while a window is open. A visitor must close the window first, then switch. Not a quiet-only issue; it follows the design (the sheet covers the menu bar). | `quiet_390_exp.png`, `cute_390_exp.png` |
| O3 | any window | both | 1280 and 768 (mouse works; keyboard does not) | The switch is not reachable by Tab while a window is open (the Tab trap stays inside the window, 30 presses tested), although it is visible and clickable on desktop. Keyboard users must press Escape first. Consistent with the modal pattern, but worth a decision: add the switch to the window, or accept. | `quiet_1280_exp.png` |
| O5 | `/experience`, `/experience/work` | quiet vs cute | 1280 | Window is 13px taller in quiet and moves up 6.5px on toggle. | `cute_1280_exp.png`, `quiet_1280_exp.png`, `cute_1280_work.png`, `quiet_1280_work.png` |
| O6 | `/letters/sample-letter-one` | quiet vs cute | 768 and 1280 | Window is 46px (1280) or 73px (768) taller in quiet and moves up 23px or 37px on toggle. | `cute_768_letter.png`, `quiet_768_letter.png`, `cute_1280_letter.png`, `quiet_1280_letter.png` |
| O7 | every address | quiet vs cute | 390 (explorer), 1280, 768 (menu bar) | Explorer toolbar grows from 114 to 166px (+52px for the preview below) at 390; sheets, inbox and previews reflow taller in quiet; menu bar controls right of the nav list shift sideways up to 17px (switch 86 to 69px). | `cute_390_exp.png`, `quiet_390_exp.png`, `cute_1280_home.png`, `quiet_1280_home.png` |
| O4 | `/` | quiet | 1280 | Design note only: the dot-grid backdrop (see section 7). | `quiet_1280_home.png` |

Non-issues recorded for completeness:

- With storage blocked, the choice cannot survive a reload (section 2). This is the correct fallback.
- Quiet hairline borders (`#2b2b2b` on `#0a0a0a`, about 1.4:1) are lower than the 3:1 that WCAG 1.4.11 asks of UI boundaries, but every control also has a text label and a 3px white focus ring, so no control is identified by its border alone. Flagged in case the owner prefers a lighter line token.

## Files changed

- `src/components/HomeCard.astro` (quiet rules only: portrait no longer heart-shaped)
- `docs/quiet-qa-report.md`, `docs/t20-screenshots/` (new)

The test scripts live in the session scratchpad, not in the repo.

## Hand-off checks

- `npm run build`: 19 pages built, no errors.
- `npm run lint`: no errors or warnings.
- `npm run check`: 47 files, 0 errors, 0 warnings, 0 hints.
- `prettier --check src/components/HomeCard.astro`: passes.
