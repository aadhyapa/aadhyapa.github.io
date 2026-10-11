# Cyber OS Portfolio: Dev Plan

Oct 10, 2026 · @aadhya

## Goals and scope

Build a fast, static one-page site in roughly eight part-time weeks (an estimate, adjust to your hours): a green and pink cyber OS desktop where every page opens as a popup window over the same background. Once the cute theme is finished and checked, add a black minimal quiet mode a visitor can switch to.

- **Audience:** hiring managers and clients who want to see how you work, plus readers who enjoy your writing.
- **Core promise:** NDA work told honestly as written case studies, with no demos for now and no client detail.
- **Look:** a green and pink cyber OS with gingham wallpaper, lace edges, black and pink bows, pixel hearts and chunky window frames. Dark green outlines and white window bodies do the reading work, so it stays professional. Quiet mode is the second skin, added after the cute theme is done: black, hairline borders, monospace type and no decoration, for visitors who want the content without the ribbons.
- **Structure:** one home backdrop that never changes. About, Experience and Letters open as popup windows on top of it, each with its own web address.
- **Done means:** every window live on your own domain, passing accessibility and speed checks on desktop and phone, and a new letter publishable by adding one text file.
- **Out of scope for v1:** comments, accounts, a CMS dashboard, draggable or stackable windows, and a separate mobile design. Demos are out for now; they can return later as their own section without touching the window shell. Phones get the same windows as full-screen sheets.

## Site map and windows

Three nav items (About, Experience, Letters) over one home backdrop. Work and Projects are merged into Experience, and Little Things is dropped. Every window has a real address, so links, the back button and search all work.

| Address | Window | Main components | Mockup status |
| --- | --- | --- | --- |
| / | None, backdrop only | Menu bar, home card with heart-frame portrait, status tiles, link directory, three side widgets | Mocked |
| /about | about\_me.txt | Taped photo, "dear visitor" letter, quick facts, things I love, contact line | Mocked |
| /experience | experience | All, work and projects tabs, list, preview pane, résumé button | Mocked |
| /experience/(role) | experience / role | What I did, stack, What I learned, link to a letter | Mocked |
| /experience/(project) | experience / project | NDA note, problem, what I made, what I would change, stack and timeline | Mocked |
| /letters | letters | Category tabs, inbox list with date and reading time | Mocked |
| /letters/(letter) | letters / title | Long-read body and sign-off | Mocked |
| /404 | error.exe | Friendly error window with a link home | Not mocked |
| /resume.pdf | None | Static file linked from the menu bar, home card and Experience | File needed |

**Window rules.** These make the popup pattern behave like a real website:

- Opening a window changes the address, closing it returns to the home address, and the back button steps back one window.
- The backdrop never reloads between windows; only the window changes.
- Opening a window moves keyboard focus into it, and closing returns focus to the link that opened it. Escape and a click outside both close it, and Tab stays inside while it is open.
- Detail pages (a role, a project, a letter) open inside the same window, with a back button in the title bar.
- Every address also works on its own: a direct visit, a search result or a shared link shows the backdrop with that window already open, and the window text is real HTML, not loaded after a click.
- Below about 700px wide the window becomes a full-screen sheet and the side widgets hide.
- With reduced motion on, windows appear without animation. The theme switch in the menu bar changes only colors, type and decoration, never layout or content; the choice is saved in the browser and applied before first paint, so there is no flash.

## Tech stack

Use Astro for a static site, with Markdown files for Experience and Letters. Astro's view transitions keep the backdrop in place while only the window changes, and every address still loads as plain HTML. The only scripts are the window shell and the theme switch; there is no React.

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | Astro, static output | Pages are real HTML at real addresses, with almost no JavaScript by default |
| Window switching | Astro view transitions, with the backdrop kept in place | Only the window swaps; the menu bar and home card never reload. Without JavaScript each address still loads in full |
| Window behavior | One small script in the window shell | Handles focus, Escape, outside click and returning focus once, for every window |
| Styling | Plain CSS with custom properties | Gingham, lace and scallops are gradients; no UI kit to fight |
| Decoration | Inline SVG components: bows, pixel hearts, leaves, sparkles | Crisp at any size, recolored from tokens, no image requests |
| Experience and letters | Two Markdown content collections | Experience entries carry a kind (work or project), dates, summary, what I did and what I learned; letters carry category and date. Reading time and an RSS feed are generated |
| Theme switch | A data-theme attribute on the root element, saved in localStorage | Both skins share the same HTML and swap only CSS tokens. A tiny inline script in the head sets the theme before first paint |
| Quiet mode | A second token set plus a small override stylesheet | Decorative components hide themselves under quiet mode, so no page needs a second version |
| Fonts | Self-hosted Bagel Fat One, Quicksand, Silkscreen, La Belle Aurore; quiet mode adds IBM Plex Mono | Faster than a font CDN and no third-party request |
| Images | Astro image optimization, WebP or AVIF | Keeps the portrait and thumbnails light |
| Hosting | Cloudflare Pages, Netlify or Vercel free tier | Deploys on every push to the main branch; any of the three works |

Skip a CMS dashboard for v1. Files in git are enough for one author, and you can add a CMS later without changing the pages.

## Design system

Turn the mockup's colors, type and shapes into CSS custom properties first, so every page pulls from one source and the accent can change in one line.

| Token | Value | Use |
| --- | --- | --- |
| Ink | #1E2B22 | Outlines, hard shadows, label text |
| Text | #2C3A31 | Body text |
| White | #FFFFFF | Window bodies |
| Pink | #FF9CCB | Title bars, buttons, active highlights |
| Pink light | #FFD6EA | Soft fills, selected rows, inactive tabs |
| Blush | #FFEAF4 | Toolbar and panel backgrounds |
| Lace | #FFC4E0 | Scalloped lace edges and dashed dividers, decoration only |
| Green | #8FD3A0 | Title bars, status dots, project accents |
| Mint | #CDEFD6 | Tags, soft cards, wallpaper |
| Deep green | #1F6B49 | Link text on white |
| Raspberry | #B0145A | Handwriting accent text |

**Type.** Bagel Fat One for the name and page titles; Quicksand (500 and 700, 16 to 17px) for body text; Silkscreen for title bars, ribbon labels and small tags; La Belle Aurore for handwriting accents such as "dear visitor" and sign-offs. Use Silkscreen and handwriting for short phrases only, never for paragraphs.

**Shapes and details.** Dark 2.5px outlines with hard offset shadows, 14 to 16px window corners, pill buttons, scalloped lace edges made with radial gradients, gingham from two crossed gradients, black ribbon labels with swallowtail ends, and black or pink bows. The mockups blend three sources: pixel-OS windows, a gingham scrapbook card and black-and-white lace. Use one or two per window so the content stays readable.

**Accessibility rules.**

- Body text on white must reach 4.5:1 contrast. Check deep green and raspberry on white, and ink on pink, with a contrast checker before locking the tokens.
- Never set text in lace pink; it is decoration only.
- Silkscreen is hard to read below 12px. The mockups use 10 to 11px for small labels, so raise them to 12px or more, or keep them decorative.
- Each window is a dialog with a name, a visible close button and a visible focus ring in ink. The mockup's menu and title-bar buttons are about 26 to 30px tall, so enlarge the tap area to 44px.
- Mark decorative bows, hearts and sparkles `aria-hidden`; label the theme switch with text, not only an icon.
- Respect reduced-motion settings for window and hover animations.

**Quiet mode tokens.** A second set of the same custom properties, switched by a data-theme attribute. It uses hairline borders, no hard shadows and no bows, lace, gingham or hearts. Type is IBM Plex Mono for everything, with Silkscreen kept for small labels and window title bars at 11 to 12px.

| Token | Value | Use |
| --- | --- | --- |
| Background | #0A0A0A | Page, with a faint dot grid |
| Surface | #111111 | Windows and panels |
| Line | #2B2B2B | Hairline borders and dividers |
| Text | #EDEDED | Body text |
| Muted | #A3A3A3 | Labels, dates, secondary text |
| White | #FFFFFF | Name, headings, hover and focus ring |

Text on the background should measure well above 4.5:1; confirm Muted with a contrast checker before locking the tokens. Under quiet mode, decorative SVG components render nothing, so each page keeps one HTML structure. Quiet mode could be the default on small screens, with the cute theme one tap away.

## Build phases

Eight weeks in five phases, with a review gate before work moves on. The week counts are estimates for part-time work.

&#91;embedded content: build roadmap · 5 phases, 3 gates\]

The gates catch the two costliest late surprises: a window pattern that breaks for keyboard, back-button or phone users, and a case study that edges toward confidential work. Windows and case studies run side by side in weeks 3 to 5. Quiet mode waits until the cute theme is built and has passed its accessibility audit, then runs in weeks 6 to 7.

## Projects (no demos)

Write each NDA project as a case study with no demo for now: the problem, what you made and what you would change, told without client names, real numbers or screenshots. The mockup shows three: Fulfillment Dashboard, Onboarding Flow and Signal Study.

1. **Check your agreement first.** Read your NDA or employment contract for what counts as confidential. I am not a lawyer, so if a piece feels close to the line, ask the company for written permission or leave it out.
2. **Describe, don't copy.** Write fresh prose. Do not reuse source files, screenshots, brand assets, internal terminology or proprietary logic.
3. **Lead with the engineering.** For backend and ML roles, the reader wants the problem, the design choices, the trade-offs and what you would change. Say what you can honestly say about scale, latency or model quality in generic terms, and nothing you were told to keep private.
4. **Say plainly what you can't show.** Every project carries one short NDA note near the top, in place of a demo.
5. **Use one window template.** The NDA note, the problem, what I made, what I would change, then stack and timeline. Keep outcomes to what you are allowed to share.
6. **Keep the door open for demos.** If you later build a public side project, it can get its own section without changing the window shell.

## Content checklist

Every bracket in the mockup is something to write or gather. Finish these before the final polish pass so layouts are tested with real words.

- [ ] Name, role, city, pronouns and the one-line pitch for the home card
- [ ] Portrait or illustration cropped to the heart frame, plus a photo for About
- [ ] About text: a "dear visitor" letter of two short paragraphs, four quick facts and five things you love
- [ ] The four status tiles (open to, building, reading, listening) and the three side-widget lines
- [ ] Two or three roles for Experience: what you did, your stack, and three lessons each for "What I learned"
- [ ] Three projects: problem, what you made, what you would change, stack, timeline
- [ ] A one-line NDA note for each project: what you cannot show
- [ ] Three starter letters, plus your category names
- [ ] Email address, LinkedIn, GitHub and a résumé PDF
- [ ] Favicon (the bow works), social share image, and a page title and description per window
- [ ] Footer line and a short note on NDA work

## Launch and after

Launch on your own domain once the checks below pass, then keep upkeep small enough to survive a busy month.

**Before launch**

- [ ] Buy the domain, point DNS at your host, and confirm HTTPS works
- [ ] Search every window for leftover \[brackets\] and placeholder text
- [ ] Run Lighthouse on each address; aim for 90 or higher in performance and accessibility
- [ ] Walk every window with the keyboard only: open it, tab around, press Escape, and confirm focus returns to the link that opened it. Spot-check one window with a screen reader
- [ ] Check contrast, 200% zoom, and phone, tablet and laptop widths, including the full-screen sheet on a phone
- [ ] Switch themes on every window: contrast in both, a saved choice after reload, no flash on first load, and the switch usable by keyboard
- [ ] Test every link, each address opened directly in a fresh tab, the back button, the contact email, the résumé download and the RSS feed
- [ ] Add titles, descriptions, a sitemap and a social share image
- [ ] Ask one trusted person to read the project windows for anything that sounds confidential

**After launch**

- Publish a letter on a rhythm you can keep, even if it is one a month.
- Review project pages every six months and retire any case study you no longer stand behind.
- Update dependencies monthly and re-run Lighthouse after bigger changes.
