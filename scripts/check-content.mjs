// Content guard for the built site. Runs over dist/**/*.html when CHECK_CONTENT=1.
// Flags: [bracket] placeholders in visible text, broken internal links, bad mailto links.
// Usage: CHECK_CONTENT=1 node scripts/check-content.mjs [distDir]
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import process from 'node:process';
import { Console } from 'node:console';

const console = new Console(process.stdout, process.stderr);
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// Files that must exist in dist even if no page links to them.
const REQUIRED = ['/Aadhya_Pandillapally_Resume.pdf'];

// Replace a range with spaces, keeping newlines so line numbers survive.
const blank = (s) => s.replace(/[^\n]/g, ' ');

const walk = (dir) =>
	readdirSync(dir).flatMap((name) => {
		const p = join(dir, name);
		return statSync(p).isDirectory() ? walk(p) : [p];
	});

const lineCol = (src, index) => {
	const before = src.slice(0, index);
	const line = before.split('\n').length;
	return { line, col: index - before.lastIndexOf('\n') };
};

const TAG = /<(?:[^>"']|"[^"]*"|'[^']*')*>/g;
const PLACEHOLDER = /\[[^[\]]{1,80}\]/g;

function resolves(dist, urlPath) {
	let path;
	try {
		path = decodeURIComponent(urlPath);
	} catch {
		return false;
	}
	const base = join(dist, path);
	const isFile = (p) => existsSync(p) && statSync(p).isFile();
	if (path.endsWith('/')) return isFile(join(base, 'index.html'));
	return (
		isFile(base) || isFile(`${base}.html`) || isFile(join(base, 'index.html'))
	);
}

export function checkDist(dist) {
	const problems = [];
	const files = walk(dist).filter(
		(f) =>
			f.endsWith('.html') &&
			!relative(dist, f).split(/[\\/]/).join('/').startsWith('dev/'),
	);

	for (const file of files) {
		const rel = relative(root, file);
		const add = (src, index, kind, text) => {
			const { line, col } = lineCol(src, index);
			problems.push(`${rel}:${line}:${col}  ${kind}: ${text}`);
		};

		// Comments gone; script/style bodies gone (their opening tags stay for src/href).
		const markup = readFileSync(file, 'utf8')
			.replace(/<!--[\s\S]*?-->/g, blank)
			.replace(
				/(<(script|style)\b[^>]*>)([\s\S]*?)(<\/\2>)/gi,
				(_, open, _n, body, close) => open + blank(body) + close,
			);

		// Visible text: also drop <code>/<pre>, then every tag (so attributes never count).
		const text = markup
			.replace(/<(code|pre)\b[^>]*>[\s\S]*?<\/\1>/gi, (m) => blank(m))
			.replace(TAG, blank)
			// markdown links [label](url) are legitimate brackets
			.replace(/\[[^[\]]*\]\([^)]*\)/g, blank);
		for (const m of text.matchAll(PLACEHOLDER)) {
			add(text, m.index, 'placeholder', m[0].replace(/\s+/g, ' '));
		}

		for (const tag of markup.matchAll(TAG)) {
			for (const a of tag[0].matchAll(
				/\s(href|src)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi,
			)) {
				const value = (a[2] ?? a[3] ?? a[4] ?? '').trim();
				const at = tag.index + a.index;
				if (/^mailto:/i.test(value)) {
					const addr = value.slice(7).split('?')[0];
					let decoded = addr;
					try {
						decoded = decodeURIComponent(addr);
					} catch {
						// keep raw value
					}
					const bad =
						!decoded.trim() ||
						decoded.split(',').some((x) => !x.trim() || /[[\]]/.test(x));
					if (bad) add(markup, at, 'bad mailto', value);
				} else if (value.startsWith('/') && !value.startsWith('//')) {
					const urlPath = value.split('#')[0].split('?')[0] || '/';
					if (!resolves(dist, urlPath)) {
						add(markup, at, 'broken link', `${a[1]}="${value}"`);
					}
				}
			}
		}
	}

	for (const req of REQUIRED) {
		if (!resolves(dist, req)) {
			problems.push(`${relative(root, dist)}  missing required file: ${req}`);
		}
	}
	return { problems, pages: files.length };
}

const isMain =
	process.argv[1] &&
	resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain && process.env.CHECK_CONTENT === '1') {
	const dist = resolve(process.argv[2] ?? join(root, 'dist'));
	if (!existsSync(dist)) {
		console.error(`check-content: ${dist} not found. Run astro build first.`);
		process.exit(1);
	}
	const { problems, pages } = checkDist(dist);
	if (problems.length) {
		console.error(
			`check-content: ${problems.length} problem(s) in ${pages} page(s)\n\n` +
				problems.map((p) => `  ${p}`).join('\n') +
				'\n',
		);
		process.exit(1);
	}
	console.log(`check-content: ok (${pages} pages)`);
}
