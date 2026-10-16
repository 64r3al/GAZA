#!/usr/bin/env python3
"""Validate local paths, fragment links, and unfinished template copy."""
from html.parser import HTMLParser
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
HTML_FILE = ROOT / "index.html"
HTML = HTML_FILE.read_text(encoding="utf-8")
errors = []


class SiteParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids = set()
        self.local_refs = []
        self.fragments = []

    def handle_starttag(self, tag, attrs):
        attr = dict(attrs)
        element_id = attr.get("id")
        if element_id:
            if element_id in self.ids:
                errors.append(f"duplicate id: {element_id}")
            self.ids.add(element_id)

        for key in ("src", "href"):
            value = attr.get(key, "")
            if not value:
                continue
            if key == "href" and value.startswith("#"):
                self.fragments.append(value[1:])
            elif not re.match(r"^(?:[a-z][a-z0-9+.-]*:|//|#|data:)", value, re.I):
                self.local_refs.append(value.split("#", 1)[0].split("?", 1)[0])


parser = SiteParser()
parser.feed(HTML)
parser.close()

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

css_path = ROOT / "css" / "style.css"
if not css_path.exists():
    errors.append("missing stylesheet: css/style.css")
else:
    css = css_path.read_text(encoding="utf-8")
    for value in re.findall(r"""url\(["']?([^"')]+)""", css):
        if re.match(r"^(?:data:|https?:|#)", value, re.I):
            continue
        if not (css_path.parent / value).exists():
            errors.append(f"missing CSS asset: css/{value}")

js_path = ROOT / "js" / "main.js"
if not js_path.exists():
    errors.append("missing JavaScript: js/main.js")

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

print(
    f"Site validation passed: {len(parser.ids)} unique IDs, "
    f"{len(parser.local_refs)} local references, "
    f"{len(parser.fragments)} internal links."
)
