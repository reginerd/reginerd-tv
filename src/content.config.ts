import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string().optional(),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: image().optional(),
			// Music write-up fields
			artist: z.string().optional(),
			album: z.string().optional(),
			releaseYear: z.number().optional(),
			tags: z.array(z.string()).optional(),
			draft: z.boolean().optional(),
			// "MM-DD" or "YYYY-MM-DD" — surfaces this post to the DJ on matching day each year
			anniversary: z.string().optional(),
		}),
});

export const collections = { blog };
