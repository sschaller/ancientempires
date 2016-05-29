/// <reference path="input.ts" />
/// <reference path="player.ts" />
/// <reference path="ai.ts" />
/// <reference path="map.ts" />
/// <reference path="tilemanager.ts" />
/// <reference path="entitymanager.ts" />
/// <reference path="smokemanager.ts" />
/// <reference path="framemanager.ts" />
/// <reference path="menu.ts" />

enum InputContext {
    Wait,
    Shop,
    Options,
    Map,
    Selection,
    Animation,
    Ack,
    Instructions
}
interface GameSave {
    campaign: boolean;
    map: number;
    players: boolean[];

    turn?: Alliance;
    gold?: number[];
    buildings?: IBuilding[];
    entities?: IEntity[];
    cursors?: IPos[];
}
class GameController extends Phaser.State implements EntityManagerDelegate, InteractionDelegate, MenuDelegate {

    map: Map;

    tile_manager: TileManager;
    entity_manager: EntityManager;
    smoke_manager: SmokeManager;
    frame_manager: FrameManager;

    frame_gold_info: MenuGoldInfo;
    frame_def_info: MenuDefInfo;

    turn: Alliance;
    gold: number[];

    players: Interaction[];

    cursor_target: Pos;
    cursor: Sprite;
    cursor_still: boolean;
    camera_still: boolean;

    game_over: boolean;

    private acc: number = 0;
    private last_cursor_position: Pos;

    private anim_cursor_state: number;
    private anim_cursor_slow: number;

    private selected_entity: Entity;

    constructor() {
        super();
    }

    init(save: GameSave) {
        this.map = new Map((save.campaign ? "m" : "s") + save.map);
        this.players = [];
        this.game_over = false;

        let keys: Input;
        let alliance = Alliance.Blue;
        for (let p of save.players) {
            if (p) {
                if (!keys) {
                    keys = new Input(this.game.input);
                }
                this.players.push(new Player(alliance, this.map, this, keys));
            } else {
                this.players.push(new AI(alliance, this.map, this));
            }
            alliance = <Alliance> (<number> alliance + 1);
        }

        try {
            this.turn = save.turn;
            this.gold = save.gold;
            this.map.importBuildings(save.buildings);
            this.map.importEntities(save.entities);

            let i = 0;
            for (let target of save.cursors) {
                if (!!target) {
                    this.players[i].cursor_position = new Pos(target.x, target.y);
                }
                i++;
            }
        }catch (e) {
            this.turn = Alliance.Blue;

            this.gold = [];
            if (save.campaign) {
                this.gold[0] = 300;
                this.gold[1] = 300;
            } else {
                this.gold[0] = 1000;
                this.gold[1] = 1000;
            }
        }
    }

    create() {

        let tilemap = this.game.add.tilemap();
        let tilemap_group = this.game.add.group();
        let smoke_group = this.game.add.group();
        let selection_group = this.game.add.group();
        let entity_group = this.game.add.group();
        let interaction_group = this.game.add.group();
        let cursor_group = this.game.add.group();
        let animation_group = this.game.add.group();
        let frame_group = this.game.add.group();
        frame_group.fixedToCamera = true;

        this.tile_manager = new TileManager(this.map, tilemap, tilemap_group);

        this.entity_manager = new EntityManager(this.map, entity_group, selection_group, interaction_group, animation_group, this);

        this.smoke_manager = new SmokeManager(this.map, smoke_group);
        this.frame_manager = new FrameManager(frame_group);


        this.tile_manager.draw();

        this.frame_def_info = new MenuDefInfo(frame_group);
        this.frame_manager.addFrame(this.frame_def_info);
        this.frame_def_info.show(true);

        this.frame_gold_info = new MenuGoldInfo(frame_group);
        this.frame_manager.addFrame(this.frame_gold_info);
        this.frame_gold_info.show(true);

        this.cursor = new Sprite();
        this.cursor.init({x: 0, y: 0}, cursor_group, "cursor", [0, 1]);
        this.cursor.setOffset(-1, -1);

        this.camera.x = this.getOffsetX(this.cursor.world_position.x);
        this.camera.y = this.getOffsetY(this.cursor.world_position.y);

        this.anim_cursor_state = 0;
        this.anim_cursor_slow = 0;

        this.startTurn(this.turn);

        this.showMessage("GAME LOADED");

    }
    update() {
        // 1 step is 1/60 sec

        this.acc += this.time.elapsed;
        let steps = Math.floor(this.acc / 16);
        if (steps <= 0) { return; }
        this.acc -= steps * 16;
        if (steps > 2) { steps = 2; }

        let cursor_position = this.cursor_target.getWorldPosition();
        let diff_x = cursor_position.x - this.cursor.world_position.x;
        let diff_y = cursor_position.y - this.cursor.world_position.y;

        let dx = 0;
        let dy = 0;

        this.cursor_still = diff_x == 0 && diff_y == 0;
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
        // track moving entity, otherwise cursor
        this.updateOffsetForPosition(!!this.selected_entity && !!this.selected_entity.path ? this.selected_entity.world_position : this.cursor.world_position);

        // input

        this.checkWinLose();

        if (!this.game_over) {
            this.players[(<number> this.turn - 1)].run();
            this.players[(<number> this.turn - 1)].setCursorPosition(this.cursor_target);
        }

        if (!this.cursor_target.match(this.last_cursor_position)) {
            this.last_cursor_position = this.cursor_target.copy();

            // update def info
            this.frame_def_info.updateContent(this.cursor_target, this.map);
        }

        this.frame_manager.update(steps);

        // Pause ANIMATION

        this.anim_cursor_slow += steps;
        if (this.anim_cursor_slow > 30) {
            this.anim_cursor_slow -= 30;
            this.anim_cursor_state = 1 - this.anim_cursor_state;
            this.cursor.setFrame(this.anim_cursor_state);
        }


        this.tile_manager.update(steps);
        this.smoke_manager.update(steps);

        this.entity_manager.update(steps, this.cursor_target, this.anim_cursor_state);

        let info_is_right = (this.frame_gold_info.align & Direction.Right) != 0;
        if (!info_is_right && this.cursor.world_position.x - 1 - this.camera.x <= this.game.width / 2 - 24 - 12) {
            this.frame_gold_info.updateDirections(Direction.Up | Direction.Right, Direction.Left | Direction.Down, Direction.Right, true);
            this.frame_def_info.updateDirections(Direction.Down | Direction.Right, Direction.Left | Direction.Up, Direction.Right, true);
        } else if (info_is_right && this.cursor.world_position.x + 1 - this.camera.x >= this.game.width / 2 + 12) {
            this.frame_gold_info.updateDirections(Direction.Up | Direction.Left, Direction.Right | Direction.Down, Direction.Left, true);
            this.frame_def_info.updateDirections(Direction.Down | Direction.Left, Direction.Right | Direction.Up, Direction.Left, true);
        }

    }


    // -----------------------
    // ---- MENU DELEGATE ----
    // -----------------------

    openMenu(context: InputContext) {
        this.players[<number> this.turn - 1].openMenu(context);
    }
    closeMenu(context: InputContext) {
        for (let player of this.players) {
            player.closeMenu(context);
        }
    }


    // ---------------------------------
    // ---- ENTITY MANAGER DELEGATE ----
    // ---------------------------------

    entityDidMove(entity: Entity) {
        this.players[<number> this.turn - 1].entityDidMove(entity);
    }
    entityDidAnimation(entity: Entity) {
        this.players[<number> this.turn - 1].entityDidAnimation(entity);
    }


    // --------------
    // ---- MENU ----
    // --------------

    showMessage(text: string) {
        let menu = new Notification(this.frame_manager.group, text, this);
        this.frame_manager.addFrame(menu);
        menu.show(true);
    }
    showInfo(all: boolean) {
        this.frame_def_info.show(true);
        if (all) {
            this.frame_gold_info.show(true);
        }
    }
    hideInfo(all: boolean) {
        this.frame_def_info.hide(true);
        if (all) {
            this.frame_gold_info.hide(true);
        }
    }


    // ---------------------
    // ---- LOAD / SAVE ----
    // ---------------------
    loadGame(): boolean {
        if (!MainMenu.loadGame(this.game)) {
            this.showMessage(AncientEmpires.LANG[43]);
            return false;
        }
        return true;
    }
    saveGame() {

        let cursors: IPos[] = [];
        let players: boolean[] = [];
        for (let player of this.players) {
            cursors.push(player.getCursorPosition());
            players.push(player.isPlayer());
        }

        let save: GameSave = {
            campaign: this.map.isCampaign(),
            map: this.map.getMap(),
            turn: this.turn,
            gold: this.gold,
            players: players,
            entities: this.map.exportEntities(),
            buildings: this.map.exportBuildings(),
            cursors: cursors
        };

        localStorage.setItem("save.rs", JSON.stringify(save));
        this.showMessage(AncientEmpires.LANG[41]);
    }
    exitGame() {
        this.game.state.start("MainMenu", true, false);
    }


    // -----------------
    // ---- GENERAL ----
    // -----------------

    checkWinLose() {
        if (this.game_over) {
            return;
        }
        if (this.map.countEntitiesWith(Alliance.Blue, EntityState.Dead, EntityType.King) > 0) {
            this.showMessage(AncientEmpires.LANG[38]);
            this.game_over = true;
        } else if (this.map.countEntitiesWith(Alliance.Red, EntityState.Dead, EntityType.King) > 0) {
            this.showMessage(AncientEmpires.LANG[24]);
            this.game_over = true;
        }
    }

    nextTurn() {

        this.showMessage(AncientEmpires.LANG[40]);

        let next_turn = Alliance.Blue;
        if (this.turn == Alliance.Blue) {
            next_turn = Alliance.Red;
        }
        if (!this.players[<number> next_turn - 1].isActive()) {
            next_turn = this.turn;
        }

        this.gold[next_turn == Alliance.Blue ? 0 : 1] += this.map.getGoldGainForAlliance(next_turn);
        this.map.nextTurn(next_turn);
        this.startTurn(next_turn);
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
    setGoldForAlliance(alliance: Alliance, amount: number) {
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
        if (this.turn == alliance) {
            this.frame_gold_info.updateContent(alliance, amount);
        }
    }


    // ------------------
    // ---- ENTITITY ----
    // ------------------

    buyEntity(king: Entity, type: EntityType): Entity {
        let data = AncientEmpires.ENTITIES[<number> type];
        let gold = this.getGoldForAlliance(king.alliance) - data.cost;
        if (gold < 0) {
            return null;
        }
        this.setGoldForAlliance(king.alliance, gold);
        let entity = this.map.createEntity(type, king.alliance, king.position.copy());
        this.entity_manager.createEntity(entity);
        return entity;
    }
    selectEntity(entity: Entity): boolean {
        if (!!this.selected_entity) {
            return false;
        }
        this.selected_entity = entity;
        this.entity_manager.selectEntity(entity);
        return true;
    }
    moveEntity(entity: Entity, target: Pos, animate: boolean): boolean {
        if (this.map.moveEntity(entity, target, this, animate)) {
            this.hideRange();
            return true;
        }
        return false;
    }
    occupy(position: Pos, alliance: Alliance) {
        this.map.setAllianceAt(position, alliance);
        this.tile_manager.drawTileAt(position);
        this.showMessage(AncientEmpires.LANG[39]);
    }
    showRange(type: EntityRangeType, entity: Entity): EntityRange {
        this.map.showRange(type, entity);
        this.entity_manager.showRange();
        return this.map.entity_range;
    }
    hideRange() {
        this.entity_manager.hideRange();
    }
    attackEntity(entity: Entity, target: Entity) {
        this.entity_manager.attackEntity(entity, target);
    }
    raiseEntity(wizard: Entity, dead: Entity) {
        this.entity_manager.raiseEntity(wizard, dead);
    }
    deselectEntity(changed: boolean) {
        if (!this.selected_entity) { return; }

        this.cursor_target = this.selected_entity.position.copy();
        this.hideRange();

        this.entity_manager.deselectEntity(this.selected_entity);
        this.selected_entity = null;

        // if something changed
        if (changed) {
            this.map.resetWisp(this.turn);
            this.entity_manager.showWisped();
            this.frame_def_info.updateContent(this.cursor_target, this.map);
        }
    }


    // -------------------------
    // ---- PRIVATE GENERAL ----
    // -------------------------

    private startTurn(alliance: Alliance) {

        this.turn = alliance;

        let player = this.players[<number> alliance - 1];
        player.start();
        this.cursor_target = player.getCursorPosition();

        let wp = this.cursor_target.getWorldPosition();
        this.cursor.setWorldPosition(wp);

        this.frame_gold_info.updateContent(alliance, this.getGoldForAlliance(alliance));

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

        this.camera_still = diff_x == 0 && diff_y == 0;
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
}
