#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const layout = require('../js/archive-map-layout.js');
const root = path.resolve(__dirname, '..');
const archive = fs.readFileSync(path.join(root, 'evidence-archive.html'), 'utf8');
const mapScript = fs.readFileSync(path.join(root, 'js/archive-map.js'), 'utf8');

const recordAttrs = [...archive.matchAll(/<article class="archive-card"([^>]*)>/g)].map((match) => {
  const attrs = match[1];
  const attr = (name) => (attrs.match(new RegExp('\\b' + name + '="([^"]+)"')) || [])[1] || '';
  return { key: 'record:' + attr('data-record-id'), category: attr('data-category'), attrs };
});
assert.equal(recordAttrs.length, 18, 'The map must be based on all 18 existing archive records.');
assert.equal(new Set(recordAttrs.map((record) => record.key)).size, 18, 'Map record IDs must be unique.');
assert.ok(recordAttrs.every((record) => record.category), 'Every record must be assigned to a topic hub.');

const angles = {
  'food-nutrition': -90, 'child-casualties': -50, 'civilian-harm': -10,
  displacement: 30, 'aid-workers': 70, 'aid-access': 110,
  'schools-shelters': 150, destruction: 190, detention: 230
};
const center = { x: 1100, y: 800 };
const keys = [...new Set(recordAttrs.map((record) => record.category))];
const categories = keys.map((key) => {
  const theta = (angles[key] == null ? -90 : angles[key]) * Math.PI / 180;
  return {
    key, id: 'topic:' + key, theta,
    x: center.x + Math.cos(theta) * 330,
    y: center.y + Math.sin(theta) * 330,
    records: []
  };
}).sort((left, right) => left.theta - right.theta);
const records = recordAttrs.map((record, index) => ({
  ...record, index, x: center.x, y: center.y
}));
categories.forEach((hub) => {
  hub.records = records.filter((record) => record.category === hub.key);
  hub.records.forEach((record, index) => {
    const row = Math.floor(index / 2);
    const col = index % 2;
    const rowCount = Math.min(2, hub.records.length - row * 2);
    const offset = rowCount === 1 ? 0 : (col === 0 ? -132 : 132);
    const radialDistance = 150 + row * 126;
    record.x = hub.x + Math.cos(hub.theta) * radialDistance - Math.sin(hub.theta) * offset;
    record.y = hub.y + Math.sin(hub.theta) * radialDistance + Math.cos(hub.theta) * offset;
  });
});

const result = layout.layoutRecordsWithoutCollisions(records, categories, {
  center, recordWidth: 226, recordHeight: 122, hubWidth: 170, hubHeight: 70,
  rootWidth: 168, rootHeight: 168, margin: 20
});
assert.equal(result.records.length, 18, 'Collision layout must retain every record node.');
assert.deepEqual(result.overlaps, [], 'Record cards must not overlap each other, any topic hub, or the central archive.');
for (const record of result.records) {
  assert.ok(Number.isFinite(record.x) && Number.isFinite(record.y), 'Every node must have finite coordinates: ' + record.key);
  const hub = categories.find((category) => category.key === record.category);
  assert.ok(Math.hypot(record.x - hub.x, record.y - hub.y) < 780, 'Record should remain connected to its topic cluster: ' + record.key);
}
for (let i = 0; i < categories.length; i += 1) {
  for (let j = i + 1; j < categories.length; j += 1) {
    const a = categories[i], b = categories[j];
    const overlapX = (170 + 170) / 2 + 20 - Math.abs(a.x - b.x);
    const overlapY = (70 + 70) / 2 + 20 - Math.abs(a.y - b.y);
    assert.ok(!(overlapX > 0 && overlapY > 0), 'Topic hubs must not overlap: ' + a.key + ' / ' + b.key);
  }
}
assert.match(mapScript, /layoutRecordsWithoutCollisions\(records, categories\)/, 'The live map must use the tested collision solver.');
assert.match(archive, /src="js\/archive-map-layout\.js" defer/, 'The tested layout solver must load before the map renderer.');
assert.match(archive, /id="archive-network-viewport"/, 'The map viewport must remain in the archive page.');

console.log('Archive map layout passed: 18 records positioned with no overlapping source cards or topic hubs.');
