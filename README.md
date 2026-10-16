# NOOR — A light for every child

NOOR is an independent, responsive awareness page in English and Arabic, sharing practical ways to learn about humanitarian support for children affected by the crisis in Gaza.

## Run locally

No build step or package installation is required:

```bash
python -m http.server 8000
```

Open <http://localhost:8000>.

## Project structure

- `index.html` — bilingual page, accessible image carousel, official humanitarian links
- `css/style.css` — responsive design, right-to-left layout, reduced-motion support
- `js/main.js` — language toggle, mobile navigation, carousel and sharing controls
- `scripts/check_site.py` — checks local files, fragment links, duplicate IDs and unfinished copy
- `.github/workflows/ci.yml` — automated validation on pushes and pull requests
- `.github/workflows/pages.yml` — GitHub Pages build and deployment

## Transparency and image credits

NOOR is **not affiliated with, endorsed by, or sponsored by UNICEF**. It does not collect donations, process payments, store payment details, issue receipts or claim that a donation purchases a specific item. Donation links take visitors to UNICEF's website so they can review the destination and terms before making their own decision.

The nine JPGs you uploaded are now renamed with descriptive filenames. The website's gallery and hero carousel use the higher-resolution originals: families-seeking-assistance.jpg (1915×1433), children-and-families-collecting-water.jpg (1888×1255), and food-distribution-for-children.jpg (2322×1393). The two smallest images remain available with “small” in their filenames and are not used in the main gallery. Verify each photo's original source, photographer credit and reuse permission before wider publication; public accessibility alone does not mean an image is free to reuse.

No unverified live statistics, fabricated aid-delivery claims, fake receipts, or simulated donation ledger are used.

## Publish with GitHub Pages

A workflow attempts to publish this static site on pushes to `main`. If Pages is not enabled yet, open **Settings → Pages** and choose **GitHub Actions** as the deployment source. Check the Actions tab for validation and deployment results and for the published URL.

## Run the checks

```bash
node --check js/main.js
python scripts/check_site.py
```
