const PieceBuilderIO = {
    download(data, suffix) {
        const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = `${data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'puzzle'}-${suffix}.json`;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    },
    import(scene, accept) {
        if (scene.importDialog) return;
        const dialog = document.createElement('dialog');
        scene.importDialog = dialog;
        dialog.style.cssText = 'box-sizing:border-box;width:min(620px,94vw);border:0;border-radius:12px;padding:24px;font:16px sans-serif;color:#3c3c3c';
        const heading = document.createElement('h2'); heading.textContent = 'Import grid or piece draft';
        const hint = document.createElement('p'); hint.textContent = 'Choose an exported JSON file, or paste its contents below.';
        const file = document.createElement('input'); file.type = 'file'; file.accept = '.json,application/json'; file.setAttribute('aria-label', 'JSON file');
        const text = document.createElement('textarea'); text.setAttribute('aria-label', 'Exported JSON');
        text.style.cssText = 'box-sizing:border-box;width:100%;height:220px;margin:16px 0;font:14px monospace';
        const error = document.createElement('p'); error.style.color = '#a12727'; error.setAttribute('role', 'alert');
        const load = document.createElement('button'); load.textContent = 'Import';
        const cancel = document.createElement('button'); cancel.textContent = 'Cancel';
        for (const b of [load, cancel]) b.style.cssText = 'padding:10px 22px;margin-right:12px;font:inherit;cursor:pointer';
        const close = () => { dialog.remove(); scene.importDialog = null; scene.events.off('shutdown', close); };
        cancel.onclick = close;
        dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
        file.onchange = async () => {
            try { if (file.files[0]) text.value = await file.files[0].text(); }
            catch (e) { error.textContent = 'Could not read that file.'; }
        };
        load.onclick = () => {
            try {
                const parsed = PiecePartition.importData(JSON.parse(text.value));
                close(); accept(parsed);
            } catch (e) { error.textContent = e instanceof SyntaxError ? 'That is not valid JSON.' : e.message; }
        };
        dialog.append(heading, hint, file, text, error, load, cancel);
        document.body.append(dialog); dialog.showModal();
        scene.events.once('shutdown', close);
    },
};

class PieceBuilderScene extends Phaser.Scene {
    constructor() { super({ key: 'PieceBuilderScene' }); }
    create(data) {
        this.candidate = data.candidate;
        this.colors = { ...data.colors };
        this.locked = new Set(data.locked || []);
        this.history = [];
        this.selectedColor = 0;
        this.lockMode = false;
        this.search = null;
        this.painting = false;
        this.palette = [0x347fa4, 0xbe623a, 0x718b35, 0x9363a8];
        this.add.rectangle(540, 960, 1020, 1860, 0xffffff);
        const label = (x, y, text, size = 26) => this.add.text(x, y, text, {
            fontFamily: 'Outfit-SemiBold', fontSize: size, color: '#3c3c3c', align: 'center',
        }).setOrigin(0.5);
        label(540, 55, 'PUZZLE BUILDER · PIECE DEFINITION', 30);
        this.add.text(540, 135, this.candidate.title, { fontFamily: 'Outfit-SemiBold', fontSize: 50,
            color: '#3c3c3c', align: 'center', wordWrap: { width: 1020, useAdvancedWrap: true } }).setOrigin(0.5);
        this.status = label(540, 218, 'Choose a color and paint, or suggest pieces.', 25);
        this.status.setWordWrapWidth(960, true);
        this.tiles = new Map();
        const grid = this.candidate.grid;
        for (const id of PiecePartition.occupied(grid)) {
            const x = (grid.x + id % grid.width) * 60, y = (grid.y + Math.floor(id / grid.width)) * 60;
            const tile = this.add.rectangle(x, y, 55, 55, 0xa2a39e).setInteractive();
            const letter = label(x, y, grid.str[Math.floor(id / grid.width)][id % grid.width], 38).setColor('#ffffff');
            const lock = label(x + 17, y - 17, '•', 23).setColor('#ffffff').setVisible(false);
            this.tiles.set(id, { tile, letter, lock });
            tile.on('pointerdown', () => {
                if (this.search || this.importDialog) return;
                this.remember();
                if (this.lockMode) this.toggleLock(id);
                else { this.painting = true; this.paint(id); }
            });
            tile.on('pointerover', pointer => { if (this.painting && pointer.isDown) this.paint(id); });
        }
        this.input.on('pointerup', () => { this.painting = false; });
        this.input.on('gameout', () => { this.painting = false; });
        this.swatches = this.palette.map((color, index) => {
            const x = 160 + index * 150;
            const swatch = this.add.rectangle(x, 1698, 118, 62, color).setInteractive({ useHandCursor: true });
            const mark = label(x, 1698, index === 0 ? '✓' : '', 30).setColor('#ffffff');
            swatch.on('pointerdown', () => {
                if (this.search) return;
                this.selectedColor = index; this.lockMode = false; this.refreshTools();
                this.status.setText('Paint cells. Matching colors join only when touching edge-to-edge.');
            });
            return mark;
        });
        const button = (x, y, text, action, width = 280) => {
            const box = this.add.rectangle(x, y, width, 60, 0x3d9ca0).setInteractive({ useHandCursor: true });
            const caption = label(x, y, text, 25).setColor('#ffffff');
            box.on('pointerdown', action);
            return caption;
        };
        this.lockLabel = button(850, 1698, 'LOCK PIECES', () => {
            if (this.search) return;
            this.lockMode = !this.lockMode; this.refreshTools();
            this.status.setText(this.lockMode ? 'Click a piece to lock or unlock it. Dots mark locked cells.' : 'Choose a color and paint.');
        });
        this.suggestLabel = button(230, 1770, 'SUGGEST PIECES', () => this.suggest());
        button(540, 1770, 'UNDO', () => {
            if (this.search || !this.history.length) return;
            const state = this.history.pop(); this.colors = state.colors; this.locked = state.locked; this.refresh();
        });
        button(850, 1770, 'EXPORT DRAFT', () => {
            if (this.search) return;
            PieceBuilderIO.download(PiecePartition.draft(this.candidate, this.colors, this.locked), 'pieces');
            this.status.setText(this.duplicateIds.size ? 'Draft saved — matching pieces still need editing.' : 'Piece draft saved.');
        });
        button(230, 1840, 'BACK TO GRID', () => {
            this.search = null;
            this.scene.get('PuzzleBuilderScene').pieceDraft = PiecePartition.draft(this.candidate, this.colors, this.locked);
            this.scene.resume('PuzzleBuilderScene'); this.scene.stop();
        });
        button(540, 1840, 'IMPORT JSON', () => {
            if (!this.search) PieceBuilderIO.import(this, parsed => this.scene.restart(parsed));
        });
        button(850, 1840, 'SET START POSITIONS', () => {
            if (this.search || this.importDialog) return;
            const pieces = PiecePartition.regions(this.candidate.grid, this.colors);
            if (pieces.flatMap(p => p.cells).length !== PiecePartition.occupied(this.candidate.grid).length) {
                this.status.setText('Color every cell before arranging the pieces.'); return;
            }
            if (PiecePartition.duplicates(this.candidate.grid, pieces).length) { this.refresh(true); return; }
            this.painting = false;
            this.scene.pause();
            this.scene.launch('StartingBuilderScene', { candidate: this.candidate, pieces, saved: this.startingDraft });
        });
        this.refresh();
        this.events.once('shutdown', () => { this.search = null; this.painting = false; });
    }
    remember() {
        this.history.push({ colors: { ...this.colors }, locked: new Set(this.locked) });
        if (this.history.length > 100) this.history.shift();
    }
    refreshTools() {
        this.swatches.forEach((mark, i) => mark.setText(!this.lockMode && i === this.selectedColor ? '✓' : ''));
        this.lockLabel.setText(this.lockMode ? 'LOCK MODE ✓' : 'LOCK PIECES');
    }
    paint(id) {
        if (this.locked.has(id) || this.colors[id] === this.selectedColor) return;
        if (PiecePartition.neighbors(this.candidate.grid, id).some(n => this.locked.has(n) && this.colors[n] === this.selectedColor)) {
            this.status.setText('That would merge into a locked piece. Unlock it first.'); return;
        }
        this.colors[id] = this.selectedColor;
        this.refresh();
    }
    toggleLock(id) {
        const piece = PiecePartition.regions(this.candidate.grid, this.colors).find(p => p.cells.includes(id));
        if (!piece) { this.status.setText('Paint this cell before locking its piece.'); return; }
        const unlock = this.locked.has(id);
        for (const c of piece.cells) { if (unlock) this.locked.delete(c); else this.locked.add(c); }
        this.refresh();
    }
    refresh(explicit = false) {
        const pieces = PiecePartition.regions(this.candidate.grid, this.colors);
        this.duplicateIds = new Set(PiecePartition.duplicates(this.candidate.grid, pieces).flatMap(i => pieces[i].cells));
        for (const [id, { tile, letter, lock }] of this.tiles) {
            tile.setFillStyle(this.colors[id] === undefined ? 0xa2a39e : this.palette[this.colors[id]]);
            letter.setText(this.candidate.grid.str[Math.floor(id / this.candidate.grid.width)][id % this.candidate.grid.width]);
            lock.setVisible(this.locked.has(id));
            tile.setAlpha(this.duplicateIds.has(id) ? 0.45 : 1);
        }
        if (this.duplicateIds.size) this.status.setText('Matching pieces are faded — change their grouping to distinguish them.');
        else if (explicit) this.status.setText('No duplicate pieces.');
        else this.status.setText('Paint to edit · Dots mark locked cells · Try another keeps locks');
    }
    suggest() {
        if (this.search) return;
        const grid = this.candidate.grid;
        const fixed = PiecePartition.regions(grid, this.colors).filter(p => p.cells.some(id => this.locked.has(id)))
            .map(p => ({ ...p, locked: true }));
        this.search = PiecePartition.suggest(grid, fixed);
        this.searchEnd = performance.now() + 3000;
        this.status.setText('Seeding crossings and fitting the remaining pieces…');
        this.suggestLabel.setText('LOOKING…');
    }
    update() {
        if (!this.search) return;
        const deadline = Math.min(performance.now() + 8, this.searchEnd);
        while (performance.now() < deadline && this.search) {
            const result = this.search.next();
            if (result.done) {
                this.search = null;
                if (result.value.colors) {
                    this.remember(); this.colors = result.value.colors; this.refresh();
                    this.status.setText('Suggestion ready. Paint to refine it, or lock pieces and try another.');
                } else this.status.setText(result.value.error);
                this.suggestLabel.setText('TRY ANOTHER');
            }
        }
        if (this.search && performance.now() >= this.searchEnd) {
            this.search = null;
            this.suggestLabel.setText('TRY ANOTHER');
            this.status.setText('No suggestion this batch. Try another, or unlock a piece.');
        }
    }
}
