(() => {
  'use strict';

  const root = document.getElementById('archive-network-explorer');
  if (!root) return;

  const svg = document.getElementById('archive-network-svg');
  const world = document.getElementById('archive-network-world');
  const viewport = document.getElementById('archive-network-viewport');
  const queryInput = document.getElementById('archive-map-query');
  const topicInput = document.getElementById('archive-map-topic');
  const resultLabel = document.getElementById('archive-map-result-count');
  const zoomLabel = document.getElementById('archive-map-zoom-level');
  const selectedPanel = document.getElementById('archive-map-selected');
  const emptyPanel = document.getElementById('archive-map-empty-state');
  const detailsIndex = document.getElementById('archive-map-detail-index');
  const detailsType = document.getElementById('archive-map-detail-type');
  const detailsTitle = document.getElementById('archive-map-detail-title');
  const detailsMeta = document.getElementById('archive-map-detail-meta');
  const detailsSummary = document.getElementById('archive-map-detail-summary');
  const detailsActions = document.getElementById('archive-map-detail-actions');
  const sourceLinks = document.getElementById('archive-map-source-links');
  const archiveQuery = document.getElementById('archive-query');
  const archiveCategory = document.getElementById('archive-category');
  const cardsRoot = document.getElementById('archive-card-grid');

  if (!svg || !world || !viewport || !cardsRoot) return;

  const NS = 'http://www.w3.org/2000/svg';
  const VIEW_W = 1600;
  const VIEW_H = 1000;
  const WORLD_W = 2200;
  const WORLD_H = 1600;
  const CENTER = { x: 1100, y: 800 };
  const HUB_RADIUS = 330;
  const RECORD_W = 226;
  const RECORD_H = 100;
  const HUB_W = 170;
  const HUB_H = 70;
  const MIN_ZOOM = 0.28;
  const MAX_ZOOM = 2.8;
  const CATEGORY_ANGLES = {
    'food-nutrition': -90,
    'child-casualties': -50,
    'civilian-harm': -10,
    'displacement': 30,
    'aid-workers': 70,
    'aid-access': 110,
    'schools-shelters': 150,
    'destruction': 190,
    'detention': 230
  };

  const categorySelect = document.getElementById('archive-category');
  const categoryNames = new Map();
  [...(categorySelect ? categorySelect.options : [])].forEach((option) => {
    if (option.value) categoryNames.set(option.value, option);
  });

  const MAP_COPY = {
    en: {
      evidenceMap: 'EVIDENCE MAP', sourceRecords: 'SOURCE RECORDS', sourceRecord: 'SOURCE RECORD',
      topicNode: 'TOPIC NODE', record: 'RECORD', records: 'RECORDS', dateNotListed: 'DATE NOT LISTED',
      archiveSourceRecord: 'ARCHIVE SOURCE RECORD', subjectCluster: 'SUBJECT CLUSTER',
      openFullRecord: 'OPEN FULL RECORD ↓', openArchiveFilters: 'OPEN ARCHIVE FILTERS ↓',
      recordsVisible: '{visible} / {total} RECORDS VISIBLE · {topics} TOPIC HUBS',
      centralAria: 'NOOR central evidence archive', topicAria: 'topic hub', selectNode: 'Select a node.',
      topicHelp: 'This hub groups archive records under the same subject. Connections show how the records are classified, not proof of legal responsibility.',
      locationUnknown: 'LOCATION NOT LISTED', noResults: 'No records match these filters.', noSources: 'No additional source links are attached to this topic hub.', visibleAfterFilters: 'visible after filters'
    },
    ar: {
      evidenceMap: 'خريطة الأدلة', sourceRecords: 'سجلات المصادر', sourceRecord: 'سجل المصدر',
      topicNode: 'محور موضوعي', record: 'سجل', records: 'سجلات', dateNotListed: 'التاريخ غير مذكور',
      archiveSourceRecord: 'سجل مصدر من الأرشيف', subjectCluster: 'مجموعة موضوعية',
      openFullRecord: 'افتح السجل الكامل ↓', openArchiveFilters: 'افتح عوامل التصفية ↓',
      recordsVisible: '{visible} من {total} سجل ظاهر · {topics} محاور موضوعية',
      centralAria: 'أرشيف نور المركزي للأدلة', topicAria: 'محور موضوعي', selectNode: 'اختر عقدة.',
      topicHelp: 'يجمع هذا المحور سجلات الأرشيف ذات الموضوع نفسه. توضّح الروابط تصنيف السجلات ولا تثبت المسؤولية القانونية.',
      locationUnknown: 'الموقع غير مذكور', noResults: 'لا توجد سجلات تطابق عوامل التصفية.', noSources: 'لا توجد روابط مصادر إضافية مرفقة بهذا المحور.', visibleAfterFilters: 'مرئية بعد التصفية'
    },
    fr: {
      evidenceMap: 'CARTE DES PREUVES', sourceRecords: 'SOURCES ARCHIVÉES', sourceRecord: 'SOURCE',
      topicNode: 'THÈME', record: 'DOSSIER', records: 'DOSSIERS', dateNotListed: 'DATE NON INDIQUÉE',
      archiveSourceRecord: 'SOURCE DE L’ARCHIVE', subjectCluster: 'GROUPE THÉMATIQUE',
      openFullRecord: 'OUVRIR LE DOSSIER COMPLET ↓', openArchiveFilters: 'OUVRIR LES FILTRES ↓',
      recordsVisible: '{visible} / {total} DOSSIERS VISIBLES · {topics} THÈMES',
      centralAria: 'Archives centrales de preuves NOOR', topicAria: 'thème', selectNode: 'Sélectionnez un nœud.',
      topicHelp: 'Ce thème regroupe les dossiers sur un même sujet. Les liens montrent le classement des sources, pas une preuve de responsabilité juridique.',
      locationUnknown: 'LIEU NON INDIQUÉ', noResults: 'Aucun dossier ne correspond à ces filtres.', noSources: 'Aucun autre lien source n’est associé à ce thème.', visibleAfterFilters: 'visibles après filtrage'
    },
    es: {
      evidenceMap: 'MAPA DE EVIDENCIAS', sourceRecords: 'REGISTROS FUENTE', sourceRecord: 'REGISTRO FUENTE',
      topicNode: 'TEMA', record: 'REGISTRO', records: 'REGISTROS', dateNotListed: 'FECHA NO INDICADA',
      archiveSourceRecord: 'REGISTRO DEL ARCHIVO', subjectCluster: 'GRUPO TEMÁTICO',
      openFullRecord: 'ABRIR REGISTRO COMPLETO ↓', openArchiveFilters: 'ABRIR FILTROS DEL ARCHIVO ↓',
      recordsVisible: '{visible} / {total} REGISTROS VISIBLES · {topics} TEMAS',
      centralAria: 'Archivo central de evidencias de NOOR', topicAria: 'tema', selectNode: 'Selecciona un nodo.',
      topicHelp: 'Este grupo reúne registros sobre el mismo tema. Los enlaces muestran cómo se clasifican las fuentes, no prueban responsabilidad jurídica.',
      locationUnknown: 'UBICACIÓN NO INDICADA', noResults: 'Ningún registro coincide con estos filtros.', noSources: 'Este tema no tiene enlaces de fuentes adicionales.', visibleAfterFilters: 'visibles tras aplicar filtros'
    },
    pt: {
      evidenceMap: 'MAPA DE EVIDÊNCIAS', sourceRecords: 'REGISTOS DE ORIGEM', sourceRecord: 'REGISTO DE ORIGEM',
      topicNode: 'TEMA', record: 'REGISTO', records: 'REGISTOS', dateNotListed: 'DATA NÃO INDICADA',
      archiveSourceRecord: 'REGISTO DO ARQUIVO', subjectCluster: 'GRUPO TEMÁTICO',
      openFullRecord: 'ABRIR REGISTO COMPLETO ↓', openArchiveFilters: 'ABRIR FILTROS DO ARQUIVO ↓',
      recordsVisible: '{visible} / {total} REGISTOS VISÍVEIS · {topics} TEMAS',
      centralAria: 'Arquivo central de evidências da NOOR', topicAria: 'tema', selectNode: 'Selecione um nó.',
      topicHelp: 'Este grupo reúne registos sobre o mesmo tema. As ligações mostram a classificação das fontes, não provam responsabilidade jurídica.',
      locationUnknown: 'LOCAL NÃO INDICADO', noResults: 'Nenhum registo corresponde a estes filtros.', noSources: 'Este tema não tem ligações adicionais a fontes.', visibleAfterFilters: 'visíveis após filtrar'
    },
    de: {
      evidenceMap: 'BELEGKARTE', sourceRecords: 'QUELLENBELEGE', sourceRecord: 'QUELLENBELEG',
      topicNode: 'THEMA', record: 'EINTRAG', records: 'EINTRÄGE', dateNotListed: 'DATUM NICHT ANGEGEBEN',
      archiveSourceRecord: 'ARCHIVQUELLE', subjectCluster: 'THEMENGRUPPE',
      openFullRecord: 'VOLLSTÄNDIGEN EINTRAG ÖFFNEN ↓', openArchiveFilters: 'ARCHIVFILTER ÖFFNEN ↓',
      recordsVisible: '{visible} / {total} EINTRÄGE SICHTBAR · {topics} THEMEN',
      centralAria: 'Zentrales NOOR-Belegarchiv', topicAria: 'Themenknoten', selectNode: 'Knoten auswählen.',
      topicHelp: 'Dieser Knoten gruppiert Archivbelege zum selben Thema. Die Verbindungen zeigen die Klassifizierung der Quellen, keinen Beweis rechtlicher Verantwortung.',
      locationUnknown: 'ORT NICHT ANGEGEBEN', noResults: 'Keine Einträge entsprechen diesen Filtern.', noSources: 'Mit diesem Themenknoten sind keine weiteren Quellenlinks verknüpft.', visibleAfterFilters: 'nach Filterung sichtbar'
    }
  };
  const getLang = () => window.NOORLocalization
    ? window.NOORLocalization.getLanguage()
    : (['en', 'ar', 'fr', 'es', 'pt', 'de'].includes(document.documentElement.lang) ? document.documentElement.lang : 'en');
  const mapCopy = (key) => (MAP_COPY[getLang()] && MAP_COPY[getLang()][key]) || MAP_COPY.en[key] || key;
  const translateValue = (value) => window.NOORLocalization
    ? window.NOORLocalization.translate(value, getLang())
    : value;
  const isRtl = () => getLang() === 'ar';
  const txt = (element) => (element ? element.textContent : '').trim();
  const attrText = (element, lang = getLang()) => {
    if (!element) return '';
    return element.getAttribute('data-' + lang) || txt(element);
  };
  const escapeHtml = (value) => String(value == null ? '' : value).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[c]);
  const normalize = (value) => String(value || '').normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().trim();

  function readRecords() {
    return [...cardsRoot.querySelectorAll('.archive-card')].map((card, index) => {
      const id = card.dataset.recordId || 'record-' + (index + 1);
      if (!card.id) card.id = 'record-' + id;
      const titleEl = card.querySelector('h3');
      const summaryEl = card.querySelector('.archive-card-summary');
      const links = [...card.querySelectorAll('a[href]')].map((a) => ({
        href: a.getAttribute('href'),
        label: txt(a),
        external: /^https?:\/\//i.test(a.getAttribute('href'))
      })).filter((a) => a.href && a.label);
      const option = categoryNames.get(card.dataset.category);
      const categoryLabel = option ? txt(option) : (card.dataset.category || 'Other');
      const searchable = normalize([
        txt(card), card.dataset.keywords, card.dataset.recordId, card.dataset.start,
        card.dataset.end, card.dataset.location, card.dataset.category,
        card.dataset.sourceType, card.dataset.status, card.dataset.footage
      ].join(' '));
      return {
        id, key: 'record:' + id, el: card, index: index + 1,
        titleEl, summaryEl, links,
        title: txt(titleEl) || 'Untitled record',
        summary: txt(summaryEl),
        category: card.dataset.category || 'other',
        categoryLabel,
        location: card.dataset.location || '',
        sourceType: card.dataset.sourceType || '',
        status: card.dataset.status || '',
        start: card.dataset.start || '',
        end: card.dataset.end || '',
        searchable,
        node: null, x: CENTER.x, y: CENTER.y
      };
    });
  }

  function getCategories(records) {
    const keys = [...new Set(records.map((r) => r.category))];
    return keys.map((key) => {
      const option = categoryNames.get(key);
      const theta = (CATEGORY_ANGLES[key] == null ? -90 : CATEGORY_ANGLES[key]) * Math.PI / 180;
      return {
        key, id: 'topic:' + key,
        label: option ? txt(option) : key.replace(/-/g, ' '),
        x: CENTER.x + Math.cos(theta) * HUB_RADIUS,
        y: CENTER.y + Math.sin(theta) * HUB_RADIUS,
        theta, count: records.filter((r) => r.category === key).length,
        records: [], node: null
      };
    }).sort((left, right) => left.theta - right.theta);
  }

  function svgEl(name, attrs = {}, textContent = null) {
    const element = document.createElementNS(NS, name);
    Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, String(value)));
    if (textContent !== null) element.textContent = textContent;
    return element;
  }

  function appendText(parent, x, y, value, className, attrs = {}) {
    parent.appendChild(svgEl('text', { x, y, class: className, ...attrs }, value));
  }

  function wrapWords(value, maxChars, maxLines = 2) {
    const words = String(value || '').split(/\s+/).filter(Boolean);
    const lines = [];
    let line = '';
    words.forEach((word) => {
      const next = line ? line + ' ' + word : word;
      if (next.length > maxChars && line) {
        lines.push(line);
        line = word;
      } else {
        line = next;
      }
    });
    if (line) lines.push(line);
    if (lines.length > maxLines) {
      lines.length = maxLines;
      const last = lines[maxLines - 1];
      lines[maxLines - 1] = last.length > maxChars - 1 ? last.slice(0, maxChars - 2) + '…' : last + '…';
    }
    return lines;
  }

  function pathCurve(from, to, bend = 0) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.hypot(dx, dy) || 1;
    const normalX = -dy / length;
    const normalY = dx / length;
    const mx = (from.x + to.x) / 2 + normalX * bend;
    const my = (from.y + to.y) / 2 + normalY * bend;
    return 'M ' + from.x + ' ' + from.y + ' Q ' + mx + ' ' + my + ' ' + to.x + ' ' + to.y;
  }

  function connect(layer, from, to, klass, bend = 0, extra = {}) {
    const path = svgEl('path', {
      d: pathCurve(from, to, bend),
      class: 'archive-network-edge ' + klass,
      'data-from': from.id || from.key,
      'data-to': to.id || to.key,
      ...extra
    });
    layer.appendChild(path);
    return path;
  }

  function recordPosition(record, hub, index, count) {
    // Two-card rows make the topic cluster legible. A collision pass below
    // then separates any cards whose boxes overlap another cluster or hub.
    const row = Math.floor(index / 2);
    const col = index % 2;
    const rowCount = Math.min(2, count - row * 2);
    const offset = rowCount === 1 ? 0 : (col === 0 ? -132 : 132);
    const radialDistance = 150 + row * 126;
    const radialX = Math.cos(hub.theta);
    const radialY = Math.sin(hub.theta);
    const tangentX = -radialY;
    const tangentY = radialX;
    return {
      x: hub.x + radialX * radialDistance + tangentX * offset,
      y: hub.y + radialY * radialDistance + tangentY * offset
    };
  }

  function layoutRecordsWithoutCollisions(records, categories) {
    if (!window.NOORArchiveMapLayout) {
      throw new Error('NOOR archive map layout module was not loaded.');
    }
    const result = window.NOORArchiveMapLayout.layoutRecordsWithoutCollisions(records, categories, {
      center: CENTER, recordWidth: RECORD_W, recordHeight: RECORD_H,
      hubWidth: HUB_W, hubHeight: HUB_H, rootWidth: 168, rootHeight: 168, margin: 20
    });
    if (result.overlaps.length) {
      console.error('Archive map could not fully resolve collisions:', result.overlaps);
    }
    return result;
  }

  let records = readRecords();
  let categories = [];
  let selectedKey = '';
  let scale = 0.5;
  let tx = 0;
  let ty = 0;
  let drag = null;
  let movedDuringDrag = false;
  let suppressClick = false;
  const activePointers = new Map();
  let pinchState = null;
  let mapQuery = '';
  let mapTopic = '';
  let allNodes = [];
  let mapInitialized = false;

  function createCenterNode() {
    const g = svgEl('g', {
      class: 'archive-network-node archive-network-node-center',
      'data-node-id': 'archive-root',
      role: 'button', tabindex: '0', 'aria-label': mapCopy('centralAria')
    });
    g.appendChild(svgEl('circle', { cx: CENTER.x, cy: CENTER.y, r: 84, class: 'archive-network-center-glow' }));
    g.appendChild(svgEl('circle', { cx: CENTER.x, cy: CENTER.y, r: 75, class: 'archive-network-center-ring' }));
    g.appendChild(svgEl('circle', { cx: CENTER.x, cy: CENTER.y, r: 66, class: 'archive-network-center-inner' }));
    g.appendChild(svgEl('path', { d: 'M ' + (CENTER.x - 38) + ' ' + (CENTER.y - 35) + ' h 76', class: 'archive-network-center-rule' }));
    appendText(g, CENTER.x, CENTER.y - 12, 'NOOR', 'archive-network-center-title', { 'text-anchor': 'middle' });
    appendText(g, CENTER.x, CENTER.y + 10, mapCopy('evidenceMap'), 'archive-network-center-label', { 'text-anchor': 'middle', direction: isRtl() ? 'rtl' : 'ltr', 'unicode-bidi': 'plaintext' });
    appendText(g, CENTER.x, CENTER.y + 35, records.length + ' ' + mapCopy('sourceRecords'), 'archive-network-center-count', { 'text-anchor': 'middle', direction: isRtl() ? 'rtl' : 'ltr', 'unicode-bidi': 'plaintext' });
    return g;
  }

  function createCategoryNode(hub) {
    const g = svgEl('g', {
      class: 'archive-network-node archive-network-node-topic',
      transform: 'translate(' + (hub.x - HUB_W / 2) + ' ' + (hub.y - HUB_H / 2) + ')',
      'data-node-id': hub.id, 'data-node-type': 'topic', 'data-topic': hub.key,
      role: 'button', tabindex: '0', 'aria-pressed': 'false', 'aria-label': hub.label + ' ' + mapCopy('topicAria')
    });
    g.appendChild(svgEl('rect', { x: 0, y: 0, width: HUB_W, height: HUB_H, rx: 3, class: 'archive-network-topic-card' }));
    g.appendChild(svgEl('circle', { cx: isRtl() ? HUB_W - 14 : 14, cy: 16, r: 3, class: 'archive-network-topic-dot' }));
    const titleMax = isRtl() ? 17 : (['fr', 'es', 'pt', 'de'].includes(getLang()) ? 18 : 20);
    const titleLines = wrapWords(hub.label.toLocaleUpperCase(getLang()), titleMax, 2);
    titleLines.forEach((line, i) => appendText(g, isRtl() ? HUB_W - 12 : 26, 19 + i * 14, line, 'archive-network-topic-title', {
      'text-anchor': isRtl() ? 'end' : 'start',
      direction: isRtl() ? 'rtl' : 'ltr',
      'unicode-bidi': 'plaintext'
    }));
    appendText(g, isRtl() ? HUB_W - 12 : 13, HUB_H - 12,
      mapCopy('topicNode') + ' / ' + String(hub.count).padStart(2, '0') + ' ' + (hub.count === 1 ? mapCopy('record') : mapCopy('records')),
      'archive-network-node-meta', { 'text-anchor': isRtl() ? 'end' : 'start', direction: isRtl() ? 'rtl' : 'ltr', 'unicode-bidi': 'plaintext' });
    hub.node = g;
    return g;
  }

  function createRecordNode(record, position) {
    record.x = position.x;
    record.y = position.y;
    const g = svgEl('g', {
      class: 'archive-network-node archive-network-node-record',
      transform: 'translate(' + (record.x - RECORD_W / 2) + ' ' + (record.y - RECORD_H / 2) + ')',
      'data-node-id': record.key, 'data-node-type': 'record', 'data-topic': record.category,
      role: 'button', tabindex: '0', 'aria-pressed': 'false',
      'aria-label': record.title + ' — ' + mapCopy('sourceRecord'),
      lang: getLang(), direction: isRtl() ? 'rtl' : 'ltr'
    });
    g.appendChild(svgEl('rect', { x: 0, y: 0, width: RECORD_W, height: RECORD_H, rx: 2, class: 'archive-network-record-card' }));
    g.appendChild(svgEl('rect', { x: isRtl() ? RECORD_W - 4 : 0, y: 0, width: 4, height: RECORD_H, class: 'archive-network-record-stripe' }));
    appendText(g, isRtl() ? RECORD_W - 12 : 12, 16, mapCopy('sourceRecord') + ' / ' + String(record.index).padStart(3, '0'), 'archive-network-record-id', {
      'text-anchor': isRtl() ? 'end' : 'start', direction: 'ltr', 'unicode-bidi': 'plaintext'
    });
    const titleMax = isRtl() ? 18 : (['fr', 'es', 'pt', 'de'].includes(getLang()) ? 25 : 28);
    const titleLines = wrapWords(record.title, titleMax, 3);
    titleLines.forEach((line, i) => appendText(g, isRtl() ? RECORD_W - 12 : 12, 37 + i * 13, line, 'archive-network-record-title', {
      'text-anchor': isRtl() ? 'end' : 'start',
      direction: isRtl() ? 'rtl' : 'ltr',
      'unicode-bidi': 'plaintext',
      lang: getLang()
    }));
    const dateLabel = record.start ? record.start.slice(0, 4) + (record.end && record.end.slice(0, 4) !== record.start.slice(0, 4) ? '–' + record.end.slice(0, 4) : '') : mapCopy('dateNotListed');
    const statusText = record.status ? translateValue(record.status.toUpperCase().replace(/-/g, ' ')).slice(0, 22) : '';
    appendText(g, isRtl() ? RECORD_W - 12 : 12, RECORD_H - 8,
      dateLabel + (statusText ? '  /  ' + statusText : ''),
      'archive-network-node-meta', {
        'text-anchor': isRtl() ? 'end' : 'start',
        direction: isRtl() ? 'rtl' : 'ltr',
        'unicode-bidi': 'plaintext'
      });
    record.node = g;
    return g;
  }

  function createGraph() {
    records = readRecords();
    categories = getCategories(records);
    const linksLayer = svgEl('g', { class: 'archive-network-edges' });
    const categoriesLayer = svgEl('g', { class: 'archive-network-topics' });
    const recordsLayer = svgEl('g', { class: 'archive-network-records' });
    const rootLayer = svgEl('g', { class: 'archive-network-root-layer' });
    categories.forEach((hub) => {
      hub.records = records.filter((record) => record.category === hub.key);
      hub.records.forEach((record, index) => Object.assign(record, recordPosition(record, hub, index, hub.records.length)));
    });
    layoutRecordsWithoutCollisions(records, categories);

    categories.forEach((hub) => connect(linksLayer, CENTER, hub, 'archive-network-edge-root', 24));
    categories.forEach((hub, index) => {
      const next = categories[(index + 1) % categories.length];
      if (next) connect(linksLayer, hub, next, 'archive-network-edge-ring', (index % 2 === 0 ? 24 : -24));
      hub.records.forEach((record, idx) => {
        connect(linksLayer, hub, record, 'archive-network-edge-record', ((idx % 2) ? -12 : 12), { 'data-record-link': record.key });
      });
    });

    world.replaceChildren();
    world.appendChild(linksLayer);
    categories.forEach((hub) => categoriesLayer.appendChild(createCategoryNode(hub)));
    records.forEach((record) => {
      const hub = categories.find((item) => item.key === record.category);
      recordsLayer.appendChild(createRecordNode(record, record));
    });
    world.appendChild(categoriesLayer);
    world.appendChild(recordsLayer);
    rootLayer.appendChild(createCenterNode());
    world.appendChild(rootLayer);
    allNodes = [
      { key: 'archive-root', type: 'root', x: CENTER.x, y: CENTER.y, node: rootLayer.firstChild },
      ...categories.map((hub) => ({ key: hub.id, type: 'topic', category: hub.key, x: hub.x, y: hub.y, node: hub.node, data: hub })),
      ...records.map((record) => ({ key: record.key, type: 'record', category: record.category, x: record.x, y: record.y, node: record.node, data: record }))
    ];
    applyFilters();
    fitMap();
  }

  function setTransform() {
    world.setAttribute('transform', 'translate(' + tx.toFixed(2) + ' ' + ty.toFixed(2) + ') scale(' + scale.toFixed(4) + ')');
    zoomLabel.textContent = Math.round(scale / (window.__archiveMapFitScale || scale) * 100) + '%';
  }

  function fitMap() {
    if (!allNodes.length) return;
    const margin = 54;
    const boxes = allNodes.map((item) => {
      if (item.type === 'root') return { minX: item.x - 84, maxX: item.x + 84, minY: item.y - 84, maxY: item.y + 84 };
      if (item.type === 'topic') return { minX: item.x - HUB_W / 2, maxX: item.x + HUB_W / 2, minY: item.y - HUB_H / 2, maxY: item.y + HUB_H / 2 };
      return { minX: item.x - RECORD_W / 2, maxX: item.x + RECORD_W / 2, minY: item.y - RECORD_H / 2, maxY: item.y + RECORD_H / 2 };
    });
    const minX = Math.min(...boxes.map((b) => b.minX));
    const maxX = Math.max(...boxes.map((b) => b.maxX));
    const minY = Math.min(...boxes.map((b) => b.minY));
    const maxY = Math.max(...boxes.map((b) => b.maxY));
    const boundsW = maxX - minX;
    const boundsH = maxY - minY;
    const fit = Math.min((VIEW_W - margin * 2) / boundsW, (VIEW_H - margin * 2) / boundsH, 1.05);
    scale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, fit));
    window.__archiveMapFitScale = scale;
    tx = (VIEW_W - boundsW * scale) / 2 - minX * scale;
    ty = (VIEW_H - boundsH * scale) / 2 - minY * scale;
    setTransform();
  }

  function svgPoint(clientX, clientY) {
    const point = svg.createSVGPoint();
    point.x = clientX;
    point.y = clientY;
    return point.matrixTransform(svg.getScreenCTM().inverse());
  }

  function zoomAt(nextScale, point) {
    const bounded = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, nextScale));
    if (bounded === scale) return;
    const worldX = (point.x - tx) / scale;
    const worldY = (point.y - ty) / scale;
    scale = bounded;
    tx = point.x - worldX * scale;
    ty = point.y - worldY * scale;
    setTransform();
  }

  function centerZoom() {
    zoomAt(scale * 1.22, { x: VIEW_W / 2, y: VIEW_H / 2 });
  }

  function clearRelationshipHighlights() {
    world.querySelectorAll('.is-active-edge').forEach((path) => path.classList.remove('is-active-edge'));
    world.querySelectorAll('.archive-network-node-record.is-related').forEach((node) => node.classList.remove('is-related'));
  }

  function highlightRecordRelationships(record) {
    clearRelationshipHighlights();
    world.querySelectorAll('[data-record-link]').forEach((path) => {
      if (path.getAttribute('data-record-link') === record.key) path.classList.add('is-active-edge');
    });
    const hub = categories.find((item) => item.key === record.category);
    if (hub) {
      const rootEdge = world.querySelector('.archive-network-edge-root[data-to="' + hub.id + '"]');
      if (rootEdge) rootEdge.classList.add('is-active-edge');
      hub.records.forEach((related) => {
        if (related.node && related.key !== record.key) related.node.classList.add('is-related');
      });
    }
  }

  function highlightTopicRelationships(hub) {
    clearRelationshipHighlights();
    const rootEdge = world.querySelector('.archive-network-edge-root[data-to="' + hub.id + '"]');
    if (rootEdge) rootEdge.classList.add('is-active-edge');
    world.querySelectorAll('[data-record-link]').forEach((path) => {
      const record = records.find((item) => item.key === path.getAttribute('data-record-link'));
      if (record && record.category === hub.key) path.classList.add('is-active-edge');
    });
    hub.records.forEach((record) => {
      if (record.node) record.node.classList.add('is-related');
    });
  }

  function resetDetails() {
    selectedKey = '';
    selectedPanel.hidden = true;
    emptyPanel.hidden = false;
    clearRelationshipHighlights();
    allNodes.forEach((item) => {
      if (item.node && item.node.hasAttribute('aria-pressed')) item.node.setAttribute('aria-pressed', 'false');
      if (item.node) item.node.classList.remove('is-selected');
    });
  }

  function appendDetailLink(container, link, className = '') {
    const anchor = document.createElement('a');
    anchor.href = link.href;
    anchor.textContent = link.label;
    if (className) anchor.className = className;
    if (link.external) {
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
    }
    container.appendChild(anchor);
  }

  function setPanel(title, index, type, meta, summary, actions, sources) {
    emptyPanel.hidden = true;
    selectedPanel.hidden = false;
    detailsTitle.textContent = title;
    detailsIndex.textContent = index;
    detailsType.textContent = type;
    detailsMeta.replaceChildren();
    meta.filter(Boolean).forEach((value) => {
      const chip = document.createElement('span');
      chip.textContent = value;
      detailsMeta.appendChild(chip);
    });
    detailsSummary.textContent = summary;
    detailsActions.replaceChildren();
    actions.forEach((action) => appendDetailLink(detailsActions, action, 'archive-map-action-link'));
    sourceLinks.replaceChildren();
    if (!sources.length) {
      const p = document.createElement('p');
      p.className = 'archive-map-no-sources';
      p.textContent = mapCopy('noSources');
      sourceLinks.appendChild(p);
    } else {
      sources.forEach((link) => appendDetailLink(sourceLinks, link));
    }
  }

  function selectRecord(record) {
    selectedKey = record.key;
    allNodes.forEach((item) => {
      if (!item.node) return;
      const selected = item.key === selectedKey;
      item.node.classList.toggle('is-selected', selected);
      if (item.node.hasAttribute('aria-pressed')) item.node.setAttribute('aria-pressed', String(selected));
    });
    const date = record.start ? record.start + (record.end && record.end !== record.start ? ' → ' + record.end : '') : mapCopy('dateNotListed');
    const meta = [
      record.categoryLabel,
      date,
      record.location ? translateValue(record.location.replace(/-/g, ' ')) : mapCopy('locationUnknown'),
      record.status ? translateValue(record.status.replace(/-/g, ' ')) : ''
    ];
    const caseLinks = record.links.filter((link) => /^case-[^#]+\.html(?:#.*)?$/.test(link.href) || link.href.startsWith('case-'));
    const actions = [{ href: '#' + record.el.id, label: mapCopy('openFullRecord'), external: false }];
    caseLinks.forEach((link) => actions.push(link));
    highlightRecordRelationships(record);
    setPanel(record.title, mapCopy('sourceRecord') + ' / ' + String(record.index).padStart(3, '0'), mapCopy('archiveSourceRecord'), meta, record.summary, actions, record.links.filter((link) => link.external).slice(0, 5));
  }

  function selectTopic(hub) {
    selectedKey = hub.id;
    allNodes.forEach((item) => {
      if (!item.node) return;
      const selected = item.key === selectedKey;
      item.node.classList.toggle('is-selected', selected);
      if (item.node.hasAttribute('aria-pressed')) item.node.setAttribute('aria-pressed', String(selected));
    });
    topicInput.value = hub.key;
    mapTopic = hub.key;
    if (archiveCategory) {
      archiveCategory.value = hub.key;
      archiveCategory.dispatchEvent(new Event('change', { bubbles: true }));
    }
    const visible = hub.records.filter((record) => !record.el.hidden);
    const actions = [{
      href: '#archive-filters',
      label: mapCopy('openArchiveFilters'),
      external: false
    }];
    highlightTopicRelationships(hub);
    setPanel(hub.label, mapCopy('topicNode') + ' / ' + String(hub.count).padStart(2, '0'), mapCopy('subjectCluster'), [
      String(hub.count) + ' ' + mapCopy(hub.count === 1 ? 'record' : 'records'),
      String(visible.length) + ' ' + mapCopy('visibleAfterFilters')
    ], mapCopy('topicHelp'), actions, []);
    applyFilters();
  }

  function selectRoot() {
    resetDetails();
    fitMap();
  }

  function onNodeActivate(target) {
    const node = target && target.closest('[data-node-id]');
    if (!node) return;
    const id = node.dataset.nodeId;
    if (id === 'archive-root') return selectRoot();
    if (node.dataset.nodeType === 'topic') {
      const hub = categories.find((item) => item.id === id);
      if (hub) selectTopic(hub);
      return;
    }
    if (node.dataset.nodeType === 'record') {
      const record = records.find((item) => item.key === id);
      if (record) selectRecord(record);
    }
  }

  function applyFilters() {
    const q = normalize(queryInput.value);
    mapQuery = q;
    mapTopic = topicInput.value || '';
    let matched = 0;
    records.forEach((record) => {
      const matches = (!q || record.searchable.includes(q)) &&
        (!mapTopic || record.category === mapTopic) &&
        !record.el.hidden;
      record.matches = matches;
      if (matches) matched += 1;
      if (record.node) {
        record.node.classList.toggle('is-filtered-out', !matches);
        record.node.setAttribute('aria-hidden', String(!matches));
        record.node.setAttribute('tabindex', matches ? '0' : '-1');
      }
    });
    categories.forEach((hub) => {
      const matchedInHub = hub.records.filter((r) => r.matches).length;
      if (hub.node) {
        hub.node.classList.toggle('is-filtered-out', matchedInHub === 0);
        hub.node.classList.toggle('is-topic-muted', Boolean(mapTopic && mapTopic !== hub.key));
        hub.node.setAttribute('aria-hidden', String(matchedInHub === 0));
        hub.node.setAttribute('tabindex', matchedInHub === 0 ? '-1' : '0');
        hub.node.setAttribute('aria-pressed', String(selectedKey === hub.id));
      }
    });
    world.querySelectorAll('[data-record-link]').forEach((path) => {
      const record = records.find((r) => r.key === path.getAttribute('data-record-link'));
      path.classList.toggle('is-filtered-out', !record || !record.matches);
    });
    world.querySelectorAll('.archive-network-edge-root').forEach((path) => {
      const hub = categories.find((h) => h.id === path.getAttribute('data-to'));
      path.classList.toggle('is-muted-edge', Boolean(mapTopic && hub && mapTopic !== hub.key));
    });
    resultLabel.textContent = mapCopy('recordsVisible')
      .replace('{visible}', String(matched))
      .replace('{total}', String(records.length))
      .replace('{topics}', String(categories.length));
    if (!records.some((r) => r.key === selectedKey && r.matches) &&
        !categories.some((h) => h.id === selectedKey && (!mapTopic || h.key === mapTopic))) {
      if (selectedKey.startsWith('record:')) resetDetails();
    }
  }

  function setMapQuery(value) {
    queryInput.value = value;
    if (archiveQuery) {
      archiveQuery.value = value;
      archiveQuery.dispatchEvent(new Event('input', { bubbles: true }));
    }
    applyFilters();
  }

  queryInput.addEventListener('input', () => setMapQuery(queryInput.value));
  topicInput.addEventListener('change', () => {
    mapTopic = topicInput.value;
    if (archiveCategory && archiveCategory.value !== mapTopic) {
      archiveCategory.value = mapTopic;
      archiveCategory.dispatchEvent(new Event('change', { bubbles: true }));
    }
    applyFilters();
  });

  // Keep the relationship map in sync when people use the detailed filters
  // farther down the page, not only when they use the map-specific controls.
  if (archiveQuery) {
    archiveQuery.addEventListener('input', () => {
      if (queryInput.value !== archiveQuery.value) queryInput.value = archiveQuery.value;
      applyFilters();
    });
  }
  if (archiveCategory) {
    archiveCategory.addEventListener('change', () => {
      if (topicInput.value !== archiveCategory.value) topicInput.value = archiveCategory.value;
      mapTopic = archiveCategory.value || '';
      applyFilters();
    });
  }
  const archiveFilterForm = document.getElementById('archive-filter-form');
  if (archiveFilterForm) {
    archiveFilterForm.addEventListener('input', () => window.setTimeout(applyFilters, 0));
    archiveFilterForm.addEventListener('change', () => window.setTimeout(applyFilters, 0));
    archiveFilterForm.addEventListener('submit', () => window.setTimeout(applyFilters, 0));
  }
  const archiveClearButton = document.getElementById('archive-clear');
  if (archiveClearButton) {
    archiveClearButton.addEventListener('click', () => window.setTimeout(() => {
      queryInput.value = archiveQuery ? archiveQuery.value : '';
      topicInput.value = archiveCategory ? archiveCategory.value : '';
      mapQuery = queryInput.value;
      mapTopic = topicInput.value;
      applyFilters();
      resetDetails();
      fitMap();
    }, 0));
  }

  document.getElementById('archive-map-clear').addEventListener('click', () => {
    queryInput.value = '';
    topicInput.value = '';
    setMapQuery('');
    if (archiveCategory) {
      archiveCategory.value = '';
      archiveCategory.dispatchEvent(new Event('change', { bubbles: true }));
    }
    resetDetails();
    fitMap();
  });
  document.getElementById('archive-map-fit').addEventListener('click', fitMap);
  document.getElementById('archive-map-fit-top').addEventListener('click', fitMap);
  document.getElementById('archive-map-zoom-in').addEventListener('click', centerZoom);
  document.getElementById('archive-map-zoom-out').addEventListener('click', () => zoomAt(scale / 1.22, { x: VIEW_W / 2, y: VIEW_H / 2 }));
  document.getElementById('archive-map-deselect').addEventListener('click', resetDetails);

  viewport.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 && event.pointerType !== 'touch') return;
    if (event.target.closest('button, a, input, select, label')) return;
    activePointers.set(event.pointerId, { clientX: event.clientX, clientY: event.clientY });
    if (viewport.setPointerCapture) viewport.setPointerCapture(event.pointerId);

    if (activePointers.size >= 2) {
      const points = [...activePointers.values()].slice(0, 2);
      const dx = points[1].clientX - points[0].clientX;
      const dy = points[1].clientY - points[0].clientY;
      const midClientX = (points[0].clientX + points[1].clientX) / 2;
      const midClientY = (points[0].clientY + points[1].clientY) / 2;
      const mid = svgPoint(midClientX, midClientY);
      pinchState = {
        distance: Math.max(1, Math.hypot(dx, dy)),
        scale,
        anchorX: (mid.x - tx) / scale,
        anchorY: (mid.y - ty) / scale
      };
      drag = null;
      movedDuringDrag = true;
      viewport.classList.add('is-dragging');
      return;
    }

    drag = {
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
      tx, ty, moved: false,
      node: event.target.closest('[data-node-id]')
    };
    movedDuringDrag = false;
    viewport.classList.add('is-dragging');
  });

  viewport.addEventListener('pointermove', (event) => {
    if (activePointers.has(event.pointerId)) {
      activePointers.set(event.pointerId, { clientX: event.clientX, clientY: event.clientY });
    }
    if (pinchState && activePointers.size >= 2) {
      const points = [...activePointers.values()].slice(0, 2);
      const dx = points[1].clientX - points[0].clientX;
      const dy = points[1].clientY - points[0].clientY;
      const mid = svgPoint((points[0].clientX + points[1].clientX) / 2, (points[0].clientY + points[1].clientY) / 2);
      scale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, pinchState.scale * Math.hypot(dx, dy) / pinchState.distance));
      tx = mid.x - pinchState.anchorX * scale;
      ty = mid.y - pinchState.anchorY * scale;
      movedDuringDrag = true;
      setTransform();
      return;
    }
    if (!drag || drag.pointerId !== event.pointerId) return;
    const p0 = svgPoint(drag.clientX, drag.clientY);
    const p1 = svgPoint(event.clientX, event.clientY);
    if (Math.hypot(event.clientX - drag.clientX, event.clientY - drag.clientY) > 5) drag.moved = true;
    if (drag.moved) {
      movedDuringDrag = true;
      tx = drag.tx + (p1.x - p0.x);
      ty = drag.ty + (p1.y - p0.y);
      setTransform();
    }
  });

  function endPointer(event) {
    const wasPinching = Boolean(pinchState);
    const current = drag && drag.pointerId === event.pointerId ? drag : null;
    activePointers.delete(event.pointerId);

    if (wasPinching) {
      pinchState = null;
      drag = null;
      suppressClick = true;
      window.setTimeout(() => { suppressClick = false; }, 140);
      if (activePointers.size === 1) {
        const [remainingId, point] = [...activePointers.entries()][0];
        drag = {
          pointerId: remainingId,
          clientX: point.clientX,
          clientY: point.clientY,
          tx, ty, moved: true, node: null
        };
      }
    } else if (current) {
      drag = null;
      if (!current.moved && current.node) {
        suppressClick = true;
        onNodeActivate(current.node);
        window.setTimeout(() => { suppressClick = false; }, 120);
      } else if (current.moved) {
        suppressClick = true;
        window.setTimeout(() => { suppressClick = false; }, 120);
      }
      if (activePointers.size === 1) {
        const [remainingId, point] = [...activePointers.entries()][0];
        drag = {
          pointerId: remainingId,
          clientX: point.clientX,
          clientY: point.clientY,
          tx, ty, moved: true, node: null
        };
      }
    }

    if (activePointers.size === 0) viewport.classList.remove('is-dragging');
    if (viewport.hasPointerCapture && viewport.hasPointerCapture(event.pointerId)) {
      viewport.releasePointerCapture(event.pointerId);
    }
  }
  viewport.addEventListener('pointerup', endPointer);
  viewport.addEventListener('pointercancel', endPointer);
  viewport.addEventListener('click', (event) => {
    if (suppressClick) {
      event.preventDefault();
      event.stopPropagation();
      suppressClick = false;
      return;
    }
    const target = event.target.closest('[data-node-id]');
    if (target && !drag) onNodeActivate(target);
  });
  viewport.addEventListener('wheel', (event) => {
    event.preventDefault();
    const point = svgPoint(event.clientX, event.clientY);
    zoomAt(scale * (event.deltaY < 0 ? 1.12 : 1 / 1.12), point);
  }, { passive: false });
  viewport.addEventListener('keydown', (event) => {
    const pan = 65 / scale;
    if (event.key === 'ArrowLeft') { tx += pan; event.preventDefault(); setTransform(); }
    else if (event.key === 'ArrowRight') { tx -= pan; event.preventDefault(); setTransform(); }
    else if (event.key === 'ArrowUp') { ty += pan; event.preventDefault(); setTransform(); }
    else if (event.key === 'ArrowDown') { ty -= pan; event.preventDefault(); setTransform(); }
    else if (event.key === '+' || event.key === '=') { event.preventDefault(); centerZoom(); }
    else if (event.key === '-') { event.preventDefault(); zoomAt(scale / 1.22, { x: VIEW_W / 2, y: VIEW_H / 2 }); }
    else if (event.key === '0') { event.preventDefault(); fitMap(); }
    else if (event.key === 'Escape') resetDetails();
    else if (event.key === 'Enter' || event.key === ' ') {
      const node = event.target.closest('[data-node-id]');
      if (node) { event.preventDefault(); onNodeActivate(node); }
    }
  });

  const languageButton = document.getElementById('archive-language');
  if (languageButton) {
    languageButton.addEventListener('click', () => {
      window.setTimeout(() => {
        createGraph();
        const q = queryInput.value;
        queryInput.placeholder = queryInput.getAttribute('data-' + getLang() + '-placeholder') || queryInput.placeholder;
        queryInput.value = q;
        applyFilters();
      }, 0);
    });
  }

  document.addEventListener('noor:languagechange', () => {
    // Record text and native select labels are localized by the shared runtime.
    // Re-read them and rebuild all SVG text after the locale has been applied.
    const previousQuery = queryInput.value;
    const previousTopic = topicInput.value;
    const previousSelection = selectedKey;
    createGraph();
    queryInput.value = previousQuery;
    topicInput.value = previousTopic;
    if (archiveQuery && archiveQuery.value !== previousQuery) archiveQuery.value = previousQuery;
    applyFilters();

    if (previousSelection.startsWith('record:')) {
      const record = records.find((item) => item.key === previousSelection);
      if (record) selectRecord(record);
    } else if (previousSelection.startsWith('topic:')) {
      const hub = categories.find((item) => item.id === previousSelection);
      if (hub) selectTopic(hub);
    }
  });

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      setTransform();
    }, 100);
  });

  createGraph();
})();