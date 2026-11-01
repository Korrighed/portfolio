// Connexion enseignant dans une fenetre : le lien « Espace enseignant » ouvre le <dialog>.
// Sans JavaScript, le lien mene a /login.html (page de repli).
const dialog = document.querySelector('#login-dialog');

if (dialog && typeof dialog.showModal === 'function') {
  const form = dialog.querySelector('form');
  const input = dialog.querySelector('#login-code');
  const error = dialog.querySelector('#login-error');
  const submit = dialog.querySelector('.login__submit');

  const open = () => {
    form.reset();
    error.hidden = true;
    dialog.showModal();
    input.focus();
  };

  document.querySelectorAll('a[href="/login.html"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      open();
    });
  });

  dialog.querySelector('[data-login-close]').addEventListener('click', () => dialog.close());
  // Un clic sur le fond (le <dialog> lui-meme, sans marge interne) ferme la fenetre.
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    error.hidden = true;
    submit.disabled = true;
    try {
      // /api/login repond par une redirection : succes vers /fiches-reflexives, echec vers /login.html?error=1.
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(form)),
        credentials: 'same-origin',
      });
      if (response.ok && new URL(response.url).pathname.startsWith('/fiches-reflexives')) {
        location.assign('/fiches-reflexives');
        return;
      }
      error.textContent = 'Code incorrect.';
    } catch {
      error.textContent = 'Connexion impossible, réessayez.';
    }
    error.hidden = false;
    submit.disabled = false;
    input.select();
  });

  // Arrivee depuis /login.html (acces refuse a une page protegee) : on ouvre la fenetre.
  if (new URLSearchParams(location.search).has('connexion')) {
    history.replaceState(null, '', location.pathname + location.hash);
    open();
  }
}
