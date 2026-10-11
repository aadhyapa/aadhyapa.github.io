// WCAG 2.x contrast check for token pairings. Reads tokens.css so values stay in one place.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import process from 'node:process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const css = readFileSync(resolve(root, 'src/styles/tokens.css'), 'utf8');
const color = {};
for (const [, name, hex] of css.matchAll(
	/--color-([a-z-]+):\s*(#[0-9a-f]{6})/gi,
)) {
	color[name] = hex;
}

const lum = (hex) => {
	const [r, g, b] = [1, 3, 5].map((i) => {
		const c = parseInt(hex.slice(i, i + 2), 16) / 255;
		return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	});
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
	const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
	return (hi + 0.05) / (lo + 0.05);
};

// [foreground, background, use]
const pairs = [
	['text', 'white', 'body on window'],
	['text', 'blush', 'body on panel'],
	['text', 'mint', 'body on tag/card'],
	['text', 'pink-light', 'body on selected row'],
	['ink', 'white', 'label on window'],
	['ink', 'pink', 'title bar / button label'],
	['ink', 'pink-light', 'inactive tab label'],
	['ink', 'blush', 'toolbar label'],
	['ink', 'green', 'title bar label'],
	['ink', 'mint', 'tag label'],
	['deep-green', 'white', 'link on white'],
	['deep-green', 'blush', 'link on panel'],
	['deep-green', 'mint', 'link on mint'],
	['raspberry', 'white', 'handwriting on white'],
	['raspberry', 'blush', 'handwriting on panel'],
	['raspberry', 'pink-light', 'handwriting on soft fill'],
];

const lines = ['Contrast report (WCAG 2.x, text threshold 4.5:1)', ''];
let fail = 0;
for (const [fg, bg, use] of pairs) {
	const r = ratio(color[fg], color[bg]);
	const ok = r >= 4.5;
	if (!ok) fail++;
	lines.push(
		`${ok ? 'PASS' : 'FAIL'}  ${r.toFixed(2).padStart(5)}:1  ${fg} ${color[fg]} on ${bg} ${color[bg]}  (${use})`,
	);
}
lines.push(
	'',
	`NOTE  lace ${color.lace}: DECORATION ONLY, never text. Excluded from text checks.`,
	`      for reference, lace on white = ${ratio(color.lace, color.white).toFixed(2)}:1`,
	'',
	fail ? `${fail} pairing(s) FAILED` : 'All text pairings pass 4.5:1',
);

const out = lines.join('\n') + '\n';
mkdirSync(resolve(root, 'docs'), { recursive: true });
writeFileSync(resolve(root, 'docs/contrast-report.txt'), out);
process.stdout.write(out);
process.exit(fail ? 1 : 0);
