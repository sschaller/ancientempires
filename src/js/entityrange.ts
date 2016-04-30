interface IWaypoint {
    position: Pos;
    cost: number;
    form: number;
    parent: IWaypoint;
}
interface IOutline {
    start: Pos;
    course: Direction[];
}
class EntityRange {

    static graphics_layer: Phaser.Graphics;

    waypoints: IWaypoint[];
    map: Map;
    entity_manager: EntityManager;

    dirty: boolean;

    offset: number;
    progress: number;
    endposition: Pos;
    line: LinePart[];

    static findPositionInList(position: Pos, waypoints: IWaypoint[]) {
        for (let waypoint of waypoints){
            if (waypoint.position.match(position)) { return waypoint; }
        }
        return null;
    }
    static getLineToWaypoint(waypoint: IWaypoint): LinePart[] {
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

    constructor(entity: Entity, map: Map, entity_manager: EntityManager) {

        this.map = map;
        this.entity_manager = entity_manager;

        // cost for origin point is always 1
        let open: IWaypoint[] = [{position: entity.position, cost: 1, form: 0, parent: null}];
        let closed: IWaypoint[] = [];
        while (open.length > 0) {
            let current = open.shift();
            closed.push(current);

            let adjacent_positions = this.map.getAdjacentPositionsAt(current.position);
            for (let position of adjacent_positions) {
                this.checkPosition(position, current, open, closed, entity);
            }
        }
        this.waypoints = closed;
        this.addForm();

        this.dirty = true;
    }
    checkPosition(position: Pos, parent: IWaypoint, open: IWaypoint[], closed: IWaypoint[], entity: Entity): boolean {
        if (!!EntityRange.findPositionInList(position, closed)) { return false; }
        let occupied = this.entity_manager.getEntityAt(position);
        if (!!occupied && occupied.alliance != entity.alliance) { return false; }

        let new_cost = parent.cost + this.map.getCostAt(position, entity);
        if (new_cost > entity.data.mov) { return false; }

        let in_open = EntityRange.findPositionInList(position, open);
        if (!!in_open) {
            if (in_open.cost <= new_cost) { return false; }
            in_open.cost = new_cost;
            in_open.parent = parent;
            return true;
        }
        open.push({position: position, parent: parent, form: 0, cost: new_cost});
        return true;
    }
    addForm() {
        for (let waypoint of this.waypoints) {
            waypoint.form = 0;
            if (waypoint.position.y > 0 && !this.getWaypointAt(waypoint.position.copy(Direction.Up))) { waypoint.form += 1; }
            if (waypoint.position.x < this.map.width - 1 && !this.getWaypointAt(waypoint.position.copy(Direction.Right))) { waypoint.form += 2; }
            if (waypoint.position.y < this.map.height - 1 && !this.getWaypointAt(waypoint.position.copy(Direction.Down))) { waypoint.form += 4; }
            if (waypoint.position.x > 0 && !this.getWaypointAt(waypoint.position.copy(Direction.Left))) { waypoint.form += 8; }
        }
    }
    getWaypointAt(position: Pos) {
        return EntityRange.findPositionInList(position, this.waypoints);
    }
    hasWaypointAt(position: Pos): boolean {
        return this.getWaypointAt(position) != null;
    }

    update(steps: number, cursor_position: Pos) {
        this.offset += steps;
        this.progress += steps;

        if (this.hasWaypointAt(cursor_position) && (!this.endposition || !this.endposition.match(cursor_position))) {
            // cursor position changed and cursor is inside waypoints
            this.endposition = cursor_position;
            let endpoint = this.getWaypointAt(cursor_position);
            this.line = EntityRange.getLineToWaypoint(endpoint);
        }

        if (this.dirty) {
            // draw layer for the first time
            this.dirty = false;
            console.log("Draw Layer");
            EntityRange.graphics_layer.clear();

        }

    }
}
