class Pos {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    match(p: Pos) {
        return (!!p && this.x == p.x && this.y == p.y);
    }
    copy(direction: Direction): Pos {
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
    getInfo() {
        return "{x: " + this.x + ", y: " + this.y + "}";
    }
}
