const assert = require('node:assert/strict');
const test = require('node:test');
const optimizer = require('../js/puzzle_optimizer');
const cells = rows => {
    const result = new Map();
    rows.forEach((row, y) => [...row].forEach((letter, x) => {
        if (letter !== '.') result.set(`${x},${y}`, { x, y, letter });
    }));
    return result;
};

test('matching overlaps can close a loop with two existing intersections', () => {
    const board = cells(['CAT', 'A.O', 'T.P']);
    const closed = optimizer.place(board, 'TOP', 0, 2, 1, 0, 15, 23);
    assert.equal(closed.size, 8);
    assert.deepEqual(new Set(optimizer.validate(closed, ['CAT', 'TOP'])), new Set(['CAT', 'TOP']));
    assert.equal(optimizer.place(board, 'TAP', 0, 0, 1, 0, 15, 23), null);
});

test('temporarily invalid runs can become exact words; emergent words count', () => {
    const words = ['ABC', 'DEF', 'GHI', 'ADG', 'BEH', 'CFI'];
    const partial = cells(['ABC', 'DEF']);
    assert.equal(optimizer.validate(partial, words), null);
    const completed = optimizer.place(partial, 'GHI', 0, 2, 1, 0, 15, 23);
    assert.deepEqual(new Set(optimizer.validate(completed, words)), new Set(words));
    assert.equal(optimizer.validate(completed, words.filter(w => w !== 'CFI')), null);
});

test('islands are invalid even when every run is a supplied word', () => {
    assert.equal(optimizer.validate(cells(['CAT...DOG']), ['CAT', 'DOG']), null);
});

test('bounds are translation independent and enforce both dimensions', () => {
    assert.ok(optimizer.place(new Map(), 'A'.repeat(23), -50, -50, 0, 1, 15, 23));
    assert.equal(optimizer.place(new Map(), 'A'.repeat(24), 0, 0, 0, 1, 15, 23), null);
    assert.equal(optimizer.place(new Map(), 'A'.repeat(16), 0, 0, 1, 0, 15, 23), null);
});

test('ranking prefers word count, then area, and retains exact ties', () => {
    const best = { included: ['A', 'B'], area: 30 };
    assert.equal(optimizer.better({ included: ['A'], area: 2 }, best), false);
    assert.equal(optimizer.better({ included: ['A', 'B', 'C'], area: 100 }, best), true);
    assert.equal(optimizer.better({ included: ['A', 'B'], area: 29 }, best), true);
    assert.equal(optimizer.better({ included: ['A', 'B'], area: 30 }, best), false);
});

test('seeded Movie Night search produces a valid bounded grid and never regresses', () => {
    let seed = 123;
    const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
    const words = 'MYSTERY MUSICAL THRILLER WESTERN ACTION HORROR DOCUMENTARY DRAMA COMEDY ROMANCE'.split(' ');
    const search = optimizer.create(words, { random });
    let previous = null;
    for (let i = 0; i < 100000; i++) {
        search.step();
        if (search.best !== previous) {
            assert.ok(optimizer.better(search.best, previous));
            previous = search.best;
        }
    }
    assert.equal(search.best.included.length, 10);
    assert.ok(search.best.width <= 15 && search.best.height <= 23);
    assert.deepEqual(new Set(optimizer.validate(cells(search.best.grid), words)), new Set(words));
});
