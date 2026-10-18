#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const story = read('a-hard-pill-to-swallow.html');
const archive = read('evidence-archive.html');
const methodology = read('methodology.html');
const stylesheet = read('css/research.css');
const script = read('js/research.js');
const archiveScript = read('js/archive.js');
const builder = read('scripts/build_site.py');

assert.match(story, /class="research-nav"/, 'Field notes should include shared research navigation.');
assert.match(archive, /class="research-nav"/, 'Archive should include shared research navigation.');
assert.match(methodology, /class="research-nav"/, 'Methodology should include shared research navigation.');
assert.match(story, /href="methodology\.html"/, 'Field notes should link to methodology.');
assert.match(archive, /href="methodology\.html"/, 'Archive should link to methodology.');
assert.match(methodology, /href="evidence-archive\.html"/, 'Methodology should link to the archive.');
assert.match(methodology, /href="a-hard-pill-to-swallow\.html"/, 'Methodology should link to field notes.');
assert.match(methodology, /not affiliated with UNICEF/i, 'Methodology must make independence clear.');
assert.match(methodology, /An arrest warrant is not a conviction/i, 'Methodology must distinguish warrants from convictions.');
assert.match(methodology, /18\+ confirmation is an access warning/i, 'Methodology must distinguish access warnings from verification.');
assert.match(methodology, /issues\/new/, 'Methodology should provide a public correction route.');
assert.match(story, /video-ack-engineers/, 'Existing video-consent gate must remain present.');
assert.match(story, /x-video-ack-prcs/, 'Existing X consent controls must remain present.');

const topicButtons = [...archive.matchAll(/<button\b[^>]*data-archive-category="([^"]*)"[^>]*>/g)].map((match) => match[1]);
assert.ok(topicButtons.length >= 7, 'Archive should offer quick topic shortcuts.');
assert.equal(new Set(topicButtons).size, topicButtons.length, 'Topic shortcuts must be unique.');
for (const category of topicButtons.filter(Boolean)) {
  assert.ok(archive.includes('data-category="' + category + '"'), 'Topic shortcut must match an existing category: ' + category);
}
assert.match(archiveScript, /data-archive-category/, 'Archive script should wire quick topic shortcuts.');
assert.match(archiveScript, /aria-pressed/, 'Topic shortcut selection must be accessible.');
assert.match(stylesheet, /prefers-reduced-motion:\s*reduce/, 'New effects must respect reduced-motion settings.');
assert.match(stylesheet, /\.research-nav/, 'Shared navigation styles should exist.');
assert.match(stylesheet, /\.archive-topic-directory/, 'Archive topic shortcut styles should exist.');
assert.match(script, /methodology-language/, 'Methodology language control should be wired.');
assert.match(builder, /"methodology\.html"/, 'Production build must copy methodology.html.');
assert.match(builder, /"css", "js", "assets"/, 'Production build must copy shared assets.');

const home = read('index.html');
assert.match(home, /href="a-hard-pill-to-swallow\.html"/, 'Charity homepage must retain its separate evidence entrance.');
assert.match(home, /UNICEF/, 'Charity homepage must retain UNICEF response content.');

console.log('Research UX checks passed: cross-page navigation, topic filters, methodology, consent gates and production build inclusion.');
