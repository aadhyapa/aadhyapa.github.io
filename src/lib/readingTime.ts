const WORDS_PER_MINUTE = 200;

/** Whole minutes to read `text`: words / 200, rounded up, never below 1. */
export function readingTime(text: string): number {
	const words = text.trim().split(/\s+/).filter(Boolean).length;
	return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}
