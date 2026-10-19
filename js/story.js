(() => {
  'use strict';

  const root = document.documentElement;
  const languageSelect = document.getElementById('story-language');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const supportedLanguages = ['en', 'ar', 'fr', 'es', 'pt', 'de'];

  const languageMeta = {
    en: {
      dir: 'ltr',
      title: 'A hard pill to swallow | NOOR Field Notes',
      selectLabel: 'Select language',
      locale: 'en_US',
      description: 'Documented accounts and dated humanitarian reporting about the lives children are trying to live in Gaza: loss, family responsibility, education, shelter, and survival.'
    },
    ar: {
      dir: 'rtl',
      title: 'حقيقة يصعب تقبّلها | ملاحظات نور الميدانية',
      selectLabel: 'اختر اللغة',
      locale: 'ar',
      description: 'شهادات موثقة وتقارير إنسانية مؤرخة عن حياة الأطفال في غزة: الفقدان ومسؤوليات الأسرة والتعليم والمأوى والبقاء.'
    },
    fr: {
      dir: 'ltr',
      title: 'Une vérité difficile à accepter | Notes de terrain NOOR',
      selectLabel: 'Choisir la langue',
      locale: 'fr_FR',
      description: 'Témoignages documentés et rapports humanitaires datés sur la vie des enfants à Gaza : pertes, responsabilités familiales, éducation, abri et survie.'
    },
    es: {
      dir: 'ltr',
      title: 'Una verdad difícil de aceptar | Notas de campo de NOOR',
      selectLabel: 'Seleccionar idioma',
      locale: 'es_ES',
      description: 'Testimonios documentados e informes humanitarios fechados sobre la vida de los niños en Gaza: pérdidas, responsabilidades familiares, educación, refugio y supervivencia.'
    },
    pt: {
      dir: 'ltr',
      title: 'Uma verdade difícil de aceitar | Notas de campo NOOR',
      selectLabel: 'Selecionar idioma',
      locale: 'pt_PT',
      description: 'Relatos documentados e relatórios humanitários datados sobre a vida das crianças em Gaza: perdas, responsabilidades familiares, educação, abrigo e sobrevivência.'
    },
    de: {
      dir: 'ltr',
      title: 'Eine bittere Wahrheit | NOOR-Feldnotizen',
      selectLabel: 'Sprache auswählen',
      locale: 'de_DE',
      description: 'Dokumentierte Berichte und datierte humanitäre Meldungen über das Leben von Kindern in Gaza: Verlust, familiäre Verantwortung, Bildung, Unterkunft und Überleben.'
    }
  };

  const dynamicMessages = {
    fr: {
      'Video loaded below': 'La vidéo a été chargée ci-dessous',
      'Open original post on X': 'Ouvrir la publication originale sur X',
      'Loading original X post…': 'Chargement de la publication originale sur X…',
      'Original X post loaded above': 'La publication originale sur X a été chargée ci-dessus',
      'Embed unavailable — use the source link below': 'Intégration indisponible — utilisez le lien source ci-dessous',
      'Documentary video': 'Vidéo documentaire'
    },
    es: {
      'Video loaded below': 'El vídeo se ha cargado a continuación',
      'Open original post on X': 'Abrir la publicación original en X',
      'Loading original X post…': 'Cargando la publicación original en X…',
      'Original X post loaded above': 'La publicación original de X se ha cargado arriba',
      'Embed unavailable — use the source link below': 'Inserción no disponible: usa el enlace a la fuente de abajo',
      'Documentary video': 'Vídeo documental'
    },
    pt: {
      'Video loaded below': 'O vídeo foi carregado abaixo',
      'Open original post on X': 'Abrir a publicação original no X',
      'Loading original X post…': 'A carregar a publicação original no X…',
      'Original X post loaded above': 'A publicação original no X foi carregada acima',
      'Embed unavailable — use the source link below': 'Não foi possível incorporar — usa a ligação para a fonte abaixo',
      'Documentary video': 'Vídeo documental'
    },
    de: {
      'Video loaded below': 'Video unten geladen',
      'Open original post on X': 'Originalbeitrag auf X öffnen',
      'Loading original X post…': 'Originalbeitrag auf X wird geladen…',
      'Original X post loaded above': 'Originalbeitrag auf X wurde oben geladen',
      'Embed unavailable — use the source link below': 'Einbettung nicht verfügbar – nutzen Sie den Quellenlink unten',
      'Documentary video': 'Dokumentarvideo'
    }
  };

  function textForLocale(english, arabic, language = root.lang) {
    if (language === 'ar') return arabic || english || '';
    if (language === 'en') return english || arabic || '';
    const translated = window.NOOR_STORY_TRANSLATIONS &&
      window.NOOR_STORY_TRANSLATIONS[language] &&
      window.NOOR_STORY_TRANSLATIONS[language][english];
    return translated || (dynamicMessages[language] && dynamicMessages[language][english]) || english || arabic || '';
  }

  function setElementLocalization(element, english, arabic) {
    element.setAttribute('data-en', english);
    element.setAttribute('data-ar', arabic);
    element.textContent = textForLocale(english, arabic);
  }

  function setLanguage(nextLanguage) {
    const language = supportedLanguages.includes(nextLanguage) ? nextLanguage : 'en';
    const settings = languageMeta[language];
    root.lang = language;
    root.dir = settings.dir;

    document.querySelectorAll('[data-en][data-ar]').forEach((element) => {
      element.textContent = textForLocale(
        element.getAttribute('data-en'),
        element.getAttribute('data-ar'),
        language
      );
    });

    document.querySelectorAll('[data-en-alt][data-ar-alt]').forEach((element) => {
      element.alt = textForLocale(
        element.getAttribute('data-en-alt'),
        element.getAttribute('data-ar-alt'),
        language
      );
    });

    document.querySelectorAll('[data-en-aria][data-ar-aria]').forEach((element) => {
      element.setAttribute('aria-label', textForLocale(
        element.getAttribute('data-en-aria'),
        element.getAttribute('data-ar-aria'),
        language
      ));
    });

    if (languageSelect) {
      languageSelect.value = language;
      languageSelect.setAttribute('aria-label', settings.selectLabel);
    }

    document.title = settings.title;
    const metadata = [
      ['meta[name="description"]', settings.description],
      ['meta[property="og:description"]', settings.description],
      ['meta[name="twitter:description"]', settings.description],
      ['meta[property="og:locale"]', settings.locale],
      ['meta[property="og:title"]', settings.title],
      ['meta[name="twitter:title"]', settings.title]
    ];
    metadata.forEach(([selector, value]) => {
      const element = document.querySelector(selector);
      if (element) element.setAttribute('content', value);
    });

    try { localStorage.setItem('noor-language', language); } catch (_) { /* Storage can be disabled. */ }
  }

  if (languageSelect) languageSelect.addEventListener('change', () => setLanguage(languageSelect.value));
  try {
    const savedLanguage = localStorage.getItem('noor-language');
    setLanguage(supportedLanguages.includes(savedLanguage) ? savedLanguage : 'en');
  } catch (_) {
    setLanguage('en');
  }

  const reveals = Array.from(document.querySelectorAll('.story-reveal'));
  if (reveals.length && !reduceMotion.matches && 'IntersectionObserver' in window) {
    root.classList.add('story-motion-ready');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });
    reveals.forEach((element) => observer.observe(element));
  } else {
    reveals.forEach((element) => element.classList.add('is-visible'));
  }

  // Keep the field-note jump links in sync with the section currently being read.
  const jumpNavigation = document.querySelector('.story-jump-nav');
  if (jumpNavigation && 'IntersectionObserver' in window) {
    const jumpLinks = Array.from(jumpNavigation.querySelectorAll('a[href^="#"]'));
    const jumpTargets = jumpLinks
      .map((link) => document.getElementById(link.hash.slice(1)))
      .filter(Boolean);

    const jumpObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        jumpLinks.forEach((link) => {
          if (link.hash === '#' + entry.target.id) {
            link.setAttribute('aria-current', 'location');
          } else {
            link.removeAttribute('aria-current');
          }
        });
      });
    }, { rootMargin: '-15% 0px -74% 0px', threshold: 0 });

    jumpTargets.forEach((target) => jumpObserver.observe(target));
  }

  function buildPixelGrid(grid, columns, rows, delayMax, classPrefix) {
    grid.style.gridTemplateColumns = 'repeat(' + columns + ', minmax(0, 1fr))';
    grid.style.gridTemplateRows = 'repeat(' + rows + ', minmax(0, 1fr))';
    const centerX = (columns - 1) / 2;
    const centerY = (rows - 1) / 2;
    const maxDistance = Math.max(1, Math.hypot(centerX, centerY));
    const cells = document.createDocumentFragment();

    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const cell = document.createElement('span');
        cell.className = classPrefix + '__cell tone-' + ((row * 3 + column) % 4);
        const distance = Math.hypot(column - centerX, row - centerY) / maxDistance;
        cell.style.setProperty('--pixel-delay', (distance * delayMax).toFixed(3) + 's');
        cells.appendChild(cell);
      }
    }
    grid.appendChild(cells);
  }

  function revealStoryPage() {
    if (!root.classList.contains('story-arrival-pending')) return;
    if (reduceMotion.matches) {
      root.classList.remove('story-arrival-pending');
      return;
    }

    const overlay = document.createElement('div');
    overlay.className = 'story-pixel-entry';
    overlay.setAttribute('aria-hidden', 'true');

    const grid = document.createElement('div');
    grid.className = 'story-pixel-entry__grid';

    const label = document.createElement('div');
    label.className = 'story-pixel-entry__label';
    label.textContent = ({ ar: 'نور // ملاحظات ميدانية 001', fr: 'NOOR // NOTES DE TERRAIN 001', es: 'NOOR // NOTAS DE CAMPO 001', pt: 'NOOR // NOTAS DE CAMPO 001', de: 'NOOR // FELDNOTIZEN 001' })[root.lang] || 'NOOR // FIELD NOTES 001';

    const columns = Math.min(48, Math.max(10, Math.ceil(window.innerWidth / 44)));
    const rows = Math.min(28, Math.max(8, Math.ceil(window.innerHeight / Math.max(1, window.innerWidth / columns))));
    buildPixelGrid(grid, columns, rows, 0.37, 'story-pixel-entry');
    overlay.append(grid, label);
    document.body.appendChild(overlay);

    window.requestAnimationFrame(() => {
      root.classList.remove('story-arrival-pending');
      overlay.classList.add('is-running');
    });
    window.setTimeout(() => overlay.remove(), 900);
  }


  // Videos are click-to-load, never autoplay. The most distressing phone footage has a separate acknowledgement.
  document.querySelectorAll('.story-video-card[data-video-id]').forEach((card) => {
    const consent = card.querySelector('.story-video-ack');
    const loadButton = card.querySelector('.story-video-load');
    const player = card.querySelector('.story-video-player');
    if (!consent || !loadButton || !player) return;

    loadButton.disabled = !consent.checked;
    consent.addEventListener('change', () => {
      loadButton.disabled = !consent.checked || Boolean(player.querySelector('iframe'));
    });

    loadButton.addEventListener('click', () => {
      if (!consent.checked || player.querySelector('iframe')) return;
      const videoId = card.getAttribute('data-video-id') || '';
      if (!/^[A-Za-z0-9_-]{11}$/.test(videoId)) return;

      const iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube-nocookie.com/embed/' + videoId + '?rel=0';
      iframe.title = card.getAttribute('data-video-title') || 'Documentary video';
      iframe.loading = 'lazy';
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      iframe.allow = 'encrypted-media; picture-in-picture; web-share';
      iframe.allowFullscreen = true;
      iframe.setAttribute('frameborder', '0');
      player.appendChild(iframe);
      player.hidden = false;
      loadButton.disabled = true;
      setElementLocalization(loadButton, 'Video loaded below', 'تم تحميل الفيديو أدناه');
    });
  });


  // Load official X post widgets only after a visitor acknowledges each card's content/context note.
  const xWidgetsUrl = 'https://platform.x.com/widgets.js';
  let xWidgetsPromise = null;

  function loadXWidgets() {
    if (window.twttr && window.twttr.widgets) return Promise.resolve(window.twttr);
    if (!xWidgetsPromise) {
      xWidgetsPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = xWidgetsUrl;
        script.async = true;
        script.charset = 'utf-8';
        script.onload = () => {
          if (window.twttr && window.twttr.widgets) resolve(window.twttr);
          else reject(new Error('X widgets did not initialize'));
        };
        script.onerror = () => reject(new Error('Could not load X widgets'));
        document.head.appendChild(script);
      }).catch((error) => {
        xWidgetsPromise = null;
        throw error;
      });
    }
    return xWidgetsPromise;
  }

  document.querySelectorAll('.story-x-video-card[data-x-post-url]').forEach((card) => {
    const consent = card.querySelector('.story-video-ack');
    const loadButton = card.querySelector('[data-x-load-button="true"]');
    const player = card.querySelector('.story-x-player');
    if (!consent || !loadButton || !player) return;

    loadButton.disabled = !consent.checked;
    consent.addEventListener('change', () => {
      loadButton.disabled = !consent.checked || Boolean(player.querySelector('iframe'));
    });

    loadButton.addEventListener('click', async () => {
      if (!consent.checked || player.querySelector('iframe')) return;
      const postUrl = card.getAttribute('data-x-post-url') || '';
      if (!/^https:\/\/x\.com\/[A-Za-z0-9_]+\/status\/[0-9]+$/.test(postUrl)) return;

      const blockquote = document.createElement('blockquote');
      blockquote.className = 'twitter-tweet';
      blockquote.setAttribute('data-theme', 'dark');
      const link = document.createElement('a');
      link.href = postUrl;
      link.setAttribute('data-en', 'Open original post on X');
      link.setAttribute('data-ar', 'افتح المنشور الأصلي على إكس');
      link.textContent = textForLocale('Open original post on X', 'افتح المنشور الأصلي على إكس');
      blockquote.appendChild(link);
      player.replaceChildren(blockquote);
      player.hidden = false;
      loadButton.disabled = true;
      setElementLocalization(loadButton, 'Loading original X post…', 'جارٍ تحميل منشور إكس...');

      try {
        const twttr = await loadXWidgets();
        await twttr.widgets.load(player);
        if (player.querySelector('iframe')) {
          setElementLocalization(loadButton, 'Original X post loaded above', 'تم تحميل منشور إكس الأصلي أعلاه');
        } else {
          player.hidden = true;
          player.replaceChildren();
          loadButton.disabled = false;
          setElementLocalization(loadButton, 'Embed unavailable — use the source link below', 'تعذّر التضمين؛ افتح المصدر أدناه');
        }
      } catch (_) {
        player.hidden = true;
        player.replaceChildren();
        loadButton.disabled = false;
        setElementLocalization(loadButton, 'Embed unavailable — use the source link below', 'تعذّر التضمين؛ افتح المصدر أدناه');
      }
    });
  });

  revealStoryPage();
})();