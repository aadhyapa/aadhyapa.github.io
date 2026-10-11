// Synthetic data generator. Everything written here is invented.
// Same seed in, byte-identical files out. Change SEED to get a new dataset.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

const SEED = 20260214;

const OUT_DIR = join(
	dirname(fileURLToPath(import.meta.url)),
	'..',
	'src',
	'data',
	'synthetic',
);
const START = Date.UTC(2026, 0, 5); // fixed, so output never depends on today's date
const DAYS = 120;
const DAY_MS = 86_400_000;

// mulberry32: tiny seeded generator returning floats in [0, 1)
function makeRandom(seed) {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

const random = makeRandom(SEED);
const between = (lo, hi) => lo + random() * (hi - lo);
const intBetween = (lo, hi) => Math.floor(between(lo, hi + 1));
// roughly normal, mean 0, sd 1 (sum of uniforms)
const gauss = () => (random() + random() + random() + random() - 2) / 0.5774;
const pickWeighted = (items, weights) => {
	let roll = random() * weights.reduce((sum, w) => sum + w, 0);
	for (let i = 0; i < items.length; i++) {
		roll -= weights[i];
		if (roll < 0) return items[i];
	}
	return items[items.length - 1];
};
const isoDate = (dayIndex) =>
	new Date(START + dayIndex * DAY_MS).toISOString().slice(0, 10);

// --- carriers ---------------------------------------------------------------
const carriers = [
	{
		id: 'brindlewick',
		name: 'Brindlewick Freight',
		region: 'North coast',
		international: false,
	},
	{
		id: 'quillon',
		name: 'Quillon Haulage',
		region: 'Inland plains',
		international: false,
	},
	{
		id: 'marrowdale',
		name: 'Marrowdale Express',
		region: 'Southern valleys',
		international: true,
	},
	{
		id: 'tessaly',
		name: 'Tessaly Cargo',
		region: 'Harbour cities',
		international: true,
	},
	{
		id: 'oddfell',
		name: 'Oddfell Parcel',
		region: 'Hill towns',
		international: false,
	},
	{
		id: 'vantry',
		name: 'Vantry Lines',
		region: 'Cross-border',
		international: true,
	},
].map((carrier) => ({
	...carrier,
	onTimeRate: Math.round(between(0.82, 0.97) * 1000) / 1000,
	avgTransitDays: Math.round(between(1.6, 4.8) * 10) / 10,
	share: Math.round(between(0.08, 0.28) * 100) / 100,
}));

// --- orders per day ---------------------------------------------------------
// index 0 = Monday (START is a Monday)
const WEEKDAY_RHYTHM = [1.1, 1.14, 1.06, 1.0, 0.94, 0.5, 0.32];
const quietDays = new Set([intBetween(28, 45), intBetween(80, 100)]);
const spikeDays = new Map();
while (spikeDays.size < 4) {
	const day = intBetween(5, DAYS - 3);
	if (!quietDays.has(day)) spikeDays.set(day, between(1.7, 2.4));
}
let dipDay = intBetween(55, 70);
while (quietDays.has(dipDay) || spikeDays.has(dipDay)) dipDay += 1;

const orders = [];
for (let day = 0; day < DAYS; day++) {
	const trend = 1 + (day / DAYS) * 0.18;
	let value = 410 * trend * WEEKDAY_RHYTHM[day % 7] * (1 + gauss() * 0.07);
	let note;
	if (quietDays.has(day)) {
		value *= between(0.08, 0.15);
		note = 'quiet';
	} else if (spikeDays.has(day)) {
		value *= spikeDays.get(day);
		note = 'spike';
	} else if (day === dipDay) {
		value *= 0.55;
		note = 'dip';
	}
	const entry = { date: isoDate(day), orders: Math.max(1, Math.round(value)) };
	if (note) entry.note = note;
	orders.push(entry);
}

// --- exceptions -------------------------------------------------------------
const TYPES = ['late', 'damaged', 'address-problem', 'customs-hold'];
const TYPE_WEIGHTS = [0.46, 0.14, 0.27, 0.13];
const carrierWeights = carriers.map((c) => c.share);
const NEWEST_OPEN_WINDOW = 14; // recent exceptions are more likely still open

const exceptions = [];
let orderCounter = 100000;
for (let day = 0; day < DAYS; day++) {
	const expected = orders[day].orders * 0.009 * (1 + gauss() * 0.25);
	const count = Math.max(0, Math.round(expected));
	for (let i = 0; i < count; i++) {
		const carrier = pickWeighted(carriers, carrierWeights);
		let type = pickWeighted(TYPES, TYPE_WEIGHTS);
		if (type === 'customs-hold' && !carrier.international) type = 'late';
		orderCounter += intBetween(1, 37);
		const recent = DAYS - day <= NEWEST_OPEN_WINDOW;
		const status = recent
			? pickWeighted(['open', 'investigating', 'resolved'], [0.5, 0.3, 0.2])
			: pickWeighted(['open', 'investigating', 'resolved'], [0.04, 0.06, 0.9]);
		exceptions.push({
			orderId: `ORD-${orderCounter}`,
			date: isoDate(day),
			type,
			carrier: carrier.id,
			status,
		});
	}
}

// --- Signal Study (240 values) ---------------------------------------------
// Two slow waves, a rising chirp, and a few sharp pulses, under a swelling envelope.
const SIGNAL_LENGTH = 240;
const pulses = new Set([
	intBetween(40, 60),
	intBetween(120, 140),
	intBetween(190, 215),
]);
const signal = [];
for (let i = 0; i < SIGNAL_LENGTH; i++) {
	const t = i / SIGNAL_LENGTH;
	const envelope = Math.sin(Math.PI * t) ** 0.8;
	const slow =
		0.55 * Math.sin(2 * Math.PI * 3 * t) +
		0.25 * Math.sin(2 * Math.PI * 7.5 * t + 1.3);
	const chirp = 0.3 * Math.sin(2 * Math.PI * (4 * t + 14 * t * t));
	let value = envelope * (slow + chirp) + gauss() * 0.04;
	if (pulses.has(i)) value += (random() < 0.5 ? -1 : 1) * between(0.45, 0.7);
	signal.push(Math.round(Math.max(-1, Math.min(1, value)) * 10000) / 10000);
}

// --- write ------------------------------------------------------------------
const files = {
	'orders.json': {
		note: 'Invented data. Orders per day for an imaginary logistics company.',
		seed: SEED,
		days: orders,
	},
	'exceptions.json': {
		note: 'Invented data. Delivery exceptions for an imaginary logistics company.',
		seed: SEED,
		exceptions,
	},
	'carriers.json': {
		note: 'Invented data. Six made-up carriers.',
		seed: SEED,
		carriers,
	},
	'signal.json': {
		note: 'Invented data. 240 values in [-1, 1] for the Signal Study artwork.',
		seed: SEED,
		values: signal,
	},
};

mkdirSync(OUT_DIR, { recursive: true });
for (const [name, data] of Object.entries(files)) {
	writeFileSync(join(OUT_DIR, name), JSON.stringify(data, null, '\t') + '\n');
	process.stdout.write(`wrote src/data/synthetic/${name}\n`);
}
