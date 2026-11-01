const toggle = document.querySelector('.nav__toggle');
const menu = document.getElementById('nav-menu');

toggle?.addEventListener('click', () => {
  const isOpen = menu?.classList.toggle('is-open');
  toggle.setAttribute('aria-expanded', String(Boolean(isOpen)));
});
