/// <reference path="vendor/phaser.d.ts" />
/// <reference path="mainmenu.ts" />
/// <reference path="gamecontroller.ts" />

class AncientEmpires {

    static TILE_SIZE: number = 24;
    static WATER_INTERVAL_MS: number = 400;
    static ANIM_INT: number = 250;
    static ENTITIES: EntityData[];
    static ENTITY_ALLIANCE_DIFF = 22;

    static LINE_SEGMENT_LENGTH = 10;
    static LINE_SEGMENT_WIDTH = 4;
    static LINE_SEGMENT_SPACING = 2;

    static game: Phaser.Game;
    mainMenu: MainMenu;
    controller: GameController;

    width: number = 360;
    height: number =  360;

    constructor(div_id: string) {
        AncientEmpires.game = new Phaser.Game(this.width, this.height, Phaser.AUTO, div_id, this);
        this.mainMenu = new MainMenu();
        this.controller = new GameController();

        AncientEmpires.game.state.add("MainMenu", this.mainMenu);
        AncientEmpires.game.state.add("Game", this.controller);

        AncientEmpires.game.state.start("MainMenu");

    }


}

window.onload = () => {
    new AncientEmpires("content");
};
