class Sprite {

    world_position: IPos;
    sprite: Phaser.Sprite;
    protected name: string;
    protected frames: number[];
    private offset_x: number;
    private offset_y: number;
    private frame: number;

    init(world_position: IPos, group: Phaser.Group, name: string, frames: number[] = []) {
        this.world_position = world_position;

        this.offset_x = 0;
        this.offset_y = 0;

        this.name = name;
        this.frames = frames;

        this.sprite = group.game.add.sprite(this.world_position.x, this.world_position.y, this.name);
        this.sprite.frame = this.frames[0];
        group.add(this.sprite);
    }
    setFrames(frames: number[], frame: number = 0) {
        this.frames = frames;
        this.frame = frame;
        this.sprite.frame = this.frames[this.frame % this.frames.length];
    }
    setOffset(x: number, y: number) {
        this.offset_x = x;
        this.offset_y = y;
        this.update();
    }
    setFrame(frame: number) {
        if (frame == this.frame) { return; }
        this.frame = frame;
        this.sprite.frame = this.frames[this.frame % this.frames.length];
    }
    setWorldPosition(world_position: IPos) {
        this.world_position = world_position;
        this.update();
    }
    update(steps: number = 1) {
        this.sprite.x = this.world_position.x + this.offset_x;
        this.sprite.y = this.world_position.y + this.offset_y;
    }
    hide() {
        this.sprite.visible = false;
    }
    show() {
        this.sprite.visible = true;
    }
    destroy() {
        this.sprite.destroy();
    }
}
