import { initNavigation } from './navigation';
import { initMotion } from './motion';
import { initHover } from './hover';

type Lang = 'en' | 'id';
type Dict = Record<string, string>;
const dicts = JSON.parse(document.getElementById('i18n-dicts')!.textContent!) as Record<Lang, Dict>;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let language: Lang = 'en';
try { language = localStorage.getItem('lang') === 'id' ? 'id' : 'en'; } catch { /* Storage can be disabled independently of JavaScript. */ }
let transitions: Animation[] = [];

function cancelTransitions() {
  transitions.forEach(animation => animation.cancel());
  transitions = [];
}

function applyLang(lang: Lang, animate = false) {
  cancelTransitions();
  document.documentElement.lang = lang;
  const changed: HTMLElement[] = [];
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n!;
    let value = dicts[lang][key];
    if (value === undefined) return;
    if (key.startsWith('project.link.')) value = value.replace(/\s*[↗→]\s*$/, '');
    if (el.dataset.fmt) {
      const fmt = JSON.parse(el.dataset.fmt) as Record<string, string>;
      for (const [name, replacement] of Object.entries(fmt)) value = value.replaceAll(`{${name}}`, replacement);
    }
    el.innerHTML = value;
    changed.push(el);
  });
  // Controls and chrome retain their position; visible reading text resolves
  // from a soft blur in reading order. Measured after all writes: one layout.
  if (animate && !reduced.matches) {
    const visible = changed.filter(el => {
      if (el.closest('a, button, nav, dialog')) return false;
      const bounds = el.getBoundingClientRect();
      return bounds.bottom > 0 && bounds.top < innerHeight && bounds.width > 0;
    });
    visible.forEach((el, index) => {
      transitions.push(el.animate(
        [{ opacity: 0, filter: 'blur(6px)', translate: '0 6px' }, { opacity: 1, filter: 'blur(0)', translate: '0 0' }],
        { duration: 520, delay: Math.min(index * 18, 260), easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' },
      ));
    });
  }
  document.querySelectorAll<HTMLElement>('[data-i18n-aria-label]').forEach(el => {
    const label = dicts[lang][el.dataset.i18nAriaLabel!];
    if (label !== undefined) el.setAttribute('aria-label', label);
  });
  document.querySelectorAll<HTMLElement>('.lang').forEach(btn => {
    btn.innerHTML = lang === 'en' ? '<b>EN</b> / ID' : 'EN / <b>ID</b>';
    btn.setAttribute('aria-label', lang === 'en' ? 'Switch to Indonesian' : 'Switch to English');
  });
}

applyLang(language);
const navigation = initNavigation();
document.documentElement.classList.add('language-ready');
const motion = initMotion();
initHover();

document.querySelectorAll('.lang').forEach(btn => {
  btn.addEventListener('click', () => {
    motion.cancelCounters();
    language = language === 'en' ? 'id' : 'en';
    try { localStorage.setItem('lang', language); } catch { /* Keep the current visit usable without storage. */ }
    applyLang(language, true);
    navigation.refresh();
    motion.refresh();
  });
});
reduced.addEventListener('change', cancelTransitions);
