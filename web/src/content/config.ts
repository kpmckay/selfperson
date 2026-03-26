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
    images: z.array(z.string()).optional(),
  }),
});

const articlesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    date: z.date(),
    title: z.string(),
    description: z.string(),
    tag: z.string().optional(),
  }),
});

export const collections = {
  feed: feedCollection,
  articles: articlesCollection,
};
