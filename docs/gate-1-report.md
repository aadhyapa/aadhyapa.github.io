# Gate 1 report: window shell and mobile layout

Date: 2026-10-11 · Branch: task/T8-mobile · Tested on the production build (`astro preview`) with Playwright Chromium.
Windows tested: `/about` (about_me.txt) and `/dev/window-2` (second placeholder window with a back button to `/about`).
Screenshots: `docs/gate-1-screenshots/` (390, 768 and 1280px for `/`, `/about`, `/dev/window-2`; plus `390_nojs_about.png`).

| # | Check | Result |
|---|-------|--------|
| 1 | Open `/about` by keyboard (Enter on menu link); focus moves into the window (1280, 390) | PASS |
| 2 | Tab stays inside the window (8 presses) | PASS |
| 3 | Escape closes to `/` and focus returns to the About link | PASS |
| 4 | Close button works by keyboard | PASS |
| 5 | Backdrop is not reloaded when a window opens | PASS |
| 6 | Title-bar Back button on the second window goes to `/about` | PASS |
| 7 | Browser back steps back one window | PASS |
| 8 | Direct visit: `/about` and `/dev/window-2` return the backdrop and window text as real HTML | PASS |
| 9 | JavaScript off: window shows; close, menu and back links all work as plain links | PASS |
| 10 | 390px: no horizontal scroll on `/`, `/about`, `/dev/window-2` | PASS |
| 11 | 768px: no horizontal scroll on all three | PASS |
| 12 | 1280px: no horizontal scroll on all three | PASS |
| 13 | 390px: window is a full-screen sheet; body scrolls inside it, the page does not | PASS |
| 14 | 390px: close and back stay visible after scrolling the body to the end | PASS |
| 15 | 390px: menu bar fits one row; side widgets hidden; home card stacked | PASS |
| 16 | Touch targets at least 44px tall: all links and buttons at 390 and 768 (touch) | PASS |
| 17 | Touch targets at 1280 with a mouse pointer | NOTE |

**Note on 17.** At 1280px with a mouse, inline prose links inside a window body are 21px tall (the placeholder link in `/about`, the "Back to about" link in `/dev/window-2`). Menu bar, title-bar buttons, status tiles and sticker buttons are all 44px or more. Inline links in paragraphs are exempt under WCAG 2.5.8, and enlarging them on desktop would change the desktop text flow, so the 44px rule applies on phones and on any `pointer: coarse` device only. Decide if you want it forced on desktop too.

**Phone menu bar.** At 390px the brand text, résumé text and clock are visually hidden (brand and résumé keep accessible names; the clock is dropped). The résumé link stays as a 44px "↓" button.
