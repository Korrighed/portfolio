// Scene a onglets des fiches reflexives (meme balisage que la FAQ de l'accueil, version sombre).
// Les roles ARIA et les changements d'onglet sont poses par /js/faq.js.
const escapeHtml = (text) =>
  String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const pad = (n) => String(n).padStart(2, '0');

const list = (items) => `<ul class="fiche__list">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;

function renderTab(fiche, index) {
  return `          <button class="faq__tab" type="button"><span class="faq__num" aria-hidden="true">${pad(index + 1)}</span><span class="faq__label">${escapeHtml(fiche.title)}</span></button>`;
}

function renderPanel(fiche, index, total) {
  const links = fiche.links
    .map((link) => `<a class="fiche__link" href="${escapeHtml(link.href)}" target="_blank" rel="noopener">${escapeHtml(link.label)} ↗</a>`)
    .join('');
  const pdf = fiche.file
    ? `<a class="fiche__link" href="/api/pdf/${escapeHtml(fiche.id)}" target="_blank" rel="noopener">Ouvrir la fiche (PDF)</a>`
    : '';
  return `            <article class="faq__panel" id="faq-panel-${index + 1}">
              <p class="faq__count" aria-hidden="true">${pad(index + 1)} / ${pad(total)}</p>
              <h2 class="faq__q">${escapeHtml(fiche.title)}</h2>
              <p class="fiche__sub">${escapeHtml(fiche.subtitle)}</p>
              <div class="fiche__cols">
                <section class="fiche__block fiche__block--skills">
                  <h3 class="fiche__h">Compétences</h3>
                  ${list(fiche.competences)}
                </section>
                <section class="fiche__block">
                  <h3 class="fiche__h">Livrables</h3>
                  ${list(fiche.livrables)}
                </section>
              </div>
              <p class="fiche__foot">
                <span class="fiche__status">Statut : ${escapeHtml(fiche.status)}</span>
                <time class="fiche__date" datetime="${escapeHtml(fiche.date)}">${escapeHtml(fiche.date)}</time>
                ${links}${pdf}
              </p>
            </article>`;
}

export function renderFichesScene(fiches, author) {
  const tabs = fiches.map(renderTab).join('\n');
  const panels = fiches.map((fiche, index) => renderPanel(fiche, index, fiches.length)).join('\n');
  return `<section class="faq faq--dark" aria-labelledby="fiches-title">
      <div class="faq__scene">
        <canvas class="faq__bg" aria-hidden="true"></canvas>
        <div class="faq__stage">
          <header class="faq__head">
            <span class="text-eyebrow">Espace enseignant</span>
            <h1 id="fiches-title" class="faq__title">Fiches réflexives</h1>
            <p class="fiches__author">${escapeHtml(author.name)} · ${escapeHtml(author.program)}</p>
          </header>
          <div class="faq__tabs">
${tabs}
          </div>
          <div class="faq__plate">
            <div class="faq__panels">
${panels}
            </div>
          </div>
        </div>
      </div>
    </section>`;
}
