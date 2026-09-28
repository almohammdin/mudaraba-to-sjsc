(() => {
  'use strict';
  const links = [...document.querySelectorAll('.links a[href^="#"]')];
  function activeLink() {
    let current = '';
    links.forEach(link => { const node = document.querySelector(link.getAttribute('href')); if (node && node.offsetTop <= scrollY + 120) current = link.getAttribute('href'); });
    links.forEach(link => link.classList.toggle('active', link.getAttribute('href') === current));
  }
  window.addEventListener('scroll', activeLink, { passive: true }); activeLink();
  const modes = {
    company: ['شركة مساهمة مبسطة','المستثمر يدخل كمساهم والشركة تملك الفرصة','شركة مشروع','رأس المال يدخل إلى الشركة، والشركة تملك الأصل أو الحصة وتتصرف باسمها. ويصمم النظام الأساس الإدارة والتصويت وفئات الأسهم والتخارج.'],
    fund: ['صندوق استثماري','المستثمر يملك وحدات في برنامج استثماري','استثمار جماعي','يدار الصندوق وفق الإطار التنظيمي وشروطه، ويشارك المستثمرون في نتائج استثماراته بحسب حقوق الوحدات.']
  };
  const buttons = [...document.querySelectorAll('[data-structure]')];
  function choose(key) {
    ['structureEy','structureTitle','structureTag','structureSummary'].forEach((id,i) => document.getElementById(id).textContent = modes[key][i]);
    buttons.forEach(button => { const on = button.dataset.structure === key; button.classList.toggle('active', on); button.setAttribute('aria-selected', String(on)); button.tabIndex = on ? 0 : -1; });
    document.querySelectorAll('#structureTable tr').forEach(row => [...row.children].forEach((cell,i) => cell.classList.toggle('activeCol', i === (key === 'company' ? 1 : 2))));
  }
  buttons.forEach((button, i) => {
    button.addEventListener('click', () => choose(button.dataset.structure));
    button.addEventListener('keydown', event => {
      if (!['ArrowRight','ArrowLeft','Home','End'].includes(event.key)) return;
      event.preventDefault(); const index = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (i + (event.key === 'ArrowLeft' ? 1 : -1) + buttons.length) % buttons.length;
      buttons[index].focus(); choose(buttons[index].dataset.structure);
    });
  });
  choose('company');
})();
