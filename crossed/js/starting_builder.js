class StartingBuilderScene extends Phaser.Scene {
    constructor() { super({ key: 'StartingBuilderScene' }); }
    create(data) {
        this.fingerprint = JSON.stringify([data.candidate.grid, data.pieces.map(p => p.cells)]);
        this.items = StartingLayout.create(data.candidate.grid, data.pieces);
        if (data.saved && data.saved.fingerprint === this.fingerprint) {
            this.items.forEach((item, i) => Object.assign(item, StartingLayout.snap(item, data.saved.positions[i].x, data.saved.positions[i].y)));
        }
        this.history = [];
        this.guideMode = false;
        this.selected = 1;
        this.dragging = null;
        this.palette = [0x347fa4, 0xbe623a, 0x718b35, 0x9363a8];
        this.add.rectangle(540, 960, 1020, 1860, 0xffffff);
        const text = (x, y, value, size = 26) => this.add.text(x, y, value, {
            fontFamily: 'Outfit-SemiBold', fontSize: size, color: '#3c3c3c', align: 'center',
        }).setOrigin(0.5);
        text(540, 55, 'PUZZLE BUILDER · STARTING POSITIONS', 30);
        this.add.text(540, 135, data.candidate.title, { fontFamily: 'Outfit-SemiBold', fontSize: 50,
            color: '#3c3c3c', align: 'center', wordWrap: { width: 1020, useAdvancedWrap: true } }).setOrigin(0.5);
        this.status = text(540, 225, '', 25);
        this.status.setWordWrapWidth(960, true);
        const board = StartingLayout.BOARD;
        const lines = this.add.graphics().lineStyle(1, 0xdedede);
        for (let x = 0; x <= board.width; x++) lines.lineBetween(90 + x * 60, 270, 90 + x * 60, 1650);
        for (let y = 0; y <= board.height; y++) lines.lineBetween(90, 270 + y * 60, 990, 270 + y * 60);
        this.views = this.items.map((item, index) => {
            const container = this.add.container(item.x * 60, item.y * 60);
            const tiles = item.cells.map(c => {
                const tile = this.add.rectangle(c.x * 60, c.y * 60, 55, 55, item.guide ? 0xa2a39e : this.palette[item.color]);
                container.add(tile);
                if (!item.guide) container.add(text(c.x * 60, c.y * 60, c.letter, 38).setColor('#ffffff'));
                tile.setInteractive({ useHandCursor: true });
                this.input.setDraggable(tile);
                tile.on('dragstart', pointer => {
                    if (this.dragging !== null) return;
                    this.history.push(this.positions());
                    if (this.history.length > 100) this.history.shift();
                    this.dragging = index;
                    this.dragOrigin = { x: item.x, y: item.y, px: pointer.x, py: pointer.y };
                    if (!item.guide) this.selected = index;
                    this.refreshMode();
                });
                tile.on('drag', pointer => {
                    if (this.dragging !== index) return;
                    Object.assign(item, StartingLayout.snap(item,
                        this.dragOrigin.x + (pointer.x - this.dragOrigin.px) / 60,
                        this.dragOrigin.y + (pointer.y - this.dragOrigin.py) / 60));
                    this.refresh();
                });
                tile.on('dragend', () => { this.dragging = null; this.refresh(); });
                return tile;
            });
            return { container, tiles };
        });
        text(540, 1690, 'Red edges mark overlap or touching — including diagonals.', 25);
        this.selection = text(540, 1732, '', 25);
        const button = (x, y, caption, action) => {
            const box = this.add.rectangle(x, y, 280, 60, 0x3d9ca0).setInteractive({ useHandCursor: true });
            const label = text(x, y, caption, 25).setColor('#ffffff');
            box.on('pointerdown', () => { if (this.dragging === null) action(); });
            return label;
        };
        this.modeLabel = button(230, 1785, 'MOVE GUIDE', () => { this.guideMode = !this.guideMode; this.refreshMode(); });
        button(540, 1785, 'PREVIOUS PIECE', () => this.select(-1));
        button(850, 1785, 'NEXT PIECE', () => this.select(1));
        button(230, 1855, 'BACK TO PIECES', () => {
            this.scene.get('PieceBuilderScene').startingDraft = { fingerprint: this.fingerprint, positions: this.positions() };
            this.scene.resume('PieceBuilderScene'); this.scene.stop();
        });
        button(540, 1855, 'UNDO MOVE', () => {
            const positions = this.history.pop();
            if (positions) { this.items.forEach((item, i) => Object.assign(item, positions[i])); this.refresh(); }
        });
        button(850, 1855, 'CENTER GUIDE', () => {
            this.history.push(this.positions());
            const guide = this.items[0];
            guide.x = board.x + Math.floor((board.width - guide.width) / 2);
            guide.y = board.y + Math.floor((board.height - guide.height) / 2);
            this.refresh();
        });
        this.refreshMode(); this.refresh();
    }
    positions() { return this.items.map(item => ({ x: item.x, y: item.y })); }
    select(delta) {
        this.selected = 1 + (this.selected - 1 + delta + this.items.length - 1) % (this.items.length - 1);
        this.guideMode = false; this.refreshMode();
    }
    refreshMode() {
        this.views.forEach((view, i) => {
            view.container.setDepth(i === 0 ? (this.guideMode ? 30 : 1) : (i === this.selected ? 20 : 10));
            view.container.setAlpha(this.guideMode && i !== 0 ? 0.35 : 1);
            view.tiles.forEach(tile => { tile.input.enabled = this.guideMode ? i === 0 : i !== 0; });
        });
        this.modeLabel.setText(this.guideMode ? 'MOVE PIECES' : 'MOVE GUIDE');
        this.selection.setText(this.guideMode ? 'Drag any gray cell to slide the entire guide.' :
            `Drag a piece · Piece ${this.selected} is in front · Use Previous / Next if covered`);
    }
    refresh() {
        const result = StartingLayout.conflicts(this.items);
        this.views.forEach((view, i) => {
            view.container.setPosition(this.items[i].x * 60, this.items[i].y * 60);
            view.tiles.forEach((tile, c) => tile.setStrokeStyle(result.marks[i].has(c) ? 5 : 0, 0xd12b35));
        });
        this.status.setText(result.pairs ? `${result.pairs} touching pairs — slide them apart until the red edges disappear.` :
            'All clear — every piece and the guide have a one-cell gap.');
        this.status.setColor(result.pairs ? '#a12727' : '#347c40');
    }
}
