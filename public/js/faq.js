// Section FAQ : un onglet par question ; la reponse change sur place (aucun decalage).
// Sans JavaScript, les cinq reponses restent visibles a la suite.
const section = document.querySelector('#faq');

if (section) {
  const list = section.querySelector('.faq__tabs');
  const tabs = [...section.querySelectorAll('.faq__tab')];
  const panels = [...section.querySelectorAll('.faq__panel')];

  if (list && tabs.length > 0 && tabs.length === panels.length) {
    section.classList.add('is-tabs');
    list.setAttribute('role', 'tablist');
    list.setAttribute('aria-label', 'Questions fréquentes');

    const wide = window.matchMedia('(min-width: 64rem)');
    const syncOrientation = () => list.setAttribute('aria-orientation', wide.matches ? 'vertical' : 'horizontal');
    syncOrientation();
    wide.addEventListener('change', syncOrientation);

    tabs.forEach((tab, index) => {
      tab.id = `faq-tab-${index + 1}`;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', panels[index].id);
      panels[index].setAttribute('role', 'tabpanel');
      panels[index].setAttribute('aria-labelledby', tab.id);
      panels[index].tabIndex = 0;
      tab.addEventListener('click', () => select(index, false));
    });

    function select(index, focus) {
      tabs.forEach((tab, i) => {
        const on = i === index;
        tab.setAttribute('aria-selected', String(on));
        tab.tabIndex = on ? 0 : -1;
        panels[i].classList.toggle('is-active', on);
      });
      if (focus) tabs[index].focus();
    }

    list.addEventListener('keydown', (event) => {
      const current = tabs.indexOf(document.activeElement);
      if (current === -1) return;
      const last = tabs.length - 1;
      let next = null;
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = current === last ? 0 : current + 1;
      else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = current === 0 ? last : current - 1;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = last;
      if (next === null) return;
      event.preventDefault();
      select(next, true);
    });

    select(0, false);
  }
}
