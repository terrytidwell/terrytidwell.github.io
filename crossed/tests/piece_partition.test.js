const assert = require('node:assert/strict');
const test = require('node:test');
const p = require('../js/piece_partition');
const grid = { str: ['ABC', 'DEF', 'GHI'], width: 3, height: 3, x: 8, y: 15, coordinateSystem: 'screen-columns-rows' };
const candidate = { format: 'crossed-grid-candidate', version: 1, title: 'Test',
    words: ['ABC', 'DEF', 'GHI', 'ADG', 'BEH', 'CFI'], grid };
const run = (g, fixed = []) => {
    let seed = 42;
    const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
    const iterator = p.suggest(g, fixed, random);
    for (let i = 0; i < 100000; i++) { const r = iterator.next(); if (r.done) return r.value; }
    throw new Error('Search did not finish');
};

test('suggestions cover each cell once with unique connected 2–4-cell pieces', () => {
    const result = run(grid);
    assert.ok(result.colors);
    const pieces = p.regions(grid, result.colors);
    assert.equal(pieces.flatMap(x => x.cells).length, 9);
    assert.equal(new Set(pieces.flatMap(x => x.cells)).size, 9);
    assert.ok(pieces.every(x => x.cells.length >= 2 && x.cells.length <= 4));
    assert.deepEqual(p.duplicates(grid, pieces), []);
    assert.ok(pieces.some(x => new Set(x.cells.map(i => i % 3)).size > 1 && new Set(x.cells.map(i => Math.floor(i / 3))).size > 1));
});

test('retry preserves locked boundaries and colors', () => {
    const first = p.regions(grid, run(grid).colors);
    const fixed = [{ ...first[0], color: 3, locked: true }];
    const result = run(grid, fixed);
    assert.ok(result.colors);
    const match = p.regions(grid, result.colors).find(x => x.cells.includes(fixed[0].cells[0]));
    assert.deepEqual(match.cells, fixed[0].cells);
    assert.equal(match.color, 3);
});

test('duplicate signatures ignore translation but preserve orientation and letters', () => {
    const g = { width: 5, height: 2, str: ['AB.AB', '...B.'] };
    assert.equal(p.signature(g, [0, 1]), p.signature(g, [3, 4]));
    assert.notEqual(p.signature(g, [0, 1]), p.signature(g, [3, 8]));
    assert.deepEqual(p.duplicates(g, [{ cells: [0, 1] }, { cells: [3, 4] }]), [0, 1]);
});

test('diagonal cells of the same color stay separate; edge neighbors merge', () => {
    assert.equal(p.regions(grid, { 0: 0, 4: 0 }).length, 2);
    assert.equal(p.regions(grid, { 0: 0, 1: 0, 4: 0 }).length, 1);
});

test('draft round trip preserves title, letter grid, colors, and locks', () => {
    const imported = p.importData(candidate);
    const colors = run(grid).colors;
    const locked = new Set(p.regions(grid, colors)[0].cells);
    const restored = p.importData(JSON.parse(JSON.stringify(p.draft(imported.candidate, colors, locked))));
    assert.deepEqual(restored.candidate.grid, grid);
    assert.deepEqual(restored.colors, colors);
    assert.deepEqual(restored.locked, locked);
    assert.equal(restored.candidate.title, candidate.title);
});

test('import rejects malformed, out-of-bounds, conflicting, disconnected, or ambiguous drafts', () => {
    assert.throws(() => p.importData({ ...candidate, version: 99 }));
    assert.throws(() => p.importData({ ...candidate, grid: { ...grid, x: 16 } }));
    assert.throws(() => p.importData({ ...candidate, words: ['ABC'] }));
    const draft = { ...candidate, format: 'crossed-piece-draft', pieces: [{ cells: [0, 4], color: 0, locked: false }] };
    assert.throws(() => p.importData(draft), /connected/);
    draft.pieces = [{ cells: [0, 1], color: 0, locked: false }, { cells: [1, 2], color: 1, locked: false }];
    assert.throws(() => p.importData(draft), /overlap/);
    draft.pieces = [{ cells: [0], color: 0, locked: false }, { cells: [1], color: 0, locked: false }];
    assert.throws(() => p.importData(draft), /touching/);
});

test('partial manual drafts can be saved and restored', () => {
    const draft = p.draft(candidate, { 0: 2, 1: 2 }, new Set());
    assert.deepEqual(p.importData(draft).colors, { 0: 2, 1: 2 });
});

test('locked duplicate pieces are rejected instead of silently retained', () => {
    const g = { width: 5, height: 1, str: ['AB.AB'] };
    const result = run(g, [{ cells: [0, 1], color: 0, locked: true }, { cells: [3, 4], color: 1, locked: true }]);
    assert.match(result.error, /duplicate/);
});

test('straight four-letter runs split into smaller pieces in either orientation', () => {
    for (const g of [{ width: 4, height: 1, str: ['ABCD'] },
        { width: 1, height: 4, str: ['A', 'B', 'C', 'D'] }]) {
        const result = run(g);
        assert.ok(result.colors);
        assert.deepEqual(p.regions(g, result.colors).map(piece => piece.cells.length), [2, 2]);
        assert.match(run(g, [{ cells: [0, 1, 2, 3], color: 0, locked: true }]).error, /must bend or branch/);
    }
});

test('straight triples and bent four-letter pieces remain allowed', () => {
    for (const g of [{ width: 3, height: 1, str: ['ABC'] },
        { width: 1, height: 3, str: ['A', 'B', 'C'] },
        { width: 2, height: 3, str: ['A.', 'B.', 'CD'] }]) {
        const cells = p.occupied(g);
        const result = run(g, [{ cells, color: 0, locked: true }]);
        assert.ok(result.colors);
        assert.equal(p.regions(g, result.colors).length, 1);
    }
});
