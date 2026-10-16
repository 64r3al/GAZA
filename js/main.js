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

  // Count the response targets up once when the section first enters view.
  // The semantic text keeps the final figures available even without JavaScript.
  function setupResponseCounters() {
    const counters = Array.from(document.querySelectorAll('.response-number[data-count]'));
    const responseSection = document.getElementById('response');
    if (!counters.length || !responseSection || reduceMotion.matches || !('IntersectionObserver' in window)) return;

    const formatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
    const activeFrames = new Map();
    const staggerTimers = new Set();
    let hasStarted = false;

    function showFinalValues() {
      staggerTimers.forEach((timer) => window.clearTimeout(timer));
      staggerTimers.clear();
      activeFrames.forEach((frameId) => window.cancelAnimationFrame(frameId));
      activeFrames.clear();
      counters.forEach((counter) => {
        const display = counter.querySelector('.response-number-visual');
        const target = Number(counter.dataset.count);
        if (!display || !Number.isFinite(target)) return;
        display.textContent = formatter.format(target);
        display.classList.remove('is-counting');
        display.classList.add('is-counted');
      });
    }

    function animateCounter(counter, index) {
      const display = counter.querySelector('.response-number-visual');
      const target = Number(counter.dataset.count);
      if (!display || !Number.isFinite(target) || target < 0) return;

      const timer = window.setTimeout(() => {
        staggerTimers.delete(timer);
        if (reduceMotion.matches) {
          showFinalValues();
          return;
        }

        // Begin near the target, not zero: these are planned reach targets,
        // and a full-range counter makes large figures feel artificial.
        const duration = 1700;
        const initialProgress = 0.94;
        const startValue = Math.round(target * initialProgress);
        let startTime = null;
        display.textContent = formatter.format(startValue);
        display.classList.remove('is-counted');
        display.classList.add('is-counting');

        function frame(timestamp) {
          if (reduceMotion.matches) {
            showFinalValues();
            return;
          }

          if (startTime === null) startTime = timestamp;
          const progress = Math.min((timestamp - startTime) / duration, 1);
          // Cubic ease-out moves quickly at first, then slows gently into the exact target.
          const easedProgress = 1 - Math.pow(1 - progress, 3);
          const currentValue = startValue + ((target - startValue) * easedProgress);
          display.textContent = formatter.format(Math.round(currentValue));

          if (progress < 1) {
            activeFrames.set(display, window.requestAnimationFrame(frame));
          } else {
            activeFrames.delete(display);
            display.textContent = formatter.format(target);
            display.classList.remove('is-counting');
            display.classList.add('is-counted');
          }
        }

        activeFrames.set(display, window.requestAnimationFrame(frame));
      }, index * 100);

      staggerTimers.add(timer);
    }

    const observer = new IntersectionObserver((entries) => {
      const visible = entries.some((entry) => entry.isIntersecting);
      if (!visible || hasStarted) return;
      hasStarted = true;
      observer.disconnect();
      counters.forEach(animateCounter);
    }, { threshold: 0.05, rootMargin: '0px 0px -8% 0px' });

    observer.observe(responseSection);
    reduceMotion.addEventListener?.('change', (event) => {
      if (event.matches) showFinalValues();
    });
  }

  setupResponseCounters();

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

  // Build fresh, correctly encoded share URLs for the current page and language.
  function updateShareLinks() {
    const pageUrl = getShareableUrl();
    const shareText = language === 'en'
      ? 'NOOR — a light for every child. Learn more and find official ways to help.'
      : 'نور لكل طفل — تعرّف على طرق المساعدة الرسمية.';

    const whatsappUrl = new URL('https://wa.me/');
    whatsappUrl.searchParams.set('text', shareText + ' ' + pageUrl);
    document.getElementById('share-whatsapp').href = whatsappUrl.toString();

    const xUrl = new URL('https://x.com/intent/post');
    xUrl.searchParams.set('text', shareText);
    xUrl.searchParams.set('url', pageUrl);
    document.getElementById('share-x').href = xUrl.toString();

    const facebookUrl = new URL('https://www.facebook.com/sharer/sharer.php');
    facebookUrl.searchParams.set('u', pageUrl);
    document.getElementById('share-facebook').href = facebookUrl.toString();
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

  // A short retro-horror threshold animation plays before opening the reserved page.
  // The destination still opens normally if JavaScript is disabled.
  const thresholdLink = document.querySelector('.nav-feature-link[href="a-hard-pill-to-swallow.html"]');
  let thresholdTransitionActive = false;

  if (thresholdLink) {
    thresholdLink.addEventListener('click', (event) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) return;

      event.preventDefault();
      if (thresholdTransitionActive) return;
      thresholdTransitionActive = true;

      const destination = thresholdLink.href;
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const messages = language === 'ar'
        ? [
            'تم رصد الإشارة',
            'أرشيف مقيّد // 07',
            'لم يكن من المفترض فتح هذا الملف.',
            'لا يزال بإمكانك الرجوع.',
            'الدخول إلى المجهول...'
          ]
        : [
            'SIGNAL DETECTED',
            'RESTRICTED ARCHIVE // 07',
            "THIS FILE WASN'T MEANT TO BE OPENED.",
            'YOU CAN STILL TURN BACK.',
            'ENTERING THE UNKNOWN...'
          ];

      const overlay = document.createElement('div');
      overlay.className = 'noor-threshold';
      overlay.setAttribute('role', 'status');
      overlay.setAttribute('aria-live', 'polite');
      overlay.setAttribute('aria-label', language === 'ar' ? 'انتقال إلى صفحة غامضة' : 'Transition to a mysterious page');

      const scanlines = document.createElement('div');
      scanlines.className = 'noor-threshold__scanlines';
      scanlines.setAttribute('aria-hidden', 'true');

      const panel = document.createElement('div');
      panel.className = 'noor-threshold__panel';

      const eyebrow = document.createElement('p');
      eyebrow.className = 'noor-threshold__eyebrow';
      eyebrow.textContent = language === 'ar' ? 'نور // أرشيف خارج الاتصال' : 'NOOR // OFFLINE ARCHIVE';

      const signal = document.createElement('span');
      signal.className = 'noor-threshold__signal';
      signal.setAttribute('aria-hidden', 'true');

      const label = document.createElement('p');
      label.className = 'noor-threshold__label';
      label.textContent = language === 'ar' ? 'اتصال غير معروف' : 'UNKNOWN CONNECTION';

      const message = document.createElement('p');
      message.className = 'noor-threshold__message';
      message.textContent = messages[0];

      const cursor = document.createElement('span');
      cursor.className = 'noor-threshold__cursor';
      cursor.setAttribute('aria-hidden', 'true');
      cursor.textContent = '_';
      message.appendChild(cursor);

      const progressTrack = document.createElement('div');
      progressTrack.className = 'noor-threshold__progress';
      progressTrack.setAttribute('aria-hidden', 'true');
      const progressFill = document.createElement('span');
      progressFill.className = 'noor-threshold__progress-fill';
      progressTrack.appendChild(progressFill);

      const footer = document.createElement('p');
      footer.className = 'noor-threshold__footer';
      footer.textContent = language === 'ar' ? 'لا تغلق النافذة.' : 'DO NOT CLOSE THIS WINDOW.';

      panel.append(eyebrow, signal, label, message, progressTrack, footer);
      overlay.append(scanlines, panel);
      document.body.appendChild(overlay);
      document.body.classList.add('noor-threshold-active');

      // Keep the sequence atmospheric but brief. Reduced-motion users skip the flicker.
      window.requestAnimationFrame(() => overlay.classList.add('is-live'));

      if (prefersReducedMotion) {
        message.firstChild.textContent = messages[messages.length - 1];
        window.setTimeout(() => { window.location.href = destination; }, 350);
        return;
      }

      const sequenceTimers = [];
      messages.slice(1).forEach((text, index) => {
        const timer = window.setTimeout(() => {
          message.classList.remove('is-glitching');
          message.firstChild.textContent = text;
          void message.offsetWidth;
          message.classList.add('is-glitching');
        }, 520 * (index + 1));
        sequenceTimers.push(timer);
      });

      window.setTimeout(() => {
        window.location.href = destination;
      }, 3150);
    });
  }

  document.querySelectorAll('.footer-bottom p').forEach((paragraph) => {
    paragraph.innerHTML = paragraph.innerHTML.replace(/2026/g, String(currentYear));
  });
})();