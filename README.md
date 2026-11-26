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

## Love letters (`/loveletters`)

A public page with one key field. Each friend has their own key, and their key decrypts their letter in the browser. The repo is public, so readable letters and keys never get committed. Only encrypted files do.

1. Write one Markdown file per friend in `private/loveletters/`. This folder is gitignored and exists only on this machine, so back it up somewhere private.

   ```md
   ---
   to: bestie # shown as "dear bestie,"
   key: pick something only you two know
   date: 2026-11-26 # optional
   draft: true # optional; skipped when sealing
   ---

   The letter, in Markdown.
   ```

2. Run `npm run seal`. It rebuilds `public/loveletters/sealed/` from scratch, with one encrypted `<id>.json` per letter.
3. Commit `public/loveletters/sealed/` and push.

Keys:

- Keys ignore case and extra spaces, so `Tulip  Ribbon` and `tulip ribbon` are the same key.
- A key must be at least 12 characters, and every letter needs a different key. The seal script refuses anything else.
- The encrypted files are public, so a weak key can be guessed offline. Use a few unrelated words or a phrase only you two would know, not a name or birthday.
- To send a link that opens the letter at once, use `https://aadhyapa.com/loveletters#k=<key>`, replacing spaces with `%20`. Browsers don't send the part after `#` to the server.
- Changing a key or editing a letter means running `npm run seal` again and pushing. Old encrypted versions stay in git history, so a leaked key still opens the version it was sealed with.

The crypto settings (PBKDF2-SHA256 with 600k iterations, then AES-256-GCM) are defined in both `scripts/seal-loveletters.mjs` and `src/scripts/loveletters.ts`, and the two must match.

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
