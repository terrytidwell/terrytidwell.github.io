/* Occupied-cell geometry for the starting-position editor. */
const StartingLayout = (() => {
    const BOARD = { x: 2, y: 5, width: 15, height: 23 };
    function shape(cells) {
        const left = Math.min(...cells.map(c => c.x)), top = Math.min(...cells.map(c => c.y));
        return { cells: cells.map(c => ({ ...c, x: c.x - left, y: c.y - top })),
            width: Math.max(...cells.map(c => c.x)) - left + 1,
            height: Math.max(...cells.map(c => c.y)) - top + 1 };
    }
    function snap(item, x, y) {
        return { x: Math.max(BOARD.x, Math.min(BOARD.x + BOARD.width - item.width, Math.round(x))),
            y: Math.max(BOARD.y, Math.min(BOARD.y + BOARD.height - item.height, Math.round(y))) };
    }
    const world = item => item.cells.map(c => ({ x: c.x + item.x, y: c.y + item.y }));
    function conflicts(items) {
        const marks = items.map(() => new Set());
        let pairs = 0;
        const cells = items.map(world);
        for (let a = 0; a < items.length; a++) for (let b = a + 1; b < items.length; b++) {
            let touching = false;
            cells[a].forEach((ca, i) => cells[b].forEach((cb, j) => {
                if (Math.abs(ca.x - cb.x) <= 1 && Math.abs(ca.y - cb.y) <= 1) {
                    marks[a].add(i); marks[b].add(j); touching = true;
                }
            }));
            if (touching) pairs++;
        }
        return { marks, pairs };
    }
    function create(grid, pieces) {
        const fromIds = ids => ids.map(id => ({ x: id % grid.width, y: Math.floor(id / grid.width),
            letter: grid.str[Math.floor(id / grid.width)][id % grid.width] }));
        const guideCells = grid.str.flatMap((row, y) => [...row].flatMap((letter, x) => letter === '.' ? [] : [{ x, y }]));
        const guide = { ...shape(guideCells), guide: true, color: 0xa2a39e };
        guide.x = BOARD.x + Math.floor((BOARD.width - guide.width) / 2);
        guide.y = BOARD.y + Math.floor((BOARD.height - guide.height) / 2);
        const items = [guide, ...pieces.map((p, index) => ({ ...shape(fromIds(p.cells)), piece: index, color: p.color }))];
        // Best-effort initial spread: avoid overlap first, then edge/diagonal contact.
        // Conflicts remain editable; this is not a claim that a packing solution exists.
        const placed = [guide];
        const ordered = items.slice(1).sort((a, b) => b.cells.length - a.cells.length);
        for (const item of ordered) {
            const occupied = placed.flatMap(world);
            let best = null;
            for (let y = BOARD.y; y <= BOARD.y + BOARD.height - item.height; y++) {
                for (let x = BOARD.x; x <= BOARD.x + BOARD.width - item.width; x++) {
                    let penalty = 0;
                    for (const c of item.cells) for (const other of occupied) {
                        const dx = Math.abs(x + c.x - other.x), dy = Math.abs(y + c.y - other.y);
                        if (dx <= 1 && dy <= 1) penalty += dx === 0 && dy === 0 ? 10000 : 10;
                    }
                    const edge = Math.min(x - BOARD.x, y - BOARD.y,
                        BOARD.x + BOARD.width - item.width - x, BOARD.y + BOARD.height - item.height - y);
                    const score = penalty + edge;
                    if (!best || score < best.score) best = { x, y, score };
                }
            }
            Object.assign(item, { x: best.x, y: best.y }); placed.push(item);
        }
        return items;
    }
    return { BOARD, shape, snap, world, conflicts, create };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = StartingLayout;
