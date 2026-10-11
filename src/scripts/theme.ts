// Theme switch behavior. The head script in Layout.astro applies the saved choice
// before first paint; this only handles clicks. The button lives in the persisted
// menu bar, so one delegated listener on document is enough.
document.addEventListener('click', (event) => {
	if (!(event.target as Element).closest('[data-theme-switch]')) return;
	const root = document.documentElement;
	const next = root.dataset.theme === 'quiet' ? 'cute' : 'quiet';
	root.dataset.theme = next;
	try {
		localStorage.setItem('theme', next);
	} catch {
		// storage blocked: the choice lasts until reload
	}
});
