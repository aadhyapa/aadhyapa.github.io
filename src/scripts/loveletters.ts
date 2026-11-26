/**
 * /loveletters: turn a key into a letter, entirely in the browser.
 * The key is stretched with PBKDF2 into an AES-GCM key plus a lookup id;
 * the id names the sealed file, the AES key opens it. The key never leaves
 * the page. A link may carry the key after # (#k=...), which browsers do not
 * send to the server.
 * Parameters must match scripts/seal-loveletters.mjs.
 */
const SALT = 'aadhyapa.com/loveletters/v1';
const ITERATIONS = 600_000;

interface Sealed {
	v: number;
	iv: string;
	ct: string;
}
interface Letter {
	to: string;
	date: string | null;
	html: string;
}

const enc = new TextEncoder();
const normalizeKey = (key: string) =>
	key.normalize('NFC').trim().toLowerCase().replace(/\s+/g, ' ');
const fromBase64 = (s: string) =>
	Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
const toHex = (bytes: Uint8Array) =>
	[...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');

async function derive(key: string) {
	const base = await crypto.subtle.importKey(
		'raw',
		enc.encode(normalizeKey(key)),
		'PBKDF2',
		false,
		['deriveBits'],
	);
	const bits = new Uint8Array(
		await crypto.subtle.deriveBits(
			{
				name: 'PBKDF2',
				hash: 'SHA-256',
				salt: enc.encode(SALT),
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
		['decrypt'],
	);
	return { aes, id: toHex(bits.slice(32, 48)) };
}

/** null when no letter matches the key. */
async function open(key: string): Promise<Letter | null> {
	const { aes, id } = await derive(key);
	const res = await fetch(`/loveletters/sealed/${id}.json`, {
		cache: 'no-store',
	});
	if (res.status === 404) return null;
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
	const sealed = (await res.json()) as Sealed;
	const plain = await crypto.subtle.decrypt(
		{ name: 'AES-GCM', iv: fromBase64(sealed.iv) },
		aes,
		fromBase64(sealed.ct),
	);
	return JSON.parse(new TextDecoder().decode(plain)) as Letter;
}

function setupLoveLetters() {
	const form = document.querySelector<HTMLFormElement>('[data-ll-form]');
	if (!form || form.dataset.ready) return;
	form.dataset.ready = 'true';

	const q = <T extends HTMLElement>(sel: string) =>
		document.querySelector<T>(sel)!;
	const lock = q('[data-ll-lock]');
	const letter = q('[data-ll-letter]');
	const input = q<HTMLInputElement>('#ll-key');
	const show = q<HTMLInputElement>('[data-ll-show]');
	const submit = q<HTMLButtonElement>('[data-ll-submit]');
	const status = q('[data-ll-status]');
	const body = q('[data-ll-body]');
	const scroller = letter.closest<HTMLElement>('.body');

	show.addEventListener('change', () => {
		input.type = show.checked ? 'text' : 'password';
	});

	const reveal = (l: Letter) => {
		q('[data-ll-to]').textContent = l.to;
		q('[data-ll-date]').textContent = l.date
			? new Date(`${l.date}T00:00:00Z`).toLocaleDateString('en-US', {
					year: 'numeric',
					month: 'long',
					day: 'numeric',
					timeZone: 'UTC',
				})
			: '';
		// Trusted: written by Aadhya and authenticated by AES-GCM.
		body.innerHTML = l.html;
		lock.hidden = true;
		letter.hidden = false;
		scroller?.scrollTo({ top: 0 });
		letter.setAttribute('tabindex', '-1');
		letter.focus({ preventScroll: true });
	};

	const tryKey = async (key: string) => {
		if (!key.trim()) return;
		submit.disabled = true;
		status.textContent = 'unsealing…';
		try {
			const l = await open(key);
			if (l) {
				status.textContent = '';
				reveal(l);
			} else {
				status.textContent =
					"hmm, that key doesn't open anything. check the spelling? 💌";
			}
		} catch {
			status.textContent =
				'something went wrong opening the letter. try again in a moment.';
		} finally {
			submit.disabled = false;
		}
	};

	form.addEventListener('submit', (e) => {
		e.preventDefault();
		void tryKey(input.value);
	});

	q('[data-ll-relock]').addEventListener('click', () => {
		body.innerHTML = '';
		input.value = '';
		letter.hidden = true;
		lock.hidden = false;
		input.focus();
	});

	// #k=<key> opens straight away; drop it from the address bar after reading.
	const hashKey = new URLSearchParams(location.hash.slice(1)).get('k');
	if (hashKey) {
		history.replaceState(null, '', location.pathname + location.search);
		input.value = hashKey;
		void tryKey(hashKey);
	}
}

document.addEventListener('astro:page-load', setupLoveLetters);
