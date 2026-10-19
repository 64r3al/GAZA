(() => {
  'use strict';
  const query = document.getElementById('visual-query');
  const kind = document.getElementById('visual-kind');
  const topic = document.getElementById('visual-topic');
  const clear = document.getElementById('visual-clear');
  const cards = [...document.querySelectorAll('[data-kind][data-topic][data-search]')];
  const count = document.getElementById('visual-count');
  const empty = document.getElementById('visual-empty');
  if (!query || !kind || !topic || !clear || !count || !empty) return;

  let language = document.documentElement.lang || 'en';
  const messages = {
    en: { one: 'source entry', many: 'source entries', empty: 'No entries match those filters. Clear a filter to broaden the results.' },
    ar: { one: 'سجل مصدر', many: 'سجلات مصادر', empty: 'لا توجد عناصر تطابق عوامل التصفية. امسح أحد المرشحات لتوسيع النتائج.' },
    fr: { one: 'notice source', many: 'notices sources', empty: 'Aucun élément ne correspond aux filtres. Effacez un filtre pour élargir les résultats.' },
    es: { one: 'registro fuente', many: 'registros fuente', empty: 'Ningún elemento coincide con los filtros. Borra un filtro para ampliar los resultados.' },
    pt: { one: 'registo de fonte', many: 'registos de fonte', empty: 'Nenhum item corresponde aos filtros. Limpe um filtro para ampliar os resultados.' },
    de: { one: 'Quellenbeleg', many: 'Quellenbelege', empty: 'Keine Einträge passen zu diesen Filtern. Entfernen Sie einen Filter, um mehr Ergebnisse zu sehen.' }
  };

  function filter() {
    language = document.documentElement.lang || language || 'en';
    const copy = messages[language] || messages.en;
    const q = (query.value || '').trim().toLocaleLowerCase(language);
    let visible = 0;
    cards.forEach((card) => {
      const haystack = (card.dataset.search + ' ' + card.textContent).toLocaleLowerCase(language);
      const matches = (!q || haystack.includes(q))
        && (!kind.value || card.dataset.kind === kind.value)
        && (!topic.value || card.dataset.topic.split(/\s+/).includes(topic.value));
      card.hidden = !matches;
      if (matches) visible++;
    });
    count.textContent = visible + ' ' + (visible === 1 ? copy.one : copy.many);
    empty.textContent = copy.empty;
    empty.hidden = visible !== 0;
  }

  [query, kind, topic].forEach((control) => control.addEventListener('input', filter));
  [kind, topic].forEach((control) => control.addEventListener('change', filter));
  clear.addEventListener('click', () => {
    query.value = '';
    kind.value = '';
    topic.value = '';
    filter();
    query.focus();
  });
  document.addEventListener('noor:languagechange', (event) => {
    language = event.detail && event.detail.language ? event.detail.language : (document.documentElement.lang || 'en');
    query.placeholder = query.getAttribute('data-' + language + '-placeholder') || query.getAttribute('data-en-placeholder') || query.placeholder;
    filter();
  });
  filter();
})();