/// <reference path="interaction.ts" />
/// <reference path="minimap.ts" />
class Player extends Interaction {

    private context: InputContext[];
    private keys: Input;

    private options_menu: MenuOptions;
    private shop_units: MenuShopUnits;
    private shop_info: MenuShopInfo;
    private mini_map: MiniMap;

    private last_entity_position: Pos;

    private fullscreen_group: Phaser.Group;
    private instruction_nr: number;

    constructor(alliance: Alliance, map: Map, delegate: InteractionDelegate, keys: Input) {
        super(alliance, map, delegate);
        this.keys = keys;
        this.context = [InputContext.Map];
    }

    isPlayer(): boolean {
        return true;
    }

    start() {
        this.keys.all_keys = Key.None;
    }

    run() {
        this.keys.update();
        if (this.keys.all_keys == Key.None) { return; }

        switch (this.context[this.context.length - 1]) {
            case InputContext.Map:
                let cursor_still = this.delegate.cursor.world_position.x % 24 == 0 && this.delegate.cursor.world_position.y % 24 == 0;
                if (this.keys.isKeyPressed(Key.Up) && cursor_still && this.delegate.cursor_target.y > 0) {
                    this.delegate.cursor_target.move(Direction.Up);
                } else if (this.keys.isKeyPressed(Key.Right) && cursor_still && this.delegate.cursor_target.x < this.map.width - 1) {
                    this.delegate.cursor_target.move(Direction.Right);
                } else if (this.keys.isKeyPressed(Key.Down) && cursor_still && this.delegate.cursor_target.y < this.map.height - 1) {
                    this.delegate.cursor_target.move(Direction.Down);
                } else if (this.keys.isKeyPressed(Key.Left) && cursor_still && this.delegate.cursor_target.x > 0) {
                    this.delegate.cursor_target.move(Direction.Left);
                } else if (this.keys.isKeyPressed(Key.Enter)) {
                    this.keys.clearKeyPressed(Key.Enter);
                    this.pickPosition(this.delegate.cursor_target);
                } else if (this.keys.isKeyPressed(Key.Esc)) {
                    this.keys.clearKeyPressed(Key.Esc);
                    let entity = this.selected_entity;
                    this.deselectEntity(false);
                    if (!!entity && entity.position.match(this.map.getKingPosition(this.alliance)) && entity.data.cost <= 1000) {
                        // entity was bought, add gold back and remove entity
                        let gold = this.delegate.getGoldForAlliance(this.alliance);
                        this.delegate.setGoldForAlliance(this.alliance, gold + entity.data.cost);
                        this.map.removeEntity(entity);
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

                    let selected = this.options_menu.getSelected();

                    this.context.pop();
                    this.options_menu.hide(true, true);
                    this.options_menu = null;

                    this.selectOption(selected);
                } else if (this.keys.isKeyPressed(Key.Esc)) {
                    this.keys.clearKeyPressed(Key.Esc);

                    this.context.pop();
                    this.options_menu.hide(true, true);
                    this.options_menu = null;
                    this.selectOption(Action.CANCEL);
                }
                break;
            case InputContext.Selection:
                if (this.keys.isKeyPressed(Key.Up) && this.delegate.cursor_target.y > 0) {
                    this.keys.clearKeyPressed(Key.Up);
                    let entity = this.map.nextTargetInRange(Direction.Up);
                    this.delegate.cursor_target = entity.position.copy();
                } else if (this.keys.isKeyPressed(Key.Right) && this.delegate.cursor_target.x < this.map.width - 1) {
                    this.keys.clearKeyPressed(Key.Right);
                    let entity = this.map.nextTargetInRange(Direction.Right);
                    this.delegate.cursor_target = entity.position.copy();
                } else if (this.keys.isKeyPressed(Key.Down) && this.delegate.cursor_target.y < this.map.height - 1) {
                    this.keys.clearKeyPressed(Key.Down);
                    let entity = this.map.nextTargetInRange(Direction.Down);
                    this.delegate.cursor_target = entity.position.copy();
                } else if (this.keys.isKeyPressed(Key.Left) && this.delegate.cursor_target.x > 0) {
                    this.keys.clearKeyPressed(Key.Left);
                    let entity = this.map.nextTargetInRange(Direction.Left);
                    this.delegate.cursor_target = entity.position.copy();
                } else if (this.keys.isKeyPressed(Key.Enter)) {
                    this.keys.clearKeyPressed(Key.Enter);

                    this.delegate.cursor.show();
                    this.context.pop();
                    let entity = this.map.nextTargetInRange(Direction.None);
                    this.pickEntity(entity);
                } else if (this.keys.isKeyPressed(Key.Esc)) {
                    this.keys.clearKeyPressed(Key.Esc);

                    this.delegate.cursor_target = this.selected_entity.position.copy();
                    this.delegate.cursor.show();
                    this.context.pop();

                    let entity = this.selected_entity;
                    this.delegate.deselectEntity(false);
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
                    let entity = this.delegate.buyEntity(this.selected_entity, entity_type);
                    if (!!entity) {
                        this.deselectEntity(false);
                        this.closeShop();
                        this.selectEntity(entity);
                    }
                } else if (this.keys.isKeyPressed(Key.Esc)) {
                    this.keys.clearKeyPressed(Key.Esc);
                    this.deselectEntity(false);
                    this.closeShop();
                }
                break;
            case InputContext.Ack:
                if (this.keys.isKeyPressed(Key.Enter)) {
                    this.keys.clearKeyPressed(Key.Enter);
                    if (!!this.fullscreen_group) {
                        this.fullscreen_group.destroy(true);
                        this.fullscreen_group = null;
                        this.context.pop();
                    } else {
                        this.closeMap();
                    }
                } else if (this.keys.isKeyPressed(Key.Esc)) {
                    this.keys.clearKeyPressed(Key.Esc);
                    if (!!this.fullscreen_group) {
                        this.fullscreen_group.destroy(true);
                        this.fullscreen_group = null;
                        this.context.pop();
                    } else {
                        this.closeMap();
                    }
                }
                break;
            case InputContext.Instructions:
                if (this.keys.isKeyPressed(Key.Enter)) {
                    this.keys.clearKeyPressed(Key.Enter);
                    if (!this.fullscreen_group) { break; }
                    let next = this.instruction_nr + 1;
                    if (next <= 17) {
                        this.instruction_nr = next;
                        MainMenu.showInstructions(this.fullscreen_group, next);
                    }
                } else if (this.keys.isKeyPressed(Key.Right)) {
                    this.keys.clearKeyPressed(Key.Right);
                    if (!this.fullscreen_group) { break; }
                    let next = this.instruction_nr + 1;
                    if (next <= 17) {
                        this.instruction_nr = next;
                        MainMenu.showInstructions(this.fullscreen_group, next);
                    }
                } else if (this.keys.isKeyPressed(Key.Left)) {
                    this.keys.clearKeyPressed(Key.Left);
                    if (!this.fullscreen_group) { break; }
                    let prev = this.instruction_nr - 1;
                    if (prev >= 0) {
                        this.instruction_nr = prev;
                        MainMenu.showInstructions(this.fullscreen_group, prev);
                    }
                } else if (this.keys.isKeyPressed(Key.Esc)) {
                    this.keys.clearKeyPressed(Key.Esc);
                    if (!this.fullscreen_group) { break; }
                    this.fullscreen_group.destroy(true);
                    this.fullscreen_group = null;
                    this.context.pop();
                }
                break;
        }
    }

    openMenu(context: InputContext) {
        if (context == InputContext.Wait) {
            this.context.push(context);
        } else if (context == InputContext.Shop) {
            this.delegate.hideInfo(false);
        } else {
            this.delegate.hideInfo(true);
        }
    }
    closeMenu(context: InputContext) {
        if (context == InputContext.Wait && context == this.context[this.context.length - 1]) {
            this.context.pop();
        }
        let active_context = this.context[this.context.length - 1];
        switch (active_context) {
            case InputContext.Map:
            case InputContext.Selection:
                this.delegate.showInfo(true);
                break;
            case InputContext.Shop:
                this.delegate.showInfo(false);
                break;
        }
    }

    entityDidMove(entity: Entity) {
        let options = this.map.getEntityOptions(entity, true);
        if (options.length < 1) { return; }
        this.showOptionMenu(options);
    }

    entityDidAnimation(entity: Entity) {
        this.context.pop();
        this.selected_entity.updateState(EntityState.Moved, true);
        this.deselectEntity(true);
    }

    private selectEntity(entity: Entity): boolean {
        let options = this.map.getEntityOptions(entity, false);

        // no options mean: not in alliance or already moved
        if (options.length < 1) {
            return false;
        }

        // so method can be used to show options for entity again -> must be same entity as selected
        if (!this.selected_entity) {
            this.selected_entity = entity;
            this.delegate.selectEntity(entity);
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

    private deselectEntity(changed: boolean) {
        this.delegate.deselectEntity(changed);
        this.last_entity_position = null;
        this.selected_entity = null;
    }

    private showOptionMenu(options: Action[]) {

        this.options_menu = new MenuOptions(this.delegate.frame_manager.group, Direction.Right, options, this);
        this.delegate.frame_manager.addFrame(this.options_menu);
        this.options_menu.show(true);
        this.context.push(InputContext.Options);
    }

    private showMainMenu(actions: Action[]) {

        this.options_menu = new MenuOptions(this.delegate.frame_manager.group, Direction.None, actions, this, Direction.Up);
        this.delegate.frame_manager.addFrame(this.options_menu);
        this.options_menu.show(true);
        this.context.push(InputContext.Options);
    }

    private selectOption(option: Action) {
        switch (option) {
            case Action.OCCUPY:
                this.delegate.occupy(this.selected_entity.position, this.selected_entity.alliance);
                this.selected_entity.updateState(EntityState.Moved, true);
                this.deselectEntity(true);
                break;
            case Action.ATTACK:
                this.context.push(InputContext.Selection);

                this.delegate.showRange(EntityRangeType.Attack, this.selected_entity);
                this.delegate.cursor_target = this.map.nextTargetInRange(Direction.None).position.copy();
                this.delegate.cursor.hide();
                break;
            case Action.RAISE:
                this.context.push(InputContext.Selection);
                this.delegate.showRange(EntityRangeType.Raise, this.selected_entity);
                this.delegate.cursor_target = this.map.nextTargetInRange(Direction.None).position.copy();
                break;
            case Action.MOVE:
                this.delegate.showRange(EntityRangeType.Move, this.selected_entity);
                break;
            case Action.BUY:
                this.openShop(this.selected_entity.alliance);
                break;
            case Action.END_MOVE:
                this.selected_entity.updateState(EntityState.Moved, true);
                this.deselectEntity(true);
                break;
            case Action.END_TURN:
                this.delegate.nextTurn();
                break;
            case Action.MAIN_MENU:
                this.showMainMenu(MenuOptions.getMainMenuOptions(true));
                break;
            case Action.MAP:
                this.openMap();
                break;
            case Action.SAVE_GAME:
                this.delegate.saveGame();
                break;
            case Action.LOAD_GAME:
                this.delegate.loadGame();
                break;
            case Action.EXIT:
                this.delegate.exitGame();
                break;
            case Action.ABOUT:
                this.context.push(InputContext.Ack);
                this.fullscreen_group = MainMenu.showAbout(this.delegate.game);
                break;
            case Action.INSTRUCTIONS:
                this.context.push(InputContext.Instructions);
                this.fullscreen_group = this.delegate.game.add.group();
                this.fullscreen_group.fixedToCamera = true;

                this.instruction_nr = 0;
                MainMenu.showInstructions(this.fullscreen_group);
                break;
            case Action.CANCEL:
                if (!!this.last_entity_position) {
                    // last action was walking. reset entity & set cursor to current position
                    this.delegate.cursor_target = this.selected_entity.position.copy();

                    this.delegate.moveEntity(this.selected_entity, this.last_entity_position, false);
                    this.last_entity_position = null;

                    this.delegate.showRange(EntityRangeType.Move, this.selected_entity);

                } else {
                    this.deselectEntity(false);
                }
                break;
            default:
                console.log("Action " + MenuOptions.getOptionString(option) + " not yet implemented");
                break;
        }
    }

    private pickEntity(entity: Entity) {

        this.context.push(InputContext.Animation);
        switch (this.map.getTypeOfRange()) {
            case EntityRangeType.Attack:
                this.delegate.attackEntity(this.selected_entity, entity);
                break;
            case EntityRangeType.Raise:
                this.delegate.raiseEntity(this.selected_entity, entity);
                break;
        }
        this.delegate.hideRange();
        this.delegate.cursor.show();
    }

    private pickPosition(position: Pos) {
        if (this.selected_entity) {
            switch (this.map.getTypeOfRange()) {
                case EntityRangeType.Move:
                    this.last_entity_position = this.selected_entity.position.copy();
                    this.delegate.moveEntity(this.selected_entity, position, true);
                    break;
            }
            return;
        }

        let entity = this.map.getEntityAt(position);
        if (!!entity) {
            // no entity selected, clicked on entity - try to select it
            let success = this.selectEntity(entity);
            if (success) { return; }
        }
        this.showOptionMenu(MenuOptions.getOffMenuOptions());
    }

    private openShop(alliance: Alliance) {
        this.context.push(InputContext.Shop);
        if (!this.shop_units) {
            this.shop_units = new MenuShopUnits(this.delegate.frame_manager.group, this);
            this.delegate.frame_manager.addFrame(this.shop_units);
        }
        this.shop_units.updateContent(alliance, this.delegate.getGoldForAlliance(alliance));
        this.shop_units.show(true);

        this.shop_info = new MenuShopInfo(this.delegate.frame_manager.group, alliance);
        this.shop_info.updateContent(EntityType.Soldier);
        this.delegate.frame_manager.addFrame(this.shop_info);
        this.shop_info.show(true);
    }

    private closeShop() {
        this.context.pop();
        this.shop_units.hide(true, true);
        this.shop_units = null;
        this.shop_info.hide(true, true);
        this.shop_info = null;
    }

    private openMap() {
        this.context.push(InputContext.Ack);
        this.mini_map = new MiniMap(this.map, this.delegate.frame_manager.group, this);
        this.delegate.frame_manager.addFrame(this.mini_map);
        this.mini_map.show(true);
    }

    private closeMap() {
        this.context.pop();
        this.mini_map.hide(true, true);
        this.mini_map = null;
    }
}
