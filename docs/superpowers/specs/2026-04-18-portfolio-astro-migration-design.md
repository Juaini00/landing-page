# Portfolio Astro Migration — Design Spec
**Date:** 2026-04-18  
**Status:** Approved

---

## Goal

Migrate the existing vanilla HTML/CSS portfolio (`/Juaini Portfolio/landing.html`) into a production-ready Astro project at `/landing-page/`, using Tailwind CSS for styling and adding multi-language support (EN default, ID toggle).

---

## Target Audience

- **Recruiters / HRD** — looking for a software engineer (job seeking)
- **Freelance clients** — looking for a backend/full-stack developer

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Astro (existing project, `astro@^6.1.8`) |
| Styling | Tailwind CSS v4 (via `@astrojs/tailwind`) |
| Language | TypeScript |
| i18n | Manual JSON files (no library) |
| Fonts | Google Fonts: Instrument Serif, JetBrains Mono, Inter |
| JS | Minimal vanilla (lang toggle, nav scroll behavior) |
| Deploy | Vercel (existing target) |

---

## Architecture

### File Structure

```
src/
├── layouts/
│   └── Layout.astro          # <html>, <head>, fonts, global base styles
├── pages/
│   └── index.astro           # Composes all section components
├── components/
│   ├── Nav.astro             # Sticky nav, lang toggle (EN|ID), CTA
│   ├── Hero.astro            # Eyebrow, display h1, sub, CTA row, terminal card
│   ├── Stats.astro           # 4-column stat strip (3yrs, 12+ services, 4.00, 3 domains)
│   ├── Experience.astro      # Timeline-style work history (2 entries)
│   ├── Stack.astro           # 8-cell grid: Languages, Backend, Frontend, Data, Cloud, Testing, Tooling, Practices
│   ├── Projects.astro        # 3 project cards with architecture diagrams
│   ├── Contact.astro         # CTA section with email + social links
│   └── Footer.astro          # Copyright + tagline
└── i18n/
    ├── en.json               # All English copy
    └── id.json               # All Indonesian copy
```

### Page Sections (in order)

1. **Nav** — `juaini.dev` brand, links (Work, Stack, Projects, Contact), `EN | ID` toggle, `Let's talk →` CTA
2. **Hero** — eyebrow label, display heading `"Backend systems, built to scale & last."`, sub paragraph, CTA buttons, terminal card (whoami output)
3. **Stats Strip** — `3yrs`, `12+`, `4.00`, `3 domains`
4. **Experience** — PT Rivolta Technology Solutions (Apr 2024–present), Backend Engineer (Aug 2023–Feb 2025)
5. **Stack** — 8-cell grid with tech chips by category
6. **Projects** — 3 cards: Event Management Platform, Warehouse Logistics System, Loan Pre-Closure Engine (each with architecture diagram)
7. **Contact** — `"Got a backend that needs a steady hand?"`, email CTA, LinkedIn + portfolio links
8. **Footer** — `© 2026 Juaini · Hulu Sungai Tengah, ID`

---

## Design Tokens

All custom tokens registered in `tailwind.config.mjs` under `theme.extend.colors`:

```js
colors: {
  bg:        '#0b0c0f',
  'bg-2':    '#111318',
  ink:       '#f5f3ee',
  'ink-dim': '#9aa0a8',
  'ink-mute':'#5b6069',
  line:      '#1d2026',
  'line-2':  '#262a32',
  accent:    '#ff7a45',
  'accent-soft': '#ffb38a',
  green:     '#7ee0a6',
  violet:    '#b5a8ff',
}
```

Fonts registered as `fontFamily`:
```js
fontFamily: {
  serif: ['Instrument Serif', 'ui-serif', 'Georgia', 'serif'],
  sans:  ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
  mono:  ['JetBrains Mono', 'ui-monospace', 'Menlo', 'monospace'],
}
```

---

## Multi-Language (i18n)

### Strategy
- Default language: **English**
- Secondary: **Indonesian**
- Toggle: `EN | ID` button in navbar
- Persistence: `localStorage.setItem('lang', 'en'|'id')`
- Swap: JavaScript reads `lang` on page load and replaces all `data-i18n="key"` elements

### Content Keys (partial)
```json
{
  "nav.work": "Work",
  "nav.stack": "Stack",
  "nav.projects": "Projects",
  "nav.contact": "Contact",
  "nav.cta": "Let's talk →",
  "hero.eyebrow": "Software Engineer · Available for work",
  "hero.h1": "Backend systems, built to <em>scale</em> & <em>last.</em>",
  "hero.sub": "I'm <strong>Juaini</strong> — a software engineer with <strong>3+ years</strong> ...",
  "hero.cta.primary": "Start a project",
  "hero.cta.secondary": "View portfolio",
  "contact.heading": "Got a backend that needs a <em>steady hand?</em>",
  "contact.sub": "I'm open to freelance engagements, full-time roles..."
}
```

---

## Responsive Breakpoints

- **≥900px:** Two-column hero grid, 4-col stack grid, 4-col stats strip, nav links visible
- **<900px:** Single column hero, 2-col stack grid, 2-col stats strip, nav links hidden (hamburger optional later)

---

## Out of Scope (for this phase)

- 3D avatar / character — future improvement
- Blog section
- Project detail pages
- Contact form (email link only)
- Hamburger menu for mobile nav
- Dark/light mode toggle

---

## Success Criteria

- [ ] All 8 sections rendered, visually identical to `landing.html`
- [ ] Tailwind classes replace all inline CSS
- [ ] EN/ID toggle works and persists across refresh
- [ ] Responsive layout correct at mobile and desktop
- [ ] Astro build (`npm run build`) succeeds with zero errors
- [ ] Fonts load correctly (Instrument Serif, JetBrains Mono, Inter)
