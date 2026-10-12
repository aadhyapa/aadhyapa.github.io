// Quiet-mode portrait: draws the photo as a grid of ASCII characters on a canvas.
// Brighter pixels get denser characters. The grid ripples gently on its own and
// reacts to the pointer (hover pushes characters away and lights them up, a click
// or tap sends out a ring). Nothing here is needed to read the page: the canvas is
// decorative and hidden in the cute theme, and the placeholder stays if the image
// fails to load. Reduced motion turns off the idle wave and the easing.
const RAMP = ['.', ':', '-', '=', '+', '*', '#'];
const COLS = 80; // characters across the box; cell size follows the box width
const CELL_ASPECT = 1.5; // character height over width
const HOVER_RADIUS = 56;
const RING_SPEED = 260; // px per second
const RING_WIDTH = 18;
const RING_LIFE = 900; // ms

interface Cell {
	x: number;
	y: number;
	level: number; // 0..1
}
interface Ring {
	x: number;
	y: number;
	start: number;
}

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const isQuiet = () => document.documentElement.dataset.theme === 'quiet';

function setup(canvas: HTMLCanvasElement) {
	const ctx = canvas.getContext('2d');
	if (!ctx) return;
	const context = ctx;

	let cells: Cell[] = [];
	let cellW = 8;
	let cellH = 12;
	let width = 0;
	let height = 0;
	let image: HTMLImageElement | null = null;
	let raf = 0;
	const pointer: { x: number; y: number; strength: number; inside: boolean } = {
		x: 0,
		y: 0,
		strength: 0,
		inside: false,
	};
	const rings: Ring[] = [];

	// Bounding box of the visible (non-transparent) part of the image, so the
	// subject can fill the box instead of floating inside empty margins.
	function subjectBox(img: HTMLImageElement) {
		const full = { x: 0, y: 0, w: img.naturalWidth, h: img.naturalHeight };
		const scale = Math.min(1, 160 / Math.max(full.w, full.h));
		const w = Math.max(1, Math.round(full.w * scale));
		const h = Math.max(1, Math.round(full.h * scale));
		const probe = document.createElement('canvas');
		probe.width = w;
		probe.height = h;
		const pctx = probe.getContext('2d', { willReadFrequently: true });
		if (!pctx) return full;
		pctx.drawImage(img, 0, 0, w, h);
		const { data } = pctx.getImageData(0, 0, w, h);
		let minX = w;
		let minY = h;
		let maxX = -1;
		let maxY = -1;
		for (let y = 0; y < h; y++) {
			for (let x = 0; x < w; x++) {
				if (data[(y * w + x) * 4 + 3] < 40) continue;
				if (x < minX) minX = x;
				if (x > maxX) maxX = x;
				if (y < minY) minY = y;
				if (y > maxY) maxY = y;
			}
		}
		if (maxX < 0) return full;
		return {
			x: minX / scale,
			y: minY / scale,
			w: (maxX - minX + 1) / scale,
			h: (maxY - minY + 1) / scale,
		};
	}

	function sample() {
		if (!image) return;
		cellW = width / COLS;
		cellH = cellW * CELL_ASPECT;
		const cols = COLS;
		const rows = Math.floor(height / cellH);
		if (rows < 1) return;
		const off = document.createElement('canvas');
		off.width = cols;
		off.height = rows;
		const octx = off.getContext('2d', { willReadFrequently: true });
		if (!octx) return;
		// contain: scale the subject to fit the grid, centered
		const box = subjectBox(image);
		const gridW = cols * cellW;
		const gridH = rows * cellH;
		const scale = Math.min(gridW / box.w, gridH / box.h);
		const destW = box.w * scale;
		const destH = box.h * scale;
		octx.drawImage(
			image,
			box.x,
			box.y,
			box.w,
			box.h,
			((gridW - destW) / 2 / gridW) * cols,
			((gridH - destH) / 2 / gridH) * rows,
			(destW / gridW) * cols,
			(destH / gridH) * rows,
		);
		const { data } = octx.getImageData(0, 0, cols, rows);
		cells = [];
		for (let r = 0; r < rows; r++) {
			for (let c = 0; c < cols; c++) {
				const i = (r * cols + c) * 4;
				const alpha = data[i + 3] / 255;
				if (alpha < 0.15) continue; // transparent background: draw nothing
				const lum =
					(0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) /
					255;
				cells.push({
					x: c * cellW + cellW / 2,
					y: r * cellH + cellH / 2,
					level: Math.min(1, Math.max(0, lum)),
				});
			}
		}
	}

	function layout() {
		const rect = canvas.getBoundingClientRect();
		width = Math.round(rect.width);
		height = Math.round(rect.height);
		if (!width || !height) return;
		const dpr = window.devicePixelRatio || 1;
		canvas.width = Math.round(width * dpr);
		canvas.height = Math.round(height * dpr);
		context.setTransform(dpr, 0, 0, dpr, 0, 0);
		try {
			sample();
			draw(performance.now());
		} catch {
			// canvas read blocked (tainted SVG): fall back to the plain image
			fail();
		}
	}

	// Hand the box to the black and white <img> fallback in HomeCard.astro.
	function fail() {
		delete canvas.dataset.ready;
		canvas.dataset.failed = '';
		cells = [];
	}

	function draw(now: number) {
		context.clearRect(0, 0, width, height);
		const style = getComputedStyle(canvas);
		context.fillStyle =
			style.getPropertyValue('--color-ascii').trim() || '#8fd3c0';
		context.font = `${cellH}px ${style.fontFamily}`;
		context.textAlign = 'center';
		context.textBaseline = 'middle';

		const wave = !reduceMotion.matches;
		const t = now / 1000;

		for (const cell of cells) {
			let dx = 0;
			let dy = wave ? Math.sin(cell.x * 0.07 + t * 1.4) * 1.2 : 0;
			let boost = 0;

			if (pointer.strength > 0.01) {
				const px = cell.x - pointer.x;
				const py = cell.y - pointer.y;
				const dist = Math.hypot(px, py);
				if (dist < HOVER_RADIUS) {
					const f = (1 - dist / HOVER_RADIUS) * pointer.strength;
					const push = f * 7;
					dx += (px / (dist || 1)) * push;
					dy += (py / (dist || 1)) * push;
					boost += f * 0.6;
				}
			}
			for (const ring of rings) {
				const age = now - ring.start;
				const radius = (age / 1000) * RING_SPEED;
				const dist = Math.hypot(cell.x - ring.x, cell.y - ring.y);
				const off = Math.abs(dist - radius);
				if (off < RING_WIDTH) {
					const fade = 1 - age / RING_LIFE;
					const f = (1 - off / RING_WIDTH) * fade;
					const push = f * 6;
					dx += ((cell.x - ring.x) / (dist || 1)) * push;
					dy += ((cell.y - ring.y) / (dist || 1)) * push;
					boost += f * 0.5;
				}
			}

			const level = Math.min(1, cell.level + boost);
			const idx = Math.min(RAMP.length - 1, Math.floor(level * RAMP.length));
			context.globalAlpha = 0.3 + 0.7 * level;
			context.fillText(RAMP[idx], cell.x + dx, cell.y + dy);
		}
		context.globalAlpha = 1;
	}

	function frame(now: number) {
		raf = 0;
		// ease the hover strength toward its target
		const target = pointer.inside ? 1 : 0;
		pointer.strength +=
			(target - pointer.strength) * (reduceMotion.matches ? 1 : 0.15);
		for (let i = rings.length - 1; i >= 0; i--) {
			if (now - rings[i].start > RING_LIFE) rings.splice(i, 1);
		}
		draw(now);
		const busy =
			!reduceMotion.matches ||
			rings.length > 0 ||
			Math.abs(target - pointer.strength) > 0.01;
		if (busy && isQuiet() && !document.hidden && canvas.isConnected) {
			raf = requestAnimationFrame(frame);
		}
	}
	function kick() {
		if (!raf && isQuiet()) raf = requestAnimationFrame(frame);
	}

	function toLocal(event: PointerEvent) {
		const rect = canvas.getBoundingClientRect();
		return { x: event.clientX - rect.left, y: event.clientY - rect.top };
	}
	canvas.addEventListener('pointermove', (event) => {
		Object.assign(pointer, toLocal(event), { inside: true });
		kick();
	});
	canvas.addEventListener('pointerleave', () => {
		pointer.inside = false;
		kick();
	});
	canvas.addEventListener('pointerdown', (event) => {
		const { x, y } = toLocal(event);
		rings.push({ x, y, start: performance.now() });
		if (rings.length > 4) rings.shift();
		kick();
	});

	const observer = new ResizeObserver(layout);
	observer.observe(canvas);
	// start or stop with the theme
	new MutationObserver(() => {
		if (isQuiet()) {
			layout();
			kick();
		}
	}).observe(document.documentElement, {
		attributes: true,
		attributeFilter: ['data-theme'],
	});
	document.addEventListener('visibilitychange', kick);
	reduceMotion.addEventListener('change', kick);

	const img = new Image();
	img.onload = async () => {
		image = img;
		// the quiet font loads lazily; wait so the first frame uses it
		try {
			await document.fonts.ready;
		} catch {
			// fall through with whatever font is available
		}
		canvas.dataset.ready = '';
		layout();
		kick();
	};
	img.onerror = () => fail();
	img.src = canvas.dataset.src ?? '';
}

function init() {
	document
		.querySelectorAll<HTMLCanvasElement>(
			'canvas[data-ascii-portrait]:not([data-bound])',
		)
		.forEach((canvas) => {
			canvas.dataset.bound = '';
			setup(canvas);
		});
}
document.addEventListener('astro:page-load', init);
