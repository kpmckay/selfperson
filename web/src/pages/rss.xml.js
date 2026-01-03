import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { siteConfig } from '../config';

export async function GET(context) {
  // Get all feed entries and sort by date (newest first)
  const feedEntries = await getCollection('feed');
  const sortedEntries = feedEntries.sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime()
  );

  // Construct the full site URL with base path
  const baseUrl = import.meta.env.BASE_URL || '/';
  const siteUrl = new URL(baseUrl, context.site).href;

  return rss({
    // Feed metadata
    title: `${siteConfig.name} - Activity Feed`,
    description: siteConfig.description,

    // Use the site URL with base path
    site: siteUrl,

    // Map your feed collection entries to RSS items
    items: sortedEntries.map((entry) => {
      // Determine if the link is external or internal
      const isExternal = entry.data.link.startsWith('http://') ||
                        entry.data.link.startsWith('https://');

      // For internal links, prepend the site URL with base path
      // For external links, use as-is
      let link;
      if (isExternal) {
        link = entry.data.link;
      } else {
        // Remove leading slash and append to site URL
        const cleanPath = entry.data.link.replace(/^\//, '');
        link = siteUrl.endsWith('/')
          ? `${siteUrl}${cleanPath}`
          : `${siteUrl}/${cleanPath}`;
      }

      return {
        title: entry.data.title,
        description: entry.data.summary,
        link: link,
        pubDate: entry.data.date,
        // Add categories based on type
        categories: [entry.data.type],
      };
    }),

    // Customize XML namespace for additional features
    customData: `<language>en-us</language>`,
  });
}
