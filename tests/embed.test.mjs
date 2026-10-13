import assert from 'node:assert/strict';
import test from 'node:test';

const { embeddableJson } = await import('../src/lib/embed.ts');

test('embedded dictionaries cannot break out of a script tag', () => {
  const json = embeddableJson({ en: { k: '</script><script>alert(1)</script>' }, id: { k: 'x' } });
  assert.ok(!json.includes('</script'));
  assert.ok(!json.includes('<script'));
  assert.deepEqual(JSON.parse(json), { en: { k: '</script><script>alert(1)</script>' }, id: { k: 'x' } });
});

test('U+2028 and U+2029 are escaped to JS-safe sequences', () => {
  const json = embeddableJson({ s: 'a\u2028b\u2029c' });
  assert.ok(!json.includes('\u2028'));
  assert.ok(!json.includes('\u2029'));
  assert.equal(JSON.parse(json).s, 'a\u2028b\u2029c');
});
