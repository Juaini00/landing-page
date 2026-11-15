import type { APIRoute } from 'astro';
import { getCmsContent } from '../lib/cms';
import { buildSitemap } from '../lib/seo';

export const GET: APIRoute = async () => {
  const { content, publishedAt } = await getCmsContent();
  return new Response(buildSitemap(content.settings.siteUrl, publishedAt), { headers: { 'Content-Type': 'application/xml' } });
};
