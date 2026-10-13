/* Pointer surfaces: a steel reflection follows the pointer across glass and
   media rims, content cards tilt toward it, and primary CTAs lean in. Only
   the nearest surface updates, at most once per frame, with no idle loop. */
const TILT = '.role, .principle, .stack-card, .case, .bdiag, .termcard';

export function initHover(): void {
  const enabled = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  let listeners: AbortController | undefined;
  let active: HTMLElement | null = null;
  let pending: HTMLElement | null = null;
  let magnet: HTMLElement | null = null;
  let pendingMagnet: HTMLElement | null = null;
  let frame = 0;
  let x = 0;
  let y = 0;

  function release(surface: HTMLElement | null) {
    surface?.removeAttribute('data-pointer-lit');
    surface?.removeAttribute('data-tilt');
  }

  function clear() {
    cancelAnimationFrame(frame);
    frame = 0;
    release(active);
    magnet?.removeAttribute('data-magnet');
    active = pending = magnet = pendingMagnet = null;
  }

  function paint() {
    frame = 0;
    if (pending !== active) {
      release(active);
      active = pending;
    }
    if (pendingMagnet !== magnet) {
      magnet?.removeAttribute('data-magnet');
      magnet = pendingMagnet;
    }
    if (magnet) {
      const bounds = magnet.getBoundingClientRect();
      const dx = x - (bounds.left + bounds.width / 2);
      const dy = y - (bounds.top + bounds.height / 2);
      const clamp = (value: number, limit: number) => Math.max(-limit, Math.min(limit, value));
      magnet.style.setProperty('--mx', `${clamp(dx * 0.22, 10).toFixed(2)}px`);
      magnet.style.setProperty('--my', `${clamp(dy * 0.35, 7).toFixed(2)}px`);
      magnet.style.setProperty('--ax', `${clamp(dx * 0.12, 5).toFixed(2)}px`);
      magnet.style.setProperty('--ay', `${clamp(dy * 0.18, 4).toFixed(2)}px`);
      magnet.setAttribute('data-magnet', '');
    }
    if (!active) return;
    const bounds = active.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    const nx = (x - bounds.left) / bounds.width;
    const ny = (y - bounds.top) / bounds.height;
    active.style.setProperty('--hover-x', `${(nx * 100).toFixed(2)}%`);
    active.style.setProperty('--hover-y', `${(ny * 100).toFixed(2)}%`);
    active.setAttribute('data-pointer-lit', '');
    if (active.matches(TILT) && !active.hasAttribute('data-reveal-pending')) {
      // Larger surfaces tilt less so their far edge never swings noticeably.
      const max = Math.min(5, 1100 / Math.max(bounds.width, bounds.height));
      const px = Math.max(-1, Math.min(1, nx * 2 - 1));
      const py = Math.max(-1, Math.min(1, ny * 2 - 1));
      active.style.setProperty('--rx', `${(-py * max).toFixed(2)}deg`);
      active.style.setProperty('--ry', `${(px * max).toFixed(2)}deg`);
      active.style.setProperty('--px', px.toFixed(3));
      active.style.setProperty('--py', py.toFixed(3));
      active.setAttribute('data-tilt', '');
    }
  }

  function move(event: PointerEvent) {
    if (event.pointerType === 'touch') return;
    const target = event.target instanceof Element ? event.target : null;
    pending = target?.closest<HTMLElement>('.glass, .slot') ?? null;
    pendingMagnet = target?.closest<HTMLElement>('.go') ?? null;
    if (!pending && !active && !pendingMagnet && !magnet) return;
    x = event.clientX;
    y = event.clientY;
    if (!frame) frame = requestAnimationFrame(paint);
  }

  function configure() {
    listeners?.abort();
    clear();
    if (!enabled.matches) return;
    listeners = new AbortController();
    const { signal } = listeners;
    document.addEventListener('pointermove', move, { passive: true, signal });
    document.documentElement.addEventListener('pointerleave', clear, { signal });
    document.addEventListener('pointercancel', clear, { signal });
    // Scrolling or changing tabs invalidates the pointer's relationship to a card.
    document.addEventListener('scroll', clear, { passive: true, capture: true, signal });
    document.addEventListener('visibilitychange', clear, { signal });
    window.addEventListener('blur', clear, { signal });
    window.addEventListener('resize', clear, { passive: true, signal });
  }

  enabled.addEventListener('change', configure);
  configure();
}
