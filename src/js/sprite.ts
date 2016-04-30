class Sprite {

    name: string;
    frames: number[];

    sprite: Phaser.Sprite;
    worldPosition: IPos;

    constructor(world_position: IPos, group: Phaser.Group, name: string, frames: number[] = []) {

        this.worldPosition = world_position;

        this.name = name;
        this.frames = frames;

        this.sprite = group.game.add.sprite(this.worldPosition.x, this.worldPosition.y, this.name);
        this.sprite.frame = this.frames[0];
        group.add(this.sprite);

    }
    setFrame(frame: number) {
        this.sprite.frame = this.frames[frame % this.frames.length];
    }
    setWorldPosition(world_position: IPos) {
        this.worldPosition = world_position;
        this.update();
    }
    update(steps: number = 1) {
        this.sprite.x = this.worldPosition.x;
        this.sprite.y = this.worldPosition.y;
    }
    destroy() {
        this.sprite.destroy();
    }
}
