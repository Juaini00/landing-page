import assert from 'node:assert/strict';
import test from 'node:test';

const { fetchCmsContent } = await import('../src/lib/cms.ts');

function validPayload() {
  const keys = [
    'nav.work', 'nav.ai', 'nav.stack', 'nav.projects', 'nav.contact', 'nav.cta',
    'hero.eyebrow', 'hero.h1.line1', 'hero.h1.line2', 'hero.h1.em1', 'hero.sub',
    'hero.role.1', 'hero.cta.primary', 'hero.cta.secondary',
    'stats.years.num', 'stats.years.unit', 'stats.years.label',
    'stats.services.num', 'stats.services.unit', 'stats.services.label',
    'stats.cert.num', 'stats.cert.label', 'stats.domains.num', 'stats.domains.label', 'exp.kicker', 'exp.title', 'exp.desc',
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
    'footer.copy', 'footer.tagline', 'stack.langs',
    'project.01.num', 'project.01.title', 'project.01.desc', 'project.link.source',
  ];
  const dict = Object.fromEntries(keys.map((key) => [key, 'Test text']));
  return {
    content: {
      translations: { en: dict, id: { ...dict } },
      projects: [{
        i18nPrefix: 'project.01', tech: ['Rust'], layout: 'left',
        diagramHtml: '<div class="project-diagram"></div>',
        links: [{ href: 'https://example.com', labelI18n: 'project.link.source', tone: 'primary' }],
      }],
      stack: [{
        key: 'langs', label: 'Languages', desc: '// d', count: '2', countLabel: 'langs',
        svgPath: '<path d="M1 1"/>', primary: ['Rust'], items: [],
      }],
      settings: {
        name: 'J', title: 'T', description: 'D', siteUrl: 'https://x.dev', email: 'a@b.c',
        linkedinUrl: 'https://linkedin.com/in/j', githubUrl: 'https://github.com/j',
        phone: '+62812345678', phoneLabel: '+62', avatarUrl: '/av.jpeg', avatarLabel: '@j', heroChips: ['x'],
      },
    },
    revision: 1,
    publishedAt: '2026-10-11T00:00:00.000Z',
  };
}

async function withFetch(impl, fn, endpoint = 'https://cms.test/api/content') {
  const prevFetch = globalThis.fetch;
  const prevEndpoint = process.env.CMS_CONTENT_URL;
  globalThis.fetch = impl;
  if (endpoint === undefined) delete process.env.CMS_CONTENT_URL;
  else process.env.CMS_CONTENT_URL = endpoint;
  try {
    return await fn();
  } finally {
    globalThis.fetch = prevFetch;
    if (prevEndpoint === undefined) delete process.env.CMS_CONTENT_URL;
    else process.env.CMS_CONTENT_URL = prevEndpoint;
  }
}

async function fetchPayload(payload) {
  return withFetch(async () => new Response(JSON.stringify(payload), { status: 200 }), () => fetchCmsContent());
}


test('every non-200 status fails, including other successful statuses', async () => {
  for (const status of [201, 202, 204, 301, 404, 500]) {
    await assert.rejects(
      () => withFetch(async () => new Response(status === 204 ? null : JSON.stringify(validPayload()), { status }), () => fetchCmsContent()),
      new RegExp(`HTTP ${status}`)
    );
  }
});

test('unreachable endpoint and invalid JSON fail without fallback', async () => {
  await assert.rejects(
    () => withFetch(async () => { throw new Error('ECONNREFUSED'); }, () => fetchCmsContent()),
    /cannot reach https:\/\/cms\.test\/api\/content/
  );
  await assert.rejects(
    () => withFetch(async () => new Response('<html>', { status: 200 }), () => fetchCmsContent()),
    /invalid JSON/
  );
});

test('missing template translations fail even when both locales omit the same key', async () => {
  for (const key of ['hero.sub', 'stats.services.unit', 'exp.rivolta.b5', 'ai.observable.desc', 'projects.stat', 'footer.copy']) {
    const payload = validPayload();
    delete payload.content.translations.en[key];
    delete payload.content.translations.id[key];
    await assert.rejects(() => fetchPayload(payload), /translation key .* missing/);
  }
});

test('invalid declared content fields fail the build', async () => {
  const cases = [
    ['asymmetric dictionaries', (p) => { delete p.content.translations.id['nav.work']; }],
    ['project translation missing in both locales', (p) => {
      delete p.content.translations.en['project.01.title'];
      delete p.content.translations.id['project.01.title'];
    }],
    ['bad layout', (p) => { p.content.projects[0].layout = 'middle'; }],
    ['link label missing', (p) => { p.content.projects[0].links[0].labelI18n = 'missing'; }],
    ['inherited name is not a translation', (p) => { p.content.projects[0].statusI18nKey = 'toString'; }],
    ['fact translation missing', (p) => { p.content.projects[0].factI18nKeys = ['missing']; }],
    ['stack translation missing', (p) => { p.content.stack[0].key = 'missing'; }],
    ['missing settings field', (p) => { delete p.content.settings.email; }],
    ['non-numeric revision', (p) => { p.revision = 'five'; }],
    ['wrong collection type', (p) => { p.content.projects = {}; }],
  ];
  for (const [name, mutate] of cases) {
    const payload = validPayload();
    mutate(payload);
    await assert.rejects(() => fetchPayload(payload), /invalid content/, name);
  }
});

test('URLs reject malformed addresses, unsafe protocols, and credentials', async () => {
  const cases = [
    (p) => { p.content.settings.siteUrl = 'https://'; },
    (p) => { p.content.settings.linkedinUrl = 'javascript:alert(1)'; },
    (p) => { p.content.settings.githubUrl = 'https://user:pass@example.com'; },
    (p) => { p.content.projects[0].links[0].href = 'http://'; },
    (p) => { p.content.projects[0].links[0].href = 'https://user@example.com'; },
    (p) => { p.content.projects[0].media = [{ url: 'http://cdn.test/image.png', kind: 'image' }]; },
    (p) => { p.content.projects[0].media = [{ url: 'https://', kind: 'image' }]; },
    (p) => { p.content.projects[0].media = [{ url: 'https://cdn.test/a.mp4', kind: 'video', posterUrl: 'http://cdn.test/a.png' }]; },
    (p) => { p.content.settings.avatarUrl = '//external.test/avatar.png'; },
    (p) => { p.content.settings.avatarUrl = '/\\external.test/avatar.png'; },
    (p) => { p.content.settings.avatarUrl = 'http://external.test/avatar.png'; },
  ];
  for (const mutate of cases) {
    const payload = validPayload();
    mutate(payload);
    await assert.rejects(() => fetchPayload(payload), /invalid content/);
  }
});

test('publishedAt rejects non-ISO values and impossible calendar dates', async () => {
  for (const publishedAt of ['October 11, 2026', '2026-10-11', '2026-02-30T00:00:00.000Z', 'not a date']) {
    const payload = validPayload();
    payload.publishedAt = publishedAt;
    await assert.rejects(() => fetchPayload(payload), /publishedAt/);
  }
});


test('present optional fields cannot be null', async () => {
  for (const field of ['statusI18nKey', 'demoI18nKey', 'principleI18nKey', 'factI18nKeys', 'links', 'media']) {
    const payload = validPayload();
    payload.content.projects[0][field] = null;
    await assert.rejects(() => fetchPayload(payload), /invalid content/, field);
  }
  for (const field of ['posterUrl', 'alt']) {
    const payload = validPayload();
    payload.content.projects[0].media = [{ url: 'https://cdn.test/a.png', kind: 'image', [field]: null }];
    await assert.rejects(() => fetchPayload(payload), /invalid content/, field);
  }
});

