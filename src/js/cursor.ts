enum Direction {
    None = 0,
    Up = 1,
    Right = 2,
    Down = 4,
    Left = 8
}
interface LinePart {
    position: Pos;
    direction: Direction;
    length: number;
}
class Cursor extends Sprite {

    static cursorGroup: Phaser.Group;
    static interactionGroup: Phaser.Group;
    static lineOffset: number = 0;

    graphics: Phaser.Graphics;
    moveCursor: Sprite;

    clickCallback: Function;
    clickContext: any;
    lastPos: Pos;

    way: Waypoint[] = null;
    line: LinePart[] = null;

    wayTimer: number = 0;

    constructor(clickCallback: Function, clickContext?: any) {
        super(new Pos(0, 0), Cursor.cursorGroup, {names: ["cursor/0", "cursor/1"], ids: []});

        this.clickCallback = clickCallback;
        this.clickContext = clickContext || this;

        this.graphics = Sprite.game.add.graphics(0, 0, Cursor.interactionGroup);
        Sprite.game.input.onDown.add(this.onDown, this);
    }
    update(steps: number) {

        let pos = this.getActivePos();
        if (!pos.match(this.lastPos)) {
            this.lastPos = pos;
            this.worldPosition = pos.getWorldPosition();
            if (!!this.way) {
                if (this.updateLine(pos)) {
                    if (!this.moveCursor) {
                        this.moveCursor = new Sprite(this.worldPosition, Cursor.cursorGroup, {names: ["cursor/4"], ids: []});
                    } else {
                        this.moveCursor.worldPosition = this.worldPosition;
                    }
                    this.moveCursor.update(steps);
                }
            }
            super.update(steps);
        }

        if (!!this.line) {

            this.wayTimer += steps;
            if (this.wayTimer <= 5) { return; }
            this.wayTimer = 0;

            this.graphics.clear();
            this.graphics.beginFill(0xffffff);

            let offset = Cursor.lineOffset;
            for (let part of this.line){
                this.addSegmentsForLinePart(part, offset);
                offset = (offset + part.length * AncientEmpires.TILE_SIZE) % (AncientEmpires.LINE_SEGMENT_LENGTH + AncientEmpires.LINE_SEGMENT_SPACING);
            }
            this.graphics.endFill();
            Cursor.lineOffset -= 1;
            if (Cursor.lineOffset < 0) {
                Cursor.lineOffset = AncientEmpires.LINE_SEGMENT_LENGTH + AncientEmpires.LINE_SEGMENT_SPACING - 1;
            }
        }
    }
    addSegmentsForLinePart(part: LinePart, offset: number) {
        let distance = part.length * AncientEmpires.TILE_SIZE;
        let x = (part.position.x + 0.5) * AncientEmpires.TILE_SIZE;
        let y = (part.position.y + 0.5) * AncientEmpires.TILE_SIZE;

        while (distance > 0) {
            let length = AncientEmpires.LINE_SEGMENT_LENGTH;
            if (offset > 0) {
                length -= offset;
                offset = 0;
            }
            if (distance < length) { length = distance; }


            switch (part.direction) {
                case Direction.Up:
                    if (length > 0) { this.graphics.drawRect(x - AncientEmpires.LINE_SEGMENT_WIDTH / 2, y - length, AncientEmpires.LINE_SEGMENT_WIDTH, length); }
                    y -= length + AncientEmpires.LINE_SEGMENT_SPACING;
                    break;
                case Direction.Right:
                    if (length > 0) { this.graphics.drawRect(x, y - AncientEmpires.LINE_SEGMENT_WIDTH / 2, length, AncientEmpires.LINE_SEGMENT_WIDTH); }
                    x += length + AncientEmpires.LINE_SEGMENT_SPACING;
                    break;
                case Direction.Down:
                    if (length > 0) { this.graphics.drawRect(x - AncientEmpires.LINE_SEGMENT_WIDTH / 2, y, AncientEmpires.LINE_SEGMENT_WIDTH, length); }
                    y += length + AncientEmpires.LINE_SEGMENT_SPACING;
                    break;
                case Direction.Left:
                    if (length > 0) { this.graphics.drawRect(x - length, y - AncientEmpires.LINE_SEGMENT_WIDTH / 2, length, AncientEmpires.LINE_SEGMENT_WIDTH); }
                    x -= length + AncientEmpires.LINE_SEGMENT_SPACING;
                    break;
            }

            distance -= length + AncientEmpires.LINE_SEGMENT_SPACING;
        }
    }
    getActivePos(): Pos {
        // pos always inside canvas
        let x = Math.floor(Sprite.game.input.activePointer.x / AncientEmpires.TILE_SIZE);
        let y = Math.floor(Sprite.game.input.activePointer.y / AncientEmpires.TILE_SIZE);
        return new Pos(x, y);
    }
    onDown() {
        // differentiate on what we clicked
        let pos = this.getActivePos();
        this.clickCallback.call(this.clickContext, pos);
    }
    showWay(waypoints: Waypoint[]) {
        this.way = waypoints;
        this.updateLine(this.getActivePos());
    }
    hideWay() {
        this.way = null;
        this.line = null;
        if (!!this.moveCursor) {
            this.moveCursor.destroy();
        }
        this.moveCursor = null;
        this.graphics.clear();
    }
    updateLine(end: Pos): boolean {
        let waypoint = Pathfinder.findPositionInList(end, this.way);
        if (!waypoint) { return false; }// end is not in range
        this.line = Pathfinder.getLineToWaypoint(waypoint);
        return true;
    }

}
