// src/lib/cms.ts
// Build-time fetch of the published CMS content. The build fails loudly on any
// unreachable endpoint, invalid JSON, or schema mismatch — there is no local or
// stale fallback. Content is the single source of truth for the page.

export type CmsLink = {
  href: string;
  labelI18n: string;
  tone?: 'primary' | 'secondary';
};

export type CmsMedia = {
  url: string;
  kind: 'image' | 'video';
  posterUrl?: string;
  alt?: string;
};

export type CmsProject = {
  i18nPrefix: string;
  tech: string[];
  layout: 'left' | 'right';
  diagramHtml: string;
  statusI18nKey?: string;
  demoI18nKey?: string;
  principleI18nKey?: string;
  factI18nKeys?: string[];
  links?: CmsLink[];
  media?: CmsMedia[];
};

export type CmsStack = {
  key: string;
  label: string;
  desc: string;
  count: string;
  countLabel: string;
  svgPath: string;
  primary: string[];
  items: string[];
};

export type CmsSettings = {
  name: string;
  title: string;
  description: string;
  siteUrl: string;
  email: string;
  linkedinUrl: string;
  githubUrl: string;
  phone: string;
  phoneLabel: string;
  avatarUrl: string;
  avatarLabel: string;
  heroChips: string[];
};

export type CmsContent = {
  translations: { en: Record<string, string>; id: Record<string, string> };
  projects: CmsProject[];
  stack: CmsStack[];
  settings: CmsSettings;
};

export type CmsPayload = {
  content: CmsContent;
  revision: number;
  publishedAt: string;
};

const DEFAULT_URL = 'http://localhost:3000/api/content';

const TEMPLATE_TRANSLATION_KEYS = [
  'nav.work', 'nav.ai', 'nav.stack', 'nav.projects', 'nav.contact',
  'hero.eyebrow', 'hero.h1.line1', 'hero.h1.line2', 'hero.h1.em1', 'hero.sub',
  'hero.role.1', 'hero.cta.primary', 'hero.cta.secondary',
  'stats.years.num', 'stats.years.unit', 'stats.years.label',
  'stats.services.num', 'stats.services.unit', 'stats.services.label',
  'stats.cert.num', 'stats.cert.label', 'stats.domains.num', 'stats.domains.label',
  'exp.kicker', 'exp.title', 'exp.desc',
  'exp.rivolta.date', 'exp.rivolta.present', 'exp.rivolta.role', 'exp.rivolta.company',
  'exp.rivolta.b1', 'exp.rivolta.b2', 'exp.rivolta.b3', 'exp.rivolta.b4', 'exp.rivolta.b5',
  'exp.ai.date', 'exp.ai.role', 'exp.ai.company', 'exp.ai.b1', 'exp.ai.b2', 'exp.ai.b3',
  'exp.be.date', 'exp.be.role', 'exp.be.company', 'exp.be.b1', 'exp.be.b2', 'exp.be.b3',
  'ai.title', 'ai.desc', 'ai.flow.input', 'ai.flow.retrieve', 'ai.flow.plan',
  'ai.flow.guard', 'ai.flow.execute', 'ai.flow.output',
  'ai.grounded.title', 'ai.grounded.desc', 'ai.constrained.title', 'ai.constrained.desc',
  'ai.deterministic.title', 'ai.deterministic.desc', 'ai.observable.title', 'ai.observable.desc',
  'ai.principle', 'stack.title', 'stack.desc', 'projects.title', 'projects.desc', 'projects.stat',
  'contact.eyebrow', 'contact.heading', 'contact.sub', 'contact.avail.status', 'contact.avail.remote', 'contact.avail.from',
  'footer.copy', 'footer.tagline',
] as const;

function fail(what: string): never {
  throw new Error(`[cms] invalid content: ${what}`);
}

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function str(v: unknown, where: string, allowEmpty = false): string {
  if (typeof v !== 'string' || (!allowEmpty && v.length === 0)) fail(`${where} must be ${allowEmpty ? 'a string' : 'a non-empty string'}`);
  return v;
}

function strArray(v: unknown, where: string): string[] {
  if (!Array.isArray(v) || v.some((x) => typeof x !== 'string' || x.length === 0))
    fail(`${where} must be an array of non-empty strings`);
  return v as string[];
}

function url(value: string, where: string, httpsOnly = false): string {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    fail(`${where} must be an absolute ${httpsOnly ? 'https' : 'http(s)'} URL`);
  }
  if (!(httpsOnly ? parsed.protocol === 'https:' : /^https?:$/.test(parsed.protocol)) ||
      parsed.username || parsed.password)
    fail(`${where} must be an absolute ${httpsOnly ? 'https' : 'http(s)'} URL without credentials`);
  return value;
}

function validateTranslations(raw: unknown): CmsContent['translations'] {
  if (!isObj(raw)) fail('content.translations must be an object');
  const out = {} as CmsContent['translations'];
  for (const lang of ['en', 'id'] as const) {
    const dict = (raw as Record<string, unknown>)[lang];
    if (!isObj(dict)) fail(`content.translations.${lang} must be an object`);
    const entries: Record<string, string> = {};
    for (const [k, v] of Object.entries(dict)) {
      if (typeof v !== 'string') fail(`content.translations.${lang}.${k} must be a string`);
      entries[k] = v;
    }
    out[lang] = entries;
  }
  const enKeys = Object.keys(out.en).sort();
  const idKeys = Object.keys(out.id).sort();
  if (enKeys.length !== idKeys.length || enKeys.some((k, i) => k !== idKeys[i]))
    fail('content.translations.en and content.translations.id key sets differ');
  for (const key of TEMPLATE_TRANSLATION_KEYS) {
    requireKey(out.en, key, 'template');
    requireKey(out.id, key, 'template');
  }
  return out;
}

function requireKey(dict: Record<string, string>, key: string, where: string): string {
  if (!Object.hasOwn(dict, key)) fail(`${where}: translation key "${key}" missing from content.translations`);
  return dict[key];
}

function validateProject(raw: unknown, i: number, en: Record<string, string>, id: Record<string, string>): CmsProject {
  const where = `content.projects[${i}]`;
  if (!isObj(raw)) fail(`${where} must be an object`);
  const prefix = str(raw.i18nPrefix, `${where}.i18nPrefix`);
  for (const suffix of ['.num', '.title', '.desc']) {
    requireKey(en, prefix + suffix, where);
    requireKey(id, prefix + suffix, where);
  }
  if (raw.layout !== 'left' && raw.layout !== 'right') fail(`${where}.layout must be "left" or "right"`);
  const project: CmsProject = {
    i18nPrefix: prefix,
    tech: strArray(raw.tech, `${where}.tech`),
    layout: raw.layout,
    diagramHtml: str(raw.diagramHtml, `${where}.diagramHtml`, true),
  };
  for (const field of ['statusI18nKey', 'demoI18nKey', 'principleI18nKey'] as const) {
    const key = raw[field];
    if (key !== undefined) {
      const k = str(key, `${where}.${field}`);
      requireKey(en, k, where);
      requireKey(id, k, where);
      project[field] = k;
    }
  }
  if (raw.factI18nKeys !== undefined) {
    const keys = strArray(raw.factI18nKeys, `${where}.factI18nKeys`);
    for (const k of keys) {
      requireKey(en, k, where);
      requireKey(id, k, where);
    }
    project.factI18nKeys = keys;
  }
  if (raw.links !== undefined) {
    if (!Array.isArray(raw.links)) fail(`${where}.links must be an array`);
    project.links = raw.links.map((l, j): CmsLink => {
      const lw = `${where}.links[${j}]`;
      if (!isObj(l)) fail(`${lw} must be an object`);
      const href = url(str(l.href, `${lw}.href`), `${lw}.href`);
      const labelI18n = str(l.labelI18n, `${lw}.labelI18n`);
      requireKey(en, labelI18n, lw);
      requireKey(id, labelI18n, lw);
      const link: CmsLink = { href, labelI18n };
      if (l.tone !== undefined) {
        if (l.tone !== 'primary' && l.tone !== 'secondary') fail(`${lw}.tone must be "primary" or "secondary"`);
        link.tone = l.tone;
      }
      return link;
    });
  }
  if (raw.media !== undefined) {
    if (!Array.isArray(raw.media)) fail(`${where}.media must be an array`);
    project.media = raw.media.map((m, j): CmsMedia => {
      const mw = `${where}.media[${j}]`;
      if (!isObj(m)) fail(`${mw} must be an object`);
      const mediaUrl = url(str(m.url, `${mw}.url`), `${mw}.url`, true);
      if (m.kind !== 'image' && m.kind !== 'video') fail(`${mw}.kind must be "image" or "video"`);
      const media: CmsMedia = { url: mediaUrl, kind: m.kind };
      if (m.posterUrl !== undefined) {
        const poster = url(str(m.posterUrl, `${mw}.posterUrl`), `${mw}.posterUrl`, true);
        media.posterUrl = poster;
      }
      if (m.alt !== undefined) media.alt = str(m.alt, `${mw}.alt`);
      return media;
    });
  }
  return project;
}

function validateStack(raw: unknown, i: number, en: Record<string, string>, id: Record<string, string>): CmsStack {
  const where = `content.stack[${i}]`;
  if (!isObj(raw)) fail(`${where} must be an object`);
  const key = str(raw.key, `${where}.key`);
  requireKey(en, `stack.${key}`, where);
  requireKey(id, `stack.${key}`, where);
  return {
    key,
    label: str(raw.label, `${where}.label`),
    desc: str(raw.desc, `${where}.desc`, true),
    count: str(raw.count, `${where}.count`),
    countLabel: str(raw.countLabel, `${where}.countLabel`, true),
    svgPath: str(raw.svgPath, `${where}.svgPath`, true),
    primary: strArray(raw.primary, `${where}.primary`),
    items: strArray(raw.items, `${where}.items`),
  };
}

function validateSettings(raw: unknown): CmsSettings {
  if (!isObj(raw)) fail('content.settings must be an object');
  const s = raw as Record<string, unknown>;
  const settings: CmsSettings = {
    name: str(s.name, 'settings.name'),
    title: str(s.title, 'settings.title'),
    description: str(s.description, 'settings.description'),
    siteUrl: str(s.siteUrl, 'settings.siteUrl'),
    email: str(s.email, 'settings.email'),
    linkedinUrl: str(s.linkedinUrl, 'settings.linkedinUrl'),
    githubUrl: str(s.githubUrl, 'settings.githubUrl'),
    phone: str(s.phone, 'settings.phone'),
    phoneLabel: str(s.phoneLabel, 'settings.phoneLabel'),
    avatarUrl: str(s.avatarUrl, 'settings.avatarUrl'),
    avatarLabel: str(s.avatarLabel, 'settings.avatarLabel'),
    heroChips: strArray(s.heroChips, 'settings.heroChips'),
  };
  url(settings.siteUrl, 'settings.siteUrl');
  url(settings.linkedinUrl, 'settings.linkedinUrl');
  url(settings.githubUrl, 'settings.githubUrl');
  if (settings.avatarUrl.startsWith('/')) {
    if (!/^\/(?!\/)/.test(settings.avatarUrl) || /[\\\s]/.test(settings.avatarUrl))
      fail('settings.avatarUrl must be an absolute https URL or a root-relative path');
  } else {
    url(settings.avatarUrl, 'settings.avatarUrl', true);
  }
  return settings;
}

function validate(raw: unknown): CmsPayload {
  if (!isObj(raw)) fail('response body must be a JSON object');
  if (!isObj(raw.content)) fail('content must be an object');
  const content = raw.content;
  const translations = validateTranslations(content.translations);
  if (!Array.isArray(content.projects))
    fail('content.projects must be an array');
  if (!Array.isArray(content.stack))
    fail('content.stack must be an array');
  const projects = content.projects.map((p, i) => validateProject(p, i, translations.en, translations.id));
  const stack = content.stack.map((s, i) => validateStack(s, i, translations.en, translations.id));
  const settings = validateSettings(content.settings);
  if (typeof raw.revision !== 'number' || !Number.isFinite(raw.revision))
    fail('revision must be a number');
  if (typeof raw.publishedAt !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(raw.publishedAt) ||
      Number.isNaN(Date.parse(raw.publishedAt)) ||
      new Date(`${raw.publishedAt.slice(0, 10)}T00:00:00Z`).toISOString().slice(0, 10) !== raw.publishedAt.slice(0, 10))
    fail('publishedAt must be an ISO datetime string');
  return { content: { translations, projects, stack, settings }, revision: raw.revision, publishedAt: raw.publishedAt };
}

export async function fetchCmsContent(): Promise<CmsPayload> {
  const url = process.env.CMS_CONTENT_URL || DEFAULT_URL;
  let res: Response;
  try {
    res = await fetch(url);
  } catch (err) {
    throw new Error(
      `[cms] cannot reach ${url}: ${err instanceof Error ? err.message : String(err)}. ` +
        'The build requires the CMS endpoint; no fallback content is allowed.'
    );
  }
  if (res.status !== 200) {
    throw new Error(`[cms] ${url} responded HTTP ${res.status} — expected 200. The build fails instead of falling back.`);
  }
  let body: unknown;
  try {
    body = await res.json();
  } catch (err) {
    throw new Error(`[cms] ${url} returned invalid JSON: ${err instanceof Error ? err.message : String(err)}`);
  }
  return validate(body);
}
