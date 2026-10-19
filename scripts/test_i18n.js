#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const locales = ['en', 'ar', 'fr', 'es', 'pt', 'de'];
const pages = [
  'index.html',
  'a-hard-pill-to-swallow.html',
  'evidence-archive.html',
  'methodology.html',
  'visual-evidence.html',
  'legal-record.html',
  'case-engineers-building.html',
  'case-hind-rajab.html',
  'case-rescue-workers.html',
  'case-high-rise-destruction.html',
  'case-aid-distribution.html',
  'case-school-shelters.html',
  'case-mawasi-tent-strike.html',
  'case-un-commission.html',
];

const dictionarySource = read('js/i18n-content.js');
const dictionaryContext = { window: {} };
vm.runInNewContext(dictionarySource, dictionaryContext, { timeout: 3000 });
const rows = dictionaryContext.window.NOORTranslationRows;
assert.ok(Array.isArray(rows) && rows.length >= 180, 'Six-language translation dictionary should be registered.');
for (const [index, row] of rows.entries()) {
  assert.equal(row.length, 6, 'Translation row ' + index + ' must contain EN, AR, FR, ES, PT and DE.');
  assert.ok(row.every((value) => typeof value === 'string' && value.trim()), 'Translation row ' + index + ' must not have empty locale text.');
}

const runtime = read('js/i18n.js');
assert.match(runtime, /const LANGUAGES = \['en', 'ar', 'fr', 'es', 'pt', 'de'\]/, 'Shared runtime must support all six languages.');
assert.match(runtime, /function addTranslations\(extraRows\)/, 'Runtime must register the extended dictionary.');
assert.match(runtime, /addTranslations\(window\.NOORTranslationRows\)/, 'Dictionary must be registered before first locale render.');
assert.match(runtime, /noor:languagechange/, 'Runtime must announce completed locale changes.');
assert.match(runtime, /html\.dir = isRtl \? 'rtl' : 'ltr'/, 'Runtime must control direction using the selected locale.');

for (const pageName of pages) {
  const html = read(pageName);
  const languageControls = [...html.matchAll(/<select\b[^>]*data-noor-language-select[^>]*>([\s\S]*?)<\/select>/g)];
  assert.equal(languageControls.length, 1, pageName + ' should have exactly one shared language selector.');
  for (const locale of locales) {
    assert.match(languageControls[0][1], new RegExp('<option value="' + locale + '">'), pageName + ' is missing option ' + locale + '.');
  }
  assert.ok(html.includes('href="css/i18n.css"'), pageName + ' should load shared locale layout rules.');
  const dictIndex = html.indexOf('src="js/i18n-content.js"');
  const runtimeIndex = html.indexOf('src="js/i18n.js"');
  assert.ok(dictIndex >= 0 && runtimeIndex > dictIndex, pageName + ' must load translations before the runtime.');
  assert.doesNotMatch(html, /id="(?:lang|story-language|archive-language|methodology-language)"/, pageName + ' must not retain the old two-language-only control.');
  assert.match(html, /<html[^>]*lang="en"[^>]*dir="ltr"/i, pageName + ' should have a safe English baseline before the saved locale loads.');
}

const css = read('css/i18n.css');
assert.match(css, /:root\[lang="ar"\]/, 'Arabic typography must be explicit.');
assert.match(css, /:root\[dir="rtl"\]/, 'RTL layout handling must be explicit.');
assert.match(css, /unicode-bidi/, 'Mixed-script text must have bidi protections.');
assert.match(css, /\.noor-language-select/, 'Shared language control styles must be present.');

const mapScript = read('js/archive-map.js');
assert.match(mapScript, /function getLang/, 'Map must read the central selected language.');
assert.match(mapScript, /const MAP_COPY = \{[\s\S]*?de:/, 'Dynamic map labels must support all six locales.');
assert.match(mapScript, /text-anchor.*anchor|text-anchor': anchor/, 'SVG text alignment must be locale-aware.');
assert.match(mapScript, /noor:languagechange/, 'Map must rerender when the language changes.');
assert.match(mapScript, /wrapWords\(record\.title, titleMax, 2\)/, 'Map title wrapping must adapt to RTL text width.');

for (const script of ['js/i18n.js','js/i18n-content.js','js/main.js','js/story.js','js/archive.js','js/research.js','js/archive-map.js']) {
  const { execFileSync } = require('node:child_process');
  execFileSync(process.execPath, ['--check', path.join(root, script)]);
}

console.log('Localization checks passed: six locales, 14 pages, translation-row integrity, shared controls, RTL layout and map language-change handling.');
