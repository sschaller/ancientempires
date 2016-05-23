/// <reference path="vendor/phaser.d.ts" />
/// <reference path="util.ts" />
/// <reference path="loader.ts" />
/// <reference path="pngloader.ts" />
/// <reference path="mainmenu.ts" />
/// <reference path="gamecontroller.ts" />
/// <reference path="map.ts" />
/// <reference path="tilemanager.ts" />
/// <reference path="entitymanager.ts" />
/// <reference path="entityrange.ts" />
/// <reference path="smokemanager.ts" />
/// <reference path="sprite.ts" />
/// <reference path="smoke.ts" />
/// <reference path="entity.ts" />
/// <reference path="frame.ts" />
/// <reference path="aefont.ts" />
class AncientEmpires {

    static TILE_SIZE: number = 24;
    static MINI_SIZE: number = 10;
    static ENTITIES: EntityData[];

    static LINE_SEGMENT_LENGTH = 10;
    static LINE_SEGMENT_WIDTH = 4;
    static LINE_SEGMENT_SPACING = 2;
    static DEATH_COUNT = 3;

    static NUMBER_OF_TILES: number = 23;
    static TILES_PROP: Tile[];
    static LANG: string[];

    static game: Phaser.Game;
    loader: Loader;
    mainMenu: MainMenu;
    controller: GameController;

    width: number = 176;
    height: number =  204;

    constructor(div_id: string) {
        AncientEmpires.game = new Phaser.Game(this.width, this.height, Phaser.AUTO, div_id, this);
        this.loader = new Loader();
        this.mainMenu = new MainMenu();
        this.controller = new GameController();

        AncientEmpires.game.state.add("Loader", this.loader);
        AncientEmpires.game.state.add("MainMenu", this.mainMenu);
        AncientEmpires.game.state.add("Game", this.controller);

        AncientEmpires.game.state.start("Loader");

    }


}
