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
ARCHIVE_HTML_FILE = ROOT / "evidence-archive.html"
ARCHIVE_CSS_FILE = ROOT / "css" / "archive.css"
ARCHIVE_JS_FILE = ROOT / "js" / "archive.js"
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
if 'href="evidence-archive.html"' in HTML or "Browse the evidence archive" in HTML:
    errors.append("homepage must not link directly to the evidence archive; keep that entry point on the field-notes page")

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


    new_story_sources = (
        "https://www.unicef.org/sop/stories/childhood-displaced-gaza",
        "https://www.unicef.org/sop/stories/gazas-children-need-urgent-international-support-get-them-back-learning",
        "https://www.unicef.org/sop/stories/renewed-attacks-leave-gazas-children-cascading-crises",
        "https://www.unicef.org/sop/stories/life-hangs-tenuously-balance-gaza-strip",
        "https://www.unicef.org/sop/stories/hope-amid-pain-palestinian-children-gaza-strip-one-year-after-ceasefire",
    )
    for source_url in new_story_sources:
        if source_url not in story_html:
            errors.append(f"story page is missing a researched account or dated update: {source_url}")

    new_evidence_media_sources = (
        "https://www.hrw.org/news/2024/04/04/gaza-israeli-strike-killing-106-civilians-an-apparent-war-crime",
        "https://www.youtube.com/watch?v=jZdcDhYuBNs",
        "https://www.amnesty.org/en/latest/news/2026/05/israel-opt-israels-systematic-destruction-of-high-rise-buildings-must-be-investigated-as-war-crimes-of-wanton-destruction-and-collective-punishment/",
        "https://www.theguardian.com/world/2026/oct/17/couples-families-separated-war-in-gaza",
        "https://commons.wikimedia.org/wiki/File:Images_of_war_23-25_from_Gaza,_by_Jaber_Badwen,_IMG_5889.jpg",
        "https://creativecommons.org/licenses/by-sa/4.0/",
    )
    for source_url in new_evidence_media_sources:
        if source_url not in story_html:
            errors.append(f"story page is missing a new evidence/media source link: {source_url}")
    if story_html.count('class="story-lived-card"') < 3 or 'id="lived-accounts-title"' not in story_html:
        errors.append("field notes need the three source-linked personal testimony cards")
    if 'href="#lived-accounts-title"' not in story_html:
        errors.append("field-note jump navigation must link to the personal testimony section")
    if 'data-video-id="jZdcDhYuBNs"' not in story_html or 'id="video-ack-engineers"' not in story_html:
        errors.append("Human Rights Watch strike footage must have an explicit content-warning gate")
    if 'Jaber Jehad Badwan' not in story_html or 'CC BY-SA 4.0' not in story_html:
        errors.append("the added documentary school photograph needs clear creator and licence attribution")
    for phrase in (
        "Jana was 17",
        "Reda, 12, and Siraj, 5",
        "Mays, a girl using a wheelchair",
        "Mais Abu Saif",
        "There’s a long line",
        "A year after the ceasefire",
    ):
        if phrase not in story_html:
            errors.append(f"story page is missing researched content: {phrase}")
    if story_html.count('class="story-photo-card"') < 6:
        errors.append("documentary photo essay needs at least six captioned photographs")
    if story_html.count('class="story-photo-img"') < 6:
        errors.append("documentary photo essay image markup is incomplete")
    if "creativecommons.org/licenses/by-sa/3.0/igo/" not in story_html:
        errors.append("documentary photo essay must link each photo to its license")


    for source_url in (
        "https://www.unicef.org/sop/reports/humanitarian-situation-update-analysis-response-needs-children-mid-year-2026",
        "https://www.unicef.org/mena/press-releases/childhood-defined-struggle-survival-gaza-strip",
        "https://www.reuters.com/world/middle-east/un-says-gaza-malnutrition-gains-fragile-commercial-supplies-halt-2026-10-16/",
        "https://www.unicef.org/sop/stories/hope-amid-pain-palestinian-children-gaza-strip-one-year-after-ceasefire",
        "https://www.bellingcat.com/news/2025/04/09/gaza-palestine-israel-killed-death-aid-workers-international-red-cross-crescent-audio-analysis/",
        "https://factcheck.afp.com/doc.afp.com.87W89G3",
    ):
        if source_url not in story_html:
            errors.append(f"story page is missing an updated primary or verification source: {source_url}")
    for account_phrase in (
        "Jamal and Hamza lost their home and their brother",
        "Norhan caring for her younger sister Narjis",
        "82%",
        "one in eight children under five",
    ):
        if account_phrase not in story_html:
            errors.append(f"story page is missing current humanitarian context: {account_phrase}")
    for phrase in (
        "UNICEF UPDATE / 16 OCT 2026",
        "Nutrition remains precarious",
        "7 + 2",
        "article:modified_time",
        "twitter:card\" content=\"summary_large_image\"",
    ):
        if phrase not in story_html:
            errors.append(f"story page is missing the latest dated update or share metadata: {phrase}")
    if "LATEST VERIFIED UPDATE / 07 OCT 2026" in story_html:
        errors.append("story page still presents the 7 October briefing as the latest verified update")
    for jump_target in (
        "current-update-title",
        "photo-essay-title",
        "media-doc-title",
        "current-accounts-title",
        "investigations-title",
        "reality-title",
        "sources-title",
    ):
        if f'href="#{jump_target}"' not in story_html or f'id="{jump_target}"' not in story_html:
            errors.append(f"field-note quick navigation is missing a valid target: {jump_target}")
    if 'data-en-aria="Navigate the field notes"' not in story_html:
        errors.append("field-note navigation needs a bilingual accessible label")
    if story_html.count('class="story-video-card') < 3:
        errors.append("documentary section needs at least three contextual video entries")
    if story_html.count('class="story-video-load"') < 3 or story_html.count('class="story-video-ack"') < 3:
        errors.append("all documentary videos must be click-to-load with a content acknowledgement")
    video_script_source = (ROOT / "js" / "story.js").read_text(encoding="utf-8") if (ROOT / "js" / "story.js").is_file() else ""
    if 'youtube-nocookie.com/embed/' not in video_script_source or 'autoplay=1' in video_script_source:
        errors.append("documentary videos must use privacy-enhanced, non-autoplay embeds")
    if "https://x.com/PalestineRCS/status/1908458778040631384" not in story_html:
        errors.append("missing the original PRCS social post for phone footage")
    if story_html.count('class="story-photo-card"') < 9 or story_html.count('class="story-photo-img"') < 9:
        errors.append("photo essay must include at least nine captioned, attributed images")


    for evidence_url in (
        "https://www.reuters.com/default/israel-opens-criminal-probes-over-killings-hind-rajab-gaza-rescue-workers-2026-08-19/",
        "https://www.un.org/unispal/document/conflict-related-sexual-violence-report-of-the-secretary-general-s-2026-321/",
        "https://apnews.com/article/b11e5f0639b7fe51c5ea101f4b320f56",
        "https://www.amnesty.org/en/latest/news/2026/05/israel-opt-israels-systematic-destruction-of-high-rise-buildings-must-be-investigated-as-war-crimes-of-wanton-destruction-and-collective-punishment/",
        "https://www.hrw.org/news/2025/08/07/gaza-israeli-school-strikes-magnify-civilian-peril",
    ):
        if evidence_url not in story_html:
            errors.append(f"story page is missing an investigation source: {evidence_url}")
    for evidence_phrase in (
        "A child's calls for help, then silence.",
        "The UN Secretary-General's 2026 report",
        "14 men, 7 women, 9 boys and 1 girl",
        "charges against five soldiers accused",
        "more than 25 videos",
    ):
        if evidence_phrase not in story_html:
            errors.append(f"story page is missing sourced investigation content: {evidence_phrase}")
    if len(re.findall(r'class="[^"]*\bstory-video-card\b', story_html)) < 5:
        errors.append("sensitive documentary video archive needs at least five gated video items")
    if story_html.count('class="story-video-load"') < 5 or story_html.count('class="story-video-ack"') < 5:
        errors.append("every sensitive documentary video needs its own confirmation gate")

    required_x_posts = (
        "https://x.com/PalestineRCS/status/1908458778040631384",
        "https://x.com/Israel_katz/status/1965257786159436226",
        "https://x.com/IDF/status/1963910424694280403",
    )
    for x_post_url in required_x_posts:
        if x_post_url not in story_html:
            errors.append(f"story page is missing an original X video post: {x_post_url}")
    x_embed_script = story_js_path.read_text(encoding="utf-8") if story_js_path.is_file() else ""
    if "https://platform.x.com/widgets.js" not in x_embed_script or "twttr.widgets.load(player)" not in x_embed_script:
        errors.append("original X posts must use X's official, click-to-load embed widget")
    if "autoplay=1" in x_embed_script:
        errors.append("X and video embeds must not enable autoplay")
    if story_html.count('class="story-x-player"') < 3 or story_html.count('data-x-load-button="true"') < 3:
        errors.append("each original X post must have its own consent-gated player")
    if story_html.count('class="story-investigation-case') < 3:
        errors.append("investigative evidence section is incomplete")

    story_parser = SiteParser()
    story_parser.feed(story_html)
    if story_parser.images_without_alt:
        errors.append("story-page images missing alt attributes: " + ", ".join(story_parser.images_without_alt))
    if story_parser.images_without_dimensions:
        errors.append("story-page images missing width/height: " + ", ".join(story_parser.images_without_dimensions))
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
    if "jumpObserver" not in story_js or "data-en-aria" not in story_js:
        errors.append("field-note navigation must track the active section and translate its accessible label")
if not story_css_path.is_file() or ".story-account" not in story_css_path.read_text(encoding="utf-8"):
    errors.append("story page editorial stylesheet is missing")
if story_css_path.is_file():
    story_css = story_css_path.read_text(encoding="utf-8")
    for style_marker in (
        ".story-video-card-critical",
        ".story-video-player[hidden]{display:none!important}",
        ".story-survival-grid",
        ".story-current-account-grid",
        ".story-jump-nav",
        ".story-update-nutrition",
        "@media(prefers-reduced-motion:reduce)",
    ):
        if style_marker not in story_css:
            errors.append(f"story stylesheet is missing professional media layout/support: {style_marker}")



# The archive is a first-class page in both source and production builds.
if not ARCHIVE_HTML_FILE.is_file():
    errors.append("missing searchable evidence archive: evidence-archive.html")
    archive_html = ""
else:
    archive_html = ARCHIVE_HTML_FILE.read_text(encoding="utf-8")
    if not archive_html.lstrip().lower().startswith("<!doctype html>"):
        errors.append("evidence archive is missing the HTML5 doctype")
    if "<title>Gaza Evidence Archive | NOOR Field Notes</title>" not in archive_html:
        errors.append("evidence archive title is missing or incorrect")
    for metadata in (
        'name="description"',
        'name="robots" content="index,follow"',
        'property="og:image"',
        'name="twitter:card" content="summary_large_image"',
        'rel="canonical"',
    ):
        if metadata not in archive_html:
            errors.append(f"evidence archive is missing metadata: {metadata}")

    for source_url in (
        "https://www.unicef.org/mena/press-releases/childhood-defined-struggle-survival-gaza-strip",
        "https://www.reuters.com/world/middle-east/un-says-gaza-malnutrition-gains-fragile-commercial-supplies-halt-2026-10-16/",
        "https://www.ochaopt.org/content/humanitarian-situation-report-2-october-2026",
        "https://www.un.org/unispal/document/conflict-related-sexual-violence-report-of-the-secretary-general-s-2026-321/",
        "https://www.amnesty.org/en/latest/news/2026/05/israel-opt-israels-systematic-destruction-of-high-rise-buildings-must-be-investigated-as-war-crimes-of-wanton-destruction-and-collective-punishment/",
        "https://www.hrw.org/news/2025/08/07/gaza-israeli-school-strikes-magnify-civilian-peril",
        "https://www.hrw.org/news/2025/08/01/gaza-israeli-killings-palestinians-seeking-food-are-war-crimes",
        "https://www.bellingcat.com/news/2025/04/09/gaza-palestine-israel-killed-death-aid-workers-international-red-cross-crescent-audio-analysis/",
        "https://www.reuters.com/default/israel-opens-criminal-probes-over-killings-hind-rajab-gaza-rescue-workers-2026-08-19/",
        "https://www.hrw.org/news/2024/04/04/gaza-israeli-strike-killing-106-civilians-an-apparent-war-crime",
        "https://www.un.org/unispal/document/commission-of-inquiry-report-genocide-in-gaza-a-hrc-60-crp-3/",
        "https://embassies.gov.il/ungeneva/en/node/9158",
        "https://icj-web.leman-icc.cloud/case/192",
        "https://www.un.org/unispal/document/coi-report-23jun26/",
        "https://www.gov.il/en/pages/israel-s-response-to-the-coi-report-regarding-palestinian-children-since-october-7-2023",
        "https://www.icc-cpi.int/news/situation-state-palestine-icc-pre-trial-chamber-i-rejects-state-israels-challenges",
        "https://www.icc-cpi.int/palestine",
        "https://www.ft.com/content/432c9cff-b86f-4712-8e64-56cf3895d687",
        "https://www.theguardian.com/world/2026/oct/17/couples-families-separated-war-in-gaza",
        "https://www.reuters.com/world/middle-east/israeli-fire-kills-two-people-gaza-medics-say-2026-10-12/",
    ):
        if source_url not in archive_html:
            errors.append(f"evidence archive is missing a key source: {source_url}")

    archive_cards = re.findall(r'<article class="archive-card"([^>]*)>', archive_html)
    if len(archive_cards) < 8:
        errors.append(f"evidence archive needs at least eight case/report records; found {len(archive_cards)}")
    if len(archive_cards) < 18:
        errors.append(f"expanded evidence archive needs at least 18 case/report records; found {len(archive_cards)}")
    if not re.search(r'<(?:span|strong|b)\\b[^>]*id="archive-total"[^>]*>\\s*18\\s*</(?:span|strong|b)>', archive_html):
        errors.append("evidence archive’s initial record total should match its expanded index")
    record_ids = []
    for index, attributes in enumerate(archive_cards, start=1):
        match = re.search(r'data-record-id="([^"]+)"', attributes)
        if match:
            record_ids.append(match.group(1))
        else:
            errors.append(f"archive record {index} is missing a stable record ID")
        for field in ("data-start", "data-end", "data-category", "data-location", "data-source-type", "data-status", "data-footage", "data-keywords"):
            if not re.search(rf'\b{field}="[^"]+"', attributes):
                errors.append(f"archive record {index} is missing {field}")
        start_date = re.search(r'data-start="(\d{4}-\d{2}-\d{2})"', attributes)
        end_date = re.search(r'data-end="(\d{4}-\d{2}-\d{2})"', attributes)
        if not start_date or not end_date:
            errors.append(f"archive record {index} needs ISO-formatted start and end dates")
        elif start_date.group(1) > end_date.group(1):
            errors.append(f"archive record {index} has a start date later than its end date")
    if len(record_ids) != len(set(record_ids)):
        errors.append("evidence archive contains duplicate record IDs")
    if archive_html.count('class="archive-sources"') != len(archive_cards):
        errors.append("every archive record must include a source-and-scope details panel")

    for control_id in (
        "archive-query",
        "archive-date-from",
        "archive-date-to",
        "archive-category",
        "archive-location",
        "archive-source-type",
        "archive-status",
        "archive-footage",
        "archive-sort",
        "archive-clear",
        "archive-result-count",
        "archive-no-results",
    ):
        if f'id="{control_id}"' not in archive_html:
            errors.append(f"evidence archive is missing a required filter/result control: {control_id}")
    if 'class="archive-no-results"' not in archive_html or 'aria-live="polite"' not in archive_html:
        errors.append("archive result updates need an accessible live region")
    if "<iframe" in archive_html.lower() or "autoplay=1" in archive_html.lower():
        errors.append("evidence archive must not embed or autoplay distressing source media")

    archive_parser = SiteParser()
    archive_parser.feed(archive_html)
    archive_parser.close()
    for fragment in archive_parser.fragments:
        if fragment and fragment not in archive_parser.ids:
            errors.append(f"evidence archive has a broken internal link #{fragment}")
    for local_ref in archive_parser.local_refs:
        if not local_ref:
            continue
        target = (ROOT / local_ref).resolve()
        if ROOT.resolve() not in target.parents and target != ROOT.resolve():
            errors.append(f"archive path escapes project root: {local_ref}")
        elif not target.is_file():
            errors.append(f"evidence archive is missing a local asset/page: {local_ref}")
    if archive_parser.new_tab_without_safe_rel:
        errors.append("archive new-tab links missing rel=noopener noreferrer: " + ", ".join(archive_parser.new_tab_without_safe_rel))
    if archive_parser.unlabelled_buttons:
        errors.extend(archive_parser.unlabelled_buttons)

methodology_html_path = ROOT / "methodology.html"
research_css_path = ROOT / "css" / "research.css"
research_js_path = ROOT / "js" / "research.js"
if not methodology_html_path.is_file():
    errors.append("missing evidence methodology page: methodology.html")
else:
    methodology_html = methodology_html_path.read_text(encoding="utf-8")
    if "<title>Evidence methodology | NOOR</title>" not in methodology_html:
        errors.append("evidence methodology page title is missing or incorrect")
    for required_copy in (
        "not affiliated with UNICEF",
        "An arrest warrant is not a conviction",
        "18+ confirmation is an access warning",
        "issues/new",
    ):
        if required_copy.lower() not in methodology_html.lower():
            errors.append(f"methodology page is missing important transparency copy: {required_copy}")
    methodology_parser = SiteParser()
    methodology_parser.feed(methodology_html)
    methodology_parser.close()
    for fragment in methodology_parser.fragments:
        if fragment and fragment not in methodology_parser.ids:
            errors.append(f"methodology page has a broken internal link #{fragment}")
    for local_ref in methodology_parser.local_refs:
        if not local_ref:
            continue
        target = (ROOT / local_ref).resolve()
        if ROOT.resolve() not in target.parents and target != ROOT.resolve():
            errors.append(f"methodology path escapes project root: {local_ref}")
        elif not target.is_file():
            errors.append(f"methodology page is missing a local asset/page: {local_ref}")
    if methodology_parser.new_tab_without_safe_rel:
        errors.append("methodology new-tab links missing rel=noopener noreferrer: " + ", ".join(methodology_parser.new_tab_without_safe_rel))
    if methodology_parser.unlabelled_buttons:
        errors.extend(methodology_parser.unlabelled_buttons)

for page_name, page_html in (
    ("field notes", story_html if story_html_path.is_file() else ""),
    ("evidence archive", archive_html if ARCHIVE_HTML_FILE.is_file() else ""),
    ("methodology", methodology_html if methodology_html_path.is_file() else ""),
):
    if 'class="research-nav"' not in page_html:
        errors.append(f"{page_name} is missing shared research navigation")
    if 'href="methodology.html"' not in page_html:
        errors.append(f"{page_name} does not link to the methodology page")

if methodology_html_path.is_file():
    topic_matches = re.findall(r'<button\b[^>]*data-archive-category="([^"]*)"[^>]*>', archive_html)
    for category in topic_matches:
        if category and f'data-category="{category}"' not in archive_html:
            errors.append(f"archive topic shortcut points to an unknown category: {category}")
    if len(topic_matches) < 7 or len(topic_matches) != len(set(topic_matches)):
        errors.append("archive topic shortcuts must be present and unique")

if not research_css_path.is_file():
    errors.append("missing shared research stylesheet: css/research.css")
else:
    research_css = research_css_path.read_text(encoding="utf-8")
    if ".research-nav" not in research_css or ".archive-topic-button" not in research_css:
        errors.append("shared research stylesheet is missing navigation or archive-topic styles")
    if "@media(prefers-reduced-motion:reduce)" not in research_css:
        errors.append("shared research stylesheet must respect reduced-motion preferences")

if not research_js_path.is_file():
    errors.append("missing methodology language script: js/research.js")

if not ARCHIVE_JS_FILE.is_file():
    errors.append("missing evidence archive script: js/archive.js")
else:
    archive_js = ARCHIVE_JS_FILE.read_text(encoding="utf-8")
    for required_logic in (
        "function normalize",
        "function setLanguage",
        "function sortCards",
        "function matchesDateRange",
        "function applyFilters",
        "preventDefault()",
        "noResults.hidden = visibleCount > 0 || invalidRange",
        "fromDate > toDate",
        "localStorage.setItem('noor-language', language)",
    ):
        if required_logic not in archive_js:
            errors.append(f"archive search/filter/language logic is missing: {required_logic}")

if not ARCHIVE_CSS_FILE.is_file():
    errors.append("missing evidence archive stylesheet: css/archive.css")
else:
    archive_css = ARCHIVE_CSS_FILE.read_text(encoding="utf-8")
    for style_marker in (
        ".archive-filter-grid",
        ".archive-card-grid",
        ".archive-card[hidden]",
        "@media(max-width:420px)",
        "@media(prefers-reduced-motion:reduce)",
    ):
        if style_marker not in archive_css:
            errors.append(f"archive stylesheet is missing responsive/accessibility support: {style_marker}")

if not story_html_path.is_file() or 'href="evidence-archive.html"' not in story_html:
    errors.append("documentary field notes must link to the evidence archive")
elif 'class="story-archive-link" href="evidence-archive.html"' not in story_html:
    errors.append("documentary field-notes header must expose the evidence archive link")

if "runBootSequence()" not in js_source or "OPENING THE HUMANITARIAN FIELD ARCHIVE" not in js_source:
    errors.append("warning entry needs the scripted terminal boot sequence")
if "warningReady.value" not in js_source or "NEXT STEP: READER ACKNOWLEDGEMENT" not in js_source:
    errors.append("terminal boot must lead to the explicit reader confirmation")
if CSS_FILE.exists():
    boot_css = CSS_FILE.read_text(encoding="utf-8")
    if ".noor-warning-screen__boot-terminal" not in boot_css or "@keyframes noor-boot-cursor" not in boot_css:
        errors.append("terminal typing/cursor presentation is missing")
    if ".noor-warning-screen__boot-progress-fill" not in boot_css or "@keyframes noor-boot-scan" not in boot_css:
        errors.append("terminal progress indicator/scan animation is missing")

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


# Validate the research desk as a connected multi-page site in both source and _site builds.
research_pages = (
    "methodology.html",
    "visual-evidence.html",
    "legal-record.html",
    "case-engineers-building.html",
    "case-hind-rajab.html",
    "case-rescue-workers.html",
    "case-high-rise-destruction.html",
    "case-aid-distribution.html",
    "case-school-shelters.html",
    "case-mawasi-tent-strike.html",
    "case-un-commission.html",
)
for page_name in research_pages:
    page_path = ROOT / page_name
    if not page_path.is_file():
        errors.append(f"missing research desk page: {page_name}")
        continue
    page_html = page_path.read_text(encoding="utf-8")
    if not re.search(r"<title>[^<]+</title>", page_html, re.I):
        errors.append(f"missing page title: {page_name}")
    if 'class="research-nav"' not in page_html:
        errors.append(f"research page missing shared navigation: {page_name}")
    page_parser = SiteParser()
    page_parser.feed(page_html)
    page_parser.close()
    for fragment in page_parser.fragments:
        if fragment and fragment not in page_parser.ids:
            errors.append(f"{page_name} has a broken same-page link #{fragment}")
    for local_ref in page_parser.local_refs:
        if not local_ref:
            continue
        target = (ROOT / local_ref).resolve()
        if ROOT.resolve() not in target.parents and target != ROOT.resolve():
            errors.append(f"{page_name} path escapes project root: {local_ref}")
        elif not target.is_file():
            errors.append(f"{page_name} references a missing local file: {local_ref}")
    if page_parser.new_tab_without_safe_rel:
        errors.append(f"{page_name} has unsafe new-tab links: " + ", ".join(page_parser.new_tab_without_safe_rel))
    if page_parser.unlabelled_buttons:
        errors.extend(f"{page_name}: {message}" for message in page_parser.unlabelled_buttons)

visual_js_path = ROOT / "js" / "visual-evidence.js"
if not visual_js_path.is_file():
    errors.append("missing visual evidence filtering script: js/visual-evidence.js")
else:
    visual_js = visual_js_path.read_text(encoding="utf-8")
    for marker in ("visual-query", "visual-kind", "visual-topic", "aria-live", "addEventListener('input', filter)"):
        if marker not in visual_js and marker not in (ROOT / "visual-evidence.html").read_text(encoding="utf-8"):
            errors.append(f"visual evidence filtering is missing required control/logic: {marker}")

if (ROOT / "visual-evidence.html").is_file():
    visual_html = (ROOT / "visual-evidence.html").read_text(encoding="utf-8")
    if re.search(r"<iframe|autoplay=1", visual_html, re.I):
        errors.append("visual evidence index must not embed or autoplay source media")
    for required in ("case-engineers-building.html", "case-hind-rajab.html", "case-rescue-workers.html", "case-high-rise-destruction.html", "case-school-shelters.html", "case-aid-distribution.html", "case-un-commission.html"):
        if required not in visual_html:
            errors.append(f"visual evidence index is missing a related case file link: {required}")

if (ROOT / "legal-record.html").is_file():
    legal_html = (ROOT / "legal-record.html").read_text(encoding="utf-8")
    for required in ("An arrest warrant", "not a conviction", "final judgment on the merits", "case-un-commission.html"):
        if required.lower() not in legal_html.lower():
            errors.append(f"legal record is missing legal-status distinction: {required}")

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
