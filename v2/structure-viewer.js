/* Expand the existing learning section without duplicating its live state. */
(() => {
  'use strict';
  const root = document.getElementById('structureLearning');
  if (!root) return;
  const header = root.querySelector('.edu-header');
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'edu-fullscreen';
  button.setAttribute('aria-controls', root.id);
  button.setAttribute('aria-expanded', 'false');
  const expandIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/></svg>';
  const closeIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>';
  header.append(button);
  const reading = document.createElement('aside');
  reading.className = 'edu-reading-panel';
  reading.setAttribute('aria-label', 'شرح الرسم');
  const readingToggle = document.createElement('button');
  readingToggle.type = 'button';
  readingToggle.className = 'edu-reading-toggle';
  readingToggle.textContent = 'شرح الرسم';
  readingToggle.setAttribute('aria-controls', 'eduFullscreenReading');
  readingToggle.setAttribute('aria-expanded', 'false');
  reading.id = 'eduFullscreenReading';
  const readingClose = document.createElement('button');
  readingClose.type = 'button';
  readingClose.className = 'edu-reading-close';
  readingClose.textContent = 'العودة إلى الرسم';
  reading.append(readingClose);
  header.append(readingToggle);
  let moved = [];
  function setReading(open) {
    root.classList.toggle('edu-reading-open', open);
    readingToggle.setAttribute('aria-expanded', String(open));
    if (open) readingClose.focus({preventScroll:true});
    else readingToggle.focus({preventScroll:true});
  }
  readingToggle.addEventListener('click', () => setReading(!root.classList.contains('edu-reading-open')));
  readingClose.addEventListener('click', () => setReading(false));
  function setExpandedLayout(on) {
    if (on && !moved.length) {
      for (const selector of ['#eduDetail','#eduCaption','#eduSequence','#eduInsight']) {
        const element = root.querySelector(selector);
        const marker = document.createComment('fullscreen return position');
        element.before(marker);
        moved.push([element, marker]);
        reading.append(element);
      }
      root.querySelector('.edu-layout').append(reading);
    } else if (!on && moved.length) {
      for (const [element, marker] of moved) { marker.replaceWith(element); }
      moved = [];
      reading.remove();
      root.classList.remove('edu-reading-open');
      readingToggle.setAttribute('aria-expanded', 'false');
    }
    requestAnimationFrame(() => root.dispatchEvent(new Event('edu:layout')));
  }
  let fallback = false, busy = false, savedScroll = 0, previousOverflow = '';
  let previousRole = null, previousModal = null, inertSiblings = [];
  const active = () => document.fullscreenElement === root || fallback;
  function update() {
    const on = active();
    root.classList.toggle('edu-expanded', on);
    setExpandedLayout(on);
    button.setAttribute('aria-expanded', String(on));
    button.setAttribute('aria-label', on ? 'إغلاق ملء الشاشة' : 'ملء الشاشة');
    button.innerHTML = (on ? closeIcon : expandIcon) + '<span>' + (on ? 'إغلاق ملء الشاشة' : 'ملء الشاشة') + '</span>';
    // Existing ResizeObserver redraws lines against the resized nodes.
    requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
  }
  function fallbackOpen() {
    savedScroll = window.scrollY;
    previousOverflow = document.body.style.overflow;
    previousRole = root.getAttribute('role');
    previousModal = root.getAttribute('aria-modal');
    inertSiblings = [];
    let branch = root;
    while (branch.parentElement) {
      for (const sibling of branch.parentElement.children) {
        if (sibling !== branch && !['SCRIPT','STYLE','LINK'].includes(sibling.tagName)) {
          inertSiblings.push([sibling, sibling.inert]);
          sibling.inert = true;
        }
      }
      if (branch.parentElement === document.body) break;
      branch = branch.parentElement;
    }
    fallback = true;
    root.classList.add('edu-fullscreen-fallback');
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    document.body.style.overflow = 'hidden';
    root.scrollTop = 0;
    update();
    button.focus({preventScroll:true});
  }
  function fallbackClose() {
    fallback = false;
    root.classList.remove('edu-fullscreen-fallback');
    for (const [sibling, wasInert] of inertSiblings) sibling.inert = wasInert;
    inertSiblings = [];
    document.body.style.overflow = previousOverflow;
    if (previousRole === null) root.removeAttribute('role'); else root.setAttribute('role', previousRole);
    if (previousModal === null) root.removeAttribute('aria-modal'); else root.setAttribute('aria-modal', previousModal);
    update();
    window.scrollTo({top:savedScroll, behavior:'instant'});
    button.focus({preventScroll:true});
  }
  button.addEventListener('click', async () => {
    if (busy) return;
    busy = true;
    try {
      if (fallback) { fallbackClose(); return; }
      if (document.fullscreenElement === root) { await document.exitFullscreen(); return; }
      if (root.requestFullscreen && document.fullscreenEnabled) {
        try { await root.requestFullscreen(); root.scrollTop = 0; button.focus({preventScroll:true}); return; }
        catch (_) { /* Use the same expanded view when native fullscreen is unavailable. */ }
      }
      fallbackOpen();
    } finally { busy = false; }
  });
  document.addEventListener('fullscreenchange', () => {
    update();
    if (!document.fullscreenElement) button.focus({preventScroll:true});
  });
  root.addEventListener('keydown', event => {
    if (!active() || event.defaultPrevented) return;
    if (event.key === 'Escape' && root.classList.contains('edu-reading-open')) { event.preventDefault(); setReading(false); return; }
    if (event.key === 'Escape' && fallback) { event.preventDefault(); fallbackClose(); return; }
    if (event.key !== 'Tab') return;
    const focusable = [...root.querySelectorAll('button,a[href],input,select,textarea,summary,[tabindex="0"]')]
      .filter(el => !el.disabled && !el.closest('[hidden]') && el.getClientRects().length);
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  update();
})();
