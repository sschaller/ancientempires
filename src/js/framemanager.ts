class FrameManager {
    frames: Frame[];

    constructor() {
        this.frames = [];
    }
    addFrame(frame: Frame) {
        this.frames.push(frame);
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
