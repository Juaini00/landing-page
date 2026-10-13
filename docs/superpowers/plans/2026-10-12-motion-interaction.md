# Landing Page Motion and Interaction Implementation Plan

Date: 2026-10-12
Status: Planned, not implemented.

## 1. Goal and scope

Deliver a complete motion layer for the existing landing page, not a collection of scroll fades. Cover fixed navigation, moving active indicators, hover/focus/pressed feedback, running text, running lines, section choreography, language changes, mobile navigation, and media presentation.

Preserve the accepted E2 design, existing content, links, semantic structure, and CMS integration. Full coverage means every section and interactive control has a deliberate treatment; it does not mean every element must constantly move.

The implementation surface is `landing-page`. `landing-page-dashboard` remains the published-content backend. Redesigning or animating the CMS editor itself is outside this plan; its mention establishes the integration boundary, not a second motion project.

All paths below are relative to `landing-page` unless explicitly prefixed with `../landing-page-dashboard`.

## 2. Verified baseline

Source inspection and a browser walkthrough of the running page established:

| Area | Current behavior | Required change |
| --- | --- | --- |
| Header | `nav.top` is static, 80px high on desktop and 70px below 600px | Fixed positioning, reserved document space, scrolled appearance, anchor offsets |
| Active navigation | Scroll-spy covers work, ai, stack, projects, contact; existing underline uses measured CSS variables | Include Home, deterministic section ownership, hover/focus following line, resize and locale recalculation |
| Reveal | Shared `data-reveal`, `.is-in`, IntersectionObserver, capped stagger | Harden initialization, focus visibility, tall-content handling, and section-specific choreography |
| Hero | Entrance animation, short cursor animation, numeric count-up | Preserve restrained entrance; prevent counters overwriting newer language content |
| AI pipeline | One-shot horizontal connector trace and step opacity sequence | Synchronize line and steps; provide real responsive connector geometry |
| Controls | Basic color changes, CTA arrow movement, pressed scale, contact-link movement | Consistent hover, keyboard focus, pressed and selected states |
| Mobile menu | Native dialog; CSS opening/closing transition rules | Verify exit lifecycle, focus restoration, rapid interaction, and browser fallback |
| Language | Synchronous replacement of `data-i18n` contents | Interruptible transition with correct geometry updates and stable controls |
| Running text | No marquee implementation | Add one CMS-derived technology strip with pause controls |
| Content | Astro fetches published CMS content at build time | Keep the same contract; do not add browser content fetching |

Browser evidence: the desktop page rendered at 1440×1000; computed header position was `static`; initial active navigation was empty; clicking Work activated its link and populated underline geometry. The rendered page contained 26 reveal targets and one trace target. At 390×844, switching to Indonesian worked and the native menu opened and closed with Escape. These are baseline observations, not proof that the proposed motion exists or that all current interactions pass.

`docs/animation-analysis.md` is historical: its opening claim of zero animation no longer matches `src/scripts/site.ts` and `src/styles/global.css`. Use current source and this plan for implementation; do not recreate functionality already present.

## 3. Design direction and technical decision

Reading this as an engineering portfolio for prospective collaborators and employers, using its existing graphite, steel, window-frame, and Sasirangan visual language.

- ENERGY 2: preserve the existing strong typography and restrained accents.
- RHYTHM 2: preserve the different compositions already used by each section.
- MOTION 3, selectively applied: moving navigation, a technology marquee, and a traced workflow provide the distinctive motion. Reading surfaces remain calm.
- Repeated motion motif: a line follows position or explains direction. It belongs in navigation and the workflow, not on every card.
- No palette, typography, asset, or layout redesign. No additional glow system.

### Approach selection

| Approach | Tradeoff | Decision |
| --- | --- | --- |
| CSS transitions/keyframes plus native browser APIs | Small runtime; requires explicit state ownership | Selected |
| General animation library | Useful for complex timelines, but unnecessary dependency and lifecycle work here | Do not add |
| Scroll hijacking, pinned scenes, pervasive parallax | Strong spectacle but changes reading and navigation behavior | Do not use |

Use CSS for visual interpolation, IntersectionObserver for visibility, ResizeObserver for geometry invalidation, and requestAnimationFrame for bounded measurement/update work. Use Web Animations API only where cancellation makes a state transition simpler. Do not add React hydration, GSAP, Motion, Lenis, or a custom animation framework.

## 4. Shared motion contract

### Tokens

Extend existing `--dur-micro`, `--dur-reveal`, and `--ease` rather than introducing competing values.

| Treatment | Target |
| --- | --- |
| Press feedback | 100–120ms; scale no smaller than 0.985 |
| Hover/focus interpolation | 150ms |
| Navigation indicator/header surface | 220–280ms |
| Dialog | 240ms entrance, 180ms exit |
| Content reveal | 350–450ms; displacement 8–16px |
| Stagger | 60–80ms per group; total delay capped at 240ms |
| Language transition | At most 180ms total |
| Pipeline sequence | 900–1200ms, once per page visit |
| Marquee | Constant 24–32 CSS pixels/second; duration derived from measured track width |

Use the existing ease-out curve for entrances and state changes, linear movement for the marquee, and a non-bouncy exit curve. These are implementation targets, subject to visual tuning within the specified bounds.

### Invariants

1. Base HTML and CSS show the final readable state. Motion is progressive enhancement.
2. Install observers successfully before enabling reveal hiding. On initialization failure, leave content visible.
3. Reduced motion disables translation, scaling, counting, tracing, marquee movement, and smooth scrolling. State changes and visible selected/focus indicators remain functional.
4. React to preference changes during the session: cancel ongoing work and settle to final state immediately.
5. Reveal once. Do not fade reading content out when it leaves the viewport.
6. Focus entering a pending reveal forces that content visible immediately. Never leave a focused control at zero opacity.
7. Do not use `transition: all`, animate large blur/backdrop-filter surfaces, or attach a permanent frame loop to every element.
8. Separate entrance transforms from interactive transforms using wrappers or distinct properties. Hover must not cancel reveal positioning.
9. Pause continuous motion when offscreen, when the document is hidden, or while a modal covers the page.
10. A user pause is sticky for the current page visit; automatic resume conditions must not override it.

## 5. Fixed header and following navigation line

### Fixed header

- Make the top navigation fixed at the viewport top from first render. Keep its existing centered maximum-width alignment.
- Reserve its full occupied height in document flow before JavaScript runs. Include safe-area inset where applicable.
- Keep the physical header height stable across top/scrolled states. Animate surface opacity and separator treatment rather than header height or page padding.
- Add a scrolled state after approximately 24px of page travel, with a small hysteresis band to prevent flicker near the threshold.
- Use an opaque graphite surface when scrolled; avoid adding another animated backdrop blur.
- Set one measured header-offset variable and apply it to anchor `scroll-margin-top`, with a reading gap of approximately 16px. Avoid double-counting equivalent scroll padding.
- Keep the header visible rather than auto-hiding on scroll. Native dialog top-layer content remains above it.
- Include an accessible skip-to-content link that becomes visible on focus and is not covered by the fixed header.

### Active section ownership

The semantic active section and the temporarily highlighted link are separate states.

- Register `top`, `work`, `ai`, `stack`, `projects`, and `contact` from actual rendered targets.
- Determine active ownership from ordered section boundaries at a reading line below the fixed header, not the order of IntersectionObserver callback entries.
- Home owns the start of the document. Contact owns the bottom-of-document state.
- Projects owns all build windows and case studies through the start of Contact. The second build and cases currently have no section IDs; observing only the first project window is insufficient.
- Preserve `#projects` even when the CMS project list is empty, using an honest section-level empty state. Do not fabricate projects or leave a dead navigation target.
- Keep exactly one `aria-current="location"` item per navigation group. Hover never changes this semantic state.
- Reconcile initial hashes, reload, back/forward navigation, manual scrolling, anchor clicks, and interrupted smooth scrolling.
- Navigation must remain native: preserve hrefs, URL hashes, modified clicks, and browser history behavior. Do not prevent navigation merely to finish an animation.

### Following line

- Use one indicator in the desktop top capsule. Scope its styles to the top navigation so the footer capsule does not inherit its geometry.
- The displayed target follows keyboard focus first, then pointer hover, then the active section. On leaving the capsule, return to the active section.
- Move the line to the actual label bounds. Animate translation and horizontal scale; update measured geometry outside the animation loop.
- Recalculate after font readiness, resize, breakpoint changes, language replacement, and header geometry changes.
- Hide the decorative line when its desktop capsule is hidden. Never measure a `display:none` target as valid geometry.
- Keep a static selected treatment under reduced motion and forced-colors settings. The moving line is not the only active-state signal.

Acceptance: all six destinations behave correctly; Home is selected initially; the line follows hover and focus without changing `aria-current`; returning from either preview restores the real active section; long Indonesian labels do not desynchronize it.

## 6. Complete surface coverage

| Surface | Motion and trigger | Purpose and constraints |
| --- | --- | --- |
| Wordmark and navigation links | Underline/color feedback on hover and focus; brief pressed feedback | Confirm actual navigation affordances without moving the header layout |
| Primary CTA `.go` | Small arrow nudge, background transition, press compression | Reinforce action direction; preserve immediate activation |
| Secondary `.ln` and back-to-top links | Underline grows on hover/focus; press state | Make text links visibly interactive |
| Hero heading and copy | Short grouped entrance; heading readable immediately, no delayed full-opacity gate on primary content | Establish reading order without compromising perceived loading |
| Hero profile, stats, status, terminal card | Small bounded entrance, no endless float | Support the headline rather than compete with it |
| Hero numbers | Preserve existing brief integer count-up only for safe numeric values | Never parse formatted strings incorrectly or replace CMS meaning |
| Experience `.role` cards | Reveal by card, capped stagger; subtle surface emphasis on pointer hover | Guide reading order; static articles do not get pointer cursor, tabindex, or pressed states |
| AI workflow | Running connector and coordinated step emphasis | Explain actual pipeline order; not a fabricated live execution indicator |
| AI principles | Grouped reveal and restrained surface emphasis | Support scanning without separate animations for every sentence |
| Toolbox cards | Group reveal; static chips retain readable labels | Show category hierarchy without pretending chips are buttons |
| Toolbox technology strip | Continuous running text/marks with pause control | Provide a compact scan of real technologies without replacing the readable grid |
| Project copy and diagram | Paired reveal; copy precedes supporting diagram | Preserve narrative and mobile source order |
| Project media | Frame reveal and image-ready opacity transition with reserved space | Avoid sudden media appearance and layout jumps |
| Project links and case-study links | Shared CTA/link treatments | Consistent feedback for real destinations |
| Case-study articles | Grouped reveal and focus-within surface emphasis where links exist | Highlight the item containing an actual focused control |
| Contact copy and profile | Restrained grouped entrance | Bring attention to the final action |
| Contact channels | Icon/underline movement, focus parity, pressed state | Signal email/social destinations without changing links |
| Footer | Link feedback and back-to-top navigation | Finish navigation consistently; no decorative looping footer strip |
| Window tabs and docks | At most a short grouped reveal with their content | Retain window geometry; do not animate the shared blurred background |

Noninteractive cards may change surface emphasis but must not acquire click-like press behavior. Do not add pointer tracking, magnetic cursors, 3D tilt, confetti, or unrelated controls.

## 7. Running text and running lines

### Technology marquee

Implement one strip inside Toolbox, between its introduction and existing category grid.

- Derive entries from the ordered, deduplicated union of `content.stack[].primary` and `content.stack[].items`.
- Reuse existing `techIds`, sprite marks, and unknown-name plain-text fallback. No fabricated technologies or new icon requests.
- Keep the category grid as the canonical readable content; the moving strip is supplementary.
- Render one accessible list. Any duplicate track used to close the loop is `aria-hidden`, has no IDs, and contains no focusable descendants.
- Measure the complete original track including the seam gap. Translate by exactly that distance, then loop without a visible jump.
- If content does not overflow, render a static row rather than unnecessary duplication. Empty input renders no strip or pause button.
- Provide a visible, localized Pause/Resume button. Hover and focus-within pause temporarily, but they do not replace the explicit control required for prolonged automatic movement.
- Effective pause state combines user pause, hover/focus, reduced motion, visibility, document visibility, and menu state. Resume only when every applicable reason is cleared.
- On reduced motion or no JavaScript, render one static wrapping list with all entries available. Do not freeze a clipped strip that hides half the content.
- Recalculate after fonts and container resize. Avoid repeated cloning or abrupt restarts on ordinary hover.

### AI running connector

- Keep the underlying connector visible. Animate an accent segment or reveal over that line rather than making the workflow unintelligible before animation completes.
- Desktop: six horizontal steps, trace left to right.
- Tablet: current layout is three columns over two rows. Use row-local connectors, sequencing the first row before the second; do not draw a misleading diagonal across unrelated cells.
- Mobile: current layout is one column. Provide a vertical connector, top to bottom.
- Keep all step labels readable throughout. Animate icon/connector emphasis, not low-opacity explanatory text.
- Synchronize step emphasis with actual segment progress. A nonlinear line animation cannot be synchronized by assuming equal time means equal distance.
- Run once when visible and settle. Resizing or changing language preserves completion rather than replaying the workflow.
- This is explanatory motion, not backend execution telemetry. No recurring success flashes or fabricated live statuses.

## 8. State transitions

### Language switch

- Preserve the existing embedded dictionaries and `data-fmt` substitutions.
- Do not wrap persistent controls or motion-owned containers inside nodes whose `innerHTML` is replaced by `applyLang`.
- Apply a short, interruptible text transition only to appropriate visible text groups. Avoid a full-page fade that makes all content and controls temporarily disappear.
- Update `html.lang`, toggle label, and persisted preference to the latest requested language. Rapid clicks must converge on the last request.
- Cancel active count-up before replacing translated numbers. Read the latest dictionary value for final text; do not restore an older captured string.
- Recompute navigation geometry and section boundaries after replacement. Preserve focus and selected section where possible.
- Localize new Pause/Resume and accessibility control labels in `src/lib/chrome.ts`, which already owns structural labels.
- Reduced motion performs an immediate swap. No network request is involved.

### Mobile dialog

- Keep native `showModal()` semantics, focus containment, Escape handling, and background inertness.
- Model closed, opening, open, and closing states explicitly where needed. Repeated open/close requests must not leave a hidden modal trapping focus.
- Choose a single close owner: either supported discrete CSS display/overlay transitions or an explicit cancellable exit before `close()`. Do not combine competing timers and CSS lifecycle handling.
- Retain the top layer for the exit where supported. Unsupported browsers close immediately and remain fully usable.
- Set `aria-expanded` on the opener. Close through button, Escape, or destination selection; restore focus appropriately. Destination selection must not steal focus back from the intended content target.
- Clear any scroll lock on every close path, including breakpoint changes. Menu content must scroll on short landscape screens.
- Reduced motion opens/closes immediately. Native navigation must not wait for staggered link exits.

### Media and reveal readiness

- Preserve native video controls, muted/playsinline settings, and no-autoplay behavior. Do not move a playing video or cover its controls with hover overlays.
- Reserve media space before loading using known dimensions where available or a deliberate frame aspect ratio. Preserve images with `object-fit:contain` when cropping would hide important content.
- Slow/error media must not remain permanently transparent. Keep alt text or an explicit unavailable state visible; do not create fake screenshot placeholders.
- Tall cards must reveal when their leading edge becomes visible, even if 15% of their full height cannot fit in the viewport.
- No-JS content and links stay readable. For mobile navigation without JavaScript, provide an in-flow navigation fallback instead of leaving only an inoperative menu button.

## 9. File map and ownership

| File | Planned responsibility |
| --- | --- |
| `src/styles/global.css` | Extend tokens; fixed header, offsets, interaction styles, running tracks, responsive connectors, reduced-motion/fallback rules; replace conflicting old motion rules |
| `src/scripts/site.ts` | Remain client entry point; coordinate language updates with motion initialization and refresh |
| `src/scripts/navigation.ts` (new) | Fixed-header state, active section resolution, indicator geometry, dialog lifecycle |
| `src/scripts/motion.ts` (new) | Reveal, pipeline, marquee, counters, preference and visibility lifecycle |
| `src/components/Nav.astro` | Header structure, indicator, active semantics, opener state, no-JS navigation |
| `src/layouts/Layout.astro` | Skip link and document-level motion/header hooks where required |
| `src/pages/index.astro` | Main target and assembly; preserve existing CMS fetch and dictionary embedding |
| `src/components/Window.astro` | Minimal shared ownership/reveal hooks; preserve atmosphere and tab layout |
| `src/components/Hero.astro` | Entrance groups and stable counter targets |
| `src/components/Experience.astro` | Grouped card treatment and dock behavior |
| `src/components/AppliedAI.astro` | Responsive connector markup and step hooks |
| `src/components/Toolbox.astro` | CMS-derived marquee, accessible original list, duplicate track and controls |
| `src/components/Projects.astro` | Projects ownership across windows, empty anchor, media readiness and reveal groups |
| `src/components/Contact.astro` | Channel and grouped entrance hooks |
| `src/components/Footer.astro` | Shared link states; avoid header-only indicator inheritance |
| `src/lib/chrome.ts` | EN/ID labels for new structural controls and empty-state UI |
| `README.md` | Document shipped behavior and verification procedure after implementation |
| `docs/animation-analysis.md` | Mark old baseline as historical and link to implemented behavior after cutover |

Keep these modules explicit and small, not a generic plugin registry. Initialization returns teardown/refresh handles only where used. Language changes call the relevant refresh paths directly. Remove superseded handlers from `site.ts`; do not leave two scroll-spies or two dialog controllers.

`src/lib/cms.ts`, `src/lib/embed.ts`, and the backend content contract remain intentionally unchanged unless a concrete integration regression requires a correction.

## 10. CMS and backend safeguards

- `../landing-page-dashboard/app/api/content/route.ts` continues to serve published content through the existing service.
- Preserve build failure for unavailable, malformed, or invalid CMS responses. Do not add cached or fake content to make animation previews work.
- Publishing still requires rebuilding the static landing page. Motion does not introduce live content synchronization.
- No new motion fields, database migration, authenticated endpoint, or dashboard editor controls are required.
- Respect reordered projects, variable technology lists, long translations, unknown technology names, missing optional media, and empty valid arrays.
- Do not rewrite arbitrary sanitized `diagramHtml` to inject animation selectors. Animate its owned wrapper; use explicit local connector markup only for the local Applied AI pipeline.
- Preserve sanitized markup, URL handling, escaping, link targets, and the sprite's existing accessibility behavior.
- Validate against published content read-only. Do not publish test data or alter production drafts to demonstrate effects.

## 11. Ordered implementation work

All phases are required for completion. These are execution boundaries, not permission to ship only the first effects.

### Phase 1: Shared foundation

- [ ] Extend motion tokens and define reduced-motion/static states first.
- [ ] Establish native module lifecycle and safe progressive initialization.
- [ ] Replace conflicting transition declarations rather than appending overriding patches indefinitely.
- [ ] Separate entrance, hover, and language animation ownership.

Exit criterion: no-JS and reduced-motion pages remain readable and functional; enabling motion cannot hide content indefinitely.

### Phase 2: Header and navigation

- [ ] Implement fixed header, reserved height, safe-area handling, scrolled surface, and skip link.
- [ ] Include Home and establish full Projects ownership plus empty Projects anchor.
- [ ] Implement deterministic active state, native hash behavior, and `aria-current`.
- [ ] Implement following line with hover/focus precedence and all geometry refresh triggers.

Exit criterion: every nav destination remains visible below the header and active state stays correct across the entire page.

### Phase 3: Interactive states and section choreography

- [ ] Apply shared link/button hover, focus-visible, pressed, and selected treatments.
- [ ] Cover every row of the surface matrix in section 6.
- [ ] Harden reveal for keyboard focus, fast scrolling, tall cards, and grouped stagger.
- [ ] Keep hero content promptly readable; make counter cancellation locale-safe.

Exit criterion: the complete page has coherent feedback without implying that static content is clickable.

### Phase 4: Running text and running lines

- [ ] Build the CMS-derived Toolbox marquee with seamless measured repetition.
- [ ] Implement accessible Pause/Resume and combined pause reasons.
- [ ] Implement horizontal, row-local, and vertical AI connectors with synchronized emphasis.
- [ ] Verify static, short-content, empty-content, and reduced-motion states.

Exit criterion: running text and running lines are demonstrably implemented, not replaced by fade effects.

### Phase 5: State and media transitions

- [ ] Implement cancellable language transitions and post-swap geometry refresh.
- [ ] Complete mobile dialog entry/exit, focus restoration, and no-JS fallback.
- [ ] Add media readiness treatment without autoplay or content-obscuring transforms.

Exit criterion: rapid interactions, slow media, and changing preferences settle into the correct final state.

### Phase 6: Integrated verification and documentation

- [ ] Run the existing tests and production build after integration.
- [ ] Exercise the built preview, not only the development server.
- [ ] Complete the verification matrix below and capture desktop/mobile visual evidence plus short motion recordings.
- [ ] Update README and mark the old motion analysis as historical once the feature ships.
- [ ] Remove superseded selectors, listeners, experimental scaffolding, and throwaway checks.

Exit criterion: every acceptance item passes with observed evidence; no unimplemented motion category is labeled complete.

## 12. Verification plan

### Commands

Run from `landing-page`, with a reachable published CMS endpoint:

```sh
npm test
CMS_CONTENT_URL=http://localhost:3000/api/content npm run build
npm run preview -- --host 127.0.0.1
```

Use the preview URL reported by Astro. If the CMS is unavailable, report the prerequisite; do not introduce a content fallback.

Existing tests cover CMS validation, icon resolution, and JSON embedding, not browser motion. Add focused permanent regression tests only for extracted behavior with meaningful boundaries, such as section ownership, pause-state precedence, or interrupted language/count-up final values. Do not assert literal CSS/source strings or add an E2E framework solely for this plan.

### Browser scenarios

| Scenario | Required observation |
| --- | --- |
| 1440px desktop and wider | Header alignment remains centered; no gap or page jump on scroll |
| 1020px and 900px boundaries | Pipeline geometry and nav layout switch without stale measurements |
| 899px, 768px, 599px, 390px, 320px | Mobile navigation, connectors, marquee and content fit without horizontal overflow |
| 200% zoom and short landscape | Controls remain reachable, text unclipped, dialog independently scrollable |
| Initial load, deep hash, reload, back/forward | Correct active item and readable target below header |
| Every build and case study | Projects remains active until Contact takes ownership |
| Pointer hover then leave | Following line previews the target and returns to active item |
| Keyboard Tab/Enter/Space/Escape | Focus always visible; controls work; dialog does not trap focus after closing |
| Rapid menu and language input | Latest requested state wins; no invisible modal or stale text |
| EN and ID; late-loading fonts | Indicator, anchors, connectors and marquee recalculate correctly |
| Marquee paused manually, then offscreen and back | Manual pause persists; no automatic unwanted resume |
| Reduced motion at load and toggled mid-animation | Immediate static final states; all interaction remains functional |
| Hidden tab, offscreen strip, open dialog | Continuous motion pauses and resumes only when permitted |
| JavaScript disabled or initialization interrupted | Content visible; anchors and mobile navigation available |
| Long/empty valid content and missing optional media | No broken targets, blank tracks, incorrect duplication, or fake content |
| Slow/broken image; user-played video | Readable fallback; no permanent opacity zero; video controls unaffected |
| Chrome and Safari/WebKit; Firefox fallback | Dialog closes reliably and unsupported animation features degrade to working static UI |

Use isolated test payloads only for boundary verification; label them as fixtures and do not publish them to the CMS. Verify the normal path against actual published content.

### Performance and accessibility evidence

- Compare baseline and changed production preview under the same viewport/network/CPU settings. Record measurements, not unsupported performance claims.
- Target no layout shifts caused by header initialization, reveal, or indicator movement. Overall CLS target is at most 0.1; identify media/font contributions separately.
- Keep hero/LCP content out of delayed invisible entrance states. Investigate any measurable LCP regression.
- Inspect a performance recording for forced read/write layout cycles, repeated observer installation, and animation-created long tasks over 50ms.
- Ensure idle/offscreen motion does not retain a continuous JavaScript frame loop.
- Verify actual computed contrast for new selected, hover, focus, and control states: 4.5:1 normal text, 3:1 large text and relevant non-text indicators.
- Check screen-reader output contains one technology list, not duplicate marquee announcements; active navigation and pause state must be perceivable.
- No flash effects; no mandatory animation for obtaining information; explicit control for automatic prolonged movement.

## 13. Definition of done

- [ ] Fixed header works on desktop/mobile without covering destinations or focused content.
- [ ] Home and all other sections have correct active semantics, including the entire Projects group.
- [ ] Following line responds to hover, focus, active section, language, fonts, and resize.
- [ ] Every real interactive control has coherent hover/focus/pressed feedback; static content is not misrepresented as interactive.
- [ ] Running text exists, uses CMS content, loops cleanly, and supports persistent user pause.
- [ ] Running connector exists at desktop/tablet/mobile sizes and matches pipeline order.
- [ ] Every section has a deliberate motion/static treatment, not blanket fade-in/fade-out.
- [ ] Language and mobile-menu transitions handle interruption and preserve accessibility.
- [ ] Reduced motion, no-JS navigation, long content, and media failure remain usable.
- [ ] Existing CMS build contract, sanitization boundaries, links, and video behavior remain intact.
- [ ] Existing tests and production build pass; browser scenarios have recorded results.
- [ ] Documentation describes shipped behavior, and superseded motion implementations are removed.

## 14. Plan review record

- PASS, coverage: sections 5–8 explicitly specify fixed navigation, following line, hover/pressed states, running text, running lines, section motion, and state transitions.
- PASS, purpose: each surface in section 6 has a written reason and limits; continuous motion is confined to the requested, controllable technology strip.
- PASS, integration boundary: section 10 preserves the published-content contract and requires no backend schema changes.
- PASS, actionable execution: sections 9 and 11 identify existing/new files, dependencies, ordered tasks, and exit criteria.
- PASS, evidence honesty: section 2 separates observed baseline behavior from proposed behavior. Sections 12–13 are future verification requirements, not claimed results.

This document does not certify the accessibility, performance, or correctness of the future implementation. Those claims require the execution evidence listed above.
