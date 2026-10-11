# my-coquette-life

Personal portfolio site: a green and pink cyber OS. One persistent home backdrop; pages open as popup windows at their own addresses. Built with Astro (static output) and view transitions.

Requires Node 22.12 or newer.

## Commands

Run all commands from the project root.

| Command                | Action                                                 |
| :--------------------- | :----------------------------------------------------- |
| `npm install`          | Install dependencies                                   |
| `npm run dev`          | Start the dev server at `localhost:4321`               |
| `npm run build`        | Build the production site to `./dist/`                 |
| `npm run preview`      | Serve the built site locally, before deploying         |
| `npm run check`        | Type check `.astro` and `.ts` files with `astro check` |
| `npm run lint`         | Lint with ESLint (TypeScript and Astro rules)          |
| `npm run format`       | Rewrite files with Prettier (Astro plugin)             |
| `npm run format:check` | Fail if any file is not Prettier-formatted             |
| `npm run astro ...`    | Run Astro CLI commands, e.g. `npm run astro -- --help` |

## Layout

```text
/
├── docs/               plan, task list and design
├── public/             static files (favicon, résumé PDF)
└── src/
    ├── layouts/        Layout.astro: persistent backdrop + view transitions
    └── pages/          one file per address
```

## Résumé and 404

- **Résumé:** The résumé is `public/Aadhya_Pandillapally_Resume.pdf`. To update it, replace that file, keeping the name, so the menu bar, home card and Experience buttons keep working.
- **404:** `src/pages/404.astro` builds to `dist/404.html`. The host must serve that file with a 404 status for unknown addresses. Host choice is still open, so no host config is included.

## Content guard

`scripts/check-content.mjs` scans `dist/**/*.html` (skipping `/dev/*`) and fails with `file:line:col` and the offending text for:

- leftover `[bracket]` placeholders in visible text (script, style, code, pre, attributes and `[label](url)` are ignored)
- internal `href`/`src` values starting with `/` that match no file in `dist`
- `mailto:` links with an empty or bracketed address
- a missing `/Aadhya_Pandillapally_Resume.pdf`

It is off by default, so previews can keep placeholders. Switch it on with `CHECK_CONTENT=1`:

- `npm run build:strict`: build, then check
- `npm run check:content`: check the existing `dist/`

`npm run build` never runs it. Sample inputs live in `scripts/fixtures/`, e.g. `npm run check:content -- scripts/fixtures/bracket`. Built HTML is minified, so line numbers are rough; use the column and the quoted text.

## Docs

- [Dev plan](docs/Cyber%20OS%20Portfolio%20Dev%20Plan.md)
- [Agent tasks](docs/Agent%20tasks.md)
