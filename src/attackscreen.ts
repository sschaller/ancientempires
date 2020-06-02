enum ScreenTransition {
    None,
    Hide,
    Show
}
class AttackScreen {
    private transition: ScreenTransition;
    private transition_progress: number;

    private background_graphics: Phaser.Graphics;
    private group: Phaser.Group;
    private content_graphics: Phaser.Graphics;
    private transition_mask: Phaser.Graphics;
    private attacker: Entity;
    private target: Entity;
    private map: Tilemap;

    static drawTransition(progress: number, max_progress: number, graphics: Phaser.Graphics, screen_width: number, screen_height: number) {

        let max_segment_width = Math.floor(screen_width / 4) + 1;
        let max_segment_height = Math.floor(screen_height / 4) + 1;

        let until_all = max_progress - 6;
        for (let x = 0; x < 4; x++) {
            let show = Math.floor(progress - x * 2);
            if (show <= 0) {
                // nothing to draw after this point
                break;
            }
            let width: number;
            let height: number;
            if (show >= until_all) {
                width = max_segment_width;
                height = max_segment_height;
            } else {
                width = Math.floor(show * max_segment_width / until_all);
                height = Math.floor(show * max_segment_height / until_all);
            }
            let margin_x = Math.floor((max_segment_width - width) / 2);
            let margin_y = Math.floor((max_segment_height - height) / 2);
            let offset_x = x * max_segment_width + margin_x;
            for (let y = 0; y < 4; y ++) {
                let offset_y = y * max_segment_height + margin_y;
                graphics.drawRect(offset_x, offset_y, width, height);
            }
        }

    }
    static getBackgroundPrefixForTile(tile: Tile): string {
        switch (tile) {
            case Tile.Forest:
                return "woods";
            case Tile.Hill:
                return "hill";
            case Tile.Mountain:
                return "mountain";
            case Tile.Water:
                return "water";
            case Tile.Bridge:
                return "bridge";
            case Tile.House:
            case Tile.Castle:
                return "town";
        }
        return null;
    }
    static getNameForTile(tile: Tile): string {
        switch (tile) {
            case Tile.Grass:
            case Tile.Hill:
            case Tile.Forest:
                return "grass";
            case Tile.Path:
                return "road";
            case Tile.Mountain:
                return "mountain";
            case Tile.Water:
                return "water";
            case Tile.Bridge:
                return "bridge";
            case Tile.House:
            case Tile.Castle:
                return "town";
        }
        return null;
    }
    constructor(game: Phaser.Game, attacker: Entity, target: Entity, map: Tilemap) {
        this.background_graphics = game.add.graphics(0, 0);
        this.background_graphics.fixedToCamera = true;

        this.group = game.add.group();
        this.group.fixedToCamera = true;
        this.group.visible = false;

        this.content_graphics = this.group.game.add.graphics(0, 0, this.group);

        this.transition_mask = game.add.graphics(0, 0);
        this.transition_mask.clear();
        this.transition_mask.fixedToCamera = true;

        this.group.mask = this.transition_mask;

        this.attacker = attacker;
        this.target = target;
        this.map = map;

        this.transition = ScreenTransition.None;
    }
    show() {
        // start transition
        this.transition_progress = 0;
        this.transition = ScreenTransition.Hide;
    }
    draw() {
        let attacker_tile = this.map.getTileAt(this.attacker.position);
        let target_tile = this.map.getTileAt(this.target.position);
        this.drawBackgroundHalf(attacker_tile, 0);
        this.drawBackgroundHalf(target_tile, 1);
        this.group.bringToTop(this.content_graphics);
        this.content_graphics.beginFill(0x000000);
        this.content_graphics.drawRect(Math.floor(this.group.game.width / 2) - 1, 0, 2, this.group.game.height);
        this.content_graphics.endFill();
    }
    drawBackgroundHalf(tile: Tile, half: number) {
        let half_width = Math.floor(this.group.game.width / 2);
        let half_height = this.group.game.height;
        let offset_x = half * half_width;

        let bg_image = AttackScreen.getBackgroundPrefixForTile(tile);
        let bg_height = 0;
        if (bg_image != null) {
            bg_height = 48;
            let bg_tiles_x = Math.ceil(half_width / (2 * 88));
            for (let i = 0; i < bg_tiles_x; i++) {
                this.group.game.add.sprite(offset_x + i * 88, 0, bg_image + "_bg", 0, this.group);
            }
        }
        let tiles_x = Math.ceil(half_width / 24);
        let tiles_y = Math.ceil((half_height - bg_height) / 24);
        for (let x = 0; x < tiles_x; x++) {
            for (let y = 0; y < tiles_y; y++) {
                let rand = Math.floor(Math.random() * 10);
                let variant = rand >= 9 ? 2 : (rand >= 8 ? 1 : 0);
                this.group.game.add.sprite(offset_x + x * 24, bg_height + y * 24, AttackScreen.getNameForTile(tile), variant, this.group);

            }
        }
    }
    update() {
        if (this.transition == ScreenTransition.None) {
            return;
        }
        if (this.transition == ScreenTransition.Hide) {
            this.background_graphics.clear();
            this.background_graphics.beginFill(0x000000);
            AttackScreen.drawTransition(this.transition_progress, 30, this.background_graphics, this.group.game.width, this.group.game.height);
            this.background_graphics.endFill();
        } else {
            this.transition_mask.clear();
            this.transition_mask.beginFill();
            AttackScreen.drawTransition(this.transition_progress, 30, this.transition_mask, this.group.game.width, this.group.game.height);
            this.transition_mask.endFill();
            if (this.transition_progress == 1) {
                // transition mask must have a drawRect call to be a mask, otherwise everything is shown
                this.group.visible = true;
            }
        }

        if (this.transition_progress >= 30) {
            let transition = this.transition;
            this.transition = ScreenTransition.None;
            this.transitionDidEnd(transition);
            return;
        }
        this.transition_progress++;
    }

    private transitionDidEnd(transition: ScreenTransition) {
        if (transition == ScreenTransition.Show) {
            console.log("Finished");
            return;
        }
        this.draw();

        this.transition_progress = 0;
        this.transition = ScreenTransition.Show;
    }
}
