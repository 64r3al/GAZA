#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const projectRoot = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(projectRoot, 'evidence-archive.html'), 'utf8');
const script = fs.readFileSync(path.join(projectRoot, 'js', 'archive.js'), 'utf8');

function toDatasetName(attributeName) {
  return attributeName.slice(5).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

function readAttributes(source) {
  const attributes = {};
  const pattern = /([a-zA-Z_:][\w:.-]*)="([^"]*)"/g;
  let match;
  while ((match = pattern.exec(source))) attributes[match[1]] = match[2];
  return attributes;
}

function buildCards(documentHtml) {
  const cardMatches = [...documentHtml.matchAll(/<article class="archive-card"([^>]*)>([\s\S]*?)<\/article>/g)];
  assert.ok(cardMatches.length >= 8, 'HTML should contain at least eight archive records');

  return cardMatches.map((match) => {
    const attrs = readAttributes(match[1]);
    const dataset = {};
    Object.entries(attrs).forEach(([key, value]) => {
      if (key.startsWith('data-')) dataset[toDatasetName(key)] = value;
    });
    const textContent = match[2].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
    return {
      dataset,
      textContent,
      hidden: false,
      _listeners: {},
      addEventListener(type, callback) {
        (this._listeners[type] ||= []).push(callback);
      },
      dispatch(type, event = {}) {
        (this._listeners[type] || []).forEach((callback) => callback(event));
      },
    };
  });
}

function element(defaultValue = '') {
  return {
    value: defaultValue,
    defaultValue,
    hidden: false,
    textContent: '',
    attributes: {},
    focused: false,
    _listeners: {},
    addEventListener(type, callback) {
      (this._listeners[type] ||= []).push(callback);
    },
    dispatch(type, event = {}) {
      (this._listeners[type] || []).forEach((callback) => callback(event));
    },
    setAttribute(name, value) {
      this.attributes[name] = value;
    },
    getAttribute(name) {
      return this.attributes[name] || null;
    },
    focus() {
      this.focused = true;
    },
  };
}

const cards = buildCards(html);
const container = element();
container.children = cards.slice();
container.querySelectorAll = (selector) => selector === '.archive-card' ? container.children.slice() : [];
container.appendChild = (card) => {
  const oldIndex = container.children.indexOf(card);
  if (oldIndex !== -1) container.children.splice(oldIndex, 1);
  container.children.push(card);
  return card;
};

const inputs = {
  'archive-query': element(''),
  'archive-date-from': element(''),
  'archive-date-to': element(''),
  'archive-category': element(''),
  'archive-location': element(''),
  'archive-source-type': element(''),
  'archive-status': element(''),
  'archive-footage': element(''),
  'archive-sort': element('newest'),
};

const form = element();
form.reset = () => Object.values(inputs).forEach((input) => {
  input.value = input.defaultValue;
});
const nodes = {
  'archive-language': element('العربية'),
  'archive-filter-form': form,
  ...inputs,
  'archive-clear': element(''),
  'archive-card-grid': container,
  'archive-result-count': element(''),
  'archive-no-results': element(''),
  'archive-date-error': element(''),
  'archive-total': element('10'),
};
const document = {
  documentElement: { lang: 'en', dir: 'ltr' },
  title: 'Gaza Evidence Archive | NOOR Field Notes',
  getElementById(id) {
    return nodes[id] || null;
  },
  querySelectorAll() {
    return [];
  },
};
const storage = new Map();
const localStorage = {
  getItem(key) {
    return storage.has(key) ? storage.get(key) : null;
  },
  setItem(key, value) {
    storage.set(key, String(value));
  },
};
vm.runInNewContext(script, { document, localStorage }, { filename: 'archive.js' });

const visibleIds = () => cards.filter((card) => !card.hidden).map((card) => card.dataset.recordId);
const trigger = (node, type) => node.dispatch(type, { preventDefault() {} });
const reset = () => trigger(nodes['archive-clear'], 'click');

assert.equal(nodes['archive-total'].textContent, String(cards.length), 'total record display should be derived from the actual cards');
assert.equal(visibleIds().length, cards.length, 'initial view should show every record');
assert.match(nodes['archive-result-count'].textContent, new RegExp(String(cards.length)), 'initial result count should match the archive');

inputs['archive-query'].value = 'Hind Rajab';
trigger(inputs['archive-query'], 'input');
assert.deepEqual(visibleIds(), ['hind-rajab-and-rescue'], 'keyword search should match the expected case');
reset();
assert.equal(visibleIds().length, cards.length, 'clear button should restore every record');
assert.equal(inputs['archive-query'].value, '', 'clear button should empty the search field');
assert.equal(inputs['archive-sort'].value, 'newest', 'clear button should restore newest-first sorting');
assert.equal(inputs['archive-query'].focused, true, 'clear button should return focus to the search field');

inputs['archive-location'].value = 'rafah';
trigger(inputs['archive-location'], 'change');
assert.deepEqual(visibleIds(), ['aid-workers-tal-as-sultan'], 'location filter should select the Rafah record');
reset();

inputs['archive-source-type'].value = 'journalism';
trigger(inputs['archive-source-type'], 'change');
assert.deepEqual(visibleIds(), ['children-shot-bbc-investigation'], 'source-type filter should isolate the journalism record');
reset();

inputs['archive-status'].value = 'probe';
trigger(inputs['archive-status'], 'change');
assert.equal(visibleIds().length, 2, 'probe status should select the two records with an investigation reported');
assert.ok(visibleIds().includes('hind-rajab-and-rescue'));
assert.ok(visibleIds().includes('aid-workers-tal-as-sultan'));
reset();

inputs['archive-footage'].value = 'primary';
trigger(inputs['archive-footage'], 'change');
assert.equal(visibleIds().length, 3, 'primary-footage filter should select three linked-source records');
reset();

inputs['archive-date-from'].value = '2025-03-20';
inputs['archive-date-to'].value = '2025-03-25';
trigger(inputs['archive-date-to'], 'change');
assert.ok(visibleIds().includes('aid-workers-tal-as-sultan'), 'date filter should include the aid-worker incident inside the selected window');
assert.ok(visibleIds().includes('sexual-violence-detention-report'), 'date filter should include a report whose stated reporting window overlaps the selected dates');
assert.ok(!visibleIds().includes('school-shelter-strikes'), 'date filter should exclude a record ending before the selected window');
reset();

inputs['archive-date-from'].value = '2025-03-25';
inputs['archive-date-to'].value = '2025-03-20';
trigger(inputs['archive-date-to'], 'change');
assert.equal(nodes['archive-date-error'].hidden, false, 'reversed date ranges should show validation feedback');
assert.equal(nodes['archive-no-results'].hidden, true, 'invalid ranges should not display the normal no-matches message');
assert.match(nodes['archive-result-count'].textContent, /Invalid date range/i, 'invalid ranges should announce the validation error');
reset();

inputs['archive-sort'].value = 'oldest';
trigger(inputs['archive-sort'], 'change');
assert.equal(container.children.find((card) => !card.hidden).dataset.recordId, 'hind-rajab-and-rescue', 'oldest-first sort should reorder by event end date');
reset();

trigger(nodes['archive-language'], 'click');
assert.equal(document.documentElement.lang, 'ar', 'language button should switch document language to Arabic');
assert.equal(document.documentElement.dir, 'rtl', 'Arabic mode should switch direction to RTL');
assert.match(document.title, /أرشيف الأدلة/, 'language toggle should localize the page title');
assert.equal(storage.get('noor-language'), 'ar', 'language preference should be saved');
trigger(nodes['archive-language'], 'click');
assert.equal(document.documentElement.lang, 'en', 'language toggle should switch back to English');

console.log('Archive smoke tests passed: keyword, location, source, status, footage, overlapping date ranges, invalid ranges, sorting, reset, and bilingual mode.');
