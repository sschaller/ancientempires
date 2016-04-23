interface Waypoint {
    position: Pos;
    cost: number;
    form: number;
    parent: Waypoint;
}
class Pathfinder {
    tileManager: TileManager;
    static findPositionInList(position: Pos, waypoints: Waypoint[]) {
        for (let waypoint of waypoints){
            if (waypoint.position.match(position)) { return waypoint; }
        }
        return null;
    }
    static getLineToWaypoint(waypoint: Waypoint): LinePart[] {
        let line: LinePart[] = [];
        while (waypoint.parent != null) {
            let next = waypoint;
            waypoint = waypoint.parent;

            let direction = waypoint.position.getDirectionTo(next.position);
            if (line.length > 0 && line[0].direction == direction) {
                line[0].position = waypoint.position;
                line[0].length++;
                continue;
            }
            line.unshift({position: waypoint.position, direction: direction, length: 1});
        }
        return line;
    }
    static costForTile(tile: Tile, entity: Entity): number {

        if (tile == Tile.Water && entity.type == EntityType.Lizard) {
            // Lizard on water
            return 1;
        }

        let cost = 0;
        if (tile == Tile.Mountain || tile == Tile.Water) {
            cost = 3;
        } else if (tile == Tile.Forest || tile == Tile.Hill) {
            cost = 2;
        } else {
            cost = 1;
        }
        if (entity.type == EntityType.Lizard) {
            // Lizard for everything except water
            return cost * 2;
        }

        return cost;
    }
    static getDefForTile(tile: Tile, entity: Entity): number {
        if (tile == Tile.Mountain || tile == Tile.House || tile == Tile.Castle) { return 3; }
        if (tile == Tile.Forest || tile == Tile.Hill) { return 2; }
        if (tile == Tile.Water && entity.type == EntityType.Lizard) { return 2; }
        if (tile == Tile.Grass) { return 1; }
        return 0;
    }

    constructor(tileManager: TileManager) {
        this.tileManager = tileManager;
    }
    getDefAt(position: Pos, entity: Entity) {
        return Pathfinder.getDefForTile(this.tileManager.getTileAt(position), entity);
    }
    getReachableWaypointsForEntity(entity: Entity): Waypoint[] {
        // cost for origin point is always 1
        let open: Waypoint[] = [{position: entity.position, cost: 1, form: 0, parent: null}];
        let closed: Waypoint[] = [];
        while (open.length > 0) {
            let current = open.shift();
            closed.push(current);

            let adjacent_positions = this.tileManager.getAdjacentPositionsAt(current.position);
            for (let position of adjacent_positions) {
                this.checkPosition(position, current, open, closed, entity);
            }
        }
        this.addForm(closed);
        return closed;
    }
    checkPosition(position: Pos, parent: Waypoint, open: Waypoint[], closed: Waypoint[], entity: Entity): boolean {
        if (!!Pathfinder.findPositionInList(position, closed)) { return false; }
        let occupied = Entity.getEntityAt(position);
        if (!!occupied && occupied.alliance != entity.alliance) { return false; }

        let new_cost = parent.cost + Pathfinder.costForTile(this.tileManager.getTileAt(position), entity);
        if (new_cost > entity.data.mov) { return false; }

        let in_open = Pathfinder.findPositionInList(position, open);
        if (!!in_open) {
            if (in_open.cost <= new_cost) { return false; }
            in_open.cost = new_cost;
            in_open.parent = parent;
            return true;
        }
        open.push({position: position, parent: parent, form: 0, cost: new_cost});
        return true;
    }
    checkAlready(pos: Pos, queue: Pos[]): Waypoint {
        return null;
    }
    addForm(waypoints: Waypoint[]) {
        for (let waypoint of waypoints) {
            waypoint.form = 0;
            if (waypoint.position.y > 0 && !Pathfinder.findPositionInList(waypoint.position.copy(Direction.Up), waypoints)) { waypoint.form += 1; }
            if (waypoint.position.x < this.tileManager.width - 1 && !Pathfinder.findPositionInList(waypoint.position.copy(Direction.Right), waypoints)) { waypoint.form += 2; }
            if (waypoint.position.y < this.tileManager.height - 1 && !Pathfinder.findPositionInList(waypoint.position.copy(Direction.Down), waypoints)) { waypoint.form += 4; }
            if (waypoint.position.x > 0 && !Pathfinder.findPositionInList(waypoint.position.copy(Direction.Left), waypoints)) { waypoint.form += 8; }
        }
    }
}
