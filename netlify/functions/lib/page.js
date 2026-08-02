export function renderPage({ title, body }) {
  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <link rel="stylesheet" href="/css/main.css" />
  </head>
  <body>
    ${body}
  </body>
</html>`;
}
