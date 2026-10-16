# NOOR — A light for every child

A responsive, bilingual (English/Arabic) static awareness page for humanitarian support for children affected by the crisis in Gaza.

## Run locally

No build step or package installation is required. From this folder, run a static server, for example:

```bash
python -m http.server 8000
```

Then open <http://localhost:8000>.

## Project structure

- `index.html` — page structure, copy and official resource links
- `css/style.css` — responsive visual styles and reduced-motion support
- `js/main.js` — language toggle, mobile navigation, carousel, share and copy actions
- `assets/hero/` — optimized WebP photography supplied with the project
- `scripts/check_site.py` — local asset, anchor and unfinished-placeholder checks
- `.github/workflows/` — automated quality checks and GitHub Pages deployment

## Important transparency notes

NOOR is an independent awareness page and is **not affiliated with, endorsed by, or sponsored by UNICEF**. It does not collect donations, process payments, or store donor details. Donation buttons lead to UNICEF's official website so visitors can review the appeal and terms there.

The images were supplied with the project. Confirm their original source, date, photographer credit and reuse permissions before promoting the site widely. Do not add unverified statistics, donation amounts, claims of delivery, or fabricated ledger entries.

## Publish with GitHub Pages

The Pages workflow publishes the static site on pushes to `main`. In the repository’s **Settings → Pages**, select **GitHub Actions** as the build and deployment source if GitHub Pages has not already been enabled for the repository. Once deployment finishes, GitHub Actions will show the published URL.

## Checks

```bash
node --check js/main.js
python scripts/check_site.py
```