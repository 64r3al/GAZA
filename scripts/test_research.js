#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const story = read('a-hard-pill-to-swallow.html');
const archive = read('evidence-archive.html');
const methodology = read('methodology.html');
const legal = read('legal-record.html');
const visual = read('visual-evidence.html');
const stylesheet = read('css/research.css');
const script = read('js/research.js');
const visualScript = read('js/visual-evidence.js');
const archiveMapScript = read('js/archive-map.js');
const archiveMapLayout = read('js/archive-map-layout.js');
execFileSync(process.execPath, ['--check', path.join(root, 'js/visual-evidence.js')]);
execFileSync(process.execPath, ['--check', path.join(root, 'js/archive-map.js')]);
execFileSync(process.execPath, ['--check', path.join(root, 'js/archive-map-layout.js')]);
const archiveScript = read('js/archive.js');
const builder = read('scripts/build_site.py');
const caseFiles = [
  'case-engineers-building.html',
  'case-hind-rajab.html',
  'case-rescue-workers.html',
  'case-high-rise-destruction.html',
  'case-aid-distribution.html',
  'case-school-shelters.html',
  'case-mawasi-tent-strike.html',
  'case-un-commission.html',
];

assert.match(story, /class="research-nav"/, 'Field notes should include shared navigation.');
assert.match(archive, /class="research-nav"/, 'Archive should include shared navigation.');
assert.match(methodology, /class="research-nav"/, 'Methodology should include shared navigation.');
for (const page of [story, archive, methodology, legal, visual, ...caseFiles.map(read)]) {
  const navStart = page.indexOf('<nav class="research-nav"');
  const navEnd = page.indexOf('</nav>', navStart);
  const nav = navStart >= 0 && navEnd >= 0 ? page.slice(navStart, navEnd + '</nav>'.length) : '';
  assert.ok(nav, 'Every research page should include the shared navigation.');
  assert.ok(nav.includes('href="visual-evidence.html"'), 'Research navigation should link to visual evidence.');
  assert.ok(nav.includes('href="legal-record.html"'), 'Research navigation should link to the legal record.');
  assert.ok(nav.includes('href="methodology.html"'), 'Research navigation should link to methodology.');
}
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
assert.ok(archive.includes('id="archive-network-explorer"'), 'Archive should provide the interactive network explorer.');
assert.ok(archive.includes('id="archive-network-viewport"'), 'Network explorer should have an interactive viewport.');
assert.ok(archive.includes('id="archive-network-svg"'), 'Network explorer should render an SVG network.');
assert.ok(archive.includes('id="archive-network-world"'), 'Network map should have a transformable world layer.');
assert.ok(archive.includes('id="archive-map-query"'), 'Network explorer should provide node search.');
assert.ok(archive.includes('id="archive-map-topic"'), 'Network explorer should filter by topic.');
assert.ok(archive.includes('id="archive-map-fit"'), 'Network explorer should provide a fit-to-map control.');
assert.ok(archive.includes('src="js/archive-map-layout.js" defer'), 'Map layout module must load before the renderer.');
assert.match(archiveMapScript, /layoutRecordsWithoutCollisions\(records, categories\)/, 'The map renderer must use the collision solver.');
assert.match(archiveMapLayout, /result|overlaps/, 'The shared map layout solver must verify collision results.');
assert.match(archiveMapScript, /archive-filter-form/, 'Map state should sync with the existing archive filter form.');
assert.match(archiveMapScript, /archiveClearButton/, 'Clearing detailed archive filters should resync the map.');
assert.ok(archive.includes('id="archive-total"'), 'Existing live archive record total must remain available.');
assert.match(archiveMapScript, /pointerdown/, 'Network map should support pointer-driven panning.');
assert.match(archiveMapScript, /addEventListener\('wheel'/, 'Network map should support wheel zoom.');
assert.match(archiveMapScript, /ArrowLeft|ArrowRight|ArrowUp|ArrowDown/, 'Network map should support keyboard panning.');
assert.match(archiveMapScript, /aria-pressed/, 'Network nodes should expose selected state accessibly.');
assert.match(archiveMapScript, /caseLinks/, 'Selected records should expose connected case files.');
assert.match(stylesheet, /\.archive-network-viewport/, 'Network map viewport styles should be present.');
assert.match(stylesheet, /\.archive-network-edge-ring/, 'Network map should style its spider-web connections.');
assert.match(stylesheet, /\.archive-network-details/, 'Network map should provide a source details panel.');
assert.match(stylesheet, /@media\(max-width:760px\)/, 'Network map should include mobile layouts.');
assert.match(archive, /id="case-directory"/, 'Archive should expose a dedicated dossier directory.');
for (const file of caseFiles) {
  assert.ok(archive.includes('href="' + file + '"'), 'Archive should link to case file: ' + file);
}
assert.match(archiveScript, /data-archive-category/, 'Archive script should wire quick topic shortcuts.');
assert.match(archiveScript, /aria-pressed/, 'Topic shortcut selection must be accessible.');
assert.match(visual, /id="visual-query"/, 'Visual index should include keyword search.');
assert.match(visual, /id="visual-kind"/, 'Visual index should filter by material type.');
assert.match(visual, /id="visual-topic"/, 'Visual index should filter by topic.');
assert.match(visual, /aria-live="polite"/, 'Visual index should announce result count changes.');
assert.match(visualScript, /addEventListener\('input', filter\)/, 'Visual index filters should respond to input changes.');
assert.match(visualScript, /visible === 1 \? ' source entry' : ' source entries'/, 'Visual index should update singular/plural result counts.');
assert.doesNotMatch(visual, /<iframe|autoplay=1/i, 'Visual index must not embed or autoplay source media.');
assert.match(legal, /not a conviction/i, 'Legal index must distinguish warrants and convictions.');
assert.match(legal, /final judgment on the merits/i, 'Legal index must distinguish procedural measures from final judgments.');
assert.match(legal, /case-un-commission\.html/, 'Legal index should connect to the inquiry case file.');
assert.match(stylesheet, /prefers-reduced-motion:\s*reduce/, 'Motion should respect reduced-motion settings.');
for (const selector of ['.research-nav', '.archive-topic-directory', '.research-timeline', '.research-visual-grid', '.research-case-directory-grid']) {
  assert.ok(stylesheet.includes(selector), 'Shared research stylesheet should include ' + selector);
}
assert.match(script, /methodology-language/, 'Methodology language control should be wired.');
for (const file of caseFiles) {
  const page = read(file);
  assert.match(page, /research-timeline/, file + ' should show a timeline.');
  assert.match(page, /research-source-list/, file + ' should include a source trail.');
  assert.match(page, /research-caution/, file + ' should clarify status and limitations.');
}
assert.match(builder, /"visual-evidence\.html"/, 'Production build must copy the visual evidence index.');
assert.match(builder, /"legal-record\.html"/, 'Production build must copy the legal record.');
assert.match(builder, /"case-un-commission\.html"/, 'Production build must copy the case files.');
assert.match(builder, /"css", "js", "assets"/, 'Production build must copy shared assets.');

const home = read('index.html');
assert.match(home, /href="a-hard-pill-to-swallow\.html"/, 'Charity homepage must retain its separate evidence entrance.');
assert.match(home, /UNICEF/, 'Charity homepage must retain UNICEF response content.');
assert.doesNotMatch(home, /research-nav|case-directory|visual-evidence\.html|legal-record\.html/, 'Charity homepage must stay outside the redesigned research navigation.');

console.log('Research UX checks passed: dossiers, source links, legal/visual indexes, topic filters, consent gates and production build inclusion.');
