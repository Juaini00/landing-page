// src/scripts/i18n.ts
// Reference TypeScript source for the i18n lang-swap logic.
// The runtime version is inlined in src/pages/index.astro via define:vars.

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
