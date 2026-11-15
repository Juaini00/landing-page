// src/lib/seo.ts
// Machine-readable views of the CMS content for search engines and AI answer
// engines (GEO): JSON-LD graph, llms.txt, robots.txt and sitemap.xml. All are
// derived from the same validated CMS payload the page renders.
import type { CmsContent, CmsPayload, CmsSettings } from './cms';

// Experience entries in page order; keys are guaranteed by cms.ts template keys.
const JOBS = ['rivolta', 'ai', 'be'] as const;
const AI_PRINCIPLES = ['grounded', 'constrained', 'deterministic', 'observable'] as const;

// AI crawlers allowed explicitly so the intent is unambiguous to answer engines.
const AI_CRAWLERS = [
  'GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-User', 'Claude-SearchBot',
  'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot-Extended', 'CCBot',
] as const;

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", apos: "'", nbsp: ' ' };

export type CreatorLink = { key: 'youtube' | 'instagram' | 'facebook'; label: string; url: string; handle: string };

// Engineering-content channels configured in the CMS, in display order.
export function creatorLinks(settings: CmsSettings): CreatorLink[] {
  const links = ([
    ['youtube', 'YouTube', settings.youtubeUrl],
    ['instagram', 'Instagram', settings.instagramUrl],
    ['facebook', 'Facebook', settings.facebookUrl],
  ] as const).filter((l): l is readonly [CreatorLink['key'], string, string] => Boolean(l[2]));
  // Handle = last path segment ("@tekngobrol" / "tekngobrol"); id-style URLs
  // (facebook profile.php?id=…) borrow the brand handle from the other channels.
  const segment = (u: string) => new URL(u).pathname.split('/').filter(Boolean).pop()?.replace(/^@/, '') ?? '';
  const brand = links.map(([, , u]) => segment(u)).find((h) => h && !h.includes('.')) ?? '';
  return links.map(([key, label, url]) => {
    const own = segment(url);
    return { key, label, url, handle: `@${own && !own.includes('.') ? own : brand}` };
  });
}

export function plainText(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&(amp|lt|gt|quot|#39|apos|nbsp);/g, (_, e: string) => ENTITIES[e])
    .replace(/\s+/g, ' ')
    .trim();
}

export function absoluteUrl(path: string, siteUrl: string): string {
  return new URL(path, siteUrl).href;
}

function t(content: CmsContent, key: string): string {
  return plainText(content.translations.en[key] ?? '');
}

function jobBullets(content: CmsContent, job: string): string[] {
  const re = new RegExp(`^exp\\.${job}\\.b(\\d+)$`);
  return Object.keys(content.translations.en)
    .map((k) => [k, re.exec(k)?.[1]] as const)
    .filter((e): e is readonly [string, string] => e[1] !== undefined)
    .sort((a, b) => Number(a[1]) - Number(b[1]))
    .map(([k]) => t(content, k));
}

// footer.copy is "© YYYY Name · City, CC"; the last segment is the location.
function location(content: CmsContent): string {
  return t(content, 'footer.copy').split('·').pop()?.trim() ?? '';
}

function technologies(content: CmsContent): string[] {
  return [...new Set(content.stack.flatMap((s) => [...s.primary, ...s.items]))];
}

function projectInfo(content: CmsContent) {
  return content.projects.map((p) => {
    const links = p.links ?? [];
    return {
      name: t(content, `${p.i18nPrefix}.title`),
      description: t(content, `${p.i18nPrefix}.desc`),
      facts: (p.factI18nKeys ?? []).map((k) => t(content, k)),
      tech: p.tech,
      repo: links.find((l) => new URL(l.href).hostname === 'github.com')?.href,
      site: links.find((l) => new URL(l.href).hostname !== 'github.com')?.href,
    };
  });
}

export function buildStructuredData({ content, publishedAt }: CmsPayload) {
  const s = content.settings;
  const home = absoluteUrl('/', s.siteUrl);
  const personId = `${home}#person`;
  const creators = creatorLinks(s);
  const person = {
    '@type': 'Person',
    '@id': personId,
    name: s.name,
    url: home,
    image: absoluteUrl(s.avatarUrl, s.siteUrl),
    jobTitle: creators.length
      ? [t(content, 'exp.rivolta.role') || 'Software Engineer', 'Tech Content Creator']
      : t(content, 'exp.rivolta.role') || 'Software Engineer',
    description: s.description,
    email: `mailto:${s.email}`,
    worksFor: { '@type': 'Organization', name: t(content, 'exp.rivolta.company') },
    homeLocation: { '@type': 'Place', name: location(content) },
    knowsAbout: technologies(content),
    sameAs: [s.linkedinUrl, s.githubUrl, ...creators.map((c) => c.url)],
  };
  const projects = projectInfo(content).map((p, i) => ({
    '@type': p.repo ? 'SoftwareSourceCode' : 'CreativeWork',
    '@id': `${home}#project-${i + 1}`,
    name: p.name,
    description: [p.description, ...p.facts].join(' '),
    keywords: p.tech.join(', '),
    author: { '@id': personId },
    ...(p.repo && { codeRepository: p.repo }),
    ...(p.site && { url: p.site }),
  }));
  return {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebSite', '@id': `${home}#website`, url: home, name: s.title, inLanguage: ['en', 'id'], publisher: { '@id': personId } },
      {
        '@type': 'ProfilePage',
        '@id': `${home}#profile`,
        url: home,
        name: s.title,
        description: s.description,
        isPartOf: { '@id': `${home}#website` },
        mainEntity: { '@id': personId },
        dateModified: publishedAt,
        hasPart: projects.map((p) => ({ '@id': p['@id'] })),
      },
      person,
      ...projects,
    ],
  };
}

// https://llmstxt.org — a plain markdown brief AI assistants can cite directly.
export function buildLlmsTxt({ content }: CmsPayload): string {
  const s = content.settings;
  const lines = [
    `# ${s.name} — Software Engineer`,
    '',
    `> ${s.description}`,
    '',
    t(content, 'hero.sub'),
    '',
    `- Website: ${absoluteUrl('/', s.siteUrl)}`,
    `- GitHub: ${s.githubUrl}`,
    `- LinkedIn: ${s.linkedinUrl}`,
    `- Email: ${s.email}`,
    ...creatorLinks(s).map((c) => `- ${c.label} (engineering content, ${c.handle}): ${c.url}`),
    `- Location: ${location(content)}`,
    `- Availability: ${t(content, 'contact.avail.status')} · ${t(content, 'contact.avail.remote')}`,
    '',
    '## Experience',
    '',
  ];
  for (const job of JOBS) {
    const date = [t(content, `exp.${job}.date`), job === 'rivolta' ? t(content, 'exp.rivolta.present') : '']
      .filter(Boolean).join(' — ');
    lines.push(`### ${t(content, `exp.${job}.role`)} · ${t(content, `exp.${job}.company`)} (${date})`, '');
    lines.push(...jobBullets(content, job).map((b) => `- ${b}`), '');
  }
  const creators = creatorLinks(s);
  if (creators.length) {
    lines.push('## Content creator', '');
    lines.push(`${s.name} also creates software-engineering content as ${creators[0].handle}, sharing practical lessons from building production systems.`, '');
    lines.push(...creators.map((c) => `- [${c.label}](${c.url})`), '');
  }
  lines.push('## Applied AI approach', '', t(content, 'ai.desc'), '');
  lines.push(...AI_PRINCIPLES.map((p) => `- **${t(content, `ai.${p}.title`)}**: ${t(content, `ai.${p}.desc`)}`), '');
  lines.push('## Projects', '');
  for (const p of projectInfo(content)) {
    const link = p.site ?? p.repo;
    lines.push(`### ${link ? `[${p.name}](${link})` : p.name}`, '', p.description, '');
    if (p.facts.length) lines.push(...p.facts.map((f) => `- ${f}`), '');
    lines.push(`Tech: ${p.tech.join(', ')}`, '');
    if (p.repo && p.site) lines.push(`Source: ${p.repo}`, '');
  }
  lines.push('## Skills', '');
  lines.push(...content.stack.map((st) => `- **${plainText(st.label)}**: ${[...st.primary, ...st.items].join(', ')}`), '');
  return lines.join('\n');
}

export function buildRobotsTxt(siteUrl: string): string {
  return [
    'User-agent: *',
    'Allow: /',
    '',
    ...AI_CRAWLERS.map((bot) => `User-agent: ${bot}`),
    'Allow: /',
    '',
    `Sitemap: ${absoluteUrl('/sitemap.xml', siteUrl)}`,
    '',
  ].join('\n');
}

export function buildSitemap(siteUrl: string, lastmod: string): string {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    `  <url><loc>${absoluteUrl('/', siteUrl)}</loc><lastmod>${lastmod}</lastmod></url>`,
    '</urlset>',
    '',
  ].join('\n');
}
