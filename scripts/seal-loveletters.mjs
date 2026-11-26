// Seals the private love letters into encrypted files the site can serve.
//
// Reads  private/loveletters/*.md        (gitignored; plaintext and keys)
// Writes public/loveletters/sealed/*.json (committed; ciphertext only)
//
// Each letter's key is stretched with PBKDF2 into an AES-GCM key plus a
// lookup id. The id is the file name, so a reader's key finds their letter
// without the site keeping any list of who has one. The crypto parameters
// must match src/scripts/loveletters.ts.
//
// Usage: npm run seal
import {
	readdirSync,
	readFileSync,
	mkdirSync,
	rmSync,
	writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';
import { Console } from 'node:console';
import { webcrypto as crypto } from 'node:crypto';
import { Buffer } from 'node:buffer';
import { TextEncoder } from 'node:util';
import { marked } from 'marked';
import { parse as parseYaml } from 'yaml';

const console = new Console(process.stdout, process.stderr);
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(root, 'private/loveletters');
const OUT = join(root, 'public/loveletters/sealed');

// Keep in sync with src/scripts/loveletters.ts.
const SALT = 'aadhyapa.com/loveletters/v1';
const ITERATIONS = 600_000;
const MIN_KEY_LENGTH = 12;

export const normalizeKey = (key) =>
	key.normalize('NFC').trim().toLowerCase().replace(/\s+/g, ' ');

async function derive(key) {
	const base = await crypto.subtle.importKey(
		'raw',
		new TextEncoder().encode(normalizeKey(key)),
		'PBKDF2',
		false,
		['deriveBits'],
	);
	const bits = new Uint8Array(
		await crypto.subtle.deriveBits(
			{
				name: 'PBKDF2',
				hash: 'SHA-256',
				salt: new TextEncoder().encode(SALT),
				iterations: ITERATIONS,
			},
			base,
			384,
		),
	);
	const aes = await crypto.subtle.importKey(
		'raw',
		bits.slice(0, 32),
		'AES-GCM',
		false,
		['encrypt'],
	);
	const id = Buffer.from(bits.slice(32, 48)).toString('hex');
	return { aes, id };
}

function readLetter(file) {
	const raw = readFileSync(join(SRC, file), 'utf8');
	const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
	if (!match) throw new Error(`${file}: missing --- frontmatter --- block`);
	const data = parseYaml(match[1]) ?? {};
	const body = match[2].trim();
	if (typeof data.to !== 'string' || !data.to.trim())
		throw new Error(`${file}: frontmatter needs "to: <name>"`);
	if (typeof data.key !== 'string')
		throw new Error(
			`${file}: frontmatter needs "key: <secret>" (quote it if it looks like a number)`,
		);
	if (normalizeKey(data.key).length < MIN_KEY_LENGTH)
		throw new Error(
			`${file}: key is too short. Use at least ${MIN_KEY_LENGTH} characters; a few random words works well.`,
		);
	if (!body) throw new Error(`${file}: letter body is empty`);
	const date = data.date ? new Date(data.date) : null;
	if (date && Number.isNaN(date.valueOf()))
		throw new Error(`${file}: date is not a valid date`);
	return {
		file,
		draft: data.draft === true,
		to: data.to.trim(),
		key: data.key,
		date,
		body,
	};
}

async function main() {
	let files;
	try {
		files = readdirSync(SRC).filter((f) => f.endsWith('.md'));
	} catch {
		console.error(
			`No letters folder at ${SRC}. Create it and add a .md file per friend.`,
		);
		process.exit(1);
	}

	const letters = files.map(readLetter).filter((l) => !l.draft);

	const seen = new Map();
	for (const l of letters) {
		const k = normalizeKey(l.key);
		if (seen.has(k))
			throw new Error(
				`${l.file} and ${seen.get(k)} use the same key. Every friend needs their own.`,
			);
		seen.set(k, l.file);
	}

	// Rebuild from scratch so removed letters and changed keys leave nothing behind.
	rmSync(OUT, { recursive: true, force: true });
	mkdirSync(OUT, { recursive: true });

	for (const l of letters) {
		const { aes, id } = await derive(l.key);
		const payload = JSON.stringify({
			to: l.to,
			date: l.date ? l.date.toISOString().slice(0, 10) : null,
			html: await marked.parse(l.body),
		});
		const iv = crypto.getRandomValues(new Uint8Array(12));
		const ct = new Uint8Array(
			await crypto.subtle.encrypt(
				{ name: 'AES-GCM', iv },
				aes,
				new TextEncoder().encode(payload),
			),
		);
		writeFileSync(
			join(OUT, `${id}.json`),
			JSON.stringify({
				v: 1,
				iv: Buffer.from(iv).toString('base64'),
				ct: Buffer.from(ct).toString('base64'),
			}) + '\n',
		);
		console.log(`sealed  ${l.file}  (to ${l.to})`);
	}
	const drafts = files.length - letters.length;
	console.log(
		`\n${letters.length} letter(s) sealed into public/loveletters/sealed/${drafts ? `, ${drafts} draft(s) skipped` : ''}.`,
	);
}

main().catch((err) => {
	console.error(`seal failed: ${err.message}`);
	process.exit(1);
});
