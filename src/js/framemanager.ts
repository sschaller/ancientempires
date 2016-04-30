class FrameManager {
    frames: Frame[];
    group: Phaser.Group;

    constructor(group: Phaser.Group) {
        this.group = group;
        this.frames = [];
    }
    addFrame(width: number, height: number, align: Direction, border: Direction, anim_dir?: Direction): Frame {
        let frame = new Frame(width, height, this.group, align, border, anim_dir);
        this.frames.push(frame);
        return frame;
    }
    removeFrame(frame: Frame) {
        for (let i = 0; i < this.frames.length; i++) {
            if (frame == this.frames[i]) {
                frame.destroy();
                this.frames.splice(i);
                break;
            }
        }
    }
    update(steps: number) {
        for (let frame of this.frames) {
            frame.update(steps);
        }
    }
}
