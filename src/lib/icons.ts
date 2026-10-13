// src/lib/icons.ts
// Resolves free-typed tech names (project.tech, stack.primary/items) to
// simple-icons brand marks at build time. Same normalization + alias rules as
// landing-page-dashboard/lib/server/icons.ts, kept as a local copy so the two
// sites render identical marks. Unrecognized names resolve to null and render
// as plain text — never an error. Only icons actually referenced get bundled.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const packageDir = join(process.cwd(), 'node_modules', 'simple-icons');

type SimpleIcon = { title: string; slug: string; hex: string };
const icons = JSON.parse(readFileSync(join(packageDir, 'data', 'simple-icons.json'), 'utf8')) as SimpleIcon[];
const byIndex = new Map(icons.map((icon) => [icon.slug, icon]));
const iconsDir = join(packageDir, 'icons');
const pathCache = new Map<string, string | null>();

/** Names that never slugify to the package slug and must be matched on the raw trimmed input. */
const RAW_ALIASES: Record<string, string> = { 'c++': 'cplusplus', 'c#': 'csharp', '.net': 'dotnet' };
/** Known renames or near-duplicates the plain slugify step cannot derive from a typed name. */
const SLUG_ALIASES: Record<string, string> = {
  nextjs: 'nextdotjs',
  nodejs: 'nodedotjs',
  vue: 'vuedotjs',
  tailwind: 'tailwindcss',
  maven: 'apachemaven',
  hibernatejpa: 'hibernate',
};

function readIconPath(slug: string): string | null {
  const cached = pathCache.get(slug);
  if (cached !== undefined) return cached;
  let path: string | null = null;
  try {
    const svg = readFileSync(join(iconsDir, `${slug}.svg`), 'utf8');
    path = svg.match(/<path[^>]*\sd="([^"]+)"/)?.[1] ?? null;
  } catch {
    path = null;
  }
  pathCache.set(slug, path);
  return path;
}

export type ResolvedTechIcon = { slug: string; title: string; hex: string; path: string };

export function resolveTechIcon(name: string): ResolvedTechIcon | null {
  const raw = name.trim().toLowerCase();
  if (!raw) return null;
  const candidate = raw.replace(/[^a-z0-9]+/g, '');
  const slug = RAW_ALIASES[raw] ?? SLUG_ALIASES[candidate] ?? candidate;
  const icon = byIndex.get(slug);
  if (!icon) return null;
  const path = readIconPath(icon.slug);
  if (!path) return null;
  return { slug: icon.slug, title: icon.title, hex: icon.hex, path };
}
