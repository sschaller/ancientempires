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
    static BORDER_SIZE: number = 24;
    static ANIM_STEPS: number = 15;

    group: Phaser.Group;
    border_group: Phaser.Group;
    content_group: Phaser.Group;
    graphics: Phaser.Graphics;

    reuse_tiles: Phaser.Image[];

    align: Direction;
    animation_direction: Direction;
    border: Direction;

    animation: FrameAnimation;

    game_width: number;
    game_height: number;

    width: number;
    height: number;

    current: FrameRect;
    target: FrameRect;
    speed: FrameRect;
    acc: FrameRect;

    static getRect(x: number, y: number, width: number, height: number): FrameRect {
        return {x: x, y: y, width: width, height: height};
    }
    static copyRect(fr: FrameRect): FrameRect {
        return {x: fr.x, y: fr.y, width: fr.width, height: fr.height};
    }
    private static getTileForDirection(direction: Direction): number {
        switch (direction) {
            case Direction.Up:
                return 4;
            case Direction.Up | Direction.Right:
                return 1;
            case Direction.Right:
                return 7;
            case Direction.Right | Direction.Down:
                return 3;
            case Direction.Down:
                return 5;
            case Direction.Down | Direction.Left:
                return 2;
            case Direction.Left:
                return 6;
        }
        return 0;
    }

    constructor(width: number, height: number, group: Phaser.Group, align: Direction, border: Direction, anim_dir?: Direction) {

        this.align = align;
        this.animation_direction = typeof anim_dir != "undefined" ? anim_dir : align;
        this.border = border;


        this.group = group;

        this.border_group = this.group.game.add.group();
        this.group.add(this.border_group);
        this.border_group.visible = false;
        this.graphics = this.group.game.add.graphics(0, 0, this.border_group);

        this.content_group = this.group.game.add.group();
        this.group.add(this.content_group);
        this.content_group.visible = false;


        this.width = width;
        this.height = height;
        this.game_width = this.group.game.width;
        this.game_height = this.group.game.height;

        this.reuse_tiles = [];

        this.animation = FrameAnimation.None;
        this.current = this.getRetractedRect();

    }

    getContentGroup() {
        return this.content_group;
    }

    show(animate: boolean = false) {
        this.animation = FrameAnimation.None;
        this.target = this.getAlignmentRect();

        if (animate) {
            // calculate starting offset using the anim_direction
            this.animation = FrameAnimation.Show;
            if (this.animation_direction == Direction.None) {
                this.animation |= FrameAnimation.Wire;
            }
            this.calculateSpeed();
        } else {
            this.current = Frame.copyRect(this.target);
        }

        this.updateOffset();
        this.border_group.visible = true;
        if ((this.animation & FrameAnimation.Wire) != 0) {
            this.removeFrame();
            this.content_group.visible = false;
        } else {
            this.drawFrame(this.width, this.height);
            this.content_group.visible = true;
        }
    }
    hide(animate: boolean = false) {
        this.animation = FrameAnimation.None;
        this.target = this.getRetractedRect();

        if (!animate) {
            this.current = Frame.copyRect(this.target);
            this.border_group.visible = false;
            this.content_group.visible = false;
            this.removeTiles();
            this.updateOffset();
            return;
        }

        this.animation = FrameAnimation.Hide;
        if (this.animation_direction == Direction.None) {
            this.animation |= FrameAnimation.Wire;
            this.removeFrame();
        }
        this.calculateSpeed();
    }

    updateSize(width: number, height: number, animate: boolean = false) {
        this.animation = FrameAnimation.None;
        if (!animate) {
            this.width = width;
            this.height = height;
            this.target = this.getAlignmentRect();
            this.current = Frame.copyRect(this.target);
            this.updateOffset();
            this.drawFrame(width, height);
            return;
        }

        let old_width = this.width;
        let old_height = this.height;
        this.width = width;
        this.height = height;

        this.animation = FrameAnimation.Change;
        if (this.animation_direction == Direction.None) {
            this.animation |= FrameAnimation.Wire;
        } else {
            // take the biggest rect possible
            width = Math.max(width, old_width);
            height = Math.max(height, old_height);

            this.current.width = width;
            this.current.height = height;
        }

        this.target = this.getAlignmentRect();

        // this.current is the old rect (offset & size)
        // update this.current so the same portion of the frame is rendered, although it changed in size
        // change target to alignment position for changed rect
        if ((this.align & Direction.Left) != 0) {
            this.current.x -= width - old_width;
            this.target.x -= width - this.width;
        }
        if ((this.align & Direction.Up) != 0) {
            this.current.y -= height - old_height;
            this.target.y -= height - this.height;
        }

        this.updateOffset();
        if ((this.animation & FrameAnimation.Wire) != 0) {
            this.removeFrame();
        } else {
            this.drawFrame(width, height);
        }
        this.calculateSpeed();
    }
    update(steps: number) {

        if (this.animation == FrameAnimation.None) { return; }

        let finished_x = this.addGain("x", steps);
        let finished_y = this.addGain("y", steps);

        let finished_width = true;
        let finished_height = true;
        if ((this.animation & FrameAnimation.Wire) != 0) {
            // only change size with the wire animation
            finished_width = this.addGain("width", steps);
            finished_height = this.addGain("height", steps);
        }

        if (finished_x && finished_y && finished_width && finished_height) {
            if ((this.animation & FrameAnimation.Wire) != 0) {
                this.graphics.clear();
                if ((this.animation & FrameAnimation.Hide) == 0) {
                    this.drawFrame(this.width, this.height);
                    this.content_group.visible = true;
                }
            }
            if ((this.animation & FrameAnimation.Change) != 0) {
                // update current offset and remove tiles out of sight
                this.target.width = this.width;
                this.target.height = this.height;
                if ((this.align & Direction.Left) != 0) {
                    this.target.x = 0;
                }
                if ((this.align & Direction.Up) != 0) {
                    this.target.y = 0;
                }
                this.current = Frame.copyRect(this.target);
                this.updateOffset();
                this.drawFrame(this.width, this.height);
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
        this.border_group.destroy(true);
        this.content_group.destroy(true);
    }

    private getAlignmentRect(): FrameRect {
        // calculate the offset using the alignment
        let rect = Frame.getRect(0, 0, this.width, this.height);
        if ((this.align & Direction.Left) != 0) {
            rect.x = 0;
        } else if ((this.align & Direction.Right) != 0) {
            rect.x = this.game_width - this.width;
        } else {
            rect.x = Math.floor((this.game_width - this.width) / 2);
        }
        if ((this.align & Direction.Up) != 0) {
            rect.y = 0;
        } else if ((this.align & Direction.Down) != 0) {
            rect.y = this.game_height - this.height;
        } else {
            rect.y = Math.floor((this.game_height - this.height) / 2);
        }
        return rect;
    }

    private getRetractedRect(): FrameRect {
        if (this.animation_direction == Direction.None) {
            return Frame.getRect(Math.floor(this.game_width / 2), Math.floor(this.game_height / 2), 0, 0);
        }

        let rect = this.getAlignmentRect();
        if ((this.animation_direction & Direction.Left) != 0) {
            rect.x = -this.width;
        }
        if ((this.animation_direction & Direction.Right) != 0) {
            rect.x = this.game_width;
        }
        if ((this.animation_direction & Direction.Up) != 0) {
            rect.y = -this.height;
        }
        if ((this.animation_direction & Direction.Down) != 0) {
            rect.y = this.game_height;
        }
        return rect;
    }
    private updateOffset() {
        let x = this.current.x;
        let y = this.current.y;

        let c_x = 0;
        let c_y = 0;
        if ((this.border & Direction.Left) != 0) {
            c_x = 6;
        }
        if ((this.border & Direction.Up) != 0) {
            c_y = 6;
        }

        this.group.x = x;
        this.group.y = y;
        this.content_group.x = c_x;
        this.content_group.y = c_y;
    }
    private drawFrame(width: number, height: number) {

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
        this.content_group.width = c_width;
        this.content_group.height = c_height;

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
    private removeFrame() {
        this.graphics.clear();
        this.removeTiles();
    }
    private drawBorderTile(x: number, y: number, direction: Direction) {
        let reuse: Phaser.Image;

        if (this.reuse_tiles.length > 0) {
            reuse = this.reuse_tiles.shift();
            reuse.bringToTop();
            reuse.x = x;
            reuse.y = y;
        } else {
            reuse = this.group.game.add.image(x, y, "menu", null, this.border_group);
        }
        reuse.frame = Frame.getTileForDirection(direction);
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
