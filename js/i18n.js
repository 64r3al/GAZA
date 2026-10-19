(() => {
  'use strict';

  const LANGUAGES = ['en', 'ar', 'fr', 'es', 'pt', 'de'];
  const RTL_LANGUAGES = new Set(['ar']);
  const LANGUAGE_NAMES = {
    en: 'English', ar: 'العربية', fr: 'Français',
    es: 'Español', pt: 'Português', de: 'Deutsch'
  };
  const dictionaries = Object.fromEntries(LANGUAGES.map((locale) => [locale, new Map()]));
  const normalize = (value) => String(value == null ? '' : value)
    .replace(/[\u200e\u200f\u202a-\u202e\u2066-\u2069]/g, '')
    .replace(/\s+/g, ' ').trim();

  function addTranslations(rows) {
    if (!Array.isArray(rows)) return;
    rows.forEach((row) => {
      if (!Array.isArray(row) || row.length < 6) return;
      const [english, arabic, french, spanish, portuguese, german] = row;
      const source = normalize(english);
      if (!source) return;
      const values = { en: english, ar: arabic, fr: french, es: spanish, pt: portuguese, de: german };
      LANGUAGES.forEach((locale) => {
        if (typeof values[locale] === 'string' && values[locale].trim()) {
          dictionaries[locale].set(source, values[locale]);
        }
      });
    });
  }

  // Capture each original once so repeated language changes never translate a
  // translation or gradually mutate the user's page copy.
  function snapshotOriginals() {
    document.querySelectorAll('[data-en]').forEach((element) => {
      if (!element.hasAttribute('data-i18n-original-en')) {
        element.setAttribute('data-i18n-original-en', element.getAttribute('data-en') || element.textContent || '');
      }
    });
    document.querySelectorAll('[placeholder],[alt],[title],[aria-label],[content]').forEach((element) => {
      ['placeholder', 'alt', 'title', 'aria-label', 'content'].forEach((attribute) => {
        if (element.hasAttribute(attribute) && !element.hasAttribute('data-i18n-original-' + attribute)) {
          element.setAttribute('data-i18n-original-' + attribute, element.getAttribute(attribute) || '');
        }
      });
    });
    const leafSelector = 'h1,h2,h3,h4,h5,p,a,button,label,span,strong,em,li,dt,dd,figcaption,option,th,td,small,summary,legend';
    document.querySelectorAll(leafSelector).forEach((element) => {
      if (!element.hasAttribute('data-en') && !element.hasAttribute('data-i18n-skip') &&
          element.children.length === 0 && !element.hasAttribute('data-i18n-original')) {
        element.setAttribute('data-i18n-original', element.textContent || '');
      }
    });
  }

  function translate(source, locale) {
    const lang = LANGUAGES.includes(locale) ? locale : 'en';
    if (lang === 'en') return String(source == null ? '' : source);
    return dictionaries[lang].get(normalize(source)) || String(source == null ? '' : source);
  }

  function translatedValue(element, english, locale, attribute) {
    const explicit = element.getAttribute(attribute === 'text' ? 'data-' + locale : 'data-' + locale + '-' + attribute);
    if (explicit) return explicit;
    if (locale === 'en') return english;
    // A legacy Arabic-only value should never be used as French, Spanish,
    // Portuguese or German; each locale gets its own entry or dictionary lookup.
    return translate(english, locale);
  }

  const TITLES = {
    en: ['NOOR — A light for every child','A hard pill to swallow | NOOR Field Notes','Gaza Evidence Archive | NOOR Field Notes','Evidence methodology | NOOR','Visual evidence index | NOOR','Legal record | NOOR','NOOR Case File'],
    ar: ['نور — ضوء لكل طفل','حقيقة يصعب تقبّلها | ملاحظات نور الميدانية','أرشيف الأدلة في غزة | ملاحظات نور الميدانية','منهجية الأدلة | نور','فهرس الأدلة المرئية | نور','السجل القانوني | نور','ملف قضية | نور'],
    fr: ['NOOR — Une lumière pour chaque enfant','Une vérité difficile à accepter | Notes de terrain NOOR','Archives documentaires de Gaza | NOOR','Méthodologie des preuves | NOOR','Index des éléments visuels | NOOR','Dossier juridique | NOOR','Dossier de cas | NOOR'],
    es: ['NOOR — Una luz para cada niño','Una verdad difícil de aceptar | Notas de campo NOOR','Archivo documental de Gaza | NOOR','Metodología de las pruebas | NOOR','Índice de pruebas visuales | NOOR','Registro jurídico | NOOR','Expediente del caso | NOOR'],
    pt: ['NOOR — Uma luz para cada criança','Uma verdade difícil de aceitar | Notas de campo NOOR','Arquivo de evidências de Gaza | NOOR','Metodologia das evidências | NOOR','Índice de evidências visuais | NOOR','Registo jurídico | NOOR','Dossier do caso | NOOR'],
    de: ['NOOR — Ein Licht für jedes Kind','Eine schwer zu akzeptierende Wahrheit | NOOR-Feldnotizen','Belegarchiv Gaza | NOOR-Feldnotizen','Methodik der Belege | NOOR','Index visueller Belege | NOOR','Rechtsdokumentation | NOOR','Falldossier | NOOR']
  };

  function pageTitleIndex() {
    const pathname = (window.location && window.location.pathname || '').toLowerCase();
    if (pathname.endsWith('a-hard-pill-to-swallow.html')) return 1;
    if (pathname.endsWith('evidence-archive.html')) return 2;
    if (pathname.endsWith('methodology.html')) return 3;
    if (pathname.endsWith('visual-evidence.html')) return 4;
    if (pathname.endsWith('legal-record.html')) return 5;
    if (/case-[\w-]+\.html$/.test(pathname)) return 6;
    return 0;
  }

  function applyLanguage(locale, options = {}) {
    const language = LANGUAGES.includes(locale) ? locale : 'en';
    const html = document.documentElement;
    snapshotOriginals();
    const rtl = RTL_LANGUAGES.has(language);
    html.lang = language;
    html.dir = rtl ? 'rtl' : 'ltr';
    html.dataset.locale = language;
    html.classList.toggle('locale-rtl', rtl);
    html.classList.toggle('locale-ltr', !rtl);

    document.querySelectorAll('[data-en]').forEach((element) => {
      const english = element.getAttribute('data-i18n-original-en') || element.getAttribute('data-en') || '';
      if (element.children.length === 0) {
        element.textContent = translatedValue(element, english, language, 'text');
      }
      // Inline icons/markup survive because only leaf text is replaced.
    });

    ['placeholder', 'alt', 'title', 'aria-label', 'content'].forEach((attribute) => {
      document.querySelectorAll('[data-en-' + attribute + ']').forEach((element) => {
        const english = element.getAttribute('data-en-' + attribute) || '';
        const value = element.getAttribute('data-' + language + '-' + attribute) ||
          (language === 'en' ? english : translate(english, language));
        element.setAttribute(attribute, value);
      });
    });

    // Existing pages use data-en-aria/data-ar-aria for accessible labels.
    document.querySelectorAll('[data-en-aria]').forEach((element) => {
      const english = element.getAttribute('data-en-aria') || '';
      const value = element.getAttribute('data-' + language + '-aria') ||
        (language === 'en' ? english : translate(english, language));
      element.setAttribute('aria-label', value);
    });

    // Localize accessible names, alt text and tooltips from their immutable
    // original values when a dictionary entry exists for the chosen language.
    ['placeholder', 'alt', 'title', 'aria-label'].forEach((attribute) => {
      document.querySelectorAll('[data-i18n-original-' + attribute + ']').forEach((element) => {
        if (element.hasAttribute('data-en-' + attribute) || element.hasAttribute('data-en-aria') && attribute === 'aria-label') return;
        const original = element.getAttribute('data-i18n-original-' + attribute) || '';
        element.setAttribute(attribute, language === 'en' ? original : translate(original, language));
      });
    });

    // Translate exact dictionary matches for unannotated leaf copy; keep unknown
    // text in its source language instead of generating hybrid or broken text.
    const leafSelector = 'h1,h2,h3,h4,h5,p,a,button,label,span,strong,em,li,dt,dd,figcaption,option,th,td,small,summary,legend';
    document.querySelectorAll(leafSelector).forEach((element) => {
      if (element.hasAttribute('data-en') || element.hasAttribute('data-i18n-skip') ||
          element.children.length !== 0) return;
      const original = element.getAttribute('data-i18n-original') || '';
      element.textContent = language === 'en' ? original : translate(original, language);
    });

    // Translate common HTML metadata only when the page provides an English value.
    document.querySelectorAll('[data-en-content]').forEach((element) => {
      const english = element.getAttribute('data-en-content') || '';
      element.setAttribute('content', language === 'en' ? english :
        (element.getAttribute('data-' + language + '-content') || translate(english, language)));
    });

    const title = (TITLES[language] || TITLES.en)[pageTitleIndex()];
    if (title) document.title = title;

    document.querySelectorAll('[data-noor-language-select]').forEach((control) => {
      if (control.value !== language) control.value = language;
      control.setAttribute('aria-label', language === 'ar' ? 'اختر لغة الموقع' : translate('Choose language', language));
    });

    if (!options.skipStore) {
      try { window.localStorage.setItem('noor-language', language); } catch (_) { /* Private browsing/storage disabled. */ }
    }
    document.dispatchEvent(new window.CustomEvent('noor:languagechange', {
      detail: { language, dir: html.dir, rtl, names: LANGUAGE_NAMES }
    }));
  }

  const initialRows = window.NOORTranslationRows;
  if (Array.isArray(initialRows)) addTranslations(initialRows);

  const localization = {
    languages: LANGUAGES.slice(),
    names: { ...LANGUAGE_NAMES },
    addTranslations,
    setLanguage: applyLanguage,
    getLanguage: () => LANGUAGES.includes(document.documentElement.lang) ? document.documentElement.lang : 'en',
    direction: (locale = document.documentElement.lang) => RTL_LANGUAGES.has(locale) ? 'rtl' : 'ltr',
    translate: (source, locale = document.documentElement.lang || 'en') => translate(source, locale)
  };
  window.NOORLocalization = localization;

  document.addEventListener('change', (event) => {
    if (event.target && event.target.matches('[data-noor-language-select]')) {
      applyLanguage(event.target.value);
    }
  });

  const saved = (() => {
    try {
      const value = window.localStorage.getItem('noor-language');
      return LANGUAGES.includes(value) ? value : 'en';
    } catch (_) {
      return 'en';
    }
  })();

  // Wait until parsing is complete so all page controls and text nodes are present.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => applyLanguage(saved, { skipStore: true }), { once: true });
  } else {
    applyLanguage(saved, { skipStore: true });
  }
})();