import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Entry slugs that collide with tab routes (e.g. /experience/work, /letters/category).
const reserved = {
	experience: ['work', 'projects'],
	letters: ['category'],
};

type Collection = keyof typeof reserved;

// glob loader that fails the build when an entry id is a reserved slug.
function strictGlob(collection: Collection, base: string) {
	const inner = glob({ pattern: '**/*.{md,mdx}', base });
	return {
		...inner,
		load: async (context: Parameters<typeof inner.load>[0]) => {
			await inner.load(context);
			for (const id of context.store.keys()) {
				if (reserved[collection].includes(id)) {
					throw new Error(
						`[${collection}] "${id}" is a reserved slug (used by a tab route). Rename the entry file.`,
					);
				}
			}
		},
	};
}

const lesson = z.object({
	title: z.string().min(1),
	text: z.string().min(1),
});

const shared = {
	title: z.string().min(1),
	start: z.coerce.date(),
	end: z.coerce.date().optional(),
	summary: z.string().min(1),
	did: z.array(z.string().min(1)).min(1),
	stack: z.array(z.string().min(1)).min(1),
	thumbnail: z.string().optional(),
	order: z.number(),
};

const experience = defineCollection({
	loader: strictGlob('experience', './src/content/experience'),
	schema: z.discriminatedUnion('kind', [
		z.object({
			...shared,
			kind: z.literal('work'),
			organization: z.string().min(1),
			learned: z.array(lesson).optional(),
		}),
		z.object({
			...shared,
			kind: z.literal('project'),
			client: z.string().min(1),
			learned: z.array(lesson).optional(),
			problem: z.string().min(1),
			change: z.string().min(1).optional(),
		}),
	]),
});

const letters = defineCollection({
	loader: strictGlob('letters', './src/content/letters'),
	schema: z.object({
		title: z.string().min(1),
		date: z.coerce.date(),
		category: z.string().min(1),
		summary: z.string().min(1),
		draft: z.boolean(),
	}),
});

export const collections = { experience, letters };
