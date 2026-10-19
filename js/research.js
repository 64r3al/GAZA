(() => {
  'use strict';
  // Language selection and direction are handled centrally by js/i18n.js.
  document.addEventListener('noor:languagechange', (event) => {
    const detail = event.detail || {};
    if (detail.language) document.documentElement.dataset.locale = detail.language;
  });
})();
