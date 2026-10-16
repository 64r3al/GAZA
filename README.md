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
- `scripts/check_site.py` — checks local files, fragment links, duplicate IDs, image alt text/dimensions, accessible button names, new-tab link safety, metadata and unfinished copy
- `.github/workflows/ci.yml` — automated validation on pushes and pull requests
- `.github/workflows/pages.yml` — GitHub Pages build and deployment

## Transparency and image credits

NOOR is **not affiliated with, endorsed by, or sponsored by UNICEF**. It does not collect donations, process payments, store payment details, issue receipts or claim that a donation purchases a specific item. Donation links take visitors to UNICEF's website so they can review the destination and terms before making their own decision.

The nine JPGs you uploaded are renamed with descriptive filenames. The gallery uses families-seeking-assistance.jpg (1915×1433), children-and-families-collecting-water.jpg (1888×1255), and food-distribution-for-children.jpg (2322×1393). The hero carousel uses separate files to avoid repeating the same photographs above and below the fold. The first hero image is preloaded; gallery images load lazily and declare intrinsic dimensions to reduce layout shifts. The two smallest images remain available with “small” in their filenames. Verify each photo's original source, photographer credit and reuse permission before wider publication; public accessibility alone does not mean an image is free to reuse.

No unverified live statistics, fabricated aid-delivery claims, fake receipts, or simulated donation ledger are used.

## Publish with GitHub Pages

A workflow builds and attempts to publish this static site on pushes to `main`. **One-time repository setup is still required:** open **Settings → Pages** and choose **GitHub Actions** as the build/deployment source. The current deployment log confirms that the workflow token cannot create the Pages site itself (`Resource not accessible by integration`), even though the site checks pass. After selecting GitHub Actions, rerun the latest deployment from the Actions tab and wait for the deploy job to succeed before sharing the published URL. Do not treat a successful validation run as proof that the site is online.

## Run the checks

```bash
node --check js/main.js
python scripts/check_site.py
```


## Official humanitarian information

The homepage includes selected **provisional planned targets** from UNICEF's *State of Palestine Appeal — September 2026 revision*. The targets cover the State of Palestine, including Gaza and the West Bank, and must not be presented as achieved results or Gaza-only totals. UNICEF may revise them; check the [official appeal](https://www.unicef.org/appeals/state-of-palestine) and [situation reports](https://www.unicef.org/appeals/state-of-palestine/situation-reports) before reposting figures. The donation page may show currency or terms tied to a visitor's region, so donors should check the amount, one-time/monthly selection, recipient, and terms before confirming.

NOOR links visitors to UNICEF's [Gaza appeal](https://help.unicef.org/en/gaza-2026). That page notes funds may be redirected to other UNICEF initiatives for vulnerable children if resources raised exceed the immediate response needs in Gaza. Donors should review the live appeal terms before contributing.
