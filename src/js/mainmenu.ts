/// <reference path="vendor/phaser.d.ts" />
/// <reference path="ancientempires.ts" />
class MainMenu extends Phaser.State {

    constructor () {
        super();
    }

    preload () {
        this.game.load.spritesheet("tileset", "img/map.png", AncientEmpires.TILE_SIZE, AncientEmpires.TILE_SIZE);
        this.game.load.atlasJSONHash("sprites", "img/test.png", "img/test.json");
        this.game.load.json("entities", "data/entities.json");
    }

    create () {
        AncientEmpires.ENTITIES = this.game.cache.getJSON("entities");

        Frame.game = this.game;

        this.loadMap("skirmish_island_cross");
    }

    loadMap (name: string) {
        this.game.state.start("Game", false, false, name);
    }

    loadComplete (file: string) {
        return;
    }

    update() {
        return;
    }
}
