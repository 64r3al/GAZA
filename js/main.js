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

  function translateUi(source) {
    return window.NOORLocalization ? window.NOORLocalization.translate(source, language) : source;
  }

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
    pauseButton.setAttribute('aria-label', translateUi(feedback.en[paused ? 'play' : 'pause']));
    Array.from(dotsContainer.children).forEach((dot, index) => { dot.setAttribute('aria-label', language === 'en' ? 'Show image ' + (index + 1) : 'عرض الصورة ' + (index + 1)); });
    copyButton.textContent = copyLabel[language];
    document.querySelectorAll('.footer-bottom p').forEach((paragraph) => {
      paragraph.textContent = paragraph.textContent.replace(/2026/g, String(currentYear));
    });
    try { localStorage.setItem('noor-language', language); } catch (_) { /* Storage can be disabled. */ }
    updateShareLinks();
  }

  // Legacy two-language toggle remains available only on markup that still uses it.
  // The site-wide locale selector is owned by js/i18n.js.
  if (languageButton) {
    languageButton.addEventListener('click', () => setLanguage(language === 'en' ? 'ar' : 'en'));
    try {
      if (localStorage.getItem('noor-language') === 'ar') setLanguage('ar');
    } catch (_) { /* Default to English when storage is unavailable. */ }
  }

  document.addEventListener('noor:languagechange', (event) => {
    language = event.detail && event.detail.language || document.documentElement.lang || 'en';
    const localize = (source) => window.NOORLocalization ? window.NOORLocalization.translate(source, language) : source;
    menuButton.setAttribute('aria-label', localize(nav.classList.contains('is-open') ? 'Close navigation' : 'Open navigation'));
    pauseButton.setAttribute('aria-label', localize(feedback.en[paused ? 'play' : 'pause']));
    Array.from(dotsContainer.children).forEach((dot, index) => {
      dot.setAttribute('aria-label', localize('Show image') + ' ' + (index + 1));
    });
    copyButton.textContent = localize('Copy page link');
    updateShareLinks();
  });

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
    pauseButton.setAttribute('aria-label', translateUi(feedback.en[paused ? 'play' : 'pause']));
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
    const shareText = translateUi('NOOR — a light for every child. Learn more and find official ways to help.');

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
          shareStatus.textContent = translateUi(feedback.en.copied);
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
      shareStatus.textContent = translateUi(feedback.en.copied);
    } catch (_) {
      shareStatus.textContent = translateUi(feedback.en.failed);
    }
  }
  copyButton.addEventListener('click', copyPageLink);

  // A restrained CRT warning sits between the navigation link and the documented story.
  // It uses the site's existing language preference and never claims to profile visitors.
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
      const isArabic = language === 'ar';
      const overlay = document.createElement('div');
      overlay.className = 'noor-warning-screen';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('tabindex', '-1');
      overlay.setAttribute('aria-labelledby', 'noor-warning-title');
      overlay.setAttribute('aria-describedby', 'noor-warning-copy');
      overlay.setAttribute('lang', isArabic ? 'ar' : 'en');
      overlay.setAttribute('dir', isArabic ? 'rtl' : 'ltr');

      const frame = document.createElement('section');
      frame.className = 'noor-warning-screen__frame';

      const signalRow = document.createElement('div');
      signalRow.className = 'noor-warning-screen__signal-row';
      signalRow.setAttribute('aria-hidden', 'true');
      const signal = document.createElement('span');
      signal.className = 'noor-warning-screen__signal';
      const metadata = document.createElement('span');
      metadata.className = 'noor-warning-screen__meta';
      metadata.textContent = isArabic ? 'نور // تنبيه محتوى حساس // 001' : 'NOOR // SENSITIVE CONTENT NOTICE // 001';
      signalRow.append(signal, metadata);

      const title = document.createElement('h2');
      title.className = 'noor-warning-screen__title';
      title.id = 'noor-warning-title';
      title.textContent = isArabic ? 'تحذير من محتوى حساس' : 'CONTENT WARNING';

      const subhead = document.createElement('p');
      subhead.className = 'noor-warning-screen__subhead';
      subhead.textContent = isArabic ? 'قد تكون المواد التالية مؤلمة أو مزعجة' : 'SENSITIVE MATERIAL AHEAD // READER DISCRETION ADVISED';

      const copy = document.createElement('div');
      copy.className = 'noor-warning-screen__copy';
      copy.id = 'noor-warning-copy';

      const lineOne = document.createElement('p');
      lineOne.className = 'noor-warning-screen__lead';
      lineOne.textContent = isArabic
        ? 'تتناول هذه التجربة الحرب في غزة، والوفاة، وفقدان أفراد الأسرة أو الانفصال عنهم، والنزوح، والإصابات، والظروف الإنسانية القاسية.'
        : 'This experience discusses the war in Gaza, death, family loss or separation, displacement, injuries, and severe humanitarian conditions.';

      const lineTwo = document.createElement('p');
      lineTwo.textContent = isArabic
        ? 'قد تشير بعض التقارير أو الشهادات المرتبطة إلى الدم أو تفاصيل أخرى مؤلمة. قد تكون القصص أو الصور المرتبطة صعبة المشاهدة أو القراءة.'
        : 'Some linked reports or personal accounts may refer to blood or other distressing details. Stories or images in related sources may be difficult to read or view.';

      const lineThree = document.createElement('p');
      lineThree.textContent = isArabic
        ? 'المحتوى موثّق ويهدف إلى التوعية، وليس إلى الصدمة. تابع فقط إذا كنت مستعداً، ويمكنك التوقف أو المغادرة في أي وقت.'
        : 'The material is sourced to inform and bear witness, not to shock. Continue only if you feel ready; you can pause or leave at any time.';

      copy.append(lineOne, lineTwo, lineThree);

      const note = document.createElement('p');
      note.className = 'noor-warning-screen__note';
      note.textContent = isArabic
        ? 'خذ وقتك. سلامتك وراحتك أهم من المتابعة.'
        : 'TAKE YOUR TIME. YOUR WELL-BEING MATTERS MORE THAN CONTINUING.';

      const actions = document.createElement('div');
      actions.className = 'noor-warning-screen__actions';
      const continueButton = document.createElement('button');
      continueButton.type = 'button';
      continueButton.className = 'noor-warning-screen__continue';
      continueButton.disabled = true;
      continueButton.textContent = isArabic ? 'متابعة إلى القصص' : 'CONTINUE TO THE STORIES';
      const returnButton = document.createElement('button');
      returnButton.type = 'button';
      returnButton.className = 'noor-warning-screen__return';
      returnButton.textContent = isArabic ? 'العودة إلى نور' : 'RETURN TO NOOR';
      actions.append(continueButton, returnButton);

      const confirmation = document.createElement('div');
      confirmation.className = 'noor-warning-screen__confirmation';
      const acknowledgement = document.createElement('input');
      acknowledgement.type = 'checkbox';
      acknowledgement.id = 'noor-warning-confirm';
      acknowledgement.className = 'noor-warning-screen__checkbox';
      const confirmationLabel = document.createElement('label');
      confirmationLabel.htmlFor = acknowledgement.id;
      confirmationLabel.textContent = isArabic
        ? 'قرأت التحذير وأختار المتابعة إلى القصص.'
        : 'I have read this warning and choose to continue to the stories.';
      confirmation.append(acknowledgement, confirmationLabel);

      const footer = document.createElement('div');
      footer.className = 'noor-warning-screen__footer';
      footer.textContent = isArabic ? 'ملاحظات ميدانية 001 // شهادات ومصادر موثّقة // لا يوجد صوت تلقائي' : 'FIELD NOTES 001 // DOCUMENTED SOURCES // NO AUTO-PLAY AUDIO';

      // This terminal sequence is a visual introduction to the warning, not a visitor scan.
      const bootPanel = document.createElement('div');
      bootPanel.className = 'noor-warning-screen__boot';
      bootPanel.setAttribute('aria-hidden', 'true');
      const bootHeader = document.createElement('div');
      bootHeader.className = 'noor-warning-screen__boot-header';
      const bootMark = document.createElement('span');
      bootMark.className = 'noor-warning-screen__boot-mark';
      bootMark.textContent = 'NOOR';
      const bootMeta = document.createElement('span');
      bootMeta.className = 'noor-warning-screen__boot-meta';
      bootMeta.textContent = isArabic ? 'سجل ميداني / محطة 001' : 'FIELD ARCHIVE / TERMINAL 001';
      bootHeader.append(bootMark, bootMeta);

      const bootIntro = document.createElement('p');
      bootIntro.className = 'noor-warning-screen__boot-intro';
      bootIntro.textContent = isArabic ? 'جارٍ فتح ملف التوعية' : 'OPENING THE HUMANITARIAN FIELD ARCHIVE';

      const bootTerminal = document.createElement('div');
      bootTerminal.className = 'noor-warning-screen__boot-terminal';
      const bootCopy = isArabic
        ? [
            '> نور // جلسة جديدة',
            '> الفهرس: الحرب / الفقد / النزوح',
            '> المصادر: تقارير وشهادات موثّقة',
            '> تنبيه المحتوى: مواد حساسة',
            '> الخطوة التالية: تأكيد القارئ'
          ]
        : [
            '> NOOR // FIELD NOTES SESSION',
            '> INDEX: WAR / LOSS / DISPLACEMENT',
            '> SOURCES: REPORTS AND TESTIMONIES',
            '> CONTENT NOTICE: SENSITIVE MATERIAL',
            '> NEXT STEP: READER ACKNOWLEDGEMENT'
          ];
      const bootRows = bootCopy.map((line, index) => {
        const row = document.createElement('p');
        row.className = 'noor-warning-screen__boot-line';
        row.dataset.line = String(index);
        bootTerminal.appendChild(row);
        return { row, line };
      });

      const bootProgress = document.createElement('div');
      bootProgress.className = 'noor-warning-screen__boot-progress';
      bootProgress.setAttribute('role', 'presentation');
      const bootProgressFill = document.createElement('span');
      bootProgressFill.className = 'noor-warning-screen__boot-progress-fill';
      bootProgress.appendChild(bootProgressFill);
      const bootStatus = document.createElement('p');
      bootStatus.className = 'noor-warning-screen__boot-status';
      bootStatus.textContent = isArabic ? 'بانتظار موافقة القارئ' : 'AWAITING READER ACKNOWLEDGEMENT';
      bootPanel.append(bootHeader, bootIntro, bootTerminal, bootProgress, bootStatus);

      frame.append(signalRow, title, subhead, copy, note, confirmation, actions, footer);
      Array.from(frame.children).forEach((element, index) => {
        element.style.setProperty('--warning-order', String(index));
      });
      const warningReady = { value: reduceMotion.matches };
      if (!warningReady.value) frame.classList.add('is-pending');
      overlay.appendChild(frame);
      if (!warningReady.value) {
        overlay.classList.add('is-booting');
        overlay.appendChild(bootPanel);
      } else {
        overlay.classList.add('is-ready');
      }
      document.body.appendChild(overlay);
      document.body.classList.add('noor-warning-open');
      overlay.focus({ preventScroll: true });

      async function runBootSequence() {
        const wait = (duration) => new Promise((resolve) => window.setTimeout(resolve, duration));
        for (let index = 0; index < bootRows.length; index += 1) {
          const entry = bootRows[index];
          if (!overlay.isConnected) return;
          entry.row.classList.add('is-typing');
          for (let character = 1; character <= entry.line.length; character += 1) {
            if (!overlay.isConnected) return;
            entry.row.textContent = entry.line.slice(0, character);
            await wait(7 + (index % 2) * 2);
          }
          entry.row.classList.remove('is-typing');
          entry.row.classList.add('is-complete');
          bootProgressFill.style.width = Math.round(((index + 1) / bootRows.length) * 100) + '%';
          await wait(72);
        }
        await wait(180);
        if (!overlay.isConnected) return;

        warningReady.value = true;
        overlay.classList.remove('is-booting');
        overlay.classList.add('is-ready');
        frame.classList.remove('is-pending');
        acknowledgement.focus({ preventScroll: true });
        window.setTimeout(() => {
          if (bootPanel.isConnected) bootPanel.remove();
        }, 460);
      }

      if (!warningReady.value) runBootSequence();

      function closeWarning() {
        if (!overlay.isConnected) return;
        overlay.remove();
        document.body.classList.remove('noor-warning-open');
        thresholdTransitionActive = false;
        thresholdLink.focus({ preventScroll: true });
      }

      acknowledgement.addEventListener('change', () => {
        continueButton.disabled = !acknowledgement.checked;
      });

      overlay.addEventListener('keydown', (keyEvent) => {
        if (keyEvent.key === 'Escape') {
          keyEvent.preventDefault();
          closeWarning();
          return;
        }
        if (keyEvent.key !== 'Tab') return;
        if (!warningReady.value) {
          keyEvent.preventDefault();
          overlay.focus({ preventScroll: true });
          return;
        }
        const activeElement = document.activeElement;
        if (keyEvent.shiftKey && activeElement === acknowledgement) {
          keyEvent.preventDefault();
          returnButton.focus();
        } else if (!keyEvent.shiftKey && activeElement === returnButton) {
          keyEvent.preventDefault();
          if (continueButton.disabled) acknowledgement.focus();
          else continueButton.focus();
        } else if (keyEvent.shiftKey && activeElement === continueButton) {
          keyEvent.preventDefault();
          acknowledgement.focus();
        }
      });
      returnButton.addEventListener('click', closeWarning);

      continueButton.addEventListener('click', () => {
        if (!overlay.isConnected || !acknowledgement.checked) return;
        overlay.remove();
        document.body.classList.remove('noor-warning-open');
        try { sessionStorage.setItem('noor-story-arrival', '1'); } catch (_) { /* Storage may be disabled. */ }

        if (reduceMotion.matches) {
          window.location.href = destination;
          return;
        }

        const pixelOverlay = document.createElement('div');
        pixelOverlay.className = 'noor-pixel-exit';
        pixelOverlay.setAttribute('aria-hidden', 'true');
        const grid = document.createElement('div');
        grid.className = 'noor-pixel-exit__grid';

        const columns = Math.min(48, Math.max(10, Math.ceil(window.innerWidth / 44)));
        const rows = Math.min(28, Math.max(8, Math.ceil(window.innerHeight / Math.max(1, window.innerWidth / columns))));
        grid.style.gridTemplateColumns = 'repeat(' + columns + ', minmax(0, 1fr))';
        grid.style.gridTemplateRows = 'repeat(' + rows + ', minmax(0, 1fr))';
        const centerX = (columns - 1) / 2;
        const centerY = (rows - 1) / 2;
        const maxDistance = Math.max(1, Math.hypot(centerX, centerY));

        for (let row = 0; row < rows; row += 1) {
          for (let column = 0; column < columns; column += 1) {
            const pixel = document.createElement('span');
            pixel.className = 'noor-pixel-exit__cell tone-' + ((row * 3 + column) % 4);
            const distance = Math.hypot(column - centerX, row - centerY) / maxDistance;
            pixel.style.setProperty('--pixel-delay', (distance * 0.34).toFixed(3) + 's');
            grid.appendChild(pixel);
          }
        }

        const label = document.createElement('div');
        label.className = 'noor-pixel-exit__label';
        const indexLabel = document.createElement('p');
        indexLabel.className = 'noor-pixel-exit__index';
        indexLabel.textContent = isArabic ? 'نور // ملاحظات ميدانية 001' : 'NOOR // FIELD NOTES 001';
        const message = document.createElement('p');
        message.className = 'noor-pixel-exit__message';
        message.textContent = isArabic ? 'ما وراء العناوين' : 'LOOK BEYOND THE HEADLINE';
        label.append(indexLabel, message);

        pixelOverlay.append(grid, label);
        document.body.appendChild(pixelOverlay);
        document.body.classList.add('pixel-transition-active');
        window.setTimeout(() => {
          window.location.href = destination;
        }, 920);
      });
    });
  }

  document.querySelectorAll('.footer-bottom p').forEach((paragraph) => {
    paragraph.innerHTML = paragraph.innerHTML.replace(/2026/g, String(currentYear));
  });
})();