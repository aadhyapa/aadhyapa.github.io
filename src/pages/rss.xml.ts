import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { loadPublished } from '../components/letters/letters';

export async function GET(context: APIContext) {
	const letters = await loadPublished();
	return rss({
		title: 'Letters',
		description: 'Letters from my coquette life.',
		// Set `site` in astro.config.mjs for real feed URLs; localhost is a dev fallback.
		site: context.site ?? 'http://localhost:4321',
		items: letters.map((letter) => ({
			title: letter.data.title,
			description: letter.data.summary,
			pubDate: letter.data.date,
			link: `/letters/${letter.id}`,
			categories: [letter.data.category],
		})),
	});
}
