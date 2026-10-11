# Agent task breakdown

29 tasks in six waves for the single-page cyber OS site. Tasks inside a wave can run in parallel once the tasks they depend on are done. Work and Projects are already merged into Experience, so that choice no longer blocks anything.

## How to run this

Dispatch Wave 1 first; each later wave unlocks as its dependencies finish. The critical path is T1, T2, T3, the window shell (T6), the Experience window (T11), then QA. Every agent should be given the Cyber OS mockup boards ([Coquette Portfolio Mockups](https://claude.ai/artifact/5i57sRfjhcr8E8XcPNGZ23)) and the plan in Coquette Portfolio: Dev Plan.

**Decide first (you, not an agent)**

- [ ] **D1:** hosting provider; blocks T4
- [ ] **D2:** domain name; blocks T28
- [ ] **D3:** which three projects are safe to rebuild after checking your NDA; gates the real content in T9 and T16 to T20
- [ ] **D4:** name, role, city, portrait and bio; needed by T27, placeholders are fine until then
- [ ] **D5:** whether windows should be draggable in v1; the plan assumes no, so this blocks nothing

**Rules every agent follows**

- Touch only the files your task owns; list anything else as a follow-up instead of fixing it.
- Use values from the design tokens (T2) only; never hard-code a color, font or radius.
- Open every page through the window shell (T6); do not build one-off popups.
- Never use real client names, data, screenshots or code. There are no demos for now; project windows are written case studies with an NDA note. Every component uses theme tokens, never raw colors, so quiet mode works everywhere.
- Run build, lint and type check before handing off, and include the output.
- Keep decorative SVG `aria-hidden` and every interactive element reachable by keyboard, including closing a window with Escape.
- Work on one branch per task, named `task/T<number>-<slug>`.
- If the done-when check cannot be met, stop and report why instead of loosening it.

## Wave 1: Foundation

Four tasks that set up the project. T3 can start once T2 is done; T4 can start as soon as T1 and D1 are done.

| ID | Task | Agent role | Depends on | Done when | Status |
| --- | --- | --- | --- | --- | --- |
| T1 | Scaffold the Astro project: repo, dev, build and preview scripts, lint and format, view transitions switched on, README with commands | Scaffold agent | None | `npm run build` passes on an empty site; moving between two test routes does not reload the page; README lists every command | Not started |
| T2 | Design tokens and global CSS: the color tokens, type scale, spacing, radii and shadow as CSS custom properties; self-host Bagel Fat One, Quicksand, Silkscreen and La Belle Aurore; base reset and focus ring | Styles agent | T1 | Tokens match the plan's design system table; contrast report attached for deep green, raspberry and ink text on white and pink | Not started |
| T3 | Decor and UI kit: bow SVG (pink, black, green), pixel heart, leaf, sparkle, lace edge, gingham and scallop styles, ribbon label, sticker button, pill, status tile, pearl bullet, progress bar | Styles agent | T2 | Each part has a preview route; props documented; decorative SVG is `aria-hidden`; no hard-coded colors | Not started |
| T4 | Deployment pipeline: connect the repo to the chosen host, preview deploy per branch | Ops agent | T1, D1 | A pushed branch gets a preview URL; main deploys to the host's default domain | Not started |

## Wave 2: Shell and home

Four tasks that build the backdrop, the window shell and the home card. T5 comes first; T6 and T7 can run in parallel after it. T8 closes the wave and is the first gate: the window pattern must work by keyboard, with the back button, and on a phone before Wave 3 starts.

| ID | Task | Agent role | Depends on | Done when | Status |
| --- | --- | --- | --- | --- | --- |
| T5 | Backdrop and menu bar: gingham wallpaper, menu bar with About, Experience, Letters, résumé pill and live clock, three side widgets; kept in place between routes | Page agent | T2, T3 | Matches the mockup at 1280px; the active nav item is marked; nav is a real list of links; the clock updates without shifting the layout | Not started |
| T6 | Window shell: title bar with back and close buttons, scrolling body, lace edge and bow corners; opens over the backdrop at its own address; focus moves in, Tab stays inside, Escape and outside click close it, focus returns to the opener; works without JavaScript | Page agent | T3, T5 | Open, tab, close and back all work by keyboard; the back button steps one window; a direct visit shows the backdrop with the window open | Not started |
| T7 | Home card: lace frame, heart-frame portrait placeholder, name and pills, bio, four status tiles, link directory, icon strip | Page agent | T3, T5 | Matches the mockup at 1280px; link directory buttons are real links to the window addresses; copy keeps \[bracket\] placeholders | Not started |
| T8 | Mobile layout: below 700px the home card stacks, side widgets hide, the menu bar collapses, and windows become full-screen sheets; touch targets at least 44px | Page agent | T6, T7 | No horizontal scroll at 390px; the sheet scrolls inside itself; close and back stay reachable. Gate: the window shell is proven | Not started |

## Wave 3: Windows and content

Seven tasks that build the windows. T9 comes first; T10 to T15 can then run in parallel, since each needs only the window shell (T6) and the content models. Real content waits on D3.

| ID | Task | Agent role | Depends on | Done when | Status |
| --- | --- | --- | --- | --- | --- |
| T9 | Content models: an experience collection (kind work or project, title, organization, dates, summary, what I did, what I learned, stack, NDA-note field) and a letters collection (title, date, category, summary, draft flag); reading-time helper; sample entries | Content agent | T1, D3 | Build fails when a required field is missing; every project entry carries an NDA note; samples use invented names only and are marked as samples | Not started |
| T10 | About window: taped photo, "dear visitor" text, quick facts, things I love, contact line | Page agent | T6 | Matches the mockup; the text is real HTML; the contact line is a working mailto link | Not started |
| T11 | Experience window: all, work and projects tabs as links, list, preview pane, résumé button | Page agent | T6, T9 | Tabs work without JavaScript through their own addresses; picking a row updates the preview; the résumé button downloads the PDF | Not started |
| T12 | Role window: what I did, stack, numbered "What I learned" lessons, link to a letter | Page agent | T6, T9 | Renders from a work entry; opens inside the same window with a back button; the lessons are an ordered list | Not started |
| T13 | Letters window and feed: category tabs as links, inbox list with date and reading time, RSS feed | Page agent | T6, T9 | Filters work without JavaScript; an empty category shows a friendly message; the feed validates | Not started |
| T14 | Letter window: long-read type, sign-off, back to letters | Page agent | T6, T9 | Lines run 60 to 75 characters inside the window; headings nest correctly; the handwriting font appears only in the salutation and sign-off | Not started |
| T15 | 404 and résumé: an error.exe window for unknown addresses, and the résumé PDF served at /resume.pdf | Page agent | T6 | An unknown address shows the error window with a link home and a 404 status; the résumé link downloads a file (a placeholder until D4) | Not started |

## Wave 4: Case studies, then quiet mode

Five tasks. T16 builds the case-study window and runs alongside Wave 3. T17 to T20 add quiet mode and are held until the cute theme is built and has passed the accessibility audit (T22): T17 adds the theme layer, T18 and T19 skin the pages, and T20 checks both themes before launch.

| ID | Task | Agent role | Depends on | Done when | Status |
| --- | --- | --- | --- | --- | --- |
| T16 | Case-study window: NDA note, problem, what I made, what I would change, stack and timeline | Page agent | T6, T9 | Renders from a project entry; the NDA note sits above the problem; fits a window about 700px wide and the phone sheet | Not started |
| T17 | Theme layer: cute and quiet token sets under a data-theme attribute, a head script that applies the saved choice before first paint, and the switch in the menu bar | Scaffold agent | T22 | Both themes are token sets; the saved choice survives a reload with no flash; the switch has a text label and works by keyboard | Not started |
| T18 | Quiet skin for the backdrop, menu bar and home card: hairline borders, dot grid, left-aligned mono home, decorative components hidden | Page agent | T7, T17 | Matches the quiet home board; no bows, lace or gingham render; the switch sits in the menu bar | Not started |
| T19 | Quiet skin for every window: title bars, tabs, lists, case studies and letters, in IBM Plex Mono with small Silkscreen labels | Page agent | T11, T12, T14, T16, T17 | Matches the quiet boards for About, Experience, role, project and Letters; layout identical to the cute theme | Not started |
| T20 | Quiet-mode QA: both themes on every address at 390, 768 and 1280px, checking contrast, the saved choice and the first-load flash | QA agent | T18, T19 | Text at 4.5:1 or better in both themes; a reload keeps the choice; switching shifts no layout; open items listed in a report | Not started |

## Wave 5: Polish and QA

Six tasks that check and tighten the whole site. T24 can start early; T21 starts once the windows exist and unlocks T22 and T23; T26 needs the case-study window (T16) and is the second gate.

| ID | Task | Agent role | Depends on | Done when | Status |
| --- | --- | --- | --- | --- | --- |
| T21 | Responsive pass: screenshots of every address at 390, 768 and 1280px wide, then fix overflow, wrapping and sheet problems | QA agent | T8, T11, T12, T14, T16 | Screenshots saved in the repo; no horizontal scroll at any width; no clipped text | Not started |
| T22 | Accessibility audit and fixes: automated scan plus a keyboard-only and screen-reader walkthrough of every window, covering focus return, Escape and the back button; small Silkscreen labels checked | QA agent | T21 | No serious automated issues; every window operable by keyboard; all text at 4.5:1 contrast or better; open items listed in a report | Not started |
| T23 | Performance pass: image optimization, font subsetting, script budget for the window shell and theme switch | QA agent | T21 | Lighthouse performance 90 or higher on mobile for every address; the theme script stays small and inline | Not started |
| T24 | SEO and meta: unique title and description per address, social share image, sitemap, robots file, bow favicon | Page agent | T5 | The sitemap lists every address; the share image shows in a link-preview checker; no two addresses share a title | Not started |
| T25 | Placeholder and link guard: a build check that fails on leftover \[brackets\] and broken internal links, switched on by a flag so previews can keep placeholders | Scaffold agent | T10, T11, T13 | With the flag on, the build fails on a planted bracket and a planted broken link, and passes on clean content | Not started |
| T26 | NDA review: run a checklist over each project window for real names, assets, numbers or code that resemble the original, and write a report | Review agent, then you | T16, D3 | The report marks each project pass or fix; you sign off before launch | Not started |

## Wave 6: Launch

Three tasks that take the site live. T27 and T28 can run in parallel; T29 runs last. You do the domain purchase and any account logins yourself; agents only prepare and verify.

| ID | Task | Agent role | Depends on | Done when | Status |
| --- | --- | --- | --- | --- | --- |
| T27 | Content merge: replace every placeholder with your real text, photos and links from the plan's content checklist | Content agent | D4, T26 | No \[brackets\] remain with the T25 flag on; you have approved the copy in every window | Not started |
| T28 | Domain and DNS: write step-by-step instructions for your host and registrar, then verify HTTPS and the www redirect after you buy and connect the domain | Ops agent, with you | D2, T4 | The site loads over HTTPS on your domain; one address is the main one and the other redirects to it | Not started |
| T29 | Launch QA: run the plan's pre-launch checklist on the production site, including each window opened directly, and write a go or no-go report | QA agent | T20, T22, T23, T24, T25, T27, T28 | Every checklist item is ticked or has a noted exception; the go or no-go decision is recorded | Not started |

## Handoff brief

Paste this into each agent's instructions and fill the angle-bracket fields from that task's table row. Every agent starts with no memory of this project, so the brief must stand on its own.

```markdown
Task: T<number> <title>
Project: personal portfolio site, Astro static site, green and pink cyber OS design: one persistent home backdrop, pages open as popup windows
Read first: the Cyber OS mockup boards and the Dev Plan tab
Your files: <the folders or files this task owns>
Already done (you depend on these): <task IDs and where their output lives>
Do: <the task cell from the table>
Done when: <the done-when cell from the table>
Rules: design tokens only; every page opens through the window shell; no real client data, names or code; every interactive element works by keyboard; run build, lint and type check before handing off
Report back with: the list of files changed, build and lint output, screenshots at 390px and 1280px wide if the task is a window or page, and any follow-ups you found but did not fix
```
