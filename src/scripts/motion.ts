type Counter = { element: HTMLElement; final: string; timer: number };

/* Children that stagger inside a revealed surface. Each group restarts its own index. */
const STAGGER_GROUPS = [
  '.chip',
  '.role li',
  '.marks > .bmark',
  '.bmarks > .bmark',
  '.channel',
  '.console-step, .console-arrow, .console-flow-row, .console-note',
];
const ROLL_DURATION = 1900;
const ROLL_COLUMN_GAP = 140;

export function initMotion(): { refresh(): void; cancelCounters(): void } {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;
  const desktopNotches = matchMedia('(min-width: 1280px)');

  // Structural reveal variants: windows open, notched docks grow out of the frame
  // edge, headings choreograph their children. Cards keep the default lift.
  document.querySelectorAll<HTMLElement>('.sec-head, .ai-head').forEach(element => element.setAttribute('data-reveal', 'head'));
  document.querySelectorAll<HTMLElement>('.win:not(.hero)').forEach(element => element.setAttribute('data-reveal', 'window'));
  document.querySelectorAll<HTMLElement>('.win:not(.hero) > .dock').forEach(element => element.setAttribute('data-reveal', 'dock'));
  document.querySelector<HTMLElement>('footer.site')?.setAttribute('data-reveal', '');

  const revealTargets = [...document.querySelectorAll<HTMLElement>('[data-reveal]')];
  for (const target of revealTargets) {
    const variant = target.dataset.reveal;
    if (variant === 'window') continue;
    if (variant === 'head' || variant === 'dock') {
      [...target.children]
        .filter(child => !child.classList.contains('fillet'))
        .forEach((child, index) => (child as HTMLElement).style.setProperty('--i', String(index)));
    }
    for (const group of STAGGER_GROUPS) {
      target.querySelectorAll<HTMLElement>(group).forEach((child, index) => child.style.setProperty('--i', String(Math.min(index, 14))));
    }
  }

  const pipeline = document.querySelector<HTMLElement>('[data-trace]');
  const pipelineSteps = pipeline ? [...pipeline.querySelectorAll<HTMLElement>('[data-pipeline-step]')] : [];
  let revealObserver: IntersectionObserver | undefined;
  let pipelineObserver: IntersectionObserver | undefined;
  let counterObserver: IntersectionObserver | undefined;
  let pipelineAnimations: Animation[] = [];
  let pipelineTimers: number[] = [];
  let pipelineStarted = false;
  let pipelineComplete = false;
  let counters: Counter[] = [];
  let refreshFrame = 0;
  let enterTimer = 0;
  let menuOpen = Boolean(document.querySelector<HTMLDialogElement>('#mobile-menu')?.open);
  const revealLine = () => innerHeight * 0.9;

  function settleWindow(element: HTMLElement, immediate: boolean) {
    if (immediate) {
      element.classList.add('is-settled');
      return;
    }
    const done = (event?: TransitionEvent) => {
      if (event && (event.target !== element || event.propertyName !== 'clip-path')) return;
      element.classList.add('is-settled');
      element.removeEventListener('transitionend', done);
    };
    element.addEventListener('transitionend', done);
    // Fallback for interrupted transitions so the clip never outlives the reveal.
    setTimeout(done, 2200 + (parseFloat(element.style.getPropertyValue('--reveal-delay')) || 0));
  }

  function reveal(element: HTMLElement, immediate = false) {
    const wasIn = element.classList.contains('is-in');
    if (wasIn && !immediate) return;
    if (immediate) {
      element.classList.add('reveal-immediate');
      element.removeAttribute('data-reveal-play');
    } else if (element.dataset.reveal !== 'window') element.setAttribute('data-reveal-play', '');
    element.removeAttribute('data-reveal-pending');
    element.classList.add('is-in');
    revealObserver?.unobserve(element);
    if (element.dataset.reveal === 'window') settleWindow(element, immediate);
  }

  /* Applied AI pipeline: the line travels node to node; each node lands with a
     pop, the policy gate sends one ripple. Runs once, then rests resolved. */
  function settlePipeline() {
    if (!pipeline) return;
    pipelineComplete = true;
    pipelineTimers.forEach(clearTimeout);
    pipelineTimers = [];
    pipelineSteps.forEach(step => step.classList.add('is-reached'));
    pipeline.classList.add('trace-complete');
    pipeline.classList.remove('trace-running');
    pipelineAnimations.forEach(animation => animation.cancel());
    pipelineAnimations = [];
    pipelineObserver?.disconnect();
  }

  function arrive(step: HTMLElement) {
    step.classList.add('is-reached');
    const icon = step.querySelector<HTMLElement>('.ic');
    const emphasis = step.querySelector<HTMLElement>('.pipeline-emphasis');
    try {
      if (icon) {
        pipelineAnimations.push(icon.animate(
          [{ scale: 0.82 }, { scale: 1.16, offset: 0.45 }, { scale: 1 }],
          { duration: 620, easing: 'cubic-bezier(.2,.8,.2,1)' },
        ));
      }
      if (emphasis && step.classList.contains('guard')) {
        pipelineAnimations.push(emphasis.animate(
          [{ opacity: 0.95, scale: 1 }, { opacity: 0, scale: 2.1 }],
          { duration: 1100, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'forwards' },
        ));
      } else if (emphasis) {
        pipelineAnimations.push(emphasis.animate(
          [{ opacity: 0, scale: 0.6 }, { opacity: 0.95, scale: 1.12, offset: 0.5 }, { opacity: 0.6, scale: 1 }],
          { duration: 620, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' },
        ));
      }
    } catch { /* Arrival still marks the step as reached. */ }
  }

  function startPipeline() {
    if (!pipeline || pipelineStarted || pipelineComplete) return;
    pipelineStarted = true;
    pipelineObserver?.disconnect();
    if (reduced.matches || document.hidden || menuOpen || typeof pipeline.animate !== 'function') {
      settlePipeline();
      return;
    }
    const vertical = matchMedia('(max-width: 599px)').matches;
    const segments = pipelineSteps.map(step => {
      const line = step.querySelector<HTMLElement>('[data-pipeline-line]');
      const box = line?.parentElement?.getBoundingClientRect();
      return { line, length: box && line?.parentElement?.getClientRects().length ? (vertical ? box.height : box.width) : 0 };
    });
    const totalLength = segments.reduce((total, segment) => total + segment.length, 0);
    const hold = 170;
    const travel = 1900;
    let delay = 150;
    pipeline.classList.add('trace-running');
    try {
      pipelineSteps.forEach((step, index) => {
        const at = delay;
        pipelineTimers.push(window.setTimeout(() => arrive(step), at));
        delay += hold;
        const { line, length } = segments[index];
        if (line && length > 0 && totalLength > 0) {
          const duration = travel * length / totalLength;
          pipelineAnimations.push(line.animate([
            { transform: vertical ? 'scaleY(0)' : 'scaleX(0)' },
            { transform: vertical ? 'scaleY(1)' : 'scaleX(1)' },
          ], { duration, delay, fill: 'both', easing: 'cubic-bezier(.65,0,.35,1)' }));
          delay += duration;
        } else delay += 220;
      });
      pipelineTimers.push(window.setTimeout(settlePipeline, delay + 1000));
    } catch {
      settlePipeline();
    }
  }

  /* Initial reveal state. A fresh load at the top animates what is already in
     view after the hero starts; restored scroll positions stay readable. */
  try {
    if (!reduced.matches && 'IntersectionObserver' in window) {
      revealObserver = new IntersectionObserver(entries => {
        const entering = entries
          .filter(entry => entry.isIntersecting && (entry.target as HTMLElement).hasAttribute('data-reveal-pending'))
          .sort((a, b) => (a.boundingClientRect.top - b.boundingClientRect.top) || (a.boundingClientRect.left - b.boundingClientRect.left));
        entering.forEach((entry, index) => {
          const element = entry.target as HTMLElement;
          element.style.setProperty('--reveal-delay', `${Math.min(index * 90, 450)}ms`);
          reveal(element);
        });
      }, { threshold: 0, rootMargin: '0px 0px -10% 0px' });
      const fresh = scrollY < 4 && !location.hash;
      const inView: HTMLElement[] = [];
      for (const element of revealTargets) {
        const top = element.getBoundingClientRect().top;
        if (element.contains(document.activeElement)) reveal(element, true);
        else if (top >= revealLine()) {
          element.setAttribute('data-reveal-pending', '');
          revealObserver.observe(element);
        } else if (fresh) {
          element.setAttribute('data-reveal-pending', '');
          inView.push(element);
        } else reveal(element, true);
      }
      if (inView.length) {
        requestAnimationFrame(() => requestAnimationFrame(() => {
          inView.forEach((element, index) => {
            element.style.setProperty('--reveal-delay', `${600 + Math.min(index * 90, 450)}ms`);
            reveal(element);
          });
        }));
      }
    }
  } catch {
    revealObserver?.disconnect();
    revealTargets.forEach(element => reveal(element, true));
  }
  // Pending states now own the pose the inline boot script set before paint.
  root.classList.remove('motion-boot');

  document.addEventListener('focusin', event => {
    if (!(event.target instanceof Element)) return;
    let target: Element | null = event.target;
    while (target) {
      if (target instanceof HTMLElement && target.hasAttribute('data-reveal-pending')) reveal(target, true);
      target = target.parentElement;
    }
  });

  if (pipeline) {
    try {
      if (reduced.matches || !('IntersectionObserver' in window)) settlePipeline();
      else {
        pipeline.classList.add('trace-armed');
        pipelineObserver = new IntersectionObserver(entries => {
          if (entries.some(entry => entry.isIntersecting)) startPipeline();
        }, { threshold: 0.35 });
        pipelineObserver.observe(pipeline);
      }
    } catch {
      settlePipeline();
    }
  }

  /* Odometer counters: each digit is a reel that spins past a full cycle and
     settles on its value. Screen readers get the real number throughout. */
  let dictionaries: Record<string, Record<string, string>> = {};
  try {
    dictionaries = JSON.parse(document.getElementById('i18n-dicts')?.textContent ?? '{}');
  } catch { /* Counters still retain the rendered value without a dictionary. */ }

  function finishCounter(counter: Counter) {
    clearTimeout(counter.timer);
    const { element, final } = counter;
    const latest = dictionaries[root.lang]?.[element.dataset.i18n ?? ''];
    if (latest !== undefined) element.innerHTML = latest;
    else element.textContent = final;
    counters = counters.filter(entry => entry !== counter);
  }

  function cancelCounters() {
    [...counters].forEach(finishCounter);
  }

  function roll(element: HTMLElement, delay: number) {
    const text = element.firstChild;
    if (!(text instanceof Text) || element.childNodes.length !== 1) return;
    const final = text.data.trim();
    if (!/^\d{1,4}$/.test(final)) return;
    const offset = text.data.indexOf(final);
    const range = document.createRange();
    const widths = [...final].map((_, index) => {
      range.setStart(text, offset + index);
      range.setEnd(text, offset + index + 1);
      return range.getBoundingClientRect().width;
    });
    if (widths.some(width => !width)) return;
    const odo = document.createElement('span');
    odo.className = 'odo';
    odo.setAttribute('aria-hidden', 'true');
    [...final].forEach((digit, index) => {
      const target = 10 + Number(digit);
      const column = document.createElement('span');
      column.className = 'odo-col';
      column.style.width = `${widths[index]}px`;
      const reel = document.createElement('span');
      reel.className = 'odo-reel';
      reel.style.setProperty('--to', String(target));
      reel.style.setProperty('--roll-delay', `${delay + index * ROLL_COLUMN_GAP}ms`);
      for (let cell = 0; cell <= target; cell++) {
        const glyph = document.createElement('span');
        glyph.textContent = String(cell % 10);
        reel.append(glyph);
      }
      column.append(reel);
      odo.append(column);
    });
    const spoken = document.createElement('span');
    spoken.className = 'sr-only';
    spoken.textContent = final;
    element.replaceChildren(odo, spoken);
    const counter: Counter = { element, final, timer: 0 };
    counters.push(counter);
    void odo.offsetWidth;
    odo.classList.add('is-rolling');
    const lastReel = odo.lastElementChild?.firstElementChild;
    lastReel?.addEventListener('transitionend', () => finishCounter(counter), { once: true });
    counter.timer = window.setTimeout(() => finishCounter(counter), delay + ROLL_DURATION + final.length * ROLL_COLUMN_GAP + 400);
  }

  const heroCounters = new Map([...document.querySelectorAll<HTMLElement>('.hero .stat b > [data-i18n]:first-child')]
    .map((element, index) => [element, index] as const));
  const counterTargets = [
    ...heroCounters.keys(),
    ...document.querySelectorAll<HTMLElement>('.notch-count b[data-i18n], .dom b[data-i18n], .dock-counts .f > b'),
  ];

  const entrance = !reduced.matches && !document.hidden && !menuOpen;
  if (entrance && counterTargets.length && 'IntersectionObserver' in window) {
    counterObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const element = entry.target as HTMLElement;
        counterObserver?.unobserve(element);
        if (reduced.matches || document.hidden || menuOpen) continue;
        const heroIndex = heroCounters.get(element);
        const entering = heroIndex !== undefined && root.classList.contains('motion-enter');
        roll(element, heroIndex === undefined ? 0 : (entering ? 700 : 0) + heroIndex * 120);
      }
    }, { threshold: 0.6 });
    counterTargets.forEach(element => counterObserver!.observe(element));
  }

  /* Hero entrance: terminal lines type, everything else is CSS keyed to
     html.motion-enter. Durations scale with the copy length. */
  function prepareTyping() {
    let end = 0;
    let delay = 1050;
    document.querySelectorAll<HTMLElement>('.hero .termcard .tline').forEach(line => {
      const chars = Math.max(1, (line.textContent ?? '').trim().length);
      const duration = Math.min(Math.max(chars * 26, 360), 900);
      line.style.setProperty('--chars', String(chars));
      line.style.setProperty('--type-dur', `${duration}ms`);
      line.style.setProperty('--type-delay', `${delay}ms`);
      delay += duration + 90;
      end = delay;
    });
    const termcard = document.querySelector<HTMLElement>('.hero .termcard');
    termcard?.style.setProperty('--caret-delay', `${end}ms`);
    const status = document.querySelector<HTMLElement>('.hero .term');
    if (status) {
      const chars = Math.max(1, (status.textContent ?? '').trim().length);
      const duration = Math.min(Math.max(chars * 28, 400), 1000);
      status.style.setProperty('--chars', String(chars));
      status.style.setProperty('--type-dur', `${duration}ms`);
      status.style.setProperty('--type-delay', '1150ms');
      status.style.setProperty('--caret-delay', `${1150 + duration}ms`);
      end = Math.max(end, 1150 + duration);
    }
    return end;
  }

  if (entrance) {
    const typingEnd = prepareTyping();
    root.classList.add('motion-enter');
    enterTimer = window.setTimeout(() => root.classList.remove('motion-enter'), Math.max(3200, typingEnd + 2000));
  } else root.classList.remove('motion-enter');

  /* Toolbox technology marquee. A resting pointer decelerates the strip to a
     stop instead of freezing it; every other pause reason is immediate. */
  const strip = document.querySelector<HTMLElement>('[data-marquee]');
  const viewport = strip?.querySelector<HTMLElement>('[data-marquee-viewport]');
  const track = strip?.querySelector<HTMLElement>('[data-marquee-track]');
  const original = strip?.querySelector<HTMLElement>('[data-marquee-original]');
  const toggle = strip?.querySelector<HTMLButtonElement>('[data-marquee-toggle]');
  const pauseLabel = toggle?.querySelector<HTMLElement>('[data-marquee-pause]');
  const resumeLabel = toggle?.querySelector<HTMLElement>('[data-marquee-resume]');
  let marqueeAnimation: Animation | undefined;
  let marqueeDistance = 0;
  let marqueeDuration = 0;
  let marqueeVisible = false;
  let userPaused = false;
  let pointerInside = false;
  let focusInside = false;
  let marqueeObserver: IntersectionObserver | undefined;
  let rateFrame = 0;

  function stopRamp() {
    cancelAnimationFrame(rateFrame);
    rateFrame = 0;
  }

  function rampTo(target: number, then?: () => void) {
    stopRamp();
    const animation = marqueeAnimation;
    if (!animation) return;
    const from = animation.playbackRate;
    if (Math.abs(from - target) < 0.01) {
      animation.playbackRate = target;
      then?.();
      return;
    }
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / 600);
      animation.playbackRate = from + (target - from) * (1 - (1 - progress) ** 3);
      if (progress < 1) rateFrame = requestAnimationFrame(step);
      else {
        rateFrame = 0;
        then?.();
      }
    };
    rateFrame = requestAnimationFrame(step);
  }

  function syncMarqueePause() {
    if (pauseLabel) pauseLabel.hidden = userPaused;
    if (resumeLabel) resumeLabel.hidden = !userPaused;
    const animation = marqueeAnimation;
    if (!animation) return;
    const covered = menuOpen || Boolean(document.querySelector<HTMLDialogElement>('#mobile-menu')?.open);
    const hardPause = userPaused || focusInside || reduced.matches || !marqueeVisible || document.hidden || covered;
    if (hardPause) {
      stopRamp();
      animation.pause();
      animation.playbackRate = pointerInside ? 0 : 1;
      return;
    }
    if (pointerInside) {
      if (animation.playState === 'running') rampTo(0, () => animation.pause());
      return;
    }
    if (animation.playState !== 'running') animation.play();
    rampTo(1);
  }

  function staticMarquee() {
    stopRamp();
    marqueeAnimation?.cancel();
    marqueeAnimation = undefined;
    marqueeDistance = 0;
    marqueeDuration = 0;
    strip?.classList.remove('marquee-running', 'marquee-measuring');
    if (toggle) toggle.hidden = true;
  }

  function measureMarquee() {
    if (!strip || !viewport || !track || !original || !toggle) return;
    if (reduced.matches || !marqueeObserver || typeof track.animate !== 'function') {
      staticMarquee();
      return;
    }
    strip.classList.add('marquee-measuring');
    const distance = original.getBoundingClientRect().width;
    const seam = parseFloat(getComputedStyle(original).paddingRight) || 0;
    const overflow = distance - seam > viewport.clientWidth + 1;
    strip.classList.remove('marquee-measuring');
    if (!overflow || distance <= 0) {
      staticMarquee();
      return;
    }
    strip.classList.add('marquee-running');
    toggle.hidden = false;
    if (Math.abs(distance - marqueeDistance) > 0.5 || !marqueeAnimation) {
      const oldTime = Number(marqueeAnimation?.currentTime ?? 0);
      const travelled = marqueeDuration ? (oldTime / marqueeDuration * marqueeDistance) % distance : 0;
      stopRamp();
      marqueeAnimation?.cancel();
      marqueeDistance = distance;
      marqueeDuration = distance / 28 * 1000;
      try {
        marqueeAnimation = track.animate([
          { transform: 'translateX(0)' }, { transform: `translateX(-${distance}px)` },
        ], { duration: marqueeDuration, iterations: Infinity, easing: 'linear' });
        marqueeAnimation.currentTime = travelled / 28 * 1000;
      } catch {
        staticMarquee();
        return;
      }
    }
    syncMarqueePause();
  }

  if (strip && 'IntersectionObserver' in window) {
    try {
      marqueeObserver = new IntersectionObserver(entries => {
        marqueeVisible = entries.some(entry => entry.isIntersecting);
        syncMarqueePause();
      }, { threshold: 0 });
      marqueeObserver.observe(strip);
      strip.addEventListener('pointerenter', event => {
        if (event.pointerType === 'touch') return;
        pointerInside = true;
        syncMarqueePause();
      });
      strip.addEventListener('pointerleave', () => {
        pointerInside = false;
        syncMarqueePause();
      });
      strip.addEventListener('focusin', () => {
        focusInside = true;
        syncMarqueePause();
      });
      strip.addEventListener('focusout', event => {
        focusInside = event.relatedTarget instanceof Node && strip.contains(event.relatedTarget);
        syncMarqueePause();
      });
      toggle?.addEventListener('click', () => {
        userPaused = !userPaused;
        syncMarqueePause();
      });
    } catch {
      marqueeObserver?.disconnect();
      marqueeObserver = undefined;
      staticMarquee();
    }
  }

  document.querySelectorAll<HTMLElement>('[data-media]').forEach(frame => {
    const media = frame.querySelector<HTMLImageElement | HTMLVideoElement>('img, video');
    const error = frame.querySelector<HTMLElement>('[data-media-error]');
    if (!media) return;
    const ready = () => {
      frame.dataset.mediaState = 'ready';
      if (error) error.hidden = true;
    };
    const failed = () => {
      frame.dataset.mediaState = 'error';
      if (error) error.hidden = false;
    };
    media.addEventListener('error', failed);
    if (media instanceof HTMLImageElement) {
      media.addEventListener('load', ready);
      if (media.complete) {
        if (media.naturalWidth) ready();
        else failed();
      } else frame.dataset.mediaState = 'loading';
    } else {
      media.addEventListener('loadeddata', ready);
      media.addEventListener('playing', () => {
        const surface = frame.closest<HTMLElement>('[data-reveal-pending]');
        if (surface) reveal(surface, true);
        ready();
      });
      if (media.error) failed();
      else if (media.readyState >= 2) ready();
    }
  });

  function refresh() {
    if (pipelineStarted && !pipelineComplete) settlePipeline();
    if (refreshFrame) return;
    refreshFrame = requestAnimationFrame(() => {
      refreshFrame = 0;
      measureMarquee();
      for (const element of revealTargets) {
        if (element.hasAttribute('data-reveal-pending') && revealObserver && element.getBoundingClientRect().top < revealLine()) reveal(element);
      }
    });
  }

  reduced.addEventListener('change', () => {
    if (reduced.matches) {
      clearTimeout(enterTimer);
      root.classList.remove('motion-enter');
      cancelCounters();
      counterObserver?.disconnect();
      revealTargets.forEach(element => reveal(element, true));
      revealObserver?.disconnect();
      settlePipeline();
      staticMarquee();
    } else refresh();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelCounters();
      if (pipelineStarted) settlePipeline();
    }
    syncMarqueePause();
  });
  document.addEventListener('menu-state', event => {
    menuOpen = (event as CustomEvent<{ open: boolean }>).detail.open;
    if (menuOpen) {
      cancelCounters();
      if (pipelineStarted) settlePipeline();
    }
    syncMarqueePause();
  });
  desktopNotches.addEventListener('change', refresh);
  window.addEventListener('resize', refresh, { passive: true });
  if ('ResizeObserver' in window && viewport) {
    const resizeObserver = new ResizeObserver(refresh);
    resizeObserver.observe(viewport);
  }
  document.fonts?.ready.then(refresh);
  refresh();
  return { refresh, cancelCounters };
}
