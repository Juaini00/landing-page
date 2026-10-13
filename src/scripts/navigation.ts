const destinations = ['top', 'work', 'ai', 'stack', 'projects', 'contact'];

export function initNavigation(): { refresh(): void } {
  const root = document.documentElement;
  const header = document.querySelector<HTMLElement>('nav.top');
  const capsule = header?.querySelector<HTMLElement>('.nav-capsule');
  const links = [...document.querySelectorAll<HTMLAnchorElement>(
    'nav.top .nav-capsule a, .mobile-menu .sheet a, .mobile-nav-fallback a, footer.site .nav-capsule a',
  )];
  const desktopLinks = [...(capsule?.querySelectorAll<HTMLAnchorElement>('a') ?? [])];
  const sections = destinations.flatMap(id => {
    const element = document.getElementById(id);
    return element ? [{ id, element, top: 0 }] : [];
  });
  const geometry = new Map<HTMLAnchorElement, { x: number; width: number }>();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 899px)');
  let active = '';
  let hovered: HTMLAnchorElement | null = null;
  let focused: HTMLAnchorElement | null = null;
  let headerOffset = 96;
  let pageHeight = 0;
  let frame = 0;
  let dirty = true;
  let scrolled = false;

  function indicator() {
    if (!capsule) return;
    const keyboardTarget = focused?.matches(':focus-visible') ? focused : null;
    const target = keyboardTarget ?? hovered ?? desktopLinks.find(link => link.hash === `#${active}`);
    const rect = target ? geometry.get(target) : undefined;
    capsule.toggleAttribute('data-indicator-ready', !!rect);
    if (!rect) return;
    capsule.style.setProperty('--nav-x', `${rect.x}px`);
    capsule.style.setProperty('--nav-width', String(rect.width));
  }

  function measure() {
    if (header) {
      headerOffset = header.getBoundingClientRect().height + 16;
      root.style.setProperty('--header-offset', `${headerOffset}px`);
    }
    for (const section of sections) section.top = section.element.getBoundingClientRect().top + scrollY;
    pageHeight = root.scrollHeight;
    geometry.clear();
    if (capsule && capsule.getClientRects().length) {
      const box = capsule.getBoundingClientRect();
      for (const link of desktopLinks) {
        const label = link.querySelector<HTMLElement>('[data-i18n]');
        const bounds = label?.getBoundingClientRect();
        if (bounds && bounds.width > 0) geometry.set(link, { x: bounds.left - box.left, width: bounds.width });
      }
    }
    dirty = false;
  }

  function update() {
    frame = 0;
    if (dirty) measure();
    const y = Math.max(0, scrollY);
    const nextScrolled = scrolled ? y > 20 : y > 28;
    if (scrolled !== nextScrolled) {
      scrolled = nextScrolled;
      header?.classList.toggle('is-scrolled', scrolled);
    }
    let next = sections[0]?.id ?? '';
    const readingLine = y + headerOffset + 1;
    for (const section of sections) {
      if (section.top <= readingLine) next = section.id;
    }
    if (y > 0 && y + innerHeight >= pageHeight - 2 && sections.some(section => section.id === 'contact')) next = 'contact';
    if (next !== active) {
      active = next;
      for (const link of links) {
        const selected = link.hash === `#${active}`;
        link.toggleAttribute('data-nav-active', selected);
        if (selected) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      }
    }
    indicator();
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(update);
  }
  function refresh() {
    dirty = true;
    schedule();
  }

  for (const link of desktopLinks) {
    link.addEventListener('pointerenter', event => {
      if (event.pointerType === 'touch') return;
      hovered = link;
      indicator();
    });
    link.addEventListener('pointerleave', () => {
      if (hovered === link) hovered = null;
      indicator();
    });
    link.addEventListener('focus', () => { focused = link; indicator(); });
    link.addEventListener('blur', () => { focused = null; indicator(); });
  }
  capsule?.addEventListener('pointerleave', () => { hovered = null; indicator(); });
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', refresh, { passive: true });
  addEventListener('hashchange', refresh);
  addEventListener('popstate', refresh);
  addEventListener('pageshow', refresh);
  addEventListener('load', refresh, { once: true });
  document.fonts?.ready.then(refresh);
  document.fonts?.addEventListener('loadingdone', refresh);
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(refresh);
    observer.observe(document.body);
    if (header) observer.observe(header);
    if (capsule) observer.observe(capsule);
    sections.forEach(section => observer.observe(section.element));
  }

  const menu = document.querySelector<HTMLDialogElement>('#mobile-menu');
  const opener = header?.querySelector<HTMLButtonElement>('.menu-btn');
  if (menu && opener && typeof menu.showModal === 'function') {
    let state: 'closed' | 'opening' | 'open' | 'closing' = 'closed';
    let animation: Animation | null = null;
    let restoreFocus = true;
    let linkAnimations: Animation[] = [];
    const menuLinks = [...menu.querySelectorAll<HTMLElement>('.sheet a')];

    function cancelLinks() {
      linkAnimations.forEach(running => running.cancel());
      linkAnimations = [];
    }
    // Links follow the sheet in reading order; the stagger outlives the sheet fade.
    function staggerLinks() {
      cancelLinks();
      if (reduced.matches) return;
      try {
        linkAnimations = menuLinks.map((link, index) => link.animate(
          [{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'none' }],
          { duration: 520, delay: 70 + index * 45, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' },
        ));
      } catch { linkAnimations = []; }
    }

    function announce(open: boolean) {
      opener!.setAttribute('aria-expanded', String(open));
      root.classList.toggle('menu-open', open);
      document.dispatchEvent(new CustomEvent('menu-state', { detail: { open } }));
    }
    function cancelAnimation() {
      animation?.cancel();
      animation = null;
    }
    function settleClosed() {
      cancelAnimation();
      cancelLinks();
      state = 'closed';
      if (menu!.open) menu!.close();
      announce(false);
      if (restoreFocus && mobile.matches) opener!.focus({ preventScroll: true });
      refresh();
    }
    function transition(open: boolean) {
      const current = getComputedStyle(menu!);
      const from = { opacity: current.opacity, transform: current.transform };
      cancelAnimation();
      if (reduced.matches || typeof menu!.animate !== 'function') {
        if (open) state = 'open';
        else settleClosed();
        return;
      }
      let running: Animation;
      try {
        running = menu!.animate([
          from,
          open ? { opacity: 1, transform: 'translateY(0)' } : { opacity: 0, transform: 'translateY(-8px)' },
        ], { duration: open ? 240 : 180, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'both' });
      } catch {
        if (open) state = 'open';
        else settleClosed();
        return;
      }
      animation = running;
      running.finished.then(() => {
        if (animation !== running) return;
        if (open) { state = 'open'; cancelAnimation(); }
        else settleClosed();
      }).catch(() => {});
    }
    function openMenu() {
      if (!mobile.matches || state === 'open' || state === 'opening') return;
      restoreFocus = true;
      if (!menu!.open) {
        menu!.showModal();
        if (!reduced.matches && typeof menu!.animate === 'function') {
          menu!.style.opacity = '0';
          menu!.style.transform = 'translateY(-8px)';
        }
      }
      state = 'opening';
      announce(true);
      transition(true);
      staggerLinks();
      menu!.style.removeProperty('opacity');
      menu!.style.removeProperty('transform');
    }
    function closeMenu(immediate = false, restore = true) {
      if (state === 'closed' && !menu!.open) return;
      restoreFocus = restore;
      if (immediate) { settleClosed(); return; }
      if (state === 'closing') return;
      state = 'closing';
      cancelLinks();
      transition(false);
    }
    opener.addEventListener('click', openMenu);
    menu.querySelector('.close')?.addEventListener('click', () => closeMenu());
    menu.addEventListener('cancel', event => { event.preventDefault(); closeMenu(); });
    menu.addEventListener('close', () => {
      // A native close event can be queued before a rapid reopen.
      if (menu.open) return;
      cancelAnimation();
      state = 'closed';
      announce(false);
      refresh();
    });
    menu.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach(link => {
      link.addEventListener('click', event => {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const target = document.getElementById(link.hash.slice(1));
        closeMenu(true, false);
        // Keep the browser's hash/history/scroll behavior; only move keyboard focus.
        if (target) {
          const hadTabindex = target.hasAttribute('tabindex');
          if (!hadTabindex) target.setAttribute('tabindex', '-1');
          target.focus({ preventScroll: true });
          if (!hadTabindex) target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
        }
      });
    });
    mobile.addEventListener('change', () => {
      hovered = null;
      focused = null;
      if (!mobile.matches) {
        const focusWasInMenu = menu.contains(document.activeElement);
        closeMenu(true, false);
        if (focusWasInMenu) (desktopLinks.find(link => link.hash === `#${active}`) ?? header?.querySelector<HTMLAnchorElement>('.wordmark'))?.focus({ preventScroll: true });
      }
      refresh();
    });
    reduced.addEventListener('change', () => {
      if (reduced.matches) {
        if (state === 'closing') settleClosed();
        else if (state === 'opening') { cancelAnimation(); state = 'open'; }
      }
      refresh();
    });
    root.classList.add('menu-ready');
  }
  root.classList.add('navigation-ready');
  update();
  return { refresh };
}
