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
  function filter() {
    const q = (query.value || '').trim().toLocaleLowerCase();
    let visible = 0;
    cards.forEach((card) => {
      const haystack = (card.dataset.search + ' ' + card.textContent).toLocaleLowerCase();
      const matches = (!q || haystack.includes(q))
        && (!kind.value || card.dataset.kind === kind.value)
        && (!topic.value || card.dataset.topic.split(/\s+/).includes(topic.value));
      card.hidden = !matches;
      if (matches) visible++;
    });
    const locale = document.documentElement.lang || 'en';
    const countTemplates = {
      en: (n) => n + (n === 1 ? ' source entry' : ' source entries'),
      ar: (n) => n + (n === 1 ? ' عنصر مصدر' : ' عناصر مصدر'),
      fr: (n) => n + (n === 1 ? ' élément source' : ' éléments sources'),
      es: (n) => n + (n === 1 ? ' entrada de fuente' : ' entradas de fuentes'),
      pt: (n) => n + (n === 1 ? ' registo de fonte' : ' registos de fontes'),
      de: (n) => n + (n === 1 ? ' Quelleneintrag' : ' Quelleneinträge')
    };
    count.textContent = (countTemplates[locale] || countTemplates.en)(visible);
    empty.hidden = visible !== 0;
  }
  [query, kind, topic].forEach((control) => control.addEventListener('input', filter));
  clear.addEventListener('click', () => {
    query.value = '';
    kind.value = '';
    topic.value = '';
    filter();
    query.focus();
  });
  document.addEventListener('noor:languagechange', filter);
  filter();
})();