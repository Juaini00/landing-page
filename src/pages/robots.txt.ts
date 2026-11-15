import type { APIRoute } from 'astro';
import { getCmsContent } from '../lib/cms';
import { buildRobotsTxt } from '../lib/seo';

export const GET: APIRoute = async () => {
  const { content } = await getCmsContent();
  return new Response(buildRobotsTxt(content.settings.siteUrl), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
