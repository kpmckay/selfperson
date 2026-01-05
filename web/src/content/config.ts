import { defineCollection, z } from 'astro:content';

const feedCollection = defineCollection({
  type: 'content',
  schema: z.object({
    date: z.date(),
    title: z.string(),
    summary: z.string(),
    link: z.string().optional(),
    linkText: z.string().optional().default('Read more'),
    tag: z.string().optional(),
  }),
});

export const collections = {
  feed: feedCollection,
};
