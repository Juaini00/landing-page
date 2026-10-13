# Juaini — Software Engineer

Astro portfolio using the accepted Doop E2 design and published content from the separate `landing-page-dashboard` CMS.

## Content and build contract

`CMS_CONTENT_URL` selects the public JSON endpoint. It defaults to `http://localhost:3000/api/content`.

Every production build fetches that endpoint and validates the response, including bilingual keys and referenced project/stack translations. An unreachable endpoint, any status other than 200, invalid JSON, or schema mismatch fails the build. There is no local content file, cached payload, or stale-content fallback.

The CMS owns translations, project diagrams and attachments, stack categories, technology names, identity, contact links, and metadata. Local `src/lib/chrome.ts` contains structural design labels only. The old local translation dictionaries and project data module are removed.

English renders in static HTML. The client uses the same embedded EN/ID dictionaries to switch languages and persist the choice. Both the dictionaries and JSON-LD escape `<`, U+2028, and U+2029 before inline embedding.

## Local development

Requires Node.js 22.12 or newer and the CMS endpoint running.

```sh
npm install
CMS_CONTENT_URL=http://localhost:3000/api/content npm run dev
```

The development server runs at `http://localhost:4321`. Set the endpoint to a reachable published CMS URL in deployment environments; a remote build cannot reach your workstation's localhost.

```sh
CMS_CONTENT_URL=http://localhost:3000/api/content npm run build
npm run preview
```

Publishing CMS changes requires a new landing-page build. Browser requests do not fetch content from the CMS.

## Design and rendering

- Source: Doop canvas `wjtHo079aQ`, desktop frame `PfuVEmxnx4`, mobile frame `qIUFOV_x2X`, and its `e2-full-page` guide.
- Graphite windows, concave tab joins, steel headings, glass content modules, and a shared inline sasirangan pattern. The footer motif strip is removed per feedback.
- Each current build has its own window. CMS media appears directly beneath that build's copy and diagram in rounded frames. Missing media renders no empty screenshot placeholder. Multiple attachments remain separate; videos are muted, controlled, and do not autoplay.
- `project.layout` selects the **diagram** side on desktop; copy comes first on mobile. CMS diagrams and category SVG paths are already sanitized by the CMS and render through Astro `set:html` without rewriting their contents.
- Avatar URLs may be root-relative local assets or absolute HTTPS URLs.
- Tech names resolve through `simple-icons` using the dashboard's normalization and alias rules. Unknown names remain plain text. Only referenced brand paths and UI icons are embedded in an inline SVG sprite; no icon API requests.
- Notches become in-flow panels below 1280px. Narrow layouts use one column, vertical pipelines, wrapping content, and 44px navigation/control targets.

## Motion and interaction

`nav.top` is fixed with a reserved document offset, a scrolled surface after ~24px, a reading-progress hairline, and a focus/hover/active-following underline measured against the actual label bounds. Section ownership (Home through Contact, with Projects owning every build and case study) drives `aria-current` and the indicator independent of IntersectionObserver callback order. The mobile `<dialog>` has an explicit open/opening/closing/closed lifecycle with cancellable WAAPI transitions, staggered link arrival, Escape handling, and an in-flow no-JS navigation fallback.

An inline head script in `Layout.astro` sets `html.motion-boot` and `html.motion-enter` before first paint, so the deferred module never hides content that already painted; a 3s timeout restores everything if the module fails. `src/scripts/motion.ts` then owns:

- **Hero entrance** (once per load): nav drops in, the window opens from a clipped inset, the headline wipes in through a soft mask and catches a chrome sheen, supporting copy resolves from blur, docks grow out of the frame edge they belong to, and the terminal card and status line type their real text with a brief caret.
- **Scroll reveal variants**: windows open with the hanging tab dropping in after; section headings choreograph their children (headline wipe + sheen, then copy); cards lift in batches ordered by position; icons pop, chips/brand marks stagger, role bullet ticks draw, diagram nodes arrive in flow order; notched docks grow from their frame edge on desktop; project diagrams slide in from their own side. A fresh load animates what is already in view; restored or hash scroll positions and keyboard focus reveal immediately.
- **Odometer counters** for hero stats, the Applied AI count, the domain count, and Toolbox totals: each digit is a reel that spins past a full cycle and settles over ~1.9s with per-column stagger. Screen readers get the real number throughout; the original text (current language) is restored when the reel lands or when language, visibility, or the menu interrupts.
- **Applied AI pipeline trace**: the connector travels node to node with eased hops (~3s), unreached steps stay dimmed, each step pops on arrival, and the policy gate sends one green ripple. Pointing at a step afterwards shows the flow up to it while later steps recede.
- **Toolbox marquee** (CMS-derived, pause/resume, combined hover/focus/offscreen/tab/menu pause precedence, a wrapped static fallback under `prefers-reduced-motion` or without JavaScript). A resting pointer decelerates the strip to a stop and releases it with an ease back to speed; every other pause reason is immediate.
- **Project media** load/error states, with images settling from a slight zoom.

Scroll-linked depth uses CSS scroll-driven animations where supported (progressive enhancement): window atmospheres and the sasirangan motif drift at different speeds, the hero copy recedes as it leaves, and the header hairline fills with reading progress.

`src/scripts/site.ts` coordinates language switching with both modules: counters are cancelled before text replaces, visible reading text resolves from a soft blur in reading order (one layout read after all writes), navigation/motion geometry refreshes after, and `data-i18n-aria-label` keeps control labels translated.

`src/scripts/hover.ts` adds pointer-following steel reflections to glass cards and project-media rims, tilts content cards (roles, principles, stack, cases, project diagrams, the hero terminal card) toward the pointer with a slight lift while their icon and heading drift on a nearer plane, and makes primary CTAs lean toward the pointer with the arrow travelling further. Tilt angle scales down with card size. It updates only the nearest surface, at most once per animation frame, with no idle animation loop; cards carry no transform at rest. Scrolling, leaving the document, resizing, losing focus, or changing motion/pointer preferences releases everything.

The shared interaction rules in `src/styles/global.css` cover every section: masked card-edge reflections, one-shot CTA/control sweeps, directional arrow travel, tactile button presses, directional link underlines, badge sheens and chip lifts, technology/icon emphasis, chrome-heading and stat sheens on hover, diagram nodes, profile avatar ring, wordmark hop, and footer links. Only real controls get pressed states and keyboard stops; badges and informational text keep their original semantics. Green status badges use a lower-opacity sheen to retain AA text contrast. The single green accent glow stays reserved for the pipeline's Policy Gate step.

Hover decoration is restricted to fine hover-capable pointers. Keyboard actions retain visible focus rings and equivalent action emphasis. Reduced motion removes the entrance, reveals, reels, trace, marquee, tilt, scroll-linked depth, sweeps, and transitions while retaining static surface/contrast feedback. The pipeline's row-local connector breakpoint matches its three-column layout through 1020px.

## Verification

```sh
npm test
CMS_CONTENT_URL=http://localhost:3000/api/content npm run build
```

The Node tests cover rejected CMS responses, schema/reference boundaries, icon normalization and unknown names, and safe JSON embedding. Motion was verified against the real production build/preview (not the dev server): fixed header and active-section ownership across every destination, following-line hover/focus/keyboard behavior, mobile dialog open/Escape/close lifecycle, language switching, the technology marquee's running/paused/reduced-motion states, the Applied AI connector at desktop/tablet/mobile widths, card hover/focus-within emphasis, and media error/zero-overflow behavior at 1440px and 320px. No E2E test suite is installed.

The hover refinement was checked in Chromium against the production preview: pointer tracking and exit cleanup across all seven glass-panel families; control/badge sweeps; keyboard focus; live reduced-motion cleanup and static feedback; touch suppression; language and marquee controls; mobile-menu open/Escape/navigation; and zero document overflow at 320, 390, 768, 900, 1020, and 1440px. The current published content has no media attachments, so media-rim rules are shared with cards but were not visually checked on a live attachment.

The motion overhaul was checked in Chromium against the production preview at 1440×900 and 390×844: timed hero-entrance frames (wipe/sheen custom-property progress, dock growth, typing, odometer reels), section reveal frames for Experience/Applied AI/Toolbox, card tilt and CTA magnet values with rest-state return to `transform: none`, pipeline hover path, marquee deceleration (`playbackRate` 1 → 0 → paused → 1), language switch mid-count, keyboard focus into an unrevealed section, hash load, reduced motion (no entrance class, no pending reveals, no reels, trace settled, no scroll-linked animation), mobile menu stagger, zero horizontal overflow, CLS 0, and LCP ≈ 160ms.

## Source layout

├── scripts/      # Language toggle, navigation, content motion, pointer lighting/tilt/magnet
└── styles/       # E2 material system, responsive layouts, navigation.css, and motion.css
```

The earlier Astro migration specs in `docs/superpowers/` are historical; this README describes the current implementation.
