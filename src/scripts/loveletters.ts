/**
 * /loveletters: turn a key into that person's letters, entirely in the
 * browser. The key is stretched with PBKDF2 into an AES-GCM key plus a
 * lookup id; the id names the sealed file, the AES key opens it. One letter
 * opens straight away; several show as an inbox first. The key never leaves
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
	title: string;
	/** Full salutation line; files sealed before greetings existed lack it. */
	greeting?: string;
	date: string | null;
	html: string;
}
interface Bundle {
	to: string;
	letters: Letter[];
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

const formatDate = (date: string | null) =>
	date
		? new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'long',
				day: 'numeric',
				timeZone: 'UTC',
			})
		: '';

/** null when no letters match the key. */
async function open(key: string): Promise<Bundle | null> {
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
	return JSON.parse(new TextDecoder().decode(plain)) as Bundle;
}

function setupLoveLetters() {
	const form = document.querySelector<HTMLFormElement>('[data-ll-form]');
	if (!form || form.dataset.ready) return;
	form.dataset.ready = 'true';

	const q = <T extends HTMLElement>(sel: string) =>
		document.querySelector<T>(sel)!;
	const lock = q('[data-ll-lock]');
	const inbox = q('[data-ll-inbox]');
	const list = q('[data-ll-list]');
	const letter = q('[data-ll-letter]');
	const input = q<HTMLInputElement>('#ll-key');
	const show = q<HTMLInputElement>('[data-ll-show]');
	const submit = q<HTMLButtonElement>('[data-ll-submit]');
	const status = q('[data-ll-status]');
	const body = q('[data-ll-body]');
	const back = q('[data-ll-back]');
	const scroller = letter.closest<HTMLElement>('.body');

	let bundle: Bundle | null = null;

	show.addEventListener('change', () => {
		input.type = show.checked ? 'text' : 'password';
	});

	/** Show exactly one of the three views and move focus into it. */
	const view = (el: HTMLElement) => {
		for (const v of [lock, inbox, letter]) v.hidden = v !== el;
		scroller?.scrollTo({ top: 0 });
		if (el !== lock) {
			el.setAttribute('tabindex', '-1');
			el.focus({ preventScroll: true });
		}
	};

	const read = (l: Letter) => {
		q('[data-ll-title]').textContent = l.title;
		q('[data-ll-greeting]').textContent =
			l.greeting ?? `dear ${bundle?.to ?? 'you'},`;
		q('[data-ll-date]').textContent = formatDate(l.date);
		// Trusted: written by Aadhya and authenticated by AES-GCM.
		body.innerHTML = l.html;
		back.hidden = (bundle?.letters.length ?? 0) < 2;
		view(letter);
	};

	const showInbox = () => {
		if (!bundle) return;
		body.innerHTML = '';
		list.replaceChildren(
			...bundle.letters.map((l) => {
				const li = document.createElement('li');
				const button = document.createElement('button');
				button.type = 'button';
				button.className = 'item';
				const title = document.createElement('span');
				title.className = 'item-title';
				title.textContent = l.title;
				button.append(title);
				if (l.date) {
					const date = document.createElement('span');
					date.className = 'item-date';
					date.textContent = formatDate(l.date);
					button.append(date);
				}
				button.addEventListener('click', () => read(l));
				li.append(button);
				return li;
			}),
		);
		view(inbox);
	};

	const unlock = (b: Bundle) => {
		bundle = b;
		for (const el of document.querySelectorAll('[data-ll-to]'))
			el.textContent = b.to;
		q('[data-ll-count]').textContent =
			`${b.letters.length} letters, all for you`;
		if (b.letters.length === 1) read(b.letters[0]);
		else showInbox();
	};

	const tryKey = async (key: string) => {
		if (!key.trim()) return;
		submit.disabled = true;
		status.textContent = 'unsealing…';
		try {
			const b = await open(key);
			if (b?.letters.length) {
				status.textContent = '';
				unlock(b);
			} else {
				status.textContent =
					"hmm, that key doesn't open anything. check the spelling? 💌";
			}
		} catch {
			status.textContent =
				'something went wrong opening your letters. try again in a moment.';
		} finally {
			submit.disabled = false;
		}
	};

	form.addEventListener('submit', (e) => {
		e.preventDefault();
		void tryKey(input.value);
	});

	back.addEventListener('click', showInbox);

	for (const button of document.querySelectorAll('[data-ll-relock]'))
		button.addEventListener('click', () => {
			bundle = null;
			body.innerHTML = '';
			list.replaceChildren();
			input.value = '';
			view(lock);
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
