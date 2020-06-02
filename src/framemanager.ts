/// <reference path="frame.ts" />

class FrameManager implements FrameDelegate {
    frames: Frame[];
    group: Phaser.Group;

    constructor(group: Phaser.Group) {
        this.group = group;
        this.frames = [];
    }
    addFrame(frame: Frame) {
        frame.delegate = this;
        this.frames.push(frame);
    }
    removeFrame(frame: Frame) {
        for (let i = 0; i < this.frames.length; i++) {
            if (frame == this.frames[i]) {
                this.frames.splice(i, 1);
                break;
            }
        }
    }
    update(steps: number) {
        for (let frame of this.frames) {
            frame.update(steps);
        }
    }
    frameWillDestroy(frame: Frame) {
        this.removeFrame(frame);
    }
}
