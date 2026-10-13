// src/lib/embed.ts
// Serialize a value for inline embedding in a <script> block: escapes "<"
// (covers "</script>") and the JS-only line terminators U+2028/U+2029.

export function embeddableJson(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}
