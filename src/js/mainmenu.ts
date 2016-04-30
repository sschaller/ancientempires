/// <reference path="vendor/phaser.d.ts" />
/// <reference path="ancientempires.ts" />
class MainMenu extends Phaser.State {

    constructor () {
        super();
    }

    create () {
        this.loadMap("s0");
    }

    loadMap (name: string) {
        this.game.state.start("Game", false, false, name);
    }
}
