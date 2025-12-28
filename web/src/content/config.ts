import { defineCollection, z } from 'astro:content';

const feedCollection = defineCollection({
  type: 'content',
  schema: z.object({
    date: z.date(),
    title: z.string(),
    summary: z.string(),
    link: z.string().url(),
    type: z.enum(['blog', 'external', 'article', 'project']),
  }),
});

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    tags: z.array(z.string()).optional(),
    draft: z.boolean().optional().default(false),
  }),
});

export const collections = {
  feed: feedCollection,
  blog: blogCollection,
};
