class GameController extends Phaser.State {

    map: Map;

    tile_manager: TileManager;
    entity_manager: EntityManager;
    smoke_manager: SmokeManager;
    frame_manager: FrameManager;

    frame_group: Phaser.Group;
    frame_gold_info: MenuGoldInfo;
    frame_def_info: MenuDefInfo;

    turn: Alliance;
    gold: number[];

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
        this.gold = [];

        if (name.charAt(0) == "s") {
            this.gold[0] = 1000;
            this.gold[1] = 1000;
        } else {
            this.gold[0] = 300;
            this.gold[1] = 300;
        }

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
        this.frame_group = this.game.add.group();
        this.frame_group.fixedToCamera = true;

        this.tile_manager = new TileManager(this.map, tilemap, tilemap_group);

        this.smoke_manager = new SmokeManager(this.map, smoke_group);

        this.entity_manager = new EntityManager(this.map, entity_group, selection_group, interaction_group);

        this.cursor = new Sprite({x: 0, y: 0}, cursor_group, "cursor", [0, 1]);

        this.frame_manager = new FrameManager();

        this.tile_manager.draw();

        this.game.input.onDown.add(this.click, this);

        this.startTurn(Alliance.Red);

        this.frame_def_info = new MenuDefInfo(this.frame_group);
        this.frame_manager.addFrame(this.frame_def_info);
        this.frame_def_info.show(true);

    }

    startTurn(alliance: Alliance) {

        this.turn = alliance;

        if (!this.frame_gold_info) {
            this.frame_gold_info = new MenuGoldInfo(this.frame_group);
            this.frame_manager.addFrame(this.frame_gold_info);
        }

        this.frame_gold_info.updateContent(alliance, this.getGoldForAlliance(alliance));
        this.frame_gold_info.show(true);
    }

    getGoldForAlliance(alliance: Alliance) {
        switch (alliance) {
            case Alliance.Blue:
                return this.gold[0];
            case Alliance.Red:
                return this.gold[1];
        }
        return -1;
    }

    getActivePos(): Pos {
        // pos always inside canvas
        let x = Math.floor((this.game.input.activePointer.x + this.game.camera.x) / AncientEmpires.TILE_SIZE);
        let y = Math.floor((this.game.input.activePointer.y + this.game.camera.y) / AncientEmpires.TILE_SIZE);
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

        let mx = this.game.input.activePointer.x;
        let my = this.game.input.activePointer.y;

        if (mx < 50 && this.game.camera.x > 0) {
            let cx = this.game.camera.x - 2 * steps;
            if (cx < 0) { cx = 0; }
            this.game.camera.x = cx;
        }
        if (my < 50 && this.game.camera.y > 0) {
            let cy = this.game.camera.y - 2 * steps;
            if (cy < 0) { cy = 0; }
            this.game.camera.y = cy;
        }
        if (mx > this.game.width - 50 && this.game.camera.x + this.game.width < this.game.world.width) {
            let cx = this.game.camera.x + 2 * steps;
            if (cx > this.game.world.width - this.game.width) { cx = this.game.world.width - this.game.width; }
            this.game.camera.x = cx;
        }
        if (my > this.game.height - 50 && this.game.camera.y + this.game.height < this.game.world.height) {
            let cy = this.game.camera.y + 2 * steps;
            if (cy > this.game.world.height - this.game.height) { cy = this.game.world.height - this.game.height; }
            this.game.camera.y = cy;
        }

        let cursor_is_left = mx < this.game.width / 2;
        let info_is_right = (this.frame_gold_info.align & Direction.Right) != 0;

        if (cursor_is_left != info_is_right) {
            if (cursor_is_left) {
                this.frame_gold_info.updateDirections(Direction.Up | Direction.Right, Direction.Left | Direction.Down, Direction.Right, true);
                this.frame_def_info.updateDirections(Direction.Down | Direction.Right, Direction.Left | Direction.Up, Direction.Right, true);
            }else {
                this.frame_gold_info.updateDirections(Direction.Up | Direction.Left, Direction.Right | Direction.Down, Direction.Left, true);
                this.frame_def_info.updateDirections(Direction.Down | Direction.Left, Direction.Right | Direction.Up, Direction.Left, true);
            }
        }



        this.anim_cursor_slow += steps;
        if (this.anim_cursor_slow > 30) {
            this.anim_cursor_slow -= 30;
            this.anim_cursor_state = 1 - this.anim_cursor_state;
            this.cursor.setFrame(this.anim_cursor_state);
        }

        let cursor_position = this.getActivePos();
        if (!cursor_position.match(this.last_cursor_position) && cursor_position.x > -1) {
            this.last_cursor_position = cursor_position;
            this.cursor.setWorldPosition({x: cursor_position.x * AncientEmpires.TILE_SIZE - 1, y: cursor_position.y * AncientEmpires.TILE_SIZE - 1});

            // update def info
            let entity = this.entity_manager.getEntityAt(cursor_position);
            this.frame_def_info.updateContent(cursor_position, this.map, entity);
        }

        this.tile_manager.update(steps);
        this.smoke_manager.update(steps);

        this.entity_manager.update(steps, cursor_position, this.anim_cursor_state);

        this.cursor.update(steps);

        this.frame_manager.update(steps);

    }

}
