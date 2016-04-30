class Smoke extends Sprite {
    position: Pos;
    constructor(position: Pos, group: Phaser.Group, name: string, frames: number[]) {
        super(new Pos(position.x * AncientEmpires.TILE_SIZE + 16, position.y * AncientEmpires.TILE_SIZE), group, name, frames);
        this.position = position;
    }
}
