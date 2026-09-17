/* Screen-oriented connected pieces; no Phaser dependencies. */
const PiecePartition = (() => {
    const neighbors = (grid, id) => {
        const x = id % grid.width, y = Math.floor(id / grid.width);
        return [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]
            .filter(([cx, cy]) => cx >= 0 && cy >= 0 && cx < grid.width && cy < grid.height && grid.str[cy][cx] !== '.')
            .map(([cx, cy]) => cy * grid.width + cx);
    };
    const occupied = grid => grid.str.flatMap((row, y) => [...row].flatMap((c, x) => c === '.' ? [] : [y * grid.width + x]));
    function signature(grid, cells) {
        const left = Math.min(...cells.map(i => i % grid.width));
        const top = Math.min(...cells.map(i => Math.floor(i / grid.width)));
        return [...cells].sort((a, b) => a - b).map(i =>
            `${i % grid.width - left},${Math.floor(i / grid.width) - top}:${grid.str[Math.floor(i / grid.width)][i % grid.width]}`).join('|');
    }
    function regions(grid, colors) {
        const seen = new Set(), result = [];
        for (const id of occupied(grid)) {
            if (seen.has(id) || !Number.isInteger(colors[id]) || colors[id] < 0) continue;
            const cells = [], queue = [id], color = colors[id];
            while (queue.length) {
                const n = queue.pop();
                if (seen.has(n)) continue;
                seen.add(n); cells.push(n);
                for (const next of neighbors(grid, n)) if (!seen.has(next) && colors[next] === color) queue.push(next);
            }
            result.push({ cells: cells.sort((a, b) => a - b), color });
        }
        return result;
    }
    function duplicates(grid, pieces) {
        const groups = new Map();
        pieces.forEach((p, i) => {
            const s = signature(grid, p.cells);
            if (!groups.has(s)) groups.set(s, []);
            groups.get(s).push(i);
        });
        return [...groups.values()].filter(g => g.length > 1).flat();
    }
    function importData(data) {
        if (!data || !['crossed-grid-candidate', 'crossed-piece-draft'].includes(data.format) || data.version !== 1) {
            throw new Error('Choose a stage-one grid export or a piece draft (version 1).');
        }
        const grid = data.grid;
        if (typeof data.title !== 'string' || !Array.isArray(data.words) || !data.words.length ||
            data.words.some(w => typeof w !== 'string' || !/^[A-Z]{2,}$/.test(w)) ||
            !grid || !Number.isInteger(grid.width) || !Number.isInteger(grid.height) ||
            grid.width < 1 || grid.width > 15 || grid.height < 1 || grid.height > 23 ||
            grid.coordinateSystem !== 'screen-columns-rows' || !Array.isArray(grid.str) ||
            grid.str.length !== grid.height || grid.str.some(r => typeof r !== 'string' || r.length !== grid.width || !/^[A-Z.]+$/.test(r)) ||
            !Number.isInteger(grid.x) || !Number.isInteger(grid.y) || grid.x < 2 || grid.y < 5 ||
            grid.x + grid.width > 17 || grid.y + grid.height > 28) {
            throw new Error('The imported grid must fit the 15 × 23 board and use screen coordinates.');
        }
        const board = new Map();
        for (const id of occupied(grid)) {
            const x = id % grid.width, y = Math.floor(id / grid.width);
            board.set(`${x},${y}`, { x, y, letter: grid.str[y][x] });
        }
        const optimizer = typeof PuzzleOptimizer !== 'undefined' ? PuzzleOptimizer : require('./puzzle_optimizer');
        const included = optimizer.validate(board, data.words);
        if (!included || !included.length) throw new Error('The grid must be connected and every word run must match the word list.');
        const colors = {}, locked = new Set(), pieces = data.format === 'crossed-piece-draft' ? data.pieces : [];
        if (!Array.isArray(pieces)) throw new Error('The draft is missing its pieces.');
        const all = new Set(occupied(grid));
        for (const p of pieces) {
            if (!p || !Array.isArray(p.cells) || !p.cells.length || !Number.isInteger(p.color) || p.color < 0 || p.color > 3 ||
                typeof p.locked !== 'boolean') throw new Error('A draft piece has invalid cells, color, or lock state.');
            const member = new Set(p.cells), visited = new Set(), queue = [p.cells[0]];
            if (member.size !== p.cells.length || p.cells.some(id => !Number.isInteger(id) || !all.has(id) || colors[id] !== undefined)) {
                throw new Error('Draft pieces overlap or contain cells outside the grid.');
            }
            while (queue.length) {
                const id = queue.pop();
                if (visited.has(id)) continue;
                visited.add(id);
                for (const n of neighbors(grid, id)) if (member.has(n) && !visited.has(n)) queue.push(n);
            }
            if (visited.size !== p.cells.length) throw new Error('Every piece must be orthogonally connected.');
            for (const id of p.cells) { colors[id] = p.color; if (p.locked) locked.add(id); }
        }
        if (regions(grid, colors).length !== pieces.length) throw new Error('Separate touching pieces cannot share a color.');
        return { candidate: { format: 'crossed-grid-candidate', version: 1, title: data.title,
            words: [...new Set(data.words)], included, omitted: data.words.filter(w => !included.includes(w)),
            grid: { ...grid, str: [...grid.str] } }, colors, locked };
    }
    function draft(candidate, colors, locked) {
        return { ...candidate, format: 'crossed-piece-draft', pieces: regions(candidate.grid, colors)
            .map(p => ({ ...p, locked: p.cells.every(id => locked.has(id)) })) };
    }
    // Backtracking four-color assignment. Locked pieces retain their display colors.
    function colorPieces(grid, pieces) {
        const owner = new Map();
        pieces.forEach((p, i) => p.cells.forEach(id => owner.set(id, i)));
        const edges = pieces.map(() => new Set());
        for (const [id, a] of owner) for (const n of neighbors(grid, id)) {
            const b = owner.get(n); if (b !== undefined && a !== b) edges[a].add(b);
        }
        const colors = pieces.map(p => p.locked ? p.color : -1);
        if (edges.some((e, i) => colors[i] >= 0 && [...e].some(j => colors[j] === colors[i]))) return null;
        let attempts = 0;
        function assign() {
            if (++attempts > 10000) return false;
            let target = -1, rank = -1;
            colors.forEach((c, i) => {
                if (c >= 0) return;
                const score = new Set([...edges[i]].map(j => colors[j]).filter(c => c >= 0)).size * 1000 + edges[i].size;
                if (score > rank) { rank = score; target = i; }
            });
            if (target === -1) return true;
            const forbidden = new Set([...edges[target]].map(j => colors[j]));
            for (let c = 0; c < 4; c++) if (!forbidden.has(c)) {
                colors[target] = c;
                if (assign()) return true;
            }
            colors[target] = -1;
            return false;
        }
        return assign() ? Object.fromEntries([...owner].map(([id, p]) => [id, colors[p]])) : null;
    }
    function* suggest(grid, fixed = [], random = Math.random) {
        if (duplicates(grid, fixed).length || fixed.some(p => p.cells.length < 2 || p.cells.length > 4)) {
            return { error: 'Unlock duplicate or oversized/single-cell pieces before suggesting.' };
        }
        const all = occupied(grid), crossing = new Set(all.filter(id => {
            const ns = neighbors(grid, id);
            return ns.some(n => Math.floor(n / grid.width) === Math.floor(id / grid.width)) &&
                ns.some(n => n % grid.width === id % grid.width);
        }));
        const occupiedFixed = new Set(fixed.flatMap(p => p.cells)), available = new Set(all.filter(id => !occupiedFixed.has(id)));
        const options = new Map(all.map(id => [id, []])), unique = new Set();
        for (const root of available) {
            const todo = [[root]];
            while (todo.length) {
                const group = todo.pop().sort((a, b) => a - b), key = group.join(',');
                if (unique.has(key)) continue;
                unique.add(key);
                if (group.length >= 2) {
                    const bends = group.filter(id => crossing.has(id) &&
                        group.some(n => n !== id && Math.floor(n / grid.width) === Math.floor(id / grid.width)) &&
                        group.some(n => n !== id && n % grid.width === id % grid.width)).length;
                    const p = { cells: group, signature: signature(grid, group), priority: bends * 10 + (group.length >= 3 ? 3 : 0) + random() * 4 };
                    for (const id of group) options.get(id).push(p);
                }
                if (group.length < 4) for (const id of group) for (const n of neighbors(grid, id)) {
                    if (available.has(n) && !group.includes(n)) todo.push([...group, n]);
                }
                yield;
            }
        }
        for (const list of options.values()) list.sort((a, b) => b.priority - a.priority);
        const used = new Set(fixed.map(p => signature(grid, p.cells))), chosen = [...fixed];
        function* solve() {
            yield;
            if (!available.size) return colorPieces(grid, chosen);
            let choices = null, rank = Infinity;
            for (const id of available) {
                const valid = options.get(id).filter(p => !used.has(p.signature) && p.cells.every(c => available.has(c)));
                if (!valid.length) return null;
                // Seed at crossings while any remain, then handle the most constrained tails.
                const score = valid.length + (crossing.has(id) ? 0 : 10000);
                if (score < rank) { rank = score; choices = valid; }
            }
            for (const p of choices) {
                p.cells.forEach(id => available.delete(id)); used.add(p.signature); chosen.push(p);
                const result = yield* solve();
                if (result) return result;
                chosen.pop(); used.delete(p.signature); p.cells.forEach(id => available.add(id));
            }
            return null;
        }
        const colors = yield* solve();
        return colors ? { colors } : { error: 'No partition found with these locks. Unlock a piece or edit by hand.' };
    }
    return { neighbors, occupied, regions, signature, duplicates, importData, draft, colorPieces, suggest };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = PiecePartition;
