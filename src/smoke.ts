/// <reference path="sprite.ts" />

class Smoke extends Sprite {
    position: Pos;
    constructor(position: Pos, group: Phaser.Group, name: string, frames: number[]) {
        super();
        this.position = position;
        super.init(new Pos(position.x * AncientEmpires.TILE_SIZE + 16, position.y * AncientEmpires.TILE_SIZE), group, name, frames);
    }
}
