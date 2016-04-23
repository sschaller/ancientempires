interface SpriteFrames {
    names: string[];
    ids: number[];
}
class Sprite {

    static game: Phaser.Game;

    frames: SpriteFrames;
    currentFrame: number;

    sprite: Phaser.Sprite;
    worldPosition: Pos;

    constructor(position: Pos, group: Phaser.Group, frames: SpriteFrames) {

        this.worldPosition = position;
        this.frames = frames;

        this.currentFrame = 0;
        this.loadSprite();

        group.add(this.sprite);

    }
    loadSprite() {
        this.sprite = Sprite.game.add.sprite(this.worldPosition.x, this.worldPosition.y, "sprites");
        this.sprite.frameName = this.frames.names[0];
    }

    nextFrame() {
        if (this.frames.names.length > 1) {
            this.currentFrame++;
            if (this.currentFrame >= this.frames.names.length) {
                this.currentFrame = 0;
            }
            this.sprite.frameName = this.frames.names[this.currentFrame];
            return;
        }
        if (this.frames.ids.length > 1) {
            this.currentFrame++;
            if (this.currentFrame >= this.frames.ids.length) {
                this.currentFrame = 0;
            }
            this.sprite.frame = this.frames.ids[this.currentFrame];
        }
    }
    update(steps: number = 1) {
        this.sprite.x = this.worldPosition.x;
        this.sprite.y = this.worldPosition.y;
    }
    destroy() {
        this.sprite.destroy();
    }
}
