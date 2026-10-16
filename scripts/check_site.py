#!/usr/bin/env python3
"""Validate NOOR's HTML references, basic accessibility, metadata, and template copy."""
from html.parser import HTMLParser
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
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

        for key in ("src",):
            value = attr.get(key, "")
            if value and not re.match(r"^(?:[a-z][a-z0-9+.-]*:|//|#|data:)", value, re.I):
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
