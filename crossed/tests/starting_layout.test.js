const assert = require('node:assert/strict');
const test = require('node:test');
const layout = require('../js/starting_layout');
const item = (x, y, cells = [{ x: 0, y: 0 }]) => ({ ...layout.shape(cells), x, y });

test('overlap, side contact, and diagonal contact are conflicts', () => {
    for (const [x, y] of [[4, 8], [5, 8], [5, 9], [3, 7]]) {
        const result = layout.conflicts([item(4, 8), item(x, y)]);
        assert.equal(result.pairs, 1);
        assert.deepEqual([...result.marks[0]], [0]);
        assert.deepEqual([...result.marks[1]], [0]);
    }
    assert.equal(layout.conflicts([item(4, 8), item(6, 8)]).pairs, 0);
    assert.equal(layout.conflicts([item(4, 8), item(6, 10)]).pairs, 0);
});

test('internal contacts are allowed and only conflicting cells are marked', () => {
    const group = item(4, 8, [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }]);
    assert.equal(layout.conflicts([group]).pairs, 0);
    const result = layout.conflicts([group, item(7, 8)]);
    assert.deepEqual([...result.marks[0]], [2]);
});

test('empty cells inside the guide bounding box do not cause conflicts', () => {
    const guide = item(4, 8, [{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 0, y: 4 }, { x: 4, y: 4 }]);
    guide.guide = true;
    assert.equal(layout.conflicts([guide, item(6, 10)]).pairs, 0);
    assert.equal(layout.conflicts([guide, item(5, 9)]).pairs, 1);
});

test('snapping clamps the complete shape to the 15 × 23 usable area', () => {
    const group = item(0, 0, [{ x: 0, y: 0 }, { x: 2, y: 1 }]);
    assert.deepEqual(layout.snap(group, -10, -10), { x: 2, y: 5 });
    assert.deepEqual(layout.snap(group, 100, 100), { x: 14, y: 26 });
    assert.deepEqual(layout.snap(group, 8.4, 10.6), { x: 8, y: 11 });
});

test('initial spread centers the guide and preserves letters and piece shape within bounds', () => {
    const grid = { width: 3, height: 3, str: ['CAT', 'A.E', 'TEN'] };
    const pieces = [{ cells: [0, 1, 3], color: 0 }, { cells: [2, 5], color: 1 }, { cells: [6, 7, 8], color: 2 }];
    const items = layout.create(grid, pieces);
    assert.equal(items.length, 4);
    assert.deepEqual({ x: items[0].x, y: items[0].y }, { x: 8, y: 15 });
    assert.equal(items[0].cells.length, 8);
    assert.deepEqual(items[1].cells.map(c => c.letter), ['C', 'A', 'A']);
    assert.deepEqual(items[2].cells.map(c => [c.x, c.y]), [[0, 0], [0, 1]]);
    for (const part of items) for (const c of layout.world(part)) {
        assert.ok(c.x >= 2 && c.x <= 16 && c.y >= 5 && c.y <= 27);
    }
    assert.equal(layout.conflicts(items).pairs, 0);
});
