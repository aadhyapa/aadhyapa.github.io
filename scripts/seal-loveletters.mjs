// Seals the private love letters into encrypted files the site can serve.
//
// Reads  private/loveletters/<person>/   (gitignored; plaintext and keys)
//          person.yml   to: <name>, key: <secret>
//          *.md         one letter each: title, date, optional draft
// Writes public/loveletters/sealed/*.json (committed; ciphertext only)
//
// Each person's key is stretched with PBKDF2 into an AES-GCM key plus a
// lookup id. All of that person's letters go into one file named by the id,
// so a reader's key finds their letters without the site keeping any list of
// who has some. The crypto parameters must match src/scripts/loveletters.ts.
//
// Usage: npm run seal
import {
	existsSync,
	readdirSync,
	statSync,
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

function frontmatter(path, label) {
	const raw = readFileSync(path, 'utf8');
	const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
	if (!match) throw new Error(`${label}: missing --- frontmatter --- block`);
	return { data: parseYaml(match[1]) ?? {}, body: match[2].trim() };
}

function readPerson(dir) {
	const label = `${dir}/person.yml`;
	const path = join(SRC, dir, 'person.yml');
	if (!existsSync(path))
		throw new Error(`${label} is missing. Add one with "to:" and "key:".`);
	const data = parseYaml(readFileSync(path, 'utf8')) ?? {};
	if (typeof data.to !== 'string' || !data.to.trim())
		throw new Error(`${label}: needs "to: <name>"`);
	if (typeof data.key !== 'string')
		throw new Error(
			`${label}: needs "key: <secret>" (quote it if it looks like a number)`,
		);
	if (normalizeKey(data.key).length < MIN_KEY_LENGTH)
		throw new Error(
			`${label}: key is too short. Use at least ${MIN_KEY_LENGTH} characters; a few random words works well.`,
		);
	return { dir, to: data.to.trim(), key: data.key };
}

function readLetter(dir, file) {
	const label = `${dir}/${file}`;
	const { data, body } = frontmatter(join(SRC, dir, file), label);
	if (typeof data.title !== 'string' || !data.title.trim())
		throw new Error(`${label}: frontmatter needs "title: <title>"`);
	if (!body) throw new Error(`${label}: letter body is empty`);
	const date = data.date ? new Date(data.date) : null;
	if (date && Number.isNaN(date.valueOf()))
		throw new Error(`${label}: date is not a valid date`);
	return {
		file,
		draft: data.draft === true,
		title: data.title.trim(),
		date,
		body,
	};
}

// Newest first; undated letters last, then by file name.
const byDate = (a, b) =>
	(b.date?.valueOf() ?? -Infinity) - (a.date?.valueOf() ?? -Infinity) ||
	a.file.localeCompare(b.file);

async function main() {
	let entries;
	try {
		entries = readdirSync(SRC);
	} catch {
		console.error(
			`No letters folder at ${SRC}. Create it with one folder per person.`,
		);
		process.exit(1);
	}

	const loose = entries.filter((f) => f.endsWith('.md'));
	if (loose.length)
		throw new Error(
			`${loose.join(', ')} should be inside a person's folder, e.g. private/loveletters/<name>/`,
		);

	const people = entries
		.filter((d) => !d.startsWith('.') && statSync(join(SRC, d)).isDirectory())
		.sort()
		.map((dir) => {
			const person = readPerson(dir);
			const letters = readdirSync(join(SRC, dir))
				.filter((f) => f.endsWith('.md'))
				.map((f) => readLetter(dir, f));
			return {
				...person,
				letters: letters.filter((l) => !l.draft).sort(byDate),
				drafts: letters.filter((l) => l.draft).length,
			};
		});

	const seen = new Map();
	for (const p of people) {
		const k = normalizeKey(p.key);
		if (seen.has(k))
			throw new Error(
				`${p.dir} and ${seen.get(k)} use the same key. Every person needs their own.`,
			);
		seen.set(k, p.dir);
	}

	// Rebuild from scratch so removed letters and changed keys leave nothing behind.
	rmSync(OUT, { recursive: true, force: true });
	mkdirSync(OUT, { recursive: true });

	let sealed = 0;
	for (const p of people) {
		const note = p.drafts ? `, ${p.drafts} draft(s) skipped` : '';
		if (!p.letters.length) {
			console.log(`skipped ${p.dir}/  (no published letters${note})`);
			continue;
		}
		const { aes, id } = await derive(p.key);
		const payload = JSON.stringify({
			to: p.to,
			letters: await Promise.all(
				p.letters.map(async (l) => ({
					title: l.title,
					date: l.date ? l.date.toISOString().slice(0, 10) : null,
					html: await marked.parse(l.body),
				})),
			),
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
				v: 2,
				iv: Buffer.from(iv).toString('base64'),
				ct: Buffer.from(ct).toString('base64'),
			}) + '\n',
		);
		sealed++;
		console.log(
			`sealed  ${p.dir}/  (to ${p.to}, ${p.letters.length} letter(s)${note})`,
		);
	}
	console.log(`\n${sealed} person(s) sealed into public/loveletters/sealed/.`);
}

main().catch((err) => {
	console.error(`seal failed: ${err.message}`);
	process.exit(1);
});
