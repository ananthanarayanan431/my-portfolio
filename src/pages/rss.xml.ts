import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { SITE } from '../config/site';
import { filterDrafts, sortPostsByDate } from '../lib/posts';

export async function GET(context: APIContext) {
  const posts = sortPostsByDate(filterDrafts(await getCollection('blog'), false));
  return rss({
    title: `${SITE.name} — Blog`,
    description: SITE.description,
    site: context.site ?? 'https://example.com',
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/blog/${post.id}/`,
    })),
  });
}
