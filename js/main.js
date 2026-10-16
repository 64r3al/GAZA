(() => {
  'use strict';

  const html = document.documentElement;
  const languageButton = document.getElementById('lang');
  const menuButton = document.getElementById('menu');
  const nav = document.getElementById('nav');
  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dotsContainer = document.getElementById('dots');
  const pauseButton = document.getElementById('pause');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const copyButton = document.getElementById('copy-link');
  const shareStatus = document.getElementById('share-status');
  const copyLabel = { en: 'Copy page link', ar: 'انسخ رابط الصفحة' };
  const currentYear = new Date().getFullYear();
  const feedback = {
    en: { copied: 'Link copied.', failed: 'Copy was unavailable. Copy the page address from your browser.', pause: 'Pause slideshow', play: 'Play slideshow' },
    ar: { copied: 'تم نسخ الرابط.', failed: 'تعذّر النسخ. انسخ عنوان الصفحة من المتصفح.', pause: 'إيقاف عرض الصور مؤقتاً', play: 'تشغيل عرض الصور' }
  };

  let language = 'en';
  let activeSlide = 0;
  let timerId = null;
  const hero = document.querySelector('.hero');
  let pointerInsideHero = false;
  let focusInsideHero = false;
  let paused = reduceMotion.matches;

  // Motion is progressive enhancement: content stays visible if scripts fail,
  // IntersectionObserver is unavailable, or the visitor prefers reduced motion.
  let revealObserver = null;
  function syncMotionPreference() {
    if (reduceMotion.matches) {
      if (revealObserver) revealObserver.disconnect();
      revealObserver = null;
      html.classList.remove('motion-ready');
      document.querySelectorAll('.motion-reveal').forEach((element) => {
        element.classList.remove('motion-reveal', 'is-revealed');
        element.style.removeProperty('--reveal-delay');
      });
      return;
    }

    html.classList.add('motion-ready');
    if (!('IntersectionObserver' in window) || revealObserver) return;

    const revealTargets = Array.from(document.querySelectorAll(
      '.section-heading > *, .photo-card, .support-card, ' +
      '.response-card, .response-source, .transparency-panel > *, .learn-inner > *, .footer-inner > *'
    ));
    revealTargets.forEach((element, index) => {
      element.classList.add('motion-reveal');
      element.style.setProperty('--reveal-delay', ((index % 3) * 95) + 'ms');
    });

    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -7% 0px', threshold: 0.12 });

    revealTargets.forEach((element) => revealObserver.observe(element));
  }

  syncMotionPreference();

  function setLanguage(nextLanguage) {
    language = nextLanguage === 'ar' ? 'ar' : 'en';
    html.lang = language;
    html.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-en][data-ar]').forEach((element) => {
      element.textContent = element.getAttribute('data-' + language);
    });
    document.querySelectorAll('[data-en-alt][data-ar-alt]').forEach((element) => {
      element.alt = element.getAttribute('data-' + language + '-alt');
    });
    languageButton.setAttribute('aria-label', language === 'en' ? 'Switch language to Arabic' : 'حوّل اللغة إلى الإنجليزية');
    menuButton.setAttribute('aria-label', language === 'en' ? (nav.classList.contains('is-open') ? 'Close navigation' : 'Open navigation') : (nav.classList.contains('is-open') ? 'إغلاق القائمة' : 'فتح القائمة'));
    pauseButton.setAttribute('aria-label', feedback[language][paused ? 'play' : 'pause']);
    Array.from(dotsContainer.children).forEach((dot, index) => { dot.setAttribute('aria-label', language === 'en' ? 'Show image ' + (index + 1) : 'عرض الصورة ' + (index + 1)); });
    copyButton.textContent = copyLabel[language];
    document.querySelectorAll('.footer-bottom p').forEach((paragraph) => {
      paragraph.textContent = paragraph.textContent.replace(/2026/g, String(currentYear));
    });
    try { localStorage.setItem('noor-language', language); } catch (_) { /* Storage can be disabled. */ }
    updateShareLinks();
  }

  languageButton.addEventListener('click', () => setLanguage(language === 'en' ? 'ar' : 'en'));
  try {
    if (localStorage.getItem('noor-language') === 'ar') setLanguage('ar');
  } catch (_) { /* Default to English when storage is unavailable. */ }

  function closeMenu() {
    nav.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', language === 'en' ? 'Open navigation' : 'فتح القائمة');
  }

  menuButton.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute('aria-label', language === 'en' ? (isOpen ? 'Close navigation' : 'Open navigation') : (isOpen ? 'إغلاق القائمة' : 'فتح القائمة'));
  });
  nav.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.classList.contains('is-open')) {
      closeMenu();
      menuButton.focus();
    }
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) closeMenu();
  }, { passive: true });

  function showSlide(index) {
    if (!slides.length) return;
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === activeSlide;
      slide.classList.toggle('is-active', isActive);
      slide.setAttribute('aria-hidden', String(!isActive));
    });
    Array.from(dotsContainer.children).forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === activeSlide);
      dot.setAttribute('aria-current', dotIndex === activeSlide ? 'true' : 'false');
    });
  }

  function stopCarousel() {
    if (timerId !== null) window.clearInterval(timerId);
    timerId = null;
  }
  function startCarousel() {
    stopCarousel();
    if (!paused && !reduceMotion.matches && slides.length > 1 && !document.hidden && !pointerInsideHero && !focusInsideHero) {
      timerId = window.setInterval(() => showSlide(activeSlide + 1), 6000);
    }
  }
  // Hold the slideshow while someone is reading or interacting with the hero.
  if (hero) {
    hero.addEventListener('pointerenter', () => {
      pointerInsideHero = true;
      startCarousel();
    });
    hero.addEventListener('pointerleave', () => {
      pointerInsideHero = false;
      startCarousel();
    });
    hero.addEventListener('focusin', () => {
      focusInsideHero = true;
      startCarousel();
    });
    hero.addEventListener('focusout', (event) => {
      focusInsideHero = Boolean(event.relatedTarget && hero.contains(event.relatedTarget));
      startCarousel();
    });
  }

  function updatePauseButton() {
    pauseButton.textContent = paused ? '▶' : 'Ⅱ';
    pauseButton.setAttribute('aria-pressed', String(paused));
    pauseButton.setAttribute('aria-label', feedback[language][paused ? 'play' : 'pause']);
  }

  slides.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'carousel-dot';
    dot.setAttribute('aria-label', language === 'en' ? 'Show image ' + (index + 1) : 'عرض الصورة ' + (index + 1));
    dot.addEventListener('click', () => { showSlide(index); startCarousel(); });
    dotsContainer.appendChild(dot);
  });
  showSlide(0);
  updatePauseButton();
  startCarousel();

  pauseButton.addEventListener('click', () => {
    paused = !paused;
    updatePauseButton();
    startCarousel();
  });
  document.addEventListener('visibilitychange', startCarousel);
  reduceMotion.addEventListener?.('change', (event) => {
    if (event.matches) paused = true;
    syncMotionPreference();
    updatePauseButton();
    startCarousel();
  });

  if ('IntersectionObserver' in window) {
    const navLinks = Array.from(nav.querySelectorAll('a[href^="#"]'));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          if (link.getAttribute('href') === '#' + entry.target.id) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-38% 0px -54% 0px', threshold: 0 });
    ['need', 'response', 'help', 'ledger', 'learn'].forEach((id) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });
  }

  function getShareableUrl() {
    const url = new URL(window.location.href);
    url.hash = '';
    return url.toString();
  }

  function updateShareLinks() {
    const pageUrl = encodeURIComponent(getShareableUrl());
    const shareText = encodeURIComponent(language === 'en' ? 'NOOR — a light for every child. Learn more and find official ways to help.' : 'نور لكل طفل — تعرّف على طرق المساعدة الرسمية.');
    document.getElementById('share-whatsapp').href = 'https://wa.me/?text=' + shareText + '%20' + pageUrl;
    document.getElementById('share-x').href = 'https://x.com/intent/post?text=' + shareText + '&url=' + pageUrl;
    document.getElementById('share-facebook').href = 'https://www.facebook.com/sharer/sharer.php?u=' + pageUrl;
  }
  updateShareLinks();

  async function copyPageLink() {
    const currentUrl = getShareableUrl();
    try {
      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(currentUrl);
          shareStatus.textContent = feedback[language].copied;
          return;
        } catch (_) {
          // Fall through to the compatibility copy method if permission is denied.
        }
      }

      const temporaryInput = document.createElement('textarea');
      temporaryInput.value = currentUrl;
      temporaryInput.setAttribute('readonly', '');
      temporaryInput.setAttribute('aria-hidden', 'true');
      temporaryInput.style.position = 'fixed';
      temporaryInput.style.opacity = '0';
      document.body.appendChild(temporaryInput);

      let successful = false;
      try {
        temporaryInput.select();
        successful = document.execCommand('copy');
      } finally {
        temporaryInput.remove();
      }
      if (!successful) throw new Error('Clipboard copy command failed');
      shareStatus.textContent = feedback[language].copied;
    } catch (_) {
      shareStatus.textContent = feedback[language].failed;
    }
  }
  copyButton.addEventListener('click', copyPageLink);

  document.querySelectorAll('.footer-bottom p').forEach((paragraph) => {
    paragraph.innerHTML = paragraph.innerHTML.replace(/2026/g, String(currentYear));
  });
})();