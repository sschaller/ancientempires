/// <reference path="frame.ts" />
/// <reference path="aefont.ts" />

interface MenuDelegate {
    openMenu(context: InputContext): void;
    closeMenu(context: InputContext): void;
}
class MenuGoldInfo extends Frame {

    gold_amount: AEFont;
    head_graphics: Phaser.Graphics;
    head_icon: Phaser.Image;

    constructor(group: Phaser.Group) {
        super();

        this.initialize(64, 40, group, Direction.Up | Direction.Right, Direction.Down | Direction.Left, Direction.Right);
        // draw content
        this.drawContent();
    }
    updateContent(alliance: Alliance, gold: number) {
        // update information inside menu

        let color: number;
        let frame: number;
        let x: number;
        if (alliance == Alliance.Blue) {
            color = 0x0000ff;
            frame = 0;
            x = 0;
        } else {
            color = 0xff0000;
            frame = 1;
            x = 25;
        }

        this.head_graphics.clear();
        this.head_graphics.beginFill(color);
        this.head_graphics.drawRect(0, 17, this.width - 6, 17);
        this.head_graphics.endFill();

        this.head_icon.frame = frame;
        this.head_icon.x = x;

        this.gold_amount.setText(gold.toString());
    }
    private drawContent() {
        // initialize content (sprites, text etc)

        this.head_graphics = this.group.game.add.graphics(0, 0, this.content_group);

        this.group.game.add.image(2, 2, "gold", null, this.content_group);
        this.head_icon = this.group.game.add.image(0, 16, "portrait", 0, this.content_group);
        let head_crop = new Phaser.Rectangle(0, 10, this.head_icon.width, 18);
        this.head_icon.crop(head_crop);

        this.gold_amount = new AEFont(28, 5, this.content_group, AEFontStyle.Bold);

    }
}

class MenuDefInfo extends Frame {
    private tile_icon: Phaser.Image;
    private def_amount: AEFont;
    private entity_icon: Phaser.Image;
    private status_icons: Phaser.Image[];

    constructor(group: Phaser.Group) {
        super();

        this.initialize(40, 52, group, Direction.Down | Direction.Right, Direction.Up | Direction.Left, Direction.Right);
        // draw content
        this.drawContent();
    }
    updateContent(position: Pos, map: Map) {
        // update information inside menu

        let tile = map.getTileAt(position);
        let entity = map.getEntityAt(position);

        if (tile == Tile.House || tile == Tile.Castle) {
            let alliance = map.getAllianceAt(position);
            if (this.tile_icon.key != "buildings_" + (<number> alliance)) {
                this.tile_icon.loadTexture("buildings_" + (<number> alliance));
            }
            this.tile_icon.frame = tile == Tile.House ? 0 : 1;
        } else {
            if (this.tile_icon.key != "tiles0") {
                this.tile_icon.loadTexture("tiles0");
            }
            this.tile_icon.frame = TileManager.getBaseImageIndexForTile(tile);
        }

        this.def_amount.setText(Map.getDefForTile(tile, entity ? entity.type : undefined).toString());

        if (!!entity && !entity.isDead()) {
            this.updateSize(68, 52);
            if (this.entity_icon.key != "unit_icons_" + entity.alliance) {
                this.entity_icon.loadTexture("unit_icons_" + entity.alliance);
            }
            this.entity_icon.frame = entity.type;
            this.entity_icon.visible = true;
        } else {
            this.updateSize(40, 52);
            this.entity_icon.visible = false;
        }
        this.setStatusIcons(entity);
    }
    private drawContent() {
        // initialize content (sprites, text etc)

        let tile_graphics = this.group.game.add.graphics(0, 0, this.content_group);
        tile_graphics.lineStyle(1, 0x000000);
        tile_graphics.drawRect(6, 2, AncientEmpires.TILE_SIZE - 1, AncientEmpires.TILE_SIZE - 1);

        this.tile_icon = this.group.game.add.image(7, 3, "tiles0", null, this.content_group);
        let tile_crop = new Phaser.Rectangle(1, 1, AncientEmpires.TILE_SIZE - 2, AncientEmpires.TILE_SIZE - 2);
        this.tile_icon.crop(tile_crop);

        let def_font = new AEFont(7, 28, this.content_group, AEFontStyle.Bold);
        def_font.setText("DEF");

        this.def_amount = new AEFont(14, 37, this.content_group, AEFontStyle.Bold);

        this.entity_icon = this.group.game.add.image(35, 2, "unit_icons_1", null, this.content_group);
        this.entity_icon.visible = false;

        this.status_icons = [
            this.group.game.add.image(31, 22, "status", 2, this.content_group),
            this.group.game.add.image(39, 22, "status", 2, this.content_group),
            this.group.game.add.image(47, 22, "status", 2, this.content_group),
            this.group.game.add.image(31, 32, "status", 0, this.content_group),
            this.group.game.add.image(46, 32, "status", 1, this.content_group)
        ];
        this.setStatusIcons(null);
    }
    private setStatusIcons(entity: Entity) {
        this.status_icons[0].visible = (entity && entity.rank > 0) ? true : false;
        this.status_icons[1].visible = (entity && entity.rank > 1) ? true : false;
        this.status_icons[2].visible = (entity && entity.rank > 2) ? true : false;

        this.status_icons[3].visible = (entity && entity.status != EntityStatus.None) ? true : false;
        this.status_icons[3].frame = (entity && (entity.status & EntityStatus.Poisoned) != 0) ? 0 : 1;

        this.status_icons[4].visible = (entity && entity.status == (EntityStatus.Wisped | EntityStatus.Poisoned)) ? true : false;
    }
}
enum Action {
    None,
    MAIN_MENU,
    MOVE,
    ATTACK,
    BUY,
    END_MOVE,
    CANCEL,
    END_TURN,
    OCCUPY,
    RAISE,
    MAP,
    OBJECTIVE,
    NEW_GAME,
    SELECT_LEVEL,
    SAVE_GAME,
    LOAD_GAME,
    SKIRMISH,
    SETTINGS,
    INSTRUCTIONS,
    ABOUT,
    EXIT
}
class MenuOptions extends Frame {

    selected: number;

    private options: Action[];
    private fonts: Phaser.BitmapText[];
    private pointer: Phaser.Image;
    private pointer_state: number;
    private pointer_slow: number;

    private menu_delegate: MenuDelegate;

    static getMainMenuOptions(ingame: boolean): Action[] {
        let options: Action[];
        if (ingame) {
            options = [Action.SAVE_GAME, Action.LOAD_GAME, Action.INSTRUCTIONS, Action.ABOUT, Action.EXIT];
        } else {
            options = [Action.NEW_GAME, Action.LOAD_GAME, Action.SKIRMISH, Action.INSTRUCTIONS, Action.ABOUT, Action.EXIT];
        }
        return options;
    }
    static getOffMenuOptions(): Action[] {
        return [Action.END_TURN, Action.MAP, Action.OBJECTIVE, Action.MAIN_MENU];
    }
    static getOptionString(option: Action): string {
        if (option == Action.None) { return ""; }
        if (option >= 12) {
            return AncientEmpires.LANG[(<number> option - 12 + 1)];
        }
        return AncientEmpires.LANG[26 + <number> option];
    }
    constructor (group: Phaser.Group, align: Direction, options: Action[], delegate: MenuDelegate, anim_direction?: Direction) {
        super();

        if (!anim_direction) {
            anim_direction = align;
        }

        this.menu_delegate = delegate;

        this.options = options;
        this.selected = 0;

        let max_length = 0;
        for (let option of this.options) {
            let text = MenuOptions.getOptionString(option);
            if (text.length > max_length) {
                max_length = text.length;
            }
        }
        let height = this.options.length * 13 + 16;
        let width = max_length * 7 + 31 + 13;

        this.initialize(width, height, group, align, Direction.All & ~align, anim_direction);

        this.drawContent();
    }
    drawContent() {
        let y = 5;
        this.fonts = [];
        for (let option of this.options) {
            let text = MenuOptions.getOptionString(option);
            let font = this.group.game.add.bitmapText(25, y, "font7", text, 7, this.content_group);
            this.fonts.push(font);
            y += 13;
        }

        this.pointer = this.group.game.add.image(4, 4, "pointer", null, this.content_group);
        this.pointer_state = 2;
        this.pointer_slow = 0;

    }
    hide(animate: boolean = false, destroy_on_finish: boolean = false, update_on_finish: boolean = false) {
        if (!!this.menu_delegate) { this.menu_delegate.closeMenu(InputContext.Options); }
        super.hide(animate, destroy_on_finish, update_on_finish);
    }
    show(animate: boolean = false, offset_y: number = 0) {
        if (!!this.menu_delegate) { this.menu_delegate.openMenu(InputContext.Options); }
        super.show(animate, offset_y);
    }
    next() {
        this.selected++;
        if (this.selected >= this.options.length) {
            this.selected = 0;
        }
    }
    prev() {
        this.selected--;
        if (this.selected < 0) {
            this.selected = this.options.length - 1;
        }
    }
    getSelected(): Action {
        return this.options[this.selected];
    }
    update(steps: number) {
        super.update(steps);

        this.pointer_slow++;
        if (this.pointer_slow > 10) {
            this.pointer_slow = 0;
            this.pointer_state = 2 - this.pointer_state;
        }

        this.pointer.y = 4 + this.selected * 13;
        this.pointer.x = 4 + this.pointer_state;
    }
}

class MenuSelect extends Frame {

    selected: number;

    private options: string[];
    private fonts: Phaser.BitmapText[];
    private pointer: Phaser.Image;
    private pointer_state: number;
    private pointer_slow: number;

    private menu_delegate: MenuDelegate;

    constructor (options: string[], group: Phaser.Group, delegate: MenuDelegate, align: Direction, anim_direction?: Direction) {
        super();

        this.menu_delegate = delegate;

        this.options = options;
        this.selected = 0;

        let max_length = 0;
        for (let text of this.options) {
            if (text.length > max_length) {
                max_length = text.length;
            }
        }
        let height = this.options.length * 13 + 16;
        let width = max_length * 7 + 31 + 13;

        this.initialize(width, height, group, align, Direction.All & ~align, anim_direction);

        this.drawContent();
    }
    drawContent() {
        let y = 5;
        this.fonts = [];
        for (let text of this.options) {
            let font = this.group.game.add.bitmapText(25, y, "font7", text, 7, this.content_group);
            this.fonts.push(font);
            y += 13;
        }

        this.pointer = this.group.game.add.image(4, 4, "pointer", null, this.content_group);
        this.pointer_state = 2;
        this.pointer_slow = 0;

    }
    hide(animate: boolean = false, destroy_on_finish: boolean = false, update_on_finish: boolean = false) {
        if (!!this.menu_delegate) { this.menu_delegate.closeMenu(InputContext.Options); }
        super.hide(animate, destroy_on_finish, update_on_finish);
    }
    show(animate: boolean = false, offset_y: number = 0) {
        if (!!this.menu_delegate) { this.menu_delegate.openMenu(InputContext.Options); }
        super.show(animate, offset_y);
    }
    next() {
        this.selected++;
        if (this.selected >= this.options.length) {
            this.selected = 0;
        }
    }
    prev() {
        this.selected--;
        if (this.selected < 0) {
            this.selected = this.options.length - 1;
        }
    }
    getSelected(): string {
        return this.options[this.selected];
    }
    update(steps: number) {
        super.update(steps);

        this.pointer_slow++;
        if (this.pointer_slow > 10) {
            this.pointer_slow = 0;
            this.pointer_state = 2 - this.pointer_state;
        }

        this.pointer.y = 4 + this.selected * 13;
        this.pointer.x = 4 + this.pointer_state;
    }
}

class Notification extends Frame {
    private font: Phaser.BitmapText;
    private menu_delegate: MenuDelegate;

    constructor (group: Phaser.Group, text: string, delegate: MenuDelegate) {
        super();

        this.menu_delegate = delegate;

        this.font = group.game.add.bitmapText(9, 5, "font7", text, 7);
        this.font.updateTransform();
        let width = this.font.textWidth + 30;
        this.initialize(width, 29, group, Direction.None, Direction.All, Direction.None);
        this.content_group.add(this.font);
    }
    show(animate: boolean = false) {
        if (!!this.menu_delegate) { this.menu_delegate.openMenu(InputContext.Wait); }
        super.show(animate);
    }
    protected animationDidEnd(animation: FrameAnimation) {
        if ((animation & FrameAnimation.Show) != 0) {
            setTimeout(() => {
                this.hide(true, true);
            }, 1000);
        }else if ((animation & FrameAnimation.Destroy) != 0) {
            if (!!this.menu_delegate) { this.menu_delegate.closeMenu(InputContext.Wait); }
        }
    }
}

class MenuShopUnits extends Frame {

    selected: number;
    menu_delegate: MenuDelegate;

    private entity_images: Phaser.Image[];
    private masks: Phaser.Image[];
    private pointer: Phaser.Image;
    private pointer_state: number;
    private pointer_slow: number;

    constructor (group: Phaser.Group, delegate: MenuDelegate) {
        super();

        this.selected = 0;
        this.menu_delegate = delegate;

        this.initialize(64, group.game.height - 40, group, Direction.Right | Direction.Down, Direction.Up | Direction.Down | Direction.Left, Direction.Right);
        // draw content
        this.drawContent();
    }
    updateContent(alliance: Alliance, gold: number) {
        let i = 0;
        for (let image of this.entity_images) {
            let cost = AncientEmpires.ENTITIES[i].cost;
            image.loadTexture("unit_icons_" + (<number> alliance), image.frame);
            this.masks[i].visible = cost > gold;
            i++;
        }
    }
    getSelected(): EntityType {
        return <EntityType> this.selected;
    }
    show(animate: boolean = false) {
        if (!!this.menu_delegate) { this.menu_delegate.openMenu(InputContext.Shop); }
        super.show(animate);
    }
    hide(animate: boolean = false, destroy_on_finish: boolean = false, update_on_finish: boolean = false) {
        if (!!this.menu_delegate) { this.menu_delegate.closeMenu(InputContext.Shop); }
        super.hide(animate, destroy_on_finish, update_on_finish);
    }
    update(steps: number) {
        super.update(steps);

        this.pointer_slow++;
        if (this.pointer_slow > 10) {
            this.pointer_slow = 0;
            this.pointer_state = 2 - this.pointer_state;
        }

        this.pointer.y = 5 + Math.floor(this.selected / 2) * 29;
        this.pointer.x = -9 + (this.selected % 2) * 28 + this.pointer_state;
    }
    prev(vertical: boolean) {
        if (vertical) {
            this.selected -= 2;
        }else {
            this.selected --;
        }
        if (this.selected < 0) {
            this.selected += this.entity_images.length;
        }
    }
    next(vertical: boolean) {
        if (vertical) {
            this.selected += 2;
        }else {
            this.selected ++;
        }
        if (this.selected >= this.entity_images.length) {
            this.selected -= this.entity_images.length;
        }
    }
    private drawContent() {

        this.entity_images = [];
        this.masks = [];

        for (let i = 0; i < AncientEmpires.ENTITIES.length; i++) {

            let data = AncientEmpires.ENTITIES[i];

            if (data.cost > 1000) { continue; }

            let x = (i % 2) * 27 + 3;
            let y = Math.floor(i / 2) * 29 + 5;

            let image = this.group.game.add.image(x, y, "unit_icons_1", i, this.content_group);
            this.entity_images.push(image);
            let mask = this.group.game.add.image(x, y, "mask", 0, this.content_group);
            this.masks.push(mask);
        }
        this.pointer = this.group.game.add.image(4, 4, "pointer", null, this.content_group);
        this.pointer_state = 2;
        this.pointer_slow = 0;
    }
}

class MenuShopInfo extends Frame {

    private unit_icon: Phaser.Image;
    private unit_name: Phaser.BitmapText;
    private unit_cost: AEFont;
    private unit_atk: AEFont;
    private unit_def: AEFont;
    private unit_mov: AEFont;
    private unit_text: Phaser.BitmapText;

    constructor(group: Phaser.Group, alliance: Alliance) {
        super();

        this.initialize(group.game.width - 64, group.game.height, group, Direction.Left, Direction.Up | Direction.Right | Direction.Down, Direction.Left);
        this.drawContent(alliance);
    }
    updateContent(type: EntityType) {
        let data: EntityData = AncientEmpires.ENTITIES[(<number> type)];
        this.unit_icon.frame = <number> type;
        this.unit_name.setText(data.name.toUpperCase());
        this.unit_cost.setText(data.cost.toString());
        this.unit_atk.setText(data.atk.toString());
        this.unit_def.setText(data.def.toString());
        this.unit_mov.setText(data.mov.toString());
        this.unit_text.setText(AncientEmpires.LANG[75 + (<number> type)]);
    }
    private drawContent(alliance: Alliance) {
        this.unit_icon = this.group.game.add.image(2, 2, "unit_icons_" + (alliance == Alliance.Blue ? 1 : 2), 0, this.content_group);

        this.unit_name = this.group.game.add.bitmapText(29, 4, "font7", "", 7, this.content_group);
        this.group.game.add.image(28, 13, "gold", 0, this.content_group);
        this.unit_cost = new AEFont(54, 16, this.content_group, AEFontStyle.Bold, "");

        new AEFont(2, 33, this.content_group, AEFontStyle.Bold, "ATK");
        this.unit_atk = new AEFont(95, 33, this.content_group, AEFontStyle.Bold, "");
        new AEFont(2, 43, this.content_group, AEFontStyle.Bold, "DEF");
        this.unit_def = new AEFont(95, 43, this.content_group, AEFontStyle.Bold, "");
        new AEFont(2, 53, this.content_group, AEFontStyle.Bold, "MOV");
        this.unit_mov = new AEFont(95, 53, this.content_group, AEFontStyle.Bold, "");

        this.unit_text = this.group.game.add.bitmapText(6, 69, "font7", "", 7, this.content_group);
        this.unit_text.maxWidth = this.group.game.width - 64 - 18;
    }
}
