class MiniMap extends Frame {

    private entities: Phaser.Image[];
    private entity_manager: EntityManager;
    private menu_delegate: MenuDelegate;
    private map: Map;

    private slow: number;
    private units_visible: boolean;

    constructor(map: Map, entity_manager: EntityManager, group: Phaser.Group, menu_delegate: MenuDelegate) {
        super();
        this.map = map;
        this.entity_manager = entity_manager;
        this.menu_delegate = menu_delegate;

        this.slow = 0;
        this.units_visible = true;

        this.initialize(map.width * AncientEmpires.MINI_SIZE + 12, map.height * AncientEmpires.MINI_SIZE + 12, group, Direction.None, Direction.All, Direction.None);
        this.drawContent();
    }
    show(animate: boolean = false) {
        if (!!this.menu_delegate) { this.menu_delegate.openMenu(InputContext.Ack); }
        super.show(animate);
    }
    hide(animate: boolean = false, destroy_on_finish: boolean = false, update_on_finish: boolean = false) {
        if (!!this.menu_delegate) { this.menu_delegate.closeMenu(InputContext.Ack); }
        super.hide(animate, destroy_on_finish, update_on_finish);
    }
    update(steps: number) {
        super.update(steps);

        this.slow += steps;
        if (this.slow >= 30) {
            this.slow -= 30;
            this.units_visible = !this.units_visible;
            for (let image of this.entities) {
                image.visible = this.units_visible;
            }
        }

    }
    private drawContent() {
        for (let x = 0; x < this.map.width; x++) {
            for (let y = 0; y < this.map.height; y++) {
                let index = this.getTileIndexAt(new Pos(x, y));
                this.group.game.add.image(x * AncientEmpires.MINI_SIZE, y * AncientEmpires.MINI_SIZE, "stiles0", index, this.content_group);
            }
        }

        this.entities = [];
        for (let entity of this.entity_manager.entities) {
            let image = this.group.game.add.image(entity.position.x * AncientEmpires.MINI_SIZE, entity.position.y * AncientEmpires.MINI_SIZE, "unit_icons_s_" + (<number> entity.alliance), <number> entity.type, this.content_group);
            this.entities.push(image);
        }
    }
    private getTileIndexAt(position: Pos): number {
        let tile = this.map.getTileAt(position);
        switch (tile) {
            case Tile.Path:
                return 0;
            case Tile.Grass:
                return 1;
            case Tile.Forest:
                return 2;
            case Tile.Hill:
                return 3;
            case Tile.Mountain:
                return 4;
            case Tile.Water:
                return 5;
            case Tile.Bridge:
                return 6;
            case Tile.House:
            case Tile.Castle:
                let alliance = this.map.getAllianceAt(position);
                return (tile == Tile.Castle ? 8 : 7) + (<number> alliance) * 2;
        }
        return 0;
    }
}
