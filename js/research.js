(() => {
  'use strict';
  const root = document.documentElement;
  const languageButton = document.getElementById('methodology-language');
  const titles = { en: 'Evidence methodology | NOOR', ar: 'منهجية الأدلة | نور' };

  function setLanguage(nextLanguage) {
    const language = nextLanguage === 'ar' ? 'ar' : 'en';
    root.lang = language;
    root.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-en][data-ar]').forEach((element) => {
      element.textContent = element.getAttribute('data-' + language);
    });
    document.querySelectorAll('[data-en-aria][data-ar-aria]').forEach((element) => {
      element.setAttribute('aria-label', element.getAttribute('data-' + language + '-aria'));
    });
    document.title = titles[language];
    if (languageButton) {
      languageButton.setAttribute('aria-label', language === 'en' ? 'Switch language to Arabic' : 'حوّل اللغة إلى الإنجليزية');
    }
    try { localStorage.setItem('noor-language', language); } catch (_) { /* Storage is optional. */ }
  }

  if (languageButton) {
    languageButton.addEventListener('click', () => setLanguage(root.lang === 'ar' ? 'en' : 'ar'));
  }
  try { setLanguage(localStorage.getItem('noor-language') === 'ar' ? 'ar' : 'en'); }
  catch (_) { setLanguage('en'); }
})();
