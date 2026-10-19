(() => {
  'use strict';

  const root = document.documentElement;
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
  const topicButtons = Array.from(document.querySelectorAll('[data-archive-category]'));

  if (!form || !cardsContainer || !resultCount || !noResults) return;

  const cards = Array.from(cardsContainer.querySelectorAll('.archive-card'));
  const originalOrder = new Map(cards.map((card, index) => [card, index]));
  const totalLabel = document.getElementById('archive-total');
  if (totalLabel) totalLabel.textContent = String(cards.length);
  let language = document.documentElement.lang || 'en';

  function normalize(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase()
      .trim();
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
    const messages = {
      en: { invalid: 'Invalid date range — start date must be on or before end date.', none: 'No matching records', showing: (n, total) => 'Showing ' + n + ' of ' + total + ' records' },
      ar: { invalid: 'نطاق التاريخ غير صالح — يجب أن يكون تاريخ البداية في يوم النهاية أو قبله.', none: 'لا توجد سجلات مطابقة', showing: (n, total) => 'عرض ' + n + ' من أصل ' + total + ' سجلات' },
      fr: { invalid: 'Période invalide — la date de début doit précéder ou égaler la date de fin.', none: 'Aucun résultat correspondant', showing: (n, total) => n + ' enregistrements affichés sur ' + total },
      es: { invalid: 'Rango de fechas no válido: la fecha inicial debe ser anterior o igual a la final.', none: 'No hay registros coincidentes', showing: (n, total) => 'Mostrando ' + n + ' de ' + total + ' registros' },
      pt: { invalid: 'Intervalo de datas inválido: a data inicial deve ser anterior ou igual à data final.', none: 'Nenhum registo correspondente', showing: (n, total) => 'A mostrar ' + n + ' de ' + total + ' registos' },
      de: { invalid: 'Ungültiger Zeitraum: Das Startdatum muss vor oder am Enddatum liegen.', none: 'Keine passenden Einträge', showing: (n, total) => n + ' von ' + total + ' Einträgen angezeigt' }
    };
    const message = messages[language] || messages.en;
    if (invalidRange) resultCount.textContent = message.invalid;
    else if (visibleCount === 0) resultCount.textContent = message.none;
    else resultCount.textContent = message.showing(visibleCount, cards.length);
  }

  document.addEventListener('noor:languagechange', (event) => {
    language = event.detail && event.detail.language ? event.detail.language : (root.lang || 'en');
    applyFilters();
  });

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
    if (!input) return;
    input.addEventListener('change', () => {
      if (input === categoryInput) syncTopicButtons();
      applyFilters();
    });
  });

  topicButtons.forEach((button) => {
    button.addEventListener('click', () => {
      if (categoryInput) categoryInput.value = button.dataset.archiveCategory || '';
      syncTopicButtons();
      applyFilters();
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      cardsContainer.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    });
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
      syncTopicButtons();
      sortCards();
      applyFilters();
      if (queryInput) queryInput.focus();
    });
  }

  function syncTopicButtons() {
    const selectedCategory = categoryInput ? categoryInput.value : '';
    topicButtons.forEach((button) => {
      button.setAttribute('aria-pressed', String((button.dataset.archiveCategory || '') === selectedCategory));
    });
  }

  // Dates are ISO 8601 in data attributes, so string comparison is chronological.
  // Event windows overlap the requested range; date filtering never treats a
  // publication date as the incident date unless the record explicitly says so.
  syncTopicButtons();
  sortCards();
  applyFilters();

})();