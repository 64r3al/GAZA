(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.NOORArchiveMapLayout = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function layoutRecordsWithoutCollisions(records, categories, options) {
    const opts = options || {};
    const center = opts.center || { x: 1100, y: 800 };
    const recordW = opts.recordWidth || 226;
    const recordH = opts.recordHeight || 100;
    const hubW = opts.hubWidth || 170;
    const hubH = opts.hubHeight || 70;
    const rootW = opts.rootWidth || 168;
    const rootH = opts.rootHeight || 168;
    const margin = opts.margin == null ? 20 : opts.margin;
    const targets = new Map(records.map((record) => [record.key, { x: record.x, y: record.y }]));
    const fixed = [
      { x: center.x, y: center.y, w: rootW, h: rootH, key: 'archive-root' },
      ...categories.map((hub) => ({ x: hub.x, y: hub.y, w: hubW, h: hubH, key: hub.id }))
    ];

    // Deterministic, tethered collision relaxation keeps record nodes near
    // their topic while guaranteeing that their rectangular cards do not overlap.
    for (let iteration = 0; iteration < 420; iteration += 1) {
      const tether = iteration < 240 ? 0.018 : 0.006;
      records.forEach((record) => {
        const target = targets.get(record.key);
        record.x += (target.x - record.x) * tether;
        record.y += (target.y - record.y) * tether;
      });

      for (let i = 0; i < records.length; i += 1) {
        const a = records[i];
        const collide = (b, isRecord, j) => {
          const bW = isRecord ? recordW : b.w;
          const bH = isRecord ? recordH : b.h;
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const overlapX = (recordW + bW) / 2 + margin - Math.abs(dx);
          const overlapY = (recordH + bH) / 2 + margin - Math.abs(dy);
          if (overlapX <= 0 || overlapY <= 0) return;

          if (overlapX <= overlapY) {
            const direction = dx === 0 ? ((i + j) % 2 ? 1 : -1) : Math.sign(dx);
            const push = overlapX + 1;
            if (isRecord) {
              a.x += direction * push * 0.51;
              b.x -= direction * push * 0.49;
            } else {
              a.x += direction * push;
            }
          } else {
            const direction = dy === 0 ? ((i + j) % 2 ? 1 : -1) : Math.sign(dy);
            const push = overlapY + 1;
            if (isRecord) {
              a.y += direction * push * 0.51;
              b.y -= direction * push * 0.49;
            } else {
              a.y += direction * push;
            }
          }
        };

        fixed.forEach((item, index) => collide(item, false, index + records.length));
        for (let j = i + 1; j < records.length; j += 1) {
          collide(records[j], true, j);
        }
      }
    }

    // Final separation projection: stop once the layout has no card/hub collisions.
    let collisions = 0;
    for (let pass = 0; pass < 240; pass += 1) {
      collisions = 0;
      for (let i = 0; i < records.length; i += 1) {
        const a = records[i];
        const resolve = (b, isRecord, j) => {
          const bW = isRecord ? recordW : b.w;
          const bH = isRecord ? recordH : b.h;
          const overlapX = (recordW + bW) / 2 + margin - Math.abs(a.x - b.x);
          const overlapY = (recordH + bH) / 2 + margin - Math.abs(a.y - b.y);
          if (overlapX <= 0 || overlapY <= 0) return;
          collisions += 1;

          if (overlapX <= overlapY) {
            const sign = a.x === b.x ? ((i + j) % 2 ? 1 : -1) : Math.sign(a.x - b.x);
            const shift = overlapX + 2;
            if (isRecord) {
              a.x += sign * shift * 0.51;
              b.x -= sign * shift * 0.49;
            } else {
              a.x += sign * shift;
            }
          } else {
            const sign = a.y === b.y ? ((i + j) % 2 ? 1 : -1) : Math.sign(a.y - b.y);
            const shift = overlapY + 2;
            if (isRecord) {
              a.y += sign * shift * 0.51;
              b.y -= sign * shift * 0.49;
            } else {
              a.y += sign * shift;
            }
          }
        };

        fixed.forEach((item, index) => resolve(item, false, index + records.length));
        for (let j = i + 1; j < records.length; j += 1) {
          resolve(records[j], true, j);
        }
      }
      if (collisions === 0) break;
    }

    // Verify rather than silently returning a broken map if a future dataset is dense.
    const overlaps = [];
    for (let i = 0; i < records.length; i += 1) {
      const a = records[i];
      for (let j = i + 1; j < records.length; j += 1) {
        const b = records[j];
        const dx = (recordW + recordW) / 2 + margin - Math.abs(a.x - b.x);
        const dy = (recordH + recordH) / 2 + margin - Math.abs(a.y - b.y);
        if (dx > 0 && dy > 0) overlaps.push([a.key, b.key]);
      }
      fixed.forEach((b) => {
        const dx = (recordW + b.w) / 2 + margin - Math.abs(a.x - b.x);
        const dy = (recordH + b.h) / 2 + margin - Math.abs(a.y - b.y);
        if (dx > 0 && dy > 0) overlaps.push([a.key, b.key]);
      });
    }

    return { records, overlaps, fixed };
  }

  return { layoutRecordsWithoutCollisions };
}));
