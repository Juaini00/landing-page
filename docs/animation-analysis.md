# Animation Analysis — Deep Dive (historical)

**Historical.** This document's baseline ("the page currently ships zero
animation") predates implementation. The approved plan is
`docs/superpowers/plans/2026-10-12-motion-interaction.md`; shipped behavior
is described in `README.md` § Motion and interaction, and lives in
`src/scripts/navigation.ts`, `src/scripts/motion.ts`,
`src/styles/navigation.css`, and `src/styles/motion.css`.

**Recovery notice:** an editing mistake during the motion implementation
session truncated this file; it was untracked in git (no commit to restore
from). The sections below (through "§4 Section-by-section opportunity map,
Nav / Hero / Experience / Applied AI pipeline") are recovered verbatim from
the session transcript. The remainder of the original document — the rest
of §4 (Toolbox, Projects, Contact, Footer), and §5 through §8 (motion
system consolidation, accessibility/WCAG triggers, open questions, and the
closing summary) — could not be recovered and is not reproduced here. That
content was analysis only, superseded by the implementation plan and the
shipped source above; nothing in the current implementation depends on it.

Analysis only. No implementation in this document; a build should happen as a
separate, approved follow-up once the open questions in §8 are answered.

## 1. Current state (ground truth)

Grepped `src/styles/global.css` and `src/scripts/site.ts` directly — the page
currently ships **zero animation**:

- No `transition`, `animation`, `@keyframes`, or scroll-triggered reveal
  anywhere in `global.css` except one line: `@media (prefers-reduced-motion:
  reduce) { html { scroll-behavior: auto; } }` (line 345). That rule exists
  only to cancel smooth-scroll; there is nothing else to cancel.
- `site.ts` has an `IntersectionObserver` (lines 53–68), but it only toggles
  a `data-nav-active` attribute on the nav link matching the section in view
  — a state change, not a visual transition (no CSS currently reacts to the
  attribute changing other than an instant color swap, `global.css:95`).
- Language toggle (`applyLang`, `site.ts:8–22`) replaces `.innerHTML` on
  every `[data-i18n]` node synchronously. Instant, no crossfade.
- Mobile menu uses native `<dialog>` `showModal()` / `close()` (`site.ts:45–46`)
  — instant open/close, no native dialog transition configured.
- Every hover state (`.go:hover`, `.nav-capsule a:hover`, `.channel:hover`)
  changes color/background with no `transition`, so it snaps.
- `prefers-reduced-motion` has nothing to turn off yet, which also means **any
  animation added later must be gated from day one**, not bolted on after.

This is a blank slate — good for a deliberate design, bad if animation gets
added piecemeal per-component without a shared motion system (that's how a
page ends up with five different easing curves and no consistency).

## 2. Constraints already binding this build

Two documents already govern this page and animation must not violate either:

**`e2-full-page` guideline (Doop, authoritative design spec):**
- "Accent: `#34c759` only for live/availability and the AI policy gate (one
  glowing element per section max)." — any new glow/pulse effect competes
  with this budget. The AI policy gate (`.pstep.guard`) and the two
  `AVAILABLE` pills (hero status dock, contact location dock) already spend
  it. **No new glow.**
- "Material hierarchy: glass = content cards; solid `#0b0e12` = frame parts
  ...; solid `#e8edf2` = primary CTAs only. Never blur a CTA." — motion
  design must respect this: CTAs (`.go`) get solid, opaque transitions;
  glass cards (`.glass`) should not get *additional* blur/backdrop-filter
  transitions layered on top of their existing `backdrop-filter: blur(16px)`
  (compositing cost — see §6).

**`antislop` / `antislop-ui` (project-wide filter, already in force on this
repo per the session's design work):**
- R-19 (Animations): "must have a clear UX purpose, and the purpose written
  down." Every animation proposed below carries a one-line reason (§4).
- "FORBIDDEN as default without purpose: every element using Fade Up +
  Floating + Scale + Bounce simultaneously." — reveal animation must be ONE
  consistent treatment, not a different one per section.
- "Endless Pulses and Loops... perpetual motion is noise... If the MOTION
  dial is 1 (hover states only), an endless loop is a FAIL." — a continuous
  marquee/running-line effect is explicitly the pattern this rule calls out.
  If a marquee ships, it must declare a MOTION dial that allows continuous
  motion (dial 3) and still respect WCAG 2.2.2 (see §5).
- Three Dials (ENERGY / RHYTHM / MOTION) must be declared explicitly before
  building, per the Design Read ritual. This page has not declared dials
  yet — §8 asks the user to pick, because the four requested categories
  (running line, fade in/out, interactive, transitions) span dial 1 through
  dial 3 depending on how far each is pushed.

## 3. Taxonomy of what was requested

The ask bundles four distinct animation families that have different risk
profiles, different implementation mechanisms, and different accessibility
obligations. Treating them as one bucket is how scope creeps. Breaking them
apart:

| Family | What it means here | Risk level | WCAG trigger |
|---|---|---|---|
| **Running line / text** | Continuous, looping motion: a marquee of logos/chips, an animated SVG line tracing the pipeline connector, or a typewriter-style text reveal | High — easiest to overdo, directly flagged by antislop R-19 | 2.2.2 (pause/stop/hide) if it auto-plays >5s |
| **Fade in / fade out** | Scroll-triggered reveal of sections/cards as they enter the viewport; exit fades are rare and usually skipped | Low–medium | 2.3.1 (no flashing); reduced-motion must disable |
| **Interactive animation** | Hover/focus/active states, button press feedback, chip/card lift, toggle transitions | Low | 2.2.2 not triggered (user-initiated); focus-visible must stay unaffected |
| **Transitions** | State changes: language swap crossfade, mobile menu open/close, nav active-indicator sliding, section-to-section scroll easing | Low–medium | None directly, but must not break `:focus-visible` timing or screen-reader announcement timing |

Each is analyzed per-section below, then consolidated into a motion system
in §6.

## 4. Section-by-section opportunity map

For each candidate, the format is: **Element → Animation → Purpose →
Trigger → Mechanism → Risk**. Only candidates with a real purpose are
listed — this list is deliberately not exhaustive of what's *possible*,
only what's *justified* (R-31: every decision needs a one-line reason).

### Nav (`Nav.astro`, `global.css:90–106`)
- **Active section indicator** → sliding underline/pill behind the current
  `nav-capsule a[data-nav-active]` instead of the instant color swap →
  *reinforces scroll position, the IntersectionObserver already computes
  it, currently wasted* → trigger: IntersectionObserver fires (already
  wired) → mechanism: `transform: translateX()` on a single pseudo-element
  sized to the active link's `getBoundingClientRect()` → risk: low,
  recompute on resize needed.
- **Mobile menu `<dialog>` open/close** → scale+fade instead of instant
  `showModal()`/`close()` → *the dialog covers the full viewport; appearing
  instantly is jarring, Safari/Chrome support `::backdrop` and
  `@starting-style` transitions on `<dialog>` natively now* → trigger:
  `showModal()` / `close()` calls already in `site.ts:45–46` → mechanism:
  CSS `@starting-style` + `transition` on `dialog[open]`, no JS change
  needed beyond possibly deferring `close()` by the transition duration →
  risk: low, but `@starting-style` is Baseline 2024 — needs a fallback for
  older WebKit (graceful: just no transition, still functional).
- **EN/ID toggle label swap** → the `<b>EN</b> / ID` ↔ `EN / <b>ID</b>`
  text flip → *currently instant, barely noticeable either way* → likely
  not worth animating (low value, adds code for a 2-character swap) —
  **recommend skip**, flag in §8.

### Hero (`Hero.astro`, `global.css:107–125`)
- **Headline entrance** → the h1 (`Reliable software, built to adapt.`) →
  *this is the first thing seen; a composed entrance signals intentional
  design rather than a template* → trigger: page load (not scroll, it's
  above the fold) → mechanism: `opacity` + small `translateY` on load,
  staggered: eyebrow → h1 → sub → CTAs → docks, each offset ~80ms →
  mechanism avoids layout shift by animating only `opacity`/`transform`
  (compositor-only properties) → risk: medium — must not delay perceived
  load (keep total stagger under ~600ms) and must respect
  `prefers-reduced-motion` (skip straight to final state).
- **Stat numbers (`3 yrs`, `12+`, `25`)** → count-up animation → *common
  "AI template" tell per antislop R-17-adjacent patterns (numeric
  counters are a frequent slop signal when used decoratively)* — these
  numbers are real CMS-sourced facts, not invented stats, so a counter is
  *defensible*, but antislop's broader caution about numeric-counter
  theater applies: **recommend skip or make very subtle** (under 400ms, no
  easing bounce). Flag in §8 rather than default to yes.
- **`$ currently: Backend Engineer` status line** → this is the one place
  in the whole design that uses terminal/mono styling with a `$` prompt
  (`ext.hero.currently`, `global.css` `.term .g`) → *a blinking cursor or
  a short typewriter reveal on first load would use the terminal
  convention it already signals, instead of decorating something that
  isn't a terminal* → mechanism: CSS `steps()` animation on a
  `::after` cursor block, runs once, respects reduced-motion → risk: low,
  self-contained, single element.
- **CTA hover (`.go`, `.ln`)** → already has a `.go:hover { background:
  #fff; }` snap (`global.css:84`) → *add `transition` so it reads as a
  deliberate press-state, not a flicker* → mechanism: `transition:
  background-color .15s ease, transform .15s ease` plus the arrow
  circle (`.arr`) nudging `translate(2px,-2px)` on hover (echoes the
  "go" affordance) → risk: none, this is the textbook justified case.

### Experience (`Experience.astro`, `global.css:126–153`)
- **Role cards (`.role.glass`) scroll reveal** → *three cards, one
  larger; staggering their entrance reinforces the hierarchy the layout
  already encodes (big card first)* → trigger: `IntersectionObserver`,
  fires once per card → mechanism: `opacity 0→1` + `translateY(16px)→0`,
  staggered 80ms per card → risk: low, this is the single most
  defensible "fade in on scroll" candidate on the page since it's
  content the user is meant to read in order.
- **Experience bullet list (`<li>` with the hairline tick mark)** →
  *tempting to stagger each bullet, but five bullets per big card ×
  reveal delay adds up to a slow read-in that annoys someone scrolling
  fast* — **recommend skip**, reveal the card as one unit, not bullet-by-
  bullet.

### Applied AI pipeline (`AppliedAI.astro`, `global.css:154–172`)
This is the strongest candidate for literally "a running line":
- **Pipeline connector (`.pipeline::before`, the horizontal line behind
  the six step icons)** → animate it drawing left-to-right once, in sync
  with the six `.pstep` icons lighting up in sequence → *this is the one
  section where a traced/running line has a real narrative purpose: it
  *is* a data-flow diagram (`Natural language → Retrieve → Plan → Policy
  gate → Execute → Audited result`), so a line that visibly travels
  through the steps explains the flow instead of decorating it* →
  trigger: section enters viewport, once → mechanism: the connector is
  currently a flat `background` line (`global.css:164`); convert to an
  SVG `<line>` with `stroke-dasharray`/`stroke-dashoffset` animated via
  CSS custom property, or a `::before` with `clip-path`/`transform:
  scaleX()` animated 0→1 with `transform-origin: left` (cheaper, no SVG
  needed) → risk: medium — must finish before/in-sync with the
  `.pstep.guard` icon's existing policy-gate highlight so the green step
  doesn't light up before the line "arrives" at it (sequencing bug risk).
- **`.pstep` icons** → light up in sequence (dim → full opacity /
  `color: var(--ink)`) timed to the line above → *reinforces the same
  causal flow* → mechanism: same trigger, staggered `transition-delay`
  per `.pstep`, calculated from index (`style="--i: 2"` + `calc()`) →
  risk: low once the line timing above is solved.
- **Do NOT loop this.** It should run once when scrolled into view and
  stay in its resolved state. A looping pipeline animation would
  directly trip antislop's "Endless Pulses and Loops" rule — the policy
  gate step already has a static glow per §2; don't stack a JS-driven
  recurring pulse on top.
