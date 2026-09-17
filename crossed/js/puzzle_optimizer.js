/* Pure grid search. Coordinates here are screen-oriented, not legacy puzzle axes. */
const PuzzleOptimizer = (() => {
    const key = (x, y) => `${x},${y}`;
    const normalize = words => [...new Set(words.map(w => w.trim().toUpperCase()).filter(Boolean))];
    const bounds = cells => {
        const xs = [...cells.values()].map(c => c.x), ys = [...cells.values()].map(c => c.y);
        return { x: Math.min(...xs), y: Math.min(...ys),
            width: Math.max(...xs) - Math.min(...xs) + 1,
            height: Math.max(...ys) - Math.min(...ys) + 1 };
    };
    function crossings(words) {
        return words.map(a => words.map(b => {
            const pairs = [];
            for (let i = 0; i < a.length; i++) for (let j = 0; j < b.length; j++) {
                if (a[i] === b[j]) pairs.push([i, j]);
            }
            return pairs;
        }));
    }
    function place(cells, word, x, y, dx, dy, cols, rows) {
        const next = new Map(cells);
        for (let i = 0; i < word.length; i++) {
            const cx = x + i * dx, cy = y + i * dy, old = next.get(key(cx, cy));
            if (old && old.letter !== word[i]) return null;
            next.set(key(cx, cy), { x: cx, y: cy, letter: word[i] });
        }
        const b = bounds(next);
        return b.width <= cols && b.height <= rows ? next : null;
    }
    // Only use this to accept finished candidates, never to prune partial grids.
    function validate(cells, words) {
        if (!cells.size) return null;
        const allowed = new Set(words), found = new Set();
        for (const c of cells.values()) for (const [dx, dy] of [[1, 0], [0, 1]]) {
            if (cells.has(key(c.x - dx, c.y - dy))) continue;
            let run = '', x = c.x, y = c.y;
            while (cells.has(key(x, y))) { run += cells.get(key(x, y)).letter; x += dx; y += dy; }
            if (run.length < 2) continue;
            if (!allowed.has(run)) return null;
            found.add(run);
        }
        const seen = new Set(), todo = [cells.values().next().value];
        while (todo.length) {
            const c = todo.pop(), k = key(c.x, c.y);
            if (seen.has(k)) continue;
            seen.add(k);
            for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
                const n = cells.get(key(c.x + dx, c.y + dy));
                if (n && !seen.has(key(n.x, n.y))) todo.push(n);
            }
        }
        return seen.size === cells.size ? [...found] : null;
    }
    function snapshot(cells, included, words) {
        const b = bounds(cells);
        const grid = Array.from({ length: b.height }, () => Array(b.width).fill('.'));
        for (const c of cells.values()) grid[c.y - b.y][c.x - b.x] = c.letter;
        return { grid: grid.map(r => r.join('')), width: b.width, height: b.height,
            area: b.width * b.height, included: words.filter(w => included.includes(w)),
            omitted: words.filter(w => !included.includes(w)) };
    }
    const better = (a, b) => !b || a.included.length > b.included.length ||
        (a.included.length === b.included.length && a.area < b.area);
    function create(input, { cols = 15, rows = 23, random = Math.random } = {}) {
        const words = normalize(input);
        if (!words.length || words.some(w => !/^[A-Z]{2,}$/.test(w))) {
            throw new Error('Supply words containing at least two letters A–Z.');
        }
        const pairs = crossings(words);
        let best = null, checked = 0, attempts = 0;
        const shuffle = list => {
            for (let i = list.length - 1; i > 0; i--) {
                const j = Math.floor(random() * (i + 1));
                [list[i], list[j]] = [list[j], list[i]];
            }
            return list;
        };
        function* search() {
            while (true) {
                attempts++;
                const first = Math.floor(random() * words.length), horizontal = random() < 0.5;
                const seed = { id: first, x: 0, y: 0, dx: horizontal ? 1 : 0, dy: horizontal ? 0 : 1 };
                const cells = place(new Map(), words[first], 0, 0, seed.dx, seed.dy, cols, rows);
                let nodes = 0;
                function* visit(board, placed) {
                    if (++nodes > 120) return;
                    checked++;
                    const included = validate(board, words);
                    if (included) {
                        const candidate = snapshot(board, included, words);
                        if (better(candidate, best)) best = candidate;
                    }
                    yield;
                    const used = new Set(placed.map(p => p.id)), options = [], unique = new Set();
                    for (const p of placed) for (let id = 0; id < words.length; id++) {
                        if (used.has(id)) continue;
                        for (const [i, j] of pairs[p.id][id]) {
                            const dx = p.dy, dy = p.dx;
                            const x = p.x + i * p.dx - j * dx, y = p.y + i * p.dy - j * dy;
                            const signature = `${id}:${x},${y},${dx}`;
                            if (unique.has(signature)) continue;
                            unique.add(signature);
                            options.push({ id, x, y, dx, dy });
                        }
                    }
                    // Randomized bounded backtracking permits temporary unintended runs.
                    let branches = 0;
                    for (const p of shuffle(options)) {
                        if (nodes >= 120) break;
                        const next = place(board, words[p.id], p.x, p.y, p.dx, p.dy, cols, rows);
                        yield;
                        if (!next) continue;
                        yield* visit(next, [...placed, p]);
                        if (++branches >= 5) break;
                    }
                }
                if (cells) yield* visit(cells, [seed]);
                yield;
            }
        }
        const iterator = search();
        return { words, step: () => iterator.next(),
            get best() { return best; }, get checked() { return checked; }, get attempts() { return attempts; } };
    }
    return { create, validate, place, bounds, better, normalize };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = PuzzleOptimizer;
