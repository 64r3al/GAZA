#!/usr/bin/env python3
"""Validate NOOR's HTML references, basic accessibility, metadata, and template copy."""
from html.parser import HTMLParser
from pathlib import Path
import argparse
import re
import sys

PROJECT_ROOT = Path(__file__).resolve().parents[1]
ARGUMENTS = argparse.ArgumentParser(description="Validate source or generated NOOR site files.")
ARGUMENTS.add_argument("--root", default=str(PROJECT_ROOT), help="Site root to validate (defaults to the repository root).")
ROOT = Path(ARGUMENTS.parse_args().root).resolve()
HTML_FILE = ROOT / "index.html"
CSS_FILE = ROOT / "css" / "style.css"
JS_FILE = ROOT / "js" / "main.js"
HTML = HTML_FILE.read_text(encoding="utf-8")
errors = []


class SiteParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids = set()
        self.local_refs = []
        self.fragments = []
        self.images_without_alt = []
        self.images_without_dimensions = []
        self.new_tab_without_safe_rel = []
        self.unlabelled_buttons = []
        self.button_stack = []

    def handle_starttag(self, tag, attrs):
        attr = dict(attrs)
        element_id = attr.get("id")
        if element_id:
            if element_id in self.ids:
                errors.append(f"duplicate id: {element_id}")
            self.ids.add(element_id)

        if tag == "img":
            src = attr.get("src", "(missing src)")
            if "alt" not in attr:
                self.images_without_alt.append(src)
            if not attr.get("width") or not attr.get("height"):
                self.images_without_dimensions.append(src)

        if tag == "button":
            self.button_stack.append({
                "label": (attr.get("aria-label") or "").strip(),
                "text": [],
            })

        href = attr.get("href", "")
        if href:
            if href.startswith("#"):
                self.fragments.append(href[1:])
            elif not re.match(r"^(?:[a-z][a-z0-9+.-]*:|//|#|data:)", href, re.I):
                self.local_refs.append(href.split("#", 1)[0].split("?", 1)[0])

            if attr.get("target", "").lower() == "_blank":
                rel = set((attr.get("rel") or "").lower().split())
                if not {"noopener", "noreferrer"}.issubset(rel):
                    self.new_tab_without_safe_rel.append(href)

        value = attr.get("src", "")
        if value and not re.match(r"^(?:[a-z][a-z0-9+.-]*:|//|#|data:)", value, re.I):
            self.local_refs.append(value.split("#", 1)[0].split("?", 1)[0])

        srcset = attr.get("srcset", "")
        for candidate in srcset.split(","):
            candidate_url = candidate.strip().split()
            if not candidate_url:
                continue
            value = candidate_url[0]
            if not re.match(r"^(?:[a-z][a-z0-9+.-]*:|//|#|data:)", value, re.I):
                self.local_refs.append(value.split("#", 1)[0].split("?", 1)[0])

    def handle_data(self, data):
        if self.button_stack:
            self.button_stack[-1]["text"].append(data)

    def handle_endtag(self, tag):
        if tag == "button" and self.button_stack:
            button = self.button_stack.pop()
            if not button["label"] and not "".join(button["text"]).strip():
                self.unlabelled_buttons.append("button without an accessible name")


parser = SiteParser()
parser.feed(HTML)
parser.close()

if not HTML.lstrip().lower().startswith("<!doctype html>"):
    errors.append("missing HTML5 doctype")

for fragment in parser.fragments:
    if fragment and fragment not in parser.ids:
        errors.append(f"broken internal link #{fragment}")

for value in parser.local_refs:
    if not value:
        continue
    target = (ROOT / value).resolve()
    if ROOT.resolve() not in target.parents and target != ROOT.resolve():
        errors.append(f"path escapes project root: {value}")
    elif not target.exists():
        errors.append(f"missing local asset: {value}")

if parser.images_without_alt:
    errors.append("images missing alt attributes: " + ", ".join(parser.images_without_alt))
if parser.images_without_dimensions:
    errors.append("images missing width/height (layout-shift protection): " + ", ".join(parser.images_without_dimensions))
if parser.new_tab_without_safe_rel:
    errors.append("new-tab links missing rel=noopener noreferrer: " + ", ".join(parser.new_tab_without_safe_rel))
if parser.unlabelled_buttons:
    errors.extend(parser.unlabelled_buttons)

if not re.search(r'<html\b[^>]*\blang=["\']en["\']', HTML, re.I):
    errors.append("HTML document needs a default language")
if 'property="og:image"' not in HTML or 'name="twitter:description"' not in HTML:
    errors.append("missing social preview image/description metadata")
for source_url in (
    "https://www.unicef.org/appeals/state-of-palestine",
    "https://www.unicef.org/appeals/state-of-palestine/situation-reports",
    "https://help.unicef.org/en/gaza-2026",
):
    if source_url not in HTML:
        errors.append(f"missing primary information/donation link: {source_url}")
if "Not able to donate?" not in HTML or "unverified figures or images" not in HTML:
    errors.append("missing practical non-donation guidance")

js_source = JS_FILE.read_text(encoding="utf-8") if JS_FILE.exists() else ""
for required_share_item in (
    'id="share-whatsapp"',
    'id="share-x"',
    'id="share-facebook"',
    "https://wa.me/",
    "https://x.com/intent/post",
    "https://www.facebook.com/sharer/sharer.php",
    "function updateShareLinks()",
):
    if required_share_item not in HTML and required_share_item not in js_source:
        errors.append(f"missing original social sharing feature: {required_share_item}")
if "EyeonPalestine" in HTML or "eyeonpalestine.offical" in HTML:
    errors.append("follow-profile links should not replace the original share actions")

blank_page_path = ROOT / "a-hard-pill-to-swallow.html"
if 'href="a-hard-pill-to-swallow.html"' not in HTML:
    errors.append("missing navigation link to the blank A hard pill to swallow page")
if not blank_page_path.is_file():
    errors.append("missing blank page: a-hard-pill-to-swallow.html")
elif "<title>A hard pill to swallow | NOOR</title>" not in blank_page_path.read_text(encoding="utf-8"):
    errors.append("blank page title is missing or incorrect")

for expected_count in ("800000", "600000", "436000", "591800"):
    if f'data-count="{expected_count}"' not in HTML:
        errors.append(f"missing response counter target: {expected_count}")
if HTML.count('class="response-number-accessible"') != 4 or HTML.count('class="response-number-visual"') != 4:
    errors.append("response counters must keep accessible final values and separate animated visuals")
if "function setupResponseCounters()" not in js_source or "reduceMotion.matches" not in js_source:
    errors.append("response counter animation or reduced-motion handling is missing")
if "const duration = 1700;" not in js_source or "const initialProgress = 0.94;" not in js_source:
    errors.append("response counters should start close to their targets and animate quickly")
if "1 - Math.pow(1 - progress, 3)" not in js_source:
    errors.append("response counters must move fast initially and decelerate smoothly at the end")
if "}, index * 100);" not in js_source:
    errors.append("response counters should use a short, subtle stagger")
if CSS_FILE.exists() and "noor-counter-enter" not in CSS_FILE.read_text(encoding="utf-8"):
    errors.append("response counter entrance styling is missing")

if CSS_FILE.exists():
    css = CSS_FILE.read_text(encoding="utf-8")
    for value in re.findall(r"""url\(["']?([^"')]+)""", css):
        if re.match(r"^(?:data:|https?:|#)", value, re.I):
            continue
        if not (CSS_FILE.parent / value).exists():
            errors.append(f"missing CSS asset: css/{value}")
else:
    errors.append("missing stylesheet: css/style.css")

if not JS_FILE.exists():
    errors.append("missing JavaScript: js/main.js")
else:
    js = JS_FILE.read_text(encoding="utf-8")
    if "['need', 'response', 'help', 'ledger', 'learn']" not in js:
        errors.append("active navigation observer is missing a primary section")

for pattern in (
    r"\[[^\]]*(?:placeholder|add photo|caption:|source name|receipt or report|video title|location\])",
    r"\bTODO\b",
    r"\bFIXME\b",
    r"Ù†ÙˆØ±",
    r"â€”",
):
    if re.search(pattern, HTML, re.I):
        errors.append(f"unfinished/corrupted template text matched: {pattern}")

if errors:
    print("Site validation failed:")
    for error in errors:
        print(f" - {error}")
    sys.exit(1)

image_count = HTML.lower().count("<img ")
print(
    f"Site validation passed: {len(parser.ids)} unique IDs, "
    f"{len(parser.local_refs)} local references, "
    f"{len(parser.fragments)} internal links, "
    f"{image_count} images checked for alt text and dimensions."
)
