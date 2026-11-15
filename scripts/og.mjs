// Renders public/og.png (1200×630 social card) from the live CMS content.
// Run after changing name/title/chips: `npm run og`, then commit the PNG.
// ponytail: generated locally and committed, because system fonts used by the SVG
// text are not guaranteed on the build host. Move to satori if it must be fully automatic.
import sharp from 'sharp';
import { fetchCmsContent } from '../src/lib/cms.ts';
import { plainText } from '../src/lib/seo.ts';

const W = 1200, H = 630, PHOTO_W = 400, PHOTO_H = 510, PAD = 60;
const { content } = await fetchCmsContent();
const { settings } = content;
const en = content.translations.en;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const font = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const mono = "Menlo, 'SF Mono', monospace";

const [role, focus = ''] = plainText(en['hero.eyebrow']).split(' · ');
let x = PAD;
const chips = settings.heroChips.map((label) => {
  const w = label.length * 11 + 36;
  const chip = `<rect x="${x}" y="452" width="${w}" height="40" rx="20" fill="#ffffff" fill-opacity=".08" stroke="#ffffff" stroke-opacity=".16"/>
    <text x="${x + w / 2}" y="478" text-anchor="middle" font-family="${mono}" font-size="17" fill="#e8edf2">${esc(label)}</text>`;
  x += w + 12;
  return chip;
}).join('');

const card = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <radialGradient id="glow" cx="20%" cy="0%" r="80%"><stop offset="0" stop-color="#1d2733"/><stop offset="1" stop-color="#0b0e12"/></radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <circle cx="${PAD + 7}" cy="96" r="7" fill="#34c759"/>
  <text x="${PAD + 26}" y="102" font-family="${mono}" font-size="18" letter-spacing="2" fill="#d0d8e0">${esc(`${plainText(en['contact.avail.status'])} · ${plainText(en['contact.avail.remote'])}`.toUpperCase())}</text>
  <text x="${PAD - 4}" y="250" font-family="${font}" font-weight="800" font-size="132" letter-spacing="-3" fill="#e8edf2">${esc(settings.name)}</text>
  <text x="${PAD}" y="318" font-family="${font}" font-weight="600" font-size="44" fill="#e8edf2">${esc(role)}</text>
  <text x="${PAD}" y="366" font-family="${font}" font-size="28" fill="#9aa6b2">${esc(focus)}</text>
  ${chips}
  <text x="${PAD}" y="${H - 52}" font-family="${mono}" font-size="20" fill="#9aa6b2">${esc(new URL(settings.siteUrl).host)}</text>
</svg>`;

const radius = Buffer.from(`<svg width="${PHOTO_W}" height="${PHOTO_H}"><rect width="${PHOTO_W}" height="${PHOTO_H}" rx="28"/></svg>`);
const photo = await sharp(new URL(`../public${settings.avatarUrl}`, import.meta.url).pathname)
  // Upper-body crop of the portrait avatar so the face reads at thumbnail size.
  .extract({ left: 282, top: 180, width: 1100, height: 1402 })
  .resize(PHOTO_W, PHOTO_H, { fit: 'cover' })
  .composite([{ input: radius, blend: 'dest-in' }])
  .png()
  .toBuffer();

await sharp(Buffer.from(card))
  .composite([{ input: photo, left: W - PHOTO_W - PAD, top: (H - PHOTO_H) / 2 }])
  .png({ compressionLevel: 9 })
  .toFile(new URL('../public/og.png', import.meta.url).pathname);
