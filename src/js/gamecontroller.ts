class GameController extends Phaser.State {

    map: Map;

    tile_manager: TileManager;
    entity_manager: EntityManager;
    smoke_manager: SmokeManager;
    frame_manager: FrameManager;

    turn: Alliance;

    cursor: Sprite;

    selected: Entity;

    acc: number = 0;
    private last_cursor_position: Pos;

    private anim_cursor_state: number;
    private anim_cursor_slow: number;

    constructor() {
        super();
    }

    init(name: string) {
        this.map = new Map(name);

        this.turn = Alliance.Blue;

        this.anim_cursor_state = 0;
        this.anim_cursor_slow = 0;
    }
    create() {

        let tilemap = this.game.add.tilemap();
        let tilemap_group = this.game.add.group();
        let smoke_group = this.game.add.group();
        let selection_group = this.game.add.group();
        let entity_group = this.game.add.group();
        let interaction_group = this.game.add.group();
        let cursor_group = this.game.add.group();
        let frame_group = this.game.add.group();

        this.tile_manager = new TileManager(this.map, tilemap, tilemap_group);

        this.smoke_manager = new SmokeManager(this.map, smoke_group);

        this.entity_manager = new EntityManager(this.map, entity_group, selection_group, interaction_group);

        this.cursor = new Sprite({x: 0, y: 0}, cursor_group, "cursor", [0, 1]);

        this.frame_manager = new FrameManager(frame_group);

        this.tile_manager.draw();

        this.game.input.onDown.add(this.click, this);
    }
    getActivePos(): Pos {
        // pos always inside canvas
        let x = Math.floor(this.game.input.activePointer.x / AncientEmpires.TILE_SIZE);
        let y = Math.floor(this.game.input.activePointer.y / AncientEmpires.TILE_SIZE);
        return new Pos(x, y);
    }
    click() {

        let position = this.getActivePos();

        let selected = this.entity_manager.selected;
        let entity = this.entity_manager.getEntityAt(position);

        if (!!entity) {
            // entity is there - deselect current
            this.entity_manager.deselectEntity();
        }else if (!!selected) {
            // no entity and selected entity
            this.entity_manager.moveSelectedEntity(position);
        }

        if (!!entity && entity != selected) {
            this.entity_manager.selectEntity(entity);
        }

    }
    update() {
        // 1 step is 1/60 sec

        this.acc += this.time.elapsed;
        let steps = Math.floor(this.acc / 16);
        if (steps <= 0) { return; }
        this.acc -= steps * 16;
        if (steps > 2) { steps = 2; }

        this.anim_cursor_slow += steps;
        if (this.anim_cursor_slow > 30) {
            this.anim_cursor_slow -= 30;
            this.anim_cursor_state = 1 - this.anim_cursor_state;
            this.cursor.setFrame(this.anim_cursor_state);
        }

        let cursor_position = this.getActivePos();
        if (!cursor_position.match(this.last_cursor_position)) {
            this.last_cursor_position = cursor_position;
            this.cursor.setWorldPosition({x: cursor_position.x * AncientEmpires.TILE_SIZE - 1, y: cursor_position.y * AncientEmpires.TILE_SIZE - 1});
        }

        this.tile_manager.update(steps);
        this.smoke_manager.update(steps);

        this.entity_manager.update(steps, cursor_position, this.anim_cursor_state);

        this.cursor.update(steps);

        this.frame_manager.update(steps);

    }
}
