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
├── public/             static files (favicon, resume.pdf placeholder)
└── src/
    ├── layouts/        Layout.astro: persistent backdrop + view transitions
    └── pages/          one file per address
```

## 404 page

`src/pages/404.astro` builds to `dist/404.html`, the error.exe window with a link home. Cloudflare Pages, Netlify and Vercel all serve a root `404.html` from a static site for any unknown address, with a real 404 status, so no host config is needed. After the first deploy, check with `curl -I https://<site>/no-such-page` and expect `HTTP/... 404`. Locally, `npm run preview` does the same.

## Résumé

`public/resume.pdf` is a placeholder (one page reading "Placeholder résumé, replace with the real file"). Replace it with the real file under the same name; the menu bar, home card and experience window all link to `/resume.pdf`.

## Docs

- [Dev plan](docs/Cyber%20OS%20Portfolio%20Dev%20Plan.md)
- [Agent tasks](docs/Agent%20tasks.md)
