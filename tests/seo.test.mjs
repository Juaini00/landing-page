import assert from 'node:assert/strict';
import test from 'node:test';

const { plainText, creatorLinks, buildStructuredData, buildLlmsTxt, buildRobotsTxt, buildSitemap } = await import('../src/lib/seo.ts');

function payload() {
  const en = {
    'hero.sub': "I'm <strong>Ana</strong> &amp; I build.",
    'footer.copy': '© 2026 Ana · Banjarmasin, ID',
    'exp.rivolta.role': 'Software Engineer', 'exp.rivolta.company': 'Acme', 'exp.rivolta.date': '2024', 'exp.rivolta.present': 'Present',
    'exp.rivolta.b2': 'second', 'exp.rivolta.b1': 'first', 'exp.rivolta.b10': 'tenth',
    'project.01.title': 'Repo Tool', 'project.01.desc': 'Does <em>things</em>', 'project.01.fact1': 'fast',
  };
  return {
    publishedAt: '2026-11-01T00:00:00Z',
    content: {
      translations: { en, id: en },
      stack: [{ label: 'Backend', primary: ['Java'], items: ['Rust', 'Java'] }],
      projects: [{ i18nPrefix: 'project.01', tech: ['Rust'], factI18nKeys: ['project.01.fact1'], links: [
        { href: 'https://github.com/ana/tool', labelI18n: 'x' }, { href: 'https://tool.dev/', labelI18n: 'y' },
      ] }],
      settings: { name: 'Ana', title: 'Ana — SE', description: 'desc', siteUrl: 'https://ana.dev', email: 'a@ana.dev',
        linkedinUrl: 'https://linkedin.com/in/ana', githubUrl: 'https://github.com/ana', avatarUrl: '/a.jpg', avatarLabel: 'Ana',
        youtubeUrl: 'https://www.youtube.com/@anacode', facebookUrl: 'https://www.facebook.com/profile.php?id=123' },
    },
  };
}

test('plainText strips tags and decodes entities', () => {
  assert.equal(plainText("<b>A</b> &amp; B&#39;s\n  x"), "A & B's x");
});

test('structured data links person, profile and projects by @id', () => {
  const graph = buildStructuredData(payload())['@graph'];
  const person = graph.find((n) => n['@type'] === 'Person');
  const project = graph.find((n) => n['@type'] === 'SoftwareSourceCode');
  assert.equal(person.image, 'https://ana.dev/a.jpg');
  assert.equal(person.homeLocation.name, 'Banjarmasin, ID');
  assert.deepEqual(person.knowsAbout, ['Java', 'Rust']);
  assert.equal(project.codeRepository, 'https://github.com/ana/tool');
  assert.equal(project.url, 'https://tool.dev/');
  assert.deepEqual(project.author, { '@id': person['@id'] });
  assert.equal(graph.find((n) => n['@type'] === 'ProfilePage').mainEntity['@id'], person['@id']);
});

test('llms.txt is plain markdown with ordered bullets', () => {
  const md = buildLlmsTxt(payload());
  assert.ok(md.startsWith('# Ana — Software Engineer'));
  assert.ok(!/<[a-z]/.test(md));
  assert.ok(md.indexOf('- first') < md.indexOf('- second') && md.indexOf('- second') < md.indexOf('- tenth'));
  assert.ok(md.includes('### [Repo Tool](https://tool.dev/)'));
});

test('robots and sitemap point at absolute URLs', () => {
  assert.ok(buildRobotsTxt('https://ana.dev').includes('Sitemap: https://ana.dev/sitemap.xml'));
  assert.ok(buildSitemap('https://ana.dev', '2026-11-01T00:00:00Z').includes('<loc>https://ana.dev/</loc>'));
});

test('creator links derive handles, borrowing the brand for id-style URLs', () => {
  assert.deepEqual(creatorLinks(payload().content.settings).map((c) => [c.key, c.handle]), [
    ['youtube', '@anacode'], ['facebook', '@anacode'],
  ]);
  assert.deepEqual(creatorLinks({ ...payload().content.settings, youtubeUrl: undefined, facebookUrl: '' }), []);
});

test('creator channels join sameAs, jobTitle and llms.txt', () => {
  const person = buildStructuredData(payload())['@graph'].find((n) => n['@type'] === 'Person');
  assert.ok(person.sameAs.includes('https://www.youtube.com/@anacode'));
  assert.deepEqual(person.jobTitle, ['Software Engineer', 'Tech Content Creator']);
  assert.ok(buildLlmsTxt(payload()).includes('## Content creator'));
});
