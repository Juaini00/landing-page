# Juaini — Software Engineer

Personal portfolio for [Juaini](https://www.linkedin.com/in/juaini-i), a software engineer with a strong backend foundation and hands-on experience across mobile, web, and applied AI.

**Live site:** [portfolio-juaini.vercel.app](https://portfolio-juaini.vercel.app)

## What the portfolio covers

- Production backend experience across events, logistics, and financial services.
- Applied AI engineering built around grounding, policy enforcement, deterministic execution, and observability.
- A detailed case study of [Fineract AI Reports](https://github.com/Juaini00/fineract-ai-reports), a Rust natural-language reporting service where the model plans but never writes SQL.
- Additional full-stack and enterprise system work.
- English and Indonesian content with a persistent language preference.

## Tech

- [Astro](https://astro.build/) 6
- [Tailwind CSS](https://tailwindcss.com/) 4
- TypeScript
- Node.js test runner

The site is statically rendered. Client-side JavaScript is limited to language switching, progressive reveal effects, hero text motion, and active navigation state.

## Local development

Requires Node.js 22.12 or newer.

```sh
npm install
npm run dev
```

The development server runs at `http://localhost:4321`.

## Verification

```sh
npm test
npm run build
```

`npm test` validates key portfolio claims, project links, bilingual content, and responsive project structure. `npm run build` performs the production Astro build.

## Project structure

```text
src/
├── components/   # Portfolio sections
├── data/         # Structured project case studies
├── i18n/         # English and Indonesian content
├── layouts/      # Metadata and page shell
├── pages/        # Route entry points
└── styles/       # Global design system
```

## Contact

- [LinkedIn](https://www.linkedin.com/in/juaini-i)
- [GitHub](https://github.com/Juaini00)
- Email: [juaini742@gmail.com](mailto:juaini742@gmail.com)
