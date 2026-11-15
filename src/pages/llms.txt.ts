import type { APIRoute } from 'astro';
import { getCmsContent } from '../lib/cms';
import { buildLlmsTxt } from '../lib/seo';

export const GET: APIRoute = async () =>
  new Response(buildLlmsTxt(await getCmsContent()), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
