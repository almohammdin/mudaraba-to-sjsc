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
  let fallback = false, busy = false, savedScroll = 0, previousOverflow = '';
  let previousRole = null, previousModal = null, inertSiblings = [];
  const active = () => document.fullscreenElement === root || fallback;
  function update() {
    const on = active();
    root.classList.toggle('edu-expanded', on);
    button.setAttribute('aria-expanded', String(on));
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
