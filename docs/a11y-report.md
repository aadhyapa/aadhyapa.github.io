# T22 accessibility report

Date: 2026-10-11 · Branch: `task/T22-a11y` · Theme: cute only (quiet mode does not exist yet).
Tested on the production build (`npm run build`, `astro preview`) with Playwright 1.58 Chromium and axe-core, at 1280px and 390px.
Screenshots with the focus ring showing: `docs/t22-screenshots/` (`390_*` and `1280_*` for home, experience, role, project, letters, letter, 404).

## Addresses scanned

`/about` was removed from the site in commit 975fef1 ("removing about section"), so it returns the 404 page. It was scanned as a 404 and is not a separate window.

Role = `/experience/qa-engineer-intern-hudl`, project = `/experience/ai-mock-interview-platform`, letter = `/letters/sample-letter-one`, category = `/letters/category/making`.

## 1. Automated scan (axe-core, tags wcag2a, wcag2aa, wcag21aa, wcag22aa, best-practice)

| Address | 1280px | 390px |
| --- | --- | --- |
| `/` | 0 | 0 |
| `/about` (404) | 0 | 0 |
| `/experience` | 0 | 0 |
| `/experience/work` | 0 | 0 |
| `/experience/projects` | 0 | 0 |
| role | 0 | 0 |
| project | 0 | 0 |
| `/letters` | 0 | 0 |
| letter | 0 | 0 |
| letters category | 0 | 0 |
| 404 (`/nope`) | 0 | 0 |

No violations of any impact, before or after the fixes below.

axe "incomplete" items (cannot be decided by a script), and how each was resolved:

- `color-contrast` on text over gradients, gingham, or overlapped by decoration: checked by pixel instead (section 4).
- `label-content-name-mismatch` on the title-bar buttons: Close has `aria-label="Close window"` and a visible `×` that is `aria-hidden`; Back has visible text "Back". Fine.
- `bypass` on `/letters` and the category page: no skip link. Not a defect here: a modal window is the only content while it is open, and the menu bar is three links. Left as is.

## 2. Keyboard walk (1280px, keyboard only, Playwright)

| Check | Result |
| --- | --- |
| Menu bar Experience and Letters open their window with Enter; focus moves into the window | PASS |
| Tab and Shift+Tab stay inside the window (14 Tab and 4 Shift+Tab presses on each window, 0 escapes) | PASS on all 8 windows |
| Escape closes to `/` and focus returns to the opener (menu bar links) | PASS |
| Escape after opening from a home card button returns to that button | FAIL before fix, PASS after (issue A1) |
| Close button by keyboard, outside click, Escape on a directly visited window | PASS (focus lands on the matching menu bar link) |
| Experience list: Enter on a row selects it and updates the preview; the preview "details" button opens the role or project | PASS |
| Role and project windows: Back goes to `/experience` and focus stays in the window | PASS |
| Letter window: Back goes to `/letters` and focus stays in the window | PASS |
| Browser back steps one window at a time (letter to inbox to home; role to list to home) | PASS |
| 404 window: focus enters, Tab stays inside, Escape goes home | PASS |

Detail windows: Escape on a role, project or letter closes to `/` (their close address), not to the list. This is the documented `closeHref`; Back is the one-step-up control.

## 3. Screen reader

VoiceOver with Safari could not be run: this was an automated session with no way to drive VoiceOver. Substitute: the accessibility tree of `/letters/sample-letter-one` from Playwright's `ariaSnapshot`. It shows `dialog "letters / Sample: Notes on small things"`, with a Back link, a Close window link, and a named region holding the article with one level 1 heading and a level 2 heading. The clock is a plain `time` element (not a live region), so it is not announced repeatedly. **Open item O1: the owner should do a real VoiceOver pass on one window.**

## 4. Contrast

- `node scripts/contrast.mjs`: all 16 token pairings pass (lowest 5.19:1). Unchanged.
- Text that axe could not decide (gradients, gingham, overlaps): 95 text elements across 8 addresses and 2 widths, measured against the real rendered background pixels with the text hidden. All real windows, menu bar and home text are at or above 4.5:1 after fix A2. Details:
  - Before the fix, "hi, i'm" on the home card (raspberry on the darkest gingham squares) measured 4.48:1.
  - What remains under 4.5 in the measurement are not real: the decorative backdrop widgets (`note.txt`, `loading.exe`, thank-you note), which are inert and sit behind the dim overlay, and menu bar links at 390px that the full-screen sheet covers.
- Lace (`#ffc4e0`) stays decoration only.

## 5. Other checks

| Check | Result |
| --- | --- |
| Silkscreen text under 12px (every visible text node, 10 addresses, 2 widths) | None. Smallest is `--text-xs` = 12px |
| Menu bar and title-bar buttons at least 44px (390px touch and 1280px) | PASS, no interactive element on any address is under 44px |
| Focus ring: 160 Tab stops across 8 addresses, `:focus-visible` outline 3px solid ink (`rgb(30,43,34)`) on every one; no ring clipped in screenshots | PASS |
| Reduced motion: `window-open` animation is 0.16s normally and is `none` / 0.01ms with reduce; no running animations on windows | PASS |
| Clock: `time` element, no `aria-live`; not announced every minute | PASS |
| Decorative SVG and fake window controls `aria-hidden` | PASS (backdrop is `aria-hidden`) |

## 6. Issues

| ID | Issue | Status |
| --- | --- | --- |
| A1 | Opening a window from a home card button, then Escape, moved focus to the menu bar link with the same address instead of back to the button. `restoreFocus()` looked up the first `a[href]` match, and the menu bar comes first. | **Fixed** in `src/scripts/window.ts`: remembers the opener's position among links with the same address and restores that one. |
| A2 | "hi, i'm" (raspberry, 28px) on the home card was 4.48:1 on the darkest gingham squares. | **Fixed** in `src/components/HomeCard.astro`: the card's `--gingham-strength` is 34% instead of 38%. Checks are very slightly paler; now above 4.5:1. |
| O1 | No real VoiceOver pass. | Open (owner) |
| O2 | The side widgets (note.txt, loading.exe, thank-you) are exposed as three `complementary` landmarks with placeholder text on the home page. Not a failure, but screen reader users hear placeholder copy; decide whether they should be `aria-hidden` or stay as content. | Open (design decision) |
| O3 | Each window's dialog and its scroll region share the same accessible name, so it may be announced twice. The region has `tabindex="0"` so the body scrolls by keyboard, which is wanted. | Open, minor |
| O4 | On the first paint and with JavaScript off, the clock reads `--:-- --` until the script runs. | Open, minor |
| O5 | Inline prose links on desktop are under 44px tall (gate 1, note 17). No inline links currently exist in a window body, so nothing is below 44px today. | Open (carry over from gate 1) |
| O6 | `npm run format:check` already warns on `src/components/experience/Explorer.astro` and `src/pages/404.astro` on main. Not touched (not accessibility). | Open |
| O7 | The Window.astro edit sitting uncommitted in the shared checkout (gingham detail bodies fill the sheet) belongs to another task. It is not in this branch and was not scanned. | Open |

## Files changed

- `src/scripts/window.ts` (A1)
- `src/components/HomeCard.astro` (A2)
- `docs/a11y-report.md`, `docs/t22-screenshots/` (new)
