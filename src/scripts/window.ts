/**
 * Window behavior, loaded once by the layout and shared by every window.
 * Works with Astro view transitions: listeners live on document, and
 * astro:page-load runs after each swap and on first load.
 *  - open: move focus into the window
 *  - Tab: stays inside the window
 *  - Escape / click outside: close (go to the close address)
 *  - close: return focus to the link that opened the window
 */
import { navigate } from 'astro:transitions/client';

const FOCUSABLE =
	'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

let opener: { el: HTMLElement; href: string; index: number } | null = null;
let lastWindowPath: string | null = null;

const getWindow = () => document.querySelector<HTMLElement>('[data-window]');
const getLayer = () =>
	document.querySelector<HTMLElement>('[data-window-layer]');

function close() {
	const href = getLayer()?.dataset.closeHref;
	if (href) void navigate(href);
}

function focusables(win: HTMLElement) {
	return [...win.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
		(el) => el.getClientRects().length > 0,
	);
}

function restoreFocus() {
	const target =
		(opener?.el.isConnected ? opener.el : null) ??
		(opener
			? document
					.querySelectorAll<HTMLElement>(`a[href="${opener.href}"]`)
					.item(opener.index)
			: null) ??
		(lastWindowPath
			? [...document.querySelectorAll<HTMLAnchorElement>('#menubar a')].find(
					(a) =>
						lastWindowPath!.startsWith(new URL(a.href).pathname) &&
						new URL(a.href).pathname !== '/',
				)
			: null);
	target?.focus();
	opener = null;
	lastWindowPath = null;
}

document.addEventListener('astro:page-load', () => {
	const win = getWindow();
	if (win) {
		lastWindowPath = location.pathname;
		win.focus({ preventScroll: true });
	} else if (lastWindowPath) {
		restoreFocus();
	}
});

// Remember the opener only when going from no window to a window.
document.addEventListener(
	'click',
	(event) => {
		if (getWindow() || event.defaultPrevented || event.button !== 0) return;
		const link = (event.target as Element).closest<HTMLAnchorElement>(
			'a[href]',
		);
		if (!link) return;
		const href = link.getAttribute('href') ?? '';
		// Position among links with the same address, so the home card button is
		// found again after the page swap instead of the menu bar link.
		const index = [
			...document.querySelectorAll<HTMLElement>(`a[href="${href}"]`),
		].indexOf(link);
		opener = { el: link, href, index: Math.max(index, 0) };
	},
	true,
);

document.addEventListener('click', (event) => {
	const layer = getLayer();
	if (layer && event.target === layer) close();
});

document.addEventListener('keydown', (event) => {
	const win = getWindow();
	if (!win) return;

	if (event.key === 'Escape') {
		event.preventDefault();
		close();
		return;
	}

	if (event.key !== 'Tab') return;
	const items = focusables(win);
	if (items.length === 0) {
		event.preventDefault();
		win.focus();
		return;
	}
	const first = items[0];
	const last = items[items.length - 1];
	const active = document.activeElement;
	if (!win.contains(active) || active === win) {
		event.preventDefault();
		(event.shiftKey ? last : first).focus();
	} else if (event.shiftKey && active === first) {
		event.preventDefault();
		last.focus();
	} else if (!event.shiftKey && active === last) {
		event.preventDefault();
		first.focus();
	}
});
