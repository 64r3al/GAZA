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

The photographs currently load from UNICEF's public website and are credited in the page to UNICEF/UNI820851, UNICEF/UNI849963/Nateel and UNICEF/UNI901432/Nateel. Confirm the applicable image-use terms before wider promotion or redistribution. An image being publicly accessible does not automatically mean it is free to reuse.

No unverified live statistics, fabricated aid-delivery claims, fake receipts, or simulated donation ledger are used.

## Publish with GitHub Pages

A workflow attempts to publish this static site on pushes to `main`. If Pages is not enabled yet, open **Settings → Pages** and choose **GitHub Actions** as the deployment source. Check the Actions tab for validation and deployment results and for the published URL.

## Run the checks

```bash
node --check js/main.js
python scripts/check_site.py
```
