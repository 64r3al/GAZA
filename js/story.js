(() => {
  'use strict';

  const root = document.documentElement;
  const languageButton = document.getElementById('story-language');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function setLanguage(nextLanguage) {
    const language = nextLanguage === 'ar' ? 'ar' : 'en';
    root.lang = language;
    root.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-en][data-ar]').forEach((element) => {
      element.textContent = element.getAttribute('data-' + language);
    });
    document.querySelectorAll('[data-en-alt][data-ar-alt]').forEach((element) => {
      element.alt = element.getAttribute('data-' + language + '-alt');
    });
    if (languageButton) {
      languageButton.setAttribute('aria-label', language === 'en' ? 'Switch language to Arabic' : 'حوّل اللغة إلى الإنجليزية');
    }
    document.title = language === 'en'
      ? 'A hard pill to swallow | NOOR Field Notes'
      : 'حقيقة يصعب تقبّلها | ملاحظات نور الميدانية';
    try { localStorage.setItem('noor-language', language); } catch (_) { /* Storage can be disabled. */ }
  }

  if (languageButton) languageButton.addEventListener('click', () => setLanguage(root.lang === 'en' ? 'ar' : 'en'));
  try {
    if (localStorage.getItem('noor-language') === 'ar') setLanguage('ar');
  } catch (_) { /* Default to English when storage is unavailable. */ }

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
    label.textContent = root.lang === 'ar' ? 'نور // ملاحظات ميدانية 001' : 'NOOR // FIELD NOTES 001';

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
      loadButton.setAttribute('data-en', 'Video loaded below');
      loadButton.setAttribute('data-ar', 'تم تحميل الفيديو أدناه');
      loadButton.textContent = root.lang === 'ar' ? 'تم تحميل الفيديو أدناه' : 'Video loaded below';
    });
  });


  revealStoryPage();
})();