interface FrameRect {
    x: number;
    y: number;
    width: number;
    height: number;
    [key: string]: number;
}
enum FrameAnimation {
    None = 0,
    Show = 1,
    Hide = 2,
    Change = 4,
    Wire = 8
}
class Frame {
    static game: Phaser.Game;
    static BORDER_SIZE: number = 24;
    static ANIM_STEPS: number = 15;
    static all: Frame[];
    static fid: number = 0;

    contentGroup: Phaser.Group;
    borderGroup: Phaser.Group;
    graphics: Phaser.Graphics;

    reuse_tiles: Phaser.Image[];

    align: Direction;
    animation_direction: Direction;
    border: Direction;

    animation: FrameAnimation;

    width: number;
    height: number;

    current: FrameRect;
    target: FrameRect;
    speed: FrameRect;
    acc: FrameRect;

    fid: number = 0;

    static getTileNameForDirection(dir: Direction): string {
        // suffix of the tile name is already the int value of dir
        return "menu/" + dir;
    }

    static add(width: number, height: number, align: Direction, border: Direction, anim_dir?: Direction) {
        let frame = new Frame(width, height, align, border, anim_dir);
        frame.fid = Frame.fid;
        Frame.fid++;
        Frame.all.push(frame);
        return frame;
    }
    static destroy(frame: Frame): boolean {
        frame.destroy();
        for (let i = 0; i < Frame.all.length; i++) {
            if (Frame.all[i].fid === frame.fid) {
                Frame.all.splice(i, 1);
                return true;
            }
        }
        return false;
    }
    static update(steps: number) {
        for (let frame of Frame.all) {
            frame.update(steps);
        }
    }
    static getRect(x: number, y: number, width: number, height: number): FrameRect {
        return {x: x, y: y, width: width, height: height};
    }
    static copyRect(fr: FrameRect): FrameRect {
        return {x: fr.x, y: fr.y, width: fr.width, height: fr.height};
    }

    constructor(width: number, height: number, align: Direction, border: Direction, anim_dir?: Direction) {

        this.reuse_tiles = [];

        this.align = align;
        this.animation_direction = !!anim_dir ? anim_dir : align;
        this.border = border;

        this.contentGroup = Frame.game.add.group();
        this.contentGroup.visible = false;

        this.borderGroup = Frame.game.add.group();
        this.borderGroup.visible = false;

        this.graphics = Frame.game.add.graphics(0, 0, this.borderGroup);

        this.animation = FrameAnimation.None;
        this.width = width;
        this.height = height;

    }

    getContentGroup() {
        return this.contentGroup;
    }

    show(animate: boolean = false) {

        this.target = Frame.getRect(0, 0, this.width, this.height);

        // calculate the offset using the alignment
        if ((this.align & Direction.Left) != 0) {
            this.target.x = 0;
        } else if ((this.align & Direction.Right) != 0) {
            this.target.x = Frame.game.width - this.target.width;
        } else {
            this.target.x = Math.floor((Frame.game.width - this.target.width) / 2);
        }
        if ((this.align & Direction.Up) != 0) {
            this.target.y = 0;
        } else if ((this.align & Direction.Down) != 0) {
            this.target.y = Frame.game.height - this.target.height;
        } else {
            this.target.y = Math.floor((Frame.game.height - this.target.height) / 2);
        }

        this.current = Frame.copyRect(this.target);
        if (animate) {
            // calculate starting offset using the anim_direction
            this.animation = FrameAnimation.Show;
            if ((this.animation_direction & Direction.Left) != 0) {
                this.current.x = -this.current.width;
            }
            if ((this.animation_direction & Direction.Right) != 0) {
                this.current.x = Frame.game.width;
            }
            if ((this.animation_direction & Direction.Up) != 0) {
                this.current.y = -this.current.height;
            }
            if ((this.animation_direction & Direction.Down) != 0) {
                this.current.y = Frame.game.height;
            }
            if (this.animation_direction == Direction.None) {
                this.animation |= FrameAnimation.Wire;
                this.current.x = Math.floor(Frame.game.width / 2);
                this.current.y = Math.floor(Frame.game.height / 2);
                this.current.width = 0;
                this.current.height = 0;
            }
            this.calculateSpeed();
        }

        this.updateOffset();
        if ((this.animation & FrameAnimation.Wire) == 0) {
            this.updateFrame(this.target.width, this.target.height);
            this.contentGroup.visible = true;
        }

        Frame.game.world.bringToTop(this.contentGroup);
        Frame.game.world.bringToTop(this.borderGroup);
        this.borderGroup.visible = true;

    }
    hide(animate: boolean = false) {
        if (!animate) {
            this.borderGroup.visible = false;
            this.contentGroup.visible = false;
            this.removeTiles();
            return;
        }
        // calculate the target position using the animation direction
        this.animation = FrameAnimation.Hide;
        this.target = Frame.copyRect(this.current);
        if ((this.animation_direction & Direction.Left) != 0) {
            this.target.x = -this.target.width;
        }
        if ((this.animation_direction & Direction.Right) != 0) {
            this.target.x = Frame.game.width;
        }
        if ((this.animation_direction & Direction.Up) != 0) {
            this.target.y = -this.target.height;
        }
        if ((this.animation_direction & Direction.Down) != 0) {
            this.target.y = Frame.game.height;
        }
        if (this.animation_direction == Direction.None) {
            this.animation |= FrameAnimation.Wire;
            this.removeTiles();

            this.target.x = Math.floor(Frame.game.width / 2);
            this.target.y = Math.floor(Frame.game.height / 2);
            this.target.width = 0;
            this.target.height = 0;
        }
        this.calculateSpeed();
    }
    updateSize(width: number, height: number, animate: boolean = false) {
        // fuck
        // adjust offset if alignment is top or left, so no difference at first notice

        this.width = width;
        this.height = height;

        if (animate) {
            this.animation = FrameAnimation.Change;
            if (this.animation_direction == Direction.None) {
                this.animation |= FrameAnimation.Wire;
            } else {
                // take the biggest rect possible
                width = Math.max(width, this.current.width);
                height = Math.max(height, this.current.height);
            }
        }

        // calculate the offset using the alignment
        if ((this.align & Direction.Left) != 0) {
            this.current.x -= width - this.current.width;
            this.target.x -= width - this.width;
        } else if ((this.align & Direction.Right) != 0) {
            this.target.x = Frame.game.width - this.width;
        } else {
            this.target.x = Math.floor((Frame.game.width - this.width) / 2);
        }
        if ((this.align & Direction.Up) != 0) {
            this.current.y -= height - this.current.height;
            this.target.y -= height - this.height;
        } else if ((this.align & Direction.Down) != 0) {
            this.target.y = Frame.game.height - this.height;
        } else {
            this.target.y = Math.floor((Frame.game.height - this.height) / 2);
        }

        if ((this.animation & FrameAnimation.Wire) == 0) {
            this.current.width = width;
            this.current.height = height;
        }
        this.target.width = width;
        this.target.height = height;

        console.log(width + " - " + height);
        console.log(this.current);
        console.log(this.target);

        if (animate) {
            this.calculateSpeed();
        } else {
            this.current.x = this.target.x;
            this.current.y = this.target.y;
        }

        this.updateOffset();
        if ((this.animation & FrameAnimation.Wire) == 0) {
            this.updateFrame(width, height);
        } else {
            this.removeTiles();
        }

    }
    update(steps: number) {

        if (this.animation == FrameAnimation.None) {
            return;
        }

        let finished_x = this.addGain("x", steps);
        let finished_y = this.addGain("y", steps);

        console.log((finished_x ? 1 : 0) + " - " + (finished_y ? 1 : 0));

        let finished_width = true;
        let finished_height = true;
        if ((this.animation & FrameAnimation.Wire) != 0) {
            // only change size with the wire animation
            finished_width = this.addGain("width", steps);
            finished_height = this.addGain("height", steps);
        }

        if (finished_x && finished_y && finished_width && finished_height) {
            console.log("finished");
            if ((this.animation & FrameAnimation.Wire) != 0) {
                this.graphics.clear();
                if ((this.animation & FrameAnimation.Hide) == 0) {
                    this.updateFrame(this.target.width, this.target.height);
                    this.contentGroup.visible = true;
                }
            }
            if ((this.animation & FrameAnimation.Change) != 0) {
                // TODO: remove tiles out of sight
                this.current.width = this.width;
                this.current.height = this.height;
                if ((this.align & Direction.Left) != 0) {
                    this.current.x = 0;
                }
                if ((this.align & Direction.Up) != 0) {
                    this.current.y = 0;
                }
                this.target = Frame.copyRect(this.current);
                this.updateOffset();
                this.updateFrame(this.width, this.height);
            }
            if ((this.animation & FrameAnimation.Hide) != 0) {
                this.hide();
            }
            this.animation = FrameAnimation.None;
        }
        if ((this.animation & FrameAnimation.Wire) != 0) {
            // nice animation for frame with no alignment & no animation direction
            this.graphics.clear();
            this.graphics.lineStyle(1, 0xffffff);
            this.graphics.drawRect(0, 0, this.current.width, this.current.height);
        }
        this.updateOffset();
    }
    destroy() {
        this.contentGroup.destroy(true);
        this.borderGroup.destroy(true);
    }
    private updateOffset() {
        let x = this.current.x;
        let y = this.current.y;

        let c_x = 0;
        let c_y = 0;
        if ((this.border & Direction.Left) != 0) {
            c_x += 6;
        }
        if ((this.border & Direction.Up) != 0) {
            c_y += 6;
        }

        this.borderGroup.x = x;
        this.borderGroup.y = y;
        this.contentGroup.x = c_x;
        this.contentGroup.y = c_y;
    }
    private updateFrame(width: number, height: number) {

        let c_width = width;
        let c_height = height;
        if ((this.border & Direction.Left) != 0) {
            c_width -= 6;
        }
        if ((this.border & Direction.Right) != 0) {
            c_width -= 6;
        }
        if ((this.border & Direction.Up) != 0) {
            c_height -= 6;
        }
        if ((this.border & Direction.Down) != 0) {
            c_height -= 6;
        }
        this.contentGroup.width = c_width;
        this.contentGroup.height = c_height;

        let show_tiles_x = Math.ceil(width / Frame.BORDER_SIZE) - 2;
        let show_tiles_y = Math.ceil(height / Frame.BORDER_SIZE) - 2;

        this.graphics.clear();
        this.graphics.lineStyle(0);
        this.graphics.beginFill(0xcebea5);
        this.graphics.drawRect(0, 0, width, height);
        this.graphics.endFill();

        let tiles: Phaser.Image[] = [];

        let offset_x = Frame.BORDER_SIZE;
        for (let i = 0; i < show_tiles_x; i++) {
            if (this.border & Direction.Up) {
                tiles.push(this.drawBorderTile(offset_x, 0, Direction.Up));
            }
            if (this.border & Direction.Down) {
                tiles.push(this.drawBorderTile(offset_x, height - Frame.BORDER_SIZE, Direction.Down));
            }
            offset_x += Frame.BORDER_SIZE;
        }

        let offset_y = Frame.BORDER_SIZE;
        for (let j = 0; j < show_tiles_y; j++) {
            if (this.border & Direction.Left) {
                tiles.push(this.drawBorderTile(0, offset_y, Direction.Left));
            }
            if (this.border & Direction.Right) {
                tiles.push(this.drawBorderTile(width - Frame.BORDER_SIZE, offset_y, Direction.Right));
            }
            offset_y += Frame.BORDER_SIZE;
        }

        if ((this.border & (Direction.Up | Direction.Left)) != 0) {
            tiles.push(this.drawBorderTile(0, 0, this.border & (Direction.Up | Direction.Left)));
        }
        if ((this.border & (Direction.Up | Direction.Right)) != 0) {
            tiles.push(this.drawBorderTile(width - Frame.BORDER_SIZE, 0, this.border & (Direction.Up | Direction.Right)));
        }
        if ((this.border & (Direction.Down | Direction.Left)) != 0) {
            tiles.push(this.drawBorderTile(0, height - Frame.BORDER_SIZE, this.border & (Direction.Down | Direction.Left)));
        }
        if ((this.border & (Direction.Down | Direction.Right)) != 0) {
            tiles.push(this.drawBorderTile(width - Frame.BORDER_SIZE, height - Frame.BORDER_SIZE, this.border & (Direction.Down | Direction.Right)));
        }

        this.removeTiles();
        this.reuse_tiles = tiles;
    }
    private drawBorderTile(x: number, y: number, direction: Direction) {
        let reuse: Phaser.Image;

        if (this.reuse_tiles.length > 0) {
            reuse = this.reuse_tiles.shift();
            reuse.bringToTop();
            reuse.x = x;
            reuse.y = y;
        } else {
            reuse = Frame.game.add.image(x, y, "sprites", null, this.borderGroup);
        }
        reuse.tint = 0xffffff * Math.random();
        reuse.frameName = Frame.getTileNameForDirection(direction);
        return reuse;
    }
    private addGain(var_name: string, steps: number) {
        if (this.speed[var_name] == 0) { return true; }

        this.acc[var_name] += this.speed[var_name] * steps;

        let d = Math.floor(this.acc[var_name]);
        this.current[var_name] += d;
        this.acc[var_name] -= d;
        if (d < 0 && this.current[var_name] < this.target[var_name]) {
            this.current[var_name] = this.target[var_name];
            return true;
        }else if (d > 0 && this.current[var_name] > this.target[var_name]) {
            this.current[var_name] = this.target[var_name];
            return true;
        }
        return false;
    }
    private calculateSpeed() {
        this.speed = Frame.getRect((this.target.x - this.current.x) / Frame.ANIM_STEPS, (this.target.y - this.current.y) / Frame.ANIM_STEPS, (this.target.width - this.current.width) / Frame.ANIM_STEPS, (this.target.height - this.current.height) / Frame.ANIM_STEPS);
        this.acc = Frame.getRect(0, 0, 0, 0);
    }
    private removeTiles() {
        while (this.reuse_tiles.length > 0) {
            let tile = this.reuse_tiles.shift();
            tile.destroy();
        }
    }
}
