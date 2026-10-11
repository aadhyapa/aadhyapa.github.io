import { getCollection, type CollectionEntry } from 'astro:content';

export type Entry = CollectionEntry<'experience'>;
export type Filter = 'all' | 'work' | 'projects';

export const tabs: { filter: Filter; label: string; href: string }[] = [
	{ filter: 'all', label: 'all', href: '/experience' },
	{ filter: 'work', label: 'work', href: '/experience/work' },
	{ filter: 'projects', label: 'projects', href: '/experience/projects' },
];

/** All experience entries in author order, plus the counts the tabs show. */
export async function loadEntries() {
	const all = (await getCollection('experience')).sort(
		(a, b) => a.data.order - b.data.order,
	);
	const work = all.filter((e) => e.data.kind === 'work');
	const projects = all.filter((e) => e.data.kind === 'project');
	return {
		entries: { all, work, projects } satisfies Record<Filter, Entry[]>,
		counts: {
			all: all.length,
			work: work.length,
			projects: projects.length,
		} satisfies Record<Filter, number>,
	};
}

/** "2023 to now", "2021 to 2023", or a single year when start and end match. */
export function formatSpan({ start, end }: Entry['data']): string {
	const from = start.getUTCFullYear();
	if (!end) return `${from} to now`;
	const to = end.getUTCFullYear();
	return from === to ? `${from}` : `${from} to ${to}`;
}

export const kindLabel = (entry: Entry) =>
	entry.data.kind === 'work' ? 'work' : 'project';

export const subtitle = (entry: Entry) =>
	entry.data.kind === 'work' ? entry.data.organization : entry.data.client;
