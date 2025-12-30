import { defineCollection, z } from 'astro:content';

const feedCollection = defineCollection({
  type: 'content',
  schema: z.object({
    date: z.date(),
    title: z.string(),
    summary: z.string(),
    link: z.string(),
    type: z.enum(['blog', 'external', 'article', 'project']),
    linkText: z.string().optional().default('Read more'),
  }),
});

export const collections = {
  feed: feedCollection,
};
