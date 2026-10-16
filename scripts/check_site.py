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
    errors.append("missing navigation link to the A hard pill to swallow story page")
if not blank_page_path.is_file():
    errors.append("missing story page: a-hard-pill-to-swallow.html")
elif "<title>A hard pill to swallow | NOOR Field Notes</title>" not in blank_page_path.read_text(encoding="utf-8"):
    errors.append("blank page title is missing or incorrect")

if "const thresholdLink = document.querySelector" not in js_source or "noor-pixel-exit__cell" not in js_source:
    errors.append("missing pixel transition from NOOR navigation")
if "noor-warning-screen" not in js_source or "CONTENT WARNING" not in js_source:
    errors.append("missing retro pre-entry psychology warning screen")
if "Some linked reports or personal accounts may refer to blood or other distressing details." not in js_source:
    errors.append("content warning must mention potentially distressing material accurately")
if "continueButton.disabled = true" not in js_source or "I have read this warning and choose to continue to the stories." not in js_source:
    errors.append("content warning must require explicit acknowledgement before entry")
if CSS_FILE.exists():
    transition_css = CSS_FILE.read_text(encoding="utf-8")
    if ".noor-pixel-exit__grid" not in transition_css or "@keyframes noor-pixel-fill" not in transition_css:
        errors.append("missing pixel-transition grid animation")
    if ".noor-warning-screen__frame" not in transition_css or "@keyframes noor-warning-flicker" not in transition_css:
        errors.append("missing red retro CRT warning styles")
    if ".noor-warning-screen__frame{\n  position:relative;isolation:isolate;width:100%;min-height:100vh;min-height:100dvh;" not in transition_css:
        errors.append("warning screen must fill the viewport rather than render as a small card")
    if "@keyframes noor-crt-roll" not in transition_css or "@keyframes noor-crt-tracking" not in transition_css:
        errors.append("warning screen is missing CRT roll/tracking effects")
    if "@media(prefers-reduced-motion:reduce)" not in transition_css or ".noor-pixel-exit__cell" not in transition_css or ".noor-warning-screen" not in transition_css:
        errors.append("warning/pixel transition reduced-motion styling is missing")

story_html_path = ROOT / "a-hard-pill-to-swallow.html"
story_js_path = ROOT / "js" / "story.js"
story_css_path = ROOT / "css" / "story.css"
if not story_html_path.is_file():
    errors.append("missing story page: a-hard-pill-to-swallow.html")
else:
    story_html = story_html_path.read_text(encoding="utf-8")
    if '<h1 class="story-display" id="story-title"' not in story_html:
        errors.append("story destination needs its main editorial headline")
    if '<meta name="robots" content="index,follow">' not in story_html:
        errors.append("published story page should be indexable")
    for source_url in (
        "https://www.unicef.org/sop/stories/i-lost-my-childhood-my-little-brothers-and-sisters-now-call-me-mama",
        "https://www.unicef.org/stories/gaza-returning-families-confront-incalculable-costs-chaos",
        "https://www.ochaopt.org/content/humanitarian-situation-report-2-october-2026",
        "https://www.ochaopt.org/content/humanitarian-situation-report-25-september-2026",
        "https://www.unicef.org/sop/reports/unicef-state-palestine-escalation-humanitarian-situation-report-no48",
    ):
        if source_url not in story_html:
            errors.append(f"story page is missing a primary source link: {source_url}")
    if "data-en" not in story_html or "data-ar" not in story_html:
        errors.append("story destination must support both English and Arabic")
    if "Samar was 17" not in story_html or "Qusay was 10" not in story_html:
        errors.append("story page is missing documented personal accounts")

    story_parser = SiteParser()
    story_parser.feed(story_html)
    for local_ref in story_parser.local_refs:
        if local_ref and not (ROOT / local_ref).is_file():
            errors.append(f"missing story-page local asset: {local_ref}")
    for fragment in story_parser.fragments:
        if fragment and fragment not in story_parser.ids:
            errors.append(f"broken story-page internal link #{fragment}")

if not story_js_path.is_file():
    errors.append("story page language and transition script is missing")
else:
    story_js = story_js_path.read_text(encoding="utf-8")
    if "function setLanguage" not in story_js or "function revealStoryPage()" not in story_js:
        errors.append("story page bilingual controls or pixel reveal are missing")
if not story_css_path.is_file() or ".story-account" not in story_css_path.read_text(encoding="utf-8"):
    errors.append("story page editorial stylesheet is missing")

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
