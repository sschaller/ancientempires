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
        this.head_graphics.drawRect(0, 17, this.width, 17);
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

        this.gold_amount = new AEFont(28, 5, this.content_group);

    }
}

class MenuDefInfo extends Frame {
    private tile_icon: Phaser.Image;
    private def_amount: AEFont;
    private entity_icon: Phaser.Image;

    constructor(group: Phaser.Group) {
        super();

        this.initialize(40, 52, group, Direction.Down | Direction.Right, Direction.Up | Direction.Left, Direction.Right);
        // draw content
        this.drawContent();
    }
    updateContent(position: Pos, map: Map, entity: Entity) {
        // update information inside menu

        let tile = map.getTileAt(position);
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

        this.def_amount.setText(Map.getDefForTile(tile, entity).toString());

        if (!!entity) {
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

    }
    private drawContent() {
        // initialize content (sprites, text etc)

        let tile_graphics = this.group.game.add.graphics(0, 0, this.content_group);
        tile_graphics.lineStyle(1, 0x000000);
        tile_graphics.drawRect(6, 2, AncientEmpires.TILE_SIZE - 1, AncientEmpires.TILE_SIZE - 1);

        this.tile_icon = this.group.game.add.image(7, 3, "tiles0", null, this.content_group);
        let tile_crop = new Phaser.Rectangle(1, 1, AncientEmpires.TILE_SIZE - 2, AncientEmpires.TILE_SIZE - 2);
        this.tile_icon.crop(tile_crop);

        let def_font = new AEFont(7, 28, this.content_group);
        def_font.setText("DEF");

        this.def_amount = new AEFont(14, 37, this.content_group);

        this.entity_icon = this.group.game.add.image(35, 2, "unit_icons_1", null, this.content_group);
        this.entity_icon.visible = false;

    }
}

class MenuShopUnits extends Frame {

    entity_images: Phaser.Image[];

    constructor (group: Phaser.Group) {
        super();

        this.initialize(64, group.game.height - 40, group, Direction.Right | Direction.Down, Direction.Up | Direction.Down | Direction.Left, Direction.Right);
        // draw content
        this.drawContent();
    }
    updateContent(alliance: Alliance) {
        for (let image of this.entity_images) {
            image.loadTexture("unit_icons_" + (<number> alliance), image.frame);
        }
    }
    private drawContent() {

        this.entity_images = [];

        for (let i = 0; i < AncientEmpires.ENTITIES.length; i++) {

            let data = AncientEmpires.ENTITIES[i];

            if (data.cost > 1000) { continue; }

            let x = (i % 2) * 27 + 3;
            let y = Math.floor(i / 2) * 29 + 5;

            let image = this.group.game.add.image(x, y, "unit_icons_0", i, this.content_group);
            this.entity_images.push(image);
        }
    }
}
