const PUZZLE_BUILDER_INPUT = {
    title: 'MOVIE NIGHT',
    words: ['MYSTERY', 'MUSICAL', 'THRILLER', 'WESTERN', 'ACTION', 'HORROR',
        'DOCUMENTARY', 'DRAMA', 'COMEDY', 'ROMANCE'],
    batchMs: 3000,
};

class PuzzleBuilderScene extends Phaser.Scene {
    constructor() { super({ key: 'PuzzleBuilderScene' }); }
    create() {
        this.best = null;
        this.batch = 0;
        this.running = false;
        this.add.rectangle(540, 960, 1020, 1860, 0xffffff);
        const label = (x, y, text, size, color = '#3c3c3c') =>
            this.add.text(x, y, text, { fontFamily: 'Outfit-SemiBold', fontSize: size, color }).setOrigin(0.5);
        label(540, 55, 'PUZZLE BUILDER · GRID SEARCH', 30, '#3d9ca0');
        // Reserve two lines for titles, using the same wrap width/font size as gameplay.
        this.titleLabel = this.add.text(540, 135, PUZZLE_BUILDER_INPUT.title, {
            fontFamily: 'Outfit-SemiBold', fontSize: 50, color: '#3c3c3c', align: 'center',
            wordWrap: { width: 1020, useAdvancedWrap: true },
        }).setOrigin(0.5);
        this.score = label(540, 215, 'Searching for a connected grid…', 28);
        this.status = label(540, 250, '', 24);
        // Same cell centers as the playable area: columns 2..16, rows 5..27.
        const lines = this.add.graphics().lineStyle(1, 0xdedede, 1);
        for (let x = 0; x <= 15; x++) lines.lineBetween(90 + x * 60, 270, 90 + x * 60, 1650);
        for (let y = 0; y <= 23; y++) lines.lineBetween(90, 270 + y * 60, 990, 270 + y * 60);
        this.tiles = this.add.container(0, 0);
        this.wordsLabel = this.add.text(90, 1668, '', { fontFamily: 'Outfit-SemiBold',
            fontSize: 23, color: '#3c3c3c', wordWrap: { width: 900 } });
        const button = (x, text, action) => {
            const box = this.add.rectangle(x, 1840, 280, 66, 0x3d9ca0).setInteractive({ useHandCursor: true });
            label(x, 1840, text, 27, '#ffffff');
            box.on('pointerdown', action);
            return box;
        };
        this.keep = button(230, 'KEEP LOOKING', () => { if (!this.running) this.startBatch(); });
        this.restart = button(540, 'RESTART SEARCH', () => {
            if (this.running) return;
            this.best = null;
            this.batch = 0;
            this.tiles.removeAll(true);
            this.score.setText('Searching for a connected grid…');
            this.wordsLabel.setText('');
            this.startBatch();
        });
        this.exportButton = button(850, 'EXPORT CANDIDATE', () => this.exportCandidate());
        this.startBatch();
    }
    startBatch() {
        this.optimizer = PuzzleOptimizer.create(PUZZLE_BUILDER_INPUT.words);
        this.batch++;
        this.started = performance.now();
        this.running = true;
        this.keep.setAlpha(0.35);
        this.restart.setAlpha(0.35);
        this.exportButton.setAlpha(0.35);
    }
    update() {
        if (!this.running) return;
        const deadline = this.started + PUZZLE_BUILDER_INPUT.batchMs;
        const sliceEnd = Math.min(performance.now() + 8, deadline);
        while (performance.now() < sliceEnd) this.optimizer.step();
        const candidate = this.optimizer.best;
        if (candidate && PuzzleOptimizer.better(candidate, this.best)) {
            this.best = candidate;
            this.drawBest();
        }
        const remaining = Math.max(0, deadline - performance.now());
        this.status.setText(`Batch ${this.batch} · ${this.optimizer.checked.toLocaleString()} candidates · ` +
            (remaining ? `${(remaining / 1000).toFixed(1)}s remaining` : 'Done — review or keep looking'));
        if (!remaining) {
            this.running = false;
            this.keep.setAlpha(1);
            this.restart.setAlpha(1);
            this.exportButton.setAlpha(this.best ? 1 : 0.35);
            if (!this.best) this.score.setText('No valid grid found. Try another batch.');
        }
    }
    drawBest() {
        const b = this.best;
        this.tiles.removeAll(true);
        const left = 2 + Math.floor((15 - b.width) / 2), top = 5 + Math.floor((23 - b.height) / 2);
        b.grid.forEach((row, y) => [...row].forEach((letter, x) => {
            if (letter === '.') return;
            const px = (left + x) * 60, py = (top + y) * 60;
            this.tiles.add(this.add.rectangle(px, py, 55, 55, 0x3d9ca0));
            this.tiles.add(this.add.text(px, py, letter, { fontFamily: 'Outfit-SemiBold',
                fontSize: 38, color: '#ffffff' }).setOrigin(0.5));
        }));
        this.score.setText(`${b.included.length}/${this.optimizer.words.length} words · ${b.width} × ${b.height} · area ${b.area}`);
        this.wordsLabel.setText(`Included: ${b.included.join(', ')}\nOmitted: ${b.omitted.join(', ') || 'None'}`);
    }
    exportCandidate() {
        if (this.running || !this.best) return;
        const b = this.best;
        // An intermediate artifact, not the legacy piece/guide format yet.
        const data = { format: 'crossed-grid-candidate', version: 1, title: PUZZLE_BUILDER_INPUT.title,
            words: this.optimizer.words, included: b.included, omitted: b.omitted,
            grid: { str: b.grid, width: b.width, height: b.height,
                coordinateSystem: 'screen-columns-rows',
                x: 2 + Math.floor((15 - b.width) / 2), y: 5 + Math.floor((23 - b.height) / 2) } };
        const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = 'movie-night-grid.json';
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        this.status.setText('Candidate exported · Keep looking retains this best grid');
    }
}
