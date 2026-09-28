(() => {
  'use strict';
  const western = window.SJSCNumbers.western;
  function normalizeInput(node) {
    if (!(node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement) || ['password', 'email', 'url', 'file'].includes(node.type)) return;
    const before = node.value, after = western(before);
    if (before === after) return;
    const start = node.selectionStart, end = node.selectionEnd;
    node.value = after;
    if (start !== null) try { node.setSelectionRange(start, end); } catch { /* Range and number controls have no selection. */ }
  }
  // Capture runs before any calculator listener, also for fields created later.
  document.addEventListener('input', event => { if (!event.isComposing) normalizeInput(event.target); }, true);
  document.addEventListener('compositionend', event => {
    normalizeInput(event.target);
    event.target.dispatchEvent(new Event('input', { bubbles: true }));
  }, true);
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('input, textarea').forEach(normalizeInput);
  });
})();
