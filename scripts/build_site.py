#!/usr/bin/env python3
"""Build a production-ready static site with responsive WebP image variants.

Original JPGs remain untouched in the repository and are kept as fallback images
in the generated HTML. Optimized derivatives are written only to _site/.
"""
from html.parser import HTMLParser
from pathlib import Path
import re
import shutil
import sys

try:
    from PIL import Image, ImageOps
except ImportError as exc:
    raise SystemExit(
        "Pillow is required to build the optimized site. "
        "Install it with: python -m pip install 'Pillow>=11,<13'"
    ) from exc

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "_site"
IMAGE_DIR = ROOT / "assets" / "hero"
OUTPUT_IMAGES = OUTPUT / "assets" / "hero" / "optimized"
CANDIDATE_WIDTHS = (480, 960, 1440)
HERO_MAX_WIDTH = 1600
WEBP_QUALITY = 82


def copy_site():
    if OUTPUT.exists():
        shutil.rmtree(OUTPUT)
    OUTPUT.mkdir(parents=True)
    for filename in ("index.html", ".nojekyll"):
        source = ROOT / filename
        if not source.is_file():
            raise SystemExit(f"Required site file is missing: {filename}")
        shutil.copy2(source, OUTPUT / filename)
    for directory in ("css", "js", "assets"):
        shutil.copytree(ROOT / directory, OUTPUT / directory)


def create_webp_variants(stems):
    OUTPUT_IMAGES.mkdir(parents=True, exist_ok=True)
    variants = {}
    hero_files = {}
    for stem in sorted(stems):
        source = IMAGE_DIR / f"{stem}.jpg"
        if not source.is_file():
            raise SystemExit(f"Referenced source image is missing: {source.relative_to(ROOT)}")

        with Image.open(source) as opened:
            image = ImageOps.exif_transpose(opened).convert("RGB")
            source_width, source_height = image.size
            if source_width < 1 or source_height < 1:
                raise SystemExit(f"Invalid image dimensions: {source.name}")

            widths = sorted({min(width, source_width) for width in CANDIDATE_WIDTHS})
            generated = []
            for width in widths:
                height = max(1, round(source_height * width / source_width))
                variant = image.resize((width, height), Image.Resampling.LANCZOS) if width != source_width else image.copy()
                output_path = OUTPUT_IMAGES / f"{stem}-{width}.webp"
                variant.save(output_path, format="WEBP", quality=WEBP_QUALITY, method=6)
                generated.append((width, output_path.relative_to(OUTPUT).as_posix()))

            hero_width = min(HERO_MAX_WIDTH, source_width)
            hero_height = max(1, round(source_height * hero_width / source_width))
            hero_image = image.resize((hero_width, hero_height), Image.Resampling.LANCZOS) if hero_width != source_width else image.copy()
            hero_path = OUTPUT_IMAGES / f"{stem}-hero.webp"
            hero_image.save(hero_path, format="WEBP", quality=WEBP_QUALITY, method=6)
            variants[stem] = generated
            hero_files[stem] = hero_path.relative_to(OUTPUT).as_posix()

    return variants, hero_files


def replace_gallery_images(html, variants):
    pattern = re.compile(r'<img src="assets/hero/([a-zA-Z0-9_-]+)\.jpg"([^>]*)>')

    def replace(match):
        stem = match.group(1)
        attrs = match.group(2)
        if stem not in variants:
            raise SystemExit(f"No WebP variants were generated for gallery image: {stem}.jpg")
        srcset = ", ".join(
            f"{path} {width}w"
            for width, path in variants[stem]
        )
        if stem == "families-seeking-assistance":
            sizes = "(max-width: 560px) calc(100vw - 34px), (max-width: 900px) calc(100vw - 44px), 60vw"
        else:
            sizes = "(max-width: 560px) calc(100vw - 34px), (max-width: 900px) calc(50vw - 22px), 35vw"
        return (
            f'<picture><source type="image/webp" srcset="{srcset}" sizes="{sizes}">'
            f'<img src="assets/hero/{stem}.jpg"{attrs}></picture>'
        )

    updated, count = pattern.subn(replace, html)
    expected = 3
    if count != expected:
        raise SystemExit(f"Expected to optimize {expected} gallery images, found {count}.")
    return updated


def main():
    source_html = (ROOT / "index.html").read_text(encoding="utf-8")
    copy_site()

    stems = set(re.findall(r"assets/hero/([a-zA-Z0-9_-]+)\.jpg", source_html))
    if not stems:
        raise SystemExit("No local JPG images were found to optimize.")
    variants, hero_files = create_webp_variants(stems)

    html = source_html
    preload_old = 'href="assets/hero/child-receiving-a-meal.jpg" fetchpriority="high"'
    preload_new = f'href="{hero_files.get("child-receiving-a-meal", "")}" fetchpriority="high"'
    if preload_old not in html or not hero_files.get("child-receiving-a-meal"):
        raise SystemExit("The hero preload does not match a generated image.")
    html = html.replace(preload_old, preload_new, 1)

    def replace_background(match):
        stem = match.group(1)
        if stem not in hero_files:
            raise SystemExit(f"No optimized hero image was generated for: {stem}.jpg")
        return f"background-image:url('{hero_files[stem]}')"

    html, background_count = re.subn(
        r"background-image:url\('assets/hero/([a-zA-Z0-9_-]+)\.jpg'\)",
        replace_background,
        html,
    )
    if background_count != 3:
        raise SystemExit(f"Expected 3 optimized hero backgrounds, found {background_count}.")

    html = replace_gallery_images(html, variants)
    (OUTPUT / "index.html").write_text(html, encoding="utf-8")

    webp_count = len(list(OUTPUT_IMAGES.glob("*.webp")))
    print(
        f"Optimized build ready: {len(stems)} source photos, {webp_count} WebP files, "
        f"{background_count} WebP hero backgrounds, and 3 responsive picture elements. "
        "Original JPG fallbacks are retained."
    )


if __name__ == "__main__":
    main()
