// src/lib/sprite.ts
// Build-time SVG sprite assembly. All icons ship as inline <symbol>s in one
// sprite at the top of <body> (used via <use href="#...">) — no hotlinked
// icon APIs, which rate-limit (HTTP 429) once a page loads 100+ icons.
//
// - Tabler line icons (UI chrome): read from @tabler/icons, stroke-based.
// - simple-icons brand marks: paths collected from src/lib/icons.ts, fill-based.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { resolveTechIcon } from './icons.ts';

const tablerDir = join(process.cwd(), 'node_modules', '@tabler', 'icons', 'icons', 'outline');
const tablerCache = new Map<string, string | null>();

function tablerInner(name: string): string | null {
  const cached = tablerCache.get(name);
  if (cached !== undefined) return cached;
  let inner: string | null = null;
  try {
    const svg = readFileSync(join(tablerDir, `${name}.svg`), 'utf8');
    inner = svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').trim();
    if (!inner) inner = null;
  } catch {
    inner = null;
  }
  tablerCache.set(name, inner);
  return inner;
}

/**
 * Builds the sprite. `chromeIcons` are Tabler outline names used by the page
 * design; `techNames` are free-typed tech strings resolved to brand slugs.
 * Returns the sprite markup plus a name→symbol-id map for chrome icons and a
 * tech-name→symbol-id map for brand marks (null = render plain text).
 */
export function buildSprite(chromeIcons: string[], techNames: string[]) {
  const symbols: string[] = [];
  const chromeIds = new Map<string, string | null>();
  const techIds = new Map<string, string | null>();

  for (const name of chromeIcons) {
    const inner = tablerInner(name);
    if (!inner) {
      chromeIds.set(name, null);
      continue;
    }
    const id = `i-${name}`;
    // Tabler outline SVGs are 24x24 stroke art; carry the presentation attrs on the symbol.
    symbols.push(
      `<symbol id="${id}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</symbol>`
    );
    chromeIds.set(name, id);
  }

  const seenBrand = new Set<string>();
  for (const name of techNames) {
    if (techIds.has(name)) continue;
    const resolved = resolveTechIcon(name);
    if (!resolved) {
      techIds.set(name, null);
      continue;
    }
    if (!seenBrand.has(resolved.slug)) {
      seenBrand.add(resolved.slug);
      symbols.push(
        `<symbol id="b-${resolved.slug}" viewBox="0 0 24 24" fill="currentColor"><path d="${resolved.path}"/></symbol>`
      );
    }
    techIds.set(name, `b-${resolved.slug}`);
  }

  return { sprite: `<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">${symbols.join('')}</svg>`, chromeIds, techIds };
}
