import { getCollection, type CollectionEntry } from 'astro:content';
import { readingTime } from '../../lib/readingTime';

export type Letter = CollectionEntry<'letters'>;

export interface Tab {
	/** Category slug, or null for the inbox. */
	slug: string | null;
	label: string;
	href: string;
	count: number;
}

export const slugify = (category: string) =>
	category
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');

export const minutes = (letter: Letter) => readingTime(letter.body ?? '');

/** Published letters, newest first. Drafts never leave this module. */
export async function loadPublished(): Promise<Letter[]> {
	return (await getCollection('letters', ({ data }) => !data.draft)).sort(
		(a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
	);
}

/**
 * Every category slug with its label, drafts included, so a category whose
 * letters are all drafts still has a page that shows the empty message.
 */
export async function loadCategories(): Promise<Map<string, string>> {
	const all = await getCollection('letters');
	const map = new Map<string, string>();
	for (const { data } of all) {
		const slug = slugify(data.category);
		if (slug && !map.has(slug)) map.set(slug, data.category);
	}
	return new Map([...map].sort((a, b) => a[1].localeCompare(b[1])));
}

/** Inbox tab first (with the published count), then one tab per category. */
export async function loadTabs(published: Letter[]): Promise<Tab[]> {
	const categories = await loadCategories();
	return [
		{ slug: null, label: 'inbox', href: '/letters', count: published.length },
		...[...categories].map(([slug, label]) => ({
			slug,
			label,
			href: `/letters/category/${slug}`,
			count: published.filter((l) => slugify(l.data.category) === slug).length,
		})),
	];
}

export const formatDate = (date: Date) =>
	date.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		timeZone: 'UTC',
	});
