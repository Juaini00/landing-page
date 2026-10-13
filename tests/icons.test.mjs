import assert from 'node:assert/strict';
import test from 'node:test';

const { resolveTechIcon } = await import('../src/lib/icons.ts');
const { buildSprite } = await import('../src/lib/sprite.ts');

test('tech names normalize to simple-icons slugs', () => {
  assert.equal(resolveTechIcon('Rust')?.slug, 'rust');
  assert.equal(resolveTechIcon('Next.js')?.slug, 'nextdotjs');
  assert.equal(resolveTechIcon('Node.js')?.slug, 'nodedotjs');
  assert.equal(resolveTechIcon('Vue')?.slug, 'vuedotjs');
  assert.equal(resolveTechIcon('Tailwind')?.slug, 'tailwindcss');
  assert.equal(resolveTechIcon('Maven')?.slug, 'apachemaven');
  assert.equal(resolveTechIcon('Hibernate / JPA')?.slug, 'hibernate');
});

test('C++ matches the raw alias before stripping', () => {
  assert.equal(resolveTechIcon('C++')?.slug, 'cplusplus');
});

test('unknown names resolve to null (plain text, never an error)', () => {
  assert.equal(resolveTechIcon('Secure REST'), null);
  assert.equal(resolveTechIcon('LLM Planning'), null);
  assert.equal(resolveTechIcon(''), null);
  assert.equal(resolveTechIcon('Java'), null);
  assert.equal(resolveTechIcon('JUnit'), null);
});

test('sprite bundles only referenced icons', () => {
  const { sprite, chromeIds, techIds } = buildSprite(['briefcase'], ['Rust', 'Next.js', 'Nope Tech']);
  assert.match(sprite, /<symbol id="i-briefcase"/);
  assert.match(sprite, /<symbol id="b-rust"/);
  assert.match(sprite, /<symbol id="b-nextdotjs"/);
  assert.doesNotMatch(sprite, /i-menu/);
  assert.equal(chromeIds.get('briefcase'), 'i-briefcase');
  assert.equal(techIds.get('Rust'), 'b-rust');
  assert.equal(techIds.get('Nope Tech'), null);
});

