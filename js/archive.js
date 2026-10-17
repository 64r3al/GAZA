(() => {
  'use strict';

  const root = document.documentElement;
  const languageButton = document.getElementById('archive-language');
  const form = document.getElementById('archive-filter-form');
  const queryInput = document.getElementById('archive-query');
  const fromInput = document.getElementById('archive-date-from');
  const toInput = document.getElementById('archive-date-to');
  const categoryInput = document.getElementById('archive-category');
  const locationInput = document.getElementById('archive-location');
  const sourceTypeInput = document.getElementById('archive-source-type');
  const statusInput = document.getElementById('archive-status');
  const footageInput = document.getElementById('archive-footage');
  const sortInput = document.getElementById('archive-sort');
  const clearButton = document.getElementById('archive-clear');
  const cardsContainer = document.getElementById('archive-card-grid');
  const resultCount = document.getElementById('archive-result-count');
  const noResults = document.getElementById('archive-no-results');
  const dateError = document.getElementById('archive-date-error');

  if (!form || !cardsContainer || !resultCount || !noResults) return;

  const cards = Array.from(cardsContainer.querySelectorAll('.archive-card'));
  const originalOrder = new Map(cards.map((card, index) => [card, index]));
  const totalLabel = document.getElementById('archive-total');
  if (totalLabel) totalLabel.textContent = String(cards.length);
  let language = 'en';

  function normalize(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase()
      .trim();
  }

  function setLanguage(nextLanguage) {
    language = nextLanguage === 'ar' ? 'ar' : 'en';
    root.lang = language;
    root.dir = language === 'ar' ? 'rtl' : 'ltr';

    document.querySelectorAll('[data-en][data-ar]').forEach((element) => {
      element.textContent = element.getAttribute('data-' + language);
    });

    document.querySelectorAll('[data-en-placeholder][data-ar-placeholder]').forEach((element) => {
      element.setAttribute('placeholder', element.getAttribute('data-' + language + '-placeholder'));
    });

    if (languageButton) {
      languageButton.setAttribute(
        'aria-label',
        language === 'en' ? 'Switch language to Arabic' : 'حوّل اللغة إلى الإنجليزية'
      );
    }

    document.title = language === 'en'
      ? 'Gaza Evidence Archive | NOOR Field Notes'
      : 'أرشيف الأدلة في غزة | ملاحظات نور الميدانية';

    try {
      localStorage.setItem('noor-language', language);
    } catch (_) {
      /* The archive works without persistent preferences. */
    }

    applyFilters();
  }

  function sortCards() {
    const direction = sortInput && sortInput.value === 'oldest' ? 1 : -1;
    const sorted = cards.slice().sort((left, right) => {
      const leftDate = left.dataset.end || left.dataset.start || '';
      const rightDate = right.dataset.end || right.dataset.start || '';
      const dateCompare = leftDate.localeCompare(rightDate);
      return dateCompare === 0
        ? originalOrder.get(left) - originalOrder.get(right)
        : dateCompare * direction;
    });

    sorted.forEach((card) => cardsContainer.appendChild(card));
  }

  function matchesDateRange(card, fromDate, toDate) {
    const start = card.dataset.start || '';
    const end = card.dataset.end || start;
    if (fromDate && end && end < fromDate) return false;
    if (toDate && start && start > toDate) return false;
    return true;
  }

  function applyFilters() {
    const fromDate = fromInput ? fromInput.value : '';
    const toDate = toInput ? toInput.value : '';
    const invalidRange = Boolean(fromDate && toDate && fromDate > toDate);

    if (dateError) dateError.hidden = !invalidRange;

    const query = normalize(queryInput ? queryInput.value : '');
    const category = categoryInput ? categoryInput.value : '';
    const location = locationInput ? locationInput.value : '';
    const sourceType = sourceTypeInput ? sourceTypeInput.value : '';
    const status = statusInput ? statusInput.value : '';
    const footage = footageInput ? footageInput.value : '';
    let visibleCount = 0;

    cards.forEach((card) => {
      const searchableText = normalize(
        card.textContent + ' ' +
        (card.dataset.keywords || '') + ' ' +
        (card.dataset.recordId || '') + ' ' +
        (card.dataset.start || '') + ' ' +
        (card.dataset.end || '') + ' ' +
        (card.dataset.location || '') + ' ' +
        (card.dataset.category || '') + ' ' +
        (card.dataset.sourceType || '') + ' ' +
        (card.dataset.status || '') + ' ' +
        (card.dataset.footage || '')
      );

      const matches = !invalidRange &&
        (!query || searchableText.includes(query)) &&
        (!category || card.dataset.category === category) &&
        (!location || card.dataset.location === location) &&
        (!sourceType || card.dataset.sourceType === sourceType) &&
        (!status || card.dataset.status === status) &&
        (!footage || card.dataset.footage === footage) &&
        matchesDateRange(card, fromDate, toDate);

      card.hidden = !matches;
      if (matches) visibleCount += 1;
    });

    noResults.hidden = visibleCount > 0 || invalidRange;
    if (invalidRange) {
      resultCount.textContent = language === 'en'
        ? 'Invalid date range — start date must be on or before end date.'
        : 'نطاق التاريخ غير صالح — يجب أن يكون تاريخ البداية في يوم النهاية أو قبله.';
    } else if (visibleCount === 0) {
      resultCount.textContent = language === 'en'
        ? 'No matching records'
        : 'لا توجد سجلات مطابقة';
    } else {
      resultCount.textContent = language === 'en'
        ? 'Showing ' + visibleCount + ' of ' + cards.length + ' records'
        : 'عرض ' + visibleCount + ' من أصل ' + cards.length + ' سجلات';
    }
  }

  if (languageButton) {
    languageButton.addEventListener('click', () => setLanguage(language === 'en' ? 'ar' : 'en'));
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    sortCards();
    applyFilters();
  });

  [queryInput, fromInput, toInput].forEach((input) => {
    if (!input) return;
    input.addEventListener(input === queryInput ? 'input' : 'change', applyFilters);
  });

  [categoryInput, locationInput, sourceTypeInput, statusInput, footageInput].forEach((input) => {
    if (input) input.addEventListener('change', applyFilters);
  });

  if (sortInput) {
    sortInput.addEventListener('change', () => {
      sortCards();
      applyFilters();
    });
  }

  if (clearButton) {
    clearButton.addEventListener('click', () => {
      form.reset();
      if (queryInput) queryInput.value = '';
      if (sortInput) sortInput.value = 'newest';
      sortCards();
      applyFilters();
      if (queryInput) queryInput.focus();
    });
  }

  // Dates are ISO 8601 in data attributes, so string comparison is chronological.
  // Event windows overlap the requested range; date filtering never treats a
  // publication date as the incident date unless the record explicitly says so.
  sortCards();
  applyFilters();

  try {
    if (localStorage.getItem('noor-language') === 'ar') setLanguage('ar');
  } catch (_) {
    /* Default to English when storage is unavailable. */
  }
})();