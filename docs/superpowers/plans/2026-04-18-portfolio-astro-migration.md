# Portfolio Astro Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the vanilla HTML portfolio at `/Users/tabrezakhlaque/project/personal/Juaini Portfolio/landing.html` to a production-ready Astro 6 + Tailwind CSS v4 project at `/Users/tabrezakhlaque/project/personal/landing-page/`, with multi-language EN/ID toggle.

**Architecture:** Single-page Astro app. Eight focused section components composed in `index.astro`. Tailwind v4 CSS-first config via `@theme` block in global CSS. Client-side i18n with `data-i18n` attributes swapped via a small inline script on page load; lang preference persisted in `localStorage`.

**Tech Stack:** Astro 6.1.8, Tailwind CSS v4 (`@tailwindcss/vite`), TypeScript, Google Fonts (Instrument Serif · JetBrains Mono · Inter)

**Reference file to match:** `/Users/tabrezakhlaque/project/personal/Juaini Portfolio/landing.html`

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| Create | `src/styles/global.css` | `@import "tailwindcss"`, `@theme` tokens, base reset |
| Modify | `astro.config.mjs` | Add Tailwind v4 Vite plugin |
| Create | `src/layouts/Layout.astro` | `<html>`, `<head>`, Google Fonts, global CSS import |
| Create | `src/i18n/en.json` | All English copy |
| Create | `src/i18n/id.json` | All Indonesian copy |
| Create | `src/scripts/i18n.ts` | Client-side lang swap + localStorage logic |
| Create | `src/components/Nav.astro` | Sticky nav, brand, links, `EN\|ID` toggle, CTA |
| Create | `src/components/Hero.astro` | Eyebrow, display h1, sub, CTA row, terminal card |
| Create | `src/components/Stats.astro` | 4-column stat strip |
| Create | `src/components/Experience.astro` | Two work history entries |
| Create | `src/components/Stack.astro` | 8-cell tech stack grid |
| Create | `src/components/Projects.astro` | 3 project cards with architecture diagrams |
| Create | `src/components/Contact.astro` | CTA section with email + social links |
| Create | `src/components/Footer.astro` | Copyright + tagline |
| Create | `src/pages/index.astro` | Compose all section components |

---

## Task 1: Install Tailwind CSS v4

**Files:**
- Modify: `package.json` (via npm install)
- Modify: `astro.config.mjs`

- [ ] **Step 1: Install Tailwind v4 and its Vite plugin**

```bash
cd /Users/tabrezakhlaque/project/personal/landing-page
npm install tailwindcss @tailwindcss/vite
```

Expected: `package.json` now lists `tailwindcss` and `@tailwindcss/vite` in dependencies.

- [ ] **Step 2: Update `astro.config.mjs`**

```js
// astro.config.mjs
// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
});
```

- [ ] **Step 3: Verify Astro still starts**

```bash
npm run dev
```

Expected: Dev server starts at `http://localhost:4321` with no errors.

- [ ] **Step 4: Commit**

```bash
git add astro.config.mjs package.json package-lock.json
git commit -m "feat: add Tailwind CSS v4 via @tailwindcss/vite"
```

---

## Task 2: Global CSS with Design Tokens

**Files:**
- Create: `src/styles/global.css`

- [ ] **Step 1: Create `src/styles/global.css`**

```css
/* src/styles/global.css */
@import "tailwindcss";

@theme {
  /* Colors */
  --color-bg:          #0b0c0f;
  --color-bg-2:        #111318;
  --color-ink:         #f5f3ee;
  --color-ink-dim:     #9aa0a8;
  --color-ink-mute:    #5b6069;
  --color-border:      #1d2026;
  --color-border-2:    #262a32;
  --color-accent:      #ff7a45;
  --color-accent-soft: #ffb38a;
  --color-green:       #7ee0a6;
  --color-violet:      #b5a8ff;

  /* Font families */
  --font-serif: 'Instrument Serif', ui-serif, Georgia, serif;
  --font-sans:  'Inter', ui-sans-serif, system-ui, sans-serif;
  --font-mono:  'JetBrains Mono', ui-monospace, Menlo, monospace;
}

/* Base reset */
*, *::before, *::after { box-sizing: border-box; }
html, body {
  margin: 0;
  padding: 0;
  background: var(--color-bg);
  color: var(--color-ink);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
  font-size: 16px;
  line-height: 1.55;
}
a { color: inherit; text-decoration: none; }
::selection { background: var(--color-accent); color: #111; }

/* Layout wrapper */
.wrap { max-width: 1200px; margin: 0 auto; padding: 0 32px; }

/* Blinking caret animation for terminal card */
@keyframes blink { 50% { opacity: 0; } }
.caret {
  display: inline-block;
  width: 8px; height: 16px;
  background: var(--color-accent);
  vertical-align: -3px;
  margin-left: 2px;
  animation: blink 1s steps(2) infinite;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/global.css
git commit -m "feat: add global CSS with Tailwind v4 @theme design tokens"
```

---

## Task 3: Layout.astro

**Files:**
- Create: `src/layouts/Layout.astro`

- [ ] **Step 1: Create `src/layouts/Layout.astro`**

```astro
---
// src/layouts/Layout.astro
interface Props {
  title?: string;
}
const { title = 'Juaini — Software Engineer' } = Astro.props;
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="Juaini — Software Engineer specializing in Java, Spring Boot, Node.js, and React. Available for freelance and full-time roles." />
    <title>{title}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500;600&family=Inter:wght@300;400;500;600;700&display=swap"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="/src/styles/global.css" />
  </head>
  <body>
    <slot />
  </body>
</html>
```

> Note: Astro handles CSS imports in `.astro` files differently from `href`. We'll import via the page instead — see Task 11.

- [ ] **Step 2: Commit**

```bash
git add src/layouts/Layout.astro
git commit -m "feat: add Layout.astro with Google Fonts"
```

---

## Task 4: i18n Content Files

**Files:**
- Create: `src/i18n/en.json`
- Create: `src/i18n/id.json`
- Create: `src/scripts/i18n.ts`

- [ ] **Step 1: Create `src/i18n/en.json`**

```json
{
  "nav.work": "Work",
  "nav.stack": "Stack",
  "nav.projects": "Projects",
  "nav.contact": "Contact",
  "nav.cta": "Let's talk →",
  "hero.eyebrow": "Software Engineer · Available for work",
  "hero.h1.line1": "Backend systems,",
  "hero.h1.line2": "built to",
  "hero.h1.em1": "scale",
  "hero.h1.line3": "&",
  "hero.h1.em2": "last.",
  "hero.sub": "I'm <strong>Juaini</strong> — a software engineer with <strong>3+ years</strong> shipping production Java &amp; Node.js services. I design clean architectures, harden APIs, and ship microservices that quietly run the business.",
  "hero.cta.primary": "Start a project",
  "hero.cta.secondary": "View portfolio",
  "stats.years.num": "3",
  "stats.years.unit": "yrs",
  "stats.years.label": "Production experience",
  "stats.services.num": "12",
  "stats.services.unit": "+",
  "stats.services.label": "Services shipped",
  "stats.cert.num": "4.00",
  "stats.cert.label": "Spring Boot cert · Enigma",
  "stats.domains.num": "3",
  "stats.domains.unit": "domains",
  "stats.domains.label": "Events · Logistics · Fintech",
  "exp.kicker": "01 · Experience",
  "exp.title": "Shipping backend systems across <em>enterprise</em> domains.",
  "exp.desc": "From event management at international scale to event-driven warehouse logistics and financial services.",
  "exp.rivolta.date": "Apr 2024",
  "exp.rivolta.present": "Present",
  "exp.rivolta.role": "Software Engineer",
  "exp.rivolta.company": "PT Rivolta Technology Solutions",
  "exp.rivolta.b1": "Built an <strong>enterprise event management platform</strong> in Spring Boot + PostgreSQL + Redis — participant registration, scheduling, and dynamic group assignment with <strong>RBAC</strong> for administrators, activity managers, and group assistants.",
  "exp.rivolta.b2": "Engineered <strong>warehouse &amp; logistics microservices</strong> with Jersey, AWS Lambda, and MySQL — multi-legal-entity fulfillment assignment and intelligent warehouse selection based on seller ownership.",
  "exp.rivolta.b3": "Contributed to a <strong>financial services</strong> monolith in Spring Boot — loan pre-closure calculation modules and secure RESTful APIs for sensitive transaction processing.",
  "exp.rivolta.b4": "Stood up internal <strong>starter templates</strong> (Express, React, Next, Spring Boot) with standardized CI/CD and best-practice docs for greenfield projects.",
  "exp.rivolta.b5": "Mentored interns on code review, debugging, and design patterns — MVC, Repository, DAO, Factory.",
  "exp.be.date": "Aug 2023 — Feb 2025",
  "exp.be.role": "Backend Engineer",
  "exp.be.company": "Java & Spring Boot Developer",
  "exp.be.b1": "Built production-ready backend services with <strong>JWT &amp; RBAC</strong> authentication — secure user management and authorization workflows.",
  "exp.be.b2": "Developed RESTful APIs with optimized DB queries (PostgreSQL / MySQL), applying indexing and query-tuning strategies.",
  "exp.be.b3": "Applied <strong>clean architecture</strong> and <strong>SOLID</strong> principles for scalable, maintainable modules.",
  "stack.kicker": "02 · Toolbox",
  "stack.title": "The stack I reach for on <em>day one.</em>",
  "stack.desc": "Full-stack capable, backend-first. Comfortable choosing the right tool for the architecture — not just the one I know.",
  "stack.languages": "Languages",
  "stack.backend": "Backend",
  "stack.frontend": "Frontend",
  "stack.data": "Data",
  "stack.cloud": "Cloud & Infra",
  "stack.testing": "Testing",
  "stack.tooling": "Tooling",
  "stack.practices": "Practices",
  "projects.kicker": "03 · Selected work",
  "projects.title": "Systems in <em>production</em>, not side projects.",
  "projects.desc": "A sample of architectures I've designed or contributed to — from monoliths to event-driven microservices.",
  "project.01.num": "/ 01 — MONOLITH",
  "project.01.title": "Enterprise Event Management Platform",
  "project.01.desc": "International-scale participant registration, activity management, and dynamic group assignment. Role-based access for administrators, activity managers, and group assistants.",
  "project.02.num": "/ 02 — MICROSERVICES",
  "project.02.title": "Warehouse & Logistics Event-Driven System",
  "project.02.desc": "Event-driven architecture on AWS Lambda + Jersey. Multi-legal-entity assignment during fulfillment and intelligent warehouse selection algorithms based on seller ownership configurations.",
  "project.03.num": "/ 03 — FINTECH",
  "project.03.title": "Loan Pre-Closure Calculation Engine",
  "project.03.desc": "Support-developer contributions to a financial services monolith. Implemented complex loan pre-closure calculation modules and secure RESTful APIs for sensitive transaction processing.",
  "contact.heading": "Got a backend that needs a <em>steady hand?</em>",
  "contact.sub": "I'm open to freelance engagements, full-time roles, and contract work — especially anything involving Spring Boot, Node microservices, or legacy systems that need straightening out.",
  "contact.cta": "juaini742@gmail.com",
  "footer.copy": "© 2026 Juaini · Hulu Sungai Tengah, ID",
  "footer.tagline": "Built with Spring Boot energy ☕"
}
```

- [ ] **Step 2: Create `src/i18n/id.json`**

```json
{
  "nav.work": "Pengalaman",
  "nav.stack": "Teknologi",
  "nav.projects": "Proyek",
  "nav.contact": "Kontak",
  "nav.cta": "Hubungi saya →",
  "hero.eyebrow": "Software Engineer · Tersedia untuk pekerjaan",
  "hero.h1.line1": "Sistem backend,",
  "hero.h1.line2": "dibangun untuk",
  "hero.h1.em1": "skala",
  "hero.h1.line3": "&",
  "hero.h1.em2": "bertahan.",
  "hero.sub": "Saya <strong>Juaini</strong> — software engineer dengan pengalaman <strong>3+ tahun</strong> mengembangkan layanan Java &amp; Node.js di produksi. Saya merancang arsitektur bersih, mengamankan API, dan membangun microservice yang menopang bisnis.",
  "hero.cta.primary": "Mulai proyek",
  "hero.cta.secondary": "Lihat portfolio",
  "stats.years.num": "3",
  "stats.years.unit": "thn",
  "stats.years.label": "Pengalaman produksi",
  "stats.services.num": "12",
  "stats.services.unit": "+",
  "stats.services.label": "Layanan yang dirilis",
  "stats.cert.num": "4.00",
  "stats.cert.label": "Sertifikasi Spring Boot · Enigma",
  "stats.domains.num": "3",
  "stats.domains.unit": "domain",
  "stats.domains.label": "Event · Logistik · Fintech",
  "exp.kicker": "01 · Pengalaman",
  "exp.title": "Membangun sistem backend di berbagai domain <em>enterprise</em>.",
  "exp.desc": "Dari manajemen event skala internasional hingga logistik gudang berbasis event dan layanan keuangan.",
  "exp.rivolta.date": "Apr 2024",
  "exp.rivolta.present": "Sekarang",
  "exp.rivolta.role": "Software Engineer",
  "exp.rivolta.company": "PT Rivolta Technology Solutions",
  "exp.rivolta.b1": "Membangun <strong>platform manajemen event enterprise</strong> dengan Spring Boot + PostgreSQL + Redis — registrasi peserta, penjadwalan, dan penugasan grup dinamis dengan <strong>RBAC</strong> untuk administrator, manajer aktivitas, dan asisten grup.",
  "exp.rivolta.b2": "Merancang <strong>microservice gudang &amp; logistik</strong> dengan Jersey, AWS Lambda, dan MySQL — penugasan multi-entitas hukum saat fulfillment dan algoritma pemilihan gudang cerdas berdasarkan konfigurasi kepemilikan penjual.",
  "exp.rivolta.b3": "Berkontribusi pada <strong>monolith layanan keuangan</strong> Spring Boot — modul kalkulasi pelunasan pinjaman lebih awal dan API RESTful aman untuk pemrosesan transaksi sensitif.",
  "exp.rivolta.b4": "Membangun <strong>template starter internal</strong> (Express, React, Next, Spring Boot) dengan CI/CD standar dan dokumentasi praktik terbaik untuk proyek greenfield.",
  "exp.rivolta.b5": "Membimbing intern dalam code review, debugging, dan pola desain — MVC, Repository, DAO, Factory.",
  "exp.be.date": "Agu 2023 — Feb 2025",
  "exp.be.role": "Backend Engineer",
  "exp.be.company": "Java & Spring Boot Developer",
  "exp.be.b1": "Membangun layanan backend siap produksi dengan autentikasi <strong>JWT &amp; RBAC</strong> — manajemen pengguna aman dan alur otorisasi.",
  "exp.be.b2": "Mengembangkan API RESTful dengan kueri DB teroptimasi (PostgreSQL / MySQL), menerapkan strategi pengindeksan dan penalaan kueri.",
  "exp.be.b3": "Menerapkan prinsip <strong>arsitektur bersih</strong> dan <strong>SOLID</strong> untuk modul yang skalabel dan mudah dipelihara.",
  "stack.kicker": "02 · Teknologi",
  "stack.title": "Teknologi yang saya gunakan sejak <em>hari pertama.</em>",
  "stack.desc": "Full-stack capable, backend-first. Nyaman memilih alat yang tepat untuk arsitektur — bukan hanya yang sudah dikenal.",
  "stack.languages": "Bahasa Pemrograman",
  "stack.backend": "Backend",
  "stack.frontend": "Frontend",
  "stack.data": "Database",
  "stack.cloud": "Cloud & Infrastruktur",
  "stack.testing": "Testing",
  "stack.tooling": "Alat",
  "stack.practices": "Praktik",
  "projects.kicker": "03 · Karya terpilih",
  "projects.title": "Sistem di <em>produksi</em>, bukan side project.",
  "projects.desc": "Contoh arsitektur yang saya rancang atau kontribusikan — dari monolith hingga microservice berbasis event.",
  "project.01.num": "/ 01 — MONOLITH",
  "project.01.title": "Platform Manajemen Event Enterprise",
  "project.01.desc": "Registrasi peserta skala internasional, manajemen aktivitas, dan penugasan grup dinamis. Akses berbasis peran untuk administrator, manajer aktivitas, dan asisten grup.",
  "project.02.num": "/ 02 — MICROSERVICES",
  "project.02.title": "Sistem Gudang & Logistik Berbasis Event",
  "project.02.desc": "Arsitektur event-driven di AWS Lambda + Jersey. Penugasan multi-entitas hukum saat fulfillment dan algoritma pemilihan gudang cerdas berdasarkan konfigurasi kepemilikan penjual.",
  "project.03.num": "/ 03 — FINTECH",
  "project.03.title": "Mesin Kalkulasi Pelunasan Pinjaman Lebih Awal",
  "project.03.desc": "Kontribusi sebagai support developer pada monolith layanan keuangan. Mengimplementasikan modul kalkulasi pelunasan pinjaman lebih awal yang kompleks dan API RESTful aman untuk pemrosesan transaksi sensitif.",
  "contact.heading": "Punya backend yang butuh <em>tangan yang tepat?</em>",
  "contact.sub": "Saya terbuka untuk pekerjaan freelance, peran penuh waktu, dan kontrak — terutama yang melibatkan Spring Boot, microservice Node, atau sistem lama yang perlu diperbaiki.",
  "contact.cta": "juaini742@gmail.com",
  "footer.copy": "© 2026 Juaini · Hulu Sungai Tengah, ID",
  "footer.tagline": "Dibangun dengan semangat Spring Boot ☕"
}
```

- [ ] **Step 3: Create `src/scripts/i18n.ts`**

This script runs client-side on every page load. It reads `localStorage('lang')`, loads the matching translations (embedded as a data attribute on `<html>`), and swaps all `[data-i18n]` elements.

```ts
// src/scripts/i18n.ts
// Called inline in Layout.astro via <script> tag.
// Swaps all [data-i18n="key"] elements to the stored language.

export function initI18n(translations: Record<string, Record<string, string>>) {
  const stored = localStorage.getItem('lang') ?? 'en';
  applyLang(stored, translations);

  document.querySelectorAll('[data-lang-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const current = localStorage.getItem('lang') ?? 'en';
      const next = current === 'en' ? 'id' : 'en';
      localStorage.setItem('lang', next);
      applyLang(next, translations);
      updateToggleUI(next);
    });
  });

  updateToggleUI(stored);
}

function applyLang(lang: string, translations: Record<string, Record<string, string>>) {
  const t = translations[lang] ?? translations['en'];
  document.documentElement.setAttribute('lang', lang);
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n!;
    if (t[key] !== undefined) {
      el.innerHTML = t[key];
    }
  });
}

function updateToggleUI(lang: string) {
  document.querySelectorAll<HTMLElement>('[data-lang-toggle]').forEach((btn) => {
    btn.querySelectorAll<HTMLElement>('[data-lang-option]').forEach((opt) => {
      const isActive = opt.dataset.langOption === lang;
      opt.style.opacity = isActive ? '1' : '0.4';
      opt.style.fontWeight = isActive ? '600' : '400';
    });
  });
}
```

- [ ] **Step 4: Commit**

```bash
git add src/i18n/en.json src/i18n/id.json src/scripts/i18n.ts
git commit -m "feat: add i18n EN/ID content files and client-side lang swap script"
```

---

## Task 5: Nav.astro

**Files:**
- Create: `src/components/Nav.astro`

- [ ] **Step 1: Create `src/components/Nav.astro`**

```astro
---
// src/components/Nav.astro
---
<nav class="sticky top-0 z-20 border-b border-border backdrop-blur-md"
     style="background: color-mix(in oklab, var(--color-bg) 78%, transparent);">
  <div class="wrap nav-inner flex items-center justify-between py-[18px]">

    <div class="flex items-center gap-[10px] font-mono text-sm tracking-[0.02em]">
      <span class="inline-block w-[10px] h-[10px] rounded-sm bg-accent"
            style="box-shadow: 0 0 0 3px color-mix(in oklab, var(--color-accent) 25%, transparent);"></span>
      juaini.dev
    </div>

    <div class="hidden md:flex gap-7 text-sm text-ink-dim">
      <a href="#work"     data-i18n="nav.work"     class="hover:text-ink transition-colors">Work</a>
      <a href="#stack"    data-i18n="nav.stack"    class="hover:text-ink transition-colors">Stack</a>
      <a href="#projects" data-i18n="nav.projects" class="hover:text-ink transition-colors">Projects</a>
      <a href="#contact"  data-i18n="nav.contact"  class="hover:text-ink transition-colors">Contact</a>
    </div>

    <div class="flex items-center gap-3">
      <!-- Language toggle -->
      <button
        data-lang-toggle
        aria-label="Toggle language"
        class="font-mono text-xs text-ink-dim border border-border-2 rounded-full px-3 py-1.5 flex gap-1.5 hover:border-accent transition-colors"
      >
        <span data-lang-option="en">EN</span>
        <span class="text-ink-mute">|</span>
        <span data-lang-option="id">ID</span>
      </button>

      <a
        href="#contact"
        data-i18n="nav.cta"
        class="font-mono text-[13px] px-4 py-[9px] border border-border-2 rounded-full hover:border-accent hover:text-accent transition-all"
      >Let's talk →</a>
    </div>

  </div>
</nav>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Nav.astro
git commit -m "feat: add Nav component with lang toggle"
```

---

## Task 6: Hero.astro

**Files:**
- Create: `src/components/Hero.astro`

- [ ] **Step 1: Create `src/components/Hero.astro`**

```astro
---
// src/components/Hero.astro
---
<header class="py-[120px_0_100px] relative">
  <div class="wrap grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-16 items-end">

    <!-- Left: Text content -->
    <div>
      <div class="inline-flex items-center gap-[10px] font-mono text-[12px] text-accent uppercase tracking-[0.18em] mb-7
                  before:content-[''] before:w-6 before:h-px before:bg-accent"
           data-i18n="hero.eyebrow">
        Software Engineer · Available for work
      </div>

      <h1 class="font-serif font-normal text-[clamp(56px,8vw,104px)] leading-[.95] tracking-[-0.02em] m-0 mb-7">
        <span data-i18n="hero.h1.line1">Backend systems,</span><br/>
        <span data-i18n="hero.h1.line2">built to</span>
        <em class="not-italic text-accent" data-i18n="hero.h1.em1">scale</em>
        <span data-i18n="hero.h1.line3">&amp;</span><br/>
        <em class="not-italic text-accent" data-i18n="hero.h1.em2">last.</em>
      </h1>

      <p class="max-w-[540px] text-ink-dim text-lg leading-[1.55] mb-10"
         data-i18n="hero.sub">
        I'm <strong class="text-ink font-medium">Juaini</strong> — a software engineer with <strong class="text-ink font-medium">3+ years</strong>
        shipping production Java &amp; Node.js services. I design clean architectures,
        harden APIs, and ship microservices that quietly run the business.
      </p>

      <div class="flex gap-3.5 flex-wrap">
        <a
          href="mailto:juaini742@gmail.com"
          class="inline-flex items-center gap-2.5 px-[22px] py-[14px] rounded-full text-sm font-medium tracking-[0.01em] bg-accent text-[#111] hover:bg-accent-soft transition-colors active:translate-y-px"
        >
          <span data-i18n="hero.cta.primary">Start a project</span>
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
        </a>
        <a
          href="https://portfolio-juaini.vercel.app"
          target="_blank"
          data-i18n="hero.cta.secondary"
          class="inline-flex items-center gap-2.5 px-[22px] py-[14px] rounded-full text-sm font-medium tracking-[0.01em] border border-border-2 text-ink hover:border-ink-dim transition-colors active:translate-y-px"
        >
          View portfolio
        </a>
      </div>
    </div>

    <!-- Right: Terminal card -->
    <div class="bg-bg-2 border border-border rounded-[14px] overflow-hidden font-mono text-[13px]"
         style="box-shadow: 0 40px 80px -40px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.02) inset;">
      <div class="flex items-center gap-2 px-3.5 py-3 border-b border-border text-ink-mute text-xs">
        <span class="w-[11px] h-[11px] rounded-full bg-[#3a3d44]"></span>
        <span class="w-[11px] h-[11px] rounded-full bg-[#3a3d44]"></span>
        <span class="w-[11px] h-[11px] rounded-full bg-[#3a3d44]"></span>
        <span class="ml-auto font-mono text-[11px] tracking-[0.05em]">~/juaini — zsh</span>
      </div>
      <div class="p-5 leading-[1.75]">
        <div><span class="text-green">$</span> <span class="text-ink">whoami --verbose</span></div>
        <div><span class="text-ink-mute">→ name:</span>       <span class="text-accent-soft">"Juaini"</span></div>
        <div><span class="text-ink-mute">→ role:</span>       <span class="text-accent-soft">"Software Engineer"</span></div>
        <div><span class="text-ink-mute">→ location:</span>   <span class="text-accent-soft">"Kalimantan Selatan, ID"</span></div>
        <div><span class="text-ink-mute">→ years:</span>      <span class="text-green">3</span></div>
        <div><span class="text-ink-mute">→ stack:</span>      [<span class="text-violet">Java</span>, <span class="text-violet">Spring</span>, <span class="text-violet">Node</span>, <span class="text-violet">React</span>]</div>
        <div><span class="text-ink-mute">→ status:</span>     <span class="text-green">OPEN_TO_WORK</span> <span class="caret"></span></div>
      </div>
    </div>

  </div>
</header>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Hero.astro
git commit -m "feat: add Hero component with display heading and terminal card"
```

---

## Task 7: Stats.astro

**Files:**
- Create: `src/components/Stats.astro`

- [ ] **Step 1: Create `src/components/Stats.astro`**

```astro
---
// src/components/Stats.astro
---
<section class="border-t border-b border-border py-9">
  <div class="wrap grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">

    <div>
      <div class="font-serif text-[56px] leading-none tracking-[-0.02em]">
        <span data-i18n="stats.years.num">3</span><span class="text-[22px] text-ink-dim ml-1" data-i18n="stats.years.unit">yrs</span>
      </div>
      <div class="font-mono text-[11px] text-ink-dim uppercase tracking-[0.14em] mt-2.5" data-i18n="stats.years.label">Production experience</div>
    </div>

    <div>
      <div class="font-serif text-[56px] leading-none tracking-[-0.02em]">
        <span data-i18n="stats.services.num">12</span><span class="text-[22px] text-ink-dim ml-1" data-i18n="stats.services.unit">+</span>
      </div>
      <div class="font-mono text-[11px] text-ink-dim uppercase tracking-[0.14em] mt-2.5" data-i18n="stats.services.label">Services shipped</div>
    </div>

    <div>
      <div class="font-serif text-[56px] leading-none tracking-[-0.02em]" data-i18n="stats.cert.num">4.00</div>
      <div class="font-mono text-[11px] text-ink-dim uppercase tracking-[0.14em] mt-2.5" data-i18n="stats.cert.label">Spring Boot cert · Enigma</div>
    </div>

    <div>
      <div class="font-serif text-[56px] leading-none tracking-[-0.02em]">
        <span data-i18n="stats.domains.num">3</span><span class="text-[22px] text-ink-dim ml-1" data-i18n="stats.domains.unit">domains</span>
      </div>
      <div class="font-mono text-[11px] text-ink-dim uppercase tracking-[0.14em] mt-2.5" data-i18n="stats.domains.label">Events · Logistics · Fintech</div>
    </div>

  </div>
</section>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Stats.astro
git commit -m "feat: add Stats strip component"
```

---

## Task 8: Experience.astro

**Files:**
- Create: `src/components/Experience.astro`

- [ ] **Step 1: Create `src/components/Experience.astro`**

```astro
---
// src/components/Experience.astro
---
<section class="py-[120px] border-b border-border" id="work">
  <div class="wrap">

    <div class="flex justify-between items-end gap-10 mb-14 flex-col md:flex-row md:items-end">
      <div>
        <div class="flex items-center gap-[10px] font-mono text-[12px] text-ink-mute uppercase tracking-[0.18em] mb-3.5
                    before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-accent"
             data-i18n="exp.kicker">01 · Experience</div>
        <h2 class="font-serif font-normal text-[clamp(40px,5vw,64px)] leading-[1.02] tracking-[-0.02em] m-0 max-w-[720px]"
            data-i18n="exp.title">Shipping backend systems across <em class="text-accent not-italic">enterprise</em> domains.</h2>
      </div>
      <p class="text-ink-dim text-base max-w-[320px]" data-i18n="exp.desc">
        From event management at international scale to event-driven warehouse logistics and financial services.
      </p>
    </div>

    <!-- PT Rivolta -->
    <article class="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-10 py-9 border-t border-border first:border-t-0 first:pt-0">
      <div class="font-mono text-[13px] text-ink-dim">
        <span data-i18n="exp.rivolta.date">Apr 2024</span> —
        <span class="inline-flex items-center gap-1.5 text-green
                     before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-green
                     before:shadow-[0_0_0_3px_color-mix(in_oklab,var(--color-green)_30%,transparent)]"
              data-i18n="exp.rivolta.present">Present</span>
      </div>
      <div>
        <h3 class="font-serif text-[28px] leading-[1.1] m-0 mb-1 font-normal" data-i18n="exp.rivolta.role">Software Engineer</h3>
        <div class="text-ink-dim text-sm mb-[18px]" data-i18n="exp.rivolta.company">PT Rivolta Technology Solutions</div>
        <ul class="list-none p-0 m-0 grid gap-2.5">
          <li class="pl-5 relative text-ink-dim text-[15px] leading-[1.55] before:content-[''] before:absolute before:left-0 before:top-[11px] before:w-2.5 before:h-px before:bg-accent" data-i18n="exp.rivolta.b1">Built an <strong class="text-ink font-medium">enterprise event management platform</strong> in Spring Boot + PostgreSQL + Redis.</li>
          <li class="pl-5 relative text-ink-dim text-[15px] leading-[1.55] before:content-[''] before:absolute before:left-0 before:top-[11px] before:w-2.5 before:h-px before:bg-accent" data-i18n="exp.rivolta.b2">Engineered <strong class="text-ink font-medium">warehouse &amp; logistics microservices</strong> with Jersey, AWS Lambda, and MySQL.</li>
          <li class="pl-5 relative text-ink-dim text-[15px] leading-[1.55] before:content-[''] before:absolute before:left-0 before:top-[11px] before:w-2.5 before:h-px before:bg-accent" data-i18n="exp.rivolta.b3">Contributed to a <strong class="text-ink font-medium">financial services</strong> monolith in Spring Boot.</li>
          <li class="pl-5 relative text-ink-dim text-[15px] leading-[1.55] before:content-[''] before:absolute before:left-0 before:top-[11px] before:w-2.5 before:h-px before:bg-accent" data-i18n="exp.rivolta.b4">Stood up internal <strong class="text-ink font-medium">starter templates</strong> with standardized CI/CD.</li>
          <li class="pl-5 relative text-ink-dim text-[15px] leading-[1.55] before:content-[''] before:absolute before:left-0 before:top-[11px] before:w-2.5 before:h-px before:bg-accent" data-i18n="exp.rivolta.b5">Mentored interns on code review, debugging, and design patterns.</li>
        </ul>
        <div class="flex flex-wrap gap-1.5 mt-[18px]">
          <span class="font-mono text-[11px] text-ink-dim px-2.5 py-[5px] border border-border-2 rounded-full">Spring Boot</span>
          <span class="font-mono text-[11px] text-ink-dim px-2.5 py-[5px] border border-border-2 rounded-full">Jersey</span>
          <span class="font-mono text-[11px] text-ink-dim px-2.5 py-[5px] border border-border-2 rounded-full">AWS Lambda</span>
          <span class="font-mono text-[11px] text-ink-dim px-2.5 py-[5px] border border-border-2 rounded-full">PostgreSQL</span>
          <span class="font-mono text-[11px] text-ink-dim px-2.5 py-[5px] border border-border-2 rounded-full">MySQL</span>
          <span class="font-mono text-[11px] text-ink-dim px-2.5 py-[5px] border border-border-2 rounded-full">Redis</span>
          <span class="font-mono text-[11px] text-ink-dim px-2.5 py-[5px] border border-border-2 rounded-full">Microservices</span>
          <span class="font-mono text-[11px] text-ink-dim px-2.5 py-[5px] border border-border-2 rounded-full">RBAC / JWT</span>
        </div>
      </div>
    </article>

    <!-- Backend Engineer -->
    <article class="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-10 py-9 border-t border-border">
      <div class="font-mono text-[13px] text-ink-dim" data-i18n="exp.be.date">Aug 2023 — Feb 2025</div>
      <div>
        <h3 class="font-serif text-[28px] leading-[1.1] m-0 mb-1 font-normal" data-i18n="exp.be.role">Backend Engineer</h3>
        <div class="text-ink-dim text-sm mb-[18px]" data-i18n="exp.be.company">Java &amp; Spring Boot Developer</div>
        <ul class="list-none p-0 m-0 grid gap-2.5">
          <li class="pl-5 relative text-ink-dim text-[15px] leading-[1.55] before:content-[''] before:absolute before:left-0 before:top-[11px] before:w-2.5 before:h-px before:bg-accent" data-i18n="exp.be.b1">Built production-ready backend services with <strong class="text-ink font-medium">JWT &amp; RBAC</strong> authentication.</li>
          <li class="pl-5 relative text-ink-dim text-[15px] leading-[1.55] before:content-[''] before:absolute before:left-0 before:top-[11px] before:w-2.5 before:h-px before:bg-accent" data-i18n="exp.be.b2">Developed RESTful APIs with optimized DB queries (PostgreSQL / MySQL).</li>
          <li class="pl-5 relative text-ink-dim text-[15px] leading-[1.55] before:content-[''] before:absolute before:left-0 before:top-[11px] before:w-2.5 before:h-px before:bg-accent" data-i18n="exp.be.b3">Applied <strong class="text-ink font-medium">clean architecture</strong> and <strong class="text-ink font-medium">SOLID</strong> principles.</li>
        </ul>
        <div class="flex flex-wrap gap-1.5 mt-[18px]">
          <span class="font-mono text-[11px] text-ink-dim px-2.5 py-[5px] border border-border-2 rounded-full">Java</span>
          <span class="font-mono text-[11px] text-ink-dim px-2.5 py-[5px] border border-border-2 rounded-full">Spring Boot</span>
          <span class="font-mono text-[11px] text-ink-dim px-2.5 py-[5px] border border-border-2 rounded-full">JWT</span>
          <span class="font-mono text-[11px] text-ink-dim px-2.5 py-[5px] border border-border-2 rounded-full">REST</span>
          <span class="font-mono text-[11px] text-ink-dim px-2.5 py-[5px] border border-border-2 rounded-full">SOLID</span>
        </div>
      </div>
    </article>

  </div>
</section>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Experience.astro
git commit -m "feat: add Experience component with two work history entries"
```

---

## Task 9: Stack.astro

**Files:**
- Create: `src/components/Stack.astro`

- [ ] **Step 1: Create `src/components/Stack.astro`**

```astro
---
// src/components/Stack.astro
const cells = [
  { key: 'languages', icon: '{ }', items: ['Java', 'TypeScript', 'JavaScript', 'Go', 'HTML', 'CSS'] },
  { key: 'backend',   icon: '☕',  items: ['Spring Boot', 'Jersey', 'Express', 'NestJS', 'Gin', 'Echo'] },
  { key: 'frontend',  icon: '◈',   items: ['React', 'Next.js', 'React Native', 'Vue', 'Angular', 'Tailwind'] },
  { key: 'data',      icon: '◴',   items: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis'] },
  { key: 'cloud',     icon: 'λ',   items: ['AWS Lambda', 'CI/CD', 'CloudPanel', 'GitHub Actions'] },
  { key: 'testing',   icon: '✓',   items: ['JUnit', 'Mockito', 'Jest', 'Playwright', 'Cypress'] },
  { key: 'tooling',   icon: '⌥',   items: ['Git', 'JetBrains', 'VSCode', 'Postman', 'Jira'] },
  { key: 'practices', icon: '✎',   items: ['Clean Architecture', 'TDD', 'Agile / Scrum', 'Code Review'] },
];
---
<section class="py-[120px] border-b border-border" id="stack">
  <div class="wrap">

    <div class="flex justify-between items-end gap-10 mb-14 flex-col md:flex-row">
      <div>
        <div class="flex items-center gap-[10px] font-mono text-[12px] text-ink-mute uppercase tracking-[0.18em] mb-3.5
                    before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-accent"
             data-i18n="stack.kicker">02 · Toolbox</div>
        <h2 class="font-serif font-normal text-[clamp(40px,5vw,64px)] leading-[1.02] tracking-[-0.02em] m-0 max-w-[720px]"
            data-i18n="stack.title">The stack I reach for on <em class="text-accent not-italic">day one.</em></h2>
      </div>
      <p class="text-ink-dim text-base max-w-[320px]" data-i18n="stack.desc">
        Full-stack capable, backend-first.
      </p>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-px bg-border border border-border rounded-[14px] overflow-hidden">
      {cells.map(({ key, icon, items }) => (
        <div class="bg-bg p-7 min-h-[200px] flex flex-col gap-3 hover:bg-bg-2 transition-colors">
          <div class="w-9 h-9 rounded-lg flex items-center justify-center font-mono text-sm font-semibold text-accent"
               style="background: color-mix(in oklab, var(--color-accent) 14%, transparent);">
            {icon}
          </div>
          <h4 class="font-mono text-[11px] text-ink-mute uppercase tracking-[0.14em] m-0"
              data-i18n={`stack.${key}`}>{key}</h4>
          <div class="flex flex-wrap gap-1.5 mt-auto">
            {items.map((item) => (
              <span class="text-[13px] text-ink px-2.5 py-1 rounded-md bg-bg-2 border border-border-2">{item}</span>
            ))}
          </div>
        </div>
      ))}
    </div>

  </div>
</section>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Stack.astro
git commit -m "feat: add Stack component with 8-cell tech grid"
```

---

## Task 10: Projects.astro

**Files:**
- Create: `src/components/Projects.astro`

- [ ] **Step 1: Create `src/components/Projects.astro`**

```astro
---
// src/components/Projects.astro
---
<section class="py-[120px] border-b border-border" id="projects">
  <div class="wrap">

    <div class="flex justify-between items-end gap-10 mb-14 flex-col md:flex-row">
      <div>
        <div class="flex items-center gap-[10px] font-mono text-[12px] text-ink-mute uppercase tracking-[0.18em] mb-3.5
                    before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-accent"
             data-i18n="projects.kicker">03 · Selected work</div>
        <h2 class="font-serif font-normal text-[clamp(40px,5vw,64px)] leading-[1.02] tracking-[-0.02em] m-0 max-w-[720px]"
            data-i18n="projects.title">Systems in <em class="text-accent not-italic">production</em>, not side projects.</h2>
      </div>
      <p class="text-ink-dim text-base max-w-[320px]" data-i18n="projects.desc">
        A sample of architectures I've designed or contributed to.
      </p>
    </div>

    <div class="grid gap-6">

      <!-- Project 01 -->
      <article class="grid grid-cols-1 md:grid-cols-[1fr_1.3fr] gap-12 items-center p-10 border border-border rounded-2xl bg-gradient-to-b from-bg-2 to-bg hover:border-border-2 transition-colors">
        <div>
          <div class="font-mono text-[12px] text-accent tracking-[0.15em] mb-3.5" data-i18n="project.01.num">/ 01 — MONOLITH</div>
          <h3 class="font-serif text-[34px] font-normal leading-[1.1] m-0 mb-3.5 tracking-[-0.01em]" data-i18n="project.01.title">Enterprise Event Management Platform</h3>
          <p class="text-ink-dim m-0 mb-[18px] text-[15px] leading-[1.6]" data-i18n="project.01.desc">International-scale participant registration, activity management, and dynamic group assignment.</p>
          <div class="flex gap-[18px] font-mono text-[12px] text-ink-mute uppercase tracking-[0.1em]">
            <span><b class="text-ink font-medium">Spring Boot</b></span>
            <span><b class="text-ink font-medium">PostgreSQL</b></span>
            <span><b class="text-ink font-medium">Redis</b></span>
          </div>
        </div>
        <div class="bg-[#0f1116] border border-border-2 rounded-[10px] p-[22px] font-mono text-[12px] text-ink-dim leading-[1.9]">
          <div class="flex items-center gap-2.5"><span class="px-3 py-2 border border-accent rounded-md text-accent bg-bg-2">API Gateway</span><span class="text-ink-mute">→</span><span class="px-3 py-2 border border-border-2 rounded-md bg-bg-2 text-ink">Event Service</span></div>
          <div class="ml-[110px]"><span class="text-ink-mute">↓</span></div>
          <div class="flex items-center gap-2.5"><span class="px-3 py-2 border border-border-2 rounded-md bg-bg-2 text-ink">Auth · JWT</span><span class="text-ink-mute">+</span><span class="px-3 py-2 border border-violet rounded-md text-violet bg-bg-2">RBAC</span><span class="text-ink-mute">+</span><span class="px-3 py-2 border border-green rounded-md text-green bg-bg-2">Session · Redis</span></div>
          <div class="ml-10"><span class="text-ink-mute">↓</span></div>
          <div class="flex items-center gap-2.5"><span class="px-3 py-2 border border-border-2 rounded-md bg-bg-2 text-ink">Participants</span><span class="text-ink-mute">·</span><span class="px-3 py-2 border border-border-2 rounded-md bg-bg-2 text-ink">Activities</span><span class="text-ink-mute">·</span><span class="px-3 py-2 border border-border-2 rounded-md bg-bg-2 text-ink">Groups</span></div>
          <div class="flex items-center gap-2.5 mt-1.5"><span class="text-ink-mute">Storage:</span><span class="px-3 py-2 border border-green rounded-md text-green bg-bg-2">PostgreSQL</span></div>
        </div>
      </article>

      <!-- Project 02 -->
      <article class="grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-12 items-center p-10 border border-border rounded-2xl bg-gradient-to-b from-bg-2 to-bg hover:border-border-2 transition-colors">
        <div class="bg-[#0f1116] border border-border-2 rounded-[10px] p-[22px] font-mono text-[12px] text-ink-dim leading-[1.9]">
          <div class="flex items-center gap-2.5"><span class="px-3 py-2 border border-border-2 rounded-md bg-bg-2 text-ink">Order Event</span><span class="text-ink-mute">→</span><span class="px-3 py-2 border border-accent rounded-md text-accent bg-bg-2">λ dispatcher</span></div>
          <div class="ml-[90px]"><span class="text-ink-mute">↓</span></div>
          <div class="flex items-center gap-2.5"><span class="px-3 py-2 border border-violet rounded-md text-violet bg-bg-2">λ legal-entity</span><span class="text-ink-mute">+</span><span class="px-3 py-2 border border-violet rounded-md text-violet bg-bg-2">λ warehouse-select</span></div>
          <div class="ml-[60px]"><span class="text-ink-mute">↓</span></div>
          <div class="flex items-center gap-2.5"><span class="px-3 py-2 border border-border-2 rounded-md bg-bg-2 text-ink">Fulfillment Worker</span><span class="text-ink-mute">→</span><span class="px-3 py-2 border border-green rounded-md text-green bg-bg-2">MySQL</span></div>
          <div class="mt-1.5 text-ink-mute">// driven by seller-ownership config</div>
        </div>
        <div>
          <div class="font-mono text-[12px] text-accent tracking-[0.15em] mb-3.5" data-i18n="project.02.num">/ 02 — MICROSERVICES</div>
          <h3 class="font-serif text-[34px] font-normal leading-[1.1] m-0 mb-3.5 tracking-[-0.01em]" data-i18n="project.02.title">Warehouse &amp; Logistics Event-Driven System</h3>
          <p class="text-ink-dim m-0 mb-[18px] text-[15px] leading-[1.6]" data-i18n="project.02.desc">Event-driven architecture on AWS Lambda + Jersey.</p>
          <div class="flex gap-[18px] font-mono text-[12px] text-ink-mute uppercase tracking-[0.1em]">
            <span><b class="text-ink font-medium">Jersey</b></span>
            <span><b class="text-ink font-medium">AWS Lambda</b></span>
            <span><b class="text-ink font-medium">MySQL</b></span>
          </div>
        </div>
      </article>

      <!-- Project 03 -->
      <article class="grid grid-cols-1 md:grid-cols-[1fr_1.3fr] gap-12 items-center p-10 border border-border rounded-2xl bg-gradient-to-b from-bg-2 to-bg hover:border-border-2 transition-colors">
        <div>
          <div class="font-mono text-[12px] text-accent tracking-[0.15em] mb-3.5" data-i18n="project.03.num">/ 03 — FINTECH</div>
          <h3 class="font-serif text-[34px] font-normal leading-[1.1] m-0 mb-3.5 tracking-[-0.01em]" data-i18n="project.03.title">Loan Pre-Closure Calculation Engine</h3>
          <p class="text-ink-dim m-0 mb-[18px] text-[15px] leading-[1.6]" data-i18n="project.03.desc">Implemented complex loan pre-closure calculation modules and secure RESTful APIs.</p>
          <div class="flex gap-[18px] font-mono text-[12px] text-ink-mute uppercase tracking-[0.1em]">
            <span><b class="text-ink font-medium">Spring Boot</b></span>
            <span><b class="text-ink font-medium">PostgreSQL</b></span>
            <span><b class="text-ink font-medium">Secure REST</b></span>
          </div>
        </div>
        <div class="bg-[#0f1116] border border-border-2 rounded-[10px] p-[22px] font-mono text-[12px] text-ink-dim leading-[1.9]">
          <div class="flex items-center gap-2.5"><span class="px-3 py-2 border border-border-2 rounded-md bg-bg-2 text-ink">Client</span><span class="text-ink-mute">→</span><span class="px-3 py-2 border border-accent rounded-md text-accent bg-bg-2">REST /loans/pre-close</span></div>
          <div class="ml-[50px]"><span class="text-ink-mute">↓</span></div>
          <div class="flex items-center gap-2.5"><span class="px-3 py-2 border border-violet rounded-md text-violet bg-bg-2">Interest Calc</span><span class="text-ink-mute">+</span><span class="px-3 py-2 border border-violet rounded-md text-violet bg-bg-2">Penalty Rules</span></div>
          <div class="ml-[50px]"><span class="text-ink-mute">↓</span></div>
          <div class="flex items-center gap-2.5"><span class="px-3 py-2 border border-border-2 rounded-md bg-bg-2 text-ink">Txn Service</span><span class="text-ink-mute">→</span><span class="px-3 py-2 border border-green rounded-md text-green bg-bg-2">PostgreSQL</span></div>
          <div class="mt-1.5 text-ink-mute">// audited · idempotent · signed</div>
        </div>
      </article>

    </div>
  </div>
</section>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Projects.astro
git commit -m "feat: add Projects component with 3 architecture diagram cards"
```

---

## Task 11: Contact.astro + Footer.astro

**Files:**
- Create: `src/components/Contact.astro`
- Create: `src/components/Footer.astro`

- [ ] **Step 1: Create `src/components/Contact.astro`**

```astro
---
// src/components/Contact.astro
---
<section
  class="py-[140px] text-center"
  style="background: radial-gradient(ellipse at top, color-mix(in oklab, var(--color-accent) 10%, transparent), transparent 60%);"
  id="contact"
>
  <div class="wrap">
    <h2
      class="font-serif font-normal text-[clamp(48px,8vw,96px)] leading-[.98] tracking-[-0.02em] m-0 mb-7"
      data-i18n="contact.heading"
    >Got a backend that needs a <em class="text-accent not-italic">steady hand?</em></h2>

    <p
      class="text-ink-dim max-w-[560px] mx-auto mb-10 text-[17px]"
      data-i18n="contact.sub"
    >I'm open to freelance engagements, full-time roles, and contract work — especially anything involving Spring Boot, Node microservices, or legacy systems that need straightening out.</p>

    <a
      href="mailto:juaini742@gmail.com"
      class="inline-flex items-center gap-2.5 px-[30px] py-[18px] rounded-full text-[15px] font-medium bg-accent text-[#111] hover:bg-accent-soft transition-colors"
    >
      <span data-i18n="contact.cta">juaini742@gmail.com</span>
      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
    </a>

    <div class="mt-8 flex justify-center gap-6 font-mono text-[13px] text-ink-dim">
      <a href="https://www.linkedin.com/in/juaini-i" target="_blank" class="hover:text-accent transition-colors">LinkedIn ↗</a>
      <a href="https://portfolio-juaini.vercel.app" target="_blank" class="hover:text-accent transition-colors">Portfolio ↗</a>
      <a href="tel:+6285751633160" class="hover:text-accent transition-colors">+62 857 5163 3160</a>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Create `src/components/Footer.astro`**

```astro
---
// src/components/Footer.astro
---
<footer class="border-t border-border py-8 font-mono text-[12px] text-ink-mute">
  <div class="wrap flex justify-between items-center">
    <div data-i18n="footer.copy">© 2026 Juaini · Hulu Sungai Tengah, ID</div>
    <div data-i18n="footer.tagline">Built with Spring Boot energy ☕</div>
  </div>
</footer>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Contact.astro src/components/Footer.astro
git commit -m "feat: add Contact and Footer components"
```

---

## Task 12: index.astro — Compose Everything

**Files:**
- Modify: `src/pages/index.astro`
- Update: `src/layouts/Layout.astro` (fix CSS import)

- [ ] **Step 1: Fix CSS import in `src/layouts/Layout.astro`**

Remove the `<link rel="stylesheet" href="/src/styles/global.css" />` line and let Astro handle it via import in the page:

```astro
---
// src/layouts/Layout.astro
interface Props {
  title?: string;
}
const { title = 'Juaini — Software Engineer' } = Astro.props;
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="Juaini — Software Engineer specializing in Java, Spring Boot, Node.js, and React. Available for freelance and full-time roles." />
    <title>{title}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500;600&family=Inter:wght@300;400;500;600;700&display=swap"
      rel="stylesheet"
    />
    <slot name="head" />
  </head>
  <body>
    <slot />
  </body>
</html>
```

- [ ] **Step 2: Write `src/pages/index.astro`**

```astro
---
// src/pages/index.astro
import '../styles/global.css';
import Layout from '../layouts/Layout.astro';
import Nav from '../components/Nav.astro';
import Hero from '../components/Hero.astro';
import Stats from '../components/Stats.astro';
import Experience from '../components/Experience.astro';
import Stack from '../components/Stack.astro';
import Projects from '../components/Projects.astro';
import Contact from '../components/Contact.astro';
import Footer from '../components/Footer.astro';

import en from '../i18n/en.json';
import id from '../i18n/id.json';

const translations = { en, id };
const translationsJson = JSON.stringify(translations);
---

<Layout>
  <Nav />
  <main>
    <Hero />
    <Stats />
    <Experience />
    <Stack />
    <Projects />
    <Contact />
  </main>
  <Footer />

  <script define:vars={{ translationsJson }}>
    const translations = JSON.parse(translationsJson);

    function applyLang(lang) {
      const t = translations[lang] ?? translations['en'];
      document.documentElement.setAttribute('lang', lang);
      document.querySelectorAll('[data-i18n]').forEach((el) => {
        const key = el.dataset.i18n;
        if (t[key] !== undefined) el.innerHTML = t[key];
      });
    }

    function updateToggleUI(lang) {
      document.querySelectorAll('[data-lang-option]').forEach((opt) => {
        const isActive = opt.dataset.langOption === lang;
        opt.style.opacity = isActive ? '1' : '0.4';
        opt.style.fontWeight = isActive ? '600' : '400';
      });
    }

    const stored = localStorage.getItem('lang') ?? 'en';
    applyLang(stored);
    updateToggleUI(stored);

    document.querySelectorAll('[data-lang-toggle]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const current = localStorage.getItem('lang') ?? 'en';
        const next = current === 'en' ? 'id' : 'en';
        localStorage.setItem('lang', next);
        applyLang(next);
        updateToggleUI(next);
      });
    });
  </script>
</Layout>
```

> Note: The i18n script is inlined here (not imported from `src/scripts/i18n.ts`) because Astro's `define:vars` directive needs the translations JSON injected at build time. The `src/scripts/i18n.ts` file is still the reference source.

- [ ] **Step 3: Start dev server and visually verify all sections**

```bash
npm run dev
```

Open `http://localhost:4321` and verify:
- [ ] Nav renders with brand, links, lang toggle, CTA
- [ ] Hero displays heading + terminal card with blinking cursor
- [ ] Stats strip shows 4 numbers
- [ ] Experience shows 2 entries with bullet points and tags
- [ ] Stack shows 8-cell grid with tech chips
- [ ] Projects shows 3 cards with architecture diagrams
- [ ] Contact shows heading + email CTA + social links
- [ ] Footer shows copyright

- [ ] **Step 4: Test EN → ID toggle**

Click `EN | ID` button in navbar.
Expected: All `data-i18n` text elements switch to Indonesian. Toggle state persists on page reload.

- [ ] **Step 5: Test responsive layout**

Resize browser to < 900px.
Expected:
- Hero becomes single column (terminal card below text)
- Stats strip becomes 2 columns
- Stack grid becomes 2 columns
- Nav links hidden

- [ ] **Step 6: Run production build**

```bash
npm run build
```

Expected: `dist/` folder generated with zero errors or warnings.

- [ ] **Step 7: Commit everything**

```bash
git add src/pages/index.astro src/layouts/Layout.astro
git commit -m "feat: compose all sections in index.astro with i18n script"
```

---

## Task 13: Add .gitignore entry for brainstorm files

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Add `.superpowers/` to `.gitignore`**

```bash
echo ".superpowers/" >> .gitignore
git add .gitignore
git commit -m "chore: ignore .superpowers brainstorm directory"
```

---

## Success Checklist

- [ ] `npm run build` succeeds with zero errors
- [ ] All 8 sections render visually identical to `landing.html` reference
- [ ] Tailwind design tokens (`--color-accent`, `--color-bg`, etc.) work correctly
- [ ] Fonts load: Instrument Serif, JetBrains Mono, Inter
- [ ] EN/ID toggle works and persists via `localStorage`
- [ ] Responsive layout correct at mobile (<900px) and desktop
- [ ] Terminal card blinking caret animates
- [ ] Architecture diagrams in Projects section render correctly
