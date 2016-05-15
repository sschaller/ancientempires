enum InputContext {
    Wait,
    Shop,
    Options,
    Map,
    Selection
}
class GameController extends Phaser.State implements EntityManagerDelegate, MenuDelegate {

    keys: Input;
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


    acc: number = 0;
    private cursor_target: Pos;
    private last_cursor_position: Pos;

    private anim_cursor_state: number;
    private anim_cursor_slow: number;

    private options_menu: MenuOptions;

    private active_action: Action;
    private selected_entity: Entity;
    private last_entity_position: Pos;

    private context: InputContext[];
    private shop_units: MenuShopUnits;
    private shop_info: MenuShopInfo;

    constructor() {
        super();
    }

    init(name: string) {
        this.map = new Map(name);
        this.keys = new Input(this.game.input);

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

        this.context = [InputContext.Map];

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

        this.entity_manager = new EntityManager(this.map, entity_group, selection_group, interaction_group, this);

        this.frame_manager = new FrameManager();

        this.tile_manager.draw();

        this.frame_def_info = new MenuDefInfo(this.frame_group);
        this.frame_manager.addFrame(this.frame_def_info);
        this.frame_def_info.show(true);

        this.frame_gold_info = new MenuGoldInfo(this.frame_group);
        this.frame_manager.addFrame(this.frame_gold_info);
        this.frame_gold_info.show(true);

        let soldier = this.entity_manager.createEntity(EntityType.Soldier, Alliance.Red, new Pos(4, 13));
        soldier.setHealth(2);

        this.cursor_target = this.entity_manager.getKingPosition(Alliance.Blue);
        this.cursor = new Sprite(this.cursor_target.getWorldPosition(), cursor_group, "cursor", [0, 1]);
        this.cursor.setOffset(-1, -1);

        this.camera.x = this.getOffsetX(this.cursor.world_position.x);
        this.camera.y = this.getOffsetY(this.cursor.world_position.y);

        this.startTurn(Alliance.Blue);

        this.showMessage("GAME LOADED");

    }
    showMessage(text: string) {
        let menu = new Notification(this.frame_group, text, this);
        this.frame_manager.addFrame(menu);
        menu.show(true);
    }
    update() {
        // 1 step is 1/60 sec

        this.acc += this.time.elapsed;
        let steps = Math.floor(this.acc / 16);
        if (steps <= 0) { return; }
        this.acc -= steps * 16;
        if (steps > 2) { steps = 2; }

        this.keys.update();

        this.captureInput();

        let cursor_position = this.cursor_target.getWorldPosition();
        let diff_x = cursor_position.x - this.cursor.world_position.x;
        let diff_y = cursor_position.y - this.cursor.world_position.y;

        let dx = 0;
        let dy = 0;

        if (diff_x != 0) {
            dx = Math.floor(diff_x / 4);
            if (dx < 0) {
                dx = Math.max(dx, -4);
                dx = Math.min(dx, -1);
            } else {
                dx = Math.min(dx, 4);
                dx = Math.max(dx, 1);
            }
            this.cursor.setWorldPosition({x: this.cursor.world_position.x + dx, y: this.cursor.world_position.y + dy});
        }
        if (diff_y != 0) {
            dy = Math.floor(diff_y / 4);
            if (dy < 0) {
                dy = Math.max(dy, -4);
                dy = Math.min(dy, -1);
            } else {
                dy = Math.min(dy, 4);
                dy = Math.max(dy, 1);
            }
            this.cursor.setWorldPosition({x: this.cursor.world_position.x + dx, y: this.cursor.world_position.y + dy});
        }

        if (!this.cursor_target.match(this.last_cursor_position)) {
            this.last_cursor_position = this.cursor_target.copy();

            // update def info
            let entity = this.entity_manager.getEntityAt(this.cursor_target);
            this.frame_def_info.updateContent(this.cursor_target, this.map, entity);
        }


        // input

        this.frame_manager.update(steps);

        if (!!this.options_menu) {
            return;
        }

        this.anim_cursor_slow += steps;
        if (this.anim_cursor_slow > 30) {
            this.anim_cursor_slow -= 30;
            this.anim_cursor_state = 1 - this.anim_cursor_state;
            this.cursor.setFrame(this.anim_cursor_state);
        }


        this.tile_manager.update(steps);
        this.smoke_manager.update(steps);

        this.entity_manager.update(steps, this.cursor_target, this.anim_cursor_state);

        this.updateOffsetForPosition(this.cursor.world_position);

        let info_is_right = (this.frame_gold_info.align & Direction.Right) != 0;
        if (!info_is_right && this.cursor.world_position.x - 1 - this.camera.x <= this.game.width / 2 - 24 - 12) {
            this.frame_gold_info.updateDirections(Direction.Up | Direction.Right, Direction.Left | Direction.Down, Direction.Right, true);
            this.frame_def_info.updateDirections(Direction.Down | Direction.Right, Direction.Left | Direction.Up, Direction.Right, true);
        } else if (info_is_right && this.cursor.world_position.x + 1 - this.camera.x >= this.game.width / 2 + 12) {
            this.frame_gold_info.updateDirections(Direction.Up | Direction.Left, Direction.Right | Direction.Down, Direction.Left, true);
            this.frame_def_info.updateDirections(Direction.Down | Direction.Left, Direction.Right | Direction.Up, Direction.Left, true);
        }

    }

    entityDidMove(entity: Entity) {
        let options = this.entity_manager.getEntityOptions(entity, true);
        if (options.length < 1) { return; }
        this.showOptionMenu(options);
    }

    entityDidAttack(entity: Entity) {
        this.context.pop();
        this.selected_entity.updateState(EntityState.Moved, true);
        this.deselectEntity();
    }

    openMenu(context: InputContext) {
        if (context == InputContext.Wait) {
            this.context.push(context);
        } else if (context == InputContext.Shop) {
            this.frame_def_info.hide(true);
        } else {
            this.frame_gold_info.hide(true);
            this.frame_def_info.hide(true);
        }
    }
    closeMenu(context: InputContext) {
        if (context == InputContext.Wait) {
            this.context.pop();
        }
        let active_context = this.context[this.context.length - 1];
        switch (active_context) {
            case InputContext.Map:
            case InputContext.Selection:
                this.frame_gold_info.show(true);
                this.frame_def_info.show(true);
                break;
            case InputContext.Shop:
                this.frame_gold_info.show(true);
                break;
        }
    }

    private selectEntity(entity: Entity): boolean {

        let options = this.entity_manager.getEntityOptions(entity, false);

        // no options mean: not in alliance or already moved
        if (options.length < 1) {
            return false;
        }

        // so method can be used to show options for entity again -> must be same entity as selected
        if (!this.selected_entity) {
            this.selected_entity = entity;
            this.entity_manager.selectEntity(entity);
        } else if (this.selected_entity != entity) {
            return false;
        }

        if (options.length > 1) {
            this.showOptionMenu(options);
        } else {
            this.selectOption(options[0]);
        }
        return true;
    }
    private deselectEntity() {
        if (!this.selected_entity) { return; }

        this.cursor_target = this.selected_entity.position.copy();
        this.entity_manager.hideRange();

        this.entity_manager.deselectEntity(this.selected_entity);
        this.last_entity_position = null;
        this.selected_entity = null;
    }

    private nextTurn() {
        let next_turn = Alliance.Blue;
        if (this.turn == Alliance.Blue) {
            next_turn = Alliance.Red;
        }
        this.startTurn(next_turn);
    }

    private startTurn(alliance: Alliance) {

        this.turn = alliance;

        this.frame_gold_info.updateContent(alliance, this.getGoldForAlliance(alliance));

        this.entity_manager.startTurn(alliance);

    }

    private getGoldForAlliance(alliance: Alliance) {
        switch (alliance) {
            case Alliance.Blue:
                return this.gold[0];
            case Alliance.Red:
                return this.gold[1];
        }
        return -1;
    }
    private setGoldForAlliance(alliance: Alliance, amount: number) {
        let alliance_id: number;
        switch (alliance) {
            case Alliance.Blue:
                alliance_id = 0;
                break;
            case Alliance.Red:
                alliance_id = 1;
                break;
        }
        this.gold[alliance_id] = amount;
        if (!!this.frame_gold_info) { this.frame_gold_info.updateContent(alliance, amount); }
    }

    private showOptionMenu(options: Action[]) {

        this.options_menu = new MenuOptions(this.frame_group, Direction.Right, options, this);
        this.frame_manager.addFrame(this.options_menu);
        this.options_menu.show(true);
        this.context.push(InputContext.Options);
    }

    private selectOption(option: Action) {
        this.active_action = option;
        switch (option) {
            case Action.OCCUPY:
                this.map.setAllianceAt(this.selected_entity.position, this.selected_entity.alliance);
                this.tile_manager.drawTileAt(this.selected_entity.position);
                this.showMessage("OCCUPIED");
                this.selected_entity.updateState(EntityState.Moved, true);
                this.deselectEntity();
                break;
            case Action.ATTACK:
                this.context.push(InputContext.Selection);
                this.cursor.hide();
                this.entity_manager.showRange(EntityRangeType.Attack, this.selected_entity);
                this.cursor_target = this.entity_manager.nextTargetInRange(Direction.None).position.copy();
                break;
            case Action.RAISE:
                this.context.push(InputContext.Selection);
                this.entity_manager.showRange(EntityRangeType.Raise, this.selected_entity);
                this.cursor_target = this.entity_manager.nextTargetInRange(Direction.None).position.copy();
                break;
            case Action.MOVE:
                this.entity_manager.showRange(EntityRangeType.Move, this.selected_entity);
                break;
            case Action.BUY:
                this.openShop(this.selected_entity.alliance);
                break;
            case Action.END_MOVE:
                this.selected_entity.updateState(EntityState.Moved, true);
                this.deselectEntity();
                break;
            case Action.END_TURN:
                this.showMessage("END TURN");
                this.nextTurn();
                break;
            case Action.CANCEL:
                if (!!this.last_entity_position) {
                    // last action was walking. reset entity & set cursor to current position
                    this.active_action = Action.MOVE;
                    this.cursor_target = this.selected_entity.position;

                    this.entity_manager.moveEntity(this.selected_entity, this.last_entity_position, false);
                    this.last_entity_position = null;

                    this.entity_manager.showRange(EntityRangeType.Move, this.selected_entity);

                } else {
                    this.deselectEntity();
                }
                break;
        }
    }

    private updateOffsetForPosition(position: IPos) {
        let x = position.x + 0.5 * AncientEmpires.TILE_SIZE;
        let y = position.y + 0.5 * AncientEmpires.TILE_SIZE;

        this.updateOffset(x, y);
    }
    private updateOffset(x: number, y: number) {
        let offset_x = this.getOffsetX(x);
        let offset_y = this.getOffsetY(y);

        let diff_x = offset_x - this.camera.x;
        let diff_y = offset_y - this.camera.y;

        if (diff_x != 0) {
            let dx = Math.floor(diff_x / 12);
            if (dx < 0) {
                dx = Math.max(dx, -4);
                dx = Math.min(dx, -1);
            } else {
                dx = Math.min(dx, 4);
                dx = Math.max(dx, 1);
            }
            this.camera.x += dx;
        }
        if (diff_y != 0) {
            let dy = Math.floor(diff_y / 12);
            if (dy < 0) {
                dy = Math.max(dy, -4);
                dy = Math.min(dy, -1);
            } else {
                dy = Math.min(dy, 4);
                dy = Math.max(dy, 1);
            }
            this.camera.y += dy;
        }
    }
    private getOffsetX(x: number): number {
        let offset_x = x - this.game.width / 2;
        if (this.game.width < this.world.width) {
            offset_x = Math.max(offset_x, 0);
            offset_x = Math.min(offset_x, this.world.width - this.game.width);
        } else {
            offset_x = (this.game.width - this.world.width) / 2;
        }
        return offset_x;
    }
    private getOffsetY(y: number): number {
        let offset_y = y - this.game.height / 2;
        if (this.game.height < this.world.height) {
            offset_y = Math.max(offset_y, 0);
            offset_y = Math.min(offset_y, this.world.height - this.game.height);
        } else {
            offset_y = (this.game.height - this.world.height) / 2;
        }
        return offset_y;
    }
    private captureInput() {

        if (this.keys.all_keys == Key.None) { return; }

        switch (this.context[this.context.length - 1]) {
            case InputContext.Map:
                let cursor_still = this.cursor.world_position.x % 24 == 0 && this.cursor.world_position.y % 24 == 0;
                if (this.keys.isKeyPressed(Key.Up) && cursor_still && this.cursor_target.y > 0) {
                    this.cursor_target.move(Direction.Up);
                } else if (this.keys.isKeyPressed(Key.Right) && cursor_still && this.cursor_target.x < this.map.width - 1) {
                    this.cursor_target.move(Direction.Right);
                } else if (this.keys.isKeyPressed(Key.Down) && cursor_still && this.cursor_target.y < this.map.height - 1) {
                    this.cursor_target.move(Direction.Down);
                } else if (this.keys.isKeyPressed(Key.Left) && cursor_still && this.cursor_target.x > 0) {
                    this.cursor_target.move(Direction.Left);
                } else if (this.keys.isKeyPressed(Key.Enter)) {
                    this.keys.clearKeyPressed(Key.Enter);
                    this.pickPosition(this.cursor_target);
                } else if (this.keys.isKeyPressed(Key.Esc)) {
                    this.keys.clearKeyPressed(Key.Esc);
                    let entity = this.selected_entity;
                    this.deselectEntity();
                    if (entity.position.match(this.entity_manager.getKingPosition(this.turn)) && entity.data.cost <= 1000) {
                        // entity was bought, add gold back and remove entity
                        let gold = this.getGoldForAlliance(this.turn);
                        this.setGoldForAlliance(this.turn, gold + entity.data.cost);
                        this.entity_manager.removeEntity(entity);
                    }

                }
                break;
            case InputContext.Options:
                if (this.keys.isKeyPressed(Key.Up)) {
                    this.keys.clearKeyPressed(Key.Up);
                    this.options_menu.prev();
                } else if (this.keys.isKeyPressed(Key.Down)) {
                    this.keys.clearKeyPressed(Key.Down);
                    this.options_menu.next();
                } else if (this.keys.isKeyPressed(Key.Enter)) {
                    this.keys.clearKeyPressed(Key.Enter);
                    this.context.pop();
                    this.selectOption(this.options_menu.getSelected());
                    this.options_menu.hide(true, true);
                    this.options_menu = null;
                } else if (this.keys.isKeyPressed(Key.Esc)) {
                    this.keys.clearKeyPressed(Key.Esc);

                    this.context.pop();
                    this.selectOption(Action.CANCEL);
                    this.options_menu.hide(true, true);
                    this.options_menu = null;
                }
                break;
            case InputContext.Selection:
                if (this.keys.isKeyPressed(Key.Up) && this.cursor_target.y > 0) {
                    this.keys.clearKeyPressed(Key.Up);
                    let entity = this.entity_manager.nextTargetInRange(Direction.Up);
                    this.cursor_target = entity.position.copy();
                } else if (this.keys.isKeyPressed(Key.Right) && this.cursor_target.x < this.map.width - 1) {
                    this.keys.clearKeyPressed(Key.Right);
                    let entity = this.entity_manager.nextTargetInRange(Direction.Right);
                    this.cursor_target = entity.position.copy();
                } else if (this.keys.isKeyPressed(Key.Down) && this.cursor_target.y < this.map.height - 1) {
                    this.keys.clearKeyPressed(Key.Down);
                    let entity = this.entity_manager.nextTargetInRange(Direction.Down);
                    this.cursor_target = entity.position.copy();
                } else if (this.keys.isKeyPressed(Key.Left) && this.cursor_target.x > 0) {
                    this.keys.clearKeyPressed(Key.Left);
                    let entity = this.entity_manager.nextTargetInRange(Direction.Left);
                    this.cursor_target = entity.position.copy();
                } else if (this.keys.isKeyPressed(Key.Enter)) {
                    this.keys.clearKeyPressed(Key.Enter);

                    this.cursor.show();
                    this.context.pop();
                    let entity = this.entity_manager.nextTargetInRange(Direction.None);
                    this.pickEntity(entity);
                } else if (this.keys.isKeyPressed(Key.Esc)) {
                    this.keys.clearKeyPressed(Key.Esc);

                    this.cursor_target = this.selected_entity.position.copy();
                    this.cursor.show();
                    this.context.pop();
                    let entity = this.selected_entity;
                    this.entity_manager.hideRange();

                    this.selectEntity(entity);
                }
                break;
            case InputContext.Shop:
                if (this.keys.isKeyPressed(Key.Up)) {
                    this.keys.clearKeyPressed(Key.Up);
                    this.shop_units.prev(true);
                    this.shop_info.updateContent(this.shop_units.getSelected());
                } else if (this.keys.isKeyPressed(Key.Right)) {
                    this.keys.clearKeyPressed(Key.Right);
                    this.shop_units.next(false);
                    this.shop_info.updateContent(this.shop_units.getSelected());
                } else if (this.keys.isKeyPressed(Key.Down)) {
                    this.keys.clearKeyPressed(Key.Down);
                    this.shop_units.next(true);
                    this.shop_info.updateContent(this.shop_units.getSelected());
                } else if (this.keys.isKeyPressed(Key.Left)) {
                    this.keys.clearKeyPressed(Key.Left);
                    this.shop_units.prev(false);
                    this.shop_info.updateContent(this.shop_units.getSelected());
                } else if (this.keys.isKeyPressed(Key.Enter)) {
                    this.keys.clearKeyPressed(Key.Enter);
                    let entity_type: number = this.shop_units.getSelected();
                    let data = AncientEmpires.ENTITIES[entity_type];
                    let gold = this.getGoldForAlliance(this.turn) - data.cost;
                    if (gold >= 0) {
                        this.deselectEntity();
                        this.closeShop();
                        this.setGoldForAlliance(this.turn, gold);
                        let entity = this.entity_manager.createEntity(entity_type, this.turn, this.entity_manager.getKingPosition(this.turn));
                        this.selectEntity(entity);
                    }
                } else if (this.keys.isKeyPressed(Key.Esc)) {
                    this.keys.clearKeyPressed(Key.Esc);
                    this.deselectEntity();
                    this.closeShop();
                }
                break;
        }
    }

    private pickEntity(entity: Entity) {
        this.entity_manager.hideRange();
        this.cursor.show();
        this.context.push(InputContext.Wait);
        switch (this.active_action) {
            case Action.ATTACK:
                this.entity_manager.attackEntity(this.selected_entity, entity);
                console.log("Attack Entity!", entity.getInfo());
                break;
            case Action.RAISE:
                console.log("Raise Entity", entity.getInfo());
                break;
        }
    }

    private pickPosition(position: Pos) {
        if (this.selected_entity) {
            switch (this.active_action) {
                case Action.MOVE:
                    this.last_entity_position = this.selected_entity.position.copy();
                    this.entity_manager.moveEntity(this.selected_entity, position);
                    break;
            }
            return;
        }

        let entity = this.entity_manager.getEntityAt(position);
        if (!!entity) {
            // no entity selected, clicked on entity - try to select it
            let success = this.selectEntity(entity);
            if (success) { return; }
        }
        this.showOptionMenu(MenuOptions.getMainMenuOptions());
    }

    private openShop(alliance: Alliance) {
        this.context.push(InputContext.Shop);
        if (!this.shop_units) {
            this.shop_units = new MenuShopUnits(this.frame_group, this);
            this.frame_manager.addFrame(this.shop_units);
        }
        this.shop_units.updateContent(alliance);
        this.shop_units.show(true);

        this.shop_info = new MenuShopInfo(this.frame_group, alliance);
        this.shop_info.updateContent(EntityType.Soldier);
        this.frame_manager.addFrame(this.shop_info);
        this.shop_info.show(true);
    }

    private closeShop() {
        this.context.pop();
        this.shop_units.hide(true, true);
        this.shop_units = null;
        this.shop_info.hide(true, true);
        this.shop_info = null;
    }
}
