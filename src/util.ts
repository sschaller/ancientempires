interface IPos {
    x: number;
    y: number;
}
class Pos implements IPos {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    match(p: IPos) {
        return (!!p && this.x == p.x && this.y == p.y);
    }
    copy(direction: Direction = Direction.None): Pos {
        switch (direction) {
            case Direction.Up:
                return new Pos(this.x, this.y - 1);
            case Direction.Right:
                return new Pos(this.x + 1, this.y);
            case Direction.Down:
                return new Pos(this.x, this.y + 1);
            case Direction.Left:
                return new Pos(this.x - 1, this.y);
        }
        return new Pos(this.x, this.y);
    }
    move(direction: Direction): Pos {
        switch (direction) {
            case Direction.Up:
                this.y--;
                break;
            case Direction.Right:
                this.x++;
                break;
            case Direction.Down:
                this.y++;
                break;
            case Direction.Left:
                this.x--;
                break;
        }
        return this;
    }
    distanceTo (p: Pos): number {
        return Math.abs(p.x - this.x) + Math.abs(p.y - this.y);
    }
    getDirectionTo (p: Pos): Direction {
        if (p.x > this.x) { return Direction.Right; }
        if (p.x < this.x) { return Direction.Left; }
        if (p.y > this.y) { return Direction.Down; }
        if (p.y < this.y) { return Direction.Up; }
        return Direction.None;
    }
    getWorldPosition() {
        return new Pos(this.x * AncientEmpires.TILE_SIZE, this.y * AncientEmpires.TILE_SIZE);
    }
    getI(): IPos {
        return {x: this.x, y: this.y};
    }
}
enum Direction {
    None = 0,
    Up = 1,
    Right = 2,
    Down = 4,
    Left = 8,
    All = 15
}
